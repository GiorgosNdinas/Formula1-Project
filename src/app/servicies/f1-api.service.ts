import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { Injectable, effect, signal } from '@angular/core';
import { catchError, finalize, of, timeout } from 'rxjs';

// Import TypeScript interfaces used to type the F1 API responses.
import { F1Seasons } from '../models/f1-season.model';
import { F1Rounds } from '../models/f1-rounds.model';
import { F1RaceResults } from '../models/f1-race-results.model';
import { F1Standings, StandingsLists } from '../models/f1-standings.model';

/**
 * F1ApiService
 *
 * Central service responsible for retrieving Formula 1 data
 * from the Jolpica F1 API (Ergast-compatible API).
 *
 * Provides:
 * - Available Formula 1 seasons
 * - Race schedules for a selected season
 * - Driver championship standings
 * - Race results for a selected round
 * - Loading and error states
 *
 * Angular signals are used to keep components updated
 * automatically whenever the selected season or round changes.
 *
 * The service is registered globally and shared across
 * the application using providedIn: 'root'.
 */
@Injectable({ providedIn: 'root' })
export class F1ApiService {
  // Base URL for all Formula 1 API requests.
  private readonly baseUrl = 'https://api.jolpi.ca/ergast/f1';

  /**
   * Currently selected Formula 1 season.
   *
   * Defaults to the current calendar year.
   * Components can update this signal when the user selects
   * a different season.
   */
  readonly selectedSeason = signal(String(new Date().getFullYear()));

  /**
   * Currently selected race round.
   *
   * Defaults to round 1.
   * Automatically changes when the selected round does not
   * exist in the newly loaded season's race calendar.
   */
  readonly selectedRound = signal('1');

  // Error messages displayed when API requests fail.
  readonly resultsError = signal('');
  readonly winnersError = signal('');
  readonly scheduleError = signal('');

  /**
   * Loading indicators.
   *
   * These properties indicate whether standings or race
   * results are currently being requested.
   *
   * Note: These are regular boolean properties, not signals.
   * Changes to them do not independently trigger Angular
   * signal-based updates.
   */
  winnersAreLoading = false;
  resultsAreLoading = false;

  /**
   * Retrieve the list of available Formula 1 seasons.
   *
   * - Requests up to 200 seasons.
   * - Applies a 15-second timeout.
   * - Returns undefined if the request fails.
   *
   * toSignal() converts the RxJS Observable into an Angular
   * signal that components can read reactively.
   */
  readonly f1Seasons = toSignal(
    this.http.get<F1Seasons>(`${this.baseUrl}/seasons.json?limit=200`).pipe(
      timeout(15000),
      catchError(() => of(undefined))
    )
  );

  /**
   * Reactive state containers for API responses.
   *
   * Initially undefined until the corresponding API
   * requests successfully return data.
   */
  readonly f1Rounds = signal<F1Rounds | undefined>(undefined);

  readonly f1RaceResults = signal<F1RaceResults | undefined>(undefined);

  readonly f1Standings = signal<StandingsLists | undefined>(undefined);

  constructor(private http: HttpClient) {
    /**
     * EFFECT 1: Load season schedule and driver standings.
     *
     * Automatically executes whenever selectedSeason changes.
     *
     * Responsibilities:
     * 1. Reset previous data and error messages.
     * 2. Fetch the race calendar.
     * 3. Validate the selected race round.
     * 4. Fetch the driver's championship standings.
     * 5. Clean up previous HTTP subscriptions.
     */
    effect(
      onCleanup => {
        // Read the selected season.
        // Angular tracks this signal as a dependency.
        const season = this.selectedSeason();

        // Indicate that standings are being loaded.
        this.winnersAreLoading = true;

        // Clear previous error messages.
        this.winnersError.set('');
        this.scheduleError.set('');

        // Remove data from the previously selected season.
        this.f1Standings.set(undefined);
        this.f1Rounds.set(undefined);

        /**
         * Fetch the race schedule for the selected season.
         *
         * Example endpoint:
         * https://api.jolpi.ca/ergast/f1/2026.json
         */
        const schedule = this.http
          .get<F1Rounds>(`${this.baseUrl}/${season}.json`)
          .pipe(timeout(15000))
          .subscribe({
            next: result => {
              // Store the returned race calendar.
              this.f1Rounds.set(result);

              // Extract the list of races safely.
              const rounds = result.MRData?.RaceTable.Races ?? [];

              /**
               * Check whether the currently selected round
               * exists in the new season.
               *
               * If it does not exist, select the first
               * available round or fall back to round 1.
               */
              if (!rounds.some(r => r.round === this.selectedRound())) {
                this.selectedRound.set(rounds[0]?.round ?? '1');
              }
            },

            // Display an error if the schedule request fails.
            error: () =>
              this.scheduleError.set(
                'The race calendar could not be loaded. Try another season or reload the page.'
              )
          });

        /**
         * Fetch driver championship standings.
         *
         * Example endpoint:
         * https://api.jolpi.ca/ergast/f1/2026/driverStandings.json
         *
         * finalize() resets the loading flag when the
         * request completes, fails, or is unsubscribed.
         */
        const standings = this.http
          .get<F1Standings>(`${this.baseUrl}/${season}/driverStandings.json`)
          .pipe(
            timeout(15000),
            finalize(() => (this.winnersAreLoading = false))
          )
          .subscribe({
            next: result => {
              // Store the first standings list returned by the API.
              this.f1Standings.set(
                result.MRData?.StandingsTable.StandingsLists[0]
              );
            },

            // Display an error if standings cannot be retrieved.
            error: () =>
              this.winnersError.set(
                'Driver standings could not be loaded. Try another season or reload the page.'
              )
          });

        /**
         * Cleanup:
         *
         * Unsubscribe from both requests when the selected
         * season changes or the effect is destroyed.
         *
         * Prevents outdated requests from updating the UI.
         */
        onCleanup(() => {
          schedule.unsubscribe();
          standings.unsubscribe();
        });
      },
      { allowSignalWrites: true }
    );

    /**
     * EFFECT 2: Load race results.
     *
     * Automatically executes whenever either:
     * - selectedSeason changes
     * - selectedRound changes
     *
     * This ensures race results correspond to the
     * currently selected season and round.
     */
    effect(
      onCleanup => {
        // Read both signals to establish reactive dependencies.
        const season = this.selectedSeason();
        const round = this.selectedRound();

        // Mark race results as loading.
        this.resultsAreLoading = true;

        // Clear the previous error message.
        this.resultsError.set('');

        // Remove results from the previously selected race.
        this.f1RaceResults.set(undefined);

        /**
         * Fetch race results for the selected round.
         *
         * Example endpoint:
         * https://api.jolpi.ca/ergast/f1/2026/1/results.json
         */
        const results = this.http
          .get<F1RaceResults>(`${this.baseUrl}/${season}/${round}/results.json`)
          .pipe(
            timeout(15000),

            // Reset loading when the request terminates.
            finalize(() => (this.resultsAreLoading = false))
          )
          .subscribe({
            next: result => {
              // Store the complete race results response.
              this.f1RaceResults.set(result);
            },

            // Display an error if race results cannot be loaded.
            error: () =>
              this.resultsError.set(
                'Race results could not be loaded. Try another round or reload the page.'
              )
          });

        /**
         * Cleanup:
         *
         * Cancel the previous results request when the
         * selected season or round changes.
         */
        onCleanup(() => results.unsubscribe());
      },
      { allowSignalWrites: true }
    );
  }
}

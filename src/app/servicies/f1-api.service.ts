import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { Injectable, effect, signal } from '@angular/core';
import { catchError, finalize, of, timeout } from 'rxjs';
import { F1Seasons } from '../models/f1-season.model';
import { F1Rounds } from '../models/f1-rounds.model';
import { F1RaceResults } from '../models/f1-race-results.model';
import { F1Standings, StandingsLists } from '../models/f1-standings.model';

@Injectable({ providedIn: 'root' })
export class F1ApiService {
 private readonly baseUrl = 'https://api.jolpi.ca/ergast/f1';
 readonly selectedSeason = signal(String(new Date().getFullYear()));
 readonly selectedRound = signal('1');
 readonly resultsError = signal('');
 readonly winnersError = signal('');
 readonly scheduleError = signal('');
 winnersAreLoading = false;
 resultsAreLoading = false;
 readonly f1Seasons = toSignal(this.http.get<F1Seasons>(`${this.baseUrl}/seasons.json?limit=200`).pipe(timeout(15000), catchError(() => of(undefined))));
 readonly f1Rounds = signal<F1Rounds | undefined>(undefined);
 readonly f1RaceResults = signal<F1RaceResults | undefined>(undefined);
 readonly f1Standings = signal<StandingsLists | undefined>(undefined);
 constructor(private http: HttpClient) {
  effect(onCleanup => {
   const season = this.selectedSeason();
   this.winnersAreLoading = true;
   this.winnersError.set(''); this.scheduleError.set('');
   this.f1Standings.set(undefined); this.f1Rounds.set(undefined);
   const schedule = this.http.get<F1Rounds>(`${this.baseUrl}/${season}.json`).pipe(timeout(15000)).subscribe({
    next: result => { this.f1Rounds.set(result); const rounds = result.MRData?.RaceTable.Races ?? []; if (!rounds.some(r => r.round === this.selectedRound())) this.selectedRound.set(rounds[0]?.round ?? '1'); },
    error: () => this.scheduleError.set('The race calendar could not be loaded. Try another season or reload the page.')
   });
   const standings = this.http.get<F1Standings>(`${this.baseUrl}/${season}/driverStandings.json`).pipe(timeout(15000), finalize(() => this.winnersAreLoading = false)).subscribe({
    next: result => this.f1Standings.set(result.MRData?.StandingsTable.StandingsLists[0]),
    error: () => this.winnersError.set('Driver standings could not be loaded. Try another season or reload the page.')
   });
   onCleanup(() => { schedule.unsubscribe(); standings.unsubscribe(); });
  }, { allowSignalWrites: true });
  effect(onCleanup => {
   const season = this.selectedSeason(); const round = this.selectedRound();
   this.resultsAreLoading = true; this.resultsError.set(''); this.f1RaceResults.set(undefined);
   const results = this.http.get<F1RaceResults>(`${this.baseUrl}/${season}/${round}/results.json`).pipe(timeout(15000), finalize(() => this.resultsAreLoading = false)).subscribe({
    next: result => this.f1RaceResults.set(result),
    error: () => this.resultsError.set('Race results could not be loaded. Try another round or reload the page.')
   });
   onCleanup(() => results.unsubscribe());
  }, { allowSignalWrites: true });
 }
}

import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { Injectable, Injector, Signal, WritableSignal, computed, effect, signal } from '@angular/core';
import { F1Seasons } from '../models/f1-season.model';
import { F1Rounds, Races } from '../models/f1-rounds.model';
import { F1RaceResults, Results } from '../models/f1-race-results.model';
import { DriverStandings, F1Standings, StandingsLists } from '../models/f1-standings.model';

@Injectable({
  providedIn: 'root'
})
export class F1ApiService {
  // API base URL
  private baseUrl = '/api/f1';
  private currentYear: number = new Date().getFullYear();

  // public selectedSeason = signal<string>(this.currentYear.toString());
  public selectedSeason = signal<string>('2022');
  public selectedRound = signal<string>('1');

  // Flags for when data are loading
  public winnersAreLoading: boolean = false;
  public resultsAreLoading: boolean = false;

  // A signal to get all f1 seasons
  public f1Seasons: Signal<F1Seasons | undefined> = toSignal<F1Seasons>(this.http.get<F1Seasons>(`${this.baseUrl}/seasons.json?limit=200`));
  // A signal to get the F1 rounds for a specific season
  public f1Rounds = signal<F1Rounds | undefined>({});
  // A signal to get the F1 race results for a specific season and round
  public f1RaceResults = signal<F1RaceResults | undefined>({});
  // A signal to get the F1 druvers standings for a specific season
  public f1Standings = signal<StandingsLists | undefined>({});

  constructor(private http: HttpClient) {
    effect(() => {
      this.winnersAreLoading = true;
      this.resultsAreLoading = true;

      this.http.get<F1Rounds>(`${this.baseUrl}/${this.selectedSeason()}.json`).subscribe(result => {
        this.f1Rounds.set(result);
        // Here we check if the selected round is out of the new round scope
        if(result.MRData?.RaceTable.Races)
          if(Number(this.selectedRound()) > result.MRData?.RaceTable.Races.length)
            this.selectedRound.set('1');
      });
      this.http.get<F1RaceResults>(`${this.baseUrl}/${this.selectedSeason()}/${this.selectedRound()}/results.json`).subscribe(result => {
        this.f1RaceResults.set(result);
        this.resultsAreLoading = false
      });
      this.http.get<F1Standings>(`${this.baseUrl}/${this.selectedSeason()}/driverStandings.json`).subscribe(result => {
        this.f1Standings.set(result.MRData?.StandingsTable.StandingsLists[0]);
        this.winnersAreLoading = false;
      });
    }, { allowSignalWrites: true });
  }
}

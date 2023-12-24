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

  public selectedSeason = signal<string>('2023');
  public selectedRound = signal<string>('1');

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
      this.http.get<F1Rounds>(`${this.baseUrl}/${this.selectedSeason()}.json`).subscribe(result => {
        this.f1Rounds.set(result);
      });
      this.http.get<F1RaceResults>(`${this.baseUrl}/${this.selectedSeason()}/${this.selectedRound()}/results.json`).subscribe(result => {
        this.f1RaceResults.set(result);
      });
      this.http.get<F1Standings>(`${this.baseUrl}/${this.selectedSeason()}/driverStandings.json`).subscribe(result => {
        this.f1Standings.set(result.MRData?.StandingsTable.StandingsLists[0]);
      })
    }, { allowSignalWrites: true });
  }
}

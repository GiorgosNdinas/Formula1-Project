import { HttpClient } from '@angular/common/http';
import { toSignal} from '@angular/core/rxjs-interop';
import { Injectable, signal } from '@angular/core';
import { F1Seasons } from '../models/f1-season.model';
import { F1Rounds } from '../models/f1-rounds.model';
import { F1RaceResults } from '../models/f1-race-results.model';
import { F1Standings } from '../models/f1-standings.model';

@Injectable({
  providedIn: 'root'
})
export class F1ApiService {
  // API base URL
  private baseUrl = '/api/f1';

  public selectedSeason = signal<string>('2023');
  public selectedRound = signal<string>('1')

  // A signal to get all f1 seasons
  public f1Seasons = toSignal<F1Seasons>(this.http.get<F1Seasons>(`${this.baseUrl}/seasons.json?limit=200`));
  // A signal to get the F1 rounds for a specific season
  public f1Rounds = toSignal<F1Rounds>(this.http.get<F1Rounds>(`${this.baseUrl}/${this.selectedSeason()}.json`));
  // A signal to get the F1 race results for a specific season and round
  public f1RaceResults = toSignal<F1RaceResults>(this.http.get<F1RaceResults>(`${this.baseUrl}/${this.selectedSeason()}/${this.selectedRound()}/results.json`));
  // A signal to get the F1 druvers standings for a specific season
  public f1Standings = toSignal<F1Standings>(this.http.get<F1Standings>(`${this.baseUrl}/${this.selectedSeason()}/driverStandings.json`))

  constructor(private http: HttpClient) { }

}

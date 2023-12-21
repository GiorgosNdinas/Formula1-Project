import { HttpClient } from '@angular/common/http';
import { toSignal} from '@angular/core/rxjs-interop';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class F1ApiService {
  // API base URL
  private baseUrl = '/api/f1';

  public f1Seasons = toSignal<any>(this.http.get(`${this.baseUrl}/seasons.json?limit=200`));

  constructor(private http: HttpClient) { }

}

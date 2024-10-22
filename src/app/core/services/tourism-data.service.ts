import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TourismPoint } from '../interfaces/tourism.interface';

@Injectable({
  providedIn: 'root',
})
export class TourismDataService {
  private jsonUrl = 'assets/puntos-interes.json';

  constructor(private http: HttpClient) {}

  getTourismData(): Observable<TourismPoint[]> {
    return this.http.get<TourismPoint[]>(this.jsonUrl);
  }
}

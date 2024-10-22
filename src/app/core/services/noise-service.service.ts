import { Injectable } from '@angular/core';
import { NoiseData } from '../interfaces/tourism.interface';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NoiseServiceService {

  constructor(private http: HttpClient) { }

  loadNoiseData(): Observable<NoiseData[]> {
    return this.http.get<NoiseData[]>('/assets/soroll.json');
  }
}

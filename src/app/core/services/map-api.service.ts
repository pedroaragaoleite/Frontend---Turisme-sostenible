import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConcentrationData } from '../models/interface';

@Injectable({
  providedIn: 'root'
})
export class MapApiService {
  private map!: L.Map;

  constructor(private http: HttpClient) { }

  loadConcentrationData(): Observable<ConcentrationData[]> {
    return this.http.get<ConcentrationData[]>('/assets/csvjson.json')
  }

}

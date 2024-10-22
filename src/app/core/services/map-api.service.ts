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

  initializeMap(): void {
    this.map = L.map('map', {
      center: [41.3851, 2.1734], // Barcelona coordinates
      zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

<<<<<<< HEAD
=======

  getMap(): L.Map {
    return this.map;
  }

  loadConcentrationData(): Observable<ConcentrationData[]> {
    return this.http.get<ConcentrationData[]>('/assets/csvjson.json')
  }

>>>>>>> 066ad16fa881e9366374aeb3b1e0131065b2e8ad
}

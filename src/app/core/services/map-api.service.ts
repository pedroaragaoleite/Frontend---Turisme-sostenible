import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface TouristData {
  id: number;
  date: string;
  latitude: number;
  longitude: number;
}

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


  getMap(): L.Map {
    return this.map;
  }

  loadTouristData(): Observable<TouristData[]> {
    return this.http.get('assets/dummy_turist_concentration.csv', { responseType: 'text' })
      .pipe(
        map(csv => this.parseCSV(csv))
      );
  }

  private parseCSV(csv: string): TouristData[] {
    const lines = csv.split('\n');
    const result: TouristData[] = [];
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
      const obj: any = {};
      const currentLine = lines[i].split(',');

      if (currentLine.length === headers.length) {
        for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = j > 1 ? parseFloat(currentLine[j]) : currentLine[j];
        }
        result.push(obj as TouristData);
      }
    }

    return result;
  }

  // addMarkersToMap(data: TouristData[]): void {
  //   data.forEach(point => {
  //     L.marker([point.latitude, point.longitude])
  //       .addTo(this.map)
  //       .bindPopup(`ID: ${point.id}<br>Date: ${point.date}`);
  //   });
  // }
}

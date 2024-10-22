import { Injectable } from '@angular/core';
import * as L from 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class MapApiService {
  private map!: L.Map;

  constructor() { }


  initializationMap(): void {
    this.map = L.map('map', {
      center: [41.3851, 2.1734], // Barcelona coordinates
      zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

}

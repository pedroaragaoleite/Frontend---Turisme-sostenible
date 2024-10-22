import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { TourismDataService } from '../../core/services/tourism-data.service';
import { TourismPoint } from '../../core/interfaces/tourism.interface';
import proj4 from 'proj4';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
  private map!: L.Map;
  private markers: L.Marker[] = [];
  private selectedCategory: string = '';

  constructor(private tourismService: TourismDataService) {}

  ngAfterViewInit(): void {
    this.initMap();
    this.registerProj4Definitions();
    this.loadTourismPoints();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [41.3851, 2.1734],
      zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private registerProj4Definitions(): void {
    proj4.defs('EPSG:25831', '+proj=utm +zone=31 +datum=WGS84 +units=m +no_defs +type=crs');
  }

  public onCategoryFilterChange(event: any): void {
    this.selectedCategory = event.target.value;
    console.log('Categoría seleccionada:', this.selectedCategory);
    this.loadTourismPoints();
  }

  private loadTourismPoints(): void {
    this.clearMarkers();

    this.tourismService.getTourismData().subscribe((data: TourismPoint[]) => {
      data.forEach((point) => {
        const lat = point.lat;
        const lon = point.lon;

        const isCategoryMatch = point.category === this.selectedCategory || this.selectedCategory === '';

        if (isCategoryMatch && lat && lon) {
          const latLng = L.latLng(lat, lon);
          const marker = L.marker(latLng)
            .addTo(this.map)
            .bindPopup(`<strong>${point.name}</strong><br>${point.address}`);

          this.markers.push(marker);
        }
      });
    });
  }

  private clearMarkers(): void {
    this.markers.forEach((marker) => this.map.removeLayer(marker));
    this.markers = [];
  }
}

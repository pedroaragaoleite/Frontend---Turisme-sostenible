import { Component, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapApiService } from '../../core/services/map-api.service';
import { DataFilterService } from '../../core/services/data-filter.service';
import * as L from 'leaflet';
import { TourismDataService } from '../../core/services/tourism-data.service';
import { TourismPoint } from '../../core/interfaces/tourism.interface';
import proj4 from 'proj4';
import 'leaflet.heat';
import { ConcentrationData } from '../../core/models/interface';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
  private mapService = inject(MapApiService);
  private dataFilterService = inject(DataFilterService);
  private map!: L.Map;
  private markers: L.Marker[] = [];
  private selectedCategory: string = 'Museu';
  private data: ConcentrationData[] = [];
  private heatmapData: L.HeatLatLngTuple[] = [];
  private heatmapLayer: L.HeatLayer | null = null;

  monthlyData: { [key: string]: { [key: string]: ConcentrationData[] } } = {};
  selectedMonth: string = '';
  months: string[];
  selectedWeekday: string = '';
  weekdays: string[]

  constructor(private tourismService: TourismDataService) {
    this.months = this.dataFilterService.getMonths();
    this.weekdays = this.dataFilterService.getWeekdays();
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.loadData();
    this.registerProj4Definitions();
    this.loadTourismPoints();
  }

  initMap() {
    this.map = L.map('map').setView([41.3851, 2.1734], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private registerProj4Definitions(): void {
    proj4.defs('EPSG:25831', '+proj=utm +zone=31 +datum=WGS84 +units=m +no_defs +type=crs');
  }

  public onCategoryFilterChange(event: any): void {
    this.selectedCategory = event.target.value;
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

  loadData() {
    this.mapService.loadConcentrationData().subscribe(data => {
      this.data = data;
      this.monthlyData = this.dataFilterService.filterDataByMonthAndWeekday(this.data);
      this.updateHeatmap();
    });
  }

  updateHeatmap() {
    if (this.heatmapLayer) {
      this.map.removeLayer(this.heatmapLayer);
    }

    const filteredData = this.dataFilterService.getFilteredData(
      this.monthlyData,
      this.selectedMonth,
      this.selectedWeekday,
      this.data
    );

    this.heatmapData = filteredData.map(point => [
      parseFloat(point.lat),
      parseFloat(point.lon),
      0.7
    ] as L.HeatLatLngTuple);

    if (this.heatmapData.length > 0) {
      const maxIntensity = Math.max(...this.heatmapData.map(point => point[2]));
      const radius = this.heatmapData.length > 1000 ? 10 : 25;
      const blur = this.heatmapData.length > 1000 ? 15 : 30;

      this.heatmapLayer = L.heatLayer(this.heatmapData, {
        radius: radius,
        blur: blur,
        maxZoom: 18,
        max: maxIntensity,
        minOpacity: 0.4,
        gradient: {0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1: 'red'}
      }).addTo(this.map);
    }
  }

  onMonthSelect() {
    this.updateHeatmap();
  }

  onWeekdaySelect() {
    this.updateHeatmap();

  }
}

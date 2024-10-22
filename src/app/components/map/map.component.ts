import { Component, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import 'leaflet.heat';
import proj4 from 'proj4';

import { MapApiService } from '../../core/services/map-api.service';
import { DataFilterService } from '../../core/services/data-filter.service';
import { TourismDataService } from '../../core/services/tourism-data.service';
import { TourismPoint, ConcentrationData, NoiseData } from '../../core/interfaces/tourism.interface';
import { NoiseServiceService } from '../../core/services/noise-service.service';

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
  private noiseService = inject(NoiseServiceService);
  private map!: L.Map;
  private markers: L.Marker[] = [];
  private selectedCategory: string = 'Museu';
  private data: ConcentrationData[] = [];
  private heatmapData: L.HeatLatLngTuple[] = [];
  private heatmapLayer: L.HeatLayer | null = null;
  private noiseData: NoiseData[] = [];
  private monthlyNoiseData: { [key: string]: { [key: string]: NoiseData[] } } = {};
  private noiseHeatmapLayer: L.HeatLayer | null = null;
  showPoints = true;
  showPlaces = true;
  showNoise = false;
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
    this.loadNoiseData();
  }

  initMap() {
    this.map = L.map('map').setView([41.3851, 2.1734], 14);
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

  private loadNoiseData(): void {
    this.noiseService.loadNoiseData().subscribe(data => {
      this.noiseData = data;
      this.monthlyNoiseData = this.dataFilterService.filterDataByMonthAndWeekday(this.noiseData);
    });
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

  loadData() {
    this.mapService.loadConcentrationData().subscribe(data => {
      this.data = data;
      this.monthlyData = this.dataFilterService.filterDataByMonthAndWeekday(this.data);
      this.updateHeatmap();
    });
  }

  private updateNoiseHeatmap(): void {
    if (this.noiseHeatmapLayer) {
      this.map.removeLayer(this.noiseHeatmapLayer);
    }

    // Only create and add the noise heatmap layer if showNoise is true
    if (this.showNoise) {
      const filteredNoiseData = this.dataFilterService.getFilteredData(
        this.monthlyNoiseData,
        this.selectedMonth,
        this.selectedWeekday,
        this.noiseData
      );

      const heatmapData = filteredNoiseData.map(point => [
        point.lat,
        point.lon,
        this.normalizeNoiseLevel(point.sound_level_mean)
      ] as L.HeatLatLngTuple);

      if (heatmapData.length > 0) {
        this.noiseHeatmapLayer = L.heatLayer(heatmapData, {
          radius: 25,
          blur: 15,
          maxZoom: 18,
          max: 1,
          minOpacity: 0.4,
          gradient: {0.4: 'green', 0.5: 'yellow', 0.6: 'orange', 0.8: 'red', 1: 'purple'}
        }).addTo(this.map);
      }
    }
  }

  private normalizeNoiseLevel(soundLevel: number): number {
    const minDecibels = 38;
    const maxDecibels = 81;
    return (soundLevel - minDecibels) / (maxDecibels - minDecibels);
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
    if (this.showNoise) {
      this.updateNoiseHeatmap();
    }
  }

  onWeekdaySelect() {
    this.updateHeatmap();
    if (this.showNoise) {
      this.updateNoiseHeatmap();
    }
  }

  toggleMarkers(): void {
    if (!this.showPoints) {
           
      this.clearMarkers();
    } else {
      this.loadTourismPoints();
    }
  }

  toggleHeatMap(): void {
    if(!this.showPlaces) {
      console.log(this.showPlaces);
      
      if (this.heatmapLayer) {
        this.map.removeLayer(this.heatmapLayer);
      }
    } else {
      this.updateHeatmap();
    }
  }

  toggleNoiseHeatmap(): void {
    if (!this.showNoise) {
      if (this.noiseHeatmapLayer) {
        this.map.removeLayer(this.noiseHeatmapLayer);
      }
    } else {
      this.updateNoiseHeatmap();
    }
  }
}

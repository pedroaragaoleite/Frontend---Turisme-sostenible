import { Component, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapApiService } from '../../core/services/map-api.service';
import { DataFilterService } from '../../core/services/data-filter.service';
import * as L from 'leaflet';
import 'leaflet.heat';
import { ConcentrationData } from '../../core/models/interface';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements AfterViewInit {
  private mapService = inject(MapApiService);
  private dataFilterService = inject(DataFilterService);
  private map!: L.Map;
  private data: ConcentrationData[] = [];
  private heatmapData: L.HeatLatLngTuple[] = [];
  private heatmapLayer: L.HeatLayer | null = null;

  monthlyData: { [key: string]: { [key: string]: ConcentrationData[] } } = {};
  selectedMonth: string = '';
  months: string[];
  selectedWeekday: string = '';
  weekdays: string[];

  constructor() {
    this.months = this.dataFilterService.getMonths();
    this.weekdays = this.dataFilterService.getWeekdays();
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.loadData();
  }

  initMap() {
    this.map = L.map('map').setView([41.3851, 2.1734], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  loadData() {
    this.mapService.loadTouristData().subscribe(data => {
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
      0.3
    ] as L.HeatLatLngTuple);

    if (this.heatmapData.length > 0) {
      this.heatmapLayer = L.heatLayer(this.heatmapData, {
        radius: 5,
        blur: 10,
        maxZoom: 17,
        minOpacity: 0.3,
        max: 0.7,
        gradient: {0.4: 'yellow', 0.65: 'orange', 1: 'red'}
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

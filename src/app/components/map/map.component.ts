import { Component, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapApiService } from '../../core/services/map-api.service';
import * as L from 'leaflet';
import 'leaflet.heat';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements AfterViewInit {
  private mapService = inject(MapApiService);
  private map!: L.Map;
  private data: TouristData[] = [];
  private heatmapData: L.HeatLatLngTuple[] = [];
  private heatmapLayer: L.HeatLayer | null = null;

  monthlyData: { [key: string]: { [key: string]: TouristData[] } } = {};
  selectedMonth: string = '';
  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  selectedWeekday: string = '';
  weekdays: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
      this.filterDataByMonthAndWeekday();
      this.updateHeatmap();
    });
  }

  filterDataByMonthAndWeekday() {
    this.monthlyData = {};
    this.data.forEach(point => {
      const pointDate = new Date(point.date);
      const monthKey = (pointDate.getMonth() + 1).toString().padStart(2, '0');
      const weekday = this.weekdays[pointDate.getDay()];
      
      if (!this.monthlyData[monthKey]) {
        this.monthlyData[monthKey] = {};
      }
      if (!this.monthlyData[monthKey][weekday]) {
        this.monthlyData[monthKey][weekday] = [];
      }
      this.monthlyData[monthKey][weekday].push(point);
    });
  }

  updateHeatmap() {
    if (this.heatmapLayer) {
      this.map.removeLayer(this.heatmapLayer);
    }

    let filteredData: TouristData[] = [];

    if (this.selectedMonth && this.selectedWeekday) {
      // Both month and weekday selected
      filteredData = this.monthlyData[this.selectedMonth]?.[this.selectedWeekday] || [];
    } else if (this.selectedMonth) {
      // Only month selected
      filteredData = Object.values(this.monthlyData[this.selectedMonth] || {}).flat();
    } else if (this.selectedWeekday) {
      // Only weekday selected
      filteredData = Object.values(this.monthlyData)
        .flatMap(monthData => monthData[this.selectedWeekday] || []);
    } else {
      // No filters selected
      filteredData = this.data;
    }

    this.heatmapData = filteredData.map(point => [
      point.latitude,
      point.longitude,
      1
    ] as L.HeatLatLngTuple);

    if (this.heatmapData.length > 0) {
      this.heatmapLayer = L.heatLayer(this.heatmapData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        minOpacity: 0.3,
        max: 1.0,
        gradient: {0.4: 'blue', 0.65: 'lime', 1: 'red'}
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

interface TouristData {
  id: number;
  date: string;
  latitude: number;
  longitude: number;
}

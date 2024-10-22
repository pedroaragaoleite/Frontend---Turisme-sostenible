import { Component, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapApiService } from '../../core/services/map-api.service';


@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements AfterViewInit {
 
private mapService = inject(MapApiService);

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap() {
    this.mapService.initializationMap();
  }


}

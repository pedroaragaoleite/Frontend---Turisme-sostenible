import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MapComponent } from './components/map/map.component';
import { HomeComponent } from "./components/home/home.component";
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MapComponent, HomeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Frontend-Turisme-Sostenible';
}

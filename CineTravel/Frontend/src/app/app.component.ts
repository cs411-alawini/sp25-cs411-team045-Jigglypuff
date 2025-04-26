import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Movie } from '../app/movie'
import { provideHttpClient } from '@angular/common/http';
import { TopbarComponent } from './topbar/topbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'CineTravel';
  movieList: Movie[] = [];
}

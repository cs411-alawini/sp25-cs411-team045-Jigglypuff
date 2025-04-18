import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { movies } from '../app/movie'
import { provideHttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'CineTravel';
  movieList = movies;
}

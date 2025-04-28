// import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
// import { movies } from '../app/movie'
// import { provideHttpClient } from '@angular/common/http';

// @Component({
//   selector: 'app-root',
//   imports: [RouterOutlet],
//   templateUrl: './app.component.html',
//   styleUrl: './app.component.css'
// })
// export class AppComponent {
//   title = 'CineTravel';
//   movieList = movies;
// }
// src/app/app.component.ts

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Movie } from '../app/movie'
import { provideHttpClient } from '@angular/common/http';
import { TopbarComponent } from './topbar/topbar.component';
// import { movies } from './movie';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'CineTravel';
  movieList: Movie[] = [];
}


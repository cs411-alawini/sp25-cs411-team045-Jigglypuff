import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Movie, movies } from '../movie';

@Component({
  selector: 'app-homepage',
  imports: [CommonModule, RouterModule],
  standalone: true,
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent {
[x: string]: any;
    title = 'Welcome to the CineTravel!'
    movies: Movie[] = movies;

    constructor(private router: Router){}

    // hwen clicking the name, navigate to the page.
    onMovieClick(movieId: number): void {
      this.router.navigate(['/movies',movieId]);
    }
}

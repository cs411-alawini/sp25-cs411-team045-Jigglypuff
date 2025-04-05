// src/app/homepage.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../services/movie.service';
import { Movie } from '../movie';

@Component({
  selector: 'app-homepage',
  imports: [CommonModule, RouterModule, FormsModule],
  standalone: true,
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  title = 'Welcome to the CineTravel!';
  // 存放從後端取得的所有電影
  filteredMovies: Movie[] = [];

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    
    this.movieService.getAllMovies().subscribe({
      next: (movies: Movie[]) => {
        this.filteredMovies = movies;
      },
      error: (err) => {
        console.error('Failed to load movies', err);
      }
    });
  }
}

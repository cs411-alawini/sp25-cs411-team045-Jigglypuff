import { Component, OnInit } from '@angular/core';
import { FavoriteMoviesService } from '../services/favorite-movies.service';
import { Movie } from '../movie';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TopbarComponent } from '../topbar/topbar.component';


@Component({
  selector: 'app-favorite-movies',
  standalone: true,
  templateUrl: './favorite-movies.component.html',
  styleUrls: ['./favorite-movies.component.css'],
  imports: [CommonModule, RouterModule, TopbarComponent],
})
export class FavoriteMoviesComponent implements OnInit {
  favoriteMovies: Movie[] = [];

  constructor(private favoriteService: FavoriteMoviesService) {}

  ngOnInit(): void {
    this.favoriteService.getFavorite().subscribe(
      (movies: Movie[]) => {
        this.favoriteMovies = movies;
      },
      (error) => {
        console.error('Failed to load favorite movies', error);
      }
    );
  }

  loadFavorite(movieId: number): void {
    this.favoriteService.getFavorite().subscribe(
      (movies: Movie[]) => this.favoriteMovies = movies
    );
  }

  removeFavorite(movieId: number): void {
    this.favoriteService.removeFavorite(movieId).subscribe({
      next: () => {
        this.favoriteMovies = this.favoriteMovies.filter(m => m.id_movies !== movieId);
      },
      error: (err) => {
        console.log("remove fail", err);
        alert("try later")
      }
    })
  }

  clearFavorites(): void {
    this.favoriteService.clearFavorite().subscribe({
      next: () => {
        this.favoriteMovies = [];
      },
      error: (err) => {
        console.error('fail to clear', err);
        alert("clear later")
      }
    })
  }
}

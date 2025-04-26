// src/app/homepage.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../services/movie.service';
import { Movie } from '../movie';
import { FavoriteMoviesService } from '../services/favorite-movies.service';
import { Router } from '@angular/router'
import { TopbarComponent } from '../topbar/topbar.component';


@Component({
  selector: 'app-homepage',
  imports: [CommonModule, RouterModule, FormsModule, TopbarComponent],
  standalone: true,
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})

export class HomepageComponent implements OnInit {
  title = 'Welcome to the CineTravel!';
  searchTerm: string = "";
  selectedGenre: string = '';
  selectedYear: string = '';
  selectedLocation: string = '';

  genres: string[] = [];
  years: string[] = [];
  locations: string[] = [];
  filteredMovies: Movie[] = [];

  // Favorites related
  likedMovies: number[] = [];
  userId: number = Number(localStorage.getItem('userId')) || 0;


  constructor(private movieService: MovieService, private router: Router, private favoriteMoviesService: FavoriteMoviesService) {}

  ngOnInit(): void {
    
    this.movieService.getAllMovies().subscribe({
      next: (movies: Movie[]) => {
        this.filteredMovies = movies;
  
        // filtered year
        this.years = Array.from(new Set(movies.map(movie => movie.year.toString())));
      },
      error: (err) => {
        console.error('Failed to load movies', err);
      }
    });

    // Favorites related

    // if (this.userId) {
    //   this.movieService.getUserFavorites(this.userId).subscribe({
    //     next: (favorites: Movie[]) => {
    //       this.likedMovies = favorites.map(movie => movie.id);
    //     },
    //     error: (err) => {
    //       console.error('Failed to load favorites', err);
    //     }
    //   });
    // }
  }

  loadMovies(): void {
    this.movieService.filterMovies({
      search: this.searchTerm,
      genre: this.selectedGenre,
      year: this.selectedYear,
      location: this.selectedLocation
    }).subscribe({
      next: (movies: Movie[]) => {
        this.filteredMovies = movies;
        // 如果需要，你也可以根據返回結果動態產生篩選選項
      },
      error: (err) => {
        console.error('搜尋電影時發生錯誤:', err);
      }
    });
  }

  onSearch(): void {
    this.loadMovies();
  }

  onFilterChange(): void {
    this.loadMovies();
  }
  
  // Favorites related
  isLiked(movieId: number): boolean {
    return this.likedMovies.includes(movieId);
  }
  
  // toggleLike(movie: Movie): void {
  //   if (this.likedMovies.includes(movie.id)) {
  //     this.movieService.unlikeMovie(this.userId, movie.id).subscribe(() => {
  //       this.likedMovies = this.likedMovies.filter(id => id !== movie.id);
  //     });
  //   } else {
  //     this.movieService.likeMovie(this.userId, movie.id).subscribe(() => {
  //       this.likedMovies.push(movie.id);
  //     });
  //   }

  // }
  // Toggle like status for each movie
  toggleLike(movie: Movie): void {
    if (this.isLiked(movie.id_movies)) {
      // check locally
      console.log("remove successfully!")
      this.likedMovies = this.likedMovies.filter(id => id !== movie.id_movies);
      
      // call backend API
      this.favoriteMoviesService.removeFavorite(movie.id_movies).subscribe({
        next: () => console.log('Removed from favorites'),
        error: (err) => {
          console.error(err);
          // recover states
          this.likedMovies = [...this.likedMovies, movie.id_movies];
        }
      });
    } else {
      // update locally
      console.log("add succsessfully")
      this.likedMovies = [...this.likedMovies, movie.id_movies];
      
      // call backend API
      this.favoriteMoviesService.addToFavorite(movie.id_movies, movie.title).subscribe({
        next: () => console.log('Added to favorites'),
        error: (err) => {
          console.error(err);
          // recover states
          this.likedMovies = this.likedMovies.filter(id => id !== movie.id_movies);
        }
      });
    }
  }
}


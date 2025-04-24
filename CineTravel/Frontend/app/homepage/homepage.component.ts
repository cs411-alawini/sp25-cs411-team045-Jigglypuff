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
  searchTerm: string = "";
  selectedGenre: string = '';
  selectedYear: string = '';
  selectedLocation: string = '';

  // 如果你有預先設定可篩選選項，則可加入以下陣列
  genres: string[] = [];
  years: string[] = [];
  locations: string[] = [];
  // 存放從後端取得的所有電影
  filteredMovies: Movie[] = [];

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    
    this.movieService.getAllMovies().subscribe({
      next: (movies: Movie[]) => {
        this.filteredMovies = movies;
        // 從電影資料中提取所有年份
        this.years = Array.from(new Set(movies.map(movie => movie.year.toString())));
      },
      error: (err) => {
        console.error('Failed to load movies', err);
      }
    });
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
}

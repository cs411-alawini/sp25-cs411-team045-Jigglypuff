import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Movie, movies } from '../movie';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-homepage',
  imports: [CommonModule, RouterModule, FormsModule],
  standalone: true,
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent {
[x: string]: any;
    title = 'Welcome to the CineTravel!'
    searchTerm: string = "";
    movies: Movie[] = movies;
    filteredMovies: Movie[] = movies;

    // filter condition
    selectedGenre: string = '';
    selectedYear: string = '';
    selectedLocation: string = '';

    genres: string[] = Array.from(new Set(this.movies.map(movie => movie.genre)));
    years: string[] = Array.from(new Set(this.movies.map(movie => movie.year.toString())));
    locations: string[] = Array.from(new Set(this.movies.map(movie => movie.location)));

    onFilterChange(): void {
      this.filterMovies();
    }

    onSearch(): void {
      this.filterMovies();
    }

    filterMovies(): void {
      this.filteredMovies = this.movies.filter(movie => {
        const matchesSearch = movie.genre.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                              movie.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                              movie.location.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                              movie.mainActor.toLowerCase().includes(this.searchTerm.toLowerCase());
        const matchesGenre = this.selectedGenre ? movie.genre === this.selectedGenre: true;
        const matchesYear = this.selectedYear ? movie.year.toString() === this.selectedYear: true;
        const matchesLocation = this.selectedLocation ? movie.location.toString() === this.selectedLocation: true;

        return matchesSearch && (matchesGenre && matchesYear && matchesLocation);
      });
    }

    }

    // constructor(private router: Router){}

    // // hwen clicking the name, navigate to the page.
    // onMovieClick(movieId: number): void {
    //   this.router.navigate(['/movies',movieId]);
//     }
// }

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Movie, movies } from '../movie';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-movie-details',
  imports: [],
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.css'
})
export class MovieDetailsComponent implements OnInit {
  movie!: Movie;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
      // get movie id
      const movieId = Number(this.route.snapshot.paramMap.get('id'));

      // according to movie id, find the movie
      this.movie = movies.find((movie) => movie.id === movieId)!
  }
}

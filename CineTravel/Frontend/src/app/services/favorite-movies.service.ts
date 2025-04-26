// import { Injectable } from '@angular/core';


import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie } from '../movie';

@Injectable({
  providedIn: 'root'
})
export class FavoriteMoviesService {

  private favoriteMovieApiUrl = 'http://localhost:3000/api/favorites'; 

  constructor(private http: HttpClient) {}

  // add movieId to the backend
  addToFavorite(movieId: number, title: string): Observable<any> {
    return this.http.post(this.favoriteMovieApiUrl, { movieId, title });
  }

  // get favorite movies data
  getFavorite(): Observable<Movie[]> {
    return this.http.get<Movie[]>(this.favoriteMovieApiUrl);
  }

  // clear
  clearFavorite(): Observable<any> {
    return this.http.delete(this.favoriteMovieApiUrl);
  }

  // remove
  removeFavorite(movieId: number): Observable<any> {
    return this.http.delete(`${this.favoriteMovieApiUrl}/${movieId}`);
  }
}
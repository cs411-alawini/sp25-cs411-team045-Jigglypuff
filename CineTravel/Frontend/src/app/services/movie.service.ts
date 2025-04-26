// src/app/services/movie.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie } from '../movie';

@Injectable({
  providedIn: 'root'
})
export class MovieService {

  private apiUrl = 'http://localhost:3000/api/movies';

  constructor(private http: HttpClient) {}

  // filtered movies
  filterMovies(filters: { search?: string; genre?: string; year?: string; location?: string }): Observable<Movie[]> {
    let params = new HttpParams();
    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.genre) {
      params = params.set('genre', filters.genre);
    }
    if (filters.year) {
      params = params.set('year', filters.year);
    }
    if (filters.location) {
      params = params.set('location', filters.location);
    }
    return this.http.get<Movie[]>(this.apiUrl, { params });
  }

  // get all the movies
  getAllMovies(): Observable<Movie[]> {
    return this.http.get<Movie[]>(`${this.apiUrl}/all`);
  }

  // User favorite related 
  private userApiUrl = 'http://localhost:3000/api/user';
  getUserFavorites(userId: number): Observable<Movie[]> {
    return this.http.get<Movie[]>(`${this.userApiUrl}/${userId}/favorites`);
  }
  
  likeMovie(userId: number, movieId: number): Observable<any> {
    return this.http.post(`${this.userApiUrl}/${userId}/favorites`, { movieId });
  }
  
  unlikeMovie(userId: number, movieId: number): Observable<any> {
    return this.http.delete(`${this.userApiUrl}/${userId}/favorites/${movieId}`);
  }
}

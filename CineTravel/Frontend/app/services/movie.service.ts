// src/app/services/movie.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie } from '../movie';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  // API 基本路徑，依據你的後端設定調整
  private apiUrl = 'http://localhost:3000/api/movies';

  constructor(private http: HttpClient) {}

  // 若有需要搜尋功能可保留
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

  // 新增：取得所有電影
  getAllMovies(): Observable<Movie[]> {
    return this.http.get<Movie[]>(`${this.apiUrl}/all`);
  }
}

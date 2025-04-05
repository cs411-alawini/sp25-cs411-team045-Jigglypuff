// src/app/services/movie.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  searchMovies(term: string): Observable<Movie[]> {
    return this.http.get<Movie[]>(`${this.apiUrl}?search=${term}`);
  }

  // 新增：取得所有電影
  getAllMovies(): Observable<Movie[]> {
    return this.http.get<Movie[]>(`${this.apiUrl}/all`);
  }
}

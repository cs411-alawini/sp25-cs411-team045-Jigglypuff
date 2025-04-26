import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CityService {
  private MOVIE_API_URL = 'http://localhost:3000/api/movies-by-city';
  private CITIES_API_URL = 'http://localhost:3000/api/cities';

  constructor(private http: HttpClient) {}

  getMoviesByCity(city: string): Observable<any> {
    return this.http.get(`${this.MOVIE_API_URL}/${city}`);
  }

  getCities(): Observable<string[]> {
    return this.http.get<string[]>(this.CITIES_API_URL);
  }
}

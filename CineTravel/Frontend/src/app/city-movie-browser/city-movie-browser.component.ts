import { Component, OnInit } from '@angular/core';
import { CityService } from '../services/city.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-city-movie-browser',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './city-movie-browser.component.html',
  styleUrls: ['./city-movie-browser.component.css']
})
export class CityMovieBrowserComponent implements OnInit {
  cities: string[] = [];
  selectedCity = '';
  movies: any[] = [];

  constructor(private cityService: CityService, private http: HttpClient) {}

  ngOnInit(): void {
    this.cityService.getCities().subscribe(data => {
      this.cities = data;
    });
  }

  onCityChange(): void {
    if (this.selectedCity) {
      this.cityService.getMoviesByCity(this.selectedCity)
        .subscribe(data => this.movies = data);
    } else {
      this.movies = [];
    }
  }
}

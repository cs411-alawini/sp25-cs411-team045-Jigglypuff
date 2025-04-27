import {
    Component,
    OnInit,
    AfterViewInit
  } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { RouterModule } from '@angular/router';
  import { FormsModule } from '@angular/forms';
  import { HttpClient, HttpClientModule } from '@angular/common/http';
  import { MovieService } from '../services/movie.service';
  import { Movie } from '../movie';
  
  // 定義國家評分介面
  interface CountryRating {
    country: string;
    avg_movie_rating: number;
  }
  
  declare const google: any;
  
  @Component({
    selector: 'app-location',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
    templateUrl: './location.component.html',
    styleUrls: ['./location.component.css']
  })
  export class LocationComponent implements OnInit, AfterViewInit {
    title = 'Explore Filming Locations';
    countryRatings: CountryRating[] = [];
    allCountryRatings: CountryRating[] = []; // 保存所有國家評分的備份
    selectedCountry = '';
    private map: any;
    private marker: any;
    private apiUrl = 'http://localhost:3000/api';
    
    // 評分過濾參數
    minRating: number = 0;
    maxRating: number = 10;
    
    // 國家座標備份
    private countryCoordinates: {[key: string]: {lat: number, lng: number}} = {
      'usa': {lat: 37.0902, lng: -95.7129},
      'uk': {lat: 55.3781, lng: -3.4360},
      'france': {lat: 46.2276, lng: 2.2137},
      'japan': {lat: 36.2048, lng: 138.2529},
      'australia': {lat: -25.2744, lng: 133.7751},
      'canada': {lat: 56.1304, lng: -106.3468},
      'germany': {lat: 51.1657, lng: 10.4515},
      'italy': {lat: 41.8719, lng: 12.5674},
      'spain': {lat: 40.4637, lng: -3.7492},
      'mexico': {lat: 23.6345, lng: -102.5528}
    };
    
    constructor(
      private movieService: MovieService,
      private http: HttpClient
    ) {}
    
    ngOnInit(): void {
      // 載入所有國家評分
      this.loadCountryRatings();
    }
    
    // 載入國家評分數據
    loadCountryRatings(): void {
      this.http.get<CountryRating[]>(`${this.apiUrl}/movie-locations/country-ratings`)
        .subscribe({
          next: (ratings) => {
            this.countryRatings = ratings;
            this.allCountryRatings = [...ratings]; // 保存所有國家評分的備份
            console.log('已載入國家評分:', this.countryRatings);
          },
          error: (err) => console.error('無法載入國家評分', err)
        });
    }
    
    // 根據評分範圍過濾國家
    filterByRating(): void {
      // 確保數值有效
      this.minRating = Math.max(0, Math.min(this.minRating, 10));
      this.maxRating = Math.max(this.minRating, Math.min(this.maxRating, 10));
      
      console.log(`過濾評分範圍: ${this.minRating} - ${this.maxRating}`);
      
      // 調用後端 API 獲取過濾結果
      this.http.get<CountryRating[]>(`${this.apiUrl}/movie-locations/country-ratings/filter`, {
        params: {
          minRating: this.minRating.toString(),
          maxRating: this.maxRating.toString()
        }
      }).subscribe({
        next: (filteredRatings) => {
          this.countryRatings = filteredRatings;
          console.log(`已過濾國家數量: ${filteredRatings.length}`);
        },
        error: (err) => {
          console.error('過濾國家評分錯誤:', err);
          
          // 如果 API 調用失敗，在前端進行過濾（備用方案）
          this.countryRatings = this.allCountryRatings.filter(rating => 
            rating.avg_movie_rating >= this.minRating && 
            rating.avg_movie_rating <= this.maxRating
          );
        }
      });
    }
    
    ngAfterViewInit(): void {
      if (typeof google !== 'undefined' && google.maps) {
        this.initMap();
      } else {
        (window as any)['initMap'] = () => {
          this.initMap();
        };
      }
    }
    
    onSelectCountry(country: string): void {
      this.selectedCountry = country;
      

      this.findAndMarkLocation(country);
    }
    
    private initMap(): void {
      try {
        console.log('初始化地圖');
        const mapElement = document.getElementById('map');
        if (!mapElement) {
          console.error('找不到地圖元素');
          return;
        }
        
        this.map = new google.maps.Map(mapElement, {
          center: { lat: 0, lng: 0 },
          zoom: 2,
          mapTypeControl: true,
          fullscreenControl: true,
          streetViewControl: true,
          zoomControl: true
        });
        console.log('地圖已初始化', this.map);
      } catch (error) {
        console.error('地圖初始化錯誤:', error);
      }
    }
    
    private findAndMarkLocation(countryName: string): void {
      if (!this.map) {
        console.error('Map not initialized');
        return;
      }
      
      // Remove previous marker (if exists)
      if (this.marker) {
        this.marker.setMap(null);
      }
      
      // First try using default country coordinates
      const normalizedCountry = countryName.toLowerCase();
      if (this.countryCoordinates[normalizedCountry]) {
        console.log(`Using default coordinates for ${countryName}`);
        this.markLocation(
          this.countryCoordinates[normalizedCountry], 
          countryName,
          `${countryName} (Default coordinates)`
        );
        return;
      }
      
      // If default coordinates don't exist, try using Geocoding API
      if (!google.maps.Geocoder) {
        console.error('Geocoder service not available');
        return;
      }
      
      console.log(`Attempting geocoding for: ${countryName}`);
      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode(
        { 'address': countryName + ' country' }, // Add 'country' keyword to improve success rate
        (results: any, status: any) => {
          if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
            console.log(`Successfully geocoded ${countryName}`);
            const location = results[0].geometry.location;
            const formattedAddress = results[0].formatted_address;
            
            this.markLocation(
              { lat: location.lat(), lng: location.lng() },
              countryName,
              formattedAddress
            );
          } else {
            console.error(`Geocoding failed: ${status} for ${countryName}`);
            
            // Create a fallback location if no default coordinates and geocoding fails
            const fallbackLocation = { lat: 0, lng: 0 };
            this.markLocation(
              fallbackLocation,
              countryName,
              `${countryName} (Geocoding failed)`
            );
            
            // Display error message
            alert(`Unable to locate "${countryName}". Using generic location instead.`);
          }
        }
      );
    }
    
    private markLocation(location: {lat: number, lng: number}, title: string, description: string): void {
      // Move map center
      this.map.setCenter(location);
      this.map.setZoom(5);
      
      // Create new marker
      this.marker = new google.maps.Marker({
        map: this.map,
        position: location,
        title: title,
        animation: google.maps.Animation.DROP
      });
      
      // Get country rating
      const countryRating = this.allCountryRatings.find(
        r => r.country.toLowerCase() === title.toLowerCase()
      );
      const ratingText = countryRating ? `Rating: ${countryRating.avg_movie_rating}` : '';
      
      // Create basic info window content
      let contentString = `
        <div style="min-width: 350px; padding: 10px; color: #333;">
          <h3 style="margin-top: 0; color: #111;">${title}</h3>
          <p>${ratingText}</p>
          
          <div style="display: flex; justify-content: space-between;">
            <div style="width: 48%;">
              <h4 style="color: #111; margin-bottom: 8px;">Top Movies</h4>
              <div id="top-movies-${title.replace(/\s+/g, '-').toLowerCase()}" style="margin-bottom: 10px;">
                <p style="color: #666;">Loading movie data...</p>
              </div>
            </div>
            
            <div style="width: 48%;">
              <h4 style="color: #111; margin-bottom: 8px;">Top Hotels</h4>
              <div id="top-hotels-${title.replace(/\s+/g, '-').toLowerCase()}" style="margin-bottom: 10px;">
                <p style="color: #666;">Loading hotel data...</p>
              </div>
            </div>
          </div>
        </div>
      `;
      
      const infoWindow = new google.maps.InfoWindow({
        content: contentString
      });
      
      // Show info window when marker is clicked
      this.marker.addListener('click', () => {
        infoWindow.open(this.map, this.marker);
        
        // Fetch top movies and hotels when info window opens
        this.fetchTopContentForCountry(title, infoWindow);
      });
      
      // Automatically open info window
      infoWindow.open(this.map, this.marker);
      
      // Immediately fetch top movies and hotels
      this.fetchTopContentForCountry(title, infoWindow);
    }
    
    // Fetch top movies and hotels for a country and update info window
    private fetchTopContentForCountry(country: string, infoWindow: any): void {
      // Standardize country name for DOM ID
      const countryId = country.replace(/\s+/g, '-').toLowerCase();
      
      // Fetch top movies
      this.http.get<any[]>(`${this.apiUrl}/movies/top-by-country/${country}`)
        .subscribe({
          next: (movies) => {
            if (movies.length === 0) {
              this.updateInfoWindowContent(
                infoWindow, 
                `top-movies-${countryId}`, 
                '<p style="color: #666; font-style: italic;">No movie data found</p>'
              );
              return;
            }
            
            // Create movie list HTML
            let moviesHtml = `<ul style="padding-left: 20px; margin-top: 5px; color: #333;">`;
            
            movies.forEach((movie) => {
              moviesHtml += `
                <li style="margin-bottom: 5px;">
                  <strong style="color: #111;">${movie.title}</strong> (${movie.year}) - 
                  <span style="color: #d4af37; font-weight: bold;">★ ${movie.vote_average}</span>
                </li>
              `;
            });
            
            moviesHtml += '</ul>';
            
            this.updateInfoWindowContent(infoWindow, `top-movies-${countryId}`, moviesHtml);
          },
          error: (err) => {
            console.error(`Unable to fetch top movies for ${country}:`, err);
            this.updateInfoWindowContent(
              infoWindow, 
              `top-movies-${countryId}`, 
              '<p style="color: #666; font-style: italic;">Unable to load movie data</p>'
            );
          }
        });
      
      // Fetch top hotels
      this.http.get<any[]>(`${this.apiUrl}/hotels/top-by-country/${country}`)
        .subscribe({
          next: (hotels) => {
            if (hotels.length === 0) {
              this.updateInfoWindowContent(
                infoWindow, 
                `top-hotels-${countryId}`, 
                '<p style="color: #666; font-style: italic;">No hotel data found</p>'
              );
              return;
            }
            
            // Create hotel list HTML
            let hotelsHtml = `<ul style="padding-left: 20px; margin-top: 5px; color: #333;">`;
            
            hotels.forEach((hotel) => {
              hotelsHtml += `
                <li style="margin-bottom: 5px;">
                  <strong style="color: #111;">${hotel.Hotel_Name}</strong> (${hotel.City}) - 
                  <span style="color: #d4af37; font-weight: bold;">★ ${hotel.Average_Score}</span>
                </li>
              `;
            });
            
            hotelsHtml += '</ul>';
            
            this.updateInfoWindowContent(infoWindow, `top-hotels-${countryId}`, hotelsHtml);
          },
          error: (err) => {
            console.error(`Unable to fetch top hotels for ${country}:`, err);
            this.updateInfoWindowContent(
              infoWindow, 
              `top-hotels-${countryId}`, 
              '<p style="color: #666; font-style: italic;">Unable to load hotel data</p>'
            );
          }
        });
    }
    
    // Update specific content in the info window
    private updateInfoWindowContent(infoWindow: any, elementId: string, newContent: string): void {
      // Check if info window is open
      if (!infoWindow.getMap()) return;
      
      const container = document.getElementById(elementId);
      if (container) {
        container.innerHTML = newContent;
      } else {
        console.error(`Container not found: ${elementId}`);
      }
    }
  }
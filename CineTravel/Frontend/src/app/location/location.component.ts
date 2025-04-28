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
  
  // Define the country rating interface
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
    title = 'Explore Filming & Hotel Locations';
    countryRatings: CountryRating[] = [];
    allCountryRatings: CountryRating[] = []; // Save a backup of all country ratings
    selectedCountry = '';
    private map: any;
    private marker: any;
    private infoWindow: any;
    private apiUrl = 'http://localhost:3000/api';
    countries: any[] = [];
    selectedUpdateCountry: string = '';
    countryHotels: any[] = [];
    selectedHotelId: string = '';
    currentHotelRating: number = 0;
    newHotelRating: number = 0;
    updateMessage: string = '';
    updateSuccess: boolean = true;
    ratingHistory: any[] = [];
    showRatingHistory: boolean = false;
    // Rating filter parameters
    minRating: number = 0;
    maxRating: number = 10;
    
    // Backup of country coordinates
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
      // Load all country ratings
      this.loadCountryRatings();
      this.loadCountries();
    }
    getRatingHistory(): void {
      this.http.get<any[]>(`${this.apiUrl}/rating-history`)
        .subscribe({
          next: (history) => {
            console.log('History data received:', history);
            this.ratingHistory = history;
            this.showRatingHistory = true;
          },
          error: (err) => {
            console.error('Error fetching rating history:', err);
          }
        });
    }
    
    // Close rating history display
    closeRatingHistory(): void {
      this.showRatingHistory = false;
    }
    // Load country rating data
    loadCountries(): void {
      this.http.get<any[]>(`${this.apiUrl}/countries`)
        .subscribe({
          next: (countries) => {
            this.countries = countries;
            console.log('Loaded countries for update form:', countries.length);
          },
          error: (err) => {
            console.error('Error loading countries:', err);
          }
        });
    }
    loadCountryRatings(): void {
      this.http.get<CountryRating[]>(`${this.apiUrl}/movie-locations/country-ratings`)
        .subscribe({
          next: (ratings) => {
            this.countryRatings = ratings;
            this.allCountryRatings = [...ratings]; // Save a backup of all country ratings
            console.log('Country ratings loaded:', this.countryRatings);
          },
          error: (err) => console.error('Country ratings loaded failed', err)
        });
    }
    onUpdateCountryChange(): void {
      if (!this.selectedUpdateCountry) {
        this.countryHotels = [];
        this.selectedHotelId = '';
        this.currentHotelRating = 0;
        this.newHotelRating = 0;
        return;
      }
      
      this.http.get<any[]>(`${this.apiUrl}/hotels/by-country/${this.selectedUpdateCountry}`)
        .subscribe({
          next: (hotels) => {
            this.countryHotels = hotels;
            console.log(`Loaded ${hotels.length} hotels for ${this.selectedUpdateCountry}`);
            this.selectedHotelId = '';
            this.currentHotelRating = 0;
            this.newHotelRating = 0;
          },
          error: (err) => {
            console.error(`Error loading hotels for ${this.selectedUpdateCountry}:`, err);
            this.countryHotels = [];
          }
        });
    }
    onHotelSelect(): void {
      if (!this.selectedHotelId) {
        this.currentHotelRating = 0;
        this.newHotelRating = 0;
        return;
      }
      
      const selectedHotel = this.countryHotels.find(h => h.Id == this.selectedHotelId);
      if (selectedHotel) {
        this.currentHotelRating = selectedHotel.Average_Score;
        this.newHotelRating = selectedHotel.Average_Score;
      }
    }
    
    // update hotel rating
    updateHotelRating(): void {
      if (!this.selectedHotelId || !this.newHotelRating) {
        this.updateMessage = 'Please select a hotel and enter a new rating';
        this.updateSuccess = false;
        return;
      }
      
      this.http.put(`${this.apiUrl}/hotels/${this.selectedHotelId}/rating`, { newRating: this.newHotelRating })
        .subscribe({
          next: (response: any) => {
            console.log('Rating updated:', response);
            this.updateMessage = `Successfully updated hotel rating to ${this.newHotelRating}`;
            this.updateSuccess = true;
            
            
            const hotelIndex = this.countryHotels.findIndex(h => h.Id == this.selectedHotelId);
            if (hotelIndex !== -1) {
              this.countryHotels[hotelIndex].Average_Score = this.newHotelRating;
              this.currentHotelRating = this.newHotelRating;
            }
            
           
            if (this.selectedUpdateCountry === this.selectedCountry.toLowerCase()) {
              setTimeout(() => {
              
                if (this.marker && this.marker.map) {
                  this.fetchTopContentForCountry(this.selectedCountry, this.infoWindow);
                }
              }, 500);
            }
          },
          error: (err) => {
            console.error('Error updating hotel rating:', err);
            this.updateMessage = err.error?.error || 'Failed to update hotel rating';
            this.updateSuccess = false;
          }
        });
    }
  
    filterByRating(): void {
 
      this.minRating = Math.max(0, Math.min(this.minRating, 10));
      this.maxRating = Math.max(this.minRating, Math.min(this.maxRating, 10));
      
      console.log(`過濾評分範圍: ${this.minRating} - ${this.maxRating}`);
      
  
      this.http.get<CountryRating[]>(`${this.apiUrl}/movie-locations/country-ratings/filter`, {
        params: {
          minRating: this.minRating.toString(),
          maxRating: this.maxRating.toString()
        }
      }).subscribe({
        next: (filteredRatings) => {
          this.countryRatings = filteredRatings;
          console.log(`Number of countries filtered. ${filteredRatings.length}`);
        },
        error: (err) => {
          console.error('Number of countries filtered failed.', err);
          
        
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
        console.log('Initialize the map');
        const mapElement = document.getElementById('map');
        if (!mapElement) {
          console.error('Map element not found');
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
        console.log('Map initialized', this.map);
      } catch (error) {
        console.error('Map initialization error.:', error);
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
      this.infoWindow = infoWindow;
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
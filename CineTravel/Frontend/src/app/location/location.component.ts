import {
    Component,
    OnInit,
    AfterViewInit
  } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { RouterModule } from '@angular/router';
  import { FormsModule } from '@angular/forms';
  import { MovieService } from '../services/movie.service';
  import { Movie } from '../movie';
  
  // 使用 declare 即可，不需要額外引入
  declare const google: any;
  
  @Component({
    selector: 'app-location',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './location.component.html',
    styleUrls: ['./location.component.css']
  })
  export class LocationComponent implements OnInit, AfterViewInit {
    title = 'Explore Filming Locations';
    locations: string[] = [];
    filteredMovies: Movie[] = [];
    selectedLocation = '';
    private map: any; // 只保留一個 map 變數宣告
    
    constructor(private movieService: MovieService) {}
  
    ngOnInit(): void {
      this.movieService.getAllMovies().subscribe({
        next: (movies) => {
          this.locations = Array.from(new Set(movies.map(m => m.location)));
        },
        error: (err) => console.error('Failed to load movies', err)
      });
    }
  
    ngAfterViewInit(): void {
      // 等地圖 API script 載入後才呼叫
      if ((window as any).google && (window as any).google.maps) {
        this.initMap();
      } else {
        // 若 script 還沒載入，可延遲重試
        const interval = setInterval(() => {
          if ((window as any).google && (window as any).google.maps) {
            clearInterval(interval);
            this.initMap();
          }
        }, 300);
      }
    }
  
    onSelect(location: string): void {
      this.selectedLocation = location;
      this.movieService.getAllMovies().subscribe(movies => {
        this.filteredMovies = movies.filter(m => m.location === location);
      });
      // 選好地點後，將地圖中心移到第一部該地點電影的拍攝位置
      this.centerMap({ lat: 40.7128, lng: -74.0060 }); // 例如：NYC
    }
  
    private initMap(): void {
      const mapEl = document.getElementById('map') as HTMLElement;
      this.map = new google.maps.Map(mapEl, {
        center: { lat: 0, lng: 0 },
        zoom: 2
      });
    }
  
    private centerMap(coords: { lat: number; lng: number }): void {
      if (this.map) {
        this.map.setCenter(coords);
        this.map.setZoom(8);
      }
    }
  }
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
      // 等待 Maps API 載入
      if (typeof google !== 'undefined' && google.maps) {
        this.initMap();
      } else {
        // 如果 API 尚未載入，等待 window.initMap 被呼叫
        (window as any)['initMap'] = () => {
          this.initMap();
        };
      }
    }
    
    onSelectCountry(country: string): void {
      this.selectedCountry = country;
      
      // 使用地理編碼和地圖標記功能
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
        console.error('地圖尚未初始化');
        return;
      }
      
      // 移除先前的標記（如果有）
      if (this.marker) {
        this.marker.setMap(null);
      }
      
      // 首先嘗試使用預設的國家座標
      const normalizedCountry = countryName.toLowerCase();
      if (this.countryCoordinates[normalizedCountry]) {
        console.log(`使用預設座標標記 ${countryName}`);
        this.markLocation(
          this.countryCoordinates[normalizedCountry], 
          countryName,
          `${countryName} (預設座標)`
        );
        return;
      }
      
      // 如果預設座標不存在，嘗試使用 Geocoding API
      if (!google.maps.Geocoder) {
        console.error('Geocoder 服務不可用');
        return;
      }
      
      console.log(`嘗試地理編碼: ${countryName}`);
      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode(
        { 'address': countryName + ' country' }, // 添加 'country' 關鍵字提高成功率
        (results: any, status: any) => {
          if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
            console.log(`成功地理編碼 ${countryName}`);
            const location = results[0].geometry.location;
            const formattedAddress = results[0].formatted_address;
            
            this.markLocation(
              { lat: location.lat(), lng: location.lng() },
              countryName,
              formattedAddress
            );
          } else {
            console.error(`地理編碼失敗: ${status} for ${countryName}`);
            
            // 創建一個備用位置，如果沒有預設座標和地理編碼失敗
            const fallbackLocation = { lat: 0, lng: 0 };
            this.markLocation(
              fallbackLocation,
              countryName,
              `${countryName} (地理編碼失敗)`
            );
            
            // 顯示錯誤消息
            alert(`無法定位 "${countryName}"。使用通用位置代替。`);
          }
        }
      );
    }
    
    private markLocation(location: {lat: number, lng: number}, title: string, description: string): void {
      // 移動地圖中心
      this.map.setCenter(location);
      this.map.setZoom(5);
      
      // 創建新標記
      this.marker = new google.maps.Marker({
        map: this.map,
        position: location,
        title: title,
        animation: google.maps.Animation.DROP
      });
      
      // 獲取該國家的評分
      const countryRating = this.allCountryRatings.find(
        r => r.country.toLowerCase() === title.toLowerCase()
      );
      const ratingText = countryRating ? `評分: ${countryRating.avg_movie_rating}` : '';
      
      // 添加資訊視窗
      const contentString = `
        <div>
          <h3>${title}</h3>
          <p>${description}</p>
          <p>${ratingText}</p>
          <p>座標: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}</p>
        </div>
      `;
      
      const infoWindow = new google.maps.InfoWindow({
        content: contentString
      });
      
      // 點擊標記時顯示資訊視窗
      this.marker.addListener('click', () => {
        infoWindow.open(this.map, this.marker);
      });
      
      // 自動打開資訊視窗
      infoWindow.open(this.map, this.marker);
    }
  }
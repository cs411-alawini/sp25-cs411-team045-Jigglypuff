// src/app/flight-list/flight-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlightService, Flight } from '../services/flight.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-flight-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './flight-list.component.html',
  styleUrls: ['./flight-list.component.css']
})
// export class FlightListComponent implements OnInit {
//   origin = '';
//   flights: Flight[] = [];

//   constructor(private svc: FlightService) {}

//   ngOnInit() {
//     // optionally load default origin
//   }

//   load() {
//     if (!this.origin) return;
//     this.svc.getFlightsBeforeAvg(this.origin)
//       .subscribe(f => this.flights = f);
//   }
// }
// flight-list.component.ts
export class FlightListComponent implements OnInit {
    origins: string[] = [];
    origin = '';
    flights: Flight[] = [];
  
    constructor(private svc: FlightService) {}
  
    ngOnInit() {
      this.svc.getOrigins().subscribe(list => this.origins = list);
    }
  
    load() {
      if (!this.origin) return;
      this.svc.getFlightsBeforeAvg(this.origin)
        .subscribe(f => this.flights = f);
    }
  }
  

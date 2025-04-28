// src/app/services/flight.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Flight {
  tailnum: string;
  origin: string;
  dest: string;
  sched_dep_time: string;
  sched_arr_time: string;
  time: string;
  name: string;

}

@Injectable({ providedIn: 'root' })
export class FlightService {
  private apiUrl = 'http://localhost:3000/api/flights';

  constructor(private http: HttpClient) {}

  /** Call the stored procedure, pass in the origin, and retrieve the first 15 flights departing earlier than the average departure time. */
  getFlightsBeforeAvg(origin: string): Observable<Flight[]> {
    return this.http.get<Flight[]>(`${this.apiUrl}/beforeAvg/${origin}`);
  }
  getOrigins(): Observable<string[]> {
    return this.http.get<string[]>('http://localhost:3000/api/flights/origins');
  }
}

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
  // … 其他欄位
}

@Injectable({ providedIn: 'root' })
export class FlightService {
  private apiUrl = 'http://localhost:3000/api/flights';

  constructor(private http: HttpClient) {}

  /** 呼叫存程式，傳入 origin，拿到前 15 筆早於平均出發的航班 */
  getFlightsBeforeAvg(origin: string): Observable<Flight[]> {
    return this.http.get<Flight[]>(`${this.apiUrl}/beforeAvg/${origin}`);
  }
  getOrigins(): Observable<string[]> {
    return this.http.get<string[]>('http://localhost:3000/api/flights/origins');
  }
}

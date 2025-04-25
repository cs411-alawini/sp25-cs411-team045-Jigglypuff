import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { MovieDetailsComponent } from './movie-details/movie-details.component';
import { FlightListComponent } from './flight-list/flight-list.component';
import { LocationComponent } from './location/location.component';

export const routes: Routes = [
    {path: '', component: HomepageComponent},
    {path: 'movies/:id', component: MovieDetailsComponent},
    {path: 'flights', component: FlightListComponent },
    {path: 'locations', component: LocationComponent },
];

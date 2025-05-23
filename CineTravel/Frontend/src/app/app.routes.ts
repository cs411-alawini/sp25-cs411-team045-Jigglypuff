import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { MovieDetailsComponent } from './movie-details/movie-details.component';
import { FavoriteMoviesComponent } from './favorite-movies/favorite-movies.component'
import { FlightListComponent } from './flight-list/flight-list.component';
import { LocationComponent } from './location/location.component';
import { CityMovieBrowserComponent } from './city-movie-browser/city-movie-browser.component';

export const routes: Routes = [
    {path: '', component: HomepageComponent},
    {path: 'movies/:id', component: MovieDetailsComponent},
    {path: 'favorites', component: FavoriteMoviesComponent },
    {path: 'flights', component: FlightListComponent },
    {path: 'locations', component: LocationComponent },
    {path: 'city-browser', component: CityMovieBrowserComponent },

];

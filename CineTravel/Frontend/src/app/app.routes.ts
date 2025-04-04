import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { MovieDetailsComponent } from './movie-details/movie-details.component';

export const routes: Routes = [
    {path: '', component: HomepageComponent},
    {path: 'movies/:id', component: MovieDetailsComponent},
];

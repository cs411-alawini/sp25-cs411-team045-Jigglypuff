// import { bootstrapApplication } from '@angular/platform-browser';
//import { appConfig } from './app/app.config';
// import { AppComponent } from './app/app.component';
// import { RouterModule } from '@angular/router';
// import { routes } from './app/app.routes';
// import { MovieDetailsComponent } from './app/movie-details/movie-details.component';
// import { importProvidersFrom } from '@angular/core';
// import { provideHttpClient } from '@angular/common/http';
// import { provideRouter } from '@angular/router';

// bootstrapApplication(AppComponent, {
//   providers: [
//     importProvidersFrom(RouterModule.forRoot(routes)),
//     provideHttpClient(),
//     provideRouter(routes)
//   ],
// }).catch((err) => console.error(err));
import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    // 註冊 Router
    provideRouter(routes),
    // HttpClient
    provideHttpClient(),
    importProvidersFrom(FormsModule)
  ]
}).catch(err => console.error(err));

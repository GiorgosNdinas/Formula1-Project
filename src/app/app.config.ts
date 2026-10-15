/**
 * Configures routing, HTTP requests and animations for the browser application.
 */
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import {
  provideRouter,
  withHashLocation,
  withInMemoryScrolling
} from '@angular/router';

import { routes } from './app.routes';
import {
  HttpClientModule,
  provideHttpClient,
  withFetch
} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withHashLocation(),
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled'
      })
    ),
    provideHttpClient(withFetch()),
    importProvidersFrom(HttpClientModule),
    provideAnimations()
  ]
};

/**
 * Defines routes used by hash navigation on GitHub Pages.
 */
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { WinnersComponent } from './pages/winners/winners.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'results',
    // Load circuit metadata only when the visitor opens results or credits.
    loadComponent: () =>
      import('./pages/results/results.component').then(
        module => module.ResultsComponent
      )
  },
  {
    path: 'circuit-credits',
    loadComponent: () =>
      import('./pages/circuit-credits/circuit-credits.component').then(
        module => module.CircuitCreditsComponent
      )
  },
  {
    path: 'winners',
    component: WinnersComponent
  }
];

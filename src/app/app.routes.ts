import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ResultsComponent } from './pages/results/results.component';
import { WinnersComponent } from './pages/winners/winners.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'results',
    component: ResultsComponent
  },
  {
    path: 'winners',
    component: WinnersComponent
  }
];

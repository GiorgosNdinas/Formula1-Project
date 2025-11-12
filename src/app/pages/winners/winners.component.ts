import { Component, Signal, computed } from '@angular/core';

import { F1ApiService } from '../../servicies/f1-api.service';

import { CommonModule } from '@angular/common';
import { ToolbarModule } from 'primeng/toolbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SeasonSelectorComponent } from '../../components/selector/season-selector.component';
import { TableComponent } from "../../components/table/table.component";

@Component({
  selector: 'app-season-podium',
  standalone: true,
  imports: [],
  template: `
  @if (this.f1ApiService.f1Standings()?.DriverStandings) {
  <div class="podium-container">
    <div class="podium">
      <!-- SECOND PLACE -->
      <div class="podium-place second">
        <div class="driver-img">
          <img [src]="this.getDriverImg(this.f1ApiService.f1Standings()?.DriverStandings![1].Driver.familyName)" 
               (error)="handleMissingImage($event)" alt="2nd place" />
        </div>
        <div class="driver-info">
          <h1>2. {{this.f1ApiService.f1Standings()?.DriverStandings![1].Driver.givenName}} {{this.f1ApiService.f1Standings()?.DriverStandings![1].Driver.familyName}}</h1>
          <h3>{{this.f1ApiService.f1Standings()?.DriverStandings![1].Constructors[0].name}}</h3>
          <div class="stats">
            <span>Points: {{this.f1ApiService.f1Standings()?.DriverStandings![1].points}}</span>
            <span>Wins: {{this.f1ApiService.f1Standings()?.DriverStandings![1].wins}}</span>
          </div>
        </div>
      </div>

      <!-- FIRST PLACE -->
      <div class="podium-place first">
        <div class="driver-img">
          <img [src]="this.getDriverImg(this.f1ApiService.f1Standings()?.DriverStandings![0].Driver.familyName)" 
               (error)="handleMissingImage($event)" alt="1st place" />
        </div>
        <div class="driver-info">
          <h1>1. {{this.f1ApiService.f1Standings()?.DriverStandings![0].Driver.givenName}} {{this.f1ApiService.f1Standings()?.DriverStandings![0].Driver.familyName}}</h1>
          <h3>{{this.f1ApiService.f1Standings()?.DriverStandings![0].Constructors[0].name}}</h3>
          <div class="stats">
            <span>Points: {{this.f1ApiService.f1Standings()?.DriverStandings![0].points}}</span>
            <span>Wins: {{this.f1ApiService.f1Standings()?.DriverStandings![0].wins}}</span>
          </div>
        </div>
      </div>

      <!-- THIRD PLACE -->
      <div class="podium-place third">
        <div class="driver-img">
          <img [src]="this.getDriverImg(this.f1ApiService.f1Standings()?.DriverStandings![2].Driver.familyName)" 
               (error)="handleMissingImage($event)" alt="3rd place" />
        </div>
        <div class="driver-info">
          <h1>3. {{this.f1ApiService.f1Standings()?.DriverStandings![2].Driver.givenName}} {{this.f1ApiService.f1Standings()?.DriverStandings![2].Driver.familyName}}</h1>
          <h3>{{this.f1ApiService.f1Standings()?.DriverStandings![2].Constructors[0].name}}</h3>
          <div class="stats">
            <span>Points: {{this.f1ApiService.f1Standings()?.DriverStandings![2].points}}</span>
            <span>Wins: {{this.f1ApiService.f1Standings()?.DriverStandings![2].wins}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
}

  `,
  styles: `
.podium-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  min-height: 70vh;
  background: linear-gradient(180deg, #0d0d0d 0%, #1a1a1a 100%);
  color: white;
}

.podium {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 1.5rem;
  flex-wrap: wrap;
  width: 100%;
  max-width: 1000px;
}

.podium-place {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  text-align: center;
  padding: 1rem;
  flex: 1 1 250px;
  max-width: 300px;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6);
  }

  .driver-img img {
    width: 100%;
    border-radius: 1rem;
    object-fit: cover;
  }

  .driver-info {
    margin-top: 0.75rem;

    h1 {
      font-weight: 500;
      font-size: 1.2rem;
      margin: 0.5rem 0;
    }

    h3 {
      font-weight: 400;
      color: black;
      margin-bottom: 0.5rem;
    }

    .stats {
      display: flex;
      justify-content: center;
      gap: 1.2rem;
      font-size: 0.9rem;
      color: black;
    }
  }
}

/* Podium level adjustments */
.first {
  order: 2;
  transform: translateY(-20px);
  background: linear-gradient(145deg, #f6d365, #fda085);
}

.second {
  order: 1;
  background: linear-gradient(145deg, #cfd9df, #e2ebf0);
}

.third {
  order: 3;
  background: linear-gradient(145deg, #f3a683, #f7d794);
}

/* Responsive */
@media (max-width: 850px) {
  .podium {
    flex-direction: column;
    align-items: center;
  }

  .podium-place {
    transform: none !important;
    max-width: 90%;
  }

  .first {
    order: 1;
  }
  .second {
    order: 2;
  }
  .third {
    order: 3;
  }
}


  `
})
export class SeasonPodiumComponent {

  constructor(public f1ApiService: F1ApiService) {
  }

  // Returns the path of the driver image
  getDriverImg(name: string): string {
    return `assets/drivers/${name}.webp`;
  }

  handleMissingImage(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/drivers/Default.webp';
  }
}


@Component({
  selector: 'app-winners',
  standalone: true,
  imports: [CommonModule, ToolbarModule, ProgressSpinnerModule, TableComponent, SeasonSelectorComponent, SeasonPodiumComponent],
  template: `
    <!-- Toolbar section for displaying F1 winners -->
    <p-toolbar [class.table-container-blur]="this.f1ApiService.winnersAreLoading">
      <!-- Left-aligned group in the toolbar -->
      <div class="p-toolbar-group-start">
        <!-- Heading for the F1 winners section -->
        <h1>F1 winners</h1>
      </div>
      <!-- Right-aligned group in the toolbar -->
      <div class="p-toolbar-group-end">
        <!-- Custom component for selecting the season -->
        <h3 style="font-weight: 500; margin-right: 10px;">Select season:</h3>
        <app-season-selector></app-season-selector>
      </div>
    </p-toolbar>

    <!-- Conditional rendering of winners table and spinner -->
    @if (this.f1ApiService.f1Standings()) {
      <!-- Season winners podium -->
      <app-season-podium [class.table-container-blur]="this.f1ApiService.winnersAreLoading"></app-season-podium>
      <!-- Winners table section -->
      <app-table tableFor="winners" [class.table-container-blur]="this.f1ApiService.winnersAreLoading"></app-table>

      <!-- Spinner animation section -->
      @if (this.f1ApiService.winnersAreLoading) {
        <!-- Card container for displaying a spinner during loading -->
        <div class="card flex justify-content-center spinner-container">
          <!-- PrimeNG progress spinner component -->
          <p-progressSpinner styleClass="w-4rem h-4rem" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s"></p-progressSpinner>
        </div>
      }
    }
    `,
  styleUrl: './winners.component.scss'
})
export class WinnersComponent {
  constructor(public f1ApiService: F1ApiService) {
  }
}


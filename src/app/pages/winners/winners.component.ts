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
    @if(this.f1ApiService.f1Standings()?.DriverStandings){
      <div class="container">
        <div class="second-place">
          <div class="driver-img">
            <img [src]="this.getDriverImg(this.f1ApiService.f1Standings()?.DriverStandings![1].Driver.familyName)" (error)="handleMissingImage($event)" alt="2nd place">
          </div>
          <div class="driver-info">
            <h1>2. {{this.f1ApiService.f1Standings()?.DriverStandings![1].Driver.givenName}} {{this.f1ApiService.f1Standings()?.DriverStandings![1].Driver.familyName}} </h1>
            <h3>{{this.f1ApiService.f1Standings()?.DriverStandings![1].Constructors[0].name}}</h3>
            <h2>Points: {{this.f1ApiService.f1Standings()?.DriverStandings![1].points}}</h2>
            <h2>Wins: {{this.f1ApiService.f1Standings()?.DriverStandings![1].wins}}</h2>
          </div>
        </div>
        <div class="first-place">
          <div class="driver-img">
            <img [src]="this.getDriverImg(this.f1ApiService.f1Standings()?.DriverStandings![0].Driver.familyName)"  (error)="handleMissingImage($event)" alt="1st place">
          </div>
          <div class="driver-info">
            <h1>1. {{this.f1ApiService.f1Standings()?.DriverStandings![0].Driver.givenName}} {{this.f1ApiService.f1Standings()?.DriverStandings![0].Driver.familyName}}</h1>
            <h3>{{this.f1ApiService.f1Standings()?.DriverStandings![0].Constructors[0].name}}</h3>
            <h2>Points: {{this.f1ApiService.f1Standings()?.DriverStandings![0].points}}</h2>
            <h2>Wins: {{this.f1ApiService.f1Standings()?.DriverStandings![0].wins}}</h2>
          </div>
        </div>
        <div class="third-place">
        <div class="driver-img">
          <img [src]="this.getDriverImg(this.f1ApiService.f1Standings()?.DriverStandings![2].Driver.familyName)" (error)="handleMissingImage($event)" alt="3rd place">
        </div>
        <div class="driver-info">
            <h1>3. {{this.f1ApiService.f1Standings()?.DriverStandings![2].Driver.givenName}} {{this.f1ApiService.f1Standings()?.DriverStandings![2].Driver.familyName}} </h1>
            <h3>{{this.f1ApiService.f1Standings()?.DriverStandings![2].Constructors[0].name}}</h3>          
            <h2>Points: {{this.f1ApiService.f1Standings()?.DriverStandings![2].points}}</h2>
            <h2>Wins: {{this.f1ApiService.f1Standings()?.DriverStandings![2].wins}}</h2>
          </div>
        </div>
      </div>  
    }
  `,
  styles: `
    .container {
      background: black;
      color: white;
      border: 1px solid;
      display: flex;
      align-items: end;
      justify-content: space-around;
      height: 60vh;
    }

    .first-place,
    .second-place,
    .third-place {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-direction: column;
      border: 1px solid;
      width: 30%;
      max-width: 400px;
      margin-top: 15px;
      margin-bottom: 5px;
      text-align: center;
    }

    .first-place {
      height: 95%;
    }

    .second-place {
      height: 90%;
    }

    .third-place {
      height: 85%;
    }

    .driver-img img {
      height: 200px;
    }

    .driver-info h1{
      font-weight: 300;
      font-size: 25px;
      margin-bottom: 0px;
    }

    .driver-info h2 {
      font-weight: 300;
      font-size: 20px;
      margin-bottom: 5px;
    }

    .driver-info h3 {
      font-weight: 200;
      font-size: 15px;
      margin-top: 5px;
    }

    @media only screen and (max-width: 720px) {
      .driver-img img {
        height: 130px;
      }
    }
  `
})
export class SeasonPodiumComponent {
  
  constructor(public f1ApiService: F1ApiService){
  }

  // Returns the path of the driver image
  getDriverImg(name: string): string{
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


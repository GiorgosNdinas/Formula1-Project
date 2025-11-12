import { Component, Signal, computed } from '@angular/core';

import { TableComponent } from "../../components/table/table.component";
import { SeasonSelectorComponent } from '../../components/selector/season-selector.component';
import { F1ApiService } from '../../servicies/f1-api.service';

import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { PanelModule } from 'primeng/panel';


@Component({
  selector: 'app-round-selector',
  standalone: true,
  imports: [DropdownModule, FormsModule],
  template: `
  <p-dropdown [options]="this.f1ApiService.f1Rounds()?.MRData?.RaceTable?.Races"
  [(ngModel)]="this.selectedRound" optionLabel="round" (onChange)="changeSeason($event)" [disabled]="this.f1ApiService.resultsAreLoading">
    <ng-template pTemplate="selectedItem">
      <div class="flex align-items-center gap-2">
          <div>{{ this.f1ApiService.selectedRound() }}</div>
      </div>
    </ng-template>
    <ng-template let-round pTemplate="item">
      <div class="flex align-items-center gap-2">
        <div>{{ round.round }}</div>
      </div>
    </ng-template>
  </p-dropdown>
  `,
})
export class RoundSelectorComponent {
  selectedRound = this.f1ApiService.selectedRound();
  constructor(public f1ApiService: F1ApiService) { }

  changeSeason(event: any) {
    this.f1ApiService.selectedRound.set(String(event.value.round));
  }
}


@Component({
  selector: 'app-round-template',
  standalone: true,
  imports: [PanelModule, RoundSelectorComponent],
  template: `
  <!-- Panel component with a fixed header and content -->
  <p-panel [toggleable]="false">
  
    <!-- Header template -->
    <ng-template pTemplate="header">
      <!-- Flex container for alignment -->
      <div class="flex align-items-center gap-2">
        <!-- Display selected round and total number of rounds -->
        <span class="font-bold">Round: <app-round-selector></app-round-selector> /{{this.f1ApiService.f1Rounds()?.MRData?.RaceTable?.Races?.length}}</span>
      </div>
    </ng-template>

    <!-- Icons template -->
    <ng-template pTemplate="icons">
      <!-- Loop through races to display country flag for the selected round -->
      @for(race of this.f1ApiService.f1Rounds()?.MRData?.RaceTable?.Races; track $index){
        @if(race.round === this.f1ApiService.selectedRound()){
          <img [src]="this.getImagePath(race.Circuit.Location.country)" alt="">          
          <!-- <span class="font-bold">{{race.Circuit.Location.country}} Flag</span> -->
        }
      }
    </ng-template>

    <!-- Content template -->
    @for (race of this.f1ApiService.f1Rounds()?.MRData?.RaceTable?.Races; track $index) {
      @if (race.round === this.f1ApiService.selectedRound()) {
        <!-- Grand Prix information section -->
        <div class='grand-prix-info'>
          <!-- First column: Race and circuit details -->
          <div>
            <h1>{{race.season}} {{race.raceName}}</h1>
            <h2>{{race.Circuit.circuitName}}</h2>
          </div>
          <!-- Second column: Location and date details -->
          <div>
            <h1>{{race.Circuit.Location.locality}},{{race.Circuit.Location.country}} </h1>
            <h2>Date: {{race.date}}</h2>
          </div>
        </div>
        <!-- {{race.url}} -->
      }
    }
  </p-panel>
  `,
  styles: `
    .grand-prix-info {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      font-size: 10px;
    }

    @media (max-width: 850px) {
      .grand-prix-info {
        font-size: 8px;
        flex-direction: column;
        gap: 10px;
      }
    }
  `
})
export class RoundTemplateComponent {
  selectedRound = this.f1ApiService.selectedRound();

  constructor(public f1ApiService: F1ApiService) { }

  getImagePath(name: string): string {
    return `assets/flags/${name}.webp`
  }
}



@Component({
  selector: 'app-results',
  standalone: true,
  template: `
      <!-- Toolbar section for displaying race results -->
      <p-toolbar [class.table-container-blur]="this.f1ApiService.resultsAreLoading">
        <!-- Left-aligned group in the toolbar -->
        <div class="p-toolbar-group-start">
          <!-- Heading for the race results section -->
          <h1>Race results</h1>
        </div>
        <!-- Right-aligned group in the toolbar -->
        <div class="p-toolbar-group-end">
          <h3 style="font-weight: 500; margin-right: 10px;">Select season:</h3>
          <!-- Custom component for selecting the season -->
          <app-season-selector></app-season-selector>
        </div>
      </p-toolbar>

      <!-- Card section for the round template -->
      <div class="card" [class.table-container-blur]="this.f1ApiService.resultsAreLoading">
        <!-- Custom component for displaying and selecting a round -->
        <app-round-template></app-round-template>
      </div>

      <!-- Card section for the race results table -->
      <div class="card" [class.table-container-blur]="this.f1ApiService.resultsAreLoading">
        <!-- Custom component for displaying race results (table) -->
        <app-table tableFor="results"></app-table>
      </div>

      <!-- Spinner animation section -->
      @if (this.f1ApiService.resultsAreLoading) {
        <!-- Card container for displaying a spinner during loading -->
        <div class="card flex justify-content-center spinner-container">
          <!-- PrimeNG progress spinner component -->
          <p-progressSpinner styleClass="w-4rem h-4rem" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s"></p-progressSpinner>
        </div>
      }
    `,
  styleUrl: './results.component.scss',
  imports: [ToolbarModule, ProgressSpinnerModule, RoundTemplateComponent, TableComponent, SeasonSelectorComponent]
})
export class ResultsComponent {
  constructor(public f1ApiService: F1ApiService) {
  }
}

import { Component, computed } from '@angular/core';


import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { F1ApiService } from '../../servicies/f1-api.service';

@Component({
  selector: 'app-season-selector',
  standalone: true,
  imports: [DropdownModule, FormsModule],
  template: `
    @if(this.selectedSeason){
      <p-dropdown [options]="this.seasons()?.reverse()"
        [(ngModel)]="this.selectedSeason" optionLabel="season" (onChange)="onSeasonSelected($event)" [disabled]="this.f1ApiService.resultsAreLoading && this.f1ApiService.winnersAreLoading">
        <ng-template pTemplate="selectedItem">
          <div class="flex align-items-center gap-2">
            <div>{{ this.f1ApiService.selectedSeason() }}</div>
          </div>
        </ng-template>
        <ng-template let-season pTemplate="item">
          <div class="flex align-items-center gap-2">
            <div>{{ season.season }}</div>
          </div>
        </ng-template>
      </p-dropdown>
    }
  `
})
export class SeasonSelectorComponent {
  seasons = computed(() => {
    return this.f1ApiService.f1Seasons()?.MRData.SeasonTable.Seasons;
  });

  selectedSeason = this.f1ApiService.selectedSeason();

  constructor(public f1ApiService: F1ApiService) {
  }
 
  // Method to handle the selection change event.
  onSeasonSelected(event: any): void {
    this.f1ApiService.selectedSeason.set(event.value.season);
  }
}

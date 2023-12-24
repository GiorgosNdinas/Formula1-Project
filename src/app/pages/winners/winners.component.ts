import { Component } from '@angular/core';

import { F1ApiService } from '../../servicies/f1-api.service';


import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ToolbarModule } from 'primeng/toolbar';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-selector',
  standalone: true,
  imports: [DropdownModule, FormsModule],
  template: `
    @if(this.f1ApiService.selectedSeason()) {
      <div class="selector-container">
      <label for="options">Select a season:</label>
      <div class="custom-select">
        <select [(ngModel)]="this.selectedSeason" (change)="onSeasonSelected($event)" id="options" name="options">
          @for(season of this.seasons; track $index){
            <option [value]="season.season">{{season.season}}</option>
          }
        </select>
      <div class="select-icon">&#9660;</div>
      </div>
    </div>
    }
  `,
  styles: `
    .selector-container {
      text-align: center;
    }

    label {
        font-size: 18px;
        margin-right: 8px;
    }

    .custom-select {
        position: relative;
        display: inline-block;
    }

    select {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        width: 200px;
        padding: 10px;
        font-size: 16px;
        border: 1px solid #ccc;
        border-radius: 4px;
        outline: none;
        cursor: pointer;
    }

    .select-icon {
        position: absolute;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
        pointer-events: none;
        color: #666;
    }

    /* Style for the arrow in the dropdown */
    .custom-select::after {
        position: absolute;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
        pointer-events: none;
        color: #666;
        transition: transform 0.3s ease;
    }

    /* Style for the arrow when dropdown is open */
    .custom-select.open::after {
        transform: translateY(-50%) rotate(180deg);
    }

    /* Style for the dropdown options */
    select option {
        padding: 10px;
        background-color: #fff;
        color: #333;
        border: none;
    }

    /* Style for the selected option */
    select option:checked {
        background-color: #007BFF;
        color: #fff;
    } 
`
})
export class SelectorComponent {
  seasons = this.f1ApiService.f1Seasons()?.MRData.SeasonTable.Seasons.reverse();

  selectedSeason = this.f1ApiService.selectedSeason();

  constructor(public f1ApiService: F1ApiService) {}

  // Method to handle the selection change event
  onSeasonSelected(event: any): void {
    this.f1ApiService.selectedSeason.set(event.target.value)
    console.log('Selected season', event.target.value);
  }
}





@Component({
  selector: 'app-winners',
  standalone: true,
  imports: [ButtonModule, TableModule, CommonModule, ToolbarModule, SelectorComponent],
  templateUrl: './winners.component.html',
  styleUrl: './winners.component.scss'
})
export class WinnersComponent {
  constructor(public f1ApiService: F1ApiService) {
  }

  changeSeason() {
    // Increment the count by 1.
    this.f1ApiService.selectedSeason.set('2020');
  }

}


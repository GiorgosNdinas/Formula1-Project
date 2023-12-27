import { Component, OnInit } from '@angular/core';


import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { F1ApiService } from '../../servicies/f1-api.service';

@Component({
  selector: 'app-selector',
  standalone: true,
  imports: [DropdownModule, FormsModule],
  templateUrl: './selector.component.html',
  styleUrl: './selector.component.scss'
})
export class SelectorComponent {
  seasons = this.f1ApiService.f1Seasons()?.MRData.SeasonTable.Seasons.reverse();

  selectedSeason = this.f1ApiService.selectedSeason();

  constructor(public f1ApiService: F1ApiService) {
  }
 
  // Method to handle the selection change event
  onSeasonSelected(event: any): void {
    this.f1ApiService.selectedSeason.set(event.value.season);
  }
}

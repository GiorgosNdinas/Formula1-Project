import { Component } from '@angular/core';

import { F1ApiService } from '../../servicies/f1-api.service';


import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ToolbarModule } from 'primeng/toolbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectorComponent } from '../../components/selector/selector.component';
import { DialogModule } from 'primeng/dialog';




@Component({
  selector: 'app-winners',
  standalone: true,
  imports: [ButtonModule, TableModule, CommonModule, ToolbarModule, SelectorComponent, ProgressSpinnerModule, DialogModule],
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


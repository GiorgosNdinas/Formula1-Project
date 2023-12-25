import { Component, OnInit } from '@angular/core';
import { SelectorComponent } from '../../components/selector/selector.component';

import { F1ApiService } from '../../servicies/f1-api.service';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';



@Component({
  selector: 'app-results',
  standalone: true,
  imports: [ButtonModule, ToolbarModule, SelectorComponent, CardModule, TableModule, ProgressSpinnerModule],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss'
})
export class ResultsComponent {



  constructor(public f1ApiService: F1ApiService) { 
  }

  changeSeason(){
    // Increment the count by 1.
    this.f1ApiService.selectedSeason.update(value => '2022');
  }

}

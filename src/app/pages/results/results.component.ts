import { Component, OnInit } from '@angular/core';
import { SelectorComponent } from '../../components/selector/selector.component';

import { F1ApiService } from '../../servicies/f1-api.service';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { stringify } from 'querystring';



@Component({
  selector: 'app-results',
  standalone: true,
  imports: [ButtonModule, ToolbarModule, SelectorComponent, CardModule, TableModule, ProgressSpinnerModule, DropdownModule, FormsModule],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss'
})
export class ResultsComponent {
  selectedRound = this.f1ApiService.selectedRound();
  constructor(public f1ApiService: F1ApiService) { 
  }

  changeSeason(event: any){
    console.log('Here', this.f1ApiService.f1Rounds()?.MRData?.RaceTable.Races);
    this.f1ApiService.selectedRound.set(String(event.value.round));
  }

}

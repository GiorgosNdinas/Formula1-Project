import { Component, Signal, computed } from '@angular/core';
import { SelectorComponent } from '../../components/selector/selector.component';

import { F1ApiService } from '../../servicies/f1-api.service';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { Results } from '../../models/f1-race-results.model';


@Component({
  selector: 'app-round-selector',
  standalone: true,
  imports: [DropdownModule, FormsModule],
  template: `
  <p-dropdown [options]="this.f1ApiService.f1Rounds()?.MRData?.RaceTable?.Races"
  [(ngModel)]="this.selectedRound" optionLabel="round" (onChange)="changeSeason($event)">
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
  <p-panel [toggleable]="false">
    <ng-template pTemplate="header">
        <div class="flex align-items-center gap-2">
            <span class="font-bold">Round: <app-round-selector></app-round-selector> /{{this.f1ApiService.f1Rounds()?.MRData?.RaceTable?.Races?.length}}</span>
        </div>
    </ng-template>
    <ng-template pTemplate="icons">
      @for(race of this.f1ApiService.f1Rounds()?.MRData?.RaceTable?.Races; track $index){
        @if(race.round === this.f1ApiService.selectedRound()){
          <img [src]="this.getImagePath(race.Circuit.Location.country)" alt="">          
          <!-- <span class="font-bold">{{race.Circuit.Location.country}} Flag</span> -->
        }
      }
    </ng-template>
    @for (race of this.f1ApiService.f1Rounds()?.MRData?.RaceTable?.Races; track $index) {
    @if (race.round === this.f1ApiService.selectedRound()) {      
      <div class='grand-prix-info'>
        <div>
          <h1>{{race.season}} {{race.raceName}}</h1>
          <h2>{{race.Circuit.circuitName}}</h2>
        </div>
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
  imports: [ButtonModule, ToolbarModule, SelectorComponent, CardModule, TableModule, ProgressSpinnerModule, DropdownModule, FormsModule, RoundTemplateComponent],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss'
})
export class ResultsComponent {
  races: Signal<Results[] | undefined> = computed(() => {
    return this.f1ApiService.f1RaceResults()?.MRData?.RaceTable?.Races[0].Results
  });
  constructor(public f1ApiService: F1ApiService) {
  }


}

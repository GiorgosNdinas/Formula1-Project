import { Component } from '@angular/core';

import { F1ApiService } from '../../servicies/f1-api.service';

import { CommonModule } from '@angular/common';
import { ToolbarModule } from 'primeng/toolbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SeasonSelectorComponent } from '../../components/selector/season-selector.component';
import { TableComponent } from "../../components/table/table.component";




@Component({
    selector: 'app-winners',
    standalone: true,
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
        <app-season-selector></app-season-selector>
      </div>
    </p-toolbar>

    <!-- Conditional rendering of winners table and spinner -->
    @if (this.f1ApiService.f1Standings()) {
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
    styleUrl: './winners.component.scss',
    imports: [CommonModule, ToolbarModule, ProgressSpinnerModule, TableComponent, SeasonSelectorComponent]
})
export class WinnersComponent {
  constructor(public f1ApiService: F1ApiService) {
  }
}


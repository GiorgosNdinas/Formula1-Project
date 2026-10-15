import { Component, computed } from '@angular/core';

import { TableComponent } from '../../components/table/table.component';
import { SeasonSelectorComponent } from '../../components/selector/season-selector.component';
import { F1ApiService } from '../../servicies/f1-api.service';

import { ToolbarModule } from 'primeng/toolbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { CircuitLayoutComponent } from '../../components/circuit-layout/circuit-layout.component';

/**
 * Coordinates round selection, race information, results and loading/error states.
 */
@Component({
  selector: 'app-round-selector',
  standalone: true,
  imports: [DropdownModule, FormsModule],
  template: `
    <p-dropdown
      [options]="this.f1ApiService.f1Rounds()?.MRData?.RaceTable?.Races"
      [(ngModel)]="this.selectedRound"
      optionLabel="round"
      ariaLabel="Select race round"
      (onChange)="changeSeason($event)"
      [disabled]="this.f1ApiService.resultsAreLoading">
      <ng-template pTemplate="selectedItem">
        <div class="flex align-items-center gap-2">
          <div>{{ this.f1ApiService.selectedRound() }}</div>
        </div>
      </ng-template>
      <ng-template
        let-round
        pTemplate="item">
        <div class="flex align-items-center gap-2">
          <div>{{ round.round }}</div>
        </div>
      </ng-template>
    </p-dropdown>
  `
})
export class RoundSelectorComponent {
  selectedRound = this.f1ApiService.selectedRound();
  constructor(public f1ApiService: F1ApiService) {}

  changeSeason(event: any) {
    this.f1ApiService.selectedRound.set(String(event.value.round));
  }
}

/**
 * Shows the selected race in three columns: race details, verified layout and location.
 * The selected race is derived once from the existing Jolpica response.
 */
@Component({
  selector: 'app-round-template',
  standalone: true,
  imports: [RoundSelectorComponent, CircuitLayoutComponent],
  template: `
    <section
      class="race-information"
      aria-label="Selected Grand Prix information">
      <div class="race-details">
        <div class="round-control">
          <span>Round:</span>
          <app-round-selector></app-round-selector>
          <span>/ {{ rounds().length }}</span>
        </div>
        @if (race(); as selected) {
          <h2>{{ selected.season }} {{ selected.raceName }}</h2>
          <p>{{ selected.Circuit.circuitName }}</p>
        }
      </div>
      <div class="race-layout">
        @if (race(); as selected) {
          <app-circuit-layout
            [circuitId]="selected.Circuit.circuitId"
            [circuitName]="selected.Circuit.circuitName"
            [season]="selected.season"
            [round]="selected.round"></app-circuit-layout>
        }
      </div>
      <div class="race-location">
        @if (race(); as selected) {
          @if (visibleFlag() !== flagUrl()) {
            <img
              [src]="flagUrl()"
              [alt]="selected.Circuit.Location.country + ' flag'"
              width="48"
              height="32"
              (error)="hideFlag(flagUrl())" />
          }
          <h2>
            {{ selected.Circuit.Location.locality }},
            {{ selected.Circuit.Location.country }}
          </h2>
          <p>Date: {{ selected.date }}</p>
        }
      </div>
    </section>
  `,
  styles: `
    .race-information {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(180px, 320px) minmax(0, 1fr);
      gap: 24px;
      align-items: center;
      padding: 18px 28px;
      background: #151414;
      color: white;
    }
    .round-control {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 24px;
    }
    h2 {
      font-size: 1.1rem;
      line-height: 1.5;
      margin: 0 0 8px;
      overflow-wrap: anywhere;
    }
    p {
      font-size: 0.9rem;
      line-height: 1.5;
      margin: 0;
    }
    .race-location {
      text-align: right;
    }
    .race-location img {
      object-fit: contain;
      margin-bottom: 22px;
    }
    .race-layout {
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      // Include both the drawing and its wrapping attribution in the grid row.
      align-self: center;
    }
    @media (max-width: 900px) {
      .race-information {
        grid-template-columns: minmax(0, 1fr) minmax(160px, 240px) minmax(
            0,
            1fr
          );
        padding: 20px;
        gap: 16px;
      }
    }
    @media (max-width: 650px) {
      .race-information {
        grid-template-columns: minmax(0, 1fr);
        gap: 20px;
      }
      .race-location {
        text-align: left;
      }
      .race-location img {
        margin-bottom: 12px;
      }
      .round-control {
        margin-bottom: 16px;
      }
    }
  `
})
export class RoundTemplateComponent {
  readonly rounds = computed(
    () => this.f1ApiService.f1Rounds()?.MRData?.RaceTable.Races ?? []
  );
  readonly race = computed(() =>
    this.rounds().find(race => race.round === this.f1ApiService.selectedRound())
  );
  readonly flagUrl = computed(() => {
    const country = this.race()?.Circuit.Location.country;
    return country ? `assets/flags/${country}.webp` : '';
  });
  private failedFlag = '';

  constructor(public f1ApiService: F1ApiService) {}

  /** Preserve the text location when an optional country flag is unavailable. */
  visibleFlag(): string {
    return this.failedFlag;
  }
  hideFlag(url: string): void {
    this.failedFlag = url;
  }
}

@Component({
  selector: 'app-results',
  standalone: true,
  template: `
    <!-- Toolbar section for displaying race results -->
    <p-toolbar
      [class.table-container-blur]="this.f1ApiService.resultsAreLoading">
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

    @if (this.f1ApiService.resultsError()) {
      <p
        class="notice"
        role="status">
        {{ this.f1ApiService.resultsError() }}
      </p>
    }
    @if (this.f1ApiService.scheduleError()) {
      <p
        class="notice"
        role="status">
        {{ this.f1ApiService.scheduleError() }}
      </p>
    }
    <!-- Card section for the round template -->
    <div
      class="card"
      [class.table-container-blur]="this.f1ApiService.resultsAreLoading">
      <!-- Custom component for displaying and selecting a round -->
      <app-round-template></app-round-template>
    </div>

    <!-- Card section for the race results table -->
    <div
      class="card"
      [class.table-container-blur]="this.f1ApiService.resultsAreLoading">
      <!-- Custom component for displaying race results (table) -->
      <app-table tableFor="results"></app-table>
    </div>

    <!-- Spinner animation section -->
    @if (this.f1ApiService.resultsAreLoading) {
      <!-- Card container for displaying a spinner during loading -->
      <div class="card flex justify-content-center spinner-container">
        <!-- PrimeNG progress spinner component -->
        <p-progressSpinner
          styleClass="w-4rem h-4rem"
          strokeWidth="8"
          fill="var(--surface-ground)"
          animationDuration=".5s"></p-progressSpinner>
      </div>
    }
  `,
  styleUrl: './results.component.scss',
  imports: [
    ToolbarModule,
    ProgressSpinnerModule,
    RoundTemplateComponent,
    TableComponent,
    SeasonSelectorComponent
  ]
})
export class ResultsComponent {
  constructor(public f1ApiService: F1ApiService) {}
}

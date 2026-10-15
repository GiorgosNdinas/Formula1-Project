import { Component, Input, Signal, computed } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { F1ApiService } from '../../servicies/f1-api.service';
import { Results } from '../../models/f1-race-results.model';

/**
 * Displays race results or standings below the podium using shared API state.
 */
@Component({
  selector: 'app-table',
  standalone: true,
  imports: [TableModule, ButtonModule],
  template: `
    @if (
      this.tableFor === 'results' ||
      this.f1ApiService.f1Standings()?.DriverStandings
    ) {
      <!-- Common part for both 'results' and 'winners' -->
      <div
        class="card"
        [class.table-container-blur]="
          this.tableFor === 'results'
            ? this.f1ApiService.resultsAreLoading
            : this.f1ApiService.winnersAreLoading
        ">
        <p-table
          [paginator]="true"
          [rows]="this.tableFor === 'results' ? 5 : 10"
          [showCurrentPageReport]="true"
          [tableStyle]="{ 'min-width': '36rem' }"
          [value]="
            this.tableFor === 'results'
              ? this.races()!
              : this.f1ApiService
                  .f1Standings()
                  ?.DriverStandings!.slice(
                    3,
                    this.f1ApiService.f1Standings()?.DriverStandings!.length
                  )
          "
          class="table-container">
          <!-- Header template for the table columns -->
          <ng-template
            pTemplate="header"
            let-columns>
            <tr>
              <th>Position</th>
              <th>Name</th>
              <th>Surname</th>
              <th>Constructor</th>
              <th>Points</th>
            </tr>
          </ng-template>

          <!-- Body template for displaying individual results or winners -->
          <ng-template
            pTemplate="body"
            let-item>
            <tr>
              <td>{{ item.position }}</td>
              <td>{{ item.Driver.givenName }}</td>
              <td>{{ item.Driver.familyName }}</td>
              <td>
                {{
                  this.tableFor === 'results'
                    ? item.Constructor.name
                    : item.Constructors[0].name
                }}
              </td>
              <td>{{ item.points }}</td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5">
                No results are available for this selection yet.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    }
  `,
  styleUrl: './table.component.scss'
})
export class TableComponent {
  // Input decorator to define a property binding for the 'tableFor' variable.
  // This variable is used to specify the context or purpose of the table component.
  // Expected values: 'results', 'winners'
  @Input() tableFor: string = '';

  races: Signal<Results[] | undefined> = computed(() => {
    // Check if there are race results available in the F1 API response.
    if (this.f1ApiService.f1RaceResults()?.MRData?.RaceTable.Races.length)
      // If results are available, return the results of the first race.
      return this.f1ApiService.f1RaceResults()?.MRData?.RaceTable?.Races[0]
        .Results!;
    else
      // If no results are available, return an empty array.
      return [];
  });

  constructor(public f1ApiService: F1ApiService) {}
}

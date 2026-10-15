import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import catalog from '../../data/circuit-layouts.json';

/** Public attribution accompanies the exact externally hosted layouts. */
@Component({
  selector: 'app-circuit-credits',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './circuit-credits.component.html',
  styleUrl: './circuit-credits.component.scss'
})
export class CircuitCreditsComponent {
  readonly entries = [...catalog.entries].sort(
    (left, right) =>
      left.circuitName.localeCompare(right.circuitName) ||
      left.id.localeCompare(right.id)
  );
}

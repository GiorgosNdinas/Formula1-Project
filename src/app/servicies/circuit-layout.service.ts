import { Injectable } from '@angular/core';
import catalog from '../data/circuit-layouts.json';
import type { CircuitLayoutCatalog } from '../models/circuit-layout.model';
import { selectCircuitLayout } from './circuit-layout.matcher';

/** Shares the generated catalog; matching never makes additional API requests. */
@Injectable({ providedIn: 'root' })
export class CircuitLayoutService {
  private readonly catalog = catalog as CircuitLayoutCatalog;

  /** Select only an unambiguous, season-appropriate layout for this race. */
  find(circuitId: string, season: number, round: number) {
    return selectCircuitLayout(this.catalog, circuitId, season, round);
  }
}

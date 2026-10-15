import { Component, Input, computed, inject, signal } from '@angular/core';
import { CircuitLayoutService } from '../../servicies/circuit-layout.service';

/**
 * Displays a verified external SVG or a named placeholder for the selected race.
 * Input setters bridge Angular 17 bindings to computed signal state.
 * Keyed image views prevent late load/error events from affecting another race.
 */
@Component({
  selector: 'app-circuit-layout',
  standalone: true,
  templateUrl: './circuit-layout.component.html',
  styleUrl: './circuit-layout.component.scss'
})
export class CircuitLayoutComponent {
  private readonly layouts = inject(CircuitLayoutService);
  private readonly id = signal('');
  private readonly year = signal(0);
  private readonly raceRound = signal(0);
  private readonly failedUrl = signal('');
  private readonly loadedUrl = signal('');

  @Input() circuitName = '';
  @Input() set circuitId(value: string) {
    this.id.set(value);
  }
  @Input() set season(value: string | number) {
    this.year.set(Number(value));
  }
  @Input() set round(value: string | number) {
    this.raceRound.set(Number(value));
  }

  readonly seasonLabel = computed(() => String(this.year()));
  readonly layout = computed(() =>
    this.layouts.find(this.id(), this.year(), this.raceRound())
  );
  readonly image = computed(() => {
    const layout = this.layout();
    return layout && layout.svgUrl !== this.failedUrl() ? [layout] : [];
  });
  readonly loading = computed(
    () => this.image().length > 0 && this.loadedUrl() !== this.image()[0].svgUrl
  );

  /** Ignore image events from a view whose selected race has already changed. */
  loaded(url: string): void {
    if (this.layout()?.svgUrl === url) this.loadedUrl.set(url);
  }

  failed(url: string): void {
    if (this.layout()?.svgUrl === url) this.failedUrl.set(url);
  }
}

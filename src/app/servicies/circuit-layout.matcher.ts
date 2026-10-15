import type {
  CircuitLayout,
  CircuitLayoutCatalog
} from '../models/circuit-layout.model.ts';

/**
 * Resolve a race to exactly one reviewed configuration without any network calls.
 * Exact round exceptions take priority; ambiguity deliberately produces a fallback.
 */
export function selectCircuitLayout(
  catalog: CircuitLayoutCatalog,
  circuitId: string,
  season: number,
  round: number
): CircuitLayout | undefined {
  if (
    !circuitId ||
    !Number.isInteger(season) ||
    !Number.isInteger(round) ||
    round < 1
  ) {
    return undefined;
  }

  const eligible = catalog.entries.filter(
    entry =>
      entry.circuitId === circuitId &&
      entry.attributionRequired === false &&
      ['CC0-1.0', 'PD-self'].includes(entry.license) &&
      entry.seasonRanges.some(
        range => season >= range.from && season <= range.to
      )
  );

  const exceptions = catalog.exceptions.filter(
    entry =>
      entry.circuitId === circuitId &&
      entry.season === season &&
      entry.round === round
  );

  if (exceptions.length) {
    if (exceptions.length !== 1 || !exceptions[0].layoutId) return undefined;
    const exact = eligible.filter(
      entry =>
        entry.id === exceptions[0].layoutId &&
        (!entry.rounds || entry.rounds.includes(round))
    );
    return exact.length === 1 ? exact[0] : undefined;
  }

  const exact = eligible.filter(entry => entry.rounds?.includes(round));
  if (exact.length) return exact.length === 1 ? exact[0] : undefined;

  const general = eligible.filter(entry => !entry.rounds);
  return general.length === 1 ? general[0] : undefined;
}

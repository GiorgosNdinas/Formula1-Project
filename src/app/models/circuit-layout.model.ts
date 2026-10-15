/** A finite, reviewed range. Never extrapolate a layout into future seasons. */
export interface CircuitSeasonRange {
  from: number;
  to: number;
}

/** Metadata only: the actual SVG remains on the approved external host. */
export interface CircuitLayout {
  id: string;
  circuitId: string;
  circuitName: string;
  seasonRanges: CircuitSeasonRange[];
  rounds?: number[];
  svgUrl: string;
  sourceUrl: string;
  license: 'CC0-1.0' | 'PD-self';
  licenseEvidenceUrl: string;
  attributionRequired: false;
  author: string;
  provenance: string;
  configurationEvidenceUrls: string[];
  verifiedAt: string;
  sha256: string;
  reviewKey: string;
  width: number;
  height: number;
  presentation: 'white-silhouette';
}

/** An exception blocks general ranges unless a specific verified layout exists. */
export interface CircuitLayoutException {
  circuitId: string;
  season: number;
  round: number;
  reason: string;
  evidenceUrl: string;
  layoutId?: string;
}

export interface CircuitLayoutCatalog {
  schemaVersion: number;
  entries: CircuitLayout[];
  exceptions: CircuitLayoutException[];
}

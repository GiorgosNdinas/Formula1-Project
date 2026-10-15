/**
 * Typed Formula 1 season data used by services and presentation components.
 */
export interface F1Seasons {
  MRData: {
    SeasonTable: {
      Seasons: Seasons[];
    };
    limit: string;
    offset: string;
    series: string;
    total: string;
    url: string;
    xmlns: string;
  };
}

export interface Seasons {
  season: string;
  url: string;
}

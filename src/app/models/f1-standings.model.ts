export interface F1Standings {
  MRData: {
    StandingsTable: {
      StandingsLists: StandingsLists[],
      season: string
    },
    limit: string,
    offset: string,
    series: string,
    total: string,
    url: string,
    xmlns: string
  }
}

export interface StandingsLists {
  DriverStandings: DriverStandings[]
  round: string,
  season: string
}

export interface DriverStandings {
  Constructors: Constructors[],
  Driver: {
    code: string,
    dateOfBirth: string,
    driverId: string,
    familyName: string,
    givenName: string,
    nationality: string,
    permanentNumber: string,
    url: string
  }
  points: string,
  position: string,
  positionText: string,
  wins: string
}

export interface Constructors {
  constructorId: string,
  name: string,
  nationality: string,
  url: string
}
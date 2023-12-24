export interface F1RaceResults {
  MRData?: {
    RaceTable: {
      Races: Races[],
      round: string,
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

export interface Races {
  Circuit: {
    Location: {
      country: string,
      lat: string,
      locality: string,
      long: string
    }
    circuitId: string,
    circuitName: string,
    url: string
  },
  Results : Results[],
  date: string,
  raceName: string,
  round: string,
  season: string,
  time: string,
  url: string
}

export interface Results {
  Constructor: {
    constructorId: string,
    name: string,
    nationality: string,
    url: string
  },
  Driver: {
    code: string,
    dateOfBirth: string,
    driverId: string,
    familyName: string,
    givenName: string,
    nationality: string,
    permanentNumber: string,
    url: string
  },
  FastestLap: {
    AverageSpeed: {
      speed: string,
      units: string
    },
    Time: {
      time: string
    }
    lap: string,
    rank: string
  },
  Time: {
    millis: string,
    time: string
  },
  grid: string,
  laps: string,
  number: string,
  points: string,
  position: string,
  positionText: string,
  status: string
}
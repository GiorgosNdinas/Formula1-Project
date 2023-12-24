export interface F1Rounds {
  MRData?: {
    RaceTable: {
      Races: Races[],
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
  FirstPractice: {
    date: string,
    time: string
  },
  SecondPractice: {
    date: string,
    time: string
  },
  ThirdPractice: {
    date: string,
    time: string
  },
  Qualifying: {
    date: string,
    time: string
  },
  date: string,
  raceName: string,
  round: string,
  season: string,
  time: string,
  url: string
}
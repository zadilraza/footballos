export type Fixture = {
  fixture: {
    id: number;
    date: string;
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };

  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string | null;
  };

  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };

    away: {
      id: number;
      name: string;
      logo: string;
    };
  };

  goals: {
    home: number | null;
    away: number | null;
  };
};

export type ApiResponse = {
  response: Fixture[];
  results: number;
  errors?: unknown;
};

export type MatchEvent = {
  time: { elapsed: number | null; extra: number | null };
  team: { id: number; name: string };
  player: { id: number | null; name: string | null };
  assist: { id: number | null; name: string | null };
  type: string;
  detail: string;
  comments?: string | null;
};
export type MatchLineup = {
  team: { id: number; name: string };
  coach: { name: string | null };
  formation: string | null;
  startXI: { player: { id: number; name: string; number: number | null; pos: string | null; grid?: string | null } }[];
  substitutes: MatchLineup["startXI"];
};
export type MatchStatistics = {
  team: { id: number; name: string };
  statistics: { type: string; value: string | number | null }[];
};
export type MatchDetails = Fixture & {
  fixture: Fixture["fixture"] & { referee?: string | null; venue?: { name: string | null; city: string | null } };
  score?: { penalty?: { home: number | null; away: number | null } };
  events?: MatchEvent[];
  lineups?: MatchLineup[];
  statistics?: MatchStatistics[];
  players?: { team: { id: number }; players: { player: { id: number; name: string }; statistics: {
    games?: { rating?: string | null; minutes?: number | null };
    goals?: { total?: number | null; assists?: number | null };
    duels?: { won?: number | null; total?: number | null };
    tackles?: { total?: number | null };
    dribbles?: { success?: number | null };
  }[] }[] }[];
};

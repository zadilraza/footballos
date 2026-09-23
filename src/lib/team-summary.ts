import type { Fixture } from "@/types/football";
export function teamsFromMatches(matches: Fixture[]) {
  return [...new Map(matches.flatMap((match) => [match.teams.home, match.teams.away]).map((team) => [team.id, team])).values()].sort((a, b) => a.name.localeCompare(b.name));
}
export function teamSummary(matches: Fixture[], id: number) {
  const fixtures = matches.filter((match) => match.teams.home.id === id || match.teams.away.id === id);
  const finished = fixtures.filter((match) => ["FT", "AET", "PEN"].includes(match.fixture.status.short) && match.goals.home !== null && match.goals.away !== null);
  let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
  for (const match of finished) {
    const home = match.teams.home.id === id;
    const scored = (home ? match.goals.home : match.goals.away)!;
    const conceded = (home ? match.goals.away : match.goals.home)!;
    goalsFor += scored; goalsAgainst += conceded;
    if (scored > conceded) wins++; else if (scored < conceded) losses++; else draws++;
  }
  return { fixtures: fixtures.length, completed: finished.length, wins, draws, losses, goalsFor, goalsAgainst };
}

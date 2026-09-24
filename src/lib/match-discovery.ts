import type { Fixture } from "@/types/football";
import { isLive } from "./matches";

export const MATCH_FILTERS = ["All", "Live", "Finished", "Upcoming"] as const;
export type MatchFilter = (typeof MATCH_FILTERS)[number];
export const MATCH_PAGE_SIZE = 40;

// Editorial prominence, not live popularity or a prediction of match quality.
// Provider IDs distinguish senior competitions from similarly named youth leagues.
const COMPETITION_WEIGHT: Record<number, number> = {
  1: 100, 4: 95, 9: 95, 2: 90, 5: 85, 6: 85, 7: 85,
  29: 82, 30: 82, 31: 82, 32: 82, 33: 82, 34: 82,
  39: 80, 140: 78, 135: 76, 78: 76, 61: 74, 3: 72,
  848: 68, 15: 80, 36: 65, 536: 62, 253: 60, 10: 45,
};
const MAJOR_TEAMS = new Set([
  "portugal", "france", "england", "spain", "germany", "italy", "netherlands",
  "belgium", "argentina", "brazil", "uruguay", "croatia", "morocco", "japan",
  "real madrid", "barcelona", "atletico madrid", "manchester city", "manchester united",
  "liverpool", "arsenal", "chelsea", "tottenham", "bayern munchen", "bayern munich",
  "borussia dortmund", "paris saint germain", "inter", "ac milan", "juventus", "napoli",
]);
const NOTABLE_TEAMS = new Set(["norway", "denmark", "switzerland", "austria", "turkiye", "turkey", "senegal", "colombia", "mexico", "usa", "united states", "south korea", "nigeria", "egypt", "poland", "sweden", "ukraine", "serbia", "wales", "ecuador"]);
const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function matchProminence(match: Fixture) {
  const names = [match.teams.home.name, match.teams.away.name].map(normalize);
  // Shared Friendlies IDs include youth sides: never promote those as senior games.
  const youth = names.some((name) => /\bu[- ]?\d{2}\b|\bres(?:erves)?\b/.test(name));
  if (youth) return 5;
  const base = COMPETITION_WEIGHT[match.league.id] ?? 0;
  const majorCount = names.filter((name) => MAJOR_TEAMS.has(name)).length;
  const notableCount = names.filter((name) => NOTABLE_TEAMS.has(name)).length;
  return base + majorCount * 15 + notableCount * 7;
}

export function compareMatches(a: Fixture, b: Fixture) {
  return matchProminence(b) - matchProminence(a) ||
    Date.parse(a.fixture.date) - Date.parse(b.fixture.date) || a.fixture.id - b.fixture.id;
}

export function topMatches(matches: Fixture[]) {
  return matches.filter((match) => matchProminence(match) >= 60)
    .sort(compareMatches).slice(0, 3);
}

export function matchesSearch(match: Fixture, query: string) {
  const haystack = normalize([match.teams.home.name, match.teams.away.name, match.league.name, match.league.country].join(" "));
  return normalize(query).split(/\s+/).every((word) => haystack.includes(word));
}

export function matchesStatus(match: Fixture, filter: MatchFilter) {
  const status = match.fixture.status.short;
  switch (filter) {
    case "Live": return isLive(match);
    case "Finished": return ["FT", "AET", "PEN"].includes(status);
    case "Upcoming": return ["NS", "TBD"].includes(status);
    default: return true;
  }
}

export function groupMatches(matches: Fixture[]) {
  const groups = new Map<number, { league: Fixture["league"]; matches: Fixture[] }>();
  for (const match of matches) {
    const group = groups.get(match.league.id);
    if (group) group.matches.push(match);
    else groups.set(match.league.id, { league: match.league, matches: [match] });
  }
  return [...groups.values()].map((group) => ({ ...group, matches: group.matches.sort(compareMatches) }))
    .sort((a, b) => matchProminence(b.matches[0]) - matchProminence(a.matches[0]) ||
      a.league.country.localeCompare(b.league.country) ||
      a.league.name.localeCompare(b.league.name) || a.league.id - b.league.id);

}

export function paginateGroups(groups: ReturnType<typeof groupMatches>, limit: number) {
  let remaining = limit;
  return groups.flatMap((group) => {
    if (remaining <= 0) return [];
    const matches = group.matches.slice(0, remaining);
    remaining -= matches.length;
    return [{ ...group, matches, total: group.matches.length }];
  });
}

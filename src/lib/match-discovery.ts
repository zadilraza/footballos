import type { Fixture } from "@/types/football";
import { isLive } from "./matches";

export const MATCH_FILTERS = ["All", "Live", "Finished", "Upcoming"] as const;
export type MatchFilter = (typeof MATCH_FILTERS)[number];
export const MATCH_PAGE_SIZE = 40;

// Stable provider league IDs avoid confusing competitions with identical names.
const FEATURED_LEAGUES = [2, 39, 140, 135, 78, 61, 3, 848, 253, 15];
const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

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
  const rank = (id: number) => {
    const index = FEATURED_LEAGUES.indexOf(id);
    return index === -1 ? FEATURED_LEAGUES.length : index;
  };
  return [...groups.values()].sort((a, b) =>
    rank(a.league.id) - rank(b.league.id) ||
    a.league.country.localeCompare(b.league.country) ||
    a.league.name.localeCompare(b.league.name) || a.league.id - b.league.id
  ).map((group) => ({ ...group, matches: group.matches.sort((a, b) =>
    Date.parse(a.fixture.date) - Date.parse(b.fixture.date) || a.fixture.id - b.fixture.id
  ) }));
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

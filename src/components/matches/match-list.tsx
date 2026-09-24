"use client";

import { useMemo, useState } from "react";
import type { Fixture } from "@/types/football";
import { MATCH_FILTERS, MATCH_PAGE_SIZE, groupMatches, matchesSearch, matchesStatus, paginateGroups, type MatchFilter } from "@/lib/match-discovery";
import { useFavorites } from "@/hooks/use-favorites";
import { isFavoriteMatch } from "@/lib/favorites";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { MatchRow } from "./match-row";

export function MatchList({ matches, dateOffset }: { matches: Fixture[]; dateOffset: number }) {
  const { favorites, toggle, storageUnavailable } = useFavorites();
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MatchFilter>("All");
  const [limit, setLimit] = useState(MATCH_PAGE_SIZE);
  const searched = useMemo(() => matches.filter((match) => matchesSearch(match, query)), [matches, query]);
  const favoritesMatches = useMemo(() => favoritesOnly ? searched.filter((match) => isFavoriteMatch(match, favorites)) : searched, [searched, favoritesOnly, favorites]);
  const filtered = useMemo(() => favoritesMatches.filter((match) => matchesStatus(match, filter)), [favoritesMatches, filter]);
  const groups = useMemo(() => paginateGroups(groupMatches(filtered), limit), [filtered, limit]);
  const shown = Math.min(limit, filtered.length);
  const clearFilters = () => { setQuery(""); setFilter("All"); setFavoritesOnly(false); setLimit(MATCH_PAGE_SIZE); };

  return (
    <section className="border-t border-border py-10" aria-labelledby="schedule-heading">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Schedule</p>
          <h2 id="schedule-heading" className="mt-2 text-2xl font-semibold">
            {dateOffset === -1 ? "Yesterday's Matches" : dateOffset === 1 ? "Tomorrow's Matches" : "Today's Matches"}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">{matches.length} fixtures · Biggest matches first</p>
      </div>

      <div className="mb-6 space-y-4">
        <div>
          <label htmlFor="match-search" className="mb-2 block text-sm font-medium">Search teams or competitions</label>
          <input id="match-search" type="search" value={query}
            onChange={(event) => { setQuery(event.target.value); setLimit(MATCH_PAGE_SIZE); }}
            placeholder="Team, competition, or country…"
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter matches by status">
          {MATCH_FILTERS.map((option) => <button key={option} type="button" aria-pressed={filter === option}
            onClick={() => { setFilter(option); setLimit(MATCH_PAGE_SIZE); }}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${filter === option ? "border-primary bg-primary font-semibold text-primary-foreground" : "border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
            {option} <span className="ml-1 tabular-nums">{favoritesMatches.filter((match) => matchesStatus(match, option)).length}</span>
          </button>)}
          <button type="button" aria-pressed={favoritesOnly} onClick={() => { setFavoritesOnly((value) => !value); setLimit(MATCH_PAGE_SIZE); }} className={`rounded-full border px-4 py-2 text-sm ${favoritesOnly ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>★ Favorites</button>
          {(query || filter !== "All" || favoritesOnly) && <button type="button" onClick={clearFilters} className="px-3 py-2 text-sm text-primary underline underline-offset-4">Clear filters</button>}
        </div>
        <p className="text-xs text-muted-foreground">{storageUnavailable ? "Browser storage is unavailable. Favorites will last for this session only." : "Star teams or competitions to save favorites on this browser."}</p>
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">Showing {shown} of {filtered.length} matching fixtures</p>
      </div>

      {!filtered.length ? <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
        {matches.length === 0 ? "No fixtures found for this date." : favoritesOnly && favorites.teams.length + favorites.competitions.length === 0 ? "No favorites yet. Turn off Favorites and star a team or competition to get started." : favoritesOnly ? "No favorite matches fit this date, search, and status. Try another date or clear filters." : "No matches fit your search and filters. Try another team or status."}
      </div> : <div className="space-y-6">
        {groups.map(({ league, matches: fixtures, total }) => <section key={league.id} aria-labelledby={`league-${league.id}`} className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted px-5 py-4 text-muted-foreground">
            <div><p className="text-xs uppercase tracking-wider">{league.country}</p><h3 id={`league-${league.id}`} className="mt-1 font-semibold text-card-foreground">{league.name}</h3></div>
            <div className="flex items-center gap-2"><FavoriteButton name={league.name} selected={favorites.competitions.includes(league.id)} onToggle={() => { toggle("competitions", league.id, league); setLimit(MATCH_PAGE_SIZE); }} /><p className="text-xs">{fixtures.length === total ? `${total} fixtures` : `${fixtures.length} of ${total} fixtures`}</p></div>
          </div>
          <div className="divide-y divide-border">{fixtures.map((match) => <MatchRow key={match.fixture.id} match={match} favorites={favorites} onToggleTeam={(id) => { toggle("teams", id, id === match.teams.home.id ? match.teams.home : match.teams.away); setLimit(MATCH_PAGE_SIZE); }} />)}</div>
        </section>)}
      </div>}

      {shown < filtered.length && <div className="mt-6 text-center"><button type="button" onClick={() => setLimit((current) => current + MATCH_PAGE_SIZE)} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
        Show more ({Math.min(MATCH_PAGE_SIZE, filtered.length - shown)})
      </button></div>}
    </section>
  );
}

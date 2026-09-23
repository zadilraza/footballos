"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { DateSelector } from "@/components/matches/date-selector";
import { MatchList } from "@/components/matches/match-list";
import { useMatches } from "@/hooks/use-matches";
import { getDateFromOffset, isLive } from "@/lib/matches";
import { groupMatches } from "@/lib/match-discovery";
import { teamsFromMatches } from "@/lib/team-summary";
import { CompareTeams } from "./compare-teams";
import { useFavorites } from "@/hooks/use-favorites";
import { FavoriteButton } from "@/components/favorites/favorite-button";

type Kind = "competitions" | "teams" | "compare";
export function FootballDirectory({ kind, selectedId, initialOffset = 0 }: { kind: Kind; selectedId?: number; initialOffset?: number }) {
  const [offset, setOffset] = useState(initialOffset);
  const [query, setQuery] = useState("");
  const date = useMemo(() => getDateFromOffset(offset), [offset]);
  const { matches, loading, error } = useMatches(date);
  const { favorites, toggle } = useFavorites();
  const competitions = groupMatches(matches);
  const teams = teamsFromMatches(matches);
  const selected = kind === "teams" ? teams.find((team) => team.id === selectedId) : competitions.find((group) => group.league.id === selectedId)?.league;
  const selectedMatches = matches.filter((match) => kind === "teams" ? match.teams.home.id === selectedId || match.teams.away.id === selectedId : match.league.id === selectedId);
  const items = kind === "teams" ? teams.map((team) => ({ ...team, detail: [...new Set(matches.filter((m) => m.teams.home.id === team.id || m.teams.away.id === team.id).map((m) => m.league.name))].join(" · ") })) : competitions.map(({ league, matches }) => ({ ...league, detail: `${league.country} · ${matches.length} fixtures` }));
  const visible = items.filter((item) => `${item.name} ${item.detail}`.toLowerCase().includes(query.trim().toLowerCase()));
  const title = kind === "compare" ? "Compare teams" : kind === "teams" ? "Teams" : "Competitions";
  return <main className="min-h-screen bg-background text-foreground"><Navbar liveCount={matches.filter(isLive).length} />
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div><h1 className="text-3xl font-bold">{title}</h1><p className="mt-3 text-sm text-muted-foreground">Browse fixtures for {date}. Coverage is limited to teams and competitions playing on the selected date.</p></div><DateSelector dateOffset={offset} setDateOffset={setOffset} /></div>
      {loading ? <p role="status" className="py-12 text-muted-foreground">Loading football…</p> : error ? <div role="alert" className="rounded-xl border border-destructive/30 p-6"><p>{error}</p><button onClick={() => window.location.reload()} className="mt-3 text-primary">Try again</button></div> : kind === "compare" ? <CompareTeams key={date} matches={matches} offset={offset} /> : selectedId ? <>
        <Link href={`/${kind}?offset=${offset}`} className="text-sm text-primary">← All {kind}</Link>
        {selected ? <div className="my-6 flex items-center gap-4">{selected.logo && <Image src={selected.logo} alt="" width={64} height={64} unoptimized className="size-16 object-contain" />}<h2 className="text-2xl font-bold">{selected.name}</h2><FavoriteButton name={selected.name} selected={favorites[kind].includes(selected.id)} onToggle={() => toggle(kind, selected.id, selected)} /></div> : <p className="my-6 text-muted-foreground">No fixtures for this selection on this date. Try yesterday or tomorrow.</p>}
        <MatchList key={`${date}-${selectedId}`} matches={selectedMatches} dateOffset={offset} />
      </> : <>
        <label className="mb-6 block text-sm font-medium">Search {kind}<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Find ${kind}…`} className="mt-2 block w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground" /></label>
        <p role="status" className="mb-4 text-sm text-muted-foreground">{visible.length} {kind}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visible.map((item) => <article key={item.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground"><Link href={`/${kind}?id=${item.id}&offset=${offset}`} className="flex min-w-0 flex-1 items-center gap-3">{item.logo && <Image src={item.logo} alt="" width={40} height={40} unoptimized className="size-10 shrink-0 object-contain" />}<div className="min-w-0"><h2 className="font-semibold">{item.name}</h2><p className="mt-1 text-xs text-muted-foreground">{item.detail}</p></div></Link><FavoriteButton name={item.name} selected={favorites[kind].includes(item.id)} onToggle={() => toggle(kind, item.id, item)} /></article>)}</div>
        {!visible.length && <p className="py-10 text-center text-muted-foreground">{matches.length ? "No results. Try another search." : "No fixtures available for this date."}</p>}
      </>}
    </div>
  </main>;
}

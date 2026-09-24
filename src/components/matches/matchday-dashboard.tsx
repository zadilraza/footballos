"use client";

import { useMemo, useState } from "react";
import { useMatches } from "@/hooks/use-matches";
import { getDateFromOffset, isLive } from "@/lib/matches";
import { Navbar } from "@/components/layout/navbar";
import { DateSelector } from "./date-selector";
import { LiveMatches } from "./live-matches";
import { compareMatches, topMatches } from "@/lib/match-discovery";
import { MatchCard } from "./match-card";
import { MatchList } from "./match-list";

export function MatchdayDashboard({ children }: { children: React.ReactNode }) {
  const [dateOffset, setDateOffset] = useState(0);
  const selectedDate = useMemo(() => getDateFromOffset(dateOffset), [dateOffset]);
  const { matches, loading, error, retry } = useMatches(selectedDate);

  const liveMatches = matches.filter(isLive).sort(compareMatches);
  const featured = topMatches(matches);

  const selectedDateText = new Date(
    `${selectedDate}T12:00:00`
  ).toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* NAVBAR */}
      <Navbar liveCount={liveMatches.length} />

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* HEADER */}
        <section className="flex flex-col gap-7 border-b border-border pb-9 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
              Global Football
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Matchday
            </h1>

            <p className="mt-3 text-sm text-muted-foreground">
              {selectedDateText}
            </p>

            <p className="mt-4 max-w-xl text-muted-foreground">
              Live scores, fixtures, results, and match stories
              from football around the world.
            </p>
          </div>

          <DateSelector dateOffset={dateOffset} setDateOffset={setDateOffset} />
        </section>

        {/* LOADING */}
        {loading && (
          <div className="py-24 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />

            <p className="mt-5 text-sm text-muted-foreground">
              Loading football around the world...
            </p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div role="alert" className="my-10 rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
            <p className="font-medium text-destructive">
              {error}
            </p>
            <button type="button" onClick={retry} className="mt-4 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent">Try again</button>
          </div>
        )}

        {!loading && !error && (
          <>
            {featured.length > 0 && <section className="py-8" aria-labelledby="top-matches-heading">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Worth watching</p>
              <h2 id="top-matches-heading" className="mt-2 text-2xl font-semibold">Top matches</h2>
              <p className="mt-2 text-sm text-muted-foreground">Major competitions and standout teams for {selectedDateText}. Ranked by competition and team prominence.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{featured.map((match) => <MatchCard key={match.fixture.id} match={match} />)}</div>
            </section>}
            {/* LIVE NOW */}
            {dateOffset === 0 && (
              <LiveMatches liveMatches={liveMatches} />
            )}

            {/* ALL MATCHES */}
            <MatchList key={selectedDate} matches={matches} dateOffset={dateOffset} />

            {/* SOCIAL */}
            {children}
          </>
        )}
      </div>
    </main>
  );
}

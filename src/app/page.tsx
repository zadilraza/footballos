"use client";

import { useEffect, useMemo, useState } from "react";

type Fixture = {
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

type ApiResponse = {
  response: Fixture[];
  results: number;
  errors?: unknown;
};

const LIVE_STATUSES = [
  "1H",
  "HT",
  "2H",
  "ET",
  "BT",
  "P",
  "INT",
  "LIVE",
];

const FINISHED_STATUSES = [
  "FT",
  "AET",
  "PEN",
];

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateFromOffset(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);

  return formatLocalDate(date);
}

function getStatusLabel(match: Fixture) {
  const short = match.fixture.status.short;
  const elapsed = match.fixture.status.elapsed;

  if (LIVE_STATUSES.includes(short)) {
    if (short === "HT") {
      return "HT";
    }

    if (elapsed !== null) {
      return `${elapsed}'`;
    }

    return "LIVE";
  }

  if (FINISHED_STATUSES.includes(short)) {
    return short;
  }

  const kickoff = new Date(match.fixture.date);

  return kickoff.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function isLive(match: Fixture) {
  return LIVE_STATUSES.includes(match.fixture.status.short);
}

function MatchRow({ match }: { match: Fixture }) {
  const live = isLive(match);
  const status = getStatusLabel(match);

  return (
    <div className="grid gap-5 px-5 py-5 sm:grid-cols-[210px_1fr_110px] sm:items-center">
      <div>
        <div className="flex items-center gap-3">
          <img
            src={match.league.logo}
            alt=""
            className="h-7 w-7 object-contain"
          />

          <div>
            <p className="text-sm font-medium">
              {match.league.name}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {match.league.country}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-5">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={match.teams.home.logo}
              alt=""
              className="h-7 w-7 object-contain"
            />

            <span className="truncate">
              {match.teams.home.name}
            </span>
          </div>

          {match.goals.home !== null && (
            <span className="text-lg font-semibold">
              {match.goals.home}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-5">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={match.teams.away.logo}
              alt=""
              className="h-7 w-7 object-contain"
            />

            <span className="truncate">
              {match.teams.away.name}
            </span>
          </div>

          {match.goals.away !== null && (
            <span className="text-lg font-semibold">
              {match.goals.away}
            </span>
          )}
        </div>
      </div>

      <div className="sm:text-right">
        <span
          className={
            live
              ? "text-sm font-semibold text-red-400"
              : "text-sm text-gray-400"
          }
        >
          {live && "● "}
          {status}
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const [dateOffset, setDateOffset] = useState(0);
  const [matches, setMatches] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedDate = useMemo(
    () => getDateFromOffset(dateOffset),
    [dateOffset]
  );

  useEffect(() => {
    async function loadMatches() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/matches?date=${selectedDate}`
        );

        if (!response.ok) {
          throw new Error("Unable to load matches");
        }

        const data: ApiResponse = await response.json();

        setMatches(data.response || []);
      } catch (err) {
        console.error(err);
        setError("Could not load football matches.");
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, [selectedDate]);

  const liveMatches = matches.filter(isLive);

  const displayedMatches = matches.slice(0, 40);

  const selectedDateText = new Date(
    `${selectedDate}T12:00:00`
  ).toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-[#080a08] text-white">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#080a08]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-10">
            <a
              href="#"
              className="text-xl font-bold tracking-tight"
            >
              Football
              <span className="text-lime-400">OS</span>
            </a>

            <div className="hidden gap-7 text-sm text-gray-400 md:flex">
              <a href="#" className="text-white">
                Matches
              </a>

              <a
                href="#"
                className="transition hover:text-white"
              >
                Competitions
              </a>

              <a
                href="#"
                className="transition hover:text-white"
              >
                Teams
              </a>

              <a
                href="#"
                className="transition hover:text-white"
              >
                Compare
              </a>
            </div>
          </div>

          <div className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400">
            ● {liveMatches.length} LIVE
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* HEADER */}
        <section className="flex flex-col gap-7 border-b border-white/10 pb-9 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-lime-400">
              Global Football
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Matchday
            </h1>

            <p className="mt-3 text-sm text-gray-500">
              {selectedDateText}
            </p>

            <p className="mt-4 max-w-xl text-gray-400">
              Live scores, fixtures, results, and match stories
              from football around the world.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDateOffset(-1)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                dateOffset === -1
                  ? "bg-lime-400 font-semibold text-black"
                  : "border border-white/10 text-gray-400 hover:bg-white/5"
              }`}
            >
              Yesterday
            </button>

            <button
              onClick={() => setDateOffset(0)}
              className={`rounded-full px-5 py-2 text-sm transition ${
                dateOffset === 0
                  ? "bg-lime-400 font-semibold text-black"
                  : "border border-white/10 text-gray-400 hover:bg-white/5"
              }`}
            >
              Today
            </button>

            <button
              onClick={() => setDateOffset(1)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                dateOffset === 1
                  ? "bg-lime-400 font-semibold text-black"
                  : "border border-white/10 text-gray-400 hover:bg-white/5"
              }`}
            >
              Tomorrow
            </button>
          </div>
        </section>

        {/* LOADING */}
        {loading && (
          <div className="py-24 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-lime-400" />

            <p className="mt-5 text-sm text-gray-500">
              Loading football around the world...
            </p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="my-10 rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <p className="font-medium text-red-400">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* LIVE NOW */}
            {dateOffset === 0 && (
              <section className="py-10">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
                      ● Live Now
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold">
                      {liveMatches.length === 0
                        ? "No matches currently live"
                        : `${liveMatches.length} matches in progress`}
                    </h2>
                  </div>
                </div>

                {liveMatches.length > 0 && (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {liveMatches.slice(0, 6).map((match) => (
                      <article
                        key={match.fixture.id}
                        className="rounded-2xl border border-white/10 bg-[#0d100d] p-6 transition hover:border-lime-400/30"
                      >
                        <div className="flex items-start justify-between gap-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={match.league.logo}
                              alt=""
                              className="h-8 w-8 object-contain"
                            />

                            <div>
                              <p className="text-xs uppercase tracking-[0.16em] text-gray-500">
                                {match.league.country}
                              </p>

                              <p className="mt-1 text-sm text-gray-300">
                                {match.league.name}
                              </p>
                            </div>
                          </div>

                          <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                            ● {getStatusLabel(match)}
                          </span>
                        </div>

                        <div className="mt-8 space-y-5">
                          <div className="flex items-center justify-between gap-5">
                            <div className="flex min-w-0 items-center gap-3">
                              <img
                                src={match.teams.home.logo}
                                alt=""
                                className="h-9 w-9 object-contain"
                              />

                              <span className="truncate text-lg font-medium">
                                {match.teams.home.name}
                              </span>
                            </div>

                            <span className="text-3xl font-bold">
                              {match.goals.home ?? 0}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-5">
                            <div className="flex min-w-0 items-center gap-3">
                              <img
                                src={match.teams.away.logo}
                                alt=""
                                className="h-9 w-9 object-contain"
                              />

                              <span className="truncate text-lg font-medium">
                                {match.teams.away.name}
                              </span>
                            </div>

                            <span className="text-3xl font-bold">
                              {match.goals.away ?? 0}
                            </span>
                          </div>
                        </div>

                        <div className="mt-6 border-t border-white/10 pt-4">
                          <button className="text-sm font-medium text-lime-400">
                            Open Match Center →
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ALL MATCHES */}
            <section className="border-t border-white/10 py-10">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
                    Schedule
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold">
                    {dateOffset === -1
                      ? "Yesterday's Matches"
                      : dateOffset === 1
                      ? "Tomorrow's Matches"
                      : "Today's Matches"}
                  </h2>
                </div>

                <p className="text-sm text-gray-500">
                  {matches.length} fixtures
                </p>
              </div>

              {matches.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-[#0d100d] p-10 text-center text-gray-500">
                  No fixtures found for this date.
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d100d]">
                  {displayedMatches.map((match, index) => (
                    <div
                      key={match.fixture.id}
                      className={
                        index !== displayedMatches.length - 1
                          ? "border-b border-white/10"
                          : ""
                      }
                    >
                      <MatchRow match={match} />
                    </div>
                  ))}
                </div>
              )}

              {matches.length > displayedMatches.length && (
                <p className="mt-5 text-center text-sm text-gray-500">
                  Showing the first {displayedMatches.length} of{" "}
                  {matches.length} fixtures.
                </p>
              )}
            </section>

            {/* SOCIAL */}
            <section className="border-t border-white/10 py-12">
              <div className="grid gap-10 lg:grid-cols-[1fr_390px]">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-lime-400">
                    Around Football
                  </p>

                  <h2 className="mt-3 max-w-xl text-3xl font-semibold">
                    The match is only half the story.
                  </h2>

                  <p className="mt-4 max-w-xl leading-7 text-gray-400">
                    FootballOS will connect live match events with
                    reactions, player moments, analysis, TikToks,
                    Instagram Reels, and the conversation surrounding
                    each game.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0d100d] p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Social Pulse</p>

                    <span className="text-xs font-medium text-lime-400">
                      COMING SOON
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs text-gray-500">
                        TikTok
                      </p>

                      <p className="mt-2 text-sm">
                        Goals, reactions, and player moments
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs text-gray-500">
                        Instagram
                      </p>

                      <p className="mt-2 text-sm">
                        Stadium atmosphere and fan reactions
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs text-gray-500">
                        Match Analysis
                      </p>

                      <p className="mt-2 text-sm">
                        Tactical discussion and player performances
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
import Link from "next/link";
import type { Fixture } from "@/types/football";
import { getStatusLabel } from "@/lib/matches";
export function MatchCard({ match }: { match: Fixture }) {

  return (
    <article
      className="rounded-2xl border border-border bg-card text-card-foreground p-6 transition hover:border-primary/30"
    >
      <div className="flex items-start justify-between gap-5">
        <div className="flex items-center gap-3">
          <img
            src={match.league.logo}
            alt=""
            className="h-8 w-8 object-contain"
          />

          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {match.league.country}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {match.league.name}
            </p>
          </div>
        </div>

        <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
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

      <div className="mt-6 border-t border-border pt-4">
        <Link href={`/matches/${match.fixture.id}`} prefetch={false} className="text-sm font-medium text-primary">
          Open Match Center →
        </Link>
      </div>
    </article>
  );
}

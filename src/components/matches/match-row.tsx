import { SocialPulse } from "./social-pulse";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import type { Favorites } from "@/lib/favorites";
import Link from "next/link";
import type { Fixture } from "@/types/football";
import { isLive, getStatusLabel } from "@/lib/matches";

export function MatchRow({ match, favorites, onToggleTeam }: { match: Fixture; favorites: Favorites; onToggleTeam: (id: number) => void }) {
  const live = isLive(match);
  const status = getStatusLabel(match);

  return (
    <div className="relative grid gap-5 px-5 py-5 transition-colors hover:bg-accent hover:text-accent-foreground sm:grid-cols-[210px_1fr_150px] sm:items-center [&>div]:pointer-events-none">
      <Link href={`/matches/${match.fixture.id}`} prefetch={false} aria-label={`Open ${match.teams.home.name} vs ${match.teams.away.name} Match Center`} className="absolute inset-0 rounded-lg" />
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

            <p className="mt-1 text-xs text-muted-foreground">
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
            <FavoriteButton name={match.teams.home.name} selected={favorites.teams.includes(match.teams.home.id)} onToggle={() => onToggleTeam(match.teams.home.id)} />
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
            <FavoriteButton name={match.teams.away.name} selected={favorites.teams.includes(match.teams.away.id)} onToggle={() => onToggleTeam(match.teams.away.id)} />
          </div>

          {match.goals.away !== null && (
            <span className="text-lg font-semibold">
              {match.goals.away}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end sm:text-right">
        <span
          className={
            live
              ? "text-sm font-semibold text-destructive"
              : "text-sm text-muted-foreground"
          }
        >
          {live && "● "}
          {status}
        </span>
        <SocialPulse match={match} />
      </div>
    </div>
  );
}

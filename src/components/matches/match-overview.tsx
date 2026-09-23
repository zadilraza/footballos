import type { MatchDetails } from "@/types/football";
import { getMatchups } from "@/lib/matchups";

export function MatchupPreview({ match }: { match: MatchDetails }) {
  const pairing = getMatchups(match)[0];
  if (!pairing) return <p className="mt-2 text-sm text-muted-foreground">Waiting for complete lineup positions to identify likely matchups.</p>;
  return <div className="mt-3">
    <p className="font-semibold">{pairing.home.map((player) => player.name).join(" & ")} <span className="px-1 text-muted-foreground">↔</span> {pairing.away.map((player) => player.name).join(" & ")}</p>
    <p className="mt-2 text-xs text-muted-foreground">{pairing.homeRole} vs {pairing.awayRole} · Likely pairing</p>
  </div>;
}

export function MatchOverview({ match }: { match: MatchDetails }) {
  const home = match.statistics?.find((item) => item.team.id === match.teams.home.id)?.statistics ?? [];
  const away = match.statistics?.find((item) => item.team.id === match.teams.away.id)?.statistics ?? [];
  const metrics = ["Ball Possession", "Total Shots", "Shots on Goal"];
  return <section className="rounded-2xl border border-border bg-card p-5 text-card-foreground sm:p-7">
    <h2 className="text-lg font-semibold">At a glance</h2>
    <div className="mt-4 grid gap-3 sm:grid-cols-3">{metrics.map((label) => <div key={label} className="rounded-xl bg-muted p-4 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold tabular-nums"><span aria-label={`${match.teams.home.name}: ${home.find((item) => item.type === label)?.value ?? "unavailable"}`}>{home.find((item) => item.type === label)?.value ?? "–"}</span><span className="px-3 text-muted-foreground">/</span><span aria-label={`${match.teams.away.name}: ${away.find((item) => item.type === label)?.value ?? "unavailable"}`}>{away.find((item) => item.type === label)?.value ?? "–"}</span></p>
    </div>)}</div>
    <p className="mt-3 text-xs text-muted-foreground">{match.teams.home.name} / {match.teams.away.name}{!home.length && !away.length ? " · Statistics not available yet" : ""}</p>
    <details className="mt-5 border-t border-border pt-4">
      <summary className="cursor-pointer text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring">Match details</summary>
      <div className="mt-3 space-y-2 text-sm text-muted-foreground">
        <p>Venue: {match.fixture.venue?.name ?? "Not available"}{match.fixture.venue?.city ? ` · ${match.fixture.venue.city}` : ""}</p>
        <p>Referee: {match.fixture.referee ?? "Not available"}</p>
        <p>Match data may be up to five minutes old. Reload to check for updates.</p>
      </div>
    </details>
  </section>;
}

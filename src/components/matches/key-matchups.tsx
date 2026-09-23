import { Flame, Swords } from "lucide-react";
import { PlayerAvatar } from "./player-avatar";
import type { MatchDetails } from "@/types/football";
import { getMatchups, type MatchupPlayer } from "@/lib/matchups";

function PlayerCard({ player, teamId, match }: { player: MatchupPlayer; teamId: number; match: MatchDetails }) {
  const stats = match.players?.find((t) => t.team.id === teamId)?.players.find((p) => p.player.id === player.id)?.statistics[0];
  const metrics: string[] = [];
  if (stats?.games?.rating != null) metrics.push(`Rating ${stats.games.rating}`);
  if (stats?.duels?.won != null && stats.duels.total != null) metrics.push(`${stats.duels.won}/${stats.duels.total} duels won`);
  if (stats?.dribbles?.success != null) metrics.push(`${stats.dribbles.success} successful dribbles`);
  if (stats?.tackles?.total != null) metrics.push(`${stats.tackles.total} tackles`);
  if (stats?.goals?.total != null) metrics.push(`${stats.goals.total} goals`);
  return <div className="mt-4 flex flex-col items-center text-center">
    <div className="relative"><div aria-hidden="true" className="absolute -inset-3 rounded-full bg-matchup-heat/20 blur-xl" /><PlayerAvatar playerId={player.id} name={player.name} number={player.number} side={teamId === match.teams.home.id ? "home" : "away"} variant="matchup" /></div>
    <p className="mt-3 text-base font-extrabold leading-tight tracking-tight sm:text-lg [overflow-wrap:anywhere]">{player.name}</p>
    {player.replacement && <p className="mt-1 text-xs text-muted-foreground">On as substitute · position estimated</p>}
    {metrics.length ? <div className="mt-3 flex flex-wrap justify-center gap-1.5">{metrics.map((metric) => <span key={metric} className="rounded-md border border-border bg-background/80 px-2 py-1 text-[10px] font-medium text-muted-foreground">{metric}</span>)}</div> : <p className="mt-2 text-xs text-muted-foreground">Awaiting player stats</p>}
  </div>;
}
export function KeyMatchups({ match }: { match: MatchDetails }) {
  const matchups = getMatchups(match);
  return <section className="rounded-2xl border border-border bg-card p-5 text-card-foreground sm:p-7" aria-labelledby="key-matchups">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="key-matchups" className="flex items-center gap-2 text-2xl font-black tracking-tight"><Flame aria-hidden="true" className="size-6 text-matchup-heat" />Key matchups</h2><span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">Likely positional battles</span></div>
    <p className="mt-3 text-sm leading-6 text-muted-foreground">Who to watch, where they meet, and what to look for. Pairings are inferred from the published formation; players can switch positions and marking assignments.</p>
    {matchups.length ? <>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">{matchups.map((duel) => <article key={duel.title} className="relative isolate overflow-hidden rounded-2xl border border-matchup-heat/30 bg-background p-4 shadow-sm transition-shadow hover:shadow-lg sm:p-5">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,var(--matchup-glow),transparent_65%)]" />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-matchup-heat via-destructive to-primary" />
        <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-matchup-heat"><Swords aria-hidden="true" className="size-4 shrink-0" />{duel.title}</h3>
        <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-2 sm:gap-3">
          <div className="min-w-0 text-center"><p className="text-xs font-bold">{match.teams.home.name}</p><p className="mt-1 text-xs text-muted-foreground">{duel.homeRole}</p>{duel.home.map((player) => <PlayerCard key={player.id} player={player} teamId={match.teams.home.id} match={match} />)}</div>
          <span aria-label="versus" className="mt-20 flex size-9 -rotate-6 items-center justify-center self-start rounded-xl border border-matchup-heat/40 bg-card text-lg font-black italic text-matchup-heat shadow-lg sm:size-11 sm:text-xl">VS</span>
          <div className="min-w-0 text-center"><p className="text-xs font-bold">{match.teams.away.name}</p><p className="mt-1 text-xs text-muted-foreground">{duel.awayRole}</p>{duel.away.map((player) => <PlayerCard key={player.id} player={player} teamId={match.teams.away.id} match={match} />)}</div>
        </div>
        <p className="mt-5 rounded-lg border border-border bg-card/80 p-3 text-xs leading-5 text-muted-foreground">{duel.description}</p>
      </article>)}</div>
      <p className="mt-4 text-xs leading-5 text-muted-foreground">Ratings and totals cover each player’s whole match, not just this opponent. They do not determine a head-to-head winner. Substitutions use the outgoing player’s position as an estimate. Data follows the match’s five-minute refresh window; reload for updates.</p>
    </> : <p className="mt-5 rounded-xl bg-muted p-4 text-sm text-muted-foreground">Matchups will appear when both teams have complete lineup positions. We won’t guess player pairings from names alone.</p>}
  </section>;
}

import { SocialPulse } from "./social-pulse";
import { WinPredictor } from "./win-predictor";
import Image from "next/image";
import { FormationPitch } from "./formation-pitch";
import { MatchOverview, MatchupPreview } from "./match-overview";
import { KeyMatchups } from "./key-matchups";
import { MatchDetailTabs } from "./match-detail-tabs";
import { GoalScorers } from "./goal-scorers";
import { SubstitutionMarkers } from "./substitution-markers";
import type { MatchDetails } from "@/types/football";
import { KickoffTime } from "./kickoff-time";
import { isLive } from "@/lib/matches";

const panel = "rounded-2xl border border-border bg-card p-5 text-card-foreground sm:p-7";
const empty = "mt-4 text-sm text-muted-foreground";

export function MatchDetailsView({ match }: { match: MatchDetails }) {
  const { home, away } = match.teams;
  const events = match.events ?? [];
  const lineups = match.lineups ?? [];
  const statistics = match.statistics ?? [];
  const homeStats = statistics.find((item) => item.team.id === home.id)?.statistics ?? [];
  const awayStats = statistics.find((item) => item.team.id === away.id)?.statistics ?? [];
  const labels = [...new Set([...homeStats, ...awayStats].map((item) => item.type))];
  const penalties = match.score?.penalty;
  return <div className="space-y-6">
    <section className={panel} aria-label="Match overview">
      <p className="text-sm font-medium text-primary">{match.league.country} · {match.league.name}</p>
      <h1 className="sr-only">{home.name} vs {away.name}</h1>
      <p className="mt-1 text-xs text-muted-foreground"><KickoffTime date={match.fixture.date} /></p>
      <div className="my-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
        <div className="flex min-w-0 flex-col items-center gap-2 sm:gap-3">
          {home.logo && <Image src={home.logo} alt="" width={80} height={80} unoptimized className="size-14 object-contain sm:size-20" />}
          <p className="max-w-full text-sm font-semibold sm:text-xl [overflow-wrap:anywhere]">{home.name}</p>
        </div>
        <p className="text-3xl font-bold tabular-nums sm:text-5xl">{match.goals.home ?? "–"} : {match.goals.away ?? "–"}</p>
        <div className="flex min-w-0 flex-col items-center gap-2 sm:gap-3">
          {away.logo && <Image src={away.logo} alt="" width={80} height={80} unoptimized className="size-14 object-contain sm:size-20" />}
          <p className="max-w-full text-sm font-semibold sm:text-xl [overflow-wrap:anywhere]">{away.name}</p>
        </div>
      </div>
      <GoalScorers match={match} />
      <p className={`text-center text-sm font-semibold ${isLive(match) ? "text-destructive" : "text-muted-foreground"}`}>
        {match.fixture.status.long}{isLive(match) && match.fixture.status.elapsed !== null ? ` · ${match.fixture.status.elapsed}′` : ""}
      </p>
      {penalties?.home != null && penalties.away != null && <p className="mt-2 text-center text-sm">Penalties: {penalties.home} – {penalties.away}</p>}
      <div className="mt-5 flex justify-center"><SocialPulse match={match} /></div>
    </section>
    <MatchDetailTabs
      overview={<><MatchOverview match={match} /><WinPredictor key={match.fixture.id} match={match} /></>}
      preview={<MatchupPreview match={match} />}
      matchups={<KeyMatchups match={match} />}
      statistics={<section className={panel}>
      <h2 className="text-xl font-semibold">Statistics</h2>
      {!labels.length ? <p className={empty}>Statistics are not available for this match yet.</p> : <div className="mt-5 overflow-x-auto"><table className="w-full text-sm">
        <caption className="sr-only">Team match statistics</caption>
        <thead><tr className="border-b border-border"><th scope="col" className="p-3 text-left">Statistic</th><th scope="col" className="p-3">{home.name}</th><th scope="col" className="p-3">{away.name}</th></tr></thead>
        <tbody>{labels.map((label) => <tr key={label} className="border-b border-border last:border-0"><th scope="row" className="p-3 text-left font-normal text-muted-foreground">{label}</th><td className="p-3 text-center tabular-nums">{homeStats.find((stat) => stat.type === label)?.value ?? "–"}</td><td className="p-3 text-center tabular-nums">{awayStats.find((stat) => stat.type === label)?.value ?? "–"}</td></tr>)}</tbody>
      </table></div>}
    </section>}
      lineups={<section className={panel}>
      <h2 className="text-xl font-semibold">Lineups</h2>
      <FormationPitch match={match} />
      <div className="mt-5 grid gap-8 md:grid-cols-2">{[home, away].map((team) => {
        const lineup = lineups.find((item) => item.team.id === team.id);
        return <div key={team.id}><h3 className="font-semibold">{team.name}{lineup?.formation ? ` · ${lineup.formation}` : ""}</h3>
          {lineup?.coach?.name && <p className="mt-2 text-sm text-muted-foreground">Coach: {lineup.coach.name}</p>}
          {!lineup?.startXI?.length ? <p className={empty}>Starting lineup not available yet.</p> : <><h4 className="mt-5 text-sm font-semibold text-primary">Starting XI</h4><ul className="mt-2 space-y-2">{lineup.startXI.map(({ player }, index) => <li key={index} className="text-sm"><span className="mr-3 inline-block w-6 text-muted-foreground">{player.number ?? "–"}</span>{player.name}{player.pos ? ` · ${player.pos}` : ""}<SubstitutionMarkers events={events} teamId={team.id} playerId={player.id} /></li>)}</ul></>}
          {!!lineup?.substitutes?.length && <><h4 className="mt-5 text-sm font-semibold text-primary">Substitutes</h4><ul className="mt-2 space-y-2">{lineup.substitutes.map(({ player }, index) => <li key={index} className="text-sm"><span className="mr-3 inline-block w-6 text-muted-foreground">{player.number ?? "–"}</span>{player.name}<SubstitutionMarkers events={events} teamId={team.id} playerId={player.id} /></li>)}</ul></>}
        </div>;
      })}</div>
    </section>}
      events={<section className={panel}>
      <h2 className="text-xl font-semibold">Match events</h2>
      {events.length === 0 ? <p className={empty}>No events available yet. Coverage varies by competition.</p> :
        <ol className="mt-5 divide-y divide-border">{events.map((event, index) => <li key={index} className="flex gap-4 py-4">
          <span className="w-14 shrink-0 font-semibold text-primary">{event.time.elapsed ?? "–"}{event.time.extra ? `+${event.time.extra}` : ""}′</span>
          <div><p className="font-medium">{event.detail || event.type} · {event.player.name ?? "Unknown player"}</p>
            <p className="mt-1 text-sm text-muted-foreground">{event.team.name}{event.assist.name ? ` · ${event.type === "subst" ? "On" : "Assist"}: ${event.assist.name}` : ""}</p>
          </div>
        </li>)}</ol>}
    </section>}
    />
  </div>;
}

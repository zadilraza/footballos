import { PlayerAvatar } from "./player-avatar";
import type { MatchDetails } from "@/types/football";
import { formationPositions } from "@/lib/formation-pitch";

export function FormationPitch({ match }: { match: MatchDetails }) {
  const teams = (["home", "away"] as const).map((side) => {
    const team = match.teams[side];
    const lineup = match.lineups?.find((item) => item.team.id === team.id);
    return { side, team, lineup, positions: lineup ? formationPositions(lineup, side) : null };
  });
  return <figure className="mt-5" aria-label="Head-to-head starting formations">
    <div className="mb-3 flex flex-wrap justify-between gap-3 text-sm">
      {teams.map(({ side, team, lineup }) => <p key={side} className="font-semibold"><span className={`mr-2 inline-block size-3 rounded-full ${side === "home" ? "bg-primary" : "bg-secondary border border-foreground"}`} aria-hidden="true" />{team.name} <span className="text-muted-foreground">{lineup?.formation ?? "Formation unavailable"} · {side === "home" ? "↓" : "↑"}</span></p>)}
    </div>
    <div className="overflow-x-auto rounded-2xl border border-border focus-visible:outline-2 focus-visible:outline-ring" tabIndex={0} role="region" aria-label="Formation pitch; scroll horizontally on small screens">
      <div className="relative mx-auto aspect-[7/10] min-w-[520px] max-w-[760px] overflow-hidden bg-pitch text-pitch-foreground">
        <svg aria-hidden="true" viewBox="0 0 700 1000" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full fill-none stroke-pitch-line" strokeWidth="2">
          <path d="M20 20H680V980H20Z M20 500H680" />
          <circle cx="350" cy="500" r="75" /><circle cx="350" cy="500" r="3" className="fill-pitch-line" />
          <path d="M200 20V160H500V20 M280 20V70H420V20 M310 20V5H390V20 M200 980V840H500V980 M280 980V930H420V980 M310 980V995H390V980" />
          <path d="M290 160Q350 215 410 160 M290 840Q350 785 410 840" />
          <circle cx="350" cy="120" r="3" className="fill-pitch-line" /><circle cx="350" cy="880" r="3" className="fill-pitch-line" />
        </svg>
        {teams.map(({ side, team, positions }) => positions ? <div key={side} aria-label={`${team.name} starting XI`}>
          {positions.map(({ player, x, y }) => <div key={`${side}-${player.id}`} className="absolute flex w-[16%] -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center" style={{ left: `${x}%`, top: `${y}%` }}>
            <PlayerAvatar playerId={player.id} name={player.name} number={player.number} side={side} />
            <span className="mt-1 w-full rounded-md bg-background/95 px-1 py-1 text-[11px] font-medium leading-tight text-foreground sm:text-xs [overflow-wrap:anywhere]">{player.name}</span>
            <span className="mt-0.5 text-[10px] font-semibold">{player.pos === "G" ? "GK" : player.pos === "D" ? "DEF" : player.pos === "M" ? "MID" : player.pos === "F" ? "FWD" : ""}</span>
          </div>)}
        </div> : <p key={side} className="absolute left-1/2 w-3/4 -translate-x-1/2 rounded-xl bg-background/95 p-4 text-center text-sm text-foreground" style={{ top: side === "home" ? "22%" : "72%" }}>{team.name}: formation positions are not available yet.</p>)}
      </div>
    </div>
    <figcaption className="mt-3 text-xs text-muted-foreground">Published starting formations, facing opposite directions. These are starting positions, not live player tracking. Substitution details are listed below. On small screens, swipe across the pitch.</figcaption>
  </figure>;
}

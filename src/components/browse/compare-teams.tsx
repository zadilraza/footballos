"use client";
import { useState } from "react";
import Link from "next/link";
import type { Fixture } from "@/types/football";
import { teamSummary, teamsFromMatches } from "@/lib/team-summary";
export function CompareTeams({ matches, offset }: { matches: Fixture[]; offset: number }) {
  const teams = teamsFromMatches(matches);
  const [left, setLeft] = useState(teams[0]?.id ?? 0);
  const [right, setRight] = useState(teams[1]?.id ?? 0);
  if (teams.length < 2) return <p className="rounded-xl border border-border p-6 text-muted-foreground">At least two teams with fixtures are needed. Try another date.</p>;
  const a = teamSummary(matches, left), b = teamSummary(matches, right);
  const rows = [["Scheduled fixtures", a.fixtures, b.fixtures], ["Completed matches", a.completed, b.completed], ["Wins", a.wins, b.wins], ["Draws", a.draws, b.draws], ["Losses", a.losses, b.losses], ["Goals scored", a.goalsFor, b.goalsFor], ["Goals conceded", a.goalsAgainst, b.goalsAgainst]];
  return <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2">{(["left", "right"] as const).map((side) => <label key={side} className="text-sm font-semibold">{side === "left" ? "First team" : "Second team"}
      <select value={side === "left" ? left : right} onChange={(event) => (side === "left" ? setLeft : setRight)(Number(event.target.value))} className="mt-2 block w-full rounded-xl border border-input bg-background p-3 text-foreground">
        {teams.map((team) => <option key={team.id} value={team.id} disabled={team.id === (side === "left" ? right : left)}>{team.name}</option>)}
      </select></label>)}</div>
    <div className="overflow-x-auto rounded-xl border border-border bg-card text-card-foreground"><table className="w-full text-sm"><caption className="p-4 text-left text-muted-foreground">Selected date only · not season totals or head-to-head history</caption><thead><tr className="border-b border-border"><th className="p-4 text-left" scope="col">Metric</th>{[left, right].map((id) => <th key={id} scope="col" className="p-4"><Link href={`/teams?id=${id}&offset=${offset}`} className="text-primary">{teams.find((team) => team.id === id)?.name}</Link></th>)}</tr></thead><tbody>{rows.map(([label, first, second]) => <tr key={label} className="border-b border-border last:border-0"><th scope="row" className="p-4 text-left font-normal">{label}</th><td className="p-4 text-center tabular-nums">{first}</td><td className="p-4 text-center tabular-nums">{second}</td></tr>)}</tbody></table></div>
    <p className="text-xs text-muted-foreground">Results and goals include completed matches only, including extra time. Penalty shootouts are excluded; level scores count as draws. Zero completed matches means no result data for this date.</p>
  </div>;
}

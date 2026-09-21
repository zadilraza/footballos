import type { MatchDetails } from "@/types/football";
import { eventMinute, scoringEvents } from "@/lib/match-events";
export function GoalScorers({ match }: { match: MatchDetails }) {
  return <div className="mb-6 grid grid-cols-2 gap-6 text-center" aria-label="Goal scorers">
    {(["home", "away"] as const).map((side) => {
      const team = match.teams[side];
      const goals = scoringEvents(match.events ?? [], team.id);
      return <div key={team.id}><h2 className="sr-only">{team.name} goal scorers</h2>
        {goals.length ? <ul className="space-y-1 text-sm text-muted-foreground">{goals.map((goal, index) => <li key={index}>
          {goal.player.name ?? "Unknown scorer"} <span className="font-medium text-foreground">{eventMinute(goal)}</span>{goal.detail === "Own Goal" ? " (OG)" : goal.detail === "Penalty" ? " (pen.)" : ""}
        </li>)}</ul> : <p className="text-xs text-muted-foreground">{match.goals[side] != null && match.goals[side]! > 0 ? "Scorer details unavailable" : "No goals yet"}</p>}
      </div>;
    })}
  </div>;
}

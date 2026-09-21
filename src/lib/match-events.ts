import type { MatchEvent } from "@/types/football";
export function eventMinute(event: MatchEvent) {
  return `${event.time.elapsed ?? "–"}${event.time.extra ? `+${event.time.extra}` : ""}′`;
}
export function scoringEvents(events: MatchEvent[], teamId: number) {
  // Provider event.team is the team credited with the goal, including own goals.
  return events.filter((event) => event.team.id === teamId && event.type === "Goal" &&
    ["Normal Goal", "Own Goal", "Penalty"].includes(event.detail) &&
    !/shootout|shoot-out|shoot out/i.test(event.comments ?? ""));
}
export function playerSubstitutions(events: MatchEvent[], teamId: number, playerId: number | null) {
  if (playerId == null) return [];
  return events.filter((event) => event.type.toLowerCase() === "subst" && event.team.id === teamId)
    .flatMap<{ direction: "in" | "out"; event: MatchEvent }>((event) => event.player.id === playerId ? [{ direction: "out" as const, event }]
      : event.assist.id === playerId ? [{ direction: "in" as const, event }] : []);
}

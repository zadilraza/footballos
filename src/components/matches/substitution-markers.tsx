import { ArrowDown, ArrowUp } from "lucide-react";
import type { MatchEvent } from "@/types/football";
import { eventMinute, playerSubstitutions } from "@/lib/match-events";
export function SubstitutionMarkers({ events, teamId, playerId }: { events: MatchEvent[]; teamId: number; playerId: number | null }) {
  return playerSubstitutions(events, teamId, playerId).map(({ direction, event }, index) => {
    const label = `Subbed ${direction} ${eventMinute(event)}`;
    const Icon = direction === "in" ? ArrowUp : ArrowDown;
    return <span key={index} title={label} aria-label={label} className={`ml-2 inline-flex items-center gap-1 text-xs font-medium ${direction === "in" ? "text-substitution-in" : "text-substitution-out"}`}><Icon aria-hidden="true" className="size-4" /><span aria-hidden="true">{eventMinute(event)}</span></span>;
  });
}

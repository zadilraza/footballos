import type { Fixture } from "@/types/football";
import { MatchCard } from "./match-card";
export function LiveMatches({ liveMatches }: { liveMatches: Fixture[] }) {

  return (
    <section className="py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-destructive">
            ● Live Now
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            {liveMatches.length === 0
              ? "No matches currently live"
              : `${liveMatches.length} matches in progress`}
          </h2>
        </div>
      </div>

      {liveMatches.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {liveMatches.slice(0, 6).map((match) => (
            <MatchCard key={match.fixture.id} match={match} />
          ))}
        </div>
      )}
    </section>
  );
}

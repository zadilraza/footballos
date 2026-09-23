"use client";
import { ProbabilityMeter } from "./probability-meter";
import { useState } from "react";
import Link from "next/link";
import type { Fixture } from "@/types/football";
export function WinPredictor({ match }: { match: Fixture }) {
  const [values, setValues] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const finished = ["FT", "AET", "PEN", "CANC", "ABD", "AWD", "WO"].includes(match.fixture.status.short);
  async function load() {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/predictions?fixture=${match.fixture.id}`);
      const data = await response.json();
      if (!response.ok || data.homeId !== match.teams.home.id || data.awayId !== match.teams.away.id) throw new Error();
      setValues(data.values);
    } catch { setError("Prediction unavailable for this match. Try again later."); }
    finally { setLoading(false); }
  }
  return <section className="rounded-2xl border border-border bg-card p-5 text-card-foreground sm:p-7"><h2 className="text-lg font-semibold">Win predictor</h2>
    <p className="mt-2 text-xs text-muted-foreground">According to API-Football · pre-match estimate, not live win probability.</p>
    {finished ? <p className="mt-4 text-sm text-muted-foreground">Predictions are not shown for completed or cancelled matches.</p> : values ? <ProbabilityMeter values={values} home={match.teams.home.name} away={match.teams.away.name} /> : <button type="button" disabled={loading} onClick={load} className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{loading ? "Loading prediction…" : "Show prediction"}</button>}
    {error && <p role="status" className="mt-3 text-sm text-destructive">{error}</p>}
    <p className="mt-4 text-xs text-muted-foreground">Provider estimates are cached for six hours and are not guaranteed outcomes. <Link href="/odds" className="font-medium text-primary">Explore market odds →</Link></p>
  </section>;
}

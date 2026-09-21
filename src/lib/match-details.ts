import "server-only";
import type { MatchDetails } from "@/types/football";

export type MatchResult =
  | { kind: "found"; match: MatchDetails }
  | { kind: "missing" }
  | { kind: "unavailable" };

export async function getMatchDetails(id: string): Promise<MatchResult> {
  if (!/^[1-9]\d{0,9}$/.test(id)) return { kind: "missing" };
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) return { kind: "unavailable" };
  try {
    // The fixture ID endpoint bundles events, lineups and statistics.
    // Five-minute shared cache conserves the current free-plan quota.
    const response = await fetch(`https://v3.football.api-sports.io/fixtures?id=${id}`, {
      headers: { "x-apisports-key": apiKey },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return { kind: "unavailable" };
    const data = await response.json();
    // API-Football can return plan/quota errors with HTTP 200.
    if (data.errors && Object.keys(data.errors).length) return { kind: "unavailable" };
    if (!Array.isArray(data.response)) return { kind: "unavailable" };
    const match = data.response.find((item: MatchDetails) => item.fixture?.id === Number(id));
    return match ? { kind: "found", match } : { kind: "missing" };
  } catch {
    return { kind: "unavailable" };
  }
}

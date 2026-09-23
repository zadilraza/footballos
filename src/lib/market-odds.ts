import "server-only";
type RecordData = Record<string, unknown>;
export type MarketQuote = { label: string; price: number | null; basis: string };
export type MarketEvent = { source: string; title: string; url: string; rules: string; quotes: MarketQuote[] };
function records(value: unknown): RecordData[] { return Array.isArray(value) ? value.filter((v): v is RecordData => !!v && typeof v === "object") : []; }
function text(value: unknown) { return typeof value === "string" ? value : ""; }
function price(value: unknown) { if (value == null || value === "") return null; const n = Number(value); return Number.isFinite(n) && n >= 0 && n <= 1 ? n * 100 : null; }
function strings(value: unknown): string[] { try { const parsed = typeof value === "string" ? JSON.parse(value) : value; return Array.isArray(parsed) ? parsed.map(String) : []; } catch { return []; } }
async function get(url: string): Promise<unknown> {
  const response = await fetch(url, { next: { revalidate: 300 }, signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error("Source unavailable");
  return response.json();
}
const series = ["KXEPLGAME", "KXLALIGAGAME", "KXUCLGAME", "KXMLSGAME"];
export async function getMarketOdds() {
  const results = await Promise.allSettled(series.map(async (ticker) => {
    const data = await get(`https://external-api.kalshi.com/trade-api/v2/events?series_ticker=${ticker}&status=open&with_nested_markets=true&limit=50`) as RecordData;
    return records(data.events).map((event): MarketEvent => ({ source: "Kalshi", title: text(event.title) || text(event.sub_title), url: `https://kalshi.com/markets/${ticker.toLowerCase()}`, rules: records(event.markets).map((m) => text(m.rules_primary)).filter(Boolean)[0] ?? "See source for settlement rules.", quotes: records(event.markets).filter((m) => m.status === "active").map((m) => ({ label: text(m.yes_sub_title) || text(m.title), price: price(m.yes_ask_dollars), basis: "Yes ask" })) }));
  }));
  let polymarket: MarketEvent[] = [], polyError = false;
  try {
    const data = await get("https://gamma-api.polymarket.com/events?tag_slug=soccer&active=true&closed=false&limit=50");
    polymarket = records(data).map((event) => ({ source: "Polymarket", title: text(event.title), url: `https://polymarket.com/event/${encodeURIComponent(text(event.slug))}`, rules: text(event.description), quotes: records(event.markets).filter((m) => m.active === true && m.closed === false && m.sportsMarketType === "moneyline").flatMap((m) => {
      const outcomes = strings(m.outcomes), prices = strings(m.outcomePrices);
      return outcomes.map((outcome, i) => ({ label: `${text(m.question)} — ${outcome}`, price: price(prices[i]), basis: "Outcome price" }));
    }) })).filter((event) => event.quotes.length);
  } catch { polyError = true; }
  return { events: [...results.flatMap((r) => r.status === "fulfilled" ? r.value : []), ...polymarket].filter((e) => e.quotes.length), kalshiFailures: results.filter((r) => r.status === "rejected").length, polyError, checkedAt: new Date().toISOString() };
}

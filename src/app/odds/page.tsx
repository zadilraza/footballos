import { Navbar } from "@/components/layout/navbar";
import { OddsBoard } from "@/components/odds/odds-board";
import { getMarketOdds } from "@/lib/market-odds";
export const metadata = { title: "Odds | FootballOS" };
export const dynamic = "force-dynamic";
export default async function OddsPage() {
  const data = await getMarketOdds();
  return <main className="odds-arena min-h-screen bg-background text-foreground"><Navbar /><div className="mx-auto max-w-7xl px-6 py-10"><header className="relative overflow-hidden border-y border-border py-8 sm:py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="relative"><p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-primary">FootballOS / Market desk</p><h1 className="mt-4 text-5xl font-black uppercase leading-none tracking-tighter sm:text-7xl">The odds<span className="text-primary"> board.</span></h1><p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">Two sources. One view of the market. Explore football outcome prices from Kalshi and Polymarket.</p>
      <div className="mt-6 flex flex-wrap gap-2 font-mono text-xs"><span className="border border-primary/40 bg-primary/10 px-3 py-2 text-primary">{data.events.length} EVENTS</span><span className="border border-border bg-card px-3 py-2">5 MIN CACHE</span><span className="border border-border bg-card px-3 py-2">READ-ONLY MARKET DATA</span></div></div>
    </header>
    <details className="mt-5 border-l-2 border-primary pl-4 text-xs leading-6 text-muted-foreground"><summary className="cursor-pointer font-semibold text-foreground">How to read these prices</summary><p className="mt-2">A 60¢ contract price corresponds to roughly 60% implied probability, not a guaranteed outcome. These are not bookmaker decimal odds. Fees, bid–ask spreads and each market’s settlement rules apply.</p><p>Feeds cached for five minutes. Page checked {new Date(data.checkedAt).toUTCString()} (cached quotes may be older). Kalshi: Premier League, La Liga, Champions League and MLS, up to 50 open events per feed. Polymarket: up to 50 soccer events.</p></details>
    {data.polyError && <p role="status" className="mt-4 rounded-xl border border-border p-4 text-sm text-muted-foreground">Polymarket is currently unavailable from this server. No Polymarket prices are being substituted or estimated.</p>}
    {data.kalshiFailures > 0 && <p role="status" className="mt-3 text-sm text-muted-foreground">Some Kalshi feeds are unavailable. Showing the feeds that responded.</p>}
    <OddsBoard events={data.events} />
  </div></main>;
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { getMatchDetails } from "@/lib/match-details";
import { MatchDetailsView } from "@/components/matches/match-details";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export const metadata = { title: "Match Center | FootballOS" };

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getMatchDetails(id);
  if (result.kind === "missing") notFound();
  return <main className="min-h-screen bg-background text-foreground">
    <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8">
      <nav aria-label="Match navigation" className="mb-8 flex items-center justify-between gap-4">
        <Link href="/" className="text-sm font-semibold text-primary">← All matches</Link>
        <AnimatedThemeToggler className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground [&_svg]:size-5" />
      </nav>
      {result.kind === "found" ? <MatchDetailsView match={result.match} /> : <section className="rounded-2xl border border-border bg-card p-8 text-card-foreground">
        <h1 className="text-2xl font-bold">Match details unavailable</h1>
        <p className="mt-3 text-muted-foreground">The football data provider could not supply this match. Coverage, subscription limits, or a temporary connection issue may be the cause.</p>
        <a href={`/matches/${id}`} className="mt-6 inline-block rounded-full bg-primary px-5 py-2 font-medium text-primary-foreground">Try again</a>
      </section>}
    </div>
  </main>;
}

import Link from "next/link";
export default function MatchNotFound() {
  return <main className="min-h-screen bg-background px-6 py-24 text-center text-foreground"><h1 className="text-2xl font-bold">Match not found</h1><p className="mt-3 text-muted-foreground">This match could not be found. Choose another fixture from the schedule.</p><Link href="/" className="mt-6 inline-block text-primary">← All matches</Link></main>;
}

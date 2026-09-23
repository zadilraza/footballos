import { FootballDirectory } from "@/components/browse/football-directory";
export const metadata = { title: "Competitions | FootballOS" };
export default async function Page({ searchParams }: { searchParams: Promise<{ id?: string; offset?: string }> }) {
  const { id, offset } = await searchParams;
  const selectedId = id && /^[1-9]\d{0,9}$/.test(id) ? Number(id) : undefined;
  return <FootballDirectory kind="competitions" selectedId={selectedId} initialOffset={offset === "-1" ? -1 : offset === "1" ? 1 : 0} />;
}

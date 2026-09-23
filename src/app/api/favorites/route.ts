import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
  const kind = request.nextUrl.searchParams.get("kind");
  const id = request.nextUrl.searchParams.get("id") ?? "";
  if (!["teams", "competitions"].includes(kind ?? "") || !/^[1-9]\d{0,9}$/.test(id)) return NextResponse.json({ error: "Invalid favorite" }, { status: 400 });
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) return NextResponse.json({ error: "Data unavailable" }, { status: 503 });
  try {
    const response = await fetch(`https://v3.football.api-sports.io/${kind === "teams" ? "teams" : "leagues"}?id=${id}`, { headers: { "x-apisports-key": key }, next: { revalidate: 86400 }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error();
    const data = await response.json();
    if (data.errors && Object.keys(data.errors).length) throw new Error();
    const profile = data.response?.[0]?.[kind === "teams" ? "team" : "league"];
    if (!profile?.name) throw new Error();
    return NextResponse.json({ name: profile.name, logo: profile.logo ?? "" });
  } catch { return NextResponse.json({ error: "Details unavailable" }, { status: 503 }); }
}

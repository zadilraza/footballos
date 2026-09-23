import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("fixture") ?? "";
  if (!/^[1-9]\d{0,9}$/.test(id)) return NextResponse.json({ error: "Invalid fixture" }, { status: 400 });
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) return NextResponse.json({ error: "Prediction unavailable" }, { status: 503 });
  try {
    const response = await fetch(`https://v3.football.api-sports.io/predictions?fixture=${id}`, { headers: { "x-apisports-key": key }, next: { revalidate: 21600 }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error();
    const data = await response.json();
    if (data.errors && Object.keys(data.errors).length) throw new Error();
    const item = data.response?.[0];
    const percent = item?.predictions?.percent;
    const values = [percent?.home, percent?.draw, percent?.away].map((value) => typeof value === "string" && /^\d+(\.\d+)?%$/.test(value) ? Number(value.slice(0, -1)) : NaN);
    if (values.some((v) => !Number.isFinite(v) || v < 0 || v > 100) || Math.abs(values.reduce((a, b) => a + b, 0) - 100) > 1) throw new Error();
    return NextResponse.json({ values, homeId: item.teams?.home?.id, awayId: item.teams?.away?.id });
  } catch { return NextResponse.json({ error: "No prediction available for this fixture. Coverage and plan limits vary." }, { status: 503 }); }
}

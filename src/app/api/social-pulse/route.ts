import { NextRequest, NextResponse } from "next/server";
import { getMatchDetails } from "@/lib/match-details";
import { isSocialPost, type SocialFeed, type SocialPost } from "@/lib/social-pulse";
import curated from "@/data/social-posts.json";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("fixture") ?? "";
  if (!/^[1-9]\d{0,9}$/.test(id)) return NextResponse.json({ error: "Invalid fixture" }, { status: 400 });
  const posts: SocialPost[] = (curated as unknown[]).filter(isSocialPost).filter((post) => post.fixtureId === Number(id));
  const token = process.env.X_BEARER_TOKEN;
  let xStatus: SocialFeed["xStatus"] = token ? "ready" : "unconfigured";
  if (token) {
    try {
      const result = await getMatchDetails(id);
      if (result.kind !== "found") throw new Error("Match unavailable");
      const match = result.match;
      const kickoff = Date.parse(match.fixture.date);
      // Stable query timestamps allow the shared five-minute cache to work.
      const now = Math.floor(Date.now() / 300000) * 300000;
      // Restrict results to this fixture's matchday, rather than a generic team feed.
      const start = Math.max(kickoff - 12 * 3600000, now - 6.9 * 86400000);
      const end = Math.min(kickoff + 24 * 3600000, now - 30000);
      if (start >= end) {
        xStatus = "outside-window";
      } else {
        const quote = (name: string) => `"${name.replace(/[^\p{L}\p{N}\s.-]/gu, " ").trim()}"`;
        const query = `${quote(match.teams.home.name)} ${quote(match.teams.away.name)} -is:retweet`;
        const params = new URLSearchParams({ query, max_results: "20", "tweet.fields": "created_at,author_id", expansions: "author_id", "user.fields": "name,username", start_time: new Date(start).toISOString(), end_time: new Date(end).toISOString() });
        const response = await fetch(`https://api.x.com/2/tweets/search/recent?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
          next: { revalidate: 300 }, signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) throw new Error("Source unavailable");
        const data = await response.json();
        if (data.errors?.length) xStatus = "unavailable";
        for (const tweet of data.data ?? []) {
          const author = data.includes?.users?.find((user: { id: string }) => user.id === tweet.author_id);
          const post = { fixtureId: Number(id), platform: "x", url: `https://x.com/${author?.username ?? "i"}/status/${tweet.id}`, author: author ? `${author.name} (@${author.username})` : "X", text: tweet.text, publishedAt: tweet.created_at };
          if (isSocialPost(post)) posts.push(post);
        }
      }
    } catch { xStatus = "unavailable"; }
  }
  const unique = [...new Map(posts.map((post) => [post.url, post])).values()];
  unique.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  return NextResponse.json({ posts: unique, xStatus } satisfies SocialFeed);
}

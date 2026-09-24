import { NextRequest, NextResponse } from "next/server";
import { isSocialPost, type SocialFeed, type SocialPost } from "@/lib/social-pulse";
import curated from "@/data/social-posts.json";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("fixture") ?? "";
  if (!/^[1-9]\d{0,9}$/.test(id)) return NextResponse.json({ error: "Invalid fixture" }, { status: 400 });
  const posts: SocialPost[] = (curated as unknown[]).filter(isSocialPost).filter((post) => post.fixtureId === Number(id));
  // Deliberately curated-only: this endpoint never calls paid social APIs.
  const unique = [...new Map(posts.map((post) => [post.url, post])).values()];
  unique.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  return NextResponse.json({ posts: unique } satisfies SocialFeed);
}

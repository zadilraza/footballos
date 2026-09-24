import type { Fixture } from "@/types/football";

export type SocialPlatform = "x" | "instagram" | "tiktok";
export type SocialPost = {
  fixtureId: number;
  platform: SocialPlatform;
  url: string;
  author: string;
  text: string;
  publishedAt: string;
};
export type SocialFeed = {
  posts: SocialPost[];
};
export const SOCIAL_PLATFORMS = [
  { id: "x", label: "X" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
] as const;

// Accept only direct post URLs; never use arbitrary feed URLs as iframe sources.
export function postEmbed(url: string, platform: SocialPlatform): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.port) return null;
    if (platform === "instagram" && /^(www\.)?instagram\.com$/.test(parsed.hostname)) {
      const match = parsed.pathname.match(/^\/(p|reel)\/([\w-]+)\/?$/);
      return match ? `https://www.instagram.com/${match[1]}/${match[2]}/embed/` : null;
    }
    if (platform === "tiktok" && /^(www\.)?tiktok\.com$/.test(parsed.hostname)) {
      const match = parsed.pathname.match(/^\/@[\w.-]+\/video\/(\d+)\/?$/);
      return match ? `https://www.tiktok.com/player/v1/${match[1]}` : null;
    }
    if (platform === "x" && /^(www\.)?(x|twitter)\.com$/.test(parsed.hostname) && /^\/[\w]+\/status\/\d+\/?$/.test(parsed.pathname)) return parsed.href;
  } catch { /* Invalid URL. */ }
  return null;
}

export function isSocialPost(value: unknown): value is SocialPost {
  if (!value || typeof value !== "object") return false;
  const post = value as SocialPost;
  return Number.isSafeInteger(post.fixtureId) && post.fixtureId > 0 &&
    SOCIAL_PLATFORMS.some(({ id }) => id === post.platform) &&
    typeof post.url === "string" && postEmbed(post.url, post.platform) !== null &&
    typeof post.author === "string" && !!post.author.trim() &&
    typeof post.text === "string" && !!post.text.trim() &&
    typeof post.publishedAt === "string" && Number.isFinite(Date.parse(post.publishedAt));
}

export function matchSearch(match: Fixture, platform: SocialPlatform): string {
  const home = match.teams.home.name.replace(/["\\]/g, "");
  const away = match.teams.away.name.replace(/["\\]/g, "");
  const day = match.fixture.date.slice(0, 10);
  if (platform === "x") {
    const until = new Date(Date.parse(`${day}T00:00:00Z`) + 2 * 86400000).toISOString().slice(0, 10);
    return `https://x.com/search?q=${encodeURIComponent(`"${home}" "${away}" since:${day} until:${until}`)}&f=live`;
  }
  if (platform === "tiktok") return `https://www.tiktok.com/search?q=${encodeURIComponent(`${home} ${away} ${day}`)}`;
  return `https://www.google.com/search?q=${encodeURIComponent(`site:instagram.com/p/ OR site:instagram.com/reel/ "${home}" "${away}" ${day}`)}`;
}

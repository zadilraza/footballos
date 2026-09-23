import type { Fixture } from "@/types/football";
export type FavoriteProfile = { name: string; logo: string };
export type Favorites = { teams: number[]; competitions: number[]; profiles?: Record<string, FavoriteProfile> };
export type FavoriteKind = "teams" | "competitions";
export const EMPTY_FAVORITES: Favorites = { teams: [], competitions: [] };
export function parseFavorites(raw: string): Favorites {
  try {
    const value = JSON.parse(raw);
    const ids = (items: unknown): number[] => Array.isArray(items)
      ? [...new Set(items.filter((id): id is number => Number.isSafeInteger(id) && id > 0))] : [];
    const profiles: Record<string, FavoriteProfile> = {};
    if (value?.profiles && typeof value.profiles === "object") {
      for (const [key, profile] of Object.entries(value.profiles)) {
        if (/^(teams|competitions):[1-9]\d*$/.test(key) && profile && typeof profile === "object" && "name" in profile && typeof profile.name === "string" && "logo" in profile && typeof profile.logo === "string") profiles[key] = { name: profile.name, logo: profile.logo };
      }
    }
    return { teams: ids(value?.teams), competitions: ids(value?.competitions), profiles };
  } catch { return EMPTY_FAVORITES; }
}
export function toggleFavorite(favorites: Favorites, kind: FavoriteKind, id: number): Favorites {
  return { ...favorites, [kind]: favorites[kind].includes(id) ? favorites[kind].filter((item) => item !== id) : [...favorites[kind], id] };
}
export function isFavoriteMatch(match: Fixture, favorites: Favorites) {
  return favorites.competitions.includes(match.league.id) || favorites.teams.includes(match.teams.home.id) || favorites.teams.includes(match.teams.away.id);
}

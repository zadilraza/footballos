import type { Fixture } from "@/types/football";
export type Favorites = { teams: number[]; competitions: number[] };
export type FavoriteKind = keyof Favorites;
export const EMPTY_FAVORITES: Favorites = { teams: [], competitions: [] };
export function parseFavorites(raw: string): Favorites {
  try {
    const value = JSON.parse(raw);
    const ids = (items: unknown): number[] => Array.isArray(items)
      ? [...new Set(items.filter((id): id is number => Number.isSafeInteger(id) && id > 0))] : [];
    return { teams: ids(value?.teams), competitions: ids(value?.competitions) };
  } catch { return EMPTY_FAVORITES; }
}
export function toggleFavorite(favorites: Favorites, kind: FavoriteKind, id: number): Favorites {
  return { ...favorites, [kind]: favorites[kind].includes(id) ? favorites[kind].filter((item) => item !== id) : [...favorites[kind], id] };
}
export function isFavoriteMatch(match: Fixture, favorites: Favorites) {
  return favorites.competitions.includes(match.league.id) || favorites.teams.includes(match.teams.home.id) || favorites.teams.includes(match.teams.away.id);
}

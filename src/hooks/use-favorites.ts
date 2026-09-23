"use client";
import { useMemo, useSyncExternalStore } from "react";
import { parseFavorites, toggleFavorite, type FavoriteKind, type FavoriteProfile } from "@/lib/favorites";
const KEY = "footballos:favorites:v1";
const CHANGE = "footballos:favorites-change";
const EMPTY = '{"teams":[],"competitions":[]}';
let memory = EMPTY;
let storageUnavailable = false;
function snapshot() {
  if (!storageUnavailable) {
    try { memory = localStorage.getItem(KEY) ?? EMPTY; } catch { storageUnavailable = true; }
  }
  return memory;
}
function subscribe(notify: () => void) {
  const onStorage = (event: StorageEvent) => { if (event.key === KEY || event.key === null) notify(); };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE, notify);
  return () => { window.removeEventListener("storage", onStorage); window.removeEventListener(CHANGE, notify); };
}
function save(value: ReturnType<typeof parseFavorites>) {
  memory = JSON.stringify(value);
  try { localStorage.setItem(KEY, memory); } catch { storageUnavailable = true; }
  window.dispatchEvent(new Event(CHANGE));
}
function remember(kind: FavoriteKind, id: number, profile: FavoriteProfile) {
  const current = parseFavorites(snapshot());
  if (!current[kind].includes(id)) return;
  save({ ...current, profiles: { ...current.profiles, [`${kind}:${id}`]: profile } });
}
function toggle(kind: FavoriteKind, id: number, profile?: FavoriteProfile) {
  const next = toggleFavorite(parseFavorites(snapshot()), kind, id);
  if (profile) next.profiles = { ...next.profiles, [`${kind}:${id}`]: { name: profile.name, logo: profile.logo } };
  save(next);
}
export function useFavorites() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  const favorites = useMemo(() => parseFavorites(raw), [raw]);
  return { favorites, toggle, remember, storageUnavailable };
}

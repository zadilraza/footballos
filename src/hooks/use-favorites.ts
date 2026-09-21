"use client";
import { useMemo, useSyncExternalStore } from "react";
import { parseFavorites, toggleFavorite, type FavoriteKind } from "@/lib/favorites";
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
function toggle(kind: FavoriteKind, id: number) {
  memory = JSON.stringify(toggleFavorite(parseFavorites(snapshot()), kind, id));
  try { localStorage.setItem(KEY, memory); } catch { storageUnavailable = true; }
  window.dispatchEvent(new Event(CHANGE));
}
export function useFavorites() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  const favorites = useMemo(() => parseFavorites(raw), [raw]);
  return { favorites, toggle, storageUnavailable };
}

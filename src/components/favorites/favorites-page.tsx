"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useFavorites } from "@/hooks/use-favorites";
import type { FavoriteKind, FavoriteProfile } from "@/lib/favorites";
import { FavoriteButton } from "./favorite-button";
import { Navbar } from "@/components/layout/navbar";

function SavedFavorite({ kind, id, profile }: { kind: FavoriteKind; id: number; profile?: FavoriteProfile }) {
  const { toggle, remember } = useFavorites();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (profile) return;
    const controller = new AbortController();
    fetch(`/api/favorites?kind=${kind}&id=${id}`, { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (typeof data.name !== "string" || typeof data.logo !== "string") throw new Error();
      remember(kind, id, data);
    }).catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [kind, id, profile, remember, attempt]);
  const name = profile?.name ?? `${kind === "teams" ? "Team" : "Competition"} #${id}`;
  return <article className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground">
    <Link href={`/${kind}?id=${id}`} className="flex min-w-0 flex-1 items-center gap-3">
      {profile?.logo && <Image src={profile.logo} alt="" width={48} height={48} unoptimized className="size-12 shrink-0 object-contain" />}
      <div><h3 className="font-semibold">{name}</h3><p className="mt-1 text-xs text-muted-foreground">{profile ? "View fixtures →" : failed ? "Name unavailable right now" : "Loading saved favorite…"}</p></div>
    </Link>
    {failed && !profile && <button onClick={() => { setFailed(false); setAttempt((n) => n + 1); }} className="text-xs text-primary">Retry</button>}
    <FavoriteButton name={name} selected onToggle={() => toggle(kind, id)} />
  </article>;
}
export function FavoritesPage() {
  const { favorites, storageUnavailable } = useFavorites();
  return <main className="min-h-screen bg-background text-foreground"><Navbar />
    <div className="mx-auto max-w-7xl px-6 py-10"><h1 className="text-3xl font-bold">Your favorites</h1>
      <p className="mt-3 text-sm text-muted-foreground">Your starred teams and competitions, including those not playing today. Saved in this browser.</p>
      {storageUnavailable && <p role="status" className="mt-3 text-sm text-destructive">Browser storage is unavailable. Changes will last for this session only.</p>}
      {(["teams", "competitions"] as const).map((kind) => <section key={kind} className="mt-9"><h2 className="mb-4 text-xl font-semibold">{kind === "teams" ? "Teams" : "Competitions"} <span className="text-muted-foreground">({favorites[kind].length})</span></h2>
        {favorites[kind].length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{favorites[kind].map((id) => <SavedFavorite key={id} kind={kind} id={id} profile={favorites.profiles?.[`${kind}:${id}`]} />)}</div> : <div className="rounded-xl border border-dashed border-border p-6 text-muted-foreground"><p>No starred {kind} yet.</p><Link href={`/${kind}`} className="mt-3 inline-block font-medium text-primary">Browse {kind} →</Link></div>}
      </section>)}
    </div>
  </main>;
}

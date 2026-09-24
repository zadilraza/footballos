"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Activity, ArrowUpRight, MessageCircle, RefreshCw, X } from "lucide-react";
import type { Fixture } from "@/types/football";
import { matchSearch, postEmbed, SOCIAL_PLATFORMS, type SocialFeed, type SocialPlatform, type SocialPost } from "@/lib/social-pulse";

function Post({ post }: { post: SocialPost }) {
  const [embedded, setEmbedded] = useState(false);
  const embed = postEmbed(post.url, post.platform);
  return <article className="rounded-2xl border border-border bg-card p-4 text-card-foreground">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0"><p className="break-words text-sm font-semibold">{post.author}</p><time dateTime={post.publishedAt} className="text-xs text-muted-foreground">{new Date(post.publishedAt).toLocaleString()}</time></div>
      <span className="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground">{SOCIAL_PLATFORMS.find((p) => p.id === post.platform)?.label}</span>
    </div>
    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed">{post.text}</p>
    {embedded && embed && <iframe title={`${post.platform} post by ${post.author}`} src={embed} className="mt-4 h-[480px] w-full rounded-xl border border-border" allow="fullscreen; encrypted-media; picture-in-picture" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />}
    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-primary">
      {post.platform !== "x" && !embedded && <button type="button" onClick={() => setEmbedded(true)} className="rounded-md focus-visible:outline-2 focus-visible:outline-ring">Load post</button>}
      <a href={post.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md focus-visible:outline-2 focus-visible:outline-ring">View original <ArrowUpRight size={14} /></a>
    </div>
  </article>;
}

function PulseDialog({ match, onClose }: { match: Fixture; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [platform, setPlatform] = useState<SocialPlatform | "all">("all");
  const [feed, setFeed] = useState<SocialFeed | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const dialog = ref.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => { dialog?.close(); document.body.style.overflow = previousOverflow; };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/social-pulse?fixture=${match.fixture.id}`, { signal: controller.signal })
      .then(async (response) => { if (!response.ok) throw new Error(); return response.json() as Promise<SocialFeed>; })
      .then((data) => { setFeed(data); setLoading(false); })
      .catch(() => { if (!controller.signal.aborted) { setError(true); setLoading(false); } });
    return () => controller.abort();
  }, [match.fixture.id, attempt]);
  const posts = feed?.posts.filter((post) => platform === "all" || post.platform === platform) ?? [];
  const sources = SOCIAL_PLATFORMS.filter((item) => platform === "all" || item.id === platform);
  return createPortal(<dialog ref={ref} aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-foreground backdrop:bg-foreground/40">
    <section className="ml-auto flex h-full w-full max-w-lg flex-col border-l border-border bg-background shadow-2xl" onClick={(event) => event.stopPropagation()}>
      <header className="border-b border-border p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-2 text-primary"><Activity size={20} /><h2 id={titleId} className="text-xl font-semibold tracking-tight">Social Pulse</h2></div><button type="button" onClick={onClose} aria-label="Close Social Pulse" className="rounded-full p-2 text-muted-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"><X size={20} /></button></div>
        <p className="mt-4 font-semibold">{match.teams.home.name} <span className="font-normal text-muted-foreground">vs</span> {match.teams.away.name}</p>
        <p className="mt-1 text-xs text-muted-foreground">{match.league.name} · {new Date(match.fixture.date).toLocaleDateString()}</p>
        <p className="mt-3 text-sm text-muted-foreground">The conversation around this match.</p>
        <div role="group" aria-label="Filter social posts" className="mt-5 flex gap-2 overflow-x-auto">
          {[{ id: "all", label: "All" }, ...SOCIAL_PLATFORMS].map((item) => <button key={item.id} type="button" aria-pressed={platform === item.id} onClick={() => setPlatform(item.id as typeof platform)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring ${platform === item.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}>{item.label}</button>)}
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6" aria-busy={loading}>
        {loading ? <div role="status" className="space-y-3"><p className="text-sm text-muted-foreground">Finding match posts…</p>{[0, 1, 2].map((n) => <div key={n} className="h-32 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />)}</div> : <>
          {error ? <div role="alert" className="rounded-2xl border border-border p-5"><p className="font-medium">The pulse couldn’t load.</p><p className="mt-2 text-sm text-muted-foreground">Try again or explore the match on your favorite platform below.</p><button type="button" onClick={() => { setError(false); setLoading(true); setAttempt((n) => n + 1); }} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"><RefreshCw size={15} /> Try again</button></div> : posts.length ? <div className="space-y-4">{posts.map((post) => <Post key={post.url} post={post} />)}</div> : <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center"><MessageCircle className="mx-auto text-primary" size={28} /><h3 className="mt-4 font-semibold">No match posts here yet</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{platform === "all" ? "Posts from X, Instagram, and TikTok will appear here as they become available for this fixture." : `No ${sources[0].label} posts are available for this fixture yet.`}</p></div>}
          {(platform === "all" || platform === "x") && feed?.xStatus === "unavailable" && <p role="status" className="mt-4 text-xs text-muted-foreground">X posts are temporarily unavailable. You can still search X below.</p>}
          {(platform === "all" || platform === "x") && feed?.xStatus === "unconfigured" && <p className="mt-4 text-xs text-muted-foreground">The automatic X feed isn’t connected yet.</p>}
          {(platform === "all" || platform === "x") && feed?.xStatus === "outside-window" && <p className="mt-4 text-xs text-muted-foreground">This fixture is outside the recent-post search window. Explore it on X below.</p>}
          <div className="mt-6"><h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Explore the match</h3><div className="mt-3 space-y-2">{sources.map((source) => <a key={source.id} href={matchSearch(match, source.id)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"><span>{source.id === "instagram" ? "Find Instagram posts via Google" : `Search ${source.label}`}</span><ArrowUpRight size={16} className="text-muted-foreground" /></a>)}</div><p className="mt-3 text-xs leading-relaxed text-muted-foreground">Searches include both teams and the match date. External results may vary and may require sign-in.</p></div>
        </>}
      </div>
      <footer className="border-t border-border px-5 py-4 text-xs text-muted-foreground">Match conversation · X / Instagram / TikTok</footer>
    </section>
  </dialog>, document.body);
}

export function SocialPulse({ match }: { match: Fixture }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return <>
    <button ref={trigger} type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open} aria-label={`Social Pulse for ${match.teams.home.name} vs ${match.teams.away.name}`} className="pointer-events-auto relative inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 focus-visible:outline-2 focus-visible:outline-ring"><Activity size={15} /><span>Social Pulse</span></button>
    {open && <PulseDialog key={match.fixture.id} match={match} onClose={() => { setOpen(false); requestAnimationFrame(() => trigger.current?.focus()); }} />}
  </>;
}

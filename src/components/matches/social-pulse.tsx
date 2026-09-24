"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Activity, ArrowUpRight, Headphones, Camera, Music2, RefreshCw, X } from "lucide-react";
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
  return createPortal(<dialog ref={ref} aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} className="pulse-world pulse-dialog fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-foreground">
    <section className="pulse-stage flex flex-col bg-background" onClick={(event) => event.stopPropagation()}>
      <header className="pulse-header">
        <div className="flex items-center justify-between gap-4">
          <span className="pulse-eyebrow"><Activity size={15} /> BEYOND THE WHISTLE</span>
          <button type="button" onClick={onClose} aria-label="Close Social Pulse" className="pulse-close"><X size={20} /></button>
        </div>
        <div className="pulse-title-row"><h2 id={titleId} className="pulse-title">SOCIAL<span>PULSE<span className="pulse-period">.</span></span></h2><div className="pulse-signal" aria-hidden="true">{[0,1,2,3,4,5,6].map((n) => <i key={n} />)}</div></div>
        <div className="pulse-fixture"><span className="pulse-match-label">THE MATCH</span><p>{match.teams.home.name} <span className="text-muted-foreground">vs</span> {match.teams.away.name}</p><span className="text-xs text-muted-foreground">{match.league.name} · {new Date(match.fixture.date).toLocaleDateString()}</span></div>
        <div role="group" aria-label="Filter social posts" className="pulse-tabs">
          {[{ id: "all", label: "The mix" }, ...SOCIAL_PLATFORMS].map((item) => <button key={item.id} type="button" aria-pressed={platform === item.id} onClick={() => setPlatform(item.id as typeof platform)} className="pulse-tab" data-platform={item.id}>{item.id === "instagram" ? <Camera size={15} /> : item.id === "tiktok" ? <Music2 size={15} /> : item.id === "all" ? <Headphones size={15} /> : null}{item.label}</button>)}
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6" aria-busy={loading}>
        {loading ? <div role="status" className="space-y-3"><p className="text-sm text-muted-foreground">Loading selected posts…</p>{[0, 1, 2].map((n) => <div key={n} className="h-32 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />)}</div> : <>
          {error ? <div role="alert" className="rounded-2xl border border-border p-5"><p className="font-medium">The pulse couldn’t load.</p><p className="mt-2 text-sm text-muted-foreground">Try again or explore the match on your favorite platform below.</p><button type="button" onClick={() => { setError(false); setLoading(true); setAttempt((n) => n + 1); }} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"><RefreshCw size={15} /> Try again</button></div> : posts.length ? <div className="space-y-4">{posts.map((post) => <Post key={post.url} post={post} />)}</div> : <div className="pulse-empty"><p className="pulse-eyebrow">THE FANS HAVE THE FLOOR</p><h3>Big moments.<br /><span>Bigger reactions.</span></h3><p>{platform === "all" ? "Jump into the match conversation. Pick your corner of the internet." : `Find this match’s conversation on ${sources[0].label}.`}</p></div>}
          <div className="pulse-portals">{sources.map((source) => <a key={source.id} data-platform={source.id} href={matchSearch(match, source.id)} target="_blank" rel="noopener noreferrer" className="pulse-portal"><span className="pulse-portal-top">{source.id === "instagram" ? <Camera size={26} /> : source.id === "tiktok" ? <Music2 size={26} /> : <span className="pulse-x">𝕏</span>}<ArrowUpRight size={19} /></span><strong>{source.label}</strong><span>{source.id === "instagram" ? "Through the lens" : source.id === "tiktok" ? "Feel the moment" : "Join the debate"}</span><small>{source.id === "instagram" ? "Find posts via Google ↗" : `Search ${source.label} ↗`}</small></a>)}</div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{!posts.length && "No hand-picked posts for this match yet. "}Searches open externally using both teams and the match date. Sign-in may be required.</p>

        </>}
      </div>
      <footer className="pulse-footer"><span>ONE MATCH. EVERY ANGLE.</span><Activity size={16} /></footer>
    </section>
  </dialog>, document.body);
}

export function SocialPulse({ match }: { match: Fixture }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return <>
    <button ref={trigger} type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open} aria-label={`Social Pulse for ${match.teams.home.name} vs ${match.teams.away.name}`} className="pulse-world pulse-trigger pointer-events-auto relative inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold"><Activity size={15} /><span>Social Pulse</span></button>
    {open && <PulseDialog key={match.fixture.id} match={match} onClose={() => { setOpen(false); requestAnimationFrame(() => trigger.current?.focus()); }} />}
  </>;
}

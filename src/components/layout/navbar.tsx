"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
const links = [["Matches", "/"], ["Competitions", "/competitions"], ["Teams", "/teams"], ["Compare", "/compare"], ["Favorites", "/favorites"], ["Odds", "/odds"]] as const;
export function Navbar({ liveCount }: { liveCount?: number }) {
  const pathname = usePathname();
  return <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl" aria-label="Main navigation">
    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
      <Link href="/" className="text-xl font-bold tracking-tight">Football<span className="text-primary">OS</span></Link>
      <div className="order-3 flex w-full gap-5 overflow-x-auto text-sm md:order-none md:w-auto">
        {links.map(([label, href]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={`whitespace-nowrap py-2 transition-colors ${pathname === href ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"}`}>{label}</Link>)}
      </div>
      <div className="flex items-center gap-2"><AnimatedThemeToggler className="flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground [&_svg]:size-5" />{liveCount !== undefined && <span className="rounded-full border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">● {liveCount} LIVE</span>}</div>
    </div>
  </nav>;
}

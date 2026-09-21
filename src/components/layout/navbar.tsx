import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
export function Navbar({ liveCount }: { liveCount: number }) {

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-10">
          <a
            href="#"
            className="text-xl font-bold tracking-tight"
          >
            Football
            <span className="text-primary">OS</span>
          </a>

          <div className="hidden gap-7 text-sm text-muted-foreground md:flex">
            <a href="#" className="text-foreground">
              Matches
            </a>

            <a
              href="#"
              className="transition hover:text-foreground"
            >
              Competitions
            </a>

            <a
              href="#"
              className="transition hover:text-foreground"
            >
              Teams
            </a>

            <a
              href="#"
              className="transition hover:text-foreground"
            >
              Compare
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <AnimatedThemeToggler
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground [&_svg]:size-5"
          />
          <div className="whitespace-nowrap rounded-full border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive sm:px-4">
            ● {liveCount} LIVE
          </div>
        </div>
      </div>
    </nav>
  );
}

export function SocialPulse() {

  return (
    <section className="border-t border-border py-12">
      <div className="grid gap-10 lg:grid-cols-[1fr_390px]">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary">
            Around Football
          </p>

          <h2 className="mt-3 max-w-xl text-3xl font-semibold">
            The match is only half the story.
          </h2>

          <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
            FootballOS will connect live match events with
            reactions, player moments, analysis, TikToks,
            Instagram Reels, and the conversation surrounding
            each game.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card text-card-foreground p-5">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Social Pulse</p>

            <span className="text-xs font-medium text-primary">
              COMING SOON
            </span>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-border bg-secondary text-secondary-foreground p-4">
              <p className="text-xs text-muted-foreground">
                TikTok
              </p>

              <p className="mt-2 text-sm">
                Goals, reactions, and player moments
              </p>
            </div>

            <div className="rounded-xl border border-border bg-secondary text-secondary-foreground p-4">
              <p className="text-xs text-muted-foreground">
                Instagram
              </p>

              <p className="mt-2 text-sm">
                Stadium atmosphere and fan reactions
              </p>
            </div>

            <div className="rounded-xl border border-border bg-secondary text-secondary-foreground p-4">
              <p className="text-xs text-muted-foreground">
                Match Analysis
              </p>

              <p className="mt-2 text-sm">
                Tactical discussion and player performances
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

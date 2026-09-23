export function ProbabilityMeter({ values, home, away }: { values: number[]; home: string; away: string }) {
  const labels = [home, "Draw", away];
  const colors = ["bg-primary", "bg-muted-foreground", "bg-destructive"];
  const total = values.reduce((sum, value) => sum + value, 0);
  return <div className="mt-6">
    <div role="img" aria-label={labels.map((label, i) => `${label}: ${values[i]}%`).join(", ")} className="relative">
      <div className="flex h-8 overflow-hidden rounded-full border border-border bg-muted shadow-inner sm:h-10">
        {values.map((value, i) => <div key={i} className={`${colors[i]} h-full motion-safe:transition-[width] motion-safe:duration-700`} style={{ width: `${total ? value / total * 100 : 0}%` }} />)}
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex justify-evenly">{[1, 2, 3].map((i) => <span key={i} className="h-full border-l border-background/40" />)}</div>
    </div>
    <div aria-hidden="true" className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground"><span>0</span><span>PROBABILITY DISTRIBUTION</span><span>100%</span></div>
    <div className="mt-4 grid grid-cols-3 gap-3">{labels.map((label, i) => <div key={i} className={i === 1 ? "text-center" : i === 2 ? "text-right" : "text-left"}><p className="text-2xl font-black tabular-nums sm:text-3xl">{values[i]}<span className="text-sm font-medium text-muted-foreground">%</span></p><p className="mt-1 text-xs text-muted-foreground"><span aria-hidden="true" className={`mr-1.5 inline-block size-2 rounded-full ${colors[i]}`} />{label}</p></div>)}</div>
  </div>;
}

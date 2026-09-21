"use client";
import { useId, useState, type ReactNode } from "react";
const tabs = ["Statistics", "Lineups", "Events"] as const;
export function MatchDetailTabs({ statistics, lineups, events }: { statistics: ReactNode; lineups: ReactNode; events: ReactNode }) {
  const [active, setActive] = useState(0);
  const id = useId();
  return <div>
    <div role="tablist" aria-label="Match details" className="mb-5 flex gap-2 overflow-x-auto border-b border-border pb-3">
      {tabs.map((tab, index) => <button key={tab} type="button" role="tab" id={`${id}-tab-${index}`} aria-controls={`${id}-panel-${index}`} aria-selected={active === index} tabIndex={active === index ? 0 : -1}
        onClick={() => setActive(index)} onKeyDown={(event) => {
          let next = index;
          if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
          else if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
          else if (event.key === "Home") next = 0;
          else if (event.key === "End") next = tabs.length - 1;
          else return;
          event.preventDefault(); setActive(next); document.getElementById(`${id}-tab-${next}`)?.focus();
        }} className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold ${active === index ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>{tab}</button>)}
    </div>
    {[statistics, lineups, events].map((content, index) => <div key={tabs[index]} role="tabpanel" id={`${id}-panel-${index}`} aria-labelledby={`${id}-tab-${index}`} hidden={active !== index} tabIndex={0} className="focus-visible:outline-2 focus-visible:outline-ring">{content}</div>)}
  </div>;
}

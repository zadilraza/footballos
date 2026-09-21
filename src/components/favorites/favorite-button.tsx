"use client";
import { Star } from "lucide-react";
export function FavoriteButton({ name, selected, onToggle }: { name: string; selected: boolean; onToggle: () => void }) {
  const label = `${selected ? "Remove" : "Add"} ${name} ${selected ? "from" : "to"} favorites`;
  return <button type="button" onClick={onToggle} aria-pressed={selected} aria-label={label} title={label}
    className={`pointer-events-auto relative z-10 inline-flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-accent hover:text-accent-foreground ${selected ? "text-primary" : "text-muted-foreground"}`}>
    <Star aria-hidden="true" className="size-4" fill={selected ? "currentColor" : "none"} />
  </button>;
}

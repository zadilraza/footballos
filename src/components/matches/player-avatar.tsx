"use client";

import Image from "next/image";
import { useState } from "react";

export function PlayerAvatar({ playerId, name, number, side, variant = "pitch" }: {
  playerId: number | null;
  name: string;
  number: number | null;
  side: "home" | "away";
  variant?: "pitch" | "matchup";
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const source = playerId != null && Number.isSafeInteger(playerId) && playerId > 0
    ? `https://media.api-sports.io/football/players/${playerId}.png` : null;
  const initials = name.trim().split(/\s+/).filter(Boolean).map((part) => Array.from(part)[0]).slice(0, 2).join("");
  const colors = side === "home" ? "border-primary bg-primary text-primary-foreground" : "border-secondary-foreground/60 bg-secondary text-secondary-foreground";
  return <span className="relative inline-flex shrink-0">
    <span className={`flex items-center justify-center overflow-hidden rounded-full border-2 font-bold ${variant === "matchup" ? "size-20 text-xl shadow-lg ring-4 ring-matchup-heat/20 sm:size-24" : "size-11 text-sm shadow-sm sm:size-14"} ${colors}`}>
      {source && failedSource !== source ? <Image src={source} alt={`${name} portrait`} width={variant === "matchup" ? 96 : 56} height={variant === "matchup" ? 96 : 56} unoptimized loading="lazy" className="size-full object-cover object-top" onError={() => setFailedSource(source)} />
        : <span aria-label={`${name}: photo unavailable`}>{initials || number || "?"}</span>}
    </span>
    {number != null && <span aria-label={`Shirt number ${number}`} className={`absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border text-[10px] font-bold ${colors}`}>{number}</span>}
  </span>;
}

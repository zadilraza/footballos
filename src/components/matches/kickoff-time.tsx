"use client";
import { useSyncExternalStore } from "react";
const subscribe = () => () => {};
export function KickoffTime({ date }: { date: string }) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  return <time dateTime={date}>{new Date(date).toLocaleString("en-US", {
    dateStyle: "medium", timeStyle: "short", ...(mounted ? {} : { timeZone: "UTC" }),
  })}{!mounted && " UTC"}</time>;
}

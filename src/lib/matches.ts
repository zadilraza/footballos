import type { Fixture } from "@/types/football";

const LIVE_STATUSES = [
  "1H",
  "HT",
  "2H",
  "ET",
  "BT",
  "P",
  "INT",
  "LIVE",
];

const FINISHED_STATUSES = [
  "FT",
  "AET",
  "PEN",
];

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getDateFromOffset(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);

  return formatLocalDate(date);
}

export function getStatusLabel(match: Fixture) {
  const short = match.fixture.status.short;
  const elapsed = match.fixture.status.elapsed;

  if (LIVE_STATUSES.includes(short)) {
    if (short === "HT") {
      return "HT";
    }

    if (elapsed !== null) {
      return `${elapsed}'`;
    }

    return "LIVE";
  }

  if (FINISHED_STATUSES.includes(short)) {
    return short;
  }

  const kickoff = new Date(match.fixture.date);

  return kickoff.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function isLive(match: Fixture) {
  return LIVE_STATUSES.includes(match.fixture.status.short);
}

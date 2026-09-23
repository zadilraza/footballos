import type { MatchDetails, MatchLineup } from "@/types/football";
type Player = MatchLineup["startXI"][number]["player"];
export type MatchupPlayer = Player & { replacement?: boolean };
type Slot = { player: MatchupPlayer; row: number; col: number; width: number };
export type Matchup = { title: string; description: string; home: MatchupPlayer[]; away: MatchupPlayer[]; homeRole: string; awayRole: string };

function positions(lineup: MatchLineup, match: MatchDetails): Slot[] | null {
  const formation = lineup.formation?.split("-").map(Number);
  if (!formation?.length || formation.some((n) => !Number.isInteger(n) || n < 1) || formation.reduce((a, b) => a + b, 0) !== 10) return null;
  const widths = [1, ...formation];
  const slots: Slot[] = [];
  for (const { player } of lineup.startXI) {
    const parts = player.grid?.match(/^(\d+):(\d+)$/);
    if (!parts) return null;
    const row = Number(parts[1]), col = Number(parts[2]), width = widths[row - 1];
    if (!width || col < 1 || col > width || slots.some((s) => s.row === row && s.col === col)) return null;
    slots.push({ player, row, col, width });
  }
  if (slots.length !== 11) return null;
  // Substitutes inherit the outgoing player's slot as an estimate, not tracked positioning.
  const events = (match.events ?? []).filter((e) => e.team.id === lineup.team.id);
  for (const event of events) {
    if (event.type.toLowerCase() === "subst") {
      const slot = slots.find((s) => s.player.id === event.player.id);
      const incoming = [...lineup.substitutes, ...lineup.startXI].find((p) => p.player.id === event.assist.id)?.player;
      if (slot && incoming) slot.player = { ...incoming, replacement: true };
      else if (slot) slots.splice(slots.indexOf(slot), 1);
    }
    if (event.type === "Card" && ["Red Card", "Second Yellow card", "Yellow-Red Card"].includes(event.detail)) {
      const index = slots.findIndex((s) => s.player.id === event.player.id);
      if (index !== -1) slots.splice(index, 1);
    }
  }
  return slots;
}
function roles(slots: Slot[], formation: string) {
  const rows = formation.split("-").map(Number);
  const last = rows.length + 1;
  const defenders = slots.filter((s) => s.row === 2);
  const edge = (s: Slot) => s.col === 1 || s.col === s.width;
  const backs = defenders[0]?.width === 3 ? slots.filter((s) => s.row === 3 && s.width >= 4 && edge(s)) : defenders.filter(edge);
  const centers = defenders.filter((s) => s.width === 3 || !edge(s));
  const wings = slots.filter((s) => (s.row === last || (s.row === last - 1 && rows[rows.length - 1] <= 2)) && s.row > 2 && s.width >= 3 && edge(s) && !backs.includes(s));
  const strikers = slots.filter((s) => s.row === last && (s.width <= 2 || !edge(s)));
  const midfield = slots.filter((s) => s.row > 2 && s.row < last && !backs.includes(s) && !wings.includes(s));
  const players = (list: Slot[]) => list.map((s) => s.player);
  // Provider grids face the attack downfield: column 1 is the team's right flank.
  return {
    rw: players(wings.filter((s) => s.col === 1)), lw: players(wings.filter((s) => s.col === s.width)),
    rb: players(backs.filter((s) => s.col === 1)), lb: players(backs.filter((s) => s.col === s.width)),
    cb: players(centers), st: players(strikers),
    rm: players(midfield.filter((s) => s.col < (s.width + 1) / 2)),
    lm: players(midfield.filter((s) => s.col > (s.width + 1) / 2)),
    cm: players(midfield.filter((s) => s.col === (s.width + 1) / 2)),
  };
}
export function getMatchups(match: MatchDetails): Matchup[] {
  const home = match.lineups?.find((l) => l.team.id === match.teams.home.id);
  const away = match.lineups?.find((l) => l.team.id === match.teams.away.id);
  if (!home || !away) return [];
  const h = positions(home, match), a = positions(away, match);
  if (!h || !a) return [];
  const hr = roles(h, home.formation!), ar = roles(a, away.formation!);
  const result: Matchup[] = [];
  function add(title: string, description: string, home: MatchupPlayer[], away: MatchupPlayer[], homeRole: string, awayRole: string) {
    if (home.length && away.length) result.push({ title, description, home, away, homeRole, awayRole });
  }
  const wide = "Watch whether the wide attacker beats the defender to create a shot or cross, or gets forced away from goal.";
  add("Right-wing battle", wide, hr.rw, ar.lb, "Right wing / wide attack", "Left back / wing-back");
  add("Left-wing battle", wide, hr.lw, ar.rb, "Left wing / wide attack", "Right back / wing-back");
  add("Defending the right flank", wide, hr.rb, ar.lw, "Right back / wing-back", "Left wing / wide attack");
  add("Defending the left flank", wide, hr.lb, ar.rw, "Left back / wing-back", "Right wing / wide attack");
  const central = "Watch the striker's runs and chances against the defenders' marking, tackles and aerial challenges.";
  add("Attack against the centre-backs", central, hr.st, ar.cb, "Striker(s)", "Centre-backs");
  add("Centre-backs against the attack", central, hr.cb, ar.st, "Centre-backs", "Striker(s)");
  const middle = "Watch who escapes pressure, wins possession and finds passes into attack in this midfield channel.";
  add("Right midfield channel", middle, hr.rm, ar.lm, "Right midfield", "Left midfield");
  add("Left midfield channel", middle, hr.lm, ar.rm, "Left midfield", "Right midfield");
  add("Central midfield", middle, hr.cm, ar.cm, "Central midfield", "Central midfield");
  return result;
}

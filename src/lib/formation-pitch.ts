import type { MatchLineup } from "@/types/football";
export function formationPositions(lineup: MatchLineup, side: "home" | "away") {
  const formation = lineup.formation?.split("-").map(Number);
  if (!formation?.length || formation.some((width) => !Number.isInteger(width) || width < 1 || width > 5) || formation.reduce((a, b) => a + b, 0) !== 10 || lineup.startXI.length !== 11) return null;
  const widths = [1, ...formation];
  const seen = new Set<string>();
  const positions = [];
  for (const { player } of lineup.startXI) {
    const grid = player.grid?.match(/^(\d+):(\d+)$/);
    if (!grid) return null;
    const row = Number(grid[1]), col = Number(grid[2]);
    const width = widths[row - 1];
    if (!width || col < 1 || col > width || seen.has(`${row}:${col}`)) return null;
    seen.add(`${row}:${col}`);
    const x = 8 + ((col - 0.5) / width) * 84;
    const y = 7 + ((row - 1) / (widths.length - 1)) * 35;
    positions.push({ player, row, col, x: side === "home" ? x : 100 - x, y: side === "home" ? y : 100 - y });
  }
  return positions;
}

import type { DraftSlot, Position, Decade, Player } from "../types";
import { NBA_TEAMS, DECADES, PLAYERS } from "../data/players";

const POSITIONS: Position[] = ["PG", "SG", "SF", "PF", "C"];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function pickFromArray<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** Pick a team+decade combo that has at least N players in total (any position) */
function pickValidCombo(rng: () => number, minPlayers = 3): { team: string; decade: Decade } {
  let team: string;
  let decade: Decade;
  let attempts = 0;
  do {
    team = pickFromArray(NBA_TEAMS, rng);
    decade = pickFromArray(DECADES, rng) as Decade;
    attempts++;
    if (attempts > 100) {
      // Fallback: find any valid combo
      const validTeams = NBA_TEAMS.filter((t) =>
        DECADES.some((d) => PLAYERS.filter((p) => p.team === t && p.decade === d).length >= minPlayers)
      );
      team = pickFromArray(validTeams.length ? validTeams : NBA_TEAMS, rng);
      const validDecades = DECADES.filter(
        (d) => PLAYERS.filter((p) => p.team === team && p.decade === d).length >= minPlayers
      );
      decade = (pickFromArray(validDecades.length ? validDecades : DECADES, rng)) as Decade;
      break;
    }
  } while (PLAYERS.filter((p) => p.team === team && p.decade === decade).length < minPlayers);

  return { team, decade };
}

export function generateDraftSlots(seed?: number): DraftSlot[] {
  const rng = seededRandom(seed ?? Math.floor(Math.random() * 1_000_000));

  return POSITIONS.map((position) => {
    const { team, decade } = pickValidCombo(rng);
    return { position, team, decade, teamRerolled: false, eraRerolled: false };
  });
}

export function getDailySlots(): DraftSlot[] {
  const today = new Date();
  const seed =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();
  return generateDraftSlots(seed);
}

/** Returns ALL players from this slot's team+decade (any position), sorted by scoring desc */
export function getPlayersForRound(slot: DraftSlot): Player[] {
  return PLAYERS.filter(
    (p) => p.team === slot.team && p.decade === slot.decade
  ).sort((a, b) => b.scoring - a.scoring);
}

/** Legacy: for display on home page daily preview */
export function getPlayersForSlot(slot: DraftSlot): Player[] {
  return PLAYERS.filter(
    (p) =>
      p.team === slot.team &&
      p.decade === slot.decade &&
      p.position === slot.position
  );
}

/** Re-roll team: pick a NEW team (different from current) that has ≥3 players in the same decade */
export function rerollTeam(slot: DraftSlot): string {
  const MIN = 3;
  let candidates = NBA_TEAMS.filter(
    (t) =>
      t !== slot.team &&
      PLAYERS.filter((p) => p.team === t && p.decade === slot.decade).length >= MIN
  );
  // Fallback: any team with at least 1 player in this decade
  if (candidates.length === 0) {
    candidates = NBA_TEAMS.filter(
      (t) => t !== slot.team && PLAYERS.some((p) => p.team === t && p.decade === slot.decade)
    );
  }
  if (candidates.length === 0) return slot.team;
  const rng = seededRandom(Math.floor(Math.random() * 1_000_000));
  return pickFromArray(candidates, rng);
}

/** Re-roll era: pick a NEW decade (different from current) that has ≥3 players on the same team */
export function rerollEra(slot: DraftSlot): Decade {
  const MIN = 3;
  let candidates = DECADES.filter(
    (d) =>
      d !== slot.decade &&
      PLAYERS.filter((p) => p.team === slot.team && p.decade === d).length >= MIN
  ) as Decade[];
  // Fallback: any decade with at least 1 player on this team
  if (candidates.length === 0) {
    candidates = DECADES.filter(
      (d) => d !== slot.decade && PLAYERS.some((p) => p.team === slot.team && p.decade === d)
    ) as Decade[];
  }
  if (candidates.length === 0) return slot.decade;
  const rng = seededRandom(Math.floor(Math.random() * 1_000_000));
  return pickFromArray(candidates, rng);
}

/** Compute display stats from attribute values */
export function getDisplayStats(p: Player) {
  return {
    ppg: +(p.scoring * 0.27).toFixed(1),
    rpg: +(p.rebounding * 0.12).toFixed(1),
    apg: +(p.playmaking * 0.1).toFixed(1),
    spg: +(p.perimeterDefense * 0.04).toFixed(1),
    bpg: +(p.rimProtection * 0.05).toFixed(1),
  };
}

export function isSlotComplete(slotPlayers: string[], slotIndex: number): boolean {
  return !!slotPlayers[slotIndex];
}

export type Position = "PG" | "SG" | "SF" | "PF" | "C";

export type Decade =
  | "1970s"
  | "1980s"
  | "1990s"
  | "2000s"
  | "2010s"
  | "2020s";

export type Archetype =
  | "scorer"
  | "playmaker"
  | "defender"
  | "shooter"
  | "paint-beast"
  | "rim-protector"
  | "rebounder"
  | "floor-general"
  | "slasher"
  | "stretch-big"
  | "3-and-D"
  | "two-way"
  | "facilitator"
  | "post-scorer"
  | "point-forward"
  | "versatile";

export interface Player {
  id: string;
  name: string;
  position: Position;
  team: string;
  decade: Decade;
  overall: number;
  scoring: number;
  playmaking: number;
  shooting: number;
  spacing: number;
  perimeterDefense: number;
  rimProtection: number;
  rebounding: number;
  athleticism: number;
  IQ: number;
  clutch: number;
  usageRate: number;
  archetype: Archetype[];
}

export interface DraftSlot {
  position: Position;
  team: string;
  decade: Decade;
  teamRerolled: boolean;
  eraRerolled: boolean;
}

export interface TeamStats {
  offense: number;
  defense: number;
  chemistry: number;
  spacing: number;
  rebounding: number;
  rimProtection: number;
}

export interface SimulationResult {
  wins: number;
  losses: number;
  stats: TeamStats;
  analysis: string;
  mvp: Player;
  synergies: string[];
  weaknesses: string[];
  strengths: string[];
}

export interface RunRecord {
  id: string;
  createdAt: string;
  slots: DraftSlot[];
  selectedPlayers: Player[];
  result: SimulationResult;
}

export type GamePhase = "draft" | "result";
export type SortKey = "ppg" | "rpg" | "apg" | "az";
export type PosFilter = "all" | "G" | "F" | "C";

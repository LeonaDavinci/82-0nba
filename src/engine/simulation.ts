import type { Player, TeamStats, SimulationResult } from "../types";

const SYNERGIES: { players: string[]; bonus: number; label: string }[] = [
  { players: ["shaq", "kobe-bryant"], bonus: 18, label: "Shaq & Kobe — Dynasty Pairing" },
  { players: ["steph-curry", "draymond-green"], bonus: 16, label: "Curry & Draymond — Motion Offense" },
  { players: ["john-stockton", "karl-malone"], bonus: 17, label: "Stockton & Malone — Pick & Roll Legends" },
  { players: ["magic-johnson", "kareem-abdul-jabbar"], bonus: 16, label: "Magic & Kareem — Showtime" },
  { players: ["lebron-james", "dwyane-wade"], bonus: 15, label: "LeBron & Wade — Big Three Core" },
  { players: ["michael-jordan", "scottie-pippen"], bonus: 17, label: "Jordan & Pippen — Dynasty Duo" },
  { players: ["tim-duncan", "tony-parker"], bonus: 13, label: "Duncan & Parker — Spurs System" },
  { players: ["tim-duncan", "draymond-green"], bonus: 10, label: "Twin Towers IQ — High-Floor Defense" },
  { players: ["hakeem-olajuwon", "steph-curry"], bonus: 8, label: "Dream & Splash — Spacing + Paint" },
  { players: ["kevin-durant", "steph-curry"], bonus: 14, label: "KD & Curry — Superteam Firepower" },
  { players: ["larry-bird", "kevin-mchale"], bonus: 12, label: "Bird & McHale — Celtic Pride" },
  { players: ["lebron-james", "kevin-garnett"], bonus: 10, label: "LeBron & KG — Defensive Anchors" },
];

export function calculateOffense(players: Player[]): number {
  const avgScoring = avg(players, "scoring");
  const avgPlaymaking = avg(players, "playmaking");
  const avgShooting = avg(players, "shooting");
  const avgSpacing = avg(players, "spacing");

  let offense =
    avgScoring * 0.35 +
    avgPlaymaking * 0.25 +
    avgShooting * 0.2 +
    avgSpacing * 0.2;

  // Bonus if there's a clear playmaker
  const hasElitePlaymaker = players.some((p) => p.playmaking >= 92);
  if (hasElitePlaymaker) offense += 4;

  // Bonus for spacing
  const spacingPlayers = players.filter((p) => p.spacing >= 85).length;
  if (spacingPlayers >= 3) offense += 5;

  return Math.min(100, Math.round(offense));
}

export function calculateDefense(players: Player[]): number {
  const avgPerimeterDef = avg(players, "perimeterDefense");
  const avgRimProtection = avg(players, "rimProtection");
  const avgRebounding = avg(players, "rebounding");

  let defense =
    avgPerimeterDef * 0.4 +
    avgRimProtection * 0.35 +
    avgRebounding * 0.25;

  // Bonus for having an elite rim protector
  const hasEliteRimProtector = players.some((p) => p.rimProtection >= 90);
  if (hasEliteRimProtector) defense += 6;

  // Penalty for no rim protection
  const maxRimProtection = Math.max(...players.map((p) => p.rimProtection));
  if (maxRimProtection < 55) defense -= 8;

  return Math.min(100, Math.round(defense));
}

export function calculateChemistry(players: Player[]): number {
  let chemistry = 70;

  // Usage conflict penalty
  const highUsagePlayers = players.filter((p) => p.usageRate >= 90).length;
  if (highUsagePlayers >= 2) chemistry -= highUsagePlayers * 8;
  if (highUsagePlayers >= 3) chemistry -= 10; // extra penalty

  // Spacing penalty
  const avgSpacing = avg(players, "spacing");
  if (avgSpacing < 65) chemistry -= 10;
  else if (avgSpacing < 75) chemistry -= 5;

  // No rim protection penalty
  const hasRimProtector = players.some((p) => p.rimProtection >= 70);
  if (!hasRimProtector) chemistry -= 8;

  // IQ bonus — smart teams gel better
  const avgIQ = avg(players, "IQ");
  if (avgIQ >= 92) chemistry += 8;
  else if (avgIQ >= 85) chemistry += 4;

  // Synergy bonuses
  const playerIds = players.map((p) => p.id);
  for (const synergy of SYNERGIES) {
    if (synergy.players.every((id) => playerIds.includes(id))) {
      chemistry += synergy.bonus;
    }
  }

  return Math.min(100, Math.max(0, Math.round(chemistry)));
}

export function calculateWins(
  offense: number,
  defense: number,
  chemistry: number,
  avgOverall: number
): number {
  // Raw talent is the dominant driver:
  //   avgOverall 95 → 80 base, 96+ → 82, 75 → 48, 60 → 24, 50 → 8
  const base = 8 + (avgOverall - 50) * 1.6;

  // Team construction quality nudges it a few games up or down (centered at 75)
  const quality = (offense + defense + chemistry) / 3;
  const modifier = (quality - 75) * 0.2;

  const raw = base + modifier;
  return Math.min(82, Math.max(0, Math.round(raw)));
}

export function selectMVP(players: Player[]): Player {
  // MVP = player with highest combined impact score
  return players.reduce((best, p) => {
    const score =
      p.overall * 0.4 +
      p.scoring * 0.25 +
      p.playmaking * 0.15 +
      p.clutch * 0.2;
    const bestScore =
      best.overall * 0.4 +
      best.scoring * 0.25 +
      best.playmaking * 0.15 +
      best.clutch * 0.2;
    return score > bestScore ? p : best;
  });
}

export function generateAnalysis(
  players: Player[],
  stats: TeamStats,
  wins: number
): { analysis: string; strengths: string[]; weaknesses: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Offense analysis
  if (stats.offense >= 88) strengths.push("Elite perimeter scoring machine");
  else if (stats.offense >= 78) strengths.push("Efficient, balanced offense");
  else if (stats.offense < 65) weaknesses.push("Underwhelming offensive output");

  // Defense analysis
  if (stats.defense >= 88) strengths.push("Suffocating defensive unit");
  else if (stats.defense >= 78) strengths.push("Solid defensive foundation");
  else if (stats.defense < 65) weaknesses.push("Major defensive vulnerabilities");

  // Spacing
  if (stats.spacing >= 85) strengths.push("Floor spacing opens up driving lanes");
  else if (stats.spacing < 65) weaknesses.push("Cramped paint limits ball movement");

  // Rim protection
  const maxRim = Math.max(...players.map((p) => p.rimProtection));
  if (maxRim >= 90) strengths.push("Dominant rim protection anchors the paint");
  else if (maxRim < 55) weaknesses.push("No true rim protector — interior defense exposed");

  // Rebounding
  if (stats.rebounding >= 85) strengths.push("Dominant on the glass, second-chance points");
  else if (stats.rebounding < 65) weaknesses.push("Outrebounded every night");

  // Chemistry
  if (stats.chemistry >= 85) strengths.push("Exceptional team chemistry and cohesion");
  else if (stats.chemistry < 60) weaknesses.push("Ball-hog tendencies — chemistry issues");

  // High usage conflict
  const highUsage = players.filter((p) => p.usageRate >= 90);
  if (highUsage.length >= 2) {
    weaknesses.push(
      `Usage conflict: ${highUsage.map((p) => p.name.split(" ").pop()).join(" & ")} both need the ball`
    );
  }

  // Playmaking
  const elitePlaymaker = players.find((p) => p.playmaking >= 92);
  if (elitePlaymaker) {
    strengths.push(`${elitePlaymaker.name.split(" ").pop()} orchestrates the offense`);
  } else if (Math.max(...players.map((p) => p.playmaking)) < 72) {
    weaknesses.push("No true playmaker to run the offense");
  }

  const analysis = buildAnalysisText(wins);
  return { analysis, strengths, weaknesses };
}

function buildAnalysisText(wins: number): string {
  if (wins >= 80)
    return "An all-time great roster. This squad would steamroll the league with elite scoring, lockdown defense, and overwhelming talent. A legitimate 82-0 contender.";
  if (wins >= 70)
    return "Championship-caliber talent. A few minor lineup conflicts keep perfection out of reach, but this team wins most nights with authority.";
  if (wins >= 58)
    return "Playoff-tested lineup with real strengths. The right adjustments could turn this into a title contender — but flaws will be exploited.";
  if (wins >= 45)
    return "Competitive but inconsistent. Nights of brilliance will be offset by structural weaknesses that opponents will game-plan against.";
  if (wins >= 32)
    return "Average NBA team. Not embarrassing, not inspiring. A coaching staff would struggle to mask the lineup's mismatched pieces.";
  return "A flawed roster that will struggle to compete. Fundamental gaps in the lineup make every night a fight for survival.";
}

export function getSynergies(players: Player[]): string[] {
  const playerIds = players.map((p) => p.id);
  return SYNERGIES.filter((s) =>
    s.players.every((id) => playerIds.includes(id))
  ).map((s) => s.label);
}

export function simulateTeam(players: Player[]): SimulationResult {
  const offense = calculateOffense(players);
  const defense = calculateDefense(players);
  const chemistry = calculateChemistry(players);
  const avgOverall = avg(players, "overall");
  const wins = calculateWins(offense, defense, chemistry, avgOverall);
  const losses = 82 - wins;
  const spacing = Math.round(avg(players, "spacing"));
  const rebounding = Math.round(avg(players, "rebounding"));
  const rimProtection = Math.round(avg(players, "rimProtection"));

  const stats: TeamStats = {
    offense,
    defense,
    chemistry,
    spacing,
    rebounding,
    rimProtection,
  };

  const { analysis, strengths, weaknesses } = generateAnalysis(players, stats, wins);
  const mvp = selectMVP(players);
  const synergies = getSynergies(players);

  return { wins, losses, stats, analysis, mvp, synergies, strengths, weaknesses };
}

function avg(players: Player[], key: keyof Player): number {
  return (
    players.reduce((sum, p) => sum + (p[key] as number), 0) / players.length
  );
}

// Generates src/data/players.ts from a curated roster.
// Attributes are derived from a position profile + overall + archetype modifiers
// so the whole league stays internally consistent. Run: node scripts/genPlayers.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const PROFILE = {
  PG: { scoring: -3, playmaking: 4, shooting: -1, spacing: -2, perimeterDefense: -3, athleticism: -1, IQ: 1, clutch: -2, usageRate: -3, rimProtection: 20, rebounding: 44 },
  SG: { scoring: 0, playmaking: -2, shooting: 1, spacing: 0, perimeterDefense: -2, athleticism: 1, IQ: -1, clutch: 0, usageRate: -1, rimProtection: 24, rebounding: 48 },
  SF: { scoring: -1, playmaking: -3, shooting: -2, spacing: -2, perimeterDefense: 0, athleticism: 1, IQ: -1, clutch: -1, usageRate: -3, rimProtection: 38, rebounding: 60 },
  PF: { scoring: -2, playmaking: -7, shooting: -9, spacing: -11, perimeterDefense: -3, athleticism: 0, IQ: -2, clutch: -2, usageRate: -4, rimProtection: 66, rebounding: 76 },
  C:  { scoring: -3, playmaking: -12, shooting: -20, spacing: -24, perimeterDefense: -7, athleticism: -1, IQ: -2, clutch: -3, usageRate: -6, rimProtection: 84, rebounding: 84 },
};

const ARCH = {
  shooter: { shooting: 12, spacing: 14, scoring: 2, perimeterDefense: -1 },
  scorer: { scoring: 7, usageRate: 8, clutch: 2 },
  playmaker: { playmaking: 9, IQ: 3, usageRate: 2 },
  facilitator: { playmaking: 7, IQ: 3, usageRate: -3, scoring: -2 },
  "floor-general": { playmaking: 5, IQ: 6, clutch: 4 },
  defender: { perimeterDefense: 12, IQ: 2, athleticism: 3 },
  "3-and-D": { shooting: 9, spacing: 11, perimeterDefense: 10, usageRate: -5, scoring: -2 },
  "two-way": { perimeterDefense: 7, scoring: 2, athleticism: 2 },
  "rim-protector": { rimProtection: 12, rebounding: 5, IQ: 1 },
  rebounder: { rebounding: 12, rimProtection: 4, athleticism: 2 },
  "paint-beast": { scoring: 3, rebounding: 9, rimProtection: 7, athleticism: 5, spacing: -6 },
  "post-scorer": { scoring: 6, spacing: -5, rebounding: 4 },
  "stretch-big": { shooting: 16, spacing: 20, rimProtection: -5 },
  slasher: { scoring: 5, athleticism: 8, spacing: -5, shooting: -3 },
  "point-forward": { playmaking: 10, IQ: 3, usageRate: 1 },
  versatile: { scoring: 2, playmaking: 2, perimeterDefense: 2, athleticism: 2 },
};

const clamp = (v, lo = 12, hi = 99) => Math.max(lo, Math.min(hi, Math.round(v)));
const slug = (s) => s.toLowerCase().replace(/[.'’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function derive(pos, ovr, arch) {
  const p = PROFILE[pos];
  const a = {
    scoring: ovr + p.scoring,
    playmaking: ovr + p.playmaking,
    shooting: ovr + p.shooting,
    spacing: ovr + p.spacing,
    perimeterDefense: ovr + p.perimeterDefense,
    athleticism: ovr + p.athleticism,
    IQ: ovr + p.IQ,
    clutch: ovr + p.clutch,
    usageRate: ovr + p.usageRate,
    rimProtection: p.rimProtection + (ovr - 80) * 0.4,
    rebounding: p.rebounding + (ovr - 80) * 0.4,
  };
  for (const tag of arch) {
    const mod = ARCH[tag];
    if (!mod) throw new Error(`unknown archetype ${tag}`);
    for (const k in mod) a[k] += mod[k];
  }
  return {
    overall: ovr,
    scoring: clamp(a.scoring),
    playmaking: clamp(a.playmaking),
    shooting: clamp(a.shooting),
    spacing: clamp(a.spacing),
    perimeterDefense: clamp(a.perimeterDefense),
    rimProtection: clamp(a.rimProtection),
    rebounding: clamp(a.rebounding),
    athleticism: clamp(a.athleticism),
    IQ: clamp(a.IQ),
    clutch: clamp(a.clutch),
    usageRate: clamp(a.usageRate, 45, 98),
  };
}

// [name, pos, team, decade, overall, "arch|arch", idOverride?]
const R = [
  // ── LAKERS ─────────────────────────────────────────────
  ["Jerry West", "SG", "Lakers", "1970s", 96, "scorer|shooter|clutch".replace("clutch","two-way"), "jerry-west"],
  ["Wilt Chamberlain", "C", "Lakers", "1970s", 99, "paint-beast|rebounder|rim-protector", "wilt-chamberlain"],
  ["Elgin Baylor", "SF", "Lakers", "1970s", 95, "scorer|slasher", "elgin-baylor"],
  ["Gail Goodrich", "PG", "Lakers", "1970s", 86, "scorer|shooter"],
  ["Jim McMillian", "SF", "Lakers", "1970s", 80, "two-way|shooter"],
  ["Happy Hairston", "PF", "Lakers", "1970s", 79, "rebounder"],
  ["Magic Johnson", "PG", "Lakers", "1980s", 98, "playmaker|facilitator|floor-general", "magic-johnson"],
  ["Kareem Abdul-Jabbar", "C", "Lakers", "1980s", 97, "post-scorer|paint-beast|rim-protector", "kareem-abdul-jabbar"],
  ["James Worthy", "SF", "Lakers", "1980s", 90, "slasher|scorer"],
  ["Byron Scott", "SG", "Lakers", "1980s", 83, "shooter|scorer"],
  ["Michael Cooper", "SG", "Lakers", "1980s", 82, "3-and-D|defender"],
  ["A.C. Green", "PF", "Lakers", "1980s", 80, "rebounder|two-way"],
  ["Kobe Bryant", "SG", "Lakers", "2000s", 98, "scorer|two-way|slasher", "kobe-bryant"],
  ["Shaquille O'Neal", "C", "Lakers", "2000s", 98, "paint-beast|rim-protector|post-scorer", "shaq"],
  ["Lamar Odom", "PF", "Lakers", "2000s", 84, "point-forward|versatile"],
  ["Derek Fisher", "PG", "Lakers", "2000s", 81, "shooter|floor-general"],
  ["Robert Horry", "PF", "Lakers", "2000s", 80, "3-and-D|shooter"],
  ["Pau Gasol", "PF", "Lakers", "2010s", 89, "post-scorer|stretch-big", "pau-gasol"],
  ["Andrew Bynum", "C", "Lakers", "2010s", 83, "paint-beast|rim-protector"],
  ["Metta World Peace", "SF", "Lakers", "2010s", 81, "defender|two-way"],
  ["LeBron James", "SF", "Lakers", "2020s", 96, "point-forward|scorer|playmaker", "lebron-james-lal"],
  ["Anthony Davis", "PF", "Lakers", "2020s", 95, "rim-protector|paint-beast|two-way", "anthony-davis"],
  ["Austin Reaves", "SG", "Lakers", "2020s", 82, "shooter|playmaker"],
  ["D'Angelo Russell", "PG", "Lakers", "2020s", 83, "scorer|shooter"],
  ["Rui Hachimura", "PF", "Lakers", "2020s", 80, "shooter|two-way"],

  // ── CELTICS ────────────────────────────────────────────
  ["John Havlicek", "SF", "Celtics", "1970s", 94, "scorer|two-way", "john-havlicek"],
  ["Dave Cowens", "C", "Celtics", "1970s", 90, "rebounder|paint-beast"],
  ["Jo Jo White", "PG", "Celtics", "1970s", 86, "scorer|shooter"],
  ["Paul Silas", "PF", "Celtics", "1970s", 81, "rebounder|defender"],
  ["Larry Bird", "SF", "Celtics", "1980s", 97, "shooter|scorer|playmaker", "larry-bird"],
  ["Kevin McHale", "PF", "Celtics", "1980s", 91, "post-scorer|two-way", "kevin-mchale"],
  ["Robert Parish", "C", "Celtics", "1980s", 88, "rim-protector|rebounder"],
  ["Dennis Johnson", "PG", "Celtics", "1980s", 85, "defender|two-way"],
  ["Danny Ainge", "SG", "Celtics", "1980s", 82, "shooter|scorer"],
  ["Bill Russell", "C", "Celtics", "1970s", 97, "rim-protector|rebounder|defender", "bill-russell"],
  ["Paul Pierce", "SF", "Celtics", "2000s", 91, "scorer|shooter|clutch".replace("clutch","two-way"), "paul-pierce"],
  ["Kevin Garnett", "PF", "Celtics", "2000s", 93, "two-way|rim-protector|stretch-big", "kevin-garnett"],
  ["Ray Allen", "SG", "Celtics", "2000s", 89, "shooter|scorer", "ray-allen"],
  ["Rajon Rondo", "PG", "Celtics", "2010s", 86, "playmaker|facilitator|defender", "rajon-rondo"],
  ["Jayson Tatum", "SF", "Celtics", "2020s", 94, "scorer|shooter|two-way", "jayson-tatum"],
  ["Jaylen Brown", "SG", "Celtics", "2020s", 90, "scorer|two-way|slasher", "jaylen-brown"],
  ["Kristaps Porzingis", "C", "Celtics", "2020s", 86, "stretch-big|rim-protector"],
  ["Derrick White", "SG", "Celtics", "2020s", 84, "3-and-D|playmaker"],
  ["Jrue Holiday", "PG", "Celtics", "2020s", 85, "defender|two-way|playmaker", "jrue-holiday"],
  ["Al Horford", "C", "Celtics", "2020s", 82, "stretch-big|rim-protector"],

  // ── BULLS ──────────────────────────────────────────────
  ["Michael Jordan", "SG", "Bulls", "1990s", 99, "scorer|two-way|slasher", "michael-jordan"],
  ["Scottie Pippen", "SF", "Bulls", "1990s", 93, "point-forward|defender|two-way", "scottie-pippen"],
  ["Dennis Rodman", "PF", "Bulls", "1990s", 84, "rebounder|defender"],
  ["Toni Kukoc", "SF", "Bulls", "1990s", 83, "point-forward|shooter"],
  ["Horace Grant", "PF", "Bulls", "1990s", 82, "rebounder|two-way"],
  ["B.J. Armstrong", "PG", "Bulls", "1990s", 79, "shooter|floor-general"],
  ["Derrick Rose", "PG", "Bulls", "2010s", 90, "scorer|slasher|playmaker", "derrick-rose"],
  ["Jimmy Butler", "SF", "Bulls", "2010s", 88, "two-way|scorer|defender", "jimmy-butler-chi"],
  ["Joakim Noah", "C", "Bulls", "2010s", 84, "rim-protector|rebounder|playmaker"],
  ["Luol Deng", "SF", "Bulls", "2010s", 82, "3-and-D|two-way"],
  ["Zach LaVine", "SG", "Bulls", "2020s", 86, "scorer|shooter|slasher"],
  ["DeMar DeRozan", "SF", "Bulls", "2020s", 87, "scorer|two-way"],
  ["Nikola Vucevic", "C", "Bulls", "2020s", 83, "stretch-big|rebounder"],
  ["Coby White", "PG", "Bulls", "2020s", 80, "scorer|shooter"],

  // ── WARRIORS ───────────────────────────────────────────
  ["Rick Barry", "SF", "Warriors", "1970s", 93, "scorer|shooter", "rick-barry"],
  ["Nate Thurmond", "C", "Warriors", "1970s", 88, "rim-protector|rebounder"],
  ["Stephen Curry", "PG", "Warriors", "2010s", 97, "shooter|scorer|floor-general", "steph-curry"],
  ["Klay Thompson", "SG", "Warriors", "2010s", 90, "shooter|3-and-D", "klay-thompson"],
  ["Draymond Green", "PF", "Warriors", "2010s", 87, "defender|playmaker|rim-protector", "draymond-green"],
  ["Kevin Durant", "SF", "Warriors", "2010s", 96, "scorer|shooter|two-way", "kevin-durant"],
  ["Andre Iguodala", "SF", "Warriors", "2010s", 82, "3-and-D|defender|point-forward"],
  ["Andrew Wiggins", "SF", "Warriors", "2020s", 83, "3-and-D|two-way"],
  ["Jordan Poole", "SG", "Warriors", "2020s", 81, "scorer|shooter"],
  ["Jonathan Kuminga", "PF", "Warriors", "2020s", 80, "slasher|athleticism".replace("athleticism","two-way")],

  // ── SPURS ──────────────────────────────────────────────
  ["George Gervin", "SG", "Spurs", "1980s", 92, "scorer|shooter", "george-gervin"],
  ["Tim Duncan", "PF", "Spurs", "2000s", 96, "post-scorer|rim-protector|two-way", "tim-duncan"],
  ["Tony Parker", "PG", "Spurs", "2000s", 89, "slasher|scorer|playmaker", "tony-parker"],
  ["Manu Ginobili", "SG", "Spurs", "2000s", 87, "scorer|shooter|playmaker", "manu-ginobili"],
  ["David Robinson", "C", "Spurs", "1990s", 95, "rim-protector|paint-beast|rebounder", "david-robinson"],
  ["Sean Elliott", "SF", "Spurs", "1990s", 81, "shooter|two-way"],
  ["Kawhi Leonard", "SF", "Spurs", "2010s", 92, "3-and-D|scorer|two-way", "kawhi-leonard"],
  ["LaMarcus Aldridge", "PF", "Spurs", "2010s", 86, "post-scorer|stretch-big"],
  ["Victor Wembanyama", "C", "Spurs", "2020s", 93, "rim-protector|stretch-big|paint-beast", "victor-wembanyama"],
  ["Devin Vassell", "SG", "Spurs", "2020s", 81, "3-and-D|shooter"],

  // ── HEAT ───────────────────────────────────────────────
  ["Dwyane Wade", "SG", "Heat", "2000s", 94, "scorer|slasher|two-way", "dwyane-wade"],
  ["Alonzo Mourning", "C", "Heat", "2000s", 86, "rim-protector|paint-beast"],
  ["LeBron James", "SF", "Heat", "2010s", 97, "point-forward|scorer|two-way", "lebron-james"],
  ["Chris Bosh", "PF", "Heat", "2010s", 87, "stretch-big|post-scorer"],
  ["Jimmy Butler", "SF", "Heat", "2020s", 89, "two-way|scorer|defender", "jimmy-butler"],
  ["Bam Adebayo", "C", "Heat", "2020s", 87, "rim-protector|defender|playmaker", "bam-adebayo"],
  ["Tyler Herro", "SG", "Heat", "2020s", 83, "scorer|shooter"],
  ["Goran Dragic", "PG", "Heat", "2010s", 82, "scorer|playmaker"],

  // ── PISTONS ────────────────────────────────────────────
  ["Isiah Thomas", "PG", "Pistons", "1980s", 95, "scorer|playmaker|floor-general", "isiah-thomas"],
  ["Joe Dumars", "SG", "Pistons", "1980s", 87, "shooter|defender|two-way"],
  ["Bill Laimbeer", "C", "Pistons", "1980s", 84, "stretch-big|rebounder"],
  ["Dennis Rodman", "PF", "Pistons", "1980s", 82, "rebounder|defender", "dennis-rodman-det"],
  ["Chauncey Billups", "PG", "Pistons", "2000s", 88, "floor-general|shooter|clutch".replace("clutch","scorer"), "chauncey-billups"],
  ["Ben Wallace", "C", "Pistons", "2000s", 86, "rim-protector|rebounder|defender"],
  ["Richard Hamilton", "SG", "Pistons", "2000s", 84, "scorer|shooter"],
  ["Rasheed Wallace", "PF", "Pistons", "2000s", 84, "stretch-big|rim-protector"],
  ["Cade Cunningham", "PG", "Pistons", "2020s", 85, "playmaker|scorer|point-forward", "cade-cunningham"],

  // ── JAZZ ───────────────────────────────────────────────
  ["John Stockton", "PG", "Jazz", "1990s", 96, "playmaker|floor-general|two-way", "john-stockton"],
  ["Karl Malone", "PF", "Jazz", "1990s", 95, "post-scorer|paint-beast|scorer", "karl-malone"],
  ["Jeff Hornacek", "SG", "Jazz", "1990s", 83, "shooter|two-way"],
  ["Deron Williams", "PG", "Jazz", "2000s", 87, "playmaker|scorer"],
  ["Carlos Boozer", "PF", "Jazz", "2000s", 84, "post-scorer|rebounder"],
  ["Donovan Mitchell", "SG", "Jazz", "2010s", 88, "scorer|slasher|shooter", "donovan-mitchell"],
  ["Rudy Gobert", "C", "Jazz", "2010s", 87, "rim-protector|rebounder|defender", "rudy-gobert"],
  ["Lauri Markkanen", "PF", "Jazz", "2020s", 85, "stretch-big|scorer"],

  // ── ROCKETS ────────────────────────────────────────────
  ["Hakeem Olajuwon", "C", "Rockets", "1990s", 96, "rim-protector|post-scorer|paint-beast", "hakeem-olajuwon"],
  ["Clyde Drexler", "SG", "Rockets", "1990s", 89, "slasher|scorer", "clyde-drexler"],
  ["Yao Ming", "C", "Rockets", "2000s", 88, "post-scorer|rim-protector"],
  ["Tracy McGrady", "SF", "Rockets", "2000s", 91, "scorer|shooter|slasher", "tracy-mcgrady"],
  ["James Harden", "SG", "Rockets", "2010s", 94, "scorer|playmaker|shooter", "james-harden"],
  ["Russell Westbrook", "PG", "Rockets", "2010s", 89, "scorer|slasher|rebounder", "russell-westbrook"],
  ["Chris Paul", "PG", "Rockets", "2010s", 90, "playmaker|floor-general|two-way", "chris-paul"],
  ["Alperen Sengun", "C", "Rockets", "2020s", 84, "post-scorer|playmaker"],
  ["Jalen Green", "SG", "Rockets", "2020s", 82, "scorer|slasher"],

  // ── SUNS ───────────────────────────────────────────────
  ["Steve Nash", "PG", "Suns", "2000s", 92, "playmaker|shooter|floor-general", "steve-nash"],
  ["Amar'e Stoudemire", "PF", "Suns", "2000s", 88, "paint-beast|slasher"],
  ["Shawn Marion", "SF", "Suns", "2000s", 85, "two-way|rebounder|versatile"],
  ["Charles Barkley", "PF", "Suns", "1990s", 93, "rebounder|paint-beast|scorer", "charles-barkley"],
  ["Kevin Johnson", "PG", "Suns", "1990s", 86, "playmaker|scorer"],
  ["Devin Booker", "SG", "Suns", "2020s", 91, "scorer|shooter|playmaker", "devin-booker"],
  ["Kevin Durant", "SF", "Suns", "2020s", 93, "scorer|shooter|two-way", "kevin-durant-phx"],
  ["Bradley Beal", "SG", "Suns", "2020s", 84, "scorer|shooter", "bradley-beal"],
  ["Deandre Ayton", "C", "Suns", "2020s", 83, "paint-beast|rebounder"],

  // ── KNICKS ─────────────────────────────────────────────
  ["Walt Frazier", "PG", "Knicks", "1970s", 92, "playmaker|defender|two-way", "walt-frazier"],
  ["Willis Reed", "C", "Knicks", "1970s", 88, "paint-beast|rim-protector"],
  ["Earl Monroe", "SG", "Knicks", "1970s", 86, "scorer|slasher"],
  ["Patrick Ewing", "C", "Knicks", "1990s", 92, "rim-protector|post-scorer|paint-beast", "patrick-ewing"],
  ["John Starks", "SG", "Knicks", "1990s", 82, "scorer|shooter"],
  ["Carmelo Anthony", "SF", "Knicks", "2010s", 89, "scorer|shooter", "carmelo-anthony"],
  ["Jalen Brunson", "PG", "Knicks", "2020s", 90, "scorer|playmaker|floor-general", "jalen-brunson"],
  ["Josh Hart", "SG", "Knicks", "2020s", 82, "rebounder|3-and-D|two-way", "josh-hart"],
  ["Julius Randle", "PF", "Knicks", "2020s", 85, "post-scorer|point-forward"],
  ["OG Anunoby", "SF", "Knicks", "2020s", 83, "3-and-D|defender"],
  ["Mitchell Robinson", "C", "Knicks", "2020s", 80, "rim-protector|rebounder"],

  // ── TRAIL BLAZERS ──────────────────────────────────────
  ["Bill Walton", "C", "Trail Blazers", "1970s", 91, "rim-protector|playmaker|paint-beast", "bill-walton"],
  ["Clyde Drexler", "SG", "Trail Blazers", "1990s", 90, "slasher|scorer", "clyde-drexler-por"],
  ["Damian Lillard", "PG", "Trail Blazers", "2010s", 92, "scorer|shooter|floor-general", "damian-lillard"],
  ["CJ McCollum", "SG", "Trail Blazers", "2010s", 85, "scorer|shooter", "cj-mccollum"],
  ["LaMarcus Aldridge", "PF", "Trail Blazers", "2010s", 87, "post-scorer|stretch-big", "lamarcus-aldridge-por"],
  ["Brandon Roy", "SG", "Trail Blazers", "2000s", 86, "scorer|two-way"],

  // ── BUCKS ──────────────────────────────────────────────
  ["Kareem Abdul-Jabbar", "C", "Bucks", "1970s", 96, "post-scorer|rim-protector|paint-beast", "kareem-bucks"],
  ["Oscar Robertson", "PG", "Bucks", "1970s", 93, "playmaker|scorer|rebounder", "oscar-robertson"],
  ["Sidney Moncrief", "SG", "Bucks", "1980s", 85, "defender|two-way|scorer"],
  ["Ray Allen", "SG", "Bucks", "2000s", 88, "shooter|scorer", "ray-allen-mil"],
  ["Giannis Antetokounmpo", "PF", "Bucks", "2020s", 97, "paint-beast|two-way|point-forward", "giannis-antetokounmpo"],
  ["Khris Middleton", "SF", "Bucks", "2020s", 85, "shooter|scorer|two-way"],
  ["Jrue Holiday", "PG", "Bucks", "2020s", 86, "defender|two-way|playmaker", "jrue-holiday-mil"],
  ["Brook Lopez", "C", "Bucks", "2020s", 83, "stretch-big|rim-protector"],
  ["Damian Lillard", "PG", "Bucks", "2020s", 89, "scorer|shooter|floor-general", "damian-lillard-mil"],

  // ── PACERS ─────────────────────────────────────────────
  ["Reggie Miller", "SG", "Pacers", "1990s", 90, "shooter|scorer", "reggie-miller"],
  ["Rik Smits", "C", "Pacers", "1990s", 82, "post-scorer|rim-protector"],
  ["Jermaine O'Neal", "C", "Pacers", "2000s", 85, "post-scorer|rim-protector"],
  ["Paul George", "SF", "Pacers", "2010s", 89, "3-and-D|scorer|two-way", "paul-george"],
  ["Tyrese Haliburton", "PG", "Pacers", "2020s", 89, "playmaker|shooter|floor-general", "tyrese-haliburton"],
  ["Pascal Siakam", "PF", "Pacers", "2020s", 85, "scorer|two-way|versatile"],
  ["Myles Turner", "C", "Pacers", "2020s", 82, "rim-protector|stretch-big"],

  // ── CAVALIERS ──────────────────────────────────────────
  ["LeBron James", "SF", "Cavaliers", "2010s", 97, "point-forward|scorer|playmaker", "lebron-james-cle"],
  ["Kyrie Irving", "PG", "Cavaliers", "2010s", 90, "scorer|slasher|shooter", "kyrie-irving"],
  ["Kevin Love", "PF", "Cavaliers", "2010s", 84, "stretch-big|rebounder"],
  ["Donovan Mitchell", "SG", "Cavaliers", "2020s", 89, "scorer|shooter|slasher", "donovan-mitchell-cle"],
  ["Darius Garland", "PG", "Cavaliers", "2020s", 84, "playmaker|shooter"],
  ["Evan Mobley", "PF", "Cavaliers", "2020s", 85, "rim-protector|defender|versatile"],
  ["Jarrett Allen", "C", "Cavaliers", "2020s", 82, "rim-protector|rebounder"],

  // ── THUNDER (incl. Sonics legacy) ──────────────────────
  ["Gary Payton", "PG", "Thunder", "1990s", 92, "defender|playmaker|two-way", "gary-payton"],
  ["Shawn Kemp", "PF", "Thunder", "1990s", 87, "paint-beast|slasher"],
  ["Kevin Durant", "SF", "Thunder", "2010s", 95, "scorer|shooter|two-way", "kevin-durant-okc"],
  ["Russell Westbrook", "PG", "Thunder", "2010s", 91, "scorer|slasher|rebounder", "russell-westbrook-okc"],
  ["James Harden", "SG", "Thunder", "2010s", 86, "scorer|playmaker|shooter", "james-harden-okc"],
  ["Serge Ibaka", "PF", "Thunder", "2010s", 82, "rim-protector|stretch-big"],
  ["Shai Gilgeous-Alexander", "PG", "Thunder", "2020s", 95, "scorer|slasher|two-way", "shai-gilgeous-alexander"],
  ["Chet Holmgren", "C", "Thunder", "2020s", 86, "rim-protector|stretch-big"],
  ["Jalen Williams", "SF", "Thunder", "2020s", 84, "scorer|two-way|versatile"],

  // ── MAGIC ──────────────────────────────────────────────
  ["Shaquille O'Neal", "C", "Magic", "1990s", 94, "paint-beast|rim-protector|post-scorer", "shaq-orl"],
  ["Penny Hardaway", "PG", "Magic", "1990s", 89, "playmaker|scorer|slasher", "penny-hardaway"],
  ["Tracy McGrady", "SF", "Magic", "2000s", 92, "scorer|shooter|slasher", "tracy-mcgrady-orl"],
  ["Dwight Howard", "C", "Magic", "2000s", 90, "rim-protector|rebounder|paint-beast", "dwight-howard"],
  ["Paolo Banchero", "PF", "Magic", "2020s", 86, "scorer|point-forward"],
  ["Franz Wagner", "SF", "Magic", "2020s", 83, "scorer|two-way|versatile"],

  // ── 76ERS ──────────────────────────────────────────────
  ["Julius Erving", "SF", "76ers", "1980s", 94, "slasher|scorer|two-way", "julius-erving"],
  ["Moses Malone", "C", "76ers", "1980s", 91, "rebounder|paint-beast|post-scorer", "moses-malone"],
  ["Charles Barkley", "PF", "76ers", "1980s", 90, "rebounder|paint-beast|scorer", "charles-barkley-phi"],
  ["Allen Iverson", "PG", "76ers", "2000s", 93, "scorer|slasher|playmaker", "allen-iverson"],
  ["Joel Embiid", "C", "76ers", "2020s", 95, "post-scorer|rim-protector|paint-beast", "joel-embiid"],
  ["James Harden", "SG", "76ers", "2020s", 87, "scorer|playmaker|shooter", "james-harden-phi"],
  ["Tyrese Maxey", "PG", "76ers", "2020s", 88, "scorer|shooter|slasher", "tyrese-maxey"],
  ["Ben Simmons", "PG", "76ers", "2010s", 82, "playmaker|defender|point-forward"],

  // ── NUGGETS ────────────────────────────────────────────
  ["Alex English", "SF", "Nuggets", "1980s", 87, "scorer|shooter"],
  ["Dikembe Mutombo", "C", "Nuggets", "1990s", 84, "rim-protector|rebounder|defender"],
  ["Carmelo Anthony", "SF", "Nuggets", "2000s", 89, "scorer|shooter", "carmelo-anthony-den"],
  ["Allen Iverson", "PG", "Nuggets", "2000s", 88, "scorer|slasher|playmaker", "allen-iverson-den"],
  ["Nikola Jokic", "C", "Nuggets", "2020s", 97, "playmaker|post-scorer|facilitator", "nikola-jokic"],
  ["Jamal Murray", "PG", "Nuggets", "2020s", 87, "scorer|shooter|clutch".replace("clutch","slasher"), "jamal-murray"],
  ["Aaron Gordon", "PF", "Nuggets", "2020s", 83, "slasher|defender|two-way"],
  ["Michael Porter Jr.", "SF", "Nuggets", "2020s", 83, "shooter|3-and-D"],

  // ── MAVERICKS ──────────────────────────────────────────
  ["Dirk Nowitzki", "PF", "Mavericks", "2000s", 94, "stretch-big|scorer|shooter", "dirk-nowitzki"],
  ["Jason Kidd", "PG", "Mavericks", "2010s", 86, "playmaker|floor-general|defender", "jason-kidd"],
  ["Luka Doncic", "PG", "Mavericks", "2020s", 96, "scorer|playmaker|shooter", "luka-doncic"],
  ["Kyrie Irving", "PG", "Mavericks", "2020s", 89, "scorer|slasher|shooter", "kyrie-irving-dal"],
  ["Klay Thompson", "SG", "Mavericks", "2020s", 82, "shooter|3-and-D", "klay-thompson-dal"],
  ["Dereck Lively II", "C", "Mavericks", "2020s", 80, "rim-protector|rebounder"],

  // ── PELICANS (incl. Hornets legacy) ────────────────────
  ["Chris Paul", "PG", "Pelicans", "2000s", 90, "playmaker|floor-general|two-way", "chris-paul-nop"],
  ["Anthony Davis", "PF", "Pelicans", "2010s", 93, "rim-protector|paint-beast|two-way", "anthony-davis-nop"],
  ["Zion Williamson", "PF", "Pelicans", "2020s", 88, "paint-beast|slasher|scorer", "zion-williamson"],
  ["Brandon Ingram", "SF", "Pelicans", "2020s", 85, "scorer|shooter|versatile"],
  ["CJ McCollum", "SG", "Pelicans", "2020s", 83, "scorer|shooter", "cj-mccollum-nop"],

  // ── GRIZZLIES ──────────────────────────────────────────
  ["Marc Gasol", "C", "Grizzlies", "2010s", 86, "rim-protector|playmaker|stretch-big"],
  ["Mike Conley", "PG", "Grizzlies", "2010s", 84, "playmaker|shooter|two-way", "mike-conley"],
  ["Zach Randolph", "PF", "Grizzlies", "2010s", 84, "post-scorer|rebounder"],
  ["Ja Morant", "PG", "Grizzlies", "2020s", 90, "scorer|slasher|playmaker", "ja-morant"],
  ["Jaren Jackson Jr.", "PF", "Grizzlies", "2020s", 85, "rim-protector|stretch-big|defender"],
  ["Desmond Bane", "SG", "Grizzlies", "2020s", 84, "shooter|scorer|3-and-D"],

  // ── TIMBERWOLVES ───────────────────────────────────────
  ["Kevin Garnett", "PF", "Timberwolves", "2000s", 94, "two-way|rim-protector|post-scorer", "kevin-garnett-min"],
  ["Sam Cassell", "PG", "Timberwolves", "2000s", 83, "scorer|playmaker"],
  ["Kevin Love", "PF", "Timberwolves", "2010s", 86, "stretch-big|rebounder", "kevin-love-min"],
  ["Anthony Edwards", "SG", "Timberwolves", "2020s", 91, "scorer|slasher|shooter", "anthony-edwards"],
  ["Rudy Gobert", "C", "Timberwolves", "2020s", 85, "rim-protector|rebounder|defender", "rudy-gobert-min"],
  ["Karl-Anthony Towns", "C", "Timberwolves", "2020s", 87, "stretch-big|post-scorer|scorer", "karl-anthony-towns"],

  // ── KINGS ──────────────────────────────────────────────
  ["Chris Webber", "PF", "Kings", "2000s", 88, "post-scorer|playmaker|point-forward"],
  ["Mike Bibby", "PG", "Kings", "2000s", 83, "shooter|scorer"],
  ["Peja Stojakovic", "SF", "Kings", "2000s", 85, "shooter|scorer"],
  ["DeMarcus Cousins", "C", "Kings", "2010s", 87, "post-scorer|rebounder|paint-beast"],
  ["De'Aaron Fox", "PG", "Kings", "2020s", 88, "scorer|slasher|playmaker", "deaaron-fox"],
  ["Domantas Sabonis", "C", "Kings", "2020s", 86, "playmaker|rebounder|post-scorer"],

  // ── HAWKS ──────────────────────────────────────────────
  ["Dominique Wilkins", "SF", "Hawks", "1980s", 90, "scorer|slasher", "dominique-wilkins"],
  ["Dikembe Mutombo", "C", "Hawks", "1990s", 83, "rim-protector|rebounder|defender", "dikembe-mutombo-atl"],
  ["Joe Johnson", "SG", "Hawks", "2000s", 84, "scorer|shooter"],
  ["Al Horford", "C", "Hawks", "2010s", 84, "stretch-big|rim-protector", "al-horford-atl"],
  ["Trae Young", "PG", "Hawks", "2020s", 89, "scorer|playmaker|shooter", "trae-young"],
  ["Dejounte Murray", "PG", "Hawks", "2020s", 84, "two-way|scorer|defender"],

  // ── WIZARDS (incl. Bullets legacy) ─────────────────────
  ["Wes Unseld", "C", "Wizards", "1970s", 87, "rebounder|rim-protector|playmaker", "wes-unseld"],
  ["Elvin Hayes", "PF", "Wizards", "1970s", 88, "post-scorer|rebounder|rim-protector", "elvin-hayes"],
  ["Gilbert Arenas", "PG", "Wizards", "2000s", 86, "scorer|shooter"],
  ["John Wall", "PG", "Wizards", "2010s", 87, "playmaker|slasher|defender", "john-wall"],
  ["Bradley Beal", "SG", "Wizards", "2010s", 86, "scorer|shooter", "bradley-beal-was"],

  // ── NETS ───────────────────────────────────────────────
  ["Jason Kidd", "PG", "Nets", "2000s", 88, "playmaker|floor-general|defender", "jason-kidd-njn"],
  ["Vince Carter", "SG", "Nets", "2000s", 87, "scorer|slasher|shooter", "vince-carter-njn"],
  ["Kevin Durant", "SF", "Nets", "2020s", 95, "scorer|shooter|two-way", "kevin-durant-bkn"],
  ["Kyrie Irving", "PG", "Nets", "2020s", 89, "scorer|slasher|shooter", "kyrie-irving-bkn"],
  ["James Harden", "SG", "Nets", "2020s", 88, "scorer|playmaker|shooter", "james-harden-bkn"],
  ["Mikal Bridges", "SF", "Nets", "2020s", 83, "3-and-D|scorer|two-way"],

  // ── CLIPPERS ───────────────────────────────────────────
  ["Chris Paul", "PG", "Clippers", "2010s", 91, "playmaker|floor-general|two-way", "chris-paul-lac"],
  ["Blake Griffin", "PF", "Clippers", "2010s", 88, "paint-beast|slasher|point-forward"],
  ["DeAndre Jordan", "C", "Clippers", "2010s", 82, "rim-protector|rebounder"],
  ["Kawhi Leonard", "SF", "Clippers", "2020s", 91, "3-and-D|scorer|two-way", "kawhi-leonard-lac"],
  ["Paul George", "SF", "Clippers", "2020s", 88, "3-and-D|scorer|two-way", "paul-george-lac"],
  ["James Harden", "SG", "Clippers", "2020s", 84, "scorer|playmaker|shooter", "james-harden-lac"],

  // ── RAPTORS ────────────────────────────────────────────
  ["Vince Carter", "SG", "Raptors", "2000s", 89, "scorer|slasher|shooter", "vince-carter"],
  ["Chris Bosh", "PF", "Raptors", "2000s", 85, "post-scorer|stretch-big", "chris-bosh-tor"],
  ["DeMar DeRozan", "SG", "Raptors", "2010s", 86, "scorer|two-way", "demar-derozan-tor"],
  ["Kyle Lowry", "PG", "Raptors", "2010s", 85, "playmaker|shooter|two-way", "kyle-lowry"],
  ["Kawhi Leonard", "SF", "Raptors", "2010s", 93, "3-and-D|scorer|two-way", "kawhi-leonard-tor"],
  ["Pascal Siakam", "PF", "Raptors", "2010s", 84, "scorer|two-way|versatile", "pascal-siakam-tor"],
  ["Scottie Barnes", "SF", "Raptors", "2020s", 84, "point-forward|defender|versatile"],

  // ── HORNETS ────────────────────────────────────────────
  ["Larry Johnson", "PF", "Hornets", "1990s", 85, "paint-beast|post-scorer"],
  ["Alonzo Mourning", "C", "Hornets", "1990s", 86, "rim-protector|paint-beast", "alonzo-mourning-cha"],
  ["Glen Rice", "SF", "Hornets", "1990s", 84, "shooter|scorer"],
  ["Muggsy Bogues", "PG", "Hornets", "1990s", 78, "playmaker|defender"],
  ["Baron Davis", "PG", "Hornets", "2000s", 84, "playmaker|slasher"],
  ["Gerald Wallace", "SF", "Hornets", "2000s", 81, "defender|two-way"],
  ["Kemba Walker", "PG", "Hornets", "2010s", 86, "scorer|shooter|floor-general"],
  ["Al Jefferson", "C", "Hornets", "2010s", 82, "post-scorer|rebounder"],
  ["LaMelo Ball", "PG", "Hornets", "2020s", 85, "playmaker|shooter|scorer"],
  ["Miles Bridges", "SF", "Hornets", "2020s", 80, "slasher|two-way"],
  ["Brandon Miller", "SF", "Hornets", "2020s", 80, "shooter|scorer"],
];

const seen = new Set();
const players = R.map(([name, position, team, decade, ovr, archStr, idOverride]) => {
  const archetype = archStr.split("|");
  const id = idOverride || slug(name);
  if (seen.has(id)) throw new Error(`duplicate id: ${id} (${name} ${team} ${decade})`);
  seen.add(id);
  const attrs = derive(position, ovr, archetype);
  return { id, name, position, team, decade, ...attrs, archetype };
});

const KEYS = ["id","name","position","team","decade","overall","scoring","playmaking","shooting","spacing","perimeterDefense","rimProtection","rebounding","athleticism","IQ","clutch","usageRate","archetype"];

function fmt(p) {
  const lines = KEYS.map((k) => {
    const v = p[k];
    if (k === "archetype") return `    archetype: ${JSON.stringify(v)},`;
    if (typeof v === "string") return `    ${k}: ${JSON.stringify(v)},`;
    return `    ${k}: ${v},`;
  });
  return `  {\n${lines.join("\n")}\n  },`;
}

const NBA_TEAMS = [
  "Lakers","Celtics","Bulls","Warriors","Spurs","Heat","Pistons","Jazz","Rockets","Suns",
  "Knicks","Trail Blazers","Bucks","Pacers","Cavaliers","Thunder","Magic","76ers","Nuggets","Mavericks",
  "Pelicans","Grizzlies","Timberwolves","Kings","Hawks","Wizards","Nets","Clippers","Raptors","Hornets",
];

const out = `import type { Player } from "../types";

// AUTO-GENERATED by scripts/genPlayers.mjs — do not edit by hand.
// Edit the roster in that script and re-run: node scripts/genPlayers.mjs
export const PLAYERS: Player[] = [
${players.map(fmt).join("\n")}
];

export const NBA_TEAMS = ${JSON.stringify(NBA_TEAMS, null, 2).replace(/\n/g, "\n")};

export const DECADES: string[] = [
  "1970s",
  "1980s",
  "1990s",
  "2000s",
  "2010s",
  "2020s",
];

export function getPlayersForSlot(
  team: string,
  decade: string,
  position: string
): Player[] {
  return PLAYERS.filter(
    (p) => p.team === team && p.decade === decade && p.position === position
  );
}
`;

writeFileSync(resolve(root, "src/data/players.ts"), out);

// Report coverage
const byTeamDec = {};
for (const p of players) {
  const k = `${p.team}|${p.decade}`;
  byTeamDec[k] = (byTeamDec[k] || 0) + 1;
}
const decs = ["1970s","1980s","1990s","2000s","2010s","2020s"];
console.log(`Wrote ${players.length} players across ${new Set(players.map((p) => p.team)).size} teams.`);
console.log("Per-decade totals:", decs.map((d) => `${d}:${players.filter((p) => p.decade === d).length}`).join("  "));
const draftable = Object.values(byTeamDec).filter((n) => n >= 3).length;
console.log(`Team-decade combos with >=3 players (draftable): ${draftable}`);
console.log(`Team-decade combos with <3: ${Object.entries(byTeamDec).filter(([,n]) => n < 3).map(([k,n]) => `${k}(${n})`).join(", ") || "none"}`);

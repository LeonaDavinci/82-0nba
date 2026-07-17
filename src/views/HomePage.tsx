"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { getDailySlots } from "@/engine/draft";
import { getTeamMeta } from "@/data/teamColors";
import { BasketballIcon } from "@/components/Logo";
import type { RunRecord } from "@/types";

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

// Top 15 NBA legends (hardcoded for display)
const LEGENDS = [
  { id: "mj",     name: "Michael Jordan",     pos: "SG", team: "Bulls",    decade: "1990s", ovr: 99 },
  { id: "lbj",    name: "LeBron James",        pos: "SF", team: "Heat",     decade: "2010s", ovr: 99 },
  { id: "kab",    name: "Kareem Abdul-Jabbar", pos: "C",  team: "Lakers",   decade: "1970s", ovr: 98 },
  { id: "magic",  name: "Magic Johnson",       pos: "PG", team: "Lakers",   decade: "1980s", ovr: 98 },
  { id: "wilt",   name: "Wilt Chamberlain",    pos: "C",  team: "76ers",    decade: "1960s", ovr: 98 },
  { id: "bird",   name: "Larry Bird",          pos: "SF", team: "Celtics",  decade: "1980s", ovr: 97 },
  { id: "shaq",   name: "Shaquille O'Neal",    pos: "C",  team: "Lakers",   decade: "2000s", ovr: 97 },
  { id: "hakeem", name: "Hakeem Olajuwon",     pos: "C",  team: "Rockets",  decade: "1990s", ovr: 97 },
  { id: "br",     name: "Bill Russell",        pos: "C",  team: "Celtics",  decade: "1960s", ovr: 97 },
  { id: "kobe",   name: "Kobe Bryant",         pos: "SG", team: "Lakers",   decade: "2000s", ovr: 96 },
  { id: "curry",  name: "Stephen Curry",       pos: "PG", team: "Warriors", decade: "2010s", ovr: 96 },
  { id: "td",     name: "Tim Duncan",          pos: "PF", team: "Spurs",    decade: "2000s", ovr: 96 },
  { id: "oscar",  name: "Oscar Robertson",     pos: "PG", team: "Royals",   decade: "1960s", ovr: 96 },
  { id: "stockton", name: "John Stockton",     pos: "PG", team: "Jazz",     decade: "1990s", ovr: 96 },
  { id: "kd",     name: "Kevin Durant",        pos: "SF", team: "Thunder",  decade: "2010s", ovr: 95 },
  { id: "jwest",  name: "Jerry West",          pos: "SG", team: "Lakers",   decade: "1960s", ovr: 95 },
];

const POS_COLORS: Record<string, string> = {
  PG: "#1D428A",
  SG: "#6D28D9",
  SF: "#15803D",
  PF: "#E56A2C",
  C:  "#C8102E",
};

function OvrColor(ovr: number) {
  return ovr >= 98 ? "#E56A2C" : ovr >= 95 ? "#1D428A" : "#15803D";
}

function LegendAvatar({ legend }: { legend: typeof LEGENDS[0] }) {
  const color = POS_COLORS[legend.pos] ?? POS_COLORS.PG;
  const initials = legend.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  return (
    <motion.div
      whileHover={{ scale: 1.08, y: -3 }}
      className="flex flex-col items-center gap-1.5 cursor-default"
    >
      <div className="relative">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black text-white border-2 shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
            borderColor: OvrColor(legend.ovr),
          }}
          aria-label={`${legend.name}, ${legend.pos}, overall ${legend.ovr}`}
        >
          {initials}
        </div>
        <div
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white border-2 border-[#FBF8F1]"
          style={{ background: OvrColor(legend.ovr) }}
        >
          {legend.ovr}
        </div>
      </div>
      <p className="text-[9px] text-stone-600 text-center leading-tight w-14 truncate">
        {legend.name.split(" ").pop()}
      </p>
    </motion.div>
  );
}

function WinBadge({ wins }: { wins: number }) {
  const color =
    wins >= 70 ? "text-orange-600"
    : wins >= 55 ? "text-blue-800"
    : wins >= 40 ? "text-green-700"
    : "text-stone-500";
  return (
    <span className={`font-black ${color}`}>
      {wins}-{82 - wins}
    </span>
  );
}

function RunCard({ run }: { run: RunRecord }) {
  const router = useRouter();
  const names = run.selectedPlayers.map((p) => p.name.split(" ").pop() ?? "").join(" · ");
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => router.push(`/run/${run.id}`)}
      className="w-full text-left surface surface-hover rounded-2xl p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-stone-500 mb-1">{new Date(run.createdAt).toLocaleDateString()}</p>
          <p className="text-xs text-stone-600 truncate">{names}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-black"><WinBadge wins={run.result.wins} /></p>
          <p className="text-xs text-stone-500">MVP: {run.result.mvp.name.split(" ").pop()}</p>
        </div>
      </div>
    </motion.button>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { startNewGame, recentRuns } = useGameStore();

  // Client-only data (localStorage-backed + date-based) is rendered after
  // hydration so the pre-rendered HTML and first client render always match.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const dailySlots = getDailySlots();

  function handlePlay() { startNewGame(); router.push("/play"); }
  function handleDaily() { startNewGame(true); router.push("/play"); }

  const best = recentRuns.length
    ? [...recentRuns].sort((a, b) => b.result.wins - a.result.wins)[0]
    : null;

  return (
    <main className="court-bg min-h-screen px-4 py-8">
      <div className="max-w-lg mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Header / Logo (H1) */}
          <motion.header variants={staggerItem} className="text-center pt-6 pb-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-block mb-3"
            >
              <h1 className="m-0 leading-none">
                <Link
                  href="/"
                  aria-label="82-0"
                  className="inline-flex items-center gap-3 no-underline"
                >
                  <BasketballIcon className="w-14 h-14 sm:w-16 sm:h-16" />
                  <span className="nba-wordmark text-7xl font-black tracking-tighter leading-none">
                    82-0
                  </span>
                </Link>
              </h1>
            </motion.div>
            <p className="text-stone-600 text-sm max-w-xs mx-auto leading-relaxed">
              <strong>82-0</strong> is the NBA team builder game — draft all-time legends under
              random constraints and chase a flawless 82-0 season.
            </p>
          </motion.header>

          {/* CTA buttons */}
          <motion.div variants={staggerItem} className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePlay}
              className="w-full py-4 rounded-2xl font-black text-lg text-white shadow-blue transition-colors"
              style={{ background: "linear-gradient(100deg, #1D428A, #15336e)" }}
            >
              🏀 Play 82-0 Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleDaily}
              className="w-full py-3 rounded-2xl font-bold text-sm text-stone-700 surface surface-hover"
            >
              ⚡ Daily Challenge
            </motion.button>
          </motion.div>

          {/* Daily Challenge Preview with team badges (client-only: date-based) */}
          {hydrated && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              aria-label="Today's draft conditions"
            >
              <div className="surface rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-orange-500 text-base">⚡</span>
                  <h2 className="text-sm font-bold text-stone-800 m-0">Today's Draft Conditions</h2>
                  <span className="ml-auto text-xs text-stone-500">
                    {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <div className="space-y-3">
                  {dailySlots.map((slot) => {
                    const meta = getTeamMeta(slot.team);
                    return (
                      <div key={slot.position} className="flex items-center gap-3">
                        <span className="text-xs font-black text-stone-500 w-6">{slot.position}</span>
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-black border shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${meta.primary}, ${meta.primary}cc)`,
                            color: meta.secondary,
                            borderColor: meta.secondary + "40",
                          }}
                        >
                          {meta.abbr}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-stone-700">{slot.team}</p>
                          <p className="text-[10px] text-stone-500">{slot.decade}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.section>
          )}

          {/* NBA Legends Top 15 (static — great evergreen content for crawlers) */}
          <motion.section variants={staggerItem} aria-label="NBA legends">
            <div className="surface rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-orange-500">🏆</span>
                <h2 className="text-sm font-bold text-stone-800 m-0">NBA Legends in 82-0</h2>
                <span className="text-[10px] text-stone-500 ml-auto">Top 15 All-Time</span>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {LEGENDS.slice(0, 15).map((legend) => (
                  <LegendAvatar key={legend.id} legend={legend} />
                ))}
              </div>
            </div>
          </motion.section>

          {/* Personal best (client-only: localStorage) */}
          {hydrated && best && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              aria-label="Personal best"
            >
              <div className="surface rounded-2xl p-4 border-l-4" style={{ borderLeftColor: "#E56A2C" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide mb-1">🏆 Personal Best</p>
                    <p className="text-3xl font-black"><WinBadge wins={best.result.wins} /></p>
                    <p className="text-xs text-stone-500 mt-1">MVP: {best.result.mvp.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-stone-500">Off</p>
                    <p className="text-sm font-bold text-stone-800">{best.result.stats.offense}</p>
                    <p className="text-xs text-stone-500 mt-1">Def</p>
                    <p className="text-sm font-bold text-stone-800">{best.result.stats.defense}</p>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Recent runs (client-only: localStorage) */}
          {hydrated && recentRuns.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              aria-label="Recent runs"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-3">Recent Runs</p>
              <div className="space-y-2">
                {recentRuns.slice(0, 5).map((run) => (
                  <RunCard key={run.id} run={run} />
                ))}
              </div>
            </motion.section>
          )}

          {/* SEO content — static, keyword-rich, crawlable */}
          <motion.section variants={staggerItem} aria-label="About the 82-0 game" className="space-y-4">
            <article className="surface rounded-2xl p-5 prose-sm">
              <h2 className="text-base font-black text-stone-800 mb-2">What is the 82-0 game?</h2>
              <p className="text-sm text-stone-600 leading-relaxed">
                <strong>82-0</strong> is a free NBA team builder game inspired by the dream of a
                perfect, undefeated 82-0 season. In the 82-0 NBA game you draft five legends across
                every position, working within random team and era constraints. Every roster you
                build in 82-0 is simulated for offense, defense, and chemistry to see how close your
                squad comes to going 82-0.
              </p>

              <h2 className="text-base font-black text-stone-800 mt-4 mb-2">How to play 82-0</h2>
              <ol className="text-sm text-stone-600 leading-relaxed list-decimal list-inside space-y-1">
                <li>Press <strong>Play 82-0 Now</strong> to start a new draft.</li>
                <li>Fill all five positions with NBA legends that fit each constraint.</li>
                <li>Use re-rolls wisely to change a team or era when you're stuck.</li>
                <li>Simulate the season and chase the perfect 82-0 record.</li>
              </ol>

              <h2 className="text-base font-black text-stone-800 mt-4 mb-2">Why players love 82-0</h2>
              <p className="text-sm text-stone-600 leading-relaxed">
                The 82-0 game rewards basketball knowledge across every NBA era — from the 1960s to
                today. Compete in the Daily Challenge, beat your personal best, and share your run.
                Bookmark 82-0game and come back daily to chase the elusive 82-0 NBA season.
              </p>
            </article>

            <nav aria-label="Game links" className="flex flex-wrap gap-3 justify-center text-sm">
              <Link href="/play" className="font-bold text-blue-800 hover:underline">
                Play the 82-0 game
              </Link>
              <span className="text-stone-300">·</span>
              <Link href="/" className="font-bold text-blue-800 hover:underline">
                82-0 home
              </Link>
            </nav>
          </motion.section>

          {/* Footer */}
          <motion.footer variants={staggerItem} className="text-center pb-8">
            <p className="text-xs text-stone-500">82-0 · NBA historical data · For entertainment only</p>
          </motion.footer>
        </motion.div>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, animate } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { StatBar } from "@/components/StatBar";
import { downloadShareImage } from "@/engine/shareImage";
import type { RunRecord } from "@/types";

function AnimatedNumber({ target, duration = 1.5 }: { target: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [target, duration]);

  return <>{display}</>;
}

const POSITION_COLORS: Record<string, string> = {
  PG: "bg-blue-100 text-blue-800",
  SG: "bg-violet-100 text-violet-800",
  SF: "bg-green-100 text-green-800",
  PF: "bg-orange-100 text-orange-700",
  C: "bg-red-100 text-red-700",
};

export default function ResultPage() {
  const router = useRouter();
  const { result, slots, selectedPlayers, runId, recentRuns, startNewGame } = useGameStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // No simulated result in the store (e.g. deep-link or refresh) → go home.
  useEffect(() => {
    if (!result) router.replace("/");
  }, [result, router]);

  if (!result) {
    return null;
  }

  const players = selectedPlayers.filter(Boolean);
  const wins = result.wins;
  const losses = result.losses;
  const isElite = wins >= 70;
  const isGood = wins >= 55;

  const recordColor = isElite
    ? "text-orange-600"
    : isGood
    ? "text-blue-800"
    : wins >= 40
    ? "text-green-700"
    : "text-stone-500";

  async function handleShare() {
    setSaving(true);
    const run: RunRecord =
      recentRuns.find((r) => r.id === runId) ??
      ({
        id: runId ?? `run-${Date.now()}`,
        createdAt: new Date().toISOString(),
        result,
        slots,
        selectedPlayers: players,
      } as RunRecord);
    try {
      await downloadShareImage(run);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  function handlePlayAgain() {
    startNewGame();
    router.push("/play");
  }

  return (
    <div className="court-bg min-h-screen px-4 py-6">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-5"
        >
          {/* Back */}
          <button onClick={() => router.push("/")} className="text-stone-400 text-sm hover:text-stone-700 transition-colors">
            ← Home
          </button>

          {/* Record reveal */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center py-6"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Season Record</p>
            <div className={`text-8xl font-black leading-none tracking-tighter ${recordColor}`}>
              <AnimatedNumber target={wins} />
              <span className="text-stone-300">-</span>
              <AnimatedNumber target={losses} duration={1.2} />
            </div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-3 text-stone-500 text-sm max-w-xs mx-auto leading-relaxed"
            >
              {result.analysis}
            </motion.p>
          </motion.div>

          {/* Stats panel */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="surface rounded-2xl p-5 space-y-4"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Team Analysis</p>
            <StatBar label="Offense" value={result.stats.offense} delay={0.5} />
            <StatBar label="Defense" value={result.stats.defense} delay={0.6} />
            <StatBar label="Chemistry" value={result.stats.chemistry} delay={0.7} />
            <StatBar label="Spacing" value={result.stats.spacing} delay={0.8} />
            <StatBar label="Rebounding" value={result.stats.rebounding} delay={0.9} />
            <StatBar label="Rim Protection" value={result.stats.rimProtection} delay={1.0} />
          </motion.div>

          {/* MVP */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="surface rounded-2xl p-4 border-l-4"
            style={{ borderLeftColor: "#E56A2C" }}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">🏆</div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-orange-600">Season MVP</p>
                <p className="text-lg font-black text-stone-800">{result.mvp.name}</p>
                <p className="text-xs text-stone-400">{result.mvp.team} · {result.mvp.decade} · OVR {result.mvp.overall}</p>
              </div>
            </div>
          </motion.div>

          {/* Synergies */}
          {result.synergies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="surface rounded-2xl p-4 border-l-4"
              style={{ borderLeftColor: "#15803d" }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-green-700 mb-2">Synergy Bonuses</p>
              <div className="space-y-1.5">
                {result.synergies.map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <span className="text-green-600 text-xs">✓</span>
                    <span className="text-sm text-stone-600">{s}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Strengths & Weaknesses */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-2 gap-3"
          >
            {result.strengths.length > 0 && (
              <div className="surface rounded-2xl p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-green-700 mb-2">Strengths</p>
                <div className="space-y-1.5">
                  {result.strengths.slice(0, 3).map((s) => (
                    <p key={s} className="text-xs text-stone-500 leading-relaxed">{s}</p>
                  ))}
                </div>
              </div>
            )}
            {result.weaknesses.length > 0 && (
              <div className="surface rounded-2xl p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-red-700 mb-2">Weaknesses</p>
                <div className="space-y-1.5">
                  {result.weaknesses.slice(0, 3).map((w) => (
                    <p key={w} className="text-xs text-stone-500 leading-relaxed">{w}</p>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Roster */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="surface rounded-2xl p-4"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Roster</p>
            <div className="space-y-2.5">
              {players.map((p, i) => p && (
                <div key={p.id} className="flex items-center gap-3">
                  <span className={`position-badge ${POSITION_COLORS[slots[i]?.position ?? p.position]}`}>
                    {slots[i]?.position ?? p.position}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-stone-800">{p.name}</span>
                    <span className="text-xs text-stone-400 ml-2">{p.team} · {p.decade}</span>
                  </div>
                  {result.mvp.id === p.id && <span className="text-orange-500 text-sm">🏆</span>}
                  <span className="text-sm font-bold text-stone-500">{p.overall}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-3 pb-8"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleShare}
              disabled={saving}
              className="w-full py-3.5 rounded-2xl font-bold text-white shadow-red transition-all disabled:opacity-70"
              style={{ background: "linear-gradient(100deg, #C8102E, #9b0c23)" }}
            >
              {saved ? "✓ Image Saved!" : saving ? "Generating…" : "📸 Share This Run"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePlayAgain}
              className="w-full py-3.5 rounded-2xl font-bold text-stone-700 surface surface-hover"
            >
              🏀 Play Again
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

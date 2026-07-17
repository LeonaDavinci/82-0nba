import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { useGameStore } from "@/store/gameStore";
import { StatBar } from "@/components/StatBar";
import { downloadShareImage } from "@/engine/shareImage";
import { usePageMeta } from "@/lib/usePageMeta";
import type { RunRecord } from "@/types";

const POSITION_COLORS: Record<string, string> = {
  PG: "bg-blue-100 text-blue-800",
  SG: "bg-violet-100 text-violet-800",
  SF: "bg-green-100 text-green-800",
  PF: "bg-orange-100 text-orange-700",
  C: "bg-red-100 text-red-700",
};

export default function SharePage() {
  usePageMeta(
    "Shared 82-0 Run — NBA Team Builder",
    "Check out this 82-0 NBA team builder run and try to beat the score in the 82-0 game.",
  );
  const params = useParams<{ id: string }>();
  const [, nav] = useLocation();
  const { loadRun, startNewGame } = useGameStore();
  const [run, setRun] = useState<RunRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (params.id) {
      const found = loadRun(params.id);
      setRun(found);
    }
  }, [params.id]);

  if (!run) {
    return (
      <div className="court-bg min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <p className="text-4xl">🏀</p>
          <p className="text-stone-800 font-bold text-lg">Run Not Found</p>
          <p className="text-stone-400 text-sm">This run may have expired or is from another device.</p>
          <button
            onClick={() => { startNewGame(); nav("/play"); }}
            className="px-6 py-3 rounded-xl text-white font-bold text-sm"
            style={{ background: "#1D428A" }}
          >
            Start Your Own Run
          </button>
        </motion.div>
      </div>
    );
  }

  const { result, slots, selectedPlayers } = run;
  const wins = result.wins;
  const losses = result.losses;
  const recordColor =
    wins >= 70
      ? "text-orange-600"
      : wins >= 55
      ? "text-blue-800"
      : wins >= 40
      ? "text-green-700"
      : "text-stone-500";

  async function handleShare() {
    if (!run) return;
    setSaving(true);
    try {
      await downloadShareImage(run);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="court-bg min-h-screen px-4 py-6">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-5"
        >
          <button onClick={() => nav("/")} className="text-stone-400 text-sm hover:text-stone-700 transition-colors">
            ← Home
          </button>

          {/* Share card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="surface rounded-3xl p-6"
          >
            {/* Title */}
            <div className="text-center mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">82-0 Draft Result</p>
              <div className={`text-7xl font-black leading-none tracking-tighter ${recordColor}`}>
                {wins}-{losses}
              </div>
              <p className="text-stone-400 text-xs mt-2">{new Date(run.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
            </div>

            {/* Roster */}
            <div className="space-y-2.5 mb-5">
              {selectedPlayers.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className={`position-badge ${POSITION_COLORS[slots[i]?.position ?? p.position]}`}>
                    {slots[i]?.position ?? p.position}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-stone-800">{p.name}</span>
                    <span className="text-xs text-stone-400 ml-2">{p.team} · {p.decade}</span>
                  </div>
                  {result.mvp.id === p.id && <span className="text-orange-600 text-xs font-bold">MVP 🏆</span>}
                  <span className="text-xs font-bold text-stone-500">{p.overall}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="space-y-2.5">
              <StatBar label="Offense" value={result.stats.offense} delay={0.2} />
              <StatBar label="Defense" value={result.stats.defense} delay={0.3} />
              <StatBar label="Chemistry" value={result.stats.chemistry} delay={0.4} />
            </div>

            {/* Analysis */}
            <p className="text-xs text-stone-500 mt-4 leading-relaxed text-center italic">"{result.analysis}"</p>
          </motion.div>

          {/* Synergies */}
          {result.synergies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="surface rounded-2xl p-4 border-l-4"
              style={{ borderLeftColor: "#15803d" }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-green-700 mb-2">Synergies</p>
              {result.synergies.map((s) => (
                <p key={s} className="text-sm text-stone-600">✓ {s}</p>
              ))}
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3 pb-8"
          >
            <button
              onClick={handleShare}
              disabled={saving}
              className="w-full py-3.5 rounded-2xl font-bold text-white shadow-red disabled:opacity-70"
              style={{ background: "linear-gradient(100deg, #C8102E, #9b0c23)" }}
            >
              {saved ? "✓ Image Saved!" : saving ? "Generating…" : "📸 Download Image"}
            </button>
            <button
              onClick={() => { startNewGame(); nav("/play"); }}
              className="w-full py-3.5 rounded-2xl font-bold text-stone-700 surface surface-hover"
            >
              🏀 Try Your Own Draft
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

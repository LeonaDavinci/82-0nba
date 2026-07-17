"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { getPlayersForRound, getDisplayStats } from "@/engine/draft";
import { getTeamMeta } from "@/data/teamColors";
import type { Player, PosFilter, SortKey } from "@/types";

const POSITIONS = ["PG", "SG", "SF", "PF", "C"] as const;

const POS_COLORS: Record<string, { ring: string; bg: string; text: string }> = {
  PG: { ring: "#1D428A", bg: "#1D428A14", text: "#1D428A" },
  SG: { ring: "#6D28D9", bg: "#6D28D914", text: "#6D28D9" },
  SF: { ring: "#15803D", bg: "#15803D14", text: "#15803D" },
  PF: { ring: "#E56A2C", bg: "#E56A2C14", text: "#C2410C" },
  C:  { ring: "#C8102E", bg: "#C8102E14", text: "#C8102E" },
};

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "ppg", label: "PPG" },
  { key: "rpg", label: "RPG" },
  { key: "apg", label: "APG" },
  { key: "az",  label: "A-Z" },
];

function EraLabel(decade: string) {
  // "1990s" → "90's"
  return decade.replace("19", "").replace("20", "").replace("s", "'s");
}

function PosBadge({ pos }: { pos: string }) {
  const c = POS_COLORS[pos] ?? POS_COLORS.PG;
  return (
    <span
      className="text-[9px] font-bold px-1.5 py-0.5 rounded"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.ring}40` }}
    >
      {pos}
    </span>
  );
}

function PlayerRow({ player, onSelect }: { player: Player; onSelect: () => void }) {
  const s = getDisplayStats(player);
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ backgroundColor: "rgba(29,66,138,0.05)" }}
      whileTap={{ scale: 0.99 }}
      className="w-full text-left px-4 py-3 border-b border-stone-200/70 transition-colors flex items-center gap-3"
    >
      {/* Name + position tags */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-stone-800 text-sm leading-tight">{player.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <PosBadge pos={player.position} />
          <span className="text-[10px] text-stone-400">{player.team} · {player.decade}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 shrink-0">
        <StatCol value={s.ppg} label="PPG" />
        <StatCol value={s.rpg} label="RPG" />
        {s.apg >= 3 && <StatCol value={s.apg} label="APG" />}
        {s.spg >= 1.2 && <StatCol value={s.spg} label="SPG" />}
        {s.bpg >= 1 && <StatCol value={s.bpg} label="BPG" />}
      </div>
    </motion.button>
  );
}

function StatCol({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center min-w-[32px]">
      <p className="text-sm font-bold text-stone-700 leading-none">{value}</p>
      <p className="text-[9px] text-stone-400 mt-0.5">{label}</p>
    </div>
  );
}

function SlotCircle({
  pos,
  player,
  isActive,
  onClick,
}: {
  pos: string;
  player: Player | null;
  isActive: boolean;
  onClick: () => void;
}) {
  const c = POS_COLORS[pos] ?? POS_COLORS.PG;
  const initials = player
    ? player.name.split(" ").map((w) => w[0]).join("").slice(0, 2)
    : pos;

  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all duration-200"
        style={{
          border: `2px solid ${isActive ? c.ring : player ? c.ring + "99" : "rgba(120,113,108,0.35)"}`,
          background: player ? c.bg : isActive ? c.bg : "transparent",
          color: player ? c.text : isActive ? c.text : "rgba(120,113,108,0.6)",
          borderStyle: player || isActive ? "solid" : "dashed",
          boxShadow: isActive ? `0 0 0 4px ${c.ring}22` : "none",
        }}
      >
        {initials}
      </div>
      <span className="text-[9px] text-stone-400">{pos}</span>
    </button>
  );
}

export default function PlayPage() {
  const router = useRouter();
  const {
    slots,
    selectedPlayers,
    currentSlotIndex,
    selectPlayer,
    deselectPlayer,
    setCurrentSlot,
    rerollSlotTeam,
    rerollSlotEra,
    finishDraft,
    startNewGame,
  } = useGameStore();

  const [search, setSearch] = useState("");
  const [posFilter, setPosFilter] = useState<PosFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("ppg");
  const [sortOpen, setSortOpen] = useState(false);

  if (slots.length === 0) {
    return (
      <div className="court-bg min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <p className="text-stone-500">No game in progress</p>
          <button
            onClick={() => startNewGame()}
            className="px-6 py-3 rounded-xl text-white font-bold"
            style={{ background: "#1D428A" }}
          >
            Start Game
          </button>
          <button onClick={() => router.push("/")} className="block mx-auto text-stone-400 text-sm">
            ← Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  const currentSlot = slots[currentSlotIndex];
  const filledCount = selectedPlayers.filter(Boolean).length;
  const isComplete = filledCount === 5;

  const allPlayers = useMemo(
    () => getPlayersForRound(currentSlot),
    [currentSlot.team, currentSlot.decade]
  );

  const filtered = useMemo(() => {
    let list = allPlayers;

    // Position filter
    if (posFilter === "G") list = list.filter((p) => p.position === "PG" || p.position === "SG");
    else if (posFilter === "F") list = list.filter((p) => p.position === "SF" || p.position === "PF");
    else if (posFilter === "C") list = list.filter((p) => p.position === "C");

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    // Sort
    if (sortKey === "ppg") list = [...list].sort((a, b) => b.scoring - a.scoring);
    else if (sortKey === "rpg") list = [...list].sort((a, b) => b.rebounding - a.rebounding);
    else if (sortKey === "apg") list = [...list].sort((a, b) => b.playmaking - a.playmaking);
    else if (sortKey === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [allPlayers, posFilter, search, sortKey]);

  const teamMeta = getTeamMeta(currentSlot.team);
  const eraLabel = EraLabel(currentSlot.decade);

  function handleFinish() {
    try { finishDraft(); } catch { /* ignore */ }
    router.push("/result");
  }

  return (
    <div className="court-bg min-h-screen flex flex-col max-w-lg mx-auto">

      {/* ── Top header ── */}
      <div className="px-4 pt-4 pb-2 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => router.push("/")} className="text-stone-400 hover:text-stone-700 transition-colors">
            <span className="text-lg">←</span>
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-stone-400 uppercase tracking-widest">Round</span>
            <span className="text-base font-black text-stone-800">{currentSlotIndex + 1}/5</span>
          </div>
          <div className="w-8" />
        </div>

        {/* Team badge + Era pill + Reroll buttons */}
        <div className="flex items-center gap-2 mb-4">
          {/* Team badge */}
          <div
            className="h-9 px-3 rounded-xl flex items-center justify-center font-black text-sm min-w-[52px] shadow-sm"
            style={{ background: teamMeta.primary, color: teamMeta.secondary }}
          >
            {teamMeta.abbr}
          </div>

          {/* Era pill */}
          <div className="h-9 px-3 rounded-xl flex items-center justify-center font-black text-sm bg-orange-100 text-orange-700 border border-orange-200">
            {eraLabel}
          </div>

          <div className="flex-1" />

          {/* Reroll team */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            disabled={currentSlot.teamRerolled}
            onClick={() => {
              rerollSlotTeam(currentSlotIndex);
              setSearch("");
              setPosFilter("all");
            }}
            className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all ${
              currentSlot.teamRerolled
                ? "text-stone-300 bg-stone-100 cursor-not-allowed"
                : "text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200"
            }`}
          >
            <span>↻</span> Team
          </motion.button>

          {/* Reroll era */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            disabled={currentSlot.eraRerolled}
            onClick={() => {
              rerollSlotEra(currentSlotIndex);
              setSearch("");
              setPosFilter("all");
            }}
            className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all ${
              currentSlot.eraRerolled
                ? "text-stone-300 bg-stone-100 cursor-not-allowed"
                : "text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200"
            }`}
          >
            <span>↻</span> Era
          </motion.button>
        </div>

        {/* Position filter + search + sort */}
        <div className="flex items-center gap-2 mb-2">
          {/* Pos filter pills */}
          {(["all", "G", "F", "C"] as PosFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setPosFilter(f)}
              className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-all ${
                posFilter === f
                  ? "bg-orange-500 text-white"
                  : "text-stone-400 hover:text-stone-700"
              }`}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}

          {/* Search */}
          <div className="flex-1">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-1 text-xs font-bold text-stone-600 bg-white border border-stone-300 rounded-lg px-3 py-1.5 hover:text-stone-800 transition-colors"
            >
              {SORT_OPTIONS.find((o) => o.key === sortKey)?.label}
              <span className="text-[8px]">▼</span>
            </button>
            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1 z-50 bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xl min-w-[80px]"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => { setSortKey(opt.key); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-bold flex items-center justify-between transition-colors ${
                        sortKey === opt.key
                          ? "bg-orange-50 text-orange-700"
                          : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                      }`}
                    >
                      {opt.label}
                      {sortKey === opt.key && <span className="text-orange-500">✓</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Count */}
        <p className="text-[11px] text-stone-400 mb-2">
          {filtered.length} player{filtered.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* ── Player list ── */}
      {!isComplete ? (
        <div className="flex-1 overflow-y-auto" onClick={() => sortOpen && setSortOpen(false)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentSlot.team}-${currentSlot.decade}-${posFilter}-${sortKey}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-stone-400 text-sm">
                  No players found
                </div>
              ) : (
                filtered.map((player) => (
                  <PlayerRow
                    key={player.id}
                    player={player}
                    onSelect={() => {
                      selectPlayer(player);
                      setSearch("");
                      setPosFilter("all");
                    }}
                  />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-2"
          >
            <p className="text-2xl">🏀</p>
            <p className="text-stone-800 font-bold">All 5 players selected!</p>
            <p className="text-stone-400 text-sm">Ready to simulate your season</p>
          </motion.div>
        </div>
      )}

      {/* ── Bottom bar: 5 position slots + simulate button ── */}
      <div className="shrink-0 border-t border-stone-200 px-4 pt-3 pb-5 bg-[#FBF8F1]">
        {/* Slot circles */}
        <div className="flex items-start justify-around mb-4">
          {POSITIONS.map((pos, i) => (
            <SlotCircle
              key={pos}
              pos={pos}
              player={selectedPlayers[i] ?? null}
              isActive={currentSlotIndex === i && !isComplete}
              onClick={() => {
                if (selectedPlayers[i]) {
                  deselectPlayer(i);
                } else {
                  setCurrentSlot(i);
                  setSearch("");
                  setPosFilter("all");
                }
              }}
            />
          ))}
        </div>

        {/* Simulate / progress button */}
        <motion.button
          whileHover={{ scale: isComplete ? 1.02 : 1 }}
          whileTap={{ scale: isComplete ? 0.97 : 1 }}
          onClick={handleFinish}
          disabled={!isComplete}
          className={`w-full py-3.5 rounded-2xl font-black text-base transition-all duration-300 ${
            isComplete
              ? "text-white shadow-blue"
              : "bg-stone-200 text-stone-400 cursor-not-allowed"
          }`}
          style={isComplete ? { background: "linear-gradient(100deg, #1D428A, #15336e)" } : undefined}
        >
          {isComplete
            ? "🏆 Simulate Season →"
            : `${filledCount}/5 — Pick ${POSITIONS[currentSlotIndex]}`}
        </motion.button>
      </div>
    </div>
  );
}

import { motion } from "framer-motion";
import type { Player } from "@/types";

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
  selected?: boolean;
  compact?: boolean;
}

const POSITION_COLORS: Record<string, string> = {
  PG: "bg-blue-500/20 text-blue-300",
  SG: "bg-purple-500/20 text-purple-300",
  SF: "bg-green-500/20 text-green-300",
  PF: "bg-orange-500/20 text-orange-300",
  C: "bg-red-500/20 text-red-300",
};

function OvrRing({ ovr }: { ovr: number }) {
  const color =
    ovr >= 97 ? "#facc15" : ovr >= 90 ? "#22d3ee" : ovr >= 80 ? "#4ade80" : "#9ca3af";
  return (
    <div
      className="flex items-center justify-center w-12 h-12 rounded-full border-2 font-black text-base shrink-0"
      style={{ borderColor: color, color }}
    >
      {ovr}
    </div>
  );
}

export function PlayerCard({ player, onClick, selected, compact }: PlayerCardProps) {
  if (compact) {
    return (
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.97 }}
        className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
          selected
            ? "bg-blue-500/20 border-blue-400/60 glow-blue"
            : "glass glass-hover border-white/8"
        }`}
      >
        <div className="flex items-center gap-3">
          <OvrRing ovr={player.overall} />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm truncate">{player.name}</p>
            <p className="text-xs text-white/50 truncate">{player.team} · {player.decade}</p>
          </div>
          <span className={`position-badge ${POSITION_COLORS[player.position]}`}>
            {player.position}
          </span>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.97 }}
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
        selected
          ? "bg-blue-500/20 border-blue-400/60 glow-blue"
          : "glass glass-hover"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Avatar placeholder */}
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-white/10 flex items-center justify-center text-2xl shrink-0 font-black text-white/30">
          {player.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold text-white text-base leading-tight">{player.name}</p>
              <p className="text-xs text-white/50 mt-0.5">{player.team} · {player.decade}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <OvrRing ovr={player.overall} />
              <span className={`position-badge ${POSITION_COLORS[player.position]}`}>
                {player.position}
              </span>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-x-3 gap-y-1.5">
            {[
              { label: "SCR", value: player.scoring },
              { label: "DEF", value: player.perimeterDefense },
              { label: "SHT", value: player.shooting },
              { label: "PLY", value: player.playmaking },
              { label: "REB", value: player.rebounding },
              { label: "CLU", value: player.clutch },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="text-[10px] text-white/40 w-7 shrink-0">{label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                    style={{ width: `${value}%` }}
                  />
                </div>
                <span className="text-[10px] text-white/60 w-5 text-right">{value}</span>
              </div>
            ))}
          </div>
          {player.archetype.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {player.archetype.slice(0, 2).map((a) => (
                <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-white/8 text-white/50 capitalize">
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}

export function SelectedPlayerSlot({
  player,
  position,
  team,
  decade,
  isActive,
  isSelected,
  onClick,
}: {
  player: Player | null;
  position: string;
  team: string;
  decade: string;
  isActive: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full p-3 rounded-xl border transition-all duration-200 text-left ${
        isActive
          ? "border-blue-400/80 bg-blue-500/10 glow-blue"
          : isSelected
          ? "border-white/20 glass"
          : "border-dashed border-white/15 bg-white/2"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`position-badge ${POSITION_COLORS[position]} shrink-0`}>
          {position}
        </span>
        {player ? (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{player.name}</p>
            <p className="text-xs text-white/40 truncate">OVR {player.overall}</p>
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white/50 truncate">{team}</p>
            <p className="text-xs text-white/30 truncate">{decade}</p>
          </div>
        )}
        {isActive && !player && (
          <span className="text-[10px] bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full shrink-0">
            Pick
          </span>
        )}
        {player && (
          <span className="text-xs font-bold text-white/50">{player.overall}</span>
        )}
      </div>
    </motion.button>
  );
}

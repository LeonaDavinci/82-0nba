import { motion } from "framer-motion";

interface StatBarProps {
  label: string;
  value: number;
  color?: string;
  delay?: number;
}

const COLOR_MAP: Record<string, string> = {
  offense: "from-blue-800 to-blue-500",
  defense: "from-red-700 to-rose-500",
  chemistry: "from-orange-600 to-amber-500",
  spacing: "from-teal-700 to-emerald-500",
  rebounding: "from-indigo-800 to-indigo-500",
  rimprotection: "from-purple-800 to-fuchsia-600",
};

function getRating(value: number): { label: string; color: string } {
  if (value >= 90) return { label: "ELITE", color: "text-orange-600" };
  if (value >= 80) return { label: "GREAT", color: "text-green-700" };
  if (value >= 70) return { label: "GOOD", color: "text-blue-800" };
  if (value >= 60) return { label: "AVG", color: "text-stone-500" };
  return { label: "WEAK", color: "text-red-700" };
}

export function StatBar({ label, value, color, delay = 0 }: StatBarProps) {
  const key = label.toLowerCase().replace(/\s+/g, "");
  const gradient = color ?? COLOR_MAP[key] ?? "from-blue-800 to-blue-500";
  const rating = getRating(value);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${rating.color}`}>{rating.label}</span>
          <span className="text-sm font-bold text-stone-800">{value}</span>
        </div>
      </div>
      <div className="stat-bar">
        <motion.div
          className={`stat-bar-fill bg-gradient-to-r ${gradient}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

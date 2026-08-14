"use client";

import { motion } from "framer-motion";
import {
  getModeLabel,
  MODE_OPTIONS,
  type GameMode,
} from "@/lib/game-modes";
import type { ModeStats } from "@/lib/auth-client";
import { staggerContainer } from "@/lib/motion";
import { StatCard } from "@/components/ui/StatCard";

type ModeSelectorProps = {
  selectedMode: GameMode;
  modeStats: ModeStats;
  onSelectMode: (mode: GameMode) => void;
  onStart: () => void;
};

export function ModeSelector({
  selectedMode,
  modeStats,
  onSelectMode,
  onStart,
}: ModeSelectorProps) {
  return (
    <div className="text-center">
      <div className="mb-6 grid grid-cols-2 gap-3">
        {MODE_OPTIONS.map((option) => {
          const isSelected = selectedMode === option.mode;

          return (
            <button
              key={option.mode}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectMode(option.mode)}
              className={`rounded-xl border px-4 py-4 text-left transition-colors ${
                isSelected
                  ? "border-orange-500/50 bg-orange-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <p className="font-medium text-white">{option.label}</p>
              <p className="mt-1 text-sm text-zinc-400">{option.description}</p>
            </button>
          );
        })}
      </div>

      <motion.dl
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="mb-8 grid grid-cols-2 gap-3"
      >
        <StatCard
          label={`${getModeLabel(selectedMode)} rank`}
          value={modeStats.globalRank ?? "—"}
        />
        <StatCard
          label={`${getModeLabel(selectedMode)} best`}
          value={modeStats.bestScore ?? "—"}
        />
        <StatCard label="Games played" value={modeStats.gamesPlayed} />
        <StatCard
          label="Daily rank"
          value={modeStats.dailyRank ?? "—"}
        />
      </motion.dl>

      <motion.button
        type="button"
        onClick={onStart}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="btn-primary pulse-glow px-8 py-3 text-sm font-medium"
      >
        Start {getModeLabel(selectedMode)}
      </motion.button>
    </div>
  );
}

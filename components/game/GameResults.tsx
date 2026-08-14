"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { springTransition } from "@/lib/motion";

type GameResultsProps = {
  score: number;
  modeLabel?: string;
  previousBest: number | null;
  onPlayAgain: () => void;
};

const confettiColors = [
  "#f97316",
  "#ef4444",
  "#fbbf24",
  "#fb923c",
  "#f87171",
];

function Confetti() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  const pieces = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    angle: (i / 16) * 360,
    color: confettiColors[i % confettiColors.length],
    distance: 60 + (i % 4) * 20,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {pieces.map((piece) => {
        const rad = (piece.angle * Math.PI) / 180;
        const x = Math.cos(rad) * piece.distance;
        const y = Math.sin(rad) * piece.distance;
        return (
          <motion.div
            key={piece.id}
            className="absolute h-2 w-2 rounded-sm"
            style={{ backgroundColor: piece.color }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x, y, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

export function GameResults({
  score,
  modeLabel,
  previousBest,
  onPlayAgain,
}: GameResultsProps) {
  const isNewBest = previousBest === null ? score > 0 : score > previousBest;

  return (
    <div className="relative py-4 text-center">
      <Confetti />
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-2xl font-semibold text-white"
      >
        Time&apos;s up!
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-2 text-zinc-400"
      >
        {modeLabel
          ? `Great effort in ${modeLabel} mode — here's your final score.`
          : "Great effort — here's your final score."}
      </motion.p>
      <motion.p
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...springTransition, delay: 0.35 }}
        className="mt-6 text-7xl font-bold tabular-nums text-gradient"
      >
        {score}
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="mt-3 text-sm font-medium text-orange-400"
      >
        {isNewBest
          ? "New personal best!"
          : `Best: ${previousBest ?? "—"}`}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
      >
        <AnimatedButton onClick={onPlayAgain} pulse>
          Play Again
        </AnimatedButton>
        <AnimatedButton href="/leaderboard" variant="secondary">
          Leaderboard
        </AnimatedButton>
      </motion.div>
    </div>
  );
}

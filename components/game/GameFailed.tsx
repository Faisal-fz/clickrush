"use client";

import { motion } from "framer-motion";

type GameFailedProps = {
  error: string;
  score: number;
  onPlayAgain: () => void;
};

export function GameFailed({ error, score, onPlayAgain }: GameFailedProps) {
  return (
    <div className="py-4 text-center">
      <h2 className="text-2xl font-semibold text-white">
        Couldn&apos;t save your score
      </h2>
      <p className="mt-2 text-sm text-red-400">{error}</p>
      <p className="mt-4 text-zinc-400">
        Your clicks this round were {score}. Try again when you&apos;re ready.
      </p>
      <motion.button
        type="button"
        onClick={onPlayAgain}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="btn-primary mt-8 px-8 py-3 text-sm font-medium"
      >
        Play again
      </motion.button>
    </div>
  );
}

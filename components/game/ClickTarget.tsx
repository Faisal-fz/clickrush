"use client";

import { motion } from "framer-motion";
import { ClickBurst, useClickBursts } from "./ClickBurst";

type ClickTargetProps = {
  score: number;
  disabled: boolean;
  onClick: () => void;
};

export function ClickTarget({ score, disabled, onClick }: ClickTargetProps) {
  const { bursts, addBurst } = useClickBursts();

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (disabled) return;
    addBurst(e);
    onClick();
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm font-medium uppercase tracking-wider text-zinc-400">
        Your score
      </p>
      <motion.p
        key={score}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="text-7xl font-bold tabular-nums text-gradient"
      >
        {score}
      </motion.p>
      <div className="relative">
        {!disabled && (
          <div className="absolute inset-0 -m-4 animate-pulse rounded-full bg-orange-500/20 blur-xl" />
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={handleClick}
          className={`relative flex h-48 w-48 items-center justify-center rounded-full text-xl font-bold text-white transition-all ${
            disabled
              ? "cursor-not-allowed bg-zinc-700 opacity-50 grayscale"
              : "btn-primary cursor-pointer shadow-[0_0_60px_rgba(249,115,22,0.4)] active:scale-95"
          }`}
        >
          <ClickBurst bursts={bursts} />
          CLICK!
        </button>
      </div>
    </div>
  );
}

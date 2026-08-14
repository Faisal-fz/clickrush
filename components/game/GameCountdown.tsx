"use client";

import { motion } from "framer-motion";

type GameCountdownProps = {
  stepLabel: string;
  showStartWait: boolean;
  reduceMotion: boolean | null;
};

export function GameCountdown({
  stepLabel,
  showStartWait,
  reduceMotion,
}: GameCountdownProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <p
        aria-live="assertive"
        className="text-7xl font-bold tabular-nums text-gradient"
      >
        {stepLabel}
      </p>
      {showStartWait && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-2 w-2 rounded-full bg-orange-500"
              animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
              transition={{
                repeat: Infinity,
                duration: 0.6,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

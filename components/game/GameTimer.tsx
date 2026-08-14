"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type GameTimerProps = {
  startedAt: Date;
  duration: number;
  onExpire: () => void;
};

export function GameTimer({ startedAt, duration, onExpire }: GameTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startedAt.getTime()) / 1000;
      const remaining = Math.max(0, Math.ceil(duration - elapsed));
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onExpire();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [startedAt, duration, onExpire]);

  const progress = ((duration - secondsLeft) / duration) * 100;
  const isUrgent = secondsLeft <= 10;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-medium uppercase tracking-wider text-zinc-400">
          Time remaining
        </span>
        <motion.span
          animate={isUrgent ? { scale: [1, 1.15, 1] } : { scale: 1 }}
          transition={
            isUrgent
              ? { repeat: Infinity, duration: 0.6 }
              : { duration: 0.2 }
          }
          className={`text-3xl font-bold tabular-nums ${
            isUrgent ? "text-red-400" : "text-white"
          }`}
        >
          {secondsLeft}s
        </motion.span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <motion.div
          layout
          className={`h-full rounded-full ${
            isUrgent
              ? "bg-gradient-to-r from-red-500 to-red-400"
              : "bg-gradient-to-r from-orange-500 to-red-500"
          }`}
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </div>
  );
}

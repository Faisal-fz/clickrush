"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useState } from "react";

type Burst = {
  id: number;
  x: number;
  y: number;
};

type ClickBurstProps = {
  bursts: Burst[];
};

export function ClickBurst({ bursts }: ClickBurstProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return null;

  return (
    <AnimatePresence>
      {bursts.map((burst) => (
        <motion.span
          key={burst.id}
          className="pointer-events-none absolute rounded-full border-2 border-orange-400/60"
          style={{
            left: burst.x,
            top: burst.y,
            width: 20,
            height: 20,
            marginLeft: -10,
            marginTop: -10,
          }}
          initial={{ scale: 0.5, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      ))}
    </AnimatePresence>
  );
}

let burstId = 0;

export function useClickBursts() {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const reduceMotion = useReducedMotion();

  const addBurst = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (reduceMotion) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = ++burstId;

      setBursts((prev) => {
        const next = [...prev, { id, x, y }];
        return next.slice(-6);
      });

      setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id));
      }, 500);
    },
    [reduceMotion],
  );

  return { bursts, addBurst };
}

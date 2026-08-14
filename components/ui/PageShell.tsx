"use client";

import { motion, useReducedMotion } from "framer-motion";

type PageShellProps = {
  children: React.ReactNode;
  className?: string;
};

const particles = [
  { left: "15%", top: "20%", size: 6, delay: 0 },
  { left: "75%", top: "30%", size: 4, delay: 1 },
  { left: "60%", top: "70%", size: 5, delay: 2 },
  { left: "25%", top: "80%", size: 3, delay: 0.5 },
  { left: "85%", top: "60%", size: 4, delay: 1.5 },
];

export function PageShell({ children, className = "" }: PageShellProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={`relative flex flex-1 flex-col items-center px-4 py-12 ${className}`}
    >
      {!reduceMotion &&
        particles.map((p, i) => (
          <motion.div
            key={i}
            className="pointer-events-none absolute rounded-full bg-orange-500/20"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
            }}
            animate={{ y: [0, -12, 0] }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      <div className="relative z-10 w-full max-w-5xl">{children}</div>
    </div>
  );
}

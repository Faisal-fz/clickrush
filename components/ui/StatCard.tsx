"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";

type StatCardProps = {
  label: string;
  value: string | number;
};

export function StatCard({ label, value }: StatCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="glass-card rounded-xl p-4 text-center"
    >
      <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400">
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-bold tabular-nums text-white">
        {value}
      </dd>
    </motion.div>
  );
}

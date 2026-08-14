"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeInUp}
      className="text-center"
    >
      <h1 className="text-4xl font-bold tracking-tight text-gradient sm:text-5xl">
        {title}
      </h1>
      {subtitle && (
        <motion.p
          variants={fadeInUp}
          className="mt-3 text-lg text-zinc-400"
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}

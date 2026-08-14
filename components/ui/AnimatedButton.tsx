"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type AnimatedButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  pulse?: boolean;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

export function AnimatedButton({
  children,
  href,
  onClick,
  variant = "primary",
  pulse = false,
  className = "",
  type = "button",
  disabled = false,
}: AnimatedButtonProps) {
  const baseClass =
    variant === "primary"
      ? `btn-primary px-8 py-3 text-sm ${pulse ? "pulse-glow" : ""}`
      : "btn-secondary px-8 py-3 text-sm";

  const combined = `${baseClass} inline-block text-center ${className}`;

  if (href) {
    return (
      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
        <Link href={href} className={combined}>
          {children}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={`${combined} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {children}
    </motion.button>
  );
}

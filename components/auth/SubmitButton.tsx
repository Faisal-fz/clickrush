"use client";

import { motion } from "framer-motion";

type SubmitButtonProps = {
  loading: boolean;
  loadingText: string;
  children: React.ReactNode;
};

export function SubmitButton({
  loading,
  loadingText,
  children,
}: SubmitButtonProps) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={loading ? undefined : { scale: 1.02 }}
      whileTap={loading ? undefined : { scale: 0.98 }}
      className="btn-primary flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <motion.span
            className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          />
          {loadingText}
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}

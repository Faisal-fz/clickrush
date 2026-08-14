"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageShell } from "@/components/ui/PageShell";
import { getProfile, type Profile } from "@/lib/auth-client";
import { fadeInUp, staggerContainer } from "@/lib/motion";

export default function HomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const result = await getProfile();
      if (result.ok) {
        setProfile(result.data);
      }
      setLoading(false);
    }

    loadProfile();
  }, []);

  return (
    <PageShell className="justify-center">
      <main className="mx-auto w-full max-w-lg text-center">
        <div className="relative mb-8 flex justify-center">
          <motion.div
            className="absolute h-32 w-32 rounded-full bg-orange-500/10 blur-2xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          />
          <motion.div
            className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-orange-500/30 bg-orange-500/10"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <span className="text-4xl">👆</span>
          </motion.div>
        </div>

        <PageHeader
          title="ClickRush"
          subtitle={
            profile
              ? "Jump in and beat your best score."
              : "Sign in and compete on the leaderboard."
          }
        />

        {loading ? (
          <p className="mt-10 text-sm text-zinc-500">Loading...</p>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center"
          >
            {profile ? (
              <>
                <motion.div variants={fadeInUp}>
                  <AnimatedButton href="/game" pulse>
                    Play Now
                  </AnimatedButton>
                </motion.div>
                <motion.div variants={fadeInUp}>
                  <AnimatedButton href="/leaderboard" variant="secondary">
                    View Leaderboard
                  </AnimatedButton>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div variants={fadeInUp}>
                  <AnimatedButton href="/signin">Sign in</AnimatedButton>
                </motion.div>
                <motion.div variants={fadeInUp}>
                  <AnimatedButton href="/signup" variant="secondary">
                    Sign up
                  </AnimatedButton>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </main>
    </PageShell>
  );
}

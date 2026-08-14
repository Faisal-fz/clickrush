"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Profile } from "@/lib/auth-client";
import { getDurationSeconds, getModeLabel } from "@/lib/game-modes";
import { slideFade } from "@/lib/motion";
import { useGameSession } from "@/hooks/useGameSession";
import { ClickTarget } from "./ClickTarget";
import { GameCountdown } from "./GameCountdown";
import { GameFailed } from "./GameFailed";
import { GameResults } from "./GameResults";
import { GameTimer } from "./GameTimer";
import { ModeSelector } from "./ModeSelector";

type ClickGameProps = {
  profile: Profile;
  onProfileUpdate: (profile: Profile) => void;
};

export function ClickGame({ profile, onProfileUpdate }: ClickGameProps) {
  const session = useGameSession({ profile, onProfileUpdate });

  return (
    <div className="w-full max-w-lg">
      {!session.hideWelcome && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold tracking-tight text-gradient">
            Welcome, {profile.name}!
          </h1>
          <p className="mt-3 text-zinc-400">
            Click as many times as you can in{" "}
            {getDurationSeconds(session.selectedMode)} seconds.
          </p>
        </motion.div>
      )}

      <div
        className={`glass-card p-6 ${session.hideWelcome ? "mt-0" : "mt-8"} ${
          session.isPlaying ? "glass-card-active" : ""
        }`}
      >
        <AnimatePresence mode="wait">
          {session.phase === "idle" && (
            <motion.div
              key="idle"
              variants={slideFade}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <ModeSelector
                selectedMode={session.selectedMode}
                modeStats={session.modeStats}
                onSelectMode={session.setSelectedMode}
                onStart={session.handleStart}
              />
            </motion.div>
          )}

          {session.phase === "countdown" && (
            <motion.div
              key="countdown"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GameCountdown
                stepLabel={session.countdownSteps[session.countdownStep]}
                showStartWait={session.showStartWait}
                reduceMotion={session.reduceMotion}
              />
            </motion.div>
          )}

          {session.isPlaying && session.startedAt && (
            <motion.div
              key="playing"
              variants={slideFade}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              <GameTimer
                startedAt={session.startedAt}
                duration={session.duration}
                onExpire={session.handleExpire}
              />
              <ClickTarget
                score={session.score}
                disabled={session.phase !== "playing"}
                onClick={session.handleClick}
              />
              {session.phase === "finishing" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm text-zinc-400"
                >
                  Saving your score...
                </motion.p>
              )}
            </motion.div>
          )}

          {session.phase === "results" && (
            <motion.div
              key="results"
              variants={slideFade}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <GameResults
                score={session.finalScore}
                modeLabel={getModeLabel(session.activeMode)}
                previousBest={session.previousBest}
                onPlayAgain={session.handlePlayAgain}
              />
            </motion.div>
          )}

          {session.phase === "failed" && (
            <motion.div
              key="failed"
              variants={slideFade}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <GameFailed
                error={session.error}
                score={session.scoreRef.current}
                onPlayAgain={session.handlePlayAgain}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {session.error && session.phase !== "failed" && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center text-sm text-red-400"
        >
          {session.error}
        </motion.p>
      )}
    </div>
  );
}

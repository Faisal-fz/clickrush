"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { finishGame, startGame, type GameMode } from "@/lib/api-client";
import type { Profile } from "@/lib/auth-client";
import { getDurationSeconds, getModeLabel } from "@/lib/game-modes";
import { slideFade, staggerContainer } from "@/lib/motion";
import { StatCard } from "@/components/ui/StatCard";
import { ClickTarget } from "./ClickTarget";
import { GameResults } from "./GameResults";
import { GameTimer } from "./GameTimer";

type GamePhase = "idle" | "starting" | "playing" | "finishing" | "results";

const modeOptions: { mode: GameMode; description: string }[] = [
  { mode: "classic", description: "60 seconds" },
  { mode: "quick", description: "30 seconds" },
];

type ClickGameProps = {
  profile: Profile;
  onProfileUpdate: (profile: Profile) => void;
};

export function ClickGame({ profile, onProfileUpdate }: ClickGameProps) {
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [selectedMode, setSelectedMode] = useState<GameMode>("classic");
  const [activeMode, setActiveMode] = useState<GameMode>("classic");
  const [duration, setDuration] = useState<number>(getDurationSeconds("classic"));
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [finalScore, setFinalScore] = useState(0);
  const [error, setError] = useState("");
  const [gameId, setGameId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const finishingRef = useRef(false);

  const modeStats = profile.stats[selectedMode];

  const handleFinish = useCallback(async () => {
    if (finishingRef.current || !gameId) return;
    finishingRef.current = true;
    setPhase("finishing");

    const result = await finishGame({ gameId, score: scoreRef.current });

    if (!result.ok) {
      setError(result.error);
      finishingRef.current = false;
      setPhase("idle");
      return;
    }

    setFinalScore(result.data.game.score ?? scoreRef.current);
    setPhase("results");

    const { getProfile } = await import("@/lib/auth-client");
    const profileResult = await getProfile();
    if (profileResult.ok) {
      onProfileUpdate(profileResult.data);
    }
  }, [gameId, onProfileUpdate]);

  const handleExpire = useCallback(() => {
    if (phase === "playing") {
      handleFinish();
    }
  }, [phase, handleFinish]);

  async function handleStart() {
    setError("");
    setScore(0);
    scoreRef.current = 0;
    setFinalScore(0);
    finishingRef.current = false;
    setPhase("starting");

    const result = await startGame(selectedMode);

    if (!result.ok) {
      setError(result.error);
      setPhase("idle");
      return;
    }

    setActiveMode(result.data.mode);
    setDuration(result.data.duration);
    setGameId(result.data.game.id);
    setStartedAt(new Date(result.data.game.startedAt));
    setPhase("playing");
  }

  function handlePlayAgain() {
    setScore(0);
    scoreRef.current = 0;
    setFinalScore(0);
    setGameId(null);
    setStartedAt(null);
    finishingRef.current = false;
    setPhase("idle");
  }

  function handleClick() {
    if (phase === "playing") {
      scoreRef.current += 1;
      setScore(scoreRef.current);
    }
  }

  const isPlaying = phase === "playing" || phase === "finishing";

  return (
    <div className="w-full max-w-lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold tracking-tight text-gradient">
          Welcome, {profile.name}!
        </h1>
        <p className="mt-3 text-zinc-400">
          Click as many times as you can in {getDurationSeconds(selectedMode)}{" "}
          seconds.
        </p>
      </motion.div>

      <div
        className={`glass-card mt-8 p-6 ${isPlaying ? "glass-card-active" : ""}`}
      >
        <AnimatePresence mode="wait">
          {phase === "idle" && (
            <motion.div
              key="idle"
              variants={slideFade}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="text-center"
            >
              <div className="mb-6 grid grid-cols-2 gap-3">
                {modeOptions.map((option) => {
                  const isSelected = selectedMode === option.mode;

                  return (
                    <button
                      key={option.mode}
                      type="button"
                      onClick={() => setSelectedMode(option.mode)}
                      className={`rounded-xl border px-4 py-4 text-left transition-colors ${
                        isSelected
                          ? "border-orange-500/50 bg-orange-500/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <p className="font-medium text-white">
                        {getModeLabel(option.mode)}
                      </p>
                      <p className="mt-1 text-sm text-zinc-400">
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <motion.dl
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="mb-8 grid grid-cols-2 gap-3"
              >
                <StatCard
                  label={`${getModeLabel(selectedMode)} rank`}
                  value={modeStats.globalRank ?? "—"}
                />
                <StatCard
                  label={`${getModeLabel(selectedMode)} best`}
                  value={modeStats.bestScore ?? "—"}
                />
                <StatCard
                  label="Games played"
                  value={modeStats.gamesPlayed}
                />
                <StatCard
                  label="Daily rank"
                  value={modeStats.dailyRank ?? "—"}
                />
              </motion.dl>
              <motion.button
                type="button"
                onClick={handleStart}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary pulse-glow px-8 py-3 text-sm font-medium"
              >
                Start {getModeLabel(selectedMode)}
              </motion.button>
            </motion.div>
          )}

          {phase === "starting" && (
            <motion.div
              key="starting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 py-16"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-2 w-2 rounded-full bg-orange-500"
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.6,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </motion.div>
          )}

          {isPlaying && startedAt && (
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
                startedAt={startedAt}
                duration={duration}
                onExpire={handleExpire}
              />
              <ClickTarget
                score={score}
                disabled={phase !== "playing"}
                onClick={handleClick}
              />
              {phase === "finishing" && (
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

          {phase === "results" && (
            <motion.div
              key="results"
              variants={slideFade}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <GameResults
                score={finalScore}
                modeLabel={getModeLabel(activeMode)}
                onPlayAgain={handlePlayAgain}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { finishGame, startGame, type GameMode } from "@/lib/api-client";
import type { Profile } from "@/lib/auth-client";
import { getDurationSeconds, getModeLabel } from "@/lib/game-modes";
import { slideFade, staggerContainer } from "@/lib/motion";
import { StatCard } from "@/components/ui/StatCard";
import { ClickTarget } from "./ClickTarget";
import { GameResults } from "./GameResults";
import { GameTimer } from "./GameTimer";

type GamePhase =
  | "idle"
  | "countdown"
  | "playing"
  | "finishing"
  | "results"
  | "failed";

const modeOptions: { mode: GameMode; description: string }[] = [
  { mode: "classic", description: "60 seconds" },
  { mode: "quick", description: "30 seconds" },
];

const COUNTDOWN_STEPS = ["3", "2", "1", "GO"] as const;

type ClickGameProps = {
  profile: Profile;
  onProfileUpdate: (profile: Profile) => void;
};

export function ClickGame({ profile, onProfileUpdate }: ClickGameProps) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [selectedMode, setSelectedMode] = useState<GameMode>("classic");
  const [activeMode, setActiveMode] = useState<GameMode>("classic");
  const [duration, setDuration] = useState<number>(getDurationSeconds("classic"));
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [finalScore, setFinalScore] = useState(0);
  const [previousBest, setPreviousBest] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [gameId, setGameId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [countdownStep, setCountdownStep] = useState(0);
  const [countdownDone, setCountdownDone] = useState(false);
  const [awaitingStart, setAwaitingStart] = useState(false);
  const finishingRef = useRef(false);
  const startRequestedRef = useRef(false);

  const modeStats = profile.stats[selectedMode];
  const hideWelcome =
    phase === "countdown" ||
    phase === "playing" ||
    phase === "finishing";

  const handleFinish = useCallback(async () => {
    if (finishingRef.current || !gameId) return;
    finishingRef.current = true;
    setPhase("finishing");

    const result = await finishGame({ gameId, score: scoreRef.current });

    if (!result.ok) {
      setError(result.error);
      finishingRef.current = false;
      setPhase("failed");
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

  const beginServerGame = useCallback(async () => {
    if (startRequestedRef.current) return;
    startRequestedRef.current = true;
    setAwaitingStart(true);

    const result = await startGame(selectedMode);

    if (!result.ok) {
      setError(result.error);
      setAwaitingStart(false);
      startRequestedRef.current = false;
      setPhase("idle");
      return;
    }

    setActiveMode(result.data.mode);
    setDuration(result.data.duration);
    setGameId(result.data.game.id);
    setStartedAt(new Date(result.data.game.startedAt));
    setPreviousBest(profile.stats[result.data.mode].bestScore ?? null);
    setAwaitingStart(false);
  }, [selectedMode, profile.stats]);

  function handleStart() {
    setError("");
    setScore(0);
    scoreRef.current = 0;
    setFinalScore(0);
    finishingRef.current = false;
    startRequestedRef.current = false;
    setGameId(null);
    setStartedAt(null);
    setCountdownDone(false);
    setAwaitingStart(false);
    setPhase("countdown");

    if (reduceMotion) {
      setCountdownStep(COUNTDOWN_STEPS.length - 1);
      setCountdownDone(true);
      void beginServerGame();
      return;
    }

    setCountdownStep(0);
  }

  useEffect(() => {
    if (phase !== "countdown" || reduceMotion) return;

    const interval = window.setInterval(() => {
      setCountdownStep((current) => {
        const next = current + 1;
        if (next >= COUNTDOWN_STEPS.length - 1) {
          window.clearInterval(interval);
          setCountdownDone(true);
          return COUNTDOWN_STEPS.length - 1;
        }
        return next;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [phase, reduceMotion]);

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdownStep === COUNTDOWN_STEPS.length - 1) {
      void beginServerGame();
    }
  }, [phase, countdownStep, beginServerGame]);

  useEffect(() => {
    if (phase !== "countdown" || !countdownDone || !gameId || !startedAt) {
      return;
    }
    setPhase("playing");
  }, [phase, countdownDone, gameId, startedAt]);

  function handlePlayAgain() {
    setScore(0);
    scoreRef.current = 0;
    setFinalScore(0);
    setPreviousBest(null);
    setGameId(null);
    setStartedAt(null);
    finishingRef.current = false;
    startRequestedRef.current = false;
    setCountdownDone(false);
    setAwaitingStart(false);
    setError("");
    setPhase("idle");
  }

  function handleClick() {
    if (phase === "playing") {
      scoreRef.current += 1;
      setScore(scoreRef.current);
    }
  }

  const isPlaying = phase === "playing" || phase === "finishing";
  const showStartWait = phase === "countdown" && countdownDone && awaitingStart;

  return (
    <div className="w-full max-w-lg">
      {!hideWelcome && (
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
      )}

      <div
        className={`glass-card p-6 ${hideWelcome ? "mt-0" : "mt-8"} ${
          isPlaying ? "glass-card-active" : ""
        }`}
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
                      aria-pressed={isSelected}
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

          {phase === "countdown" && (
            <motion.div
              key="countdown"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <p
                aria-live="assertive"
                className="text-7xl font-bold tabular-nums text-gradient"
              >
                {COUNTDOWN_STEPS[countdownStep]}
              </p>
              {showStartWait && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-2 w-2 rounded-full bg-orange-500"
                      animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.6,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
              )}
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
                previousBest={previousBest}
                onPlayAgain={handlePlayAgain}
              />
            </motion.div>
          )}

          {phase === "failed" && (
            <motion.div
              key="failed"
              variants={slideFade}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="py-4 text-center"
            >
              <h2 className="text-2xl font-semibold text-white">
                Couldn&apos;t save your score
              </h2>
              <p className="mt-2 text-sm text-red-400">{error}</p>
              <p className="mt-4 text-zinc-400">
                Your clicks this round were {scoreRef.current}. Try again when
                you&apos;re ready.
              </p>
              <motion.button
                type="button"
                onClick={handlePlayAgain}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary mt-8 px-8 py-3 text-sm font-medium"
              >
                Play again
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && phase !== "failed" && (
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

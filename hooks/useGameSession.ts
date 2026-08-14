"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { finishGame, startGame, type GameMode } from "@/lib/api-client";
import type { Profile } from "@/lib/auth-client";
import { getDurationSeconds } from "@/lib/game-modes";

export type GamePhase =
  | "idle"
  | "countdown"
  | "playing"
  | "finishing"
  | "results"
  | "failed";

const COUNTDOWN_STEPS = ["3", "2", "1", "GO"] as const;

type UseGameSessionOptions = {
  profile: Profile;
  onProfileUpdate: (profile: Profile) => void;
};

export function useGameSession({
  profile,
  onProfileUpdate,
}: UseGameSessionOptions) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [selectedMode, setSelectedMode] = useState<GameMode>("classic");
  const [activeMode, setActiveMode] = useState<GameMode>("classic");
  const [duration, setDuration] = useState<number>(
    getDurationSeconds("classic"),
  );
  const [score, setScore] = useState(0);
  // Ref mirrors score for timer expiry — avoids stale closure when finish fires async
  const scoreRef = useRef(0);
  const [finalScore, setFinalScore] = useState(0);
  const [previousBest, setPreviousBest] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [gameId, setGameId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [countdownStep, setCountdownStep] = useState(0);
  const [countdownDone, setCountdownDone] = useState(false);
  const [awaitingStart, setAwaitingStart] = useState(false);
  // Prevents double-finish when timer and a late click race
  const finishingRef = useRef(false);
  const startRequestedRef = useRef(false);

  const modeStats = profile.stats[selectedMode];
  const hideWelcome =
    phase === "countdown" || phase === "playing" || phase === "finishing";
  const isPlaying = phase === "playing" || phase === "finishing";
  const showStartWait =
    phase === "countdown" && countdownDone && awaitingStart;

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
    setPhase("playing");
  }, [selectedMode, profile.stats]);

  const handleStart = useCallback(() => {
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
  }, [reduceMotion, beginServerGame]);

  const handlePlayAgain = useCallback(() => {
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
  }, []);

  const handleClick = useCallback(() => {
    if (phase === "playing") {
      scoreRef.current += 1;
      setScore(scoreRef.current);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "countdown" || reduceMotion) return;

    let step = 0;
    const interval = window.setInterval(() => {
      step += 1;
      if (step >= COUNTDOWN_STEPS.length - 1) {
        window.clearInterval(interval);
        setCountdownStep(COUNTDOWN_STEPS.length - 1);
        setCountdownDone(true);
        void beginServerGame();
        return;
      }
      setCountdownStep(step);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [phase, reduceMotion, beginServerGame]);

  return {
    phase,
    selectedMode,
    setSelectedMode,
    activeMode,
    duration,
    score,
    scoreRef,
    finalScore,
    previousBest,
    error,
    startedAt,
    countdownStep,
    countdownSteps: COUNTDOWN_STEPS,
    reduceMotion,
    modeStats,
    hideWelcome,
    isPlaying,
    showStartWait,
    handleStart,
    handlePlayAgain,
    handleClick,
    handleExpire,
  };
}

import type { GameMode } from "@/lib/game-modes";
import { parseJsonResponse } from "@/lib/fetch-result";
import type { LeaderboardType } from "@/schema/leaderboard.schema";
import type { FinishGameSchema } from "@/schema/game.schema";

type StartGameResponse = {
  message: string;
  game: {
    id: string;
    startedAt: string;
    status: string;
    mode: "CLASSIC" | "QUICK";
  };
  mode: GameMode;
  duration: number;
};

type FinishGameResponse = {
  message: string;
  game: {
    id: string;
    startedAt: string;
    endedAt: string;
    status: string;
    score: number;
    mode: "CLASSIC" | "QUICK";
  };
};

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  user: { id: string; name: string } | undefined;
  score: number | null;
};

type LeaderboardResponse = {
  type: LeaderboardType;
  mode: GameMode;
  data: LeaderboardEntry[];
};

export type GameHistoryEntry = {
  id: string;
  score: number | null;
  startedAt: string;
  endedAt: string | null;
  mode: "CLASSIC" | "QUICK";
};

type GameHistoryResponse = {
  games: GameHistoryEntry[];
};

export async function startGame(mode: GameMode) {
  const response = await fetch("/api/game/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ mode }),
  });

  return parseJsonResponse<StartGameResponse>(response);
}

export async function finishGame(data: FinishGameSchema) {
  const response = await fetch("/api/game/finish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return parseJsonResponse<FinishGameResponse>(response);
}

export async function getLeaderboard(
  type: LeaderboardType = "global",
  mode: GameMode = "classic",
) {
  const response = await fetch(
    `/api/leaderboard?type=${type}&mode=${mode}`,
  );

  return parseJsonResponse<LeaderboardResponse>(response);
}

export async function getGameHistory() {
  const response = await fetch("/api/profile/games", {
    credentials: "include",
  });

  return parseJsonResponse<GameHistoryResponse>(response);
}

export async function signOut() {
  const response = await fetch("/api/auth/signout", {
    method: "POST",
    credentials: "include",
  });

  return parseJsonResponse<{ message: string }>(response);
}

export type { GameMode };

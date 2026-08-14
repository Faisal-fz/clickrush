import type { GameMode } from "@/lib/game-modes";
import type { LeaderboardType } from "@/schema/leaderboard.schema";
import type { FinishGameSchema } from "@/schema/game.schema";

type FieldErrors = Record<string, string[]>;

type ApiSuccess<T> = { ok: true; data: T };
type ApiFailure = { ok: false; error: string; fieldErrors?: FieldErrors };

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

type ApiErrorBody = {
  error?: string;
  issues?: FieldErrors;
};

async function parseResponse<T>(response: Response): Promise<ApiResult<T>> {
  const body = (await response.json().catch(() => ({}))) as ApiErrorBody;

  if (!response.ok) {
    return {
      ok: false,
      error: body.error ?? "Something went wrong",
      fieldErrors: body.issues,
    };
  }

  return { ok: true, data: body as T };
}

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

export async function startGame(
  mode: GameMode,
): Promise<ApiResult<StartGameResponse>> {
  const response = await fetch("/api/game/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ mode }),
  });

  return parseResponse(response);
}

export async function finishGame(
  data: FinishGameSchema,
): Promise<ApiResult<FinishGameResponse>> {
  const response = await fetch("/api/game/finish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return parseResponse(response);
}

export async function getLeaderboard(
  type: LeaderboardType = "global",
  mode: GameMode = "classic",
): Promise<ApiResult<LeaderboardResponse>> {
  const response = await fetch(
    `/api/leaderboard?type=${type}&mode=${mode}`,
  );

  return parseResponse(response);
}

export async function getGameHistory(): Promise<
  ApiResult<GameHistoryResponse>
> {
  const response = await fetch("/api/profile/games", {
    credentials: "include",
  });

  return parseResponse(response);
}

export async function signOut(): Promise<
  ApiResult<{ message: string }>
> {
  const response = await fetch("/api/auth/signout", {
    method: "POST",
    credentials: "include",
  });

  return parseResponse(response);
}

export type { GameMode };

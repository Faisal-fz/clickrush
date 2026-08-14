import { parseJsonResponse } from "@/lib/fetch-result";
import type { LoginSchema, SignupSchema } from "@/schema/auth.schema";

type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export async function signUp(data: SignupSchema) {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return parseJsonResponse<{ message: string; user: AuthUser }>(response);
}

export async function signIn(data: LoginSchema) {
  const response = await fetch("/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return parseJsonResponse<{ message: string; user: AuthUser }>(response);
}

export type ModeStats = {
  globalRank: number | null;
  dailyRank: number | null;
  weeklyRank: number | null;
  bestScore: number | null;
  gamesPlayed: number;
};

export type Profile = {
  id: string;
  name: string;
  email: string;
  totalGamesPlayed: number;
  stats: {
    classic: ModeStats;
    quick: ModeStats;
  };
};

export async function getProfile() {
  const response = await fetch("/api/profile", {
    credentials: "include",
  });

  return parseJsonResponse<Profile>(response);
}

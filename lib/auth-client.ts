import type { LoginSchema, SignupSchema } from "@/schema/auth.schema";

type FieldErrors = Record<string, string[]>;

type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type AuthSuccess<T> = { ok: true; data: T };
type AuthFailure = { ok: false; error: string; fieldErrors?: FieldErrors };

type AuthResult<T> = AuthSuccess<T> | AuthFailure;

type ApiErrorBody = {
  error?: string;
  issues?: FieldErrors;
};

async function parseAuthResponse<T>(
  response: Response,
): Promise<AuthResult<T>> {
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

export async function signUp(
  data: SignupSchema,
): Promise<AuthResult<{ message: string; user: AuthUser }>> {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return parseAuthResponse(response);
}

export async function signIn(
  data: LoginSchema,
): Promise<AuthResult<{ message: string; user: AuthUser }>> {
  const response = await fetch("/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return parseAuthResponse(response);
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

export async function getProfile(): Promise<AuthResult<Profile>> {
  const response = await fetch("/api/profile", {
    credentials: "include",
  });

  return parseAuthResponse(response);
}

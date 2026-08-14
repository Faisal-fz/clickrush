/**
 * Shared helpers for Next.js API route handlers: auth header extraction,
 * consistent JSON error responses, and service-layer error mapping.
 */
import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";
import type { FieldErrors } from "@/lib/fetch-result";

export function getAuthenticatedUserId(request: Request): string | null {
  return request.headers.get("x-user-id");
}

export function jsonError(
  message: string,
  status: number,
  issues?: FieldErrors,
) {
  return NextResponse.json(
    { error: message, ...(issues ? { issues } : {}) },
    { status },
  );
}

export function unauthorizedResponse() {
  return jsonError("Unauthorized", 401);
}

export function handleServiceError(error: unknown, logLabel?: string) {
  if (error instanceof AppError) {
    return jsonError(error.message, error.statusCode);
  }

  if (logLabel) {
    console.error(logLabel, error);
  }

  return jsonError("Internal server error", 500);
}

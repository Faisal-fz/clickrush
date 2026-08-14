import { NextResponse } from "next/server";
import { getDurationSeconds } from "@/lib/game-modes";
import {
  getAuthenticatedUserId,
  handleServiceError,
  jsonError,
  unauthorizedResponse,
} from "@/lib/api-route";
import { startGameSchema } from "@/schema/game.schema";
import { startGame } from "@/services/game.service";

export async function POST(request: Request) {
  const userId = getAuthenticatedUserId(request);
  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json().catch(() => ({}));
    const validated = startGameSchema.safeParse(body);

    if (!validated.success) {
      return jsonError(
        "Invalid request",
        400,
        validated.error.flatten().fieldErrors,
      );
    }

    const { mode } = validated.data;
    const game = await startGame(userId, mode);

    return NextResponse.json(
      {
        message: "Game started successfully",
        game,
        mode,
        duration: getDurationSeconds(mode),
      },
      { status: 201 },
    );
  } catch (error) {
    return handleServiceError(error, "Start game failed:");
  }
}

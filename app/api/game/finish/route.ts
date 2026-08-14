import { NextResponse } from "next/server";
import {
  getAuthenticatedUserId,
  handleServiceError,
  jsonError,
  unauthorizedResponse,
} from "@/lib/api-route";
import { finishGameSchema } from "@/schema/game.schema";
import { finishGame } from "@/services/game.service";

export async function POST(request: Request) {
  const userId = getAuthenticatedUserId(request);
  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const validated = finishGameSchema.safeParse(body);

    if (!validated.success) {
      return jsonError(
        "Validation failed",
        400,
        validated.error.flatten().fieldErrors,
      );
    }

    const game = await finishGame(userId, validated.data);
    return NextResponse.json(
      {
        message: "Game finished",
        game,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleServiceError(error, "Finish game failed:");
  }
}

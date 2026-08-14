import { NextResponse } from "next/server";
import { getDurationSeconds } from "@/lib/game-modes";
import { AppError } from "@/lib/errors";
import { startGameSchema } from "@/schema/game.schema";
import { startGame } from "@/services/game.service";

export async function POST(request: Request) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const validated = startGameSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          issues: validated.error.flatten().fieldErrors,
        },
        { status: 400 },
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
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    console.error("Start game failed:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

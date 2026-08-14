import { AppError } from "@/lib/errors";
import { finishGameSchema } from "@/schema/game.schema";
import { finishGame } from "@/services/game.service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = finishGameSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: validated.error.flatten().fieldErrors,
        },
        { status: 400 },
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
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import {
  leaderboardQuerySchema,
} from "@/schema/leaderboard.schema";
import {
  getLeaderboard,
} from "@/services/leaderboard.service";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const type = url.searchParams.get("type");
    const mode = url.searchParams.get("mode");

    const validated = leaderboardQuerySchema.safeParse({
      type: type ?? undefined,
      mode: mode ?? undefined,
    });

    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Invalid leaderboard query",
        },
        { status: 400 },
      );
    }

    const leaderboard = await getLeaderboard(
      validated.data.type,
      validated.data.mode,
    );

    return NextResponse.json(
      {
        type: validated.data.type,
        mode: validated.data.mode,
        data: leaderboard,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "Leaderboard fetch failed:",
      error,
    );

    return NextResponse.json(
      {
        error: "Failed to fetch leaderboard",
      },
      { status: 500 },
    );
  }
}

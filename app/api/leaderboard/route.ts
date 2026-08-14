import { NextResponse } from "next/server";
import { handleServiceError, jsonError } from "@/lib/api-route";
import { leaderboardQuerySchema } from "@/schema/leaderboard.schema";
import { getLeaderboard } from "@/services/leaderboard.service";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const validated = leaderboardQuerySchema.safeParse({
      type: url.searchParams.get("type") ?? undefined,
      mode: url.searchParams.get("mode") ?? undefined,
    });

    if (!validated.success) {
      return jsonError("Invalid leaderboard query", 400);
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
    return handleServiceError(error, "Leaderboard fetch failed:");
  }
}

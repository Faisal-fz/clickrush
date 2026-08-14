import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

const GAME_HISTORY_LIMIT = 20;

export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const games = await prisma.game.findMany({
    where: {
      userId,
      status: "COMPLETED",
    },
    select: {
      id: true,
      score: true,
      startedAt: true,
      endedAt: true,
      mode: true,
    },
    orderBy: {
      startedAt: "desc",
    },
    take: GAME_HISTORY_LIMIT,
  });

  return NextResponse.json({ games });
}

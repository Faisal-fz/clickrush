import { prisma } from "@/lib/db";
import { getModeStats } from "@/services/leaderboard.service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const [totalGamesPlayed, classicStats, quickStats] = await Promise.all([
    prisma.game.count({
      where: {
        userId,
        status: "COMPLETED",
      },
    }),
    getModeStats(userId, "classic"),
    getModeStats(userId, "quick"),
  ]);

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    totalGamesPlayed,
    stats: {
      classic: classicStats,
      quick: quickStats,
    },
  });
}

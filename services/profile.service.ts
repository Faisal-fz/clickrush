import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { getModeStats } from "@/services/leaderboard.service";

const DEFAULT_GAME_HISTORY_LIMIT = 20;

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
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

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    totalGamesPlayed,
    stats: {
      classic: classicStats,
      quick: quickStats,
    },
  };
}

export async function getGameHistory(
  userId: string,
  limit = DEFAULT_GAME_HISTORY_LIMIT,
) {
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
    take: limit,
  });

  return games;
}

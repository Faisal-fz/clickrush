import { prisma } from "@/lib/db";
import { toPrismaMode, type GameMode } from "@/lib/game-modes";
import { LeaderboardType } from "@/schema/leaderboard.schema";

function getDateRange(type: LeaderboardType) {
  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (type === "daily") {
    startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
  }

  if (type === "weekly") {
    startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const currentDay = startDate.getDay();
    const daySinceMonday = currentDay === 0 ? 6 : currentDay - 1;

    startDate.setDate(startDate.getDate() - daySinceMonday);

    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
  }

  const dateFilter =
    startDate && endDate
      ? {
          startedAt: {
            gte: startDate,
            lte: endDate,
          },
        }
      : {};

  return dateFilter;
}

export const getLeaderboard = async (type: LeaderboardType, mode: GameMode) => {
  const dateFilter = getDateRange(type);
  const prismaMode = toPrismaMode(mode);

  const groupUsers = await prisma.game.groupBy({
    by: ["userId"],
    where: {
      status: "COMPLETED",
      mode: prismaMode,
      score: {
        not: null,
      },
      ...dateFilter,
    },
    _max: {
      score: true,
    },
    orderBy: {
      _max: {
        score: "desc",
      },
    },
    take: 10,
  });

  if (groupUsers.length === 0) return [];

  const users = groupUsers.map((group) => group.userId);
  const usersData = await prisma.user.findMany({
    where: {
      id: {
        in: users,
      },
    },
    select: {
      id: true,
      name: true,
    },
  });
  const userMap = new Map(usersData.map((user) => [user.id, user]));

  const leaderboard = groupUsers.map((group, index) => ({
    rank: index + 1,
    userId: group.userId,
    user: userMap.get(group.userId),
    score: group._max.score,
  }));
  return leaderboard;
};

async function getBestScoreForPeriod(
  userId: string,
  type: LeaderboardType,
  mode: GameMode,
) {
  const dateFilter = getDateRange(type);
  const prismaMode = toPrismaMode(mode);

  const result = await prisma.game.aggregate({
    where: {
      userId,
      status: "COMPLETED",
      mode: prismaMode,
      score: {
        not: null,
      },
      ...dateFilter,
    },
    _max: {
      score: true,
    },
  });

  return result._max.score;
}

export const getRankForPeriod = async (
  userId: string,
  type: LeaderboardType,
  mode: GameMode,
) => {
  const bestScore = await getBestScoreForPeriod(userId, type, mode);

  if (bestScore === null) {
    return null;
  }

  const dateFilter = getDateRange(type);
  const prismaMode = toPrismaMode(mode);

  const usersAboveMe = await prisma.game.groupBy({
    by: ["userId"],
    where: {
      status: "COMPLETED",
      mode: prismaMode,
      score: {
        gt: bestScore,
      },
      ...dateFilter,
    },
  });

  return usersAboveMe.length + 1;
};

export const getGlobalRank = async (userId: string, mode: GameMode) => {
  return getRankForPeriod(userId, "global", mode);
};

export const getBestScore = async (userId: string, mode: GameMode) => {
  const prismaMode = toPrismaMode(mode);

  const result = await prisma.game.aggregate({
    where: {
      userId,
      status: "COMPLETED",
      mode: prismaMode,
      score: {
        not: null,
      },
    },
    _max: {
      score: true,
    },
  });

  return result._max.score;
};

export async function getModeStats(userId: string, mode: GameMode) {
  const prismaMode = toPrismaMode(mode);

  const [gamesPlayed, globalRank, dailyRank, weeklyRank, bestScore] =
    await Promise.all([
      prisma.game.count({
        where: {
          userId,
          status: "COMPLETED",
          mode: prismaMode,
        },
      }),
      getGlobalRank(userId, mode),
      getRankForPeriod(userId, "daily", mode),
      getRankForPeriod(userId, "weekly", mode),
      getBestScore(userId, mode),
    ]);

  return {
    globalRank,
    dailyRank,
    weeklyRank,
    bestScore,
    gamesPlayed,
  };
}

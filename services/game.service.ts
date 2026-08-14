import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import {
  getDurationMs,
  getMaxScore,
  toPrismaMode,
  type GameMode,
} from "@/lib/game-modes";
import { FinishGameSchema } from "@/schema/game.schema";

// Auto-complete RUNNING games whose timer has elapsed so users can start a new round.
async function expireStaleGames(userId: string) {
  const runningGames = await prisma.game.findMany({
    where: {
      userId,
      status: "RUNNING",
    },
  });

  const now = Date.now();

  await Promise.all(
    runningGames
      .filter((game) => {
        const durationMs = getDurationMs(game.mode);
        return game.startedAt.getTime() + durationMs < now;
      })
      .map((game) =>
        prisma.game.update({
          where: { id: game.id },
          data: {
            status: "COMPLETED",
            score: 0,
            endedAt: new Date(
              game.startedAt.getTime() + getDurationMs(game.mode),
            ),
          },
        }),
      ),
  );
}

export const startGame = async (userId: string, mode: GameMode) => {
  await expireStaleGames(userId);

  const runningGame = await prisma.game.findFirst({
    where: {
      userId,
      status: "RUNNING",
    },
  });
  if (runningGame) {
    throw new AppError("Game already running", 400);
  }

  const prismaMode = toPrismaMode(mode);

  const game = await prisma.game.create({
    data: {
      userId,
      mode: prismaMode,
    },
    select: {
      id: true,
      startedAt: true,
      status: true,
      mode: true,
    },
  });
  return game;
};

export const finishGame = async (userId: string, data: FinishGameSchema) => {
  const { gameId, score } = data;

  const game = await prisma.game.findUnique({
    where: {
      id: gameId,
    },
  });
  if (!game) {
    throw new AppError("Game not found", 404);
  }

  const maxScore = getMaxScore(game.mode);
  if (score > maxScore) {
    throw new AppError("Score exceeds maximum possible value", 400);
  }

  if (game.userId !== userId) {
    throw new AppError("You are not allowed to finish this game", 403);
  }
  if (game.status !== "RUNNING") {
    throw new AppError("Game has already been completed", 409);
  }

  const durationMs = getDurationMs(game.mode);
  const now = new Date();
  const elapsedMs = now.getTime() - game.startedAt.getTime();
  const maximumEndTime = new Date(game.startedAt.getTime() + durationMs);
  const endedAt = elapsedMs >= durationMs ? maximumEndTime : now;

  const completeGame = await prisma.game.update({
    where: {
      id: gameId,
    },
    data: {
      endedAt,
      score,
      status: "COMPLETED",
    },
    select: {
      id: true,
      startedAt: true,
      endedAt: true,
      status: true,
      score: true,
      mode: true,
    },
  });
  return completeGame;
};

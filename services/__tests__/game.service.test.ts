import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/errors";

const prismaMock = vi.hoisted(() => ({
  game: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    groupBy: vi.fn(),
    aggregate: vi.fn(),
    count: vi.fn(),
  },
}));

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

import { finishGame, startGame } from "@/services/game.service";

describe("game.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.game.findMany.mockResolvedValue([]);
  });

  describe("startGame", () => {
    it("creates a game when none is running", async () => {
      prismaMock.game.findFirst.mockResolvedValue(null);
      prismaMock.game.create.mockResolvedValue({
        id: "game-1",
        startedAt: new Date("2026-01-01T00:00:00Z"),
        status: "RUNNING",
        mode: "CLASSIC",
      });

      const game = await startGame("user-1", "classic");

      expect(game.id).toBe("game-1");
      expect(prismaMock.game.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            userId: "user-1",
            mode: "CLASSIC",
          },
        }),
      );
    });

    it("rejects when a game is already running", async () => {
      prismaMock.game.findFirst.mockResolvedValue({
        id: "running-game",
        status: "RUNNING",
      });

      await expect(startGame("user-1", "classic")).rejects.toThrow(AppError);
      await expect(startGame("user-1", "classic")).rejects.toMatchObject({
        message: "Game already running",
        statusCode: 400,
      });
    });

    it("expires stale running games before starting", async () => {
      const staleStart = new Date(Date.now() - 120_000);
      prismaMock.game.findMany.mockResolvedValue([
        {
          id: "stale-game",
          startedAt: staleStart,
          mode: "CLASSIC",
        },
      ]);
      prismaMock.game.findFirst.mockResolvedValue(null);
      prismaMock.game.update.mockResolvedValue({});
      prismaMock.game.create.mockResolvedValue({
        id: "game-new",
        startedAt: new Date(),
        status: "RUNNING",
        mode: "QUICK",
      });

      await startGame("user-1", "quick");

      expect(prismaMock.game.update).toHaveBeenCalled();
      expect(prismaMock.game.create).toHaveBeenCalled();
    });
  });

  describe("finishGame", () => {
    const runningGame = {
      id: "game-1",
      userId: "user-1",
      status: "RUNNING",
      mode: "QUICK",
      startedAt: new Date(Date.now() - 5_000),
    };

    it("completes a valid game", async () => {
      prismaMock.game.findUnique.mockResolvedValue(runningGame);
      prismaMock.game.update.mockResolvedValue({
        id: "game-1",
        startedAt: runningGame.startedAt,
        endedAt: new Date(),
        status: "COMPLETED",
        score: 100,
        mode: "QUICK",
      });

      const result = await finishGame("user-1", {
        gameId: "game-1",
        score: 100,
      });

      expect(result.score).toBe(100);
      expect(result.status).toBe("COMPLETED");
    });

    it("rejects score above mode maximum", async () => {
      prismaMock.game.findUnique.mockResolvedValue(runningGame);

      await expect(
        finishGame("user-1", { gameId: "game-1", score: 500 }),
      ).rejects.toMatchObject({
        message: "Score exceeds maximum possible value",
        statusCode: 400,
      });
    });

    it("rejects finishing another user's game", async () => {
      prismaMock.game.findUnique.mockResolvedValue(runningGame);

      await expect(
        finishGame("user-2", { gameId: "game-1", score: 10 }),
      ).rejects.toMatchObject({
        message: "You are not allowed to finish this game",
        statusCode: 403,
      });
    });

    it("rejects already completed games", async () => {
      prismaMock.game.findUnique.mockResolvedValue({
        ...runningGame,
        status: "COMPLETED",
      });

      await expect(
        finishGame("user-1", { gameId: "game-1", score: 10 }),
      ).rejects.toMatchObject({
        message: "Game has already been completed",
        statusCode: 409,
      });
    });

    it("returns 404 when game is missing", async () => {
      prismaMock.game.findUnique.mockResolvedValue(null);

      await expect(
        finishGame("user-1", { gameId: "missing", score: 10 }),
      ).rejects.toMatchObject({
        message: "Game not found",
        statusCode: 404,
      });
    });
  });
});

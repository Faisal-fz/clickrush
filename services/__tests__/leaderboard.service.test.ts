import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  game: {
    groupBy: vi.fn(),
    aggregate: vi.fn(),
    count: vi.fn(),
  },
  user: {
    findMany: vi.fn(),
  },
}));

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

import {
  getLeaderboard,
  getRankForPeriod,
} from "@/services/leaderboard.service";

describe("leaderboard.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getLeaderboard", () => {
    it("returns empty list when no scores exist", async () => {
      prismaMock.game.groupBy.mockResolvedValue([]);

      const result = await getLeaderboard("global", "classic");

      expect(result).toEqual([]);
      expect(prismaMock.user.findMany).not.toHaveBeenCalled();
    });

    it("maps grouped scores to ranked entries", async () => {
      prismaMock.game.groupBy.mockResolvedValue([
        { userId: "user-1", _max: { score: 120 } },
        { userId: "user-2", _max: { score: 90 } },
      ]);
      prismaMock.user.findMany.mockResolvedValue([
        { id: "user-1", name: "Alice" },
        { id: "user-2", name: "Bob" },
      ]);

      const result = await getLeaderboard("global", "quick");

      expect(result).toEqual([
        {
          rank: 1,
          userId: "user-1",
          user: { id: "user-1", name: "Alice" },
          score: 120,
        },
        {
          rank: 2,
          userId: "user-2",
          user: { id: "user-2", name: "Bob" },
          score: 90,
        },
      ]);
    });
  });

  describe("getRankForPeriod", () => {
    it("returns null when user has no score in period", async () => {
      prismaMock.game.aggregate.mockResolvedValue({ _max: { score: null } });

      const rank = await getRankForPeriod("user-1", "daily", "classic");

      expect(rank).toBeNull();
    });

    it("returns rank based on users with higher scores", async () => {
      prismaMock.game.aggregate.mockResolvedValue({ _max: { score: 50 } });
      prismaMock.game.groupBy.mockResolvedValue([
        { userId: "user-2" },
        { userId: "user-3" },
      ]);

      const rank = await getRankForPeriod("user-1", "weekly", "classic");

      expect(rank).toBe(3);
    });
  });
});

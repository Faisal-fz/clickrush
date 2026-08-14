import { describe, expect, it } from "vitest";
import { finishGameSchema, startGameSchema } from "@/schema/game.schema";

describe("startGameSchema", () => {
  it("defaults mode to classic", () => {
    const result = startGameSchema.safeParse({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mode).toBe("classic");
    }
  });

  it("accepts quick mode", () => {
    const result = startGameSchema.safeParse({ mode: "quick" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mode).toBe("quick");
    }
  });

  it("rejects invalid mode", () => {
    const result = startGameSchema.safeParse({ mode: "turbo" });

    expect(result.success).toBe(false);
  });
});

describe("finishGameSchema", () => {
  it("accepts valid finish payload", () => {
    const result = finishGameSchema.safeParse({
      gameId: "game-1",
      score: 42,
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing game id", () => {
    const result = finishGameSchema.safeParse({
      gameId: "",
      score: 10,
    });

    expect(result.success).toBe(false);
  });

  it("rejects negative score", () => {
    const result = finishGameSchema.safeParse({
      gameId: "game-1",
      score: -1,
    });

    expect(result.success).toBe(false);
  });

  it("rejects non-integer score", () => {
    const result = finishGameSchema.safeParse({
      gameId: "game-1",
      score: 1.5,
    });

    expect(result.success).toBe(false);
  });

  it("allows scores above quick mode max (service enforces per-mode cap)", () => {
    const result = finishGameSchema.safeParse({
      gameId: "game-1",
      score: 500,
    });

    expect(result.success).toBe(true);
  });
});

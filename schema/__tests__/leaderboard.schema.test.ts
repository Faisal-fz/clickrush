import { describe, expect, it } from "vitest";
import { leaderboardQuerySchema } from "@/schema/leaderboard.schema";

describe("leaderboardQuerySchema", () => {
  it("defaults type and mode", () => {
    const result = leaderboardQuerySchema.safeParse({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("global");
      expect(result.data.mode).toBe("classic");
    }
  });

  it("accepts daily quick leaderboard query", () => {
    const result = leaderboardQuerySchema.safeParse({
      type: "daily",
      mode: "quick",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("daily");
      expect(result.data.mode).toBe("quick");
    }
  });

  it("rejects invalid type", () => {
    const result = leaderboardQuerySchema.safeParse({ type: "monthly" });

    expect(result.success).toBe(false);
  });

  it("rejects invalid mode", () => {
    const result = leaderboardQuerySchema.safeParse({ mode: "blitz" });

    expect(result.success).toBe(false);
  });
});

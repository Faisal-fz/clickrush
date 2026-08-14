import { z } from "zod";
import { gameModeSchema } from "@/lib/game-modes";

export const leaderboardQuerySchema = z.object({
  type: z.enum(["global", "daily", "weekly"]).default("global"),
  mode: gameModeSchema.default("classic"),
});

export type LeaderboardType = z.infer<
  typeof leaderboardQuerySchema
>["type"];

export type LeaderboardMode = z.infer<
  typeof leaderboardQuerySchema
>["mode"];
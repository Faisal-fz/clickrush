import { z } from "zod";
import { gameModeSchema } from "@/lib/game-modes";

export const startGameSchema = z.object({
  mode: gameModeSchema.default("classic"),
});

export type StartGameSchema = z.infer<typeof startGameSchema>;

export const finishGameSchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
  score: z
    .number()
    .int("Score must be an integer")
    .min(0, "Score cannot be negative"),
});

export type FinishGameSchema = z.infer<typeof finishGameSchema>;
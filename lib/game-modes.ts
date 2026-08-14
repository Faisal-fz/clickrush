import { z } from "zod";

export const gameModeSchema = z.enum(["classic", "quick"]);
export type GameMode = z.infer<typeof gameModeSchema>;

export type PrismaGameMode = "CLASSIC" | "QUICK";

const MODE_CONFIG = {
  CLASSIC: {
    durationSeconds: 60,
    maxScore: 900,
    label: "Classic",
  },
  QUICK: {
    durationSeconds: 30,
    maxScore: 450,
    label: "Quick",
  },
} as const satisfies Record<
  PrismaGameMode,
  { durationSeconds: number; maxScore: number; label: string }
>;

export function toPrismaMode(mode: GameMode): PrismaGameMode {
  return mode === "classic" ? "CLASSIC" : "QUICK";
}

export function fromPrismaMode(mode: PrismaGameMode): GameMode {
  return mode === "CLASSIC" ? "classic" : "quick";
}

export function getModeConfig(mode: GameMode | PrismaGameMode) {
  const prismaMode =
    mode === "classic" || mode === "quick" ? toPrismaMode(mode) : mode;

  return MODE_CONFIG[prismaMode];
}

export function getDurationSeconds(mode: GameMode | PrismaGameMode) {
  return getModeConfig(mode).durationSeconds;
}

export function getDurationMs(mode: GameMode | PrismaGameMode) {
  return getDurationSeconds(mode) * 1000;
}

export function getMaxScore(mode: GameMode | PrismaGameMode) {
  return getModeConfig(mode).maxScore;
}

export function getModeLabel(mode: GameMode | PrismaGameMode) {
  return getModeConfig(mode).label;
}

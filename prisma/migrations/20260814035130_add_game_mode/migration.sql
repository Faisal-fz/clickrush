-- CreateEnum
CREATE TYPE "GameMode" AS ENUM ('CLASSIC', 'QUICK');

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "mode" "GameMode" NOT NULL DEFAULT 'CLASSIC';

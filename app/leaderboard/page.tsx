"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getLeaderboard, type LeaderboardEntry } from "@/lib/api-client";
import { getProfile } from "@/lib/auth-client";
import { getModeLabel, MODE_TABS, type GameMode } from "@/lib/game-modes";
import type { LeaderboardType } from "@/schema/leaderboard.schema";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageShell } from "@/components/ui/PageShell";
import { rowStagger, staggerContainer } from "@/lib/motion";

const modeTabs = MODE_TABS;

const tabs: { type: LeaderboardType; label: string }[] = [
  { type: "global", label: "Global" },
  { type: "daily", label: "Daily" },
  { type: "weekly", label: "Weekly" },
];

const rankMedals: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

const rankBorder: Record<number, string> = {
  1: "border-l-yellow-400",
  2: "border-l-zinc-300",
  3: "border-l-amber-600",
};

function SkeletonRows() {
  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-12 animate-pulse rounded-lg bg-white/5"
        />
      ))}
    </div>
  );
}

export default function LeaderboardPage() {
  const [activeType, setActiveType] = useState<LeaderboardType>("global");
  const [activeMode, setActiveMode] = useState<GameMode>("classic");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      const [leaderboardResult, profileResult] = await Promise.all([
        getLeaderboard(activeType, activeMode),
        getProfile(),
      ]);

      if (!leaderboardResult.ok) {
        setError(leaderboardResult.error);
        setLoading(false);
        return;
      }

      setEntries(leaderboardResult.data.data);

      if (profileResult.ok) {
        setCurrentUserId(profileResult.data.id);
      } else {
        setCurrentUserId(null);
      }

      setLoading(false);
    }

    load();
  }, [activeType, activeMode]);

  return (
    <PageShell>
      <PageHeader
        title="Leaderboard"
        subtitle={`Top 10 players in ${getModeLabel(activeMode)} mode.`}
      />

      <div className="relative mx-auto mt-8 flex w-fit justify-center gap-1 rounded-full border border-white/10 bg-black/30 p-1 backdrop-blur-sm">
        {modeTabs.map((tab) => (
            <button
              key={tab.mode}
              type="button"
              aria-pressed={activeMode === tab.mode}
              onClick={() => setActiveMode(tab.mode)}
            className="relative rounded-full px-5 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            {activeMode === tab.mode && (
              <motion.span
                layoutId="leaderboard-mode-tab"
                className="absolute inset-0 rounded-full border border-orange-500/40 bg-gradient-to-r from-orange-500/30 to-red-500/30"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span
              className={`relative z-10 ${
                activeMode === tab.mode ? "text-white" : ""
              }`}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      <div className="relative mx-auto mt-4 flex w-fit justify-center gap-1 rounded-full border border-white/10 bg-black/30 p-1 backdrop-blur-sm">
        {tabs.map((tab) => (
          <button
            key={tab.type}
            type="button"
            onClick={() => setActiveType(tab.type)}
            className="relative rounded-full px-5 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            {activeType === tab.type && (
              <motion.span
                layoutId="leaderboard-tab"
                className="absolute inset-0 rounded-full border border-orange-500/40 bg-gradient-to-r from-orange-500/30 to-red-500/30"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span
              className={`relative z-10 ${
                activeType === tab.type ? "text-white" : ""
              }`}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      <div className="glass-card mx-auto mt-8 max-w-2xl overflow-hidden">
        {loading ? (
          <SkeletonRows />
        ) : error ? (
          <p className="p-8 text-center text-sm text-red-400">{error}</p>
        ) : entries.length === 0 ? (
          <p className="p-8 text-center text-sm text-zinc-500">
            No scores yet. Be the first to play!
          </p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-3 py-4 font-medium text-zinc-400 sm:px-6">Rank</th>
                <th className="px-3 py-4 font-medium text-zinc-400 sm:px-6">Player</th>
                <th className="px-3 py-4 text-right font-medium text-zinc-400 sm:px-6">
                  Score
                </th>
              </tr>
            </thead>
            <motion.tbody
              key={`${activeType}-${activeMode}`}
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {entries.map((entry) => {
                const isCurrentUser = entry.userId === currentUserId;
                const medal = rankMedals[entry.rank];
                const border = rankBorder[entry.rank];

                return (
                  <motion.tr
                    key={entry.userId}
                    variants={rowStagger}
                    className={`border-b border-white/5 last:border-0 ${
                      border ? `border-l-4 ${border}` : ""
                    } ${
                      isCurrentUser
                        ? "bg-orange-500/10 shadow-[inset_0_0_20px_rgba(249,115,22,0.1)]"
                        : ""
                    }`}
                  >
                    <td className="px-3 py-4 font-medium whitespace-nowrap text-white sm:px-6">
                      {medal ? (
                        <span>
                          {medal} #{entry.rank}
                        </span>
                      ) : (
                        `#${entry.rank}`
                      )}
                    </td>
                    <td className="px-3 py-4 text-zinc-300 sm:px-6">
                      {entry.user?.name ?? "Unknown"}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-orange-400">
                          (you)
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-4 text-right font-bold tabular-nums text-gradient sm:px-6">
                      {entry.score}
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
          </div>
        )}
      </div>
    </PageShell>
  );
}

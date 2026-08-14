"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getGameHistory, type GameHistoryEntry } from "@/lib/api-client";
import { getProfile, type Profile } from "@/lib/auth-client";
import { MODE_TABS, fromPrismaMode, getModeLabel, type GameMode } from "@/lib/game-modes";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageShell } from "@/components/ui/PageShell";
import { StatCard } from "@/components/ui/StatCard";
import { fadeInUp, rowStagger, staggerContainer } from "@/lib/motion";

const modeTabs = MODE_TABS;

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString();
}

function formatDuration(startedAt: string, endedAt: string | null) {
  if (!endedAt) return "—";
  const seconds = Math.round(
    (new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000,
  );
  return `${seconds}s`;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [games, setGames] = useState<GameHistoryEntry[]>([]);
  const [selectedMode, setSelectedMode] = useState<GameMode>("classic");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const [profileResult, historyResult] = await Promise.all([
        getProfile(),
        getGameHistory(),
      ]);

      if (!profileResult.ok) {
        router.replace("/signin");
        return;
      }

      setProfile(profileResult.data);

      if (historyResult.ok) {
        setGames(historyResult.data.games);
      } else {
        setError(historyResult.error);
      }

      setLoading(false);
    }

    load();
  }, [router]);

  if (loading || !profile) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-400">Loading...</p>
      </div>
    );
  }

  const modeStats = profile.stats[selectedMode];

  return (
    <PageShell>
      <PageHeader
        title="Profile"
        subtitle="Your account, rankings, and game history."
      />

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="mx-auto mt-8 max-w-2xl space-y-6"
      >
        <motion.div variants={fadeInUp} className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white">Account</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-400">Name</dt>
              <dd className="font-medium text-white">{profile.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-400">Email</dt>
              <dd className="font-medium text-white">{profile.email}</dd>
            </div>
          </dl>
        </motion.div>

        <motion.div variants={fadeInUp} className="glass-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-white">Rankings</h2>
            <div className="flex gap-1 rounded-full border border-white/10 bg-black/30 p-1">
              {modeTabs.map((tab) => (
                <button
                  key={tab.mode}
                  type="button"
                  aria-pressed={selectedMode === tab.mode}
                  onClick={() => setSelectedMode(tab.mode)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    selectedMode === tab.mode
                      ? "bg-orange-500/20 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <motion.dl
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3"
          >
            <StatCard
              label="Global rank"
              value={modeStats.globalRank ?? "—"}
            />
            <StatCard label="Daily rank" value={modeStats.dailyRank ?? "—"} />
            <StatCard
              label="Weekly rank"
              value={modeStats.weeklyRank ?? "—"}
            />
            <StatCard label="Best score" value={modeStats.bestScore ?? "—"} />
            <StatCard label="Games played" value={modeStats.gamesPlayed} />
            <StatCard
              label="Total games"
              value={profile.totalGamesPlayed}
            />
          </motion.dl>
        </motion.div>

        <motion.div variants={fadeInUp} className="glass-card overflow-hidden">
          <div className="border-b border-white/10 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Game History</h2>
          </div>

          {error ? (
            <p className="p-6 text-center text-sm text-red-400">{error}</p>
          ) : games.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 p-10"
            >
              <motion.span
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-4xl"
              >
                🎮
              </motion.span>
              <p className="text-sm text-zinc-500">No games played yet.</p>
            </motion.div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-3 py-4 font-medium text-zinc-400 sm:px-6">Date</th>
                  <th className="px-3 py-4 font-medium text-zinc-400 sm:px-6">Mode</th>
                  <th className="px-3 py-4 font-medium text-zinc-400 sm:px-6">Score</th>
                  <th className="hidden px-3 py-4 text-right font-medium text-zinc-400 sm:table-cell sm:px-6">
                    Duration
                  </th>
                </tr>
              </thead>
              <motion.tbody
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {games.map((game) => (
                  <motion.tr
                    key={game.id}
                    variants={rowStagger}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="px-3 py-4 whitespace-nowrap text-zinc-300 sm:px-6">
                      {formatDate(game.startedAt)}
                    </td>
                    <td className="px-3 py-4 sm:px-6">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-300">
                        {getModeLabel(fromPrismaMode(game.mode))}
                      </span>
                    </td>
                    <td className="px-3 py-4 font-bold tabular-nums text-gradient sm:px-6">
                      {game.score ?? "—"}
                    </td>
                    <td className="hidden px-3 py-4 text-right text-zinc-300 sm:table-cell sm:px-6">
                      {formatDuration(game.startedAt, game.endedAt)}
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
            </div>
          )}
        </motion.div>
      </motion.div>
    </PageShell>
  );
}

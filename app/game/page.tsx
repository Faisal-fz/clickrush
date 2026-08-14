"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClickGame } from "@/components/game/ClickGame";
import { PageShell } from "@/components/ui/PageShell";
import { getProfile, type Profile } from "@/lib/auth-client";

export default function GamePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const result = await getProfile();

      if (!result.ok) {
        router.replace("/signin");
        return;
      }

      setProfile(result.data);
      setLoading(false);
    }

    checkAuth();
  }, [router]);

  if (loading || !profile) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <PageShell className="justify-center">
      <div className="mx-auto w-full max-w-lg">
        <ClickGame profile={profile} onProfileUpdate={setProfile} />
        <Link
          href="/profile"
          className="mt-6 block text-center text-sm text-zinc-500 underline-offset-4 transition-colors hover:text-orange-400 hover:underline"
        >
          View full profile
        </Link>
      </div>
    </PageShell>
  );
}

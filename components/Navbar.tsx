"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { signOut } from "@/lib/api-client";
import { getProfile, type Profile } from "@/lib/auth-client";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/game", label: "Play" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/profile", label: "Profile" },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const result = await getProfile();
      if (result.ok) {
        setProfile(result.data);
      } else {
        setProfile(null);
      }
      setLoading(false);
    }

    loadProfile();
  }, [pathname]);

  async function handleSignOut() {
    await signOut();
    setProfile(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-gradient">
          ClickRush
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative rounded-full px-3 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 ${isActive ? "text-white" : ""}`}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {loading ? (
            <span className="text-sm text-zinc-500">...</span>
          ) : profile ? (
            <>
              <span className="hidden text-sm text-zinc-400 sm:inline">
                {profile.name}
              </span>
              <AnimatedButton
                variant="secondary"
                onClick={handleSignOut}
                className="!px-4 !py-1.5 text-sm"
              >
                Logout
              </AnimatedButton>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                Sign in
              </Link>
              <AnimatedButton href="/signup" className="!px-4 !py-1.5 text-sm">
                Sign up
              </AnimatedButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

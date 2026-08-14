"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
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
  const menuId = useId();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

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

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    await signOut();
    setProfile(null);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-gradient">
          ClickRush
        </Link>

        <nav className="hidden items-center gap-1 md:flex md:gap-2">
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
                    className="absolute inset-0 rounded-full border border-orange-500/30 bg-gradient-to-r from-orange-500/20 to-red-500/20"
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

        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            <span className="text-sm text-zinc-500">...</span>
          ) : profile ? (
            <>
              <span className="text-sm text-zinc-400">{profile.name}</span>
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

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white md:hidden"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="flex flex-col gap-1.5" aria-hidden="true">
            <span
              className={`block h-0.5 w-5 bg-white transition-transform ${
                menuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 bg-white transition-opacity ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 bg-white transition-transform ${
                menuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {menuOpen && (
        <div
          id={menuId}
          className="border-t border-white/10 bg-black/90 px-4 py-4 md:hidden"
        >
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive
                      ? "bg-orange-500/15 text-white"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
            {loading ? (
              <span className="text-sm text-zinc-500">...</span>
            ) : profile ? (
              <>
                <span className="px-3 text-sm text-zinc-400">{profile.name}</span>
                <AnimatedButton
                  variant="secondary"
                  onClick={handleSignOut}
                  className="!px-4 !py-2 text-sm"
                >
                  Logout
                </AnimatedButton>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white"
                >
                  Sign in
                </Link>
                <AnimatedButton href="/signup" className="!px-4 !py-2 text-sm">
                  Sign up
                </AnimatedButton>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

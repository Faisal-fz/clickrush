"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormField } from "@/components/auth/FormField";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { signIn } from "@/lib/auth-client";
import { mapApiFieldErrors, mapZodFieldErrors } from "@/lib/form-errors";
import { loginSchema } from "@/schema/auth.schema";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setFormError("");

    const validated = loginSchema.safeParse({ email, password });
    if (!validated.success) {
      setFieldErrors(mapZodFieldErrors(validated.error.issues));
      return;
    }

    setLoading(true);
    const result = await signIn(validated.data);
    setLoading(false);

    if (!result.ok) {
      if (result.fieldErrors) {
        setFieldErrors(mapApiFieldErrors(result.fieldErrors));
      } else {
        setFormError(result.error);
      }
      return;
    }

    router.push("/game");
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to continue playing"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {formError && (
          <div className="rounded-lg border border-red-500/30 bg-red-950/50 px-4 py-3 text-sm text-red-400">
            {formError}
          </div>
        )}

        <FormField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          error={fieldErrors.email}
          autoComplete="email"
          placeholder="you@example.com"
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
          autoComplete="current-password"
        />

        <SubmitButton loading={loading} loadingText="Signing in...">
          Sign in
        </SubmitButton>

        <p className="text-center text-sm text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-orange-400 hover:text-orange-300 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

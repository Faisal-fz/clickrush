"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormField } from "@/components/auth/FormField";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { signUp } from "@/lib/auth-client";
import { signupSchema } from "@/schema/auth.schema";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setFormError("");

    const validated = signupSchema.safeParse({ name, email, password });
    if (!validated.success) {
      const errors: Record<string, string> = {};
      for (const issue of validated.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && !errors[field]) {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    const result = await signUp(validated.data);
    setLoading(false);

    if (!result.ok) {
      if (result.fieldErrors) {
        const errors: Record<string, string> = {};
        for (const [key, messages] of Object.entries(result.fieldErrors)) {
          errors[key] = messages[0];
        }
        setFieldErrors(errors);
      } else {
        setFormError(result.error);
      }
      return;
    }

    router.push("/signin");
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Join ClickRush and start playing"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {formError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            {formError}
          </div>
        )}

        <FormField
          id="name"
          label="Name"
          value={name}
          onChange={setName}
          error={fieldErrors.name}
          autoComplete="name"
          placeholder="Your name"
        />

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
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />

        <SubmitButton loading={loading} loadingText="Creating account...">
          Sign up
        </SubmitButton>

        <p className="text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-medium text-orange-400 hover:text-orange-300 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

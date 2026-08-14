import type { ZodIssue } from "zod";
import type { FieldErrors } from "@/lib/fetch-result";

export function mapZodFieldErrors(issues: ZodIssue[]): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
}

export function mapApiFieldErrors(
  fieldErrors: FieldErrors,
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const [key, messages] of Object.entries(fieldErrors)) {
    errors[key] = messages[0];
  }

  return errors;
}

export type FieldErrors = Record<string, string[]>;

type ApiSuccess<T> = { ok: true; data: T };
type ApiFailure = { ok: false; error: string; fieldErrors?: FieldErrors };

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

type ApiErrorBody = {
  error?: string;
  issues?: FieldErrors;
};

export async function parseJsonResponse<T>(
  response: Response,
): Promise<ApiResult<T>> {
  const body = (await response.json().catch(() => ({}))) as ApiErrorBody;

  if (!response.ok) {
    return {
      ok: false,
      error: body.error ?? "Something went wrong",
      fieldErrors: body.issues,
    };
  }

  return { ok: true, data: body as T };
}

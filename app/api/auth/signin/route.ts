import { NextResponse } from "next/server";
import {
  handleServiceError,
  jsonError,
} from "@/lib/api-route";
import { loginSchema } from "@/schema/auth.schema";
import { login } from "@/services/auth.service";

export async function POST(request: Request) {
  const data = await request.json();
  const validated = loginSchema.safeParse(data);

  if (!validated.success) {
    return jsonError(
      "Validation failed",
      400,
      validated.error.flatten().fieldErrors,
    );
  }

  try {
    const { user, token } = await login(validated.data);
    const response = NextResponse.json(
      { message: "Login successful", user, token },
      { status: 200 },
    );
    response.cookies.set("accessToken", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 15,
      path: "/",
    });

    return response;
  } catch (error) {
    return handleServiceError(error, "Sign in failed:");
  }
}

import { AppError } from "@/lib/errors";
import { loginSchema } from "@/schema/auth.schema";
import { login } from "@/services/auth.service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data = await request.json();
  const validated = loginSchema.safeParse(data);

  if (!validated.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: validated.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const { user, token } = await login(validated.data);
    const response = NextResponse.json(
      { message: "Login successful", user , token},
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
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    throw error;
  }
}
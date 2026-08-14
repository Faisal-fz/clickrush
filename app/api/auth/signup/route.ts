import { NextResponse } from "next/server";
import { signupSchema } from "@/schema/auth.schema";
import { signup } from "@/services/auth.service";
import { AppError } from "@/lib/errors";

export async function POST(request: Request) {
  const data = await request.json();
  const validated = signupSchema.safeParse(data);

  if (!validated.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: validated.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const user = await signup(validated.data);
    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    console.error("Signup failed:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

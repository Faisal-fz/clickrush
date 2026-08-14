import { NextResponse } from "next/server";
import {
  handleServiceError,
  jsonError,
} from "@/lib/api-route";
import { signupSchema } from "@/schema/auth.schema";
import { signup } from "@/services/auth.service";

export async function POST(request: Request) {
  const data = await request.json();
  const validated = signupSchema.safeParse(data);

  if (!validated.success) {
    return jsonError(
      "Validation failed",
      400,
      validated.error.flatten().fieldErrors,
    );
  }

  try {
    const user = await signup(validated.data);
    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 },
    );
  } catch (error) {
    return handleServiceError(error, "Signup failed:");
  }
}

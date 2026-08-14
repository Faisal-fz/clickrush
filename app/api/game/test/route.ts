import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id");

  return NextResponse.json({
    message: "You are authenticated",
    userId,
  });
}
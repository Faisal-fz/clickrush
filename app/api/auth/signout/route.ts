import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    { message: "Signed out successfully" },
    { status: 200 },
  );

  response.cookies.set("accessToken", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });

  return response;
}

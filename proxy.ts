import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { AppError } from "@/lib/errors";

const PROTECTED_ROUTES = [
  "/api/game",
  "/api/profile",
];

export function proxy(request: NextRequest) {

    console.log("🔥 PROXY HIT:", request.nextUrl.pathname);
  const pathname = request.nextUrl.pathname;

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) =>
      pathname === route || pathname.startsWith(`${route}/`),
  );

  // Public route → allow request
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const token = getTokenFromRequest(request);

  // No access token
  if (!token) {
    return unauthorized();
  }

  try {
    const payload = verifyToken(token);

    // Pass authenticated user's ID to downstream handlers
    const requestHeaders = new Headers(request.headers);

    requestHeaders.set("x-user-id", payload.userId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }
}

function unauthorized() {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 },
  );
}

export const config = {
  matcher: [
    "/api/:path*",
  ],
};
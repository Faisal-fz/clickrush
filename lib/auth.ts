import jwt, { JwtPayload as JsonWebTokenPayload } from "jsonwebtoken";
import { NextRequest } from "next/server";
import { AppError } from "./errors";

const COOKIE_NAME = "accessToken";

type AuthPayload = {
  userId: string;
};

export function getTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_NAME)?.value ?? null;
}

export function verifyToken(token: string): AuthPayload {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as JsonWebTokenPayload & Partial<AuthPayload>;

    if (!decoded.userId || typeof decoded.userId !== "string") {
      throw new AppError("Invalid token", 401);
    }

    return {
      userId: decoded.userId,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Invalid token", 401);
  }
}
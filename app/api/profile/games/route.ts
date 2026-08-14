import { NextResponse } from "next/server";
import {
  getAuthenticatedUserId,
  handleServiceError,
  unauthorizedResponse,
} from "@/lib/api-route";
import { getGameHistory } from "@/services/profile.service";

export async function GET(request: Request) {
  const userId = getAuthenticatedUserId(request);
  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const games = await getGameHistory(userId);
    return NextResponse.json({ games });
  } catch (error) {
    return handleServiceError(error, "Game history fetch failed:");
  }
}

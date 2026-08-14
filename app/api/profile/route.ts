import { NextResponse } from "next/server";
import {
  getAuthenticatedUserId,
  handleServiceError,
  unauthorizedResponse,
} from "@/lib/api-route";
import { getUserProfile } from "@/services/profile.service";

export async function GET(request: Request) {
  const userId = getAuthenticatedUserId(request);
  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const profile = await getUserProfile(userId);
    return NextResponse.json(profile);
  } catch (error) {
    return handleServiceError(error, "Profile fetch failed:");
  }
}

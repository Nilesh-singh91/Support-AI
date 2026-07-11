import { scalekit } from "@/lib/scalekit";
import { NextResponse } from "next/server";

export async function GET() {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const redirectUri = `${appUrl}/api/auth/callback`;

  const url = scalekit.getAuthorizationUrl(redirectUri, {
    scopes: ["openid", "profile", "email"],
    prompt: "login",
  });

  return NextResponse.redirect(url);
}
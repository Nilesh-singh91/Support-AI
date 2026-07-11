import { scalekit } from "@/lib/scalekit";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    const redirectUri = `${appUrl}/api/auth/callback`;

    if (!code) {
      return NextResponse.json(
        { message: "Authorization code not found" },
        { status: 400 }
      );
    }

    const session = await scalekit.authenticateWithCode(
      code,
      redirectUri
    );

    // Login ke baad Home Page par jayega
    const response = NextResponse.redirect(appUrl);

    response.cookies.set("access_token", session.accessToken, {
      httpOnly: true,

      // localhost HTTP par false, production HTTPS par true
      secure: process.env.NODE_ENV === "production",

      sameSite: "lax",

      // 24 hours — seconds me
      maxAge: 24 * 60 * 60,

      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Authentication callback error:", error);

    return NextResponse.redirect(appUrl);
  }
}
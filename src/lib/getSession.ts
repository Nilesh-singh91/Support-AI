import { cookies } from "next/headers";
import { scalekit } from "./scalekit";

type SessionUser = {
  id: string;
  email?: string;
  name?: string;
};

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const tokenData: any = await scalekit.validateToken(token);
    const userResponse: any = await scalekit.user.getUser(tokenData.sub);

    // SDK direct user ya { user: ... } dono return kar sakta hai
    return userResponse.user ?? userResponse;
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
}
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSessionOrDev } from "@/lib/dev-session";

export async function getAuthUser(request: NextRequest) {
  // 1. Session based auth (Browser context)
  const session = await getSessionOrDev(request);
  if (session?.user?.id) {
    return { ...session, type: "session" };
  }

  // 2. API Key based auth (Server/Bot context)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer sk_live_")) {
    const apiKey = authHeader.split(" ")[1];
    if (!apiKey) return null;

    try {
      const user = await db.user.findUnique({
        where: { apiKey },
        select: { id: true, name: true, email: true, image: true },
      });

      if (user) {
        return {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          },
          expires: new Date(Date.now() + 86400 * 1000).toISOString(),
          type: "api-key"
        };
      }
    } catch (err) {
      console.error("API Key auth error:", err);
      return null;
    }
  }

  return null;
}

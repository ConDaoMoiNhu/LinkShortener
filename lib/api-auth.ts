import { NextRequest } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { getSessionOrDev } from "@/lib/dev-session";
import { logger } from "@/lib/logger";

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
      const hashedKey = crypto.createHash("sha256").update(apiKey).digest("hex");
      const user = await db.user.findUnique({
        where: { apiKey: hashedKey },
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

      logger.warn("API key auth failed — key not found", { keyPrefix: apiKey.slice(0, 16) });
      return null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error("API key auth error", { error: msg });
      return null;
    }
  }

  return null;
}

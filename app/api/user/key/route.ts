import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const session = await getAuthUser(request);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const newKey = "sk_live_" + crypto.randomBytes(24).toString("hex");
    const hashedKey = crypto.createHash("sha256").update(newKey).digest("hex");
    await db.user.update({
      where: { id: session.user.id },
      data: { apiKey: hashedKey },
    });

    // Return plaintext once — the hash is stored; this is the only time it's visible
    return NextResponse.json({ apiKey: newKey });
  } catch (err) {
    logger.error("Failed to regenerate API key", { error: err });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

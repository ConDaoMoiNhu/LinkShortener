import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const session = await getAuthUser(request);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const newKey = "sk_live_" + crypto.randomBytes(24).toString("hex");
    await db.user.update({
      where: { id: session.user.id },
      data: { apiKey: newKey },
    });

    return NextResponse.json({ apiKey: newKey });
  } catch (err) {
    console.error("Failed to regenerate API key:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

const schema = z.object({
  name: z.string().min(1).max(100).optional(),
  location: z.string().max(100).optional(),
  timezone: z.string().max(100).optional(),
});

export async function PATCH(request: NextRequest) {
  const session = await getAuthUser(request);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const updated = await db.user.update({
      where: { id: session.user.id },
      data: parsed.data,
      select: { id: true, name: true, email: true, location: true, timezone: true },
    });

    logger.info("User profile updated", { userId: session.user.id });
    return NextResponse.json(updated);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error("PATCH /api/user/profile failed", { error: msg });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

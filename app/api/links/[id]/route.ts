import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { deleteSlugUrl, setSlugUrl } from "@/lib/kv";
import { isValidUrl } from "@/lib/utils";
import { logger } from "@/lib/logger";

const SLUG_BLACKLIST = ["api", "dashboard", "login", "_next", "favicon.ico", "public", "admin", "settings"];

const UpdateLinkSchema = z.object({
  originalUrl: z.string().max(2048).refine(isValidUrl, { message: "URL không hợp lệ" }).optional(),
  customSlug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9-_]+$/)
    .refine((s) => !SLUG_BLACKLIST.includes(s.toLowerCase()), {
      message: "Slug này đã được hệ thống sử dụng",
    })
    .optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getAuthUser(request);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const link = await db.link.findUnique({ where: { id } });
    if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const userId = session.user.id;
    if (process.env.NODE_ENV !== "development" && link.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = UpdateLinkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { originalUrl, customSlug } = parsed.data;

    if (customSlug && customSlug !== link.slug) {
      const conflict = await db.link.findUnique({ where: { slug: customSlug } });
      if (conflict) return NextResponse.json({ error: "Slug đã được dùng" }, { status: 409 });
      try { await deleteSlugUrl(link.slug); } catch { /* KV best-effort */ }
    }

    const updated = await db.link.update({
      where: { id },
      data: {
        ...(originalUrl && { originalUrl }),
        ...(customSlug && { slug: customSlug }),
      },
    });

    try {
      await setSlugUrl(updated.slug, updated.originalUrl);
    } catch (kvErr) {
      logger.warn("KV cache set failed after link update", { slug: updated.slug, error: kvErr });
    }

    logger.info("Link updated", { id, userId });
    return NextResponse.json(updated);
  } catch (err) {
    logger.error("PATCH /api/links/[id] failed", { id, error: err });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getAuthUser(request);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const link = await db.link.findUnique({ where: { id } });
    if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const userId = session.user.id;
    if (process.env.NODE_ENV !== "development" && link.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.link.delete({ where: { id } });
    try { await deleteSlugUrl(link.slug); } catch { /* KV best-effort */ }

    logger.info("Link deleted", { id, userId });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    logger.error("DELETE /api/links/[id] failed", { id, error: err });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


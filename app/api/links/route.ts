import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { setSlugUrl } from "@/lib/kv";
import { generateSlug, isValidUrl } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

const SLUG_BLACKLIST = ["api", "dashboard", "login", "_next", "favicon.ico", "public", "admin", "settings"];

const CreateLinkSchema = z.object({
  originalUrl: z
    .string()
    .max(2048, "URL quá dài (tối đa 2048 ký tự)")
    .refine(isValidUrl, { message: "URL không hợp lệ" }),
  customSlug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9-_]+$/)
    .refine((s) => !SLUG_BLACKLIST.includes(s.toLowerCase()), {
      message: "Slug này đã được hệ thống sử dụng",
    })
    .optional(),
  expiresAt: z
    .string()
    .refine((s) => !s || new Date(s).getTime() > Date.now(), {
      message: "Thời gian hết hạn phải ở tương lai",
    })
    .optional(),
});

export async function GET(request: NextRequest) {
  const session = await getAuthUser(request);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    const links = await db.link.findMany({
      where: { userId },
      include: { _count: { select: { clicks: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(links);
  } catch (err) {
    logger.error("GET /api/links failed", { error: err });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthUser(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = rateLimit("create-link", session.user.id, { maxRequests: 10, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Quá nhiều request. Vui lòng thử lại sau." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = CreateLinkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { originalUrl, customSlug, expiresAt } = parsed.data;
    const slug = customSlug ?? generateSlug();

    // Check slug limits and existence...
    const count = await db.link.count({ where: { userId: session.user.id } });
    if (count >= 100) return NextResponse.json({ error: "Limit reached" }, { status: 403 });

    const existing = await db.link.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug đã được dùng" }, { status: 409 });
    }

    const link = await db.link.create({
      data: {
        slug,
        originalUrl,
        userId: session.user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    try {
      await setSlugUrl(slug, originalUrl);
    } catch (kvErr) {
      logger.warn("KV cache set failed", { slug, error: kvErr });
    }

    logger.info("Link created", { slug });
    return NextResponse.json(link, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "FATAL_CRASH: " + (err.stack ?? err.message ?? "Unknown server fault") }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getAuthUser(request);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    await db.link.deleteMany({ where: { userId } });
    logger.info("All links deleted", { userId });
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("DELETE /api/links failed", { error: err });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

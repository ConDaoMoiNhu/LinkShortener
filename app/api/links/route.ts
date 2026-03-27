import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionOrDev } from "@/lib/dev-session";
import { db } from "@/lib/db";
import { setSlugUrl } from "@/lib/kv";
import { generateSlug, isValidUrl } from "@/lib/utils";

const CreateLinkSchema = z.object({
  originalUrl: z.string().refine(isValidUrl, { message: "URL không hợp lệ" }),
  customSlug: z.string().min(3).max(50).regex(/^[a-zA-Z0-9-_]+$/).optional(),
  expiresAt: z.string().optional(),
});

export async function GET() {
  const session = await getSessionOrDev();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id ?? null;

  const links = await db.link.findMany({
    where: { userId },
    include: { _count: { select: { clicks: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(links);
}

export async function POST(request: NextRequest) {
  const session = await getSessionOrDev();
  const body = await request.json();

  const parsed = CreateLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { originalUrl, customSlug, expiresAt } = parsed.data;
  const slug = customSlug ?? generateSlug();

  const existing = await db.link.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug đã được dùng" }, { status: 409 });
  }

  const link = await db.link.create({
    data: {
      slug,
      originalUrl,
      userId: session?.user?.id ?? null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  await setSlugUrl(slug, originalUrl);

  return NextResponse.json(link, { status: 201 });
}

export async function DELETE() {
  const session = await getSessionOrDev();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id ?? null;
  await db.link.deleteMany({ where: { userId } });

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { setSlugUrl } from "@/lib/kv";
import { generateSlug, isValidUrl } from "@/lib/utils";

const CreateLinkSchema = z.object({
  originalUrl: z.string().refine(isValidUrl, { message: "URL không hợp lệ" }),
  customSlug: z.string().min(3).max(50).regex(/^[a-zA-Z0-9-_]+$/).optional(),
  expiresAt: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const links = await db.link.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { clicks: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(links);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const body = await request.json();

  const parsed = CreateLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { originalUrl, customSlug, expiresAt } = parsed.data;
  const slug = customSlug ?? generateSlug();

  // Kiểm tra slug đã tồn tại chưa
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

  // Sync vào KV để edge middleware có thể redirect
  await setSlugUrl(slug, originalUrl);

  return NextResponse.json(link, { status: 201 });
}

export async function DELETE(_request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.link.deleteMany({ where: { userId: session.user.id } });

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionOrDev } from "@/lib/dev-session";
import { db } from "@/lib/db";
import { deleteSlugUrl, setSlugUrl } from "@/lib/kv";
import { isValidUrl } from "@/lib/utils";

const UpdateLinkSchema = z.object({
  originalUrl: z.string().refine(isValidUrl, { message: "URL không hợp lệ" }).optional(),
  customSlug: z.string().min(3).max(50).regex(/^[a-zA-Z0-9-_]+$/).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSessionOrDev();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const link = await db.link.findUnique({ where: { id } });
  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userId = session.user.id ?? null;
  if (process.env.NODE_ENV !== "development" && link.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = UpdateLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { originalUrl, customSlug } = parsed.data;

  if (customSlug && customSlug !== link.slug) {
    const conflict = await db.link.findUnique({ where: { slug: customSlug } });
    if (conflict) return NextResponse.json({ error: "Slug đã được dùng" }, { status: 409 });
    await deleteSlugUrl(link.slug);
  }

  const updated = await db.link.update({
    where: { id },
    data: {
      ...(originalUrl && { originalUrl }),
      ...(customSlug && { slug: customSlug }),
    },
  });

  await setSlugUrl(updated.slug, updated.originalUrl);
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSessionOrDev();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const link = await db.link.findUnique({ where: { id } });
  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userId = session.user.id ?? null;
  if (process.env.NODE_ENV !== "development" && link.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.link.delete({ where: { id } });
  await deleteSlugUrl(link.slug);

  return new NextResponse(null, { status: 204 });
}

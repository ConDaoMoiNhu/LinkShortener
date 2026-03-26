import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function detectDevice(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return "mobile";
  if (/tablet/i.test(userAgent)) return "tablet";
  return "desktop";
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const link = await db.link.findUnique({ where: { slug } });
  if (!link) return new NextResponse(null, { status: 404 });

  const userAgent = request.headers.get("user-agent") ?? "";

  // Lấy country từ Vercel geo header (tự động có trên Vercel)
  const country = request.headers.get("x-vercel-ip-country") ?? null;
  const device = detectDevice(userAgent);

  await db.click.create({
    data: { linkId: link.id, country, device },
  });

  return new NextResponse(null, { status: 200 });
}

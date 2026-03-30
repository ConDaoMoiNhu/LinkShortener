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
  const country = request.headers.get("x-vercel-ip-country") ?? null;
  const device = detectDevice(userAgent);

  // Parse referer to domain only (privacy-safe, no paths)
  const rawReferer = request.headers.get("referer") ?? null;
  let referer: string | null = null;
  if (rawReferer) {
    try { referer = new URL(rawReferer).hostname.replace(/^www\./, ""); }
    catch { referer = null; }
  }

  await db.click.create({
    data: { linkId: link.id, country, device, referer },
  });

  return new NextResponse(null, { status: 200 });
}

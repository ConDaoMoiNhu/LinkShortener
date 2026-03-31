import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const SLUG_PATTERN = /^[a-zA-Z0-9-_]{3,50}$/;

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

  // Validate slug format
  if (!SLUG_PATTERN.test(slug)) {
    return new NextResponse(null, { status: 400 });
  }

  // Rate limit by IP + slug (1 click per 10 seconds per slug per IP)
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = await rateLimit("click", `${ip}:${slug}`, { maxRequests: 1, windowMs: 10_000 });
  if (!rl.allowed) {
    return new NextResponse(null, { status: 429 });
  }

  try {
    const link = await db.link.findUnique({ where: { slug } });
    if (!link) return new NextResponse(null, { status: 404 });

    // Check link expiry
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return new NextResponse(null, { status: 410 }); // Gone
    }

    const rawUserAgent = request.headers.get("user-agent") ?? "";
    const userAgent = rawUserAgent.slice(0, 512); // Truncate to prevent oversized storage
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
  } catch (err) {
    logger.error("Click tracking failed", { slug, error: err });
    return new NextResponse(null, { status: 500 });
  }
}


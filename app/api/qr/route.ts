import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateQRCode } from "@/lib/qr";
import { getSessionOrDev } from "@/lib/dev-session";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const schema = z.object({ url: z.string().url() });

export async function GET(request: NextRequest) {
  const session = await getSessionOrDev(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = rateLimit("qr", session.user.id, { maxRequests: 20, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Quá nhiều request. Vui lòng thử lại sau." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  const url = request.nextUrl.searchParams.get("url");
  const parsed = schema.safeParse({ url });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const dataUrl = await generateQRCode(parsed.data.url);
    return NextResponse.json({ qr: dataUrl });
  } catch (err) {
    logger.error("QR generation failed", { url, error: err });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateQRCode } from "@/lib/qr";

const schema = z.object({ url: z.string().url() });

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const parsed = schema.safeParse({ url });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const dataUrl = await generateQRCode(parsed.data.url);
  return NextResponse.json({ qr: dataUrl });
}

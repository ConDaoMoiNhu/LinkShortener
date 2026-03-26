import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

const SLUG_PREFIX = "slug:";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const slug = pathname.slice(1); // bỏ leading "/"

  const url = await kv.get<string>(`${SLUG_PREFIX}${slug}`);

  if (url) {
    // Ghi nhận click (fire-and-forget, không block redirect)
    // Phải dùng absolute URL vì Edge Runtime không hỗ trợ relative fetch
    const clickUrl = new URL(`/api/analytics/click/${slug}`, request.url);

    fetch(clickUrl.toString(), {
      method: "POST",
      headers: {
        "x-forwarded-for": request.headers.get("x-forwarded-for") ?? "",
        "user-agent": request.headers.get("user-agent") ?? "",
        "x-vercel-ip-country": request.headers.get("x-vercel-ip-country") ?? "",
      },
    }).catch(() => {}); // ignore errors

    return NextResponse.redirect(url, { status: 301 });
  }

  // KV miss → fallback về Next.js app/[slug]/page.tsx
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|dashboard|login|_next/static|_next/image|favicon.ico).*)",
  ],
};

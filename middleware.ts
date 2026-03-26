import { NextRequest, NextResponse } from "next/server";

const SLUG_PREFIX = "slug:";

async function getFromKV(slug: string): Promise<string | null> {
  const KV_URL = process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN;

  // Bỏ qua KV khi chạy local mà chưa có credentials
  if (!KV_URL || !KV_TOKEN) return null;

  try {
    const res = await fetch(`${KV_URL}/get/${SLUG_PREFIX}${slug}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.result ?? null;
  } catch {
    return null;
  }
}

export default async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const slug = pathname.slice(1); // bỏ leading "/"

    // Skip empty slug (root path)
    if (!slug) return NextResponse.next();

    const url = await getFromKV(slug);

    if (url) {
      // Ghi nhận click (fire-and-forget, không block redirect)
      const clickUrl = new URL(`/api/analytics/click/${slug}`, request.url);
      fetch(clickUrl.toString(), {
        method: "POST",
        headers: {
          "x-forwarded-for": request.headers.get("x-forwarded-for") ?? "",
          "user-agent": request.headers.get("user-agent") ?? "",
          "x-vercel-ip-country": request.headers.get("x-vercel-ip-country") ?? "",
        },
      }).catch(() => {});

      return NextResponse.redirect(url, { status: 301 });
    }
  } catch {
    // Middleware lỗi → fallthrough, không block request
  }

  // KV miss hoặc lỗi → fallback về Next.js
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|dashboard|login|_next/static|_next/image|favicon.ico).*)",
  ],
};

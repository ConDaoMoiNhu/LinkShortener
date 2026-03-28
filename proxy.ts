import { NextRequest, NextResponse } from "next/server";

const EXCLUDED = ["/api", "/dashboard", "/login", "/_next", "/favicon.ico"];

export function shouldHandleRedirect(pathname: string): boolean {
  return (
    pathname !== "/" &&
    !EXCLUDED.some((p) => pathname.startsWith(p)) &&
    pathname.length > 1
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!shouldHandleRedirect(pathname)) {
    return NextResponse.next();
  }

  const slug = pathname.slice(1); // strip leading "/"

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (kvUrl && kvToken) {
    try {
      const res = await fetch(`${kvUrl}/get/slug:${slug}`, {
        headers: { Authorization: `Bearer ${kvToken}` },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        const originalUrl: string | null = data?.result ?? null;
        if (originalUrl) {
          return NextResponse.redirect(originalUrl, { status: 301 });
        }
      }
    } catch {
      // KV unavailable — fall through to Next.js routing
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

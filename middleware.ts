import { NextRequest, NextResponse } from "next/server";

const SLUG_EXCLUDED = ["/api", "/dashboard", "/login", "/_next", "/favicon.ico"];

export function isSlugPath(pathname: string): boolean {
  return (
    pathname !== "/" &&
    !SLUG_EXCLUDED.some((p) => pathname.startsWith(p)) &&
    pathname.length > 1
  );
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth protection for dashboard (skip in dev)
  if (pathname.startsWith("/dashboard") && process.env.NODE_ENV !== "development") {
    // Check cookie existence — Edge Runtime can't reliably verify JWT crypto.
    // Real auth verification happens in API routes (Node.js runtime).
    const secureCookie = process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;
    const cookieName = secureCookie
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";
    const allCookies = request.cookies.getAll();
    const hasSession = allCookies.some((c) => c.name.startsWith(cookieName));
    if (!hasSession) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Edge slug redirect via KV
  if (isSlugPath(pathname)) {
    const slug = pathname.slice(1);
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
            // Track click before redirecting (await ensures it completes on Edge)
            const origin = request.nextUrl.origin;
            await fetch(`${origin}/api/analytics/click/${slug}`, {
              method: "POST",
              headers: {
                "user-agent": request.headers.get("user-agent") ?? "",
                "x-vercel-ip-country": request.headers.get("x-vercel-ip-country") ?? "",
                "referer": request.headers.get("referer") ?? "",
              },
            }).catch(() => {});
            return NextResponse.redirect(originalUrl, { status: 301 });
          }
        }
      } catch {
        // KV unavailable — fall through to Next.js routing
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

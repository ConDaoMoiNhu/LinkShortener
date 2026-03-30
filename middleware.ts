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
  
  // Robustly check for NextAuth session cookies (works across HTTP/HTTPS)
  const hasSession = request.cookies.has("next-auth.session-token") || 
                     request.cookies.has("__Secure-next-auth.session-token");

  // UX Feature: Auto-redirect logged-in users from landing page to dashboard
  if (pathname === "/" && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Auth protection for dashboard (skip in absolute local dev mode)
  if (pathname.startsWith("/dashboard") && process.env.NODE_ENV !== "development") {
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

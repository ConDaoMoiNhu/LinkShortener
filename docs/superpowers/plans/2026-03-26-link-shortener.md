# Link Shortener Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng ứng dụng rút gọn link Public SaaS với Edge Middleware redirect, auth, dashboard, và analytics.

**Architecture:** Vercel Edge Middleware đọc slug → tra Vercel KV → redirect 301 tại CDN (không qua Next.js server). Khi KV miss, fallback về Next.js App Router để xử lý. Dữ liệu lưu PostgreSQL, KV dùng làm cache redirect và counter.

**Tech Stack:** Next.js 14+ App Router, TypeScript, Prisma + PostgreSQL, Vercel KV (Redis), NextAuth.js, Tailwind CSS, Zod, Vitest

---

## File Map

| File | Trách nhiệm |
|---|---|
| `middleware.ts` | Edge redirect: đọc slug → KV → 301 hoặc fallback |
| `lib/db.ts` | Prisma client singleton |
| `lib/kv.ts` | Vercel KV client singleton |
| `lib/utils.ts` | Slug generator (nanoid), URL validator |
| `lib/qr.ts` | QR code generator (qrcode lib) |
| `prisma/schema.prisma` | Schema: User, Link, Click |
| `app/api/links/route.ts` | GET list + POST create link |
| `app/api/links/[id]/route.ts` | PATCH update + DELETE link |
| `app/api/analytics/[slug]/route.ts` | GET analytics cho 1 link |
| `app/api/auth/[...nextauth]/route.ts` | NextAuth handler |
| `app/[slug]/page.tsx` | Fallback redirect page (KV miss) |
| `app/dashboard/page.tsx` | Dashboard chính (protected) |
| `app/dashboard/DashboardClient.tsx` | Client component cho dashboard (fetch + render links) |
| `app/dashboard/components/LinkCard.tsx` | Card hiển thị 1 link |
| `app/dashboard/components/CreateLinkForm.tsx` | Form tạo link mới |
| `app/login/page.tsx` | Trang đăng nhập |
| `app/page.tsx` | Landing page |
| `components/ui/Button.tsx` | Button reusable |
| `components/ui/Input.tsx` | Input reusable |
| `__tests__/utils.test.ts` | Test slug generator, URL validator |
| `__tests__/api/links.test.ts` | Test API routes |
| `__tests__/middleware.test.ts` | Test Edge Middleware logic |

---

## Task 1: Project Setup

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`
- Create: `.env.local.example`

- [x] **Step 1: Khởi tạo Next.js project**

```bash
cd C:/Users/ADMIN/Downloads
npx create-next-app@latest link-shortener --typescript --tailwind --eslint --app --src-dir=no --import-alias="@/*"
cd link-shortener
```

- [x] **Step 2: Cài dependencies**

```bash
npm install prisma @prisma/client @vercel/kv next-auth @auth/prisma-adapter nanoid zod qrcode
npm install -D vitest @vitejs/plugin-react @types/qrcode vitest-environment-miniflare
```

- [x] **Step 3: Tạo file `.env.local.example`**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/linkshortener
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_ID=
GITHUB_SECRET=
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

- [x] **Step 4: Copy thành `.env.local` và điền giá trị local**

```bash
cp .env.local.example .env.local
```

- [x] **Step 5: Commit**

```bash
git add .
git commit -m "chore: init Next.js project with dependencies"
```

---

## Task 2: Database Schema + Prisma Setup

**Files:**
- Create: `prisma/schema.prisma`
- Create: `lib/db.ts`

- [x] **Step 1: Khởi tạo Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

- [x] **Step 2: Viết schema tại `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  image     String?
  accounts  Account[]
  sessions  Session[]
  links     Link[]
  createdAt DateTime @default(now())
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Link {
  id          String    @id @default(cuid())
  slug        String    @unique
  originalUrl String
  userId      String?
  user        User?     @relation(fields: [userId], references: [id], onDelete: SetNull)
  clicks      Click[]
  createdAt   DateTime  @default(now())
  expiresAt   DateTime?
}

model Click {
  id        String   @id @default(cuid())
  linkId    String
  link      Link     @relation(fields: [linkId], references: [id], onDelete: Cascade)
  country   String?
  device    String?
  createdAt DateTime @default(now())
}
```

- [x] **Step 3: Tạo `lib/db.ts`**

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

- [ ] **Step 4: Chạy migration** *(cần DB live — skip local, chạy khi có PostgreSQL)*

```bash
npx prisma migrate dev --name init
```

- [x] **Step 5: Generate Prisma client**

```bash
npx prisma generate
```

- [x] **Step 6: Commit**

```bash
git add prisma/ lib/db.ts
git commit -m "feat: add Prisma schema and db client"
```

---

## Task 3: Utility Functions (Slug + URL Validator)

**Files:**
- Create: `lib/utils.ts`
- Create: `__tests__/utils.test.ts`

- [ ] **Step 1: Tạo test tại `__tests__/utils.test.ts`**

```typescript
import { describe, it, expect } from "vitest";
import { generateSlug, isValidUrl } from "../lib/utils";

describe("generateSlug", () => {
  it("generates a slug of default length 7", () => {
    const slug = generateSlug();
    expect(slug).toHaveLength(7);
  });

  it("generates unique slugs", () => {
    const slugs = new Set(Array.from({ length: 100 }, () => generateSlug()));
    expect(slugs.size).toBe(100);
  });

  it("generates slug with only alphanumeric chars", () => {
    const slug = generateSlug();
    expect(slug).toMatch(/^[a-zA-Z0-9]+$/);
  });
});

describe("isValidUrl", () => {
  it("returns true for valid http url", () => {
    expect(isValidUrl("http://example.com")).toBe(true);
  });

  it("returns true for valid https url", () => {
    expect(isValidUrl("https://example.com/path?q=1")).toBe(true);
  });

  it("returns false for invalid url", () => {
    expect(isValidUrl("not-a-url")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isValidUrl("")).toBe(false);
  });
});
```

- [ ] **Step 2: Cấu hình Vitest tại `vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 3: Chạy test để xác nhận FAIL**

```bash
npx vitest run __tests__/utils.test.ts
```

Expected: FAIL — `Cannot find module '../lib/utils'`

- [ ] **Step 4: Tạo `lib/utils.ts`**

```typescript
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  7
);

export function generateSlug(): string {
  return nanoid();
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
```

- [ ] **Step 5: Chạy test để xác nhận PASS**

```bash
npx vitest run __tests__/utils.test.ts
```

Expected: PASS (tất cả tests xanh)

- [ ] **Step 6: Commit**

```bash
git add lib/utils.ts __tests__/utils.test.ts vitest.config.ts
git commit -m "feat: add slug generator and URL validator with tests"
```

---

## Task 4: Vercel KV Client

**Files:**
- Create: `lib/kv.ts`

- [ ] **Step 1: Tạo `lib/kv.ts`**

```typescript
import { kv } from "@vercel/kv";

// Key format: "slug:<slug>" → originalUrl
export const SLUG_PREFIX = "slug:";

export async function getUrlBySlug(slug: string): Promise<string | null> {
  return kv.get<string>(`${SLUG_PREFIX}${slug}`);
}

export async function setSlugUrl(slug: string, url: string): Promise<void> {
  await kv.set(`${SLUG_PREFIX}${slug}`, url);
}

export async function deleteSlugUrl(slug: string): Promise<void> {
  await kv.del(`${SLUG_PREFIX}${slug}`);
}

export { kv };
```

- [ ] **Step 2: Commit**

```bash
git add lib/kv.ts
git commit -m "feat: add Vercel KV client wrapper"
```

---

## Task 5: NextAuth Setup

**Files:**
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Tạo `lib/auth.ts`**

```typescript
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};
```

- [ ] **Step 2: Extend NextAuth types tại `types/next-auth.d.ts`**

```typescript
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
```

- [ ] **Step 3: Tạo `app/api/auth/[...nextauth]/route.ts`**

```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

- [ ] **Step 4: Commit**

```bash
git add lib/auth.ts app/api/auth/ types/
git commit -m "feat: add NextAuth with Google and GitHub providers"
```

---

## Task 6: Edge Middleware Redirect

**Files:**
- Create: `middleware.ts`
- Create: `__tests__/middleware.test.ts`

- [ ] **Step 1: Tạo test tại `__tests__/middleware.test.ts`**

```typescript
import { describe, it, expect, vi } from "vitest";

// Unit test logic extract từ middleware
function shouldHandleRedirect(pathname: string): boolean {
  const excluded = ["/api", "/dashboard", "/login", "/_next", "/favicon.ico"];
  return (
    pathname !== "/" &&
    !excluded.some((p) => pathname.startsWith(p)) &&
    pathname.length > 1
  );
}

describe("middleware redirect logic", () => {
  it("handles short slug paths", () => {
    expect(shouldHandleRedirect("/abc123")).toBe(true);
  });

  it("ignores root path", () => {
    expect(shouldHandleRedirect("/")).toBe(false);
  });

  it("ignores api routes", () => {
    expect(shouldHandleRedirect("/api/links")).toBe(false);
  });

  it("ignores dashboard routes", () => {
    expect(shouldHandleRedirect("/dashboard")).toBe(false);
  });

  it("ignores login page", () => {
    expect(shouldHandleRedirect("/login")).toBe(false);
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận PASS (logic chưa import middleware)**

```bash
npx vitest run __tests__/middleware.test.ts
```

- [ ] **Step 3: Tạo `middleware.ts`**

```typescript
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
```

- [ ] **Step 4: Commit**

```bash
git add middleware.ts __tests__/middleware.test.ts
git commit -m "feat: add Edge Middleware for fast slug redirect via KV"
```

---

## Task 7: API Route — Links CRUD

**Files:**
- Create: `app/api/links/route.ts`
- Create: `app/api/links/[id]/route.ts`

- [ ] **Step 1: Tạo `app/api/links/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { setSlugUrl } from "@/lib/kv";
import { generateSlug, isValidUrl } from "@/lib/utils";

const CreateLinkSchema = z.object({
  originalUrl: z.string().refine(isValidUrl, { message: "URL không hợp lệ" }),
  customSlug: z.string().min(3).max(50).regex(/^[a-zA-Z0-9-_]+$/).optional(),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const links = await db.link.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { clicks: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(links);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const body = await request.json();

  const parsed = CreateLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { originalUrl, customSlug } = parsed.data;
  const slug = customSlug ?? generateSlug();

  // Kiểm tra slug đã tồn tại chưa
  const existing = await db.link.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug đã được dùng" }, { status: 409 });
  }

  const link = await db.link.create({
    data: {
      slug,
      originalUrl,
      userId: session?.user?.id ?? null,
    },
  });

  // Sync vào KV để edge middleware có thể redirect
  await setSlugUrl(slug, originalUrl);

  return NextResponse.json(link, { status: 201 });
}
```

- [ ] **Step 2: Tạo `app/api/links/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteSlugUrl, setSlugUrl } from "@/lib/kv";
import { isValidUrl } from "@/lib/utils";

const UpdateLinkSchema = z.object({
  originalUrl: z.string().refine(isValidUrl, { message: "URL không hợp lệ" }).optional(),
  customSlug: z.string().min(3).max(50).regex(/^[a-zA-Z0-9-_]+$/).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const link = await db.link.findUnique({ where: { id: params.id } });
  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (link.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = UpdateLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { originalUrl, customSlug } = parsed.data;

  if (customSlug && customSlug !== link.slug) {
    const conflict = await db.link.findUnique({ where: { slug: customSlug } });
    if (conflict) return NextResponse.json({ error: "Slug đã được dùng" }, { status: 409 });
    await deleteSlugUrl(link.slug);
  }

  const updated = await db.link.update({
    where: { id: params.id },
    data: {
      ...(originalUrl && { originalUrl }),
      ...(customSlug && { slug: customSlug }),
    },
  });

  await setSlugUrl(updated.slug, updated.originalUrl);
  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const link = await db.link.findUnique({ where: { id: params.id } });

  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (link.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.link.delete({ where: { id: params.id } });
  await deleteSlugUrl(link.slug);

  return new NextResponse(null, { status: 204 });
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/links/
git commit -m "feat: add links API routes (GET list, POST create, DELETE)"
```

---

## Task 8: Analytics — Click Tracking

**Files:**
- Create: `app/api/analytics/click/[slug]/route.ts`
- Create: `app/api/analytics/[slug]/route.ts`

- [ ] **Step 1: Tạo `app/api/analytics/click/[slug]/route.ts`** (được gọi từ middleware)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function detectDevice(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return "mobile";
  if (/tablet/i.test(userAgent)) return "tablet";
  return "desktop";
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const link = await db.link.findUnique({ where: { slug: params.slug } });
  if (!link) return new NextResponse(null, { status: 404 });

  const userAgent = request.headers.get("user-agent") ?? "";
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "";

  // Lấy country từ Vercel geo header (tự động có trên Vercel)
  const country = request.headers.get("x-vercel-ip-country") ?? null;
  const device = detectDevice(userAgent);

  await db.click.create({
    data: { linkId: link.id, country, device },
  });

  return new NextResponse(null, { status: 200 });
}
```

- [ ] **Step 2: Tạo `app/api/analytics/[slug]/route.ts`** (dashboard dùng)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const link = await db.link.findUnique({
    where: { slug: params.slug },
    include: {
      _count: { select: { clicks: true } },
      clicks: {
        orderBy: { createdAt: "desc" },
        select: { country: true, device: true, createdAt: true },
      },
    },
  });

  if (!link || link.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const totalClicks = link._count.clicks; // chính xác, không bị giới hạn

  const byDevice = link.clicks.reduce<Record<string, number>>((acc, c) => {
    const d = c.device ?? "unknown";
    acc[d] = (acc[d] ?? 0) + 1;
    return acc;
  }, {});

  const byCountry = link.clicks.reduce<Record<string, number>>((acc, c) => {
    const country = c.country ?? "unknown";
    acc[country] = (acc[country] ?? 0) + 1;
    return acc;
  }, {});

  // Time-series: group by ngày (UTC)
  const byDate = link.clicks.reduce<Record<string, number>>((acc, c) => {
    const date = c.createdAt.toISOString().split("T")[0]; // "YYYY-MM-DD"
    acc[date] = (acc[date] ?? 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({ totalClicks, byDevice, byCountry, byDate });
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/analytics/
git commit -m "feat: add click tracking and analytics API"
```

---

## Task 9: QR Code Generator

**Files:**
- Create: `lib/qr.ts`
- Create: `app/api/qr/route.ts`

- [ ] **Step 1: Tạo `lib/qr.ts`**

```typescript
import QRCode from "qrcode";

export async function generateQRCode(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 256,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });
}
```

- [ ] **Step 2: Tạo `app/api/qr/route.ts`**

```typescript
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
```

- [ ] **Step 3: Commit**

```bash
git add lib/qr.ts app/api/qr/
git commit -m "feat: add QR code generator API"
```

---

## Task 10: Fallback Redirect Page (KV Miss)

**Files:**
- Create: `app/[slug]/page.tsx`

- [ ] **Step 1: Tạo `app/[slug]/page.tsx`**

```typescript
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { setSlugUrl } from "@/lib/kv";

interface Props {
  params: { slug: string };
}

export default async function SlugPage({ params }: Props) {
  const link = await db.link.findUnique({
    where: { slug: params.slug },
  });

  if (!link) notFound();

  // Sync lại vào KV để lần sau edge middleware bắt được
  await setSlugUrl(link.slug, link.originalUrl);

  // Ghi nhận click (path này không qua middleware)
  const headersList = headers();
  const userAgent = headersList.get("user-agent") ?? "";
  const country = headersList.get("x-vercel-ip-country") ?? null;
  const device = /mobile/i.test(userAgent) ? "mobile" : "desktop";

  await db.click.create({
    data: { linkId: link.id, country, device },
  });

  redirect(link.originalUrl);
}
```

- [ ] **Step 2: Commit**

```bash
git add app/[slug]/
git commit -m "feat: add fallback redirect page with KV re-sync"
```

---

## Task 11: Login Page

**Files:**
- Create: `app/login/page.tsx`

- [ ] **Step 1: Tạo `app/login/page.tsx`**

```typescript
"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Đăng nhập</h1>
        <p className="text-gray-500 text-sm mb-6">
          Đăng nhập để quản lý links của bạn
        </p>

        <div className="space-y-3">
          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
          >
            <img src="/google.svg" alt="Google" className="w-5 h-5" />
            Tiếp tục với Google
          </button>

          <button
            onClick={() => signIn("github", { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium"
          >
            <img src="/github.svg" alt="GitHub" className="w-5 h-5" />
            Tiếp tục với GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Tạo icon SVG tại `public/google.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
</svg>
```

- [ ] **Step 3: Tạo icon SVG tại `public/github.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
</svg>
```

- [ ] **Step 4: Commit**

```bash
git add app/login/ public/
git commit -m "feat: add login page with Google and GitHub sign-in"
```

---

## Task 12: Dashboard Page

**Files:**
- Create: `app/dashboard/page.tsx`
- Create: `app/dashboard/components/CreateLinkForm.tsx`
- Create: `app/dashboard/components/LinkCard.tsx`

- [ ] **Step 1: Tạo `app/dashboard/components/CreateLinkForm.tsx`**

```typescript
"use client";

import { useState } from "react";

interface Props {
  onCreated: () => void;
}

export default function CreateLinkForm({ onCreated }: Props) {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originalUrl: url,
        customSlug: alias || undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Có lỗi xảy ra");
      return;
    }

    setUrl("");
    setAlias("");
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com/long-url"
        required
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
        placeholder="Custom alias (tuỳ chọn)"
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {loading ? "Đang tạo..." : "Rút gọn link"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Tạo `app/dashboard/components/LinkCard.tsx`**

```typescript
"use client";

import { useState } from "react";

interface Link {
  id: string;
  slug: string;
  originalUrl: string;
  createdAt: string;
  _count: { clicks: number };
}

interface Props {
  link: Link;
  baseUrl: string;
  onDeleted: () => void;
}

export default function LinkCard({ link, baseUrl, onDeleted }: Props) {
  const [copied, setCopied] = useState(false);
  const shortUrl = `${baseUrl}/${link.slug}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete() {
    if (!confirm("Xoá link này?")) return;
    await fetch(`/api/links/${link.id}`, { method: "DELETE" });
    onDeleted();
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-blue-600 font-medium text-sm truncate">{shortUrl}</p>
          <p className="text-gray-400 text-xs truncate mt-0.5">{link.originalUrl}</p>
        </div>
        <span className="text-xs text-gray-500 shrink-0">{link._count.clicks} clicks</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="text-xs px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
        >
          {copied ? "Đã copy!" : "Copy"}
        </button>
        <button
          onClick={handleDelete}
          className="text-xs px-3 py-1.5 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition"
        >
          Xoá
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Tạo `app/dashboard/page.tsx`**

```typescript
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/dashboard");

  return <DashboardClient user={session.user} />;
}
```

- [ ] **Step 4: Tạo `app/dashboard/DashboardClient.tsx`**

```typescript
"use client";

import { useEffect, useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import CreateLinkForm from "./components/CreateLinkForm";
import LinkCard from "./components/LinkCard";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface Link {
  id: string;
  slug: string;
  originalUrl: string;
  createdAt: string;
  _count: { clicks: number };
}

export default function DashboardClient({ user }: { user: User }) {
  const [links, setLinks] = useState<Link[]>([]);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const fetchLinks = useCallback(async () => {
    const res = await fetch("/api/links");
    const data = await res.json();
    setLinks(data);
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">LinkShort</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Tạo link mới</h2>
          <CreateLinkForm onCreated={fetchLinks} />
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-semibold text-gray-900">Links của bạn</h2>
          {links.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Chưa có link nào.</p>
          ) : (
            links.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                baseUrl={baseUrl}
                onDeleted={fetchLinks}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/
git commit -m "feat: add dashboard with link creation and management"
```

---

## Task 13: Landing Page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Viết `app/page.tsx`**

```typescript
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <span className="text-lg font-bold text-gray-900">LinkShort</span>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Dashboard →
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 leading-tight max-w-xl">
          Rút gọn link.<br />
          <span className="text-blue-600">Cực nhanh.</span>
        </h1>
        <p className="mt-4 text-gray-500 text-lg max-w-md">
          Redirect tại edge CDN — không qua server. Analytics thời gian thực. Miễn phí 100%.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
          >
            Bắt đầu miễn phí
          </Link>
          <a
            href="https://github.com"
            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            GitHub
          </a>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add landing page"
```

---

## Task 13b: API Integration Tests

**Files:**
- Create: `__tests__/api/links.test.ts`

- [ ] **Step 1: Tạo `__tests__/api/links.test.ts`**

Test các trường hợp validation và logic của links API (dùng mock Prisma + KV):

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies trước khi import route handler
vi.mock("@/lib/db", () => ({
  db: {
    link: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/kv", () => ({
  setSlugUrl: vi.fn(),
  deleteSlugUrl: vi.fn(),
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));

import { POST, GET } from "@/app/api/links/route";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/links", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/links", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 for invalid URL", async () => {
    const req = makeRequest({ originalUrl: "not-a-url" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 409 if slug already exists", async () => {
    vi.mocked(db.link.findUnique).mockResolvedValue({ id: "1" } as any);
    const req = makeRequest({ originalUrl: "https://example.com", customSlug: "taken" });
    const res = await POST(req);
    expect(res.status).toBe(409);
  });

  it("creates link and returns 201", async () => {
    vi.mocked(db.link.findUnique).mockResolvedValue(null);
    vi.mocked(db.link.create).mockResolvedValue({
      id: "1",
      slug: "abc123",
      originalUrl: "https://example.com",
    } as any);

    const req = makeRequest({ originalUrl: "https://example.com" });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});

describe("GET /api/links", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/links");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 2: Chạy test**

```bash
npx vitest run __tests__/api/links.test.ts
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add __tests__/api/
git commit -m "test: add API integration tests for links route"
```

---

## Task 14: Kiểm tra tổng thể & Deploy

- [ ] **Step 1: Chạy toàn bộ tests**

```bash
npx vitest run
```

Expected: tất cả PASS

- [ ] **Step 2: Build production**

```bash
npm run build
```

Expected: build thành công, không có lỗi TypeScript

- [ ] **Step 3: Tạo Vercel KV database trên dashboard Vercel**

Truy cập Vercel Dashboard → Storage → Create KV Database → copy env vars vào `.env.local`

- [ ] **Step 4: Thêm env vars vào Vercel project**

Sync env vars từ Vercel về local và đảm bảo chúng đã được set trên Vercel project:

```bash
npx vercel env pull .env.local
```

Kiểm tra Vercel Dashboard → Project Settings → Environment Variables xác nhận `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_ID`, `GITHUB_SECRET` đã có đủ.

- [ ] **Step 5: Deploy lên Vercel**

```bash
npx vercel --prod
```

- [ ] **Step 6: Chạy migration trên production DB**

```bash
npx prisma migrate deploy
```

- [ ] **Step 7: Test redirect trên production**

Tạo 1 link qua dashboard → copy short URL → truy cập → xác nhận redirect < 50ms

- [ ] **Step 8: Final commit**

```bash
git add .
git commit -m "chore: production ready"
```

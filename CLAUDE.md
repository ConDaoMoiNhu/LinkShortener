# Link Shortener — Project Context

## Mô tả
Ứng dụng rút gọn link dạng Public SaaS, miễn phí hoàn toàn. Mục đích: học tập + portfolio.

## Tech Stack
- **Framework:** Next.js 14+ App Router + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Cache:** Vercel KV (Redis) — dùng cho Edge redirect
- **Auth:** NextAuth.js (Google + GitHub OAuth)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## Kiến trúc quan trọng
Redirect xử lý tại **Vercel Edge Middleware** (`middleware.ts`):
- Đọc slug từ URL → tra Vercel KV → redirect 301 ngay tại edge (không qua Next.js server)
- Nếu KV miss → fallback về `/app/[slug]/` để sync từ DB

## Design Spec
Xem chi tiết tại: `docs/superpowers/specs/2026-03-26-link-shortener-design.md`

## Quy tắc cho tất cả agents
- Viết code bằng **TypeScript** (strict mode)
- Dùng **App Router** (không dùng Pages Router)
- Mọi API route phải validate input với **Zod**
- Prisma client chỉ khởi tạo một lần tại `lib/db.ts`
- Vercel KV client tại `lib/kv.ts`
- Slug generator tại `lib/utils.ts`
- Không hard-code bất kỳ secret nào — dùng `.env.local`
- Tất cả route cần auth phải check session (NextAuth `getServerSession`)

## Cấu trúc thư mục
```
app/
  [slug]/        — Fallback redirect handler
  dashboard/     — Protected: quản lý link
  api/links/     — CRUD links
  api/analytics/ — Analytics
  api/auth/      — NextAuth
  login/         — Trang đăng nhập
  page.tsx       — Landing page
middleware.ts    — Edge redirect (QUAN TRỌNG)
prisma/schema.prisma
lib/db.ts
lib/kv.ts
lib/utils.ts
components/
```

## Tính năng cần implement
1. Edge Middleware redirect (slug → KV → 301)
2. Tạo link (auto slug + custom alias) + lưu DB + sync KV
3. Auth (NextAuth Google/GitHub)
4. Dashboard quản lý link
5. Analytics (click, device, country, thời gian)
6. QR code generator
7. Landing page

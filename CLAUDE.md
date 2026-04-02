# Link Shortener — Project Context

## Mô tả
Ứng dụng rút gọn link dạng Public SaaS, miễn phí hoàn toàn. Mục đích: học tập + portfolio.

## Tech Stack
- **Framework:** Next.js 14+ App Router + TypeScript (strict)
- **Database:** PostgreSQL + Prisma v5.22.0 (`engineType = "library"`)
- **Cache:** Vercel KV (Upstash REST) — Edge redirect
- **Auth:** NextAuth v4 (Google + GitHub OAuth, JWT strategy)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel (account `baoquyyys-projects`)

## Kiến trúc quan trọng
Redirect xử lý tại **Vercel Edge Middleware** (`middleware.ts`):
- Đọc slug từ URL → tra Vercel KV → redirect 301 ngay tại edge
- Nếu KV miss → fallback về `/app/[slug]/` để sync từ DB
- Auth bypass local: `DISABLE_AUTH=true` trong `.env.local` (KHÔNG dùng NODE_ENV check)

## Key files
| File | Vai trò |
|------|---------|
| `middleware.ts` | Edge redirect + auth gate |
| `lib/api-auth.ts` | Session + API key auth |
| `lib/rate-limit.ts` | Vercel KV rate limiting |
| `lib/links-cache.ts` | Module-level SWR cache (`setLinksCache` khi delete, không dùng `invalidateLinksCache`) |
| `lib/dev-session.ts` | Dev user seed + session mock |
| `lib/logger.ts` | Structured logging |
| `lib/alerts.ts` | Webhook alerts |

## Coding rules
- Viết code bằng **TypeScript** strict — không dùng `any`
- Dùng **App Router** (không Pages Router)
- Mọi API route validate input với **Zod**
- Prisma client chỉ khởi tạo một lần tại `lib/db.ts`
- Không hard-code secret — dùng `.env.local`
- Mọi route cần auth: check session qua `getAuthUser()` từ `lib/api-auth.ts`
- Delete/update link: dùng `setLinksCache(updated)` — KHÔNG dùng `invalidateLinksCache()`

## UI rules
- Không dùng `confirm()` — dùng inline confirm state
- Không dùng emoji làm icon — dùng Lucide SVG
- Touch target tối thiểu 40px
- Destructive actions phải có 2-step confirm (click → "Confirm / Cancel")

## Quy trình làm việc của Claude

### Trước khi bắt đầu task
1. Đọc file liên quan — nếu đã đọc trong session thì KHÔNG đọc lại
2. Với UI task: xác định component bị ảnh hưởng trước khi code

### Sau khi edit code
1. TypeScript tự check qua hook (xem settings.json)
2. Với UI change: chụp screenshot preview để verify — không báo xong khi chưa verify
3. Root cause 1 dòng trước khi fix bug

### Test UI đúng cách
- Dùng `preview_click` / `preview_fill` để click thật — không chỉ test bằng `fetch()`
- Resize viewport ≥ 1280px trước khi screenshot layout
- Scroll qua tất cả section khi kiểm tra trang mới

### Không làm
- Đọc lại file đã đọc trong cùng session
- Giải thích dài khi user chỉ muốn code chạy (trừ khi được hỏi)
- Dùng `confirm()`, emoji icon, `invalidateLinksCache()`
- Push code chưa pass TypeScript check

## Cấu trúc thư mục
```
app/
  [slug]/          — Fallback redirect handler
  dashboard/       — Protected dashboard
  api/links/       — CRUD links
  api/analytics/   — Analytics
  api/auth/        — NextAuth
  preview/         — Landing page preview (Contemporary design)
  preview-material/— Landing page preview (Material 3 lavender)
  login/           — Login page
  page.tsx         — Landing page (production)
middleware.ts      — Edge redirect (QUAN TRỌNG)
prisma/schema.prisma
lib/
components/
```

## Tính năng đã implement (hoàn chỉnh)
- [x] Edge Middleware redirect (slug → KV → 301)
- [x] Tạo link (auto slug + custom alias) + lưu DB + sync KV
- [x] Auth (NextAuth Google/GitHub) + API key (SHA-256 hashed)
- [x] Dashboard quản lý link (create/edit/delete/copy/QR)
- [x] Analytics (click, device, country, referrer, CSV export)
- [x] QR code generator (SVG)
- [x] Landing page
- [x] Rate limiting (Vercel KV)
- [x] Logging + Alerts (webhook)
- [x] DB indexes
- [x] Settings (profile, timezone, API key regenerate)

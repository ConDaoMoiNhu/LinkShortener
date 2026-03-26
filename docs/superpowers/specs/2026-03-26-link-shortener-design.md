# Link Shortener — Design Spec
**Ngày:** 2026-03-26
**Trạng thái:** Draft

---

## Tổng quan

Một ứng dụng rút gọn link dạng Public SaaS, miễn phí hoàn toàn, phục vụ mục đích học tập và portfolio.

---

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend + Backend | Next.js 14+ (App Router) + TypeScript |
| Database | PostgreSQL (Prisma ORM) |
| Cache / Edge Store | Vercel KV (Redis) |
| Auth | NextAuth.js (Google + GitHub OAuth) |
| Deployment | Vercel (subdomain `yourapp.vercel.app`) |
| Styling | Tailwind CSS |

---

## Kiến trúc (Option C — Edge Middleware + KV Cache)

```
┌─────────────────────────────────────────┐
│              Vercel Edge Network         │
│  middleware.ts — xử lý redirect tại CDN  │
│  (đọc slug → lookup Vercel KV → redirect)│
└────────────────┬────────────────────────┘
                 │ (nếu không tìm thấy trong KV)
                 ▼
┌─────────────────────────────────────────┐
│           Next.js App Router            │
│  /app — Dashboard, Auth, Landing page   │
│  /api  — CRUD links, analytics, users   │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
  PostgreSQL          Vercel KV
  (Prisma ORM)        (Redis cache)
  - users             - slug → url map
  - links             - click counter cache
  - analytics
```

---

## Luồng hoạt động

### Redirect (đường chính)
1. User truy cập `yourapp.vercel.app/abc123`
2. Edge Middleware bắt request, tra slug trong **Vercel KV** (< 10ms)
3. Nếu có → redirect 301 ngay tại edge
4. Nếu không có → forward về Next.js → 404 hoặc sync từ DB vào KV

### Tạo link
1. User đăng nhập (NextAuth — Google/GitHub)
2. Nhập URL dài + alias tùy chọn → `POST /api/links`
3. Lưu vào PostgreSQL + sync vào Vercel KV
4. Trả về short URL + QR code

---

## Tính năng

### Core
- [ ] Rút gọn URL (auto-generate slug ngẫu nhiên)
- [ ] Custom alias (user tự đặt slug)
- [ ] Redirect nhanh qua Edge Middleware
- [ ] QR code cho mỗi link

### Auth & Dashboard
- [ ] Đăng nhập bằng Google / GitHub (NextAuth.js)
- [ ] Dashboard quản lý danh sách link
- [ ] Xóa / chỉnh sửa link
- [ ] Xem thống kê từng link

### Analytics
- [ ] Đếm số click
- [ ] Thống kê theo thiết bị (mobile/desktop)
- [ ] Thống kê theo quốc gia/vị trí
- [ ] Biểu đồ click theo thời gian

### Public
- [ ] Landing page giới thiệu
- [ ] Rút gọn link không cần đăng nhập (giới hạn tính năng)

---

## Database Schema (sơ bộ)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  image     String?
  links     Link[]
  createdAt DateTime @default(now())
}

model Link {
  id          String   @id @default(cuid())
  slug        String   @unique
  originalUrl String
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
  clicks      Click[]
  createdAt   DateTime @default(now())
  expiresAt   DateTime?
}

model Click {
  id        String   @id @default(cuid())
  linkId    String
  link      Link     @relation(fields: [linkId], references: [id])
  country   String?
  device    String?
  createdAt DateTime @default(now())
}
```

---

## Cấu trúc thư mục

```
link-shortener/
├── app/
│   ├── [slug]/          # Fallback nếu KV miss
│   ├── dashboard/       # Quản lý link (protected)
│   ├── api/
│   │   ├── links/       # CRUD links
│   │   ├── analytics/   # Analytics data
│   │   └── auth/        # NextAuth handlers
│   ├── login/
│   └── page.tsx         # Landing page
├── middleware.ts         # Edge redirect logic
├── prisma/
│   └── schema.prisma
├── lib/
│   ├── db.ts            # Prisma client
│   ├── kv.ts            # Vercel KV client
│   └── utils.ts         # Slug generator, QR code
├── components/
└── docs/
    └── superpowers/specs/
```

---

## Môi trường biến (Environment Variables)

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_ID=
GITHUB_SECRET=
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

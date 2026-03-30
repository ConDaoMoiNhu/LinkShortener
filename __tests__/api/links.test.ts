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

vi.mock("@/lib/dev-session", () => ({
  getSessionOrDev: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(() => ({ allowed: true, remaining: 9, retryAfterMs: 0 })),
}));

import { POST, GET } from "@/app/api/links/route";
import { db } from "@/lib/db";
import { getSessionOrDev } from "@/lib/dev-session";
import { NextRequest } from "next/server";

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/links", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/links", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(getSessionOrDev).mockResolvedValue(null);
    const req = makeRequest({ originalUrl: "https://example.com" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid URL", async () => {
    vi.mocked(getSessionOrDev).mockResolvedValue({ user: { id: "test-user" } } as any);
    const req = makeRequest({ originalUrl: "not-a-url" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 409 if slug already exists", async () => {
    vi.mocked(getSessionOrDev).mockResolvedValue({ user: { id: "test-user" } } as any);
    vi.mocked(db.link.findUnique).mockResolvedValue({ id: "1" } as any);
    const req = makeRequest({ originalUrl: "https://example.com", customSlug: "taken" });
    const res = await POST(req);
    expect(res.status).toBe(409);
  });

  it("creates link and returns 201", async () => {
    vi.mocked(getSessionOrDev).mockResolvedValue({ user: { id: "test-user" } } as any);
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
    vi.mocked(getSessionOrDev).mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/links");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});

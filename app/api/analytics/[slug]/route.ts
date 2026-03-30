import { NextRequest, NextResponse } from "next/server";
import { getSessionOrDev } from "@/lib/dev-session";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getSessionOrDev(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const link = await db.link.findUnique({
    where: { slug },
    include: {
      _count: { select: { clicks: true } },
      clicks: {
        orderBy: { createdAt: "desc" },
        select: { country: true, device: true, referer: true, createdAt: true },
      },
    },
  });

  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const userId = session.user.id ?? null;
  if (process.env.NODE_ENV !== "development" && link.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const totalClicks = link._count.clicks;

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

  const byDate = link.clicks.reduce<Record<string, number>>((acc, c) => {
    const date = c.createdAt.toISOString().split("T")[0];
    acc[date] = (acc[date] ?? 0) + 1;
    return acc;
  }, {});

  const byReferer = link.clicks.reduce<Record<string, number>>((acc, c) => {
    const src = c.referer ?? "direct";
    acc[src] = (acc[src] ?? 0) + 1;
    return acc;
  }, {});

  // Growth: compare last 7 days vs previous 7 days
  const now = new Date();
  const d7 = new Date(now); d7.setDate(now.getDate() - 7);
  const d14 = new Date(now); d14.setDate(now.getDate() - 14);
  const last7 = link.clicks.filter(c => c.createdAt >= d7).length;
  const prev7 = link.clicks.filter(c => c.createdAt >= d14 && c.createdAt < d7).length;
  const weekGrowth = prev7 === 0 ? null : Math.round(((last7 - prev7) / prev7) * 100);

  return NextResponse.json({ totalClicks, byDevice, byCountry, byDate, byReferer, weekGrowth });
}

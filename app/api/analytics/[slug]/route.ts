import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

const MAX_CLICKS_QUERY = 1000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getAuthUser(request);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const link = await db.link.findUnique({
      where: { slug },
      include: {
        _count: { select: { clicks: true } },
      },
    });

    if (!link) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const userId = session.user.id;
    if (process.env.NODE_ENV !== "development" && link.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Paginated click fetch — prevents OOM for popular links
    const clicks = await db.click.findMany({
      where: { linkId: link.id },
      orderBy: { createdAt: "desc" },
      take: MAX_CLICKS_QUERY,
      select: { country: true, device: true, referer: true, createdAt: true },
    });

    const totalClicks = link._count.clicks;

    const byDevice = clicks.reduce<Record<string, number>>((acc, c) => {
      const d = c.device ?? "unknown";
      acc[d] = (acc[d] ?? 0) + 1;
      return acc;
    }, {});

    const byCountry = clicks.reduce<Record<string, number>>((acc, c) => {
      const country = c.country ?? "unknown";
      acc[country] = (acc[country] ?? 0) + 1;
      return acc;
    }, {});

    const byDate = clicks.reduce<Record<string, number>>((acc, c) => {
      const date = c.createdAt.toISOString().split("T")[0];
      acc[date] = (acc[date] ?? 0) + 1;
      return acc;
    }, {});

    const byReferer = clicks.reduce<Record<string, number>>((acc, c) => {
      const src = c.referer ?? "direct";
      acc[src] = (acc[src] ?? 0) + 1;
      return acc;
    }, {});

    // Growth: compare last 7 days vs previous 7 days
    const now = new Date();
    const d7 = new Date(now); d7.setDate(now.getDate() - 7);
    const d14 = new Date(now); d14.setDate(now.getDate() - 14);
    const last7 = clicks.filter(c => c.createdAt >= d7).length;
    const prev7 = clicks.filter(c => c.createdAt >= d14 && c.createdAt < d7).length;
    const weekGrowth = prev7 === 0 ? null : Math.round(((last7 - prev7) / prev7) * 100);

    return NextResponse.json({ totalClicks, byDevice, byCountry, byDate, byReferer, weekGrowth });
  } catch (err) {
    logger.error("GET /api/analytics/[slug] failed", { slug, error: err });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

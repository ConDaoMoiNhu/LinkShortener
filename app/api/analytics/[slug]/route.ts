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
      select: { country: true, device: true, referer: true, createdAt: true, visitorId: true },
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

    // Unique visitors: distinct non-null visitorIds in the sample window
    const uniqueVisitors = new Set(
      clicks.map(c => c.visitorId).filter(Boolean)
    ).size;

    // Avg clicks per day: totalClicks / days since link was created (min 1 day)
    const daysSinceCreated = Math.max(
      1,
      Math.ceil((Date.now() - new Date(link.createdAt).getTime()) / 86_400_000)
    );
    const avgClicksPerDay = parseFloat((totalClicks / daysSinceCreated).toFixed(1));

    // Growth: dedicated DB queries so the result is exact even for links with >1000 clicks
    const now = new Date();
    const d7 = new Date(now); d7.setDate(now.getDate() - 7);
    const d14 = new Date(now); d14.setDate(now.getDate() - 14);
    const [last7, prev7] = await Promise.all([
      db.click.count({ where: { linkId: link.id, createdAt: { gte: d7 } } }),
      db.click.count({ where: { linkId: link.id, createdAt: { gte: d14, lt: d7 } } }),
    ]);
    const weekGrowth = prev7 === 0 ? null : Math.round(((last7 - prev7) / prev7) * 100);

    return NextResponse.json({
      totalClicks, byDevice, byCountry, byDate, byReferer,
      weekGrowth, uniqueVisitors, avgClicksPerDay,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error("GET /api/analytics/[slug] failed", { slug, error: msg });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

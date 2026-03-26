import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const link = await db.link.findUnique({
    where: { slug },
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

  // Time-series: group by ngày (UTC)
  const byDate = link.clicks.reduce<Record<string, number>>((acc, c) => {
    const date = c.createdAt.toISOString().split("T")[0]; // "YYYY-MM-DD"
    acc[date] = (acc[date] ?? 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({ totalClicks, byDevice, byCountry, byDate });
}

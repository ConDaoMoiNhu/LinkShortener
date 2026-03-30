import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { setSlugUrl } from "@/lib/kv";
import { logger } from "@/lib/logger";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;

  const link = await db.link.findUnique({
    where: { slug },
  });

  if (!link) notFound();

  // Check expiry — expired links should not redirect
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    notFound();
  }

  // Sync lại vào KV để lần sau edge middleware bắt được
  try {
    await setSlugUrl(link.slug, link.originalUrl);
  } catch {
    // KV sync failure is non-critical
  }

  // Ghi nhận click (tracking failure must not block redirect)
  try {
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") ?? "";
    const country = headersList.get("x-vercel-ip-country") ?? null;
    const device = /mobile/i.test(userAgent) ? "mobile" : "desktop";
    const rawReferer = headersList.get("referer") ?? null;
    let referer: string | null = null;
    if (rawReferer) {
      try { referer = new URL(rawReferer).hostname.replace(/^www\./, ""); }
      catch { referer = null; }
    }

    await db.click.create({
      data: { linkId: link.id, country, device, referer },
    });
  } catch (err) {
    logger.warn("Click tracking failed on slug page", { slug, error: err });
  }

  redirect(link.originalUrl);
}

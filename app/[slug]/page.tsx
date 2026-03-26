import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { setSlugUrl } from "@/lib/kv";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;

  const link = await db.link.findUnique({
    where: { slug },
  });

  if (!link) notFound();

  // Sync lại vào KV để lần sau edge middleware bắt được
  await setSlugUrl(link.slug, link.originalUrl);

  // Ghi nhận click (path này không qua middleware)
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") ?? "";
  const country = headersList.get("x-vercel-ip-country") ?? null;
  const device = /mobile/i.test(userAgent) ? "mobile" : "desktop";

  await db.click.create({
    data: { linkId: link.id, country, device },
  });

  redirect(link.originalUrl);
}

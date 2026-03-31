import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import SettingsClient from "./SettingsClient";

const DEV_USER = {
  id: "dev-user-local",
  name: "Dev User",
  email: "dev@localhost",
  image: null,
  location: null as string | null,
  timezone: null as string | null,
};

function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

async function getOrCreateApiKey(userId: string): Promise<string> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { apiKey: true } });

  if (user?.apiKey) {
    return "sk_live_" + "*".repeat(48);
  }

  const newKey = "sk_live_" + crypto.randomBytes(24).toString("hex");
  const hashedKey = hashApiKey(newKey);
  try {
    await db.user.upsert({
      where: { id: userId },
      update: { apiKey: hashedKey },
      create: { id: userId, email: userId + "@example.com", name: "Autoseed User", apiKey: hashedKey },
    });
  } catch {}
  return newKey;
}

export default async function SettingsPage() {
  if (process.env.NODE_ENV === "development") {
    const apiKey = await getOrCreateApiKey(DEV_USER.id);
    return <SettingsClient user={DEV_USER} apiKey={apiKey} />;
  }
  await headers();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const [apiKey, dbUser] = await Promise.all([
    getOrCreateApiKey(session.user.id),
    db.user.findUnique({
      where: { id: session.user.id },
      select: { location: true, timezone: true },
    }),
  ]);

  return (
    <SettingsClient
      user={{
        ...session.user,
        location: dbUser?.location ?? null,
        timezone: dbUser?.timezone ?? null,
      }}
      apiKey={apiKey}
    />
  );
}

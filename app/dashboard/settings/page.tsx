import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import SettingsClient from "./SettingsClient";

const DEV_USER = { id: "dev-user-local", name: "Dev User", email: "dev@localhost", image: null };

async function getOrCreateApiKey(userId: string): Promise<string> {
  let user = await db.user.findUnique({ where: { id: userId }, select: { apiKey: true } });
  
  if (user && user.apiKey) return user.apiKey;
  
  const newKey = "sk_live_" + crypto.randomBytes(24).toString("hex");
  try {
    await db.user.upsert({
      where: { id: userId },
      update: { apiKey: newKey },
      create: { id: userId, email: userId + "@example.com", name: "Autoseed User", apiKey: newKey },
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
  if (!session?.user?.id) return null; // or redirect logic via middleware

  const apiKey = await getOrCreateApiKey(session.user.id);
  return <SettingsClient user={session.user} apiKey={apiKey} />;
}

import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { createHmac } from "crypto";
import { authOptions } from "@/lib/auth";
import SettingsClient from "./SettingsClient";

const DEV_USER = { name: "Dev User", email: "dev@localhost", image: null };

function generateApiKey(userId: string): string {
  const secret = process.env.NEXTAUTH_SECRET ?? "dev-secret";
  return "sk_live_" + createHmac("sha256", secret).update(userId).digest("hex").slice(0, 32);
}

export default async function SettingsPage() {
  if (process.env.NODE_ENV === "development") {
    const apiKey = generateApiKey("dev-user-id");
    return <SettingsClient user={DEV_USER} apiKey={apiKey} />;
  }
  await headers();
  const session = await getServerSession(authOptions);
  const apiKey = generateApiKey(session?.user?.id ?? session?.user?.email ?? "unknown");
  return <SettingsClient user={session?.user ?? {}} apiKey={apiKey} />;
}

import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { authOptions } from "@/lib/auth";
import SettingsClient from "./SettingsClient";

const DEV_USER = { name: "Dev User", email: "dev@localhost", image: null };

export default async function SettingsPage() {
  if (process.env.NODE_ENV === "development") {
    return <SettingsClient user={DEV_USER} />;
  }
  await headers();
  const session = await getServerSession(authOptions);
  return <SettingsClient user={session!.user} />;
}

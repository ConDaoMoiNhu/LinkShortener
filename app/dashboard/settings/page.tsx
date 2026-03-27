import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  // layout.tsx already guards auth
  return <SettingsClient user={session!.user} />;
}

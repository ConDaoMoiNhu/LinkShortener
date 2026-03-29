import { getAuthUser } from "@/lib/auth";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const user = await getAuthUser();
  return <SettingsClient user={user!} />;
}

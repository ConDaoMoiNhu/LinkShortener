import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardClient from "../DashboardClient";

export default async function LinksPage() {
  const session = await getServerSession(authOptions);
  return <DashboardClient user={session!.user} />;
}

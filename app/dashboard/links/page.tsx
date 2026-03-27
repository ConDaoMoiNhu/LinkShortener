import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardClient from "../DashboardClient";

const DEV_USER = { name: "Dev User", email: "dev@localhost", image: null };

export default async function LinksPage() {
  if (process.env.NODE_ENV === "development") {
    return <DashboardClient user={DEV_USER} />;
  }
  const session = await getServerSession(authOptions);
  return <DashboardClient user={session!.user} />;
}

import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { authOptions } from "@/lib/auth";
import DashboardLayout from "./DashboardLayout";

const DEV_USER = { name: "Dev User", email: "dev@localhost", image: null };

export default async function Layout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "development") {
    return <DashboardLayout user={DEV_USER}>{children}</DashboardLayout>;
  }
  // Middleware already guards /dashboard — session is always valid here.
  // await headers() warms up the async cache for Next.js 15+.
  await headers();
  const session = await getServerSession(authOptions);
  return <DashboardLayout user={session?.user ?? DEV_USER}>{children}</DashboardLayout>;
}

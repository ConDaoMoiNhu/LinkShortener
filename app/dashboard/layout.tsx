import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import DashboardLayout from "./DashboardLayout";

const DEV_USER = { name: "Dev User", email: "dev@localhost", image: null };

export default async function Layout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "development") {
    return <DashboardLayout user={DEV_USER}>{children}</DashboardLayout>;
  }
  await headers();
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  return <DashboardLayout user={session.user}>{children}</DashboardLayout>;
}

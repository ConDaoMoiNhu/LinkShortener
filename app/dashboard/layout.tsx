import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import DashboardLayout from "./DashboardLayout";

const DEV_USER = {
  name: "Dev User",
  email: "dev@localhost",
  image: null,
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  // Allow access without login in development mode
  if (process.env.NODE_ENV === "development") {
    return <DashboardLayout user={DEV_USER}>{children}</DashboardLayout>;
  }

  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/dashboard");

  return <DashboardLayout user={session.user}>{children}</DashboardLayout>;
}

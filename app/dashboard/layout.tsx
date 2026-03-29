import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import DashboardLayout from "./DashboardLayout";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!user) redirect("/login?callbackUrl=/dashboard");
  return <DashboardLayout user={user}>{children}</DashboardLayout>;
}

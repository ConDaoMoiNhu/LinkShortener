import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  // layout.tsx already guards auth; session is guaranteed here
  return <DashboardClient user={session!.user} />;
}

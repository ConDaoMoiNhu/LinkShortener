import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { authOptions } from "@/lib/auth";

export async function getSessionOrDev() {
  if (process.env.NODE_ENV === "development") {
    return { user: { id: null as unknown as string, name: "Dev User", email: "dev@localhost" } };
  }
  // Next.js 15+ workaround: await headers() to warm up async cache
  // so getServerSession can read cookies synchronously inside
  await headers();
  return getServerSession(authOptions);
}

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers, cookies } from "next/headers";

const handler = NextAuth(authOptions);

export async function GET(req: any, ctx: any) {
  await headers();
  await cookies();
  return handler(req, ctx);
}

export async function POST(req: any, ctx: any) {
  await headers();
  await cookies();
  return handler(req, ctx);
}

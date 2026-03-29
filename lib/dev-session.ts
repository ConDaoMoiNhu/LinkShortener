import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function getSessionOrDev(req?: NextRequest) {
  if (process.env.NODE_ENV === "development") {
    return { user: { id: null as unknown as string, name: "Dev User", email: "dev@localhost" } };
  }
  if (!req) return null;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return null;
  return {
    user: {
      id: token.id as string,
      name: (token.name as string) ?? null,
      email: (token.email as string) ?? null,
    },
  };
}

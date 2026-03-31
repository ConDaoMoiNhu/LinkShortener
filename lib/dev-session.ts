import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

const DEV_USER_ID = "dev-user-local";

import { db } from "./db";

// Module-level flag — seeds dev user only once per cold start, not on every request
let devUserSeeded = false;

export async function getSessionOrDev(req?: NextRequest) {
  if (process.env.NODE_ENV === "development") {
    if (!devUserSeeded) {
      try {
        await db.user.upsert({
          where: { id: DEV_USER_ID },
          update: {},
          create: {
            id: DEV_USER_ID,
            name: "Dev User",
            email: "dev@localhost",
          },
        });
        devUserSeeded = true;
      } catch {
        // Ignore seeding errors
      }
    }
    return { user: { id: DEV_USER_ID, name: "Dev User", email: "dev@localhost" } };
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

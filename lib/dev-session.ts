import { getToken } from "next-auth/jwt";
import { cookies } from "next/headers";

export async function getSessionOrDev() {
  if (process.env.NODE_ENV === "development") {
    return { user: { id: null as unknown as string, name: "Dev User", email: "dev@localhost" } };
  }

  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join("; ");
  const cookieObj = Object.fromEntries(allCookies.map(c => [c.name, c.value]));

  const token = await getToken({
    req: { headers: { cookie: cookieHeader }, cookies: cookieObj } as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) return null;
  return { user: { id: token.id as string, name: token.name, email: token.email } };
}

import { decode } from "next-auth/jwt";
import { cookies } from "next/headers";

export async function getSessionOrDev() {
  if (process.env.NODE_ENV === "development") {
    return { user: { id: null as unknown as string, name: "Dev User", email: "dev@localhost" } };
  }

  const cookieStore = await cookies();
  const isSecure = process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;
  const cookieName = `${isSecure ? "__Secure-" : ""}next-auth.session-token`;
  const sessionToken = cookieStore.get(cookieName)?.value;

  if (!sessionToken) return null;

  const token = await decode({
    token: sessionToken,
    secret: process.env.NEXTAUTH_SECRET!,
  });

  if (!token) return null;
  return { user: { id: token.id as string, name: token.name, email: token.email } };
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// In development, bypass OAuth and use a local anonymous user
// Links are created with userId = null so no FK constraint is needed
export const DEV_USER_ID = null as null; // anonymous dev links

export async function getSessionOrDev() {
  if (process.env.NODE_ENV === "development") {
    return { user: { id: null as unknown as string, name: "Dev User", email: "dev@localhost" } };
  }
  return getServerSession(authOptions);
}

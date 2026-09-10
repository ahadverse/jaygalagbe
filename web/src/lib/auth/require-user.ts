import { redirect } from "next/navigation";
import { getCurrentUser } from "./session";
import type { AuthUser } from "./types";

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

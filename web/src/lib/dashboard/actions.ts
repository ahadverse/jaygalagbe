"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  DASHBOARD_VIEW_COOKIE,
  isDashboardView,
  type DashboardView,
} from "./view";

const VIEW_MAX_AGE = 60 * 60 * 24 * 365; // A preference, not a session.

export async function setDashboardView(view: DashboardView): Promise<void> {
  if (!isDashboardView(view)) return;

  const store = await cookies();
  store.set(DASHBOARD_VIEW_COOKIE, view, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: VIEW_MAX_AGE,
  });

  // The nav lives in the layout and the sections in the page, so both have to
  // re-render for a switch to land.
  revalidatePath("/dashboard", "layout");
}

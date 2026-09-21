"use server";

import { apiUrl, isValidId } from "@/lib/api/config";
import { readError } from "@/lib/api/errors";
import { getToken } from "@/lib/auth/session";
import { REPORT_NOTE_MAX, isReportReasonCode } from "./reasons";

export type ReportAdState = { error?: string; success?: boolean };

export async function reportAdAction(
  _prevState: ReportAdState,
  formData: FormData,
): Promise<ReportAdState> {
  const adId = formData.get("adId")?.toString();
  const reasonCode = formData.get("reasonCode")?.toString();
  const note = String(formData.get("note") ?? "").trim();

  if (!isValidId(adId)) {
    return { error: "This listing could not be identified." };
  }
  if (!isReportReasonCode(reasonCode)) {
    return { error: "Pick a reason for the report." };
  }
  // A bare "Something else" gives the moderator nothing to act on.
  if (reasonCode === "OTHER" && !note) {
    return { error: "Tell us what is wrong so our team can look into it." };
  }
  if (note.length > REPORT_NOTE_MAX) {
    return { error: `Keep the details under ${REPORT_NOTE_MAX} characters.` };
  }

  const token = await getToken();
  if (!token) {
    return { error: "You need to be logged in to report a listing." };
  }

  try {
    const response = await fetch(apiUrl`/ads/${adId}/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reasonCode, note: note || undefined }),
    });

    if (!response.ok) {
      // The backend already explains the refusals worth showing: own listing,
      // and a report this person has open on it already.
      return { error: await readError(response, "Couldn't send the report.") };
    }

    return { success: true };
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }
}

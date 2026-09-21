/** Mirrors `ReportReasonCode` on the backend. */
export const REPORT_REASONS = [
  {
    code: "FAKE_LISTING",
    label: "Fake listing",
    hint: "The property does not exist or the photos belong to somewhere else.",
  },
  {
    code: "SCAM",
    label: "Scam or fraud",
    hint: "The advertiser is asking for an advance or a fee before any visit.",
  },
  {
    code: "ALREADY_SOLD",
    label: "Already sold or rented",
    hint: "The property is gone but the listing is still up.",
  },
  {
    code: "WRONG_INFORMATION",
    label: "Wrong information",
    hint: "The price, size or location does not match the real property.",
  },
  {
    code: "DUPLICATE",
    label: "Duplicate listing",
    hint: "The same property is posted more than once.",
  },
  {
    code: "OFFENSIVE",
    label: "Offensive content",
    hint: "The text or photos are abusive or inappropriate.",
  },
  {
    code: "OTHER",
    label: "Something else",
    hint: "Describe the problem in your own words.",
  },
] as const;

export type ReportReasonCode = (typeof REPORT_REASONS)[number]["code"];

/** Mirrors the `MaxLength(500)` on the backend's report DTO. */
export const REPORT_NOTE_MAX = 500;

export function isReportReasonCode(value: unknown): value is ReportReasonCode {
  return REPORT_REASONS.some((reason) => reason.code === value);
}

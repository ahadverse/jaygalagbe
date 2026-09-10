export const boostTiers = [
  { value: "THREE_DAY", label: "3 days", priceBdt: 300 },
  { value: "SEVEN_DAY", label: "7 days", priceBdt: 600 },
  { value: "FIFTEEN_DAY", label: "15 days", priceBdt: 1000 },
] as const;

export const paymentGateways = [
  { value: "BKASH", label: "bKash" },
  { value: "NAGAD", label: "Nagad" },
  { value: "CARD", label: "Card" },
] as const;

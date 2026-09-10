const priceFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

export function formatPrice(price: string | number): string {
  return `৳ ${priceFormatter.format(Number(price))}`;
}

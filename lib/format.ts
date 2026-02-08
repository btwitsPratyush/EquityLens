// formatting helpers used across components
// keeping them here so we don't repeat the same Intl stuff everywhere

export function inr(n: number | null): string {
  if (n == null) return "N/A";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(n);
}

export function pct(n: number | null): string {
  if (n == null) return "—";
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

export function num(n: number | null): string {
  if (n == null) return "N/A";
  return n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

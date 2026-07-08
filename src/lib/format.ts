/** Format a number as Bangladeshi Taka: "999 taka". */
export function formatBDT(amount: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount) + " taka";
}

/** Percentage discount between compare and base price. */
export function discountPercent(base: number, compare: number | null): number | null {
  if (!compare || compare <= base) return null;
  return Math.round(((compare - base) / compare) * 100);
}

/** Convert a string to a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Build absolute URL for OG images etc. */
export function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Star-rating summary -> { avg, count } */
export function ratingSummary(ratings: number[]): { avg: number; count: number } {
  if (!ratings.length) return { avg: 0, count: 0 };
  const sum = ratings.reduce((a, b) => a + b, 0);
  return { avg: Math.round((sum / ratings.length) * 10) / 10, count: ratings.length };
}

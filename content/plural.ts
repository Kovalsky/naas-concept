// Ukrainian plural selector — one (1, 21, 31…) / few (2–4, 22–24…) /
// many (0, 5–20, 11–14, 25–30…). Shared so every design counts correctly
// (e.g. "84 установи", not the simplified "84 установ").
export function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

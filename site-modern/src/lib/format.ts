// Localized Ukrainian date formatting (ICU-independent so the build is
// deterministic). Input is an ISO date string "YYYY-MM-DD".
const MONTHS_UK = [
  'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
  'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня',
];

export function formatDateUk(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
  if (!m) return iso || '';
  const [, y, mo, d] = m;
  const month = MONTHS_UK[Number(mo) - 1];
  if (!month) return iso;
  return `${Number(d)} ${month} ${y}`;
}

// Ukrainian plural picker: pluralUk(3, 'документ', 'документи', 'документів').
export function pluralUk(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

// Parse a Ukrainian long date ("30 квітня 2026") back into a Date (local midnight).
export function parseDateUk(s: string): Date | null {
  const m = /^(\d{1,2})\s+([а-яіїєґ]+)\s+(\d{4})/iu.exec((s || '').trim());
  if (!m) return null;
  const mi = MONTHS_UK.indexOf(m[2].toLowerCase());
  if (mi === -1) return null;
  return new Date(Number(m[3]), mi, Number(m[1]));
}

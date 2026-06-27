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

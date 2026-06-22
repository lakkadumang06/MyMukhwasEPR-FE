import dayjs from 'dayjs';

/** ₹1,67,601.00 (Indian grouping) */
export function inr(n) {
  const v = Number(n) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(v);
}

/** plain number with Indian grouping */
export function num(n) {
  return new Intl.NumberFormat('en-IN').format(Number(n) || 0);
}

/** DD.MM.YYYY (matches the spreadsheet) */
export function date(d) {
  if (!d) return '';
  return dayjs(d).format('DD.MM.YYYY');
}

export function pct(n) {
  return `${(Number(n) || 0).toFixed(1)}%`;
}

import * as XLSX from 'xlsx';

/**
 * Column header aliases → our canonical field names. Matching is
 * case-insensitive and substring-based, so "Delivery Address (Name & Address)"
 * still maps to deliveryAddress.
 */
const HEADER_MAP = [
  ['orderDate', ['order date']],
  ['orderNumber', ['order number', 'order no', 'order id']],
  ['awbNumber', ['awb']],
  ['deliveryAddress', ['delivery address', 'address']],
  ['orderType', ['order type']],
  ['orderStatus', ['order status', 'status']],
  ['shippingCost', ['shipping cost', 'shipping charge', 'shiping']],
  ['orderCost', ['order cost']],
  ['noOfItems', ['no of items', 'no. of items', 'items']],
  ['manifestDate', ['manifest date', 'menifest date']],
];

function canonical(header) {
  const h = String(header || '').toLowerCase().trim();
  for (const [field, aliases] of HEADER_MAP) {
    if (aliases.some((a) => h.includes(a))) return field;
  }
  return null;
}

function toDate(v) {
  if (v == null || v === '') return null;
  if (v instanceof Date) return v;
  // Handle DD|MM|YYYY, DD/MM/YYYY, DD-MM-YYYY
  const m = String(v).match(/(\d{1,2})[|/\-.](\d{1,2})[|/\-.](\d{2,4})/);
  if (m) {
    const [, d, mo, y] = m;
    const yr = y.length === 2 ? `20${y}` : y;
    return new Date(Number(yr), Number(mo) - 1, Number(d));
  }
  const parsed = new Date(v);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toNum(v) {
  if (v == null || v === '') return 0;
  const n = Number(String(v).replace(/[^\d.-]/g, ''));
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Parse an uploaded xlsx/csv File into normalized DeliveryCharge rows.
 * Returns { rows, skipped, headerRow }.
 */
export async function parseDeliveryFile(file) {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { cellDates: true });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', blankrows: false });

  // Find the header row: the first row that maps at least an order date/number.
  let headerIdx = -1;
  let mapping = null;
  for (let i = 0; i < Math.min(matrix.length, 25); i += 1) {
    const row = matrix[i];
    const cols = row.map(canonical);
    const hasKey = cols.includes('orderNumber') || cols.includes('orderDate');
    const known = cols.filter(Boolean).length;
    if (hasKey && known >= 2) {
      headerIdx = i;
      mapping = cols;
      break;
    }
  }
  if (headerIdx === -1) {
    throw new Error('Could not find a header row (need Order Date / Order Number columns)');
  }

  const rows = [];
  let skipped = 0;
  for (let i = headerIdx + 1; i < matrix.length; i += 1) {
    const raw = matrix[i];
    if (!raw || raw.every((c) => c === '' || c == null)) continue;
    const rec = {};
    mapping.forEach((field, col) => {
      if (field) rec[field] = raw[col];
    });
    const orderDate = toDate(rec.orderDate);
    if (!orderDate) { skipped += 1; continue; }
    rows.push({
      orderDate,
      orderNumber: String(rec.orderNumber ?? '').trim(),
      awbNumber: String(rec.awbNumber ?? '').trim(),
      deliveryAddress: String(rec.deliveryAddress ?? '').trim(),
      orderType: String(rec.orderType ?? '').trim(),
      orderStatus: String(rec.orderStatus ?? '').trim(),
      shippingCost: toNum(rec.shippingCost),
      orderCost: toNum(rec.orderCost),
      noOfItems: toNum(rec.noOfItems),
      manifestDate: toDate(rec.manifestDate),
    });
  }
  return { rows, skipped, headerRow: headerIdx };
}

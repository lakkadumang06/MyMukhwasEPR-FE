/**
 * Entity display helpers — keep the "[Code] - [Name]" format consistent
 * everywhere (dropdowns, tables, BOM cards, invoices).
 */

/** "P001 - Premium Widget" (falls back gracefully if a part is missing). */
export function codeLabel(code, name) {
  if (!code) return name || '';
  return name ? `${code} - ${name}` : code;
}

/** Convenience builders for each core entity. */
export const productLabel = (p) =>
  p ? codeLabel(p.productCode, `${p.productName || p.productFamily || ''}${p.packSizeLabel ? ` ${p.packSizeLabel}` : ''}`.trim()) : '';
export const rmLabel = (rm) => (rm ? codeLabel(rm.rmCode, rm.name) : '');
export const vendorLabel = (v) => (v ? codeLabel(v.vendorCode, v.name) : '');
export const clientLabel = (c) => (c ? codeLabel(c.clientCode, c.businessName) : '');

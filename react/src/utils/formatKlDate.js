import { formatTableCellText, isTableCellBlank } from '../components/common/tableCellDisplay';

function parseKlDate(value) {
  if (value == null || value === '') return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

/**
 * yyyy-mm-dd — ko-KR locale trailing dot(2026. 06. 19.) 방지
 */
export function formatKlDate(value, { fallback = '—' } = {}) {
  const d = parseKlDate(value);
  if (!d) return fallback;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** yyyy-mm-dd HH:mm */
export function formatKlDateTime(value, { fallback = '—' } = {}) {
  const d = parseKlDate(value);
  if (!d) return fallback;
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${formatKlDate(d)} ${h}:${min}`;
}

/** yyyy-mm-dd HH:mm:ss */
export function formatKlDateTimeWithSeconds(value, { fallback = '—' } = {}) {
  const d = parseKlDate(value);
  if (!d) return fallback;
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const sec = String(d.getSeconds()).padStart(2, '0');
  return `${formatKlDate(d)} ${h}:${min}:${sec}`;
}

export function formatKlDateCell(value) {
  if (isTableCellBlank(value)) return formatTableCellText(value);
  return formatKlDate(value);
}

export function formatKlDateTimeCell(value) {
  if (isTableCellBlank(value)) return formatTableCellText(value);
  return formatKlDateTime(value);
}

export function formatKlDateTimeSecondsCell(value) {
  if (isTableCellBlank(value)) return formatTableCellText(value);
  return formatKlDateTimeWithSeconds(value);
}

import PropTypes from 'prop-types';

/** 빈 셀 표시 — 시스템 설정 `formatConfigValuePreview`와 동일 */
export const TABLE_CELL_BLANK = '—';

export function isTableCellBlank(value) {
  return value == null || String(value).trim() === '';
}

export function formatTableCellText(value) {
  if (isTableCellBlank(value)) return TABLE_CELL_BLANK;
  return String(value);
}

export function TableCellBlank({ className = '' }) {
  const rootClass = ['kl-table-cell-blank', className].filter(Boolean).join(' ');
  return (
    <span className={rootClass} aria-hidden="true">
      {TABLE_CELL_BLANK}
    </span>
  );
}

TableCellBlank.propTypes = {
  className: PropTypes.string,
};

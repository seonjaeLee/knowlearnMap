/** BasicTable 제어 열 — `control: 'radio' | 'checkbox'` */
export const BASIC_TABLE_CONTROL_TYPES = new Set(['radio', 'checkbox']);

export function isBasicTableControlColumn(column) {
  return Boolean(column?.control && BASIC_TABLE_CONTROL_TYPES.has(column.control));
}

/**
 * 라디오·체크박스 표시/선택 열 정의
 *
 * @param {object} opts
 * @param {'radio'|'checkbox'} opts.control
 * @param {(row: object) => boolean} [opts.getControlChecked]
 * @param {(row: object) => string} [opts.getControlAriaLabel]
 * @param {boolean} [opts.controlReadOnly=true] false면 native input + onControlChange
 * @param {(row: object) => boolean} [opts.getControlDisabled]
 * @param {(event, ctx: { row: object, rowIndex: number }) => void} [opts.onControlChange]
 */
export function basicTableControlColumnDef({
  control,
  getControlChecked,
  getControlAriaLabel,
  controlReadOnly = true,
  getControlDisabled,
  onControlChange,
  width = 48,
  align = 'center',
  ellipsis = false,
  ...rest
}) {
  return {
    control,
    getControlChecked,
    getControlAriaLabel,
    controlReadOnly,
    getControlDisabled,
    onControlChange,
    width: typeof width === 'number' ? `${width}px` : width,
    align,
    ellipsis,
    ...rest,
  };
}

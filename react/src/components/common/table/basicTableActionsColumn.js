/** BasicTable 관리 열 id — `actions` · `_actions` */
export const BASIC_TABLE_ACTIONS_COLUMN_IDS = new Set(['actions', '_actions']);

export function isBasicTableActionsColumn(columnId) {
  return BASIC_TABLE_ACTIONS_COLUMN_IDS.has(columnId);
}

/**
 * 관리 열 최소 너비(px) — 28px 버튼 · gap 4px · 셀 padding 32px
 * @see .cursor/rules/kl-table-actions-ui.mdc
 */
export function basicTableActionsColumnMinWidthPx(buttonCount = 2) {
  const n = Math.max(1, buttonCount);
  return 32 + n * 28 + (n - 1) * 4;
}

/** 편집+삭제 2버튼 기본 (92px) */
export const BASIC_TABLE_ACTIONS_WIDTH_2 = basicTableActionsColumnMinWidthPx(2);

/**
 * 관리 열 정의 헬퍼 — `useBasicTableColumnResize` definitions용
 * @param {object} opts
 * @param {'actions'|'_actions'} [opts.id='actions']
 * @param {number} [opts.buttonCount=2]
 */
export function basicTableActionsColumnDef({ id = 'actions', buttonCount = 2, ...rest } = {}) {
  const widthPx = basicTableActionsColumnMinWidthPx(buttonCount);
  return {
    id,
    label: '관리',
    defaultWidthPx: widthPx,
    minWidthPx: widthPx,
    actionsButtonCount: buttonCount,
    ellipsis: false,
    ...rest,
  };
}

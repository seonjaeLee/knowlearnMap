import { useMemo } from 'react';

/** 행 객체에 붙는 rowspan 메타 — `getRowSpanCellProps(row, columnId)`로 조회 */
export const ROW_SPAN_CELL_META = '__rowSpanCell';

/**
 * 연속된 동일 `groupField` 행에 대해 첫 행만 `rowSpan`, 나머지는 `skip`.
 * @param {object[]} rows — `groupField` 기준으로 이미 정렬·연속되어 있어야 함
 * @param {string} groupField — 행 객체의 그룹 키 (예: `'category'`)
 * @param {string} [cellColumnId] — `getBodyCellProps`에 넘길 열 id (기본: `groupField`와 동일)
 */
export function attachRowSpanMeta(rows, groupField, cellColumnId) {
    const colId = cellColumnId ?? groupField;
    if (!rows?.length) return [];

    return rows.map((row, index) => {
        const groupValue = row[groupField] ?? '';
        const prevGroup = index > 0 ? rows[index - 1][groupField] ?? '' : null;

        if (index > 0 && prevGroup === groupValue) {
            return {
                ...row,
                [ROW_SPAN_CELL_META]: {
                    ...(row[ROW_SPAN_CELL_META] || {}),
                    [colId]: { skip: true },
                },
            };
        }

        let rowSpan = 1;
        while (index + rowSpan < rows.length && (rows[index + rowSpan][groupField] ?? '') === groupValue) {
            rowSpan += 1;
        }

        return {
            ...row,
            [ROW_SPAN_CELL_META]: {
                ...(row[ROW_SPAN_CELL_META] || {}),
                [colId]: { rowSpan },
            },
        };
    });
}

/**
 * `BasicTable` `getBodyCellProps`에서 사용.
 * @returns {{ skip?: boolean, rowSpan?: number, style?: object, className?: string }}
 */
export function getRowSpanCellProps(row, columnId) {
    const meta = row?.[ROW_SPAN_CELL_META]?.[columnId];
    if (!meta) return {};
    if (meta.skip) return { skip: true };
    if (meta.rowSpan > 1) {
        return {
            rowSpan: meta.rowSpan,
            style: { verticalAlign: 'middle' },
            className: 'basic-table-body-cell--rowspan',
        };
    }
    if (meta.rowSpan) return { rowSpan: meta.rowSpan };
    return {};
}

/**
 * @param {object[]} rows
 * @param {string} groupField
 * @param {string} [cellColumnId]
 */
export function useTableRowSpanGroups(rows, groupField, cellColumnId) {
    const colId = cellColumnId ?? groupField;
    return useMemo(
        () => attachRowSpanMeta(rows, groupField, colId),
        [rows, groupField, colId]
    );
}

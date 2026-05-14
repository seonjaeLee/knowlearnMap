import PropTypes from 'prop-types';
import { Fragment } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import './BasicTable.global.css';
import styles from './BasicTable.module.scss';
import BasicTableFooter from './BasicTableFooter';
import BasicTablePaginationNav from './BasicTablePaginationNav';

function getRowKey(row, rowIndex) {
  if (row && Object.prototype.hasOwnProperty.call(row, 'id') && row.id != null) {
    return String(row.id);
  }
  return `row-${rowIndex}`;
}

function defaultCellValue(row, columnId) {
  if (row == null || columnId == null) return '';
  const v = row[columnId];
  if (v == null) return '';
  if (typeof v === 'string' || typeof v === 'number') return v;
  return '';
}

function columnCellStyle(col) {
  const style = {};
  if (col.width != null) style.width = col.width;
  if (col.align) style.textAlign = col.align;
  return Object.keys(style).length ? style : undefined;
}

/**
 * 공통 데이터 테이블 — 열 정의·행 데이터·셀 렌더만 props로 받습니다.
 * `renderCell`이 없거나 `undefined`/`null`을 반환하면 `row[column.id]`를 문자열·숫자로 표시합니다.
 *
 * @param {Array<{ id: string, label: React.ReactNode, width?: string|number, align?: 'left'|'center'|'right', ellipsis?: boolean }>} columns
 * @param {object[]} data
 * @param {(ctx: { column: object, row: object, rowIndex: number }) => React.ReactNode} [renderCell]
 * @param {(event: React.MouseEvent, ctx: { row: object, rowIndex: number }) => void} [onRowClick]
 * @param {(event: React.KeyboardEvent, ctx: { row: object, rowIndex: number }) => void} [onRowKeyDown]
 * @param {(row: object, rowIndex: number) => string} [getRowClassName]
 * @param {(boundaryIndex: number, event: React.MouseEvent) => void} [onColumnResizeMouseDown] — `useBasicTableColumnResize`의 `startResize` 연동
 * @param {(row: object) => string|undefined} [rowAriaLabel]
 *
 * 스타일(사용자 관리 기준): thead 행·th 높이 34px, tbody td 40px, 팔레트는 컴포넌트 내부 `--bt-*` 로 유지.
 * 가로 스크롤: 바깥 래퍼에 `basic-table-shell` + `overflow-x: auto`(얇은 스크롤바는 `km-scrollbar-thin.css`).
 * 목록 하단: `BasicTableFooter`, 페이지네이션은 `BasicTable.global.css` — `basic-table-pagination` + `basic-table-page-cluster`(번호 그룹) + `basic-table-page-btn`.
 * 선택: `tableFooter` — `enabled: true`이면 테이블 아래에 `BasicTableFooter`+`BasicTablePaginationNav`를 같이 렌더합니다. 가로 스크롤 셸(`basic-table-shell`)은 **테이블만** 감싸고 푸터는 밖에 두는 레이아웃을 권장합니다(그 경우 `tableFooter`는 `false`로 두고 페이지에서 `BasicTableFooter`를 별도 배치).
 * @param {false|object} [tableFooter] — `false`(기본) | `{ enabled?: boolean, summary?: React.ReactNode, end?: React.ReactNode, pagination: { page, totalPages, onPageChange } }`
 * @param {(ctx: { row: object, rowIndex: number }) => React.ReactNode} [renderRowDetail] — 반환값이 있으면 해당 데이터 행 바로 아래에 `colSpan` 서브행(아코디언 패널)을 렌더합니다. `null`/`false`면 생략합니다.
 */
function BasicTable({
  columns,
  data,
  renderCell,
  onRowClick,
  onRowKeyDown,
  getRowClassName,
  onColumnResizeMouseDown,
  rowAriaLabel,
  renderRowDetail,
  className = '',
  tableFooter = false,
}) {
  const rootClass = [styles.wrap, className].filter(Boolean).join(' ');

  const tableBlock = (
    <TableContainer component={Paper} className={rootClass} elevation={0}>
      <Table className={styles.table}>
        <TableHead>
          <TableRow className={styles.headRow}>
            {columns.map((col, colIndex) => {
              const hasResize =
                typeof col.resizeBoundaryAfter === 'number' && typeof onColumnResizeMouseDown === 'function';
              const headStyle = {
                ...columnCellStyle(col),
                ...(hasResize
                  ? { position: 'relative', overflow: 'visible', zIndex: 40 - colIndex }
                  : {}),
              };
              return (
                <TableCell
                  key={col.id}
                  component="th"
                  scope="col"
                  className={[styles.headCell, hasResize ? styles.headCellResizable : ''].filter(Boolean).join(' ')}
                  style={headStyle}
                >
                  <span className={styles.headCellLabel}>{col.label}</span>
                  {hasResize ? (
                    <span
                      className={styles.colResizeHandle}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onColumnResizeMouseDown(col.resizeBoundaryAfter, e);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      aria-hidden
                    />
                  ) : null}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => {
            const extraRowClass = getRowClassName?.(row, rowIndex) ?? '';
            const rowClass = [styles.row, extraRowClass].filter(Boolean).join(' ');
            const rowInteractive = Boolean(onRowClick || onRowKeyDown);
            const rk = getRowKey(row, rowIndex);
            const detailContent = renderRowDetail?.({ row, rowIndex });
            const showDetail = detailContent != null && detailContent !== false;
            return (
              <Fragment key={rk}>
                <TableRow
                  key={`${rk}-main`}
                  hover={false}
                  className={rowClass}
                  tabIndex={rowInteractive ? 0 : undefined}
                  role={rowInteractive ? 'button' : undefined}
                  aria-expanded={renderRowDetail ? showDetail : undefined}
                  aria-label={rowAriaLabel ? rowAriaLabel(row) : undefined}
                  onClick={onRowClick ? (e) => onRowClick(e, { row, rowIndex }) : undefined}
                  onKeyDown={onRowKeyDown ? (e) => onRowKeyDown(e, { row, rowIndex }) : undefined}
                >
                  {columns.map((col) => {
                    const custom = renderCell?.({ column: col, row, rowIndex });
                    const content =
                      custom !== undefined && custom !== null ? custom : defaultCellValue(row, col.id);
                    const cellEllipsis = col.ellipsis !== false;
                    return (
                      <TableCell key={col.id} className={styles.bodyCell} style={columnCellStyle(col)}>
                        <div className={cellEllipsis ? styles.cellClip : styles.cellClipFree}>{content}</div>
                      </TableCell>
                    );
                  })}
                </TableRow>
                {showDetail ? (
                  <TableRow key={`${rk}-detail`} className={styles.detailRow} hover={false}>
                    <TableCell
                      component="td"
                      colSpan={columns.length}
                      className={styles.detailCell}
                    >
                      {detailContent}
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const showBuiltInFooter =
    tableFooter &&
    typeof tableFooter === 'object' &&
    tableFooter.enabled === true &&
    tableFooter.pagination &&
    typeof tableFooter.pagination.page === 'number' &&
    typeof tableFooter.pagination.totalPages === 'number' &&
    typeof tableFooter.pagination.onPageChange === 'function';

  if (!showBuiltInFooter) {
    return tableBlock;
  }

  const { summary, end, pagination } = tableFooter;
  const { page, totalPages, onPageChange, prevLabel, nextLabel } = pagination;

  return (
    <>
      {tableBlock}
      <BasicTableFooter
        start={summary}
        center={(
          <BasicTablePaginationNav
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
            prevLabel={prevLabel}
            nextLabel={nextLabel}
          />
        )}
        end={end}
      />
    </>
  );
}

BasicTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired,
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      align: PropTypes.oneOf(['left', 'center', 'right']),
      ellipsis: PropTypes.bool,
      resizeBoundaryAfter: PropTypes.number,
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  renderCell: PropTypes.func,
  onRowClick: PropTypes.func,
  onRowKeyDown: PropTypes.func,
  getRowClassName: PropTypes.func,
  onColumnResizeMouseDown: PropTypes.func,
  rowAriaLabel: PropTypes.func,
  renderRowDetail: PropTypes.func,
  className: PropTypes.string,
  tableFooter: PropTypes.oneOfType([
    PropTypes.oneOf([false]),
    PropTypes.shape({
      enabled: PropTypes.bool,
      summary: PropTypes.node,
      end: PropTypes.node,
      pagination: PropTypes.shape({
        page: PropTypes.number.isRequired,
        totalPages: PropTypes.number.isRequired,
        onPageChange: PropTypes.func.isRequired,
        prevLabel: PropTypes.string,
        nextLabel: PropTypes.string,
      }),
    }),
  ]),
};

BasicTable.defaultProps = {
  renderCell: undefined,
  onRowClick: undefined,
  onRowKeyDown: undefined,
  getRowClassName: undefined,
  onColumnResizeMouseDown: undefined,
  rowAriaLabel: undefined,
  renderRowDetail: undefined,
  className: '',
  tableFooter: false,
};

export default BasicTable;
export { default as BasicTableFooter } from './BasicTableFooter';
export { default as BasicTablePaginationNav } from './BasicTablePaginationNav';

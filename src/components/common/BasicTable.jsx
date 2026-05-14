import PropTypes from 'prop-types';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import styles from './BasicTable.module.scss';

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
 * @param {Array<{ id: string, label: React.ReactNode, width?: string|number, align?: 'left'|'center'|'right' }>} columns
 * @param {object[]} data
 * @param {(ctx: { column: object, row: object, rowIndex: number }) => React.ReactNode} [renderCell]
 * @param {(event: React.MouseEvent, ctx: { row: object, rowIndex: number }) => void} [onRowClick]
 * @param {(row: object, rowIndex: number) => string} [getRowClassName]
 */
function BasicTable({ columns, data, renderCell, onRowClick, getRowClassName, className = '' }) {
  const rootClass = [styles.wrap, className].filter(Boolean).join(' ');

  return (
    <TableContainer component={Paper} className={rootClass} elevation={0}>
      <Table className={styles.table} size="small">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.id}
                component="th"
                scope="col"
                className={styles.headCell}
                style={columnCellStyle(col)}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => {
            const extraRowClass = getRowClassName?.(row, rowIndex) ?? '';
            const rowClass = [styles.row, extraRowClass].filter(Boolean).join(' ');
            return (
              <TableRow
                key={getRowKey(row, rowIndex)}
                hover
                className={rowClass}
                onClick={onRowClick ? (e) => onRowClick(e, { row, rowIndex }) : undefined}
              >
                {columns.map((col) => {
                  const custom = renderCell?.({ column: col, row, rowIndex });
                  const content =
                    custom !== undefined && custom !== null ? custom : defaultCellValue(row, col.id);
                  return (
                    <TableCell key={col.id} className={styles.bodyCell} style={columnCellStyle(col)}>
                      {content}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

BasicTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired,
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      align: PropTypes.oneOf(['left', 'center', 'right']),
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  renderCell: PropTypes.func,
  onRowClick: PropTypes.func,
  getRowClassName: PropTypes.func,
  className: PropTypes.string,
};

BasicTable.defaultProps = {
  renderCell: undefined,
  onRowClick: undefined,
  getRowClassName: undefined,
  className: '',
};

export default BasicTable;

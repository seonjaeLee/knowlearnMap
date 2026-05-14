import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import './BasicTable.global.css';

function computePageButtonIndices(totalPages, currentPage) {
  if (totalPages <= 7) return [...Array(totalPages)].map((_, i) => i);
  const set = new Set([0, totalPages - 1]);
  for (let i = currentPage - 2; i <= currentPage + 2; i += 1) {
    if (i >= 0 && i < totalPages) set.add(i);
  }
  return [...set].sort((a, b) => a - b);
}

/**
 * `basic-table-pagination` 마크업 — 이전 / 번호 클러스터 / 다음.
 * 스타일은 `BasicTable.global.css` 를 사용합니다.
 */
function BasicTablePaginationNav({
  page,
  totalPages,
  onPageChange,
  prevLabel = '이전',
  nextLabel = '다음',
}) {
  const pageButtonIndices = useMemo(
    () => computePageButtonIndices(totalPages, page),
    [totalPages, page]
  );

  return (
    <nav className="basic-table-pagination" aria-label="페이지 이동">
      <button
        type="button"
        className="basic-table-page-btn"
        disabled={page === 0}
        onClick={() => onPageChange(Math.max(0, page - 1))}
      >
        {prevLabel}
      </button>
      <div className="basic-table-page-cluster" role="group" aria-label="페이지 번호">
        {pageButtonIndices.map((idx, arrayIndex) => (
          <React.Fragment key={idx}>
            {arrayIndex > 0 && pageButtonIndices[arrayIndex - 1] < idx - 1 && (
              <span className="basic-table-page-ellipsis" aria-hidden>
                …
              </span>
            )}
            <button
              type="button"
              className={`basic-table-page-btn${page === idx ? ' is-active' : ''}`}
              onClick={() => onPageChange(idx)}
            >
              {idx + 1}
            </button>
          </React.Fragment>
        ))}
      </div>
      <button
        type="button"
        className="basic-table-page-btn"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
      >
        {nextLabel}
      </button>
    </nav>
  );
}

BasicTablePaginationNav.propTypes = {
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  prevLabel: PropTypes.string,
  nextLabel: PropTypes.string,
};

BasicTablePaginationNav.defaultProps = {
  prevLabel: '이전',
  nextLabel: '다음',
};

export default BasicTablePaginationNav;

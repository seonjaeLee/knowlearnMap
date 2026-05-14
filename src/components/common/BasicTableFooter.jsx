import React from 'react';
import PropTypes from 'prop-types';
import './BasicTable.global.css';
import styles from './BasicTable.module.scss';

/**
 * 목록 하단 — 사용자 관리의 `AdminTableFooter` 레이아웃·시각과 동일(클래스만 BasicTable 모듈 기준).
 * 좌측 요약 · 가운데 페이지네이션 · 우측 슬롯(비워도 1fr 유지).
 */
function BasicTableFooter({ start, center, end, className = '' }) {
  const root = [styles.footer, className].filter(Boolean).join(' ');
  return (
    <div className={root}>
      <div className={styles.footerStart}>{start}</div>
      <div className={styles.footerCenter}>{center}</div>
      <div
        className={styles.footerEnd}
        aria-hidden={end == null || end === false}
      >
        {end != null && end !== false ? end : null}
      </div>
    </div>
  );
}

BasicTableFooter.propTypes = {
  start: PropTypes.node,
  center: PropTypes.node,
  end: PropTypes.node,
  className: PropTypes.string,
};

BasicTableFooter.defaultProps = {
  start: null,
  center: null,
  end: null,
  className: '',
};

export default BasicTableFooter;

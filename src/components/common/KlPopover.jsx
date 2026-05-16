import React from 'react';
import PropTypes from 'prop-types';
import Popover from '@mui/material/Popover';
import styles from './KlPopover.module.scss';

const defaultAnchorOrigin = { vertical: 'bottom', horizontal: 'left' };
const defaultTransformOrigin = { vertical: 'top', horizontal: 'left' };

/**
 * 짧은 맥락용 MUI Popover 래퍼 — 패널 스타일은 SCSS(`KlPopover.module.scss`).
 */
function KlPopover({
  open,
  anchorEl,
  onClose,
  children,
  anchorOrigin = defaultAnchorOrigin,
  transformOrigin = defaultTransformOrigin,
  /** `'anchorEl'`(기본) | `'anchorPosition'` — 후자는 테이블·리렌더 시 앵커 DOM이 바뀌어도 클릭 좌표로 위치가 안정적 */
  anchorReference = 'anchorEl',
  /** `anchorReference="anchorPosition"`일 때 필수 — 뷰포트 기준 `{ top, left }`(앵커 포인트) */
  anchorPosition,
  panelClassName = '',
  id,
  disableScrollLock = false,
}) {
  const paperClass = [styles.panel, panelClassName].filter(Boolean).join(' ');
  const paperProps = {
    className: paperClass,
    elevation: 0,
    ...(id ? { id } : {}),
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      anchorReference={anchorReference}
      anchorPosition={anchorPosition}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      disableScrollLock={disableScrollLock}
      PaperProps={paperProps}
    >
      {children}
    </Popover>
  );
}

KlPopover.propTypes = {
  open: PropTypes.bool.isRequired,
  anchorEl: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
  anchorOrigin: PropTypes.shape({
    vertical: PropTypes.oneOf(['top', 'center', 'bottom']).isRequired,
    horizontal: PropTypes.oneOf(['left', 'center', 'right']).isRequired,
  }),
  transformOrigin: PropTypes.shape({
    vertical: PropTypes.oneOf(['top', 'center', 'bottom']).isRequired,
    horizontal: PropTypes.oneOf(['left', 'center', 'right']).isRequired,
  }),
  anchorReference: PropTypes.oneOf(['anchorEl', 'anchorPosition', 'none']),
  anchorPosition: PropTypes.shape({
    top: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }),
  panelClassName: PropTypes.string,
  id: PropTypes.string,
  disableScrollLock: PropTypes.bool,
};

KlPopover.defaultProps = {
  children: null,
  anchorOrigin: defaultAnchorOrigin,
  transformOrigin: defaultTransformOrigin,
  anchorReference: 'anchorEl',
  anchorPosition: undefined,
  panelClassName: '',
  id: undefined,
  disableScrollLock: false,
};

export default KlPopover;

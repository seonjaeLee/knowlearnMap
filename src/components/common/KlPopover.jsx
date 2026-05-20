import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import Popover from '@mui/material/Popover';
import Fade from '@mui/material/Fade';
import { X } from 'lucide-react';
import styles from './KlPopover.module.scss';

const TRANSITION_ENTER_MS = 150;
const TRANSITION_EXIT_MS = 150;

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
  showCloseButton = false,
}) {
  const persistedAnchorRef = useRef(null);
  const persistedAnchorPositionRef = useRef(null);
  const persistedAnchorReferenceRef = useRef(anchorReference);
  const persistedChildrenRef = useRef(null);

  if (open && anchorEl) {
    persistedAnchorRef.current = anchorEl;
  }
  if (open && anchorPosition) {
    persistedAnchorPositionRef.current = anchorPosition;
  }
  if (open) {
    persistedAnchorReferenceRef.current = anchorReference;
    persistedChildrenRef.current = children;
  }

  const resolvedAnchorEl = open ? anchorEl : persistedAnchorRef.current;
  const resolvedAnchorPosition = open ? anchorPosition : persistedAnchorPositionRef.current;
  const resolvedAnchorReference = open ? anchorReference : persistedAnchorReferenceRef.current;
  const resolvedChildren = open ? children : persistedChildrenRef.current;

  const clearPersistedOnExited = () => {
    persistedAnchorRef.current = null;
    persistedAnchorPositionRef.current = null;
    persistedChildrenRef.current = null;
  };

  const paperClass = [
    styles.panel,
    showCloseButton ? styles.panelWithClose : '',
    panelClassName,
  ].filter(Boolean).join(' ');

  const handleCloseClick = (event) => {
    event.stopPropagation();
    onClose(event, 'escapeKeyDown');
  };
  const paperProps = {
    className: paperClass,
    elevation: 0,
    ...(id ? { id } : {}),
  };

  return (
    <Popover
      open={open}
      anchorEl={resolvedAnchorEl}
      anchorReference={resolvedAnchorReference}
      anchorPosition={resolvedAnchorPosition}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      disableScrollLock={disableScrollLock}
      TransitionComponent={Fade}
      transitionDuration={{ enter: TRANSITION_ENTER_MS, exit: TRANSITION_EXIT_MS }}
      slotProps={{
        transition: {
          onExited: clearPersistedOnExited,
        },
      }}
      PaperProps={paperProps}
    >
      {showCloseButton ? (
        <button
          type="button"
          className={styles.closeBtn}
          onClick={handleCloseClick}
          aria-label="닫기"
        >
          <X size={16} strokeWidth={2} aria-hidden />
        </button>
      ) : null}
      <div className={styles.panelInner}>{resolvedChildren}</div>
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
  showCloseButton: PropTypes.bool,
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
  showCloseButton: false,
};

export default KlPopover;

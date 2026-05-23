import { useRef } from 'react';
import PropTypes from 'prop-types';
import { useSplitPaneResize } from '../../../hooks/useSplitPaneResize';
import styles from './SplitPane.module.scss';
import './SplitPane.global.css';

/**
 * 좌·우 2패널 + 드래그 리사이저.
 * 접힘(collapsed)은 leftCollapsed로 제어합니다. 리사이저는 항상 표시되며,
 * 접힌 상태에서 드래그 시 onResizeStart로 펼침을 연동할 수 있습니다.
 */
function SplitPane({
  left,
  right,
  leftCollapsed = false,
  defaultLeftPercent = 45,
  minLeftPercent = 20,
  maxLeftPercent = 60,
  collapsedLeftWidthPx = 300,
  minCollapsedLeftWidthPx = 250,
  percentStorageKey,
  onResizeStart,
  className = '',
  leftPaneClassName = '',
  rightPaneClassName = '',
  resizerAriaLabel = '패널 너비 조절',
}) {
  const containerRef = useRef(null);
  const {
    leftPaneStyle,
    isResizing,
    handleResizerPointerDown,
  } = useSplitPaneResize({
    containerRef,
    leftCollapsed,
    defaultLeftPercent,
    minLeftPercent,
    maxLeftPercent,
    collapsedLeftWidthPx,
    minCollapsedLeftWidthPx,
    percentStorageKey,
    onResizeStart,
  });

  const rootClass = [
    styles.root,
    isResizing ? styles.rootResizing : '',
    className,
  ].filter(Boolean).join(' ');

  const leftClass = [styles.leftPane, leftPaneClassName].filter(Boolean).join(' ');
  const rightClass = [styles.rightPane, rightPaneClassName].filter(Boolean).join(' ');

  return (
    <div ref={containerRef} className={rootClass}>
      <div className={leftClass} style={leftPaneStyle}>
        {left}
      </div>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={resizerAriaLabel}
        tabIndex={0}
        className={styles.resizer}
        onPointerDown={handleResizerPointerDown}
      />
      <div className={rightClass}>
        {right}
      </div>
    </div>
  );
}

SplitPane.propTypes = {
  left: PropTypes.node.isRequired,
  right: PropTypes.node.isRequired,
  leftCollapsed: PropTypes.bool,
  defaultLeftPercent: PropTypes.number,
  minLeftPercent: PropTypes.number,
  maxLeftPercent: PropTypes.number,
  collapsedLeftWidthPx: PropTypes.number,
  minCollapsedLeftWidthPx: PropTypes.number,
  percentStorageKey: PropTypes.string,
  onResizeStart: PropTypes.func,
  className: PropTypes.string,
  leftPaneClassName: PropTypes.string,
  rightPaneClassName: PropTypes.string,
  resizerAriaLabel: PropTypes.string,
};

SplitPane.defaultProps = {
  leftCollapsed: false,
  defaultLeftPercent: 45,
  minLeftPercent: 20,
  maxLeftPercent: 60,
  collapsedLeftWidthPx: 300,
  minCollapsedLeftWidthPx: 250,
  percentStorageKey: undefined,
  onResizeStart: undefined,
  className: '',
  leftPaneClassName: '',
  rightPaneClassName: '',
  resizerAriaLabel: '패널 너비 조절',
};

export default SplitPane;

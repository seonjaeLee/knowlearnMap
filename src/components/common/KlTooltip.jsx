import React from 'react';
import PropTypes from 'prop-types';
import Tooltip from '@mui/material/Tooltip';
import styles from './KlTooltip.module.scss';

/**
 * 짧은 호버 안내 — HTML title 대체. 트리거에 title 속성과 함께 쓰지 않는다.
 */
function KlTooltip({
  title,
  children,
  placement = 'top',
  enterDelay = 200,
  leaveDelay = 0,
  arrow = true,
  disableHoverListener = false,
  disableFocusListener = false,
  disableTouchListener = false,
  disableInteractive = true,
  /** boolean — 호버를 직접 제어할 때 전달 (MUI 기본 리스너 자동 비활성) */
  open,
  className = '',
  triggerClassName = '',
  /** `'block'` LNB 등 · `'icon'` 테이블 28px 액션 버튼 */
  variant = 'block',
}) {
  if (!title) {
    return children;
  }

  const tooltipClass = [styles.tooltip, className].filter(Boolean).join(' ');
  const triggerVariantClass = variant === 'icon' ? styles.triggerIcon : styles.triggerBlock;
  const triggerClass = [triggerVariantClass, triggerClassName].filter(Boolean).join(' ');

  const isControlled = typeof open === 'boolean';
  const tooltipOpenProps = isControlled ? { open } : {};

  return (
    <Tooltip
      title={title}
      placement={placement}
      enterDelay={enterDelay}
      leaveDelay={leaveDelay}
      arrow={arrow}
      disableHoverListener={disableHoverListener || isControlled}
      disableFocusListener={disableFocusListener || isControlled}
      disableTouchListener={disableTouchListener || isControlled}
      disableInteractive={disableInteractive}
      describeChild={false}
      {...tooltipOpenProps}
      slotProps={{
        tooltip: { className: tooltipClass },
        arrow: { className: styles.arrow },
        popper: { className: styles.popper },
      }}
    >
      <span className={triggerClass}>{children}</span>
    </Tooltip>
  );
}

KlTooltip.propTypes = {
  title: PropTypes.node,
  children: PropTypes.element.isRequired,
  placement: PropTypes.string,
  enterDelay: PropTypes.number,
  leaveDelay: PropTypes.number,
  arrow: PropTypes.bool,
  disableHoverListener: PropTypes.bool,
  disableFocusListener: PropTypes.bool,
  disableTouchListener: PropTypes.bool,
  open: PropTypes.bool,
  disableInteractive: PropTypes.bool,
  className: PropTypes.string,
  triggerClassName: PropTypes.string,
  variant: PropTypes.oneOf(['block', 'icon']),
};

KlTooltip.defaultProps = {
  title: '',
  placement: 'top',
  enterDelay: 200,
  leaveDelay: 0,
  arrow: true,
  disableHoverListener: false,
  disableFocusListener: false,
  disableTouchListener: false,
  open: undefined,
  disableInteractive: true,
  className: '',
  triggerClassName: '',
  variant: 'block',
};

export default KlTooltip;

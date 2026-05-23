import React from 'react';
import PropTypes from 'prop-types';
import KlTooltip from './KlTooltip';

const TABLE_TOOLTIP_ENTER_MS = 0;
const TABLE_TOOLTIP_LEAVE_MS = 60;
const CHROME_TOOLTIP_ENTER_MS = 0;
const CHROME_TOOLTIP_LEAVE_MS = 60;

/**
 * 아이콘 버튼 + KlTooltip. HTML title 사용 금지.
 * - 표 관리 열: tone + kl-table-icon-btn (기본)
 * - GNB·툴바·헤더: buttonClassName 지정 (placement 기본 bottom)
 */
function KlIconButton({
  tooltip,
  ariaLabel,
  onClick,
  children,
  tone = 'neutral',
  accent = false,
  disabled = false,
  className = '',
  buttonClassName = '',
  stopPropagation = true,
  placement,
  enterDelay,
  leaveDelay,
  tooltipVariant,
  type = 'button',
  buttonProps = {},
}) {
  const isTableButton = !buttonClassName;
  const toneClass = isTableButton ? `kl-table-icon-btn--${tone}` : '';
  const accentClass = isTableButton && accent && tone === 'neutral' ? ' kl-table-icon-btn--accent' : '';
  const btnClass = isTableButton
    ? ['kl-table-icon-btn', toneClass, accentClass, className].filter(Boolean).join(' ')
    : [buttonClassName, className].filter(Boolean).join(' ');

  const resolvedPlacement = placement ?? (isTableButton ? 'left' : 'bottom');
  const resolvedVariant = tooltipVariant ?? (isTableButton ? 'icon' : 'block');
  const resolvedEnterDelay = enterDelay ?? (isTableButton ? TABLE_TOOLTIP_ENTER_MS : CHROME_TOOLTIP_ENTER_MS);
  const resolvedLeaveDelay = leaveDelay ?? (isTableButton ? TABLE_TOOLTIP_LEAVE_MS : CHROME_TOOLTIP_LEAVE_MS);

  const handleClick = (event) => {
    if (stopPropagation) {
      event.stopPropagation();
    }
    if (onClick) {
      onClick(event);
    }
  };

  const button = (
    <button
      type={type}
      className={btnClass}
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel}
      {...buttonProps}
    >
      {children}
    </button>
  );

  if (!tooltip) {
    return button;
  }

  return (
    <KlTooltip
      title={tooltip}
      placement={resolvedPlacement}
      enterDelay={resolvedEnterDelay}
      leaveDelay={resolvedLeaveDelay}
      variant={resolvedVariant}
      triggerClassName={isTableButton ? undefined : 'kl-icon-btn-tooltip-trigger'}
    >
      {button}
    </KlTooltip>
  );
}

KlIconButton.propTypes = {
  tooltip: PropTypes.string,
  ariaLabel: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  tone: PropTypes.oneOf(['neutral', 'danger', 'success']),
  accent: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  buttonClassName: PropTypes.string,
  stopPropagation: PropTypes.bool,
  placement: PropTypes.string,
  enterDelay: PropTypes.number,
  leaveDelay: PropTypes.number,
  tooltipVariant: PropTypes.oneOf(['block', 'icon']),
  type: PropTypes.string,
  buttonProps: PropTypes.object,
};

KlIconButton.defaultProps = {
  tooltip: '',
  onClick: undefined,
  tone: 'neutral',
  accent: false,
  disabled: false,
  className: '',
  buttonClassName: '',
  stopPropagation: true,
  placement: undefined,
  enterDelay: undefined,
  leaveDelay: undefined,
  tooltipVariant: undefined,
  type: 'button',
  buttonProps: {},
};

export default KlIconButton;

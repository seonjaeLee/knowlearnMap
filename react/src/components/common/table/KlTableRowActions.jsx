import React from 'react';
import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';
import KlIconButton from '../KlIconButton';
import {
  TABLE_ACTION_KINDS,
  TABLE_ACTION_PRESETS,
  TABLE_ACTION_ICON_PROPS,
  tableActionIconNeedsSize,
} from './tableActionKinds';

function renderPresetIcon(IconComponent) {
  const needsSize = tableActionIconNeedsSize(IconComponent);
  return <IconComponent {...TABLE_ACTION_ICON_PROPS} {...(needsSize ? { size: 16 } : {})} />;
}

function resolveAction(action) {
  if (!action || action.visible === false) {
    return null;
  }

  const { kind } = action;
  if (kind === TABLE_ACTION_KINDS.custom || !kind) {
    const {
      tooltip,
      ariaLabel,
      onClick,
      icon,
      tone = 'neutral',
      accent = false,
      disabled = false,
      loading = false,
      className = '',
      stopPropagation = true,
    } = action;
    if (!ariaLabel) {
      return null;
    }
    return (
      <KlIconButton
        tooltip={tooltip}
        ariaLabel={ariaLabel}
        onClick={onClick}
        tone={tone}
        accent={accent}
        disabled={disabled || loading}
        className={className}
        stopPropagation={stopPropagation}
      >
        {loading ? <Loader2 className="kl-table-icon-btn__spin" size={16} aria-hidden /> : icon}
      </KlIconButton>
    );
  }

  const preset = TABLE_ACTION_PRESETS[kind];
  if (!preset) {
    return null;
  }

  const {
    tooltip = preset.tooltip,
    ariaLabel,
    onClick,
    tone = preset.tone,
    accent = false,
    disabled = false,
    icon,
    className = '',
    stopPropagation = true,
    id,
  } = action;

  const IconComponent = preset.Icon;
  const iconNode = icon ?? renderPresetIcon(IconComponent);

  return (
    <KlIconButton
      tooltip={tooltip}
      ariaLabel={ariaLabel}
      onClick={onClick}
      tone={tone}
      accent={accent}
      disabled={disabled}
      className={className}
      stopPropagation={stopPropagation}
    >
      {iconNode}
    </KlIconButton>
  );
}

/**
 * 표 관리 열 아이콘 묶음 — `.kl-table-actions` + kind 프리셋 또는 custom 액션.
 *
 * @example
 * actions={[
 *   { kind: 'mailResend', onClick, ariaLabel: `${email} 인증 메일 재발송` },
 *   isLocked && { kind: 'unlock', onClick, ariaLabel: `${email} 잠금 해제` },
 *   { kind: 'edit', onClick, ariaLabel: `${email} 수정` },
 *   { kind: 'delete', onClick, ariaLabel: `${email} 삭제` },
 * ].filter(Boolean)}
 */
function KlTableRowActions({ actions, className = '', stopPropagationOnWrapper = true, prefix }) {
  const items = (actions || [])
    .map((action, index) => {
      const node = resolveAction(action);
      if (!node) return null;
      return React.cloneElement(node, { key: action.id || action.kind || `action-${index}` });
    })
    .filter(Boolean);
  if (items.length === 0 && !prefix) {
    return null;
  }

  const wrapperClass = ['kl-table-actions', className].filter(Boolean).join(' ');

  return (
    <div
      className={wrapperClass}
      onClick={stopPropagationOnWrapper ? (e) => e.stopPropagation() : undefined}
    >
      {prefix}
      {items}
    </div>
  );
}

const actionShape = PropTypes.shape({
  kind: PropTypes.oneOf([...Object.values(TABLE_ACTION_KINDS)]),
  id: PropTypes.string,
  visible: PropTypes.bool,
  tooltip: PropTypes.string,
  ariaLabel: PropTypes.string,
  onClick: PropTypes.func,
  tone: PropTypes.oneOf(['neutral', 'danger', 'success']),
  accent: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  icon: PropTypes.node,
  className: PropTypes.string,
  stopPropagation: PropTypes.bool,
});

KlTableRowActions.propTypes = {
  actions: PropTypes.arrayOf(actionShape),
  className: PropTypes.string,
  stopPropagationOnWrapper: PropTypes.bool,
  prefix: PropTypes.node,
};

KlTableRowActions.defaultProps = {
  actions: [],
  className: '',
  stopPropagationOnWrapper: true,
  prefix: null,
};

export default KlTableRowActions;
export { TABLE_ACTION_KINDS };

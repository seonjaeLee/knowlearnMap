import PropTypes from 'prop-types';

/**
 * BasicTable 제어 열 — 표시용(readOnly) 또는 선택용 native input
 */
function KlTableCellControl({
  type,
  checked,
  ariaLabel,
  readOnly,
  disabled,
  name,
  onChange,
}) {
  if (type === 'checkbox') {
    if (readOnly) {
      return (
        <span
          className={[
            'kl-table-control-checkbox',
            checked ? 'is-checked' : '',
            disabled ? 'is-disabled' : '',
          ].filter(Boolean).join(' ')}
          role="checkbox"
          aria-checked={checked}
          aria-label={ariaLabel}
          aria-disabled={disabled || undefined}
        />
      );
    }
    return (
      <input
        type="checkbox"
        className="kl-table-control-checkbox-input"
        checked={checked}
        disabled={disabled}
        name={name}
        aria-label={ariaLabel}
        onChange={onChange}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  if (readOnly) {
    return (
      <span
        className={[
          'kl-table-control-radio',
          checked ? 'is-checked' : '',
          disabled ? 'is-disabled' : '',
        ].filter(Boolean).join(' ')}
        role="radio"
        aria-checked={checked}
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
      />
    );
  }

  return (
    <input
      type="radio"
      className="kl-table-control-radio-input"
      checked={checked}
      disabled={disabled}
      name={name}
      aria-label={ariaLabel}
      onChange={onChange}
      onClick={(e) => e.stopPropagation()}
    />
  );
}

KlTableCellControl.propTypes = {
  type: PropTypes.oneOf(['radio', 'checkbox']).isRequired,
  checked: PropTypes.bool,
  ariaLabel: PropTypes.string,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,
  name: PropTypes.string,
  onChange: PropTypes.func,
};

KlTableCellControl.defaultProps = {
  checked: false,
  ariaLabel: undefined,
  readOnly: true,
  disabled: false,
  name: undefined,
  onChange: undefined,
};

export default KlTableCellControl;

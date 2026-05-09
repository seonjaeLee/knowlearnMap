import PropTypes from 'prop-types';
import React, { useId } from 'react';
import styles from './ModalFormField.module.scss';

/**
 * 팝업(BaseModal) 본문 필드 블록 — 라벨·컨트롤·보조문.
 * 시각 규격은 부모에 `km-modal-form`(contentClassName)이 있어야 적용된다.
 * @see docs/modal-form-spec.md
 */
function ModalFormField({
  label,
  children,
  helperText,
  required = false,
  error = false,
  inputId: inputIdProp,
  className = '',
  helperClassName = '',
}) {
  const reactId = useId();
  const fallbackId = `km-modal-field-${reactId.replace(/:/g, '')}`;
  const resolvedControlId =
    inputIdProp ??
    (React.isValidElement(children) && children.props?.id ? children.props.id : null) ??
    fallbackId;

  const renderedControl =
    React.isValidElement(children) && !children.props?.id
      ? React.cloneElement(children, { id: resolvedControlId })
      : children;

  return (
    <div className={`${styles.root} ${className}`.trim()}>
      {label != null && label !== '' ? (
        <label htmlFor={resolvedControlId} className={styles.label}>
          {label}
          {required ? (
            <span className="required-asterisk" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}
      <div className={styles.control}>{renderedControl}</div>
      {helperText != null && helperText !== '' ? (
        <p
          className={`${styles.helper} ${error ? styles.helperError : ''} ${helperClassName}`.trim()}
          role={error ? 'alert' : undefined}
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

ModalFormField.propTypes = {
  label: PropTypes.node,
  children: PropTypes.node,
  helperText: PropTypes.node,
  required: PropTypes.bool,
  error: PropTypes.bool,
  inputId: PropTypes.string,
  className: PropTypes.string,
  helperClassName: PropTypes.string,
};

export default ModalFormField;

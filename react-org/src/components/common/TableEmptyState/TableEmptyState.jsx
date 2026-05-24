import PropTypes from 'prop-types';
import styles from './TableEmptyState.module.scss';

export const TABLE_EMPTY_DEFAULT_MESSAGE = '\ub4f1\ub85d\ub41c \ub370\uc774\ud130\uac00 \uc5c6\uc2b5\ub2c8\ub2e4';
export const TABLE_EMPTY_SEARCH_MESSAGE = '\uac80\uc0c9 \uacb0\uacfc\uac00 \uc5c6\uc2b5\ub2c8\ub2e4';

function TableEmptyState({
  message,
  hint,
  variant = 'default',
  solo = false,
  compact = false,
  className = '',
  ...rest
}) {
  const resolvedMessage = message ?? (
    variant === 'search' ? TABLE_EMPTY_SEARCH_MESSAGE : TABLE_EMPTY_DEFAULT_MESSAGE
  );

  const rootClass = [
    styles.wrap,
    solo ? styles.wrapSolo : '',
    compact ? styles.wrapCompact : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={rootClass} role="status" {...rest}>
      <p className={styles.text}>{resolvedMessage}</p>
      {hint ? <p className={styles.hint}>{hint}</p> : null}
    </div>
  );
}

TableEmptyState.propTypes = {
  message: PropTypes.string,
  hint: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'search']),
  solo: PropTypes.bool,
  compact: PropTypes.bool,
  className: PropTypes.string,
};

export default TableEmptyState;

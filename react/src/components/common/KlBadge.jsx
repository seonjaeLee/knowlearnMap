import PropTypes from 'prop-types';

const KL_BADGE_TONES = ['info', 'ok', 'warn', 'danger', 'neutral'];
const KL_BADGE_VARIANTS = ['default', 'compact', 'inline'];

/**
 * 상태·메타 뱃지 — 테두리 + dot만 색 (`kit/kl-badge.css`).
 *
 * @example
 * <KlBadge tone="ok" variant="compact">ADMIN</KlBadge>
 * <KlBadge tone="warn" variant="inline">VERIFYING_EMAIL</KlBadge>
 */
function KlBadge({
  tone,
  variant = 'default',
  label,
  children,
  className = '',
  title,
}) {
  const content = children ?? label;
  const variantClass =
    variant === 'compact' ? 'kl-badge--compact' : variant === 'inline' ? 'kl-badge--inline' : '';
  const rootClass = ['kl-badge', tone ? `kl-badge--${tone}` : '', variantClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={rootClass} title={title}>
      <span className="kl-badge__dot" aria-hidden />
      <span className="kl-badge__text">{content}</span>
    </span>
  );
}

KlBadge.propTypes = {
  tone: PropTypes.oneOf(KL_BADGE_TONES),
  variant: PropTypes.oneOf(KL_BADGE_VARIANTS),
  label: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
  title: PropTypes.string,
};

KlBadge.defaultProps = {
  tone: undefined,
  variant: 'default',
  label: undefined,
  children: undefined,
  className: '',
  title: undefined,
};

export default KlBadge;
export { KL_BADGE_TONES, KL_BADGE_VARIANTS };

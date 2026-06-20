import PropTypes from 'prop-types';
import { X } from 'lucide-react';

/**
 * 모달 닫기 — Promo shell 및 MUI 없는 커스텀 팝업용.
 * Work shell(BaseModal)은 MUI IconButton + CloseIcon 유지(이관 시 본 컴포넌트로 통일 가능).
 */
function KlModalClose({ onClick, className = '', disabled = false, ...rest }) {
  return (
    <button
      type="button"
      className={['kl-modal-close', className].filter(Boolean).join(' ')}
      onClick={onClick}
      disabled={disabled}
      aria-label="닫기"
      {...rest}
    >
      <X size={18} strokeWidth={2} aria-hidden />
    </button>
  );
}

KlModalClose.propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

export default KlModalClose;

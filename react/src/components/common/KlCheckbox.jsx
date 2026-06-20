import PropTypes from 'prop-types';

/**
 * 공용 체크박스 — 로그인 화면(login-chk)과 동일한 외형·모션(kl-checkbox.css).
 * 레이아웃·타이포는 className으로 전달(예: kl-modal-form-check).
 * onLabelClick/onLabelMouseDown — 클릭 가능한 카드/행 안에 둘 때 상위 onClick 전파 차단용.
 */
function KlCheckbox({
  id,
  checked,
  onChange,
  children,
  className,
  disabled,
  name,
  onClick,
  onLabelClick,
  onLabelMouseDown,
}) {
  return (
    <label className={className} htmlFor={id} onClick={onLabelClick} onMouseDown={onLabelMouseDown}>
      <input
        id={id}
        type="checkbox"
        className="kl-checkbox"
        checked={checked}
        onChange={onChange}
        onClick={onClick}
        disabled={disabled}
        name={name}
      />
      {children != null && <span>{children}</span>}
    </label>
  );
}

KlCheckbox.propTypes = {
  id: PropTypes.string,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  name: PropTypes.string,
  onClick: PropTypes.func,
  onLabelClick: PropTypes.func,
  onLabelMouseDown: PropTypes.func,
};

KlCheckbox.defaultProps = {
  id: undefined,
  children: null,
  className: '',
  disabled: false,
  name: undefined,
  onClick: undefined,
  onLabelClick: undefined,
  onLabelMouseDown: undefined,
};

export default KlCheckbox;

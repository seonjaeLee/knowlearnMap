/**
 * KL Map — BaseModal Form 본문 공통 class · id (페이지별 *-create-form 금지)
 *
 * @see docs/modal-guide.md §5
 */

/** `<form>` 세로 스택 — row·content-field 간격 */
export const KL_MODAL_FORM_STACK_CLASS = 'kl-modal-form-stack';

/** 등록·수정 Form — 푸터 submit `form` 연결 (동시에 모달 1개만 열림) */
export const KL_MODAL_FORM_ELEMENT_ID = 'kl-modal-form';

/** `BaseModal` `contentClassName` — 고객센터 등록·수정 Form 공통 */
export const klModalFormContentClassName = 'kl-modal-form kl-scrollbar-thin';

/** row 컨트롤 열 — 좁은 입력 + 체크박스 가로 (`kl-layout-modal.css`) */
export const KL_MODAL_FORM_INLINE_CONTROLS_CLASS = 'kl-modal-form-inline-controls';
export const KL_MODAL_FORM_INLINE_CONTROLS_FIELD_CLASS = 'kl-modal-form-inline-controls__field';
export const KL_MODAL_FORM_CHECK_CLASS = 'kl-modal-form-check';
export const KL_MODAL_FORM_CHECK_EMPHASIS_CLASS = 'kl-modal-form-check--emphasis';

/** row 컨트롤 — select/input flex:1 + 옆 버튼 (청킹 NONE·중복확인 등) */
export const KL_MODAL_FORM_CONTROL_ROW_CLASS = 'kl-modal-form-control-row';

export const KL_MODAL_FORM_TOGGLE_BTN_CLASS = 'kl-modal-form-toggle-btn';
export const KL_MODAL_FORM_TOGGLE_BTN_ACTIVE_CLASS = 'kl-modal-form-toggle-btn--active';

export const KL_MODAL_FORM_FEEDBACK_CLASS = 'kl-modal-form-feedback';
export const KL_MODAL_FORM_FEEDBACK_SUCCESS_CLASS = 'kl-modal-form-feedback--success';
export const KL_MODAL_FORM_FEEDBACK_ERROR_CLASS = 'kl-modal-form-feedback--error';

export const KL_MODAL_FORM_ERROR_BANNER_CLASS = 'kl-modal-form-error-banner';

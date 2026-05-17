/** 고객센터(공지·FAQ·1:1) 팝업 공통 가로 — BaseModal `maxWidth={false}` `fullWidth={false}` */
export const SUPPORT_CS_MODAL_WIDTH = 800;

const csModalPaperWidth = {
  width: SUPPORT_CS_MODAL_WIDTH,
  maxWidth: 'calc(100vw - 48px)',
};

/** 상세 팝업 */
export const supportDetailModalPaperSx = {
  ...csModalPaperWidth,
  height: 'auto',
  maxHeight: 'calc(100vh - 48px)',
};

export const supportDetailModalPaperClassName = 'cs-detail-modal-paper';

/** 작성·수정 팝업 */
export const supportFormModalPaperSx = {
  ...csModalPaperWidth,
  minHeight: 'min(720px, calc(100vh - 48px))',
};

export const supportFormModalPaperClassName = 'cs-form-modal-paper';

/** 고객센터 등록·수정 팝업(공지·FAQ·1:1) — 가로 520px */
export const QNA_FORM_MODAL_WIDTH = 520;

export const qnaFormModalPaperSx = {
  width: QNA_FORM_MODAL_WIDTH,
  maxWidth: 'calc(100vw - 48px)',
  minHeight: 'unset',
  maxHeight: 'calc(100vh - 48px)',
};

export const qnaFormModalPaperClassName = 'qna-form-modal-paper';

/** FAQ 등록·수정 — 1:1 문의와 동일 520px */
export const faqFormModalPaperSx = {
  ...qnaFormModalPaperSx,
};

export const faqFormModalPaperClassName = 'faq-form-modal-paper';

/** 공지 등록·수정 — FAQ·1:1 문의와 동일 520px */
export const noticeFormModalPaperSx = {
  ...qnaFormModalPaperSx,
};

export const noticeFormModalPaperClassName = 'notice-form-modal-paper';

/** 도메인 추가 — 고객센터 등록 팝업과 동일 520px */
export const domainFormModalPaperSx = {
  ...qnaFormModalPaperSx,
};

export const domainFormModalPaperClassName = 'domain-form-modal-paper';

/** 워크스페이스 공유 설정 — 고객센터 등록 팝업과 동일 520px */
export const shareFormModalPaperSx = {
  ...qnaFormModalPaperSx,
};

export const shareFormModalPaperClassName = 'share-form-modal-paper';

/** 어드민 사용자 수정 — 고객센터 등록 팝업과 동일 520px */
export const memberFormModalPaperSx = {
  ...qnaFormModalPaperSx,
};

export const memberFormModalPaperClassName = 'member-form-modal-paper';

/** 어드민 시스템 설정 수정 — 고객센터 등록 팝업과 동일 520px */
export const configFormModalPaperSx = {
  ...qnaFormModalPaperSx,
};

export const configFormModalPaperClassName = 'config-form-modal-paper';

/** 어드민 Action — 워크스페이스 ID 입력 팝업 (520px) */
export const actionWsModalPaperSx = {
  ...qnaFormModalPaperSx,
};

export const actionWsModalPaperClassName = 'action-ws-modal-paper';

/**
 * KL Map — BaseModal Paper `paperSx` · `paperClassName` SSOT
 *
 * - Form 기본 가로 550px: `klFormModalPaperSx` (상세·홈 등 다른 폭은 각 `*ModalPaperSx.width`)
 * - 페이지별 Paper hook class(`*-form-modal-paper`) 사용 안 함 — 도메인 스타일은 `contentClassName`·페이지 CSS
 *
 * @see docs/modal-guide.md
 */

/** 공지·FAQ 상세 팝업 가로 */
export const KL_MODAL_PAPER_WIDTH_DETAIL = 670;

/** @deprecated — `KL_MODAL_PAPER_WIDTH_DETAIL` 과 동일 */
export const SUPPORT_CS_MODAL_WIDTH = KL_MODAL_PAPER_WIDTH_DETAIL;

const detailModalPaperWidth = {
  width: KL_MODAL_PAPER_WIDTH_DETAIL,
  maxWidth: 'calc(100vw - 48px)',
};

/** 공지·FAQ 상세 */
export const supportDetailModalPaperSx = {
  ...detailModalPaperWidth,
  height: 'auto',
  maxHeight: 'calc(100vh - 48px)',
};

export const supportDetailModalPaperClassName = 'cs-detail-modal-paper';

/** 1:1 문의 상세 — 가로 670px */
export const KL_MODAL_PAPER_WIDTH_QNA_DETAIL = 670;

/** @deprecated — `KL_MODAL_PAPER_WIDTH_QNA_DETAIL` 과 동일 */
export const QNA_DETAIL_MODAL_WIDTH = KL_MODAL_PAPER_WIDTH_QNA_DETAIL;

export const qnaDetailModalPaperSx = {
  width: KL_MODAL_PAPER_WIDTH_QNA_DETAIL,
  maxWidth: 'calc(100vw - 48px)',
  height: 'auto',
  maxHeight: 'calc(100vh - 48px)',
};

export const qnaDetailModalPaperClassName = 'qna-detail-modal-paper';

/** 레거시 CS form paper (미사용 시 제거 검토) */
export const supportFormModalPaperSx = {
  ...detailModalPaperWidth,
  minHeight: 'min(720px, calc(100vh - 48px))',
};

export const supportFormModalPaperClassName = 'cs-form-modal-paper';

/** Form 팝업 기본 가로 */
export const KL_FORM_MODAL_DEFAULT_WIDTH = 550;

/** @deprecated — `KL_FORM_MODAL_DEFAULT_WIDTH` 와 동일 */
export const QNA_FORM_MODAL_WIDTH = KL_FORM_MODAL_DEFAULT_WIDTH;

const formModalPaperWidth = {
  width: KL_FORM_MODAL_DEFAULT_WIDTH,
  maxWidth: 'calc(100vw - 48px)',
};

/** Form 팝업 공통 — 가로·max-width·세로 상한 (`paperSx`만) */
export const klFormModalPaperSx = {
  ...formModalPaperWidth,
  minHeight: 'unset',
  maxHeight: 'calc(100vh - 48px)',
};

/** @deprecated — `klFormModalPaperSx` 사용 */
export const qnaFormModalPaperSx = klFormModalPaperSx;
/** @deprecated — `klFormModalPaperSx` 사용 */
export const faqFormModalPaperSx = klFormModalPaperSx;
/** @deprecated — `klFormModalPaperSx` 사용 */
export const noticeFormModalPaperSx = klFormModalPaperSx;
/** @deprecated — `klFormModalPaperSx` 사용 */
export const domainFormModalPaperSx = klFormModalPaperSx;
/** @deprecated — `klFormModalPaperSx` 사용 */
export const shareFormModalPaperSx = klFormModalPaperSx;
/** @deprecated — `klFormModalPaperSx` 사용 */
export const memberFormModalPaperSx = klFormModalPaperSx;
/** @deprecated — `klFormModalPaperSx` 사용 */
export const configFormModalPaperSx = klFormModalPaperSx;
/** @deprecated — `klFormModalPaperSx` 사용 */
export const actionWsModalPaperSx = klFormModalPaperSx;
/** @deprecated — `klFormModalPaperSx` 사용 */
export const semanticFormModalPaperSx = klFormModalPaperSx;
/** @deprecated — `klFormModalPaperSx` 사용 */
export const promptFormModalPaperSx = klFormModalPaperSx;

/** 홈 워크스페이스 이름 변경 */
export const KL_MODAL_PAPER_WIDTH_HOME_RENAME = 440;

export const homeRenameModalPaperSx = {
  width: KL_MODAL_PAPER_WIDTH_HOME_RENAME,
  maxWidth: 'calc(100vw - 48px)',
  minHeight: 'unset',
  maxHeight: 'calc(100vh - 48px)',
};

/** 긴 Form 팝업 (도메인 관리·워크스페이스 프롬프트 등) — 가로 670 */
export const KL_MODAL_PAPER_WIDTH_TALL_FORM = 670;

export const klTallFormModalPaperSx = {
  width: KL_MODAL_PAPER_WIDTH_TALL_FORM,
  maxWidth: 'calc(100vw - 48px)',
  minHeight: 'unset',
  maxHeight: 'calc(100vh - 48px)',
};

/** 홈 워크스페이스 프롬프트 변경 */
export const KL_MODAL_PAPER_WIDTH_HOME_PROMPT = KL_MODAL_PAPER_WIDTH_TALL_FORM;

/** @deprecated — `KL_MODAL_PAPER_WIDTH_HOME_PROMPT` 와 동일 */
export const HOME_PROMPT_MODAL_WIDTH = KL_MODAL_PAPER_WIDTH_HOME_PROMPT;

/** @deprecated — `klTallFormModalPaperSx` 사용 */
export const homePromptModalPaperSx = klTallFormModalPaperSx;

export const homePromptModalPaperClassName = 'home-prompt-modal-paper';

/** 팝업 하단 primary 버튼 — 제출 중 */
export const MODAL_SUBMIT_LABEL_SAVING = '저장 중...';

/** 팝업 하단 primary 버튼 — 수정·편집 모드 */
export const MODAL_SUBMIT_LABEL_SAVE = '저장';

/**
 * 등록/작성 vs 수정 팝업 하단 실행 버튼 문구
 * @param {boolean} isEditing 수정(편집) 모드 여부
 * @param {boolean} isSubmitting 제출 중 여부
 * @param {string} [createLabel='등록'] 신규 등록 시 문구
 */
export function getModalSubmitLabel(isEditing, isSubmitting, createLabel = '등록') {
    if (isSubmitting) return MODAL_SUBMIT_LABEL_SAVING;
    return isEditing ? MODAL_SUBMIT_LABEL_SAVE : createLabel;
}

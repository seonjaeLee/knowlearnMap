/** 프롬프트 보안 등급 — 목록 배지·모달 select 공통 */
export const PROMPT_SECURITY_LEVELS = [
  { value: 'TEMP', label: '임시', tone: 'neutral' },
  { value: 'PUBLIC', label: '공개', tone: 'ok' },
  { value: 'INTERNAL', label: '내부용', tone: 'info' },
  { value: 'CONFIDENTIAL', label: '기밀', tone: 'warn' },
  { value: 'TOP_SECRET', label: '극비', tone: 'danger' },
];

export const PROMPT_SECURITY_SELECT_ITEMS = PROMPT_SECURITY_LEVELS.map((l) => ({
  value: l.value,
  label: l.label,
}));

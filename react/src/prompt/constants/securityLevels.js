/** 프롬프트 보안 등급 — 목록 배지·모달 select 공통 */
export const PROMPT_SECURITY_LEVELS = [
  { value: 'TEMP', label: '임시', badge: 'admin-badge admin-badge-neutral' },
  { value: 'PUBLIC', label: '공개', badge: 'admin-badge admin-badge-success' },
  { value: 'INTERNAL', label: '내부용', badge: 'admin-badge admin-badge-info' },
  { value: 'CONFIDENTIAL', label: '기밀', badge: 'admin-badge admin-badge-warn' },
  { value: 'TOP_SECRET', label: '극비', badge: 'admin-badge admin-badge-danger' },
];

export const PROMPT_SECURITY_SELECT_ITEMS = PROMPT_SECURITY_LEVELS.map((l) => ({
  value: l.value,
  label: l.label,
}));

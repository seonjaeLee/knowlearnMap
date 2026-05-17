/**
 * 고객센터(공지·FAQ·1:1 문의) 로컬 UI 검수용 mock.
 * 로컬: `.env.local`에 `VITE_ENABLE_SUPPORT_MOCK=true`
 * 원격/DB: 해당 변수 없음 또는 `false` (기본 API 연동)
 */
export const isSupportMockEnabled = import.meta.env.VITE_ENABLE_SUPPORT_MOCK === 'true';

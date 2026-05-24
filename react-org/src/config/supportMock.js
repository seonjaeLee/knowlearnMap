/**
 * 고객센터(공지·FAQ·1:1) 로컬 UI용 mock.
 * - `VITE_ENABLE_SUPPORT_MOCK=true` → 항상 mock
 * - `npm run dev`(DEV) → 기본 mock (`VITE_ENABLE_SUPPORT_MOCK=false`면 API)
 * - 프로덕션 빌드 → API (mock는 env로만)
 */
export const isSupportMockEnabled =
  import.meta.env.VITE_ENABLE_SUPPORT_MOCK === 'true'
  || (import.meta.env.DEV && import.meta.env.VITE_ENABLE_SUPPORT_MOCK !== 'false');

/** 목록 shell 안 BasicTable — loading·error 시에도 thead 유지 (고객센터·어드민 공통) */
export function listTableEmptyState({
  loading,
  loadError,
  loadingMessage = '불러오는 중…',
  emptyVariant = 'default',
  emptyMessage,
}) {
  if (loading) {
    return { variant: 'default', message: loadingMessage };
  }
  if (loadError) {
    return { variant: 'default', message: loadError };
  }
  if (emptyMessage) {
    return { variant: emptyVariant, message: emptyMessage };
  }
  return { variant: emptyVariant };
}

/** @deprecated `listTableEmptyState` 사용 */
export const supportTableEmptyState = listTableEmptyState;

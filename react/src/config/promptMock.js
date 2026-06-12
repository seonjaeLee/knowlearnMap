/**
 * 프롬프트 관리 로컬 UI용 mock.
 * - `VITE_ENABLE_PROMPT_MOCK=true` → 항상 mock
 * - `npm run dev`(DEV) → 기본 mock (`VITE_ENABLE_PROMPT_MOCK=false`면 API)
 * - 프로덕션 빌드 → API (mock는 env로만)
 */
export const isPromptMockEnabled =
  import.meta.env.VITE_ENABLE_PROMPT_MOCK === 'true'
  || (import.meta.env.DEV && import.meta.env.VITE_ENABLE_PROMPT_MOCK !== 'false');

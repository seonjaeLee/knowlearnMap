/** 프롬프트 목록·상세 공통 베이스 경로 (어드민 LNB vs 직접 라우트) */
export function getPromptsBasePath(pathname = '') {
  return String(pathname).startsWith('/admin') ? '/admin/prompts' : '/prompts';
}

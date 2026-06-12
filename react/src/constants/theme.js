/** localStorage 키 — 표시 테마 (light | dark | system) */
export const KL_THEME_MODE_STORAGE_KEY = 'kl-theme-mode';

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

/** 인증 라우트 — 항상 라이트 UI (전역 테마 무관) */
export const AUTH_ROUTE_PREFIXES = [
  '/login',
  '/signup',
  '/verify-email',
  '/set-password',
  '/reset-password',
];

export function isAuthRoutePath(pathname = '') {
  return AUTH_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function resolveThemeFromMode(mode) {
  if (mode === THEME_MODES.DARK) return THEME_MODES.DARK;
  if (mode === THEME_MODES.LIGHT) return THEME_MODES.LIGHT;
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return THEME_MODES.DARK;
  }
  return THEME_MODES.LIGHT;
}

export function readStoredThemeMode() {
  try {
    const stored = localStorage.getItem(KL_THEME_MODE_STORAGE_KEY);
    if (stored === THEME_MODES.LIGHT || stored === THEME_MODES.DARK || stored === THEME_MODES.SYSTEM) {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return THEME_MODES.SYSTEM;
}

export function applyDocumentTheme(resolved) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', resolved);
  document.documentElement.style.colorScheme = resolved;
}

/** index.html 인라인 스크립트와 동일 로직 — FOUC 방지 */
export function getInitialDocumentTheme(pathname) {
  if (isAuthRoutePath(pathname)) return THEME_MODES.LIGHT;
  return resolveThemeFromMode(readStoredThemeMode());
}

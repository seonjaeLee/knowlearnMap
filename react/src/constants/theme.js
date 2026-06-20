/** localStorage 키 — 표시 테마 (light | dark) */
export const KL_THEME_MODE_STORAGE_KEY = 'kl-theme-mode';

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  /** @deprecated UI 제거 — stored 값 마이그레이션용 */
  SYSTEM: 'system',
};

export function isThemeModeSelectable(mode) {
  return mode === THEME_MODES.LIGHT || mode === THEME_MODES.DARK;
}

/** 인증 라우트 경로 (라우팅·레이아웃 분기용 — 테마 강제 라이트 아님) */
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
  return THEME_MODES.LIGHT;
}

export function readStoredThemeMode() {
  try {
    const stored = localStorage.getItem(KL_THEME_MODE_STORAGE_KEY);
    if (stored === THEME_MODES.LIGHT || stored === THEME_MODES.DARK) {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return THEME_MODES.LIGHT;
}

export function applyDocumentTheme(resolved) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', resolved);
  document.documentElement.style.colorScheme = resolved;
}

/** index.html 인라인 스크립트와 동일 로직 — FOUC 방지 */
export function getInitialDocumentTheme(_pathname) {
  return resolveThemeFromMode(readStoredThemeMode());
}

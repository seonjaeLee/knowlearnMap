/**
 * 브랜드 주색 — JS(MUI 등)용. SSOT는 `assets/styles/tokens/kl-tokens-brand-map.css`
 * 고객사별 CSS brand 파일만 바꾸면 MUI도 document 토큰을 읽어 동기화된다.
 */

const BRAND_FALLBACK = {
  primary: '#5a57e6',
  primaryHover: '#4845c4',
};

function readCssVar(name, fallback) {
  if (typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

/** MUI palette 등 — 현재 document `data-theme` 기준 */
export function readBrandColorsFromDocument() {
  return {
    primary: readCssVar('--kl-brand-primary', BRAND_FALLBACK.primary),
    primaryHover: readCssVar('--kl-brand-primary-hover', BRAND_FALLBACK.primaryHover),
  };
}

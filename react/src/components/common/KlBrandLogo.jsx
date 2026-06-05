import { Link } from 'react-router-dom';
import './KlBrandLogo.css';

/**
 * 브랜드 심볼 — 지식 그래프(노드) + 맵 접힘 형태 (커스텀 SVG).
 */
export function KlBrandMark({ className = 'kl-brand-mark' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="7"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="10.5" cy="11" r="2" fill="currentColor" />
      <circle cx="10.5" cy="21" r="2" fill="currentColor" />
      <circle cx="15.5" cy="16" r="2" fill="currentColor" />
      <path
        d="M10.5 11L15.5 16M10.5 21L15.5 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M19 10.5L25.5 12.5V21.5L19 19.5V10.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M19 10.5V19.5M22.25 11.75L22.25 20.25"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function KlBrandLogo({ showWordmark = true, className = '' }) {
  const rootClass = ['kl-brand-logo', className].filter(Boolean).join(' ');

  return (
    <span className={rootClass}>
      <KlBrandMark />
      {showWordmark && (
        <span className="kl-brand-wordmark">
          <span className="kl-brand-wordmark__knowlearn">knowlearn</span>
          <span className="kl-brand-wordmark__map">Map</span>
        </span>
      )}
    </span>
  );
}

/** LNB 상단 — 접힘 시 심볼만 */
function LnbBrandLogo({ collapsed = false }) {
  return (
    <Link to="/workspaces" className="lnb-logo-link" aria-label="knowlearnMap 홈">
      <KlBrandLogo showWordmark={!collapsed} />
    </Link>
  );
}

export default LnbBrandLogo;

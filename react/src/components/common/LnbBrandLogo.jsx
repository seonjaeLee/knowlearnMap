import { Link } from 'react-router-dom';

/**
 * LNB 브랜드 심볼 — 지식 그래프(노드) + 맵 접힘 형태.
 * 기존 knowlearn_logo_w.png 아이콘 톤(스카이 블루·라운드 프레임)을 CSS/SVG로 재현.
 */
function LnbBrandMark({ className = '' }) {
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

function LnbBrandLogo({ collapsed = false }) {
  return (
    <Link to="/workspaces" className="lnb-logo-link" aria-label="knowlearnMap 홈">
      <LnbBrandMark className="lnb-brand-mark" />
      {!collapsed && (
        <span className="lnb-brand-wordmark">
          <span className="lnb-brand-wordmark__knowlearn">knowlearn</span>
          <span className="lnb-brand-wordmark__map">Map</span>
        </span>
      )}
    </Link>
  );
}

export default LnbBrandLogo;

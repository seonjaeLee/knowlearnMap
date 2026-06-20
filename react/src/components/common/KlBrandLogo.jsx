import { Link } from 'react-router-dom';
import knowlearnMapSymbol from '../../assets/knowlearnMap.svg';
import knowlearnMapSymbolDark from '../../assets/knowlearnMap-dark.svg';
import './KlBrandLogo.css';

/** 심볼 + knowlearnMap 워드마크 — LNB 가로형 (로그인 SSOT 심볼·컬러) */
export function KlBrandLogo({ showWordmark = true, className = '' }) {
  const rootClass = ['kl-brand-logo', 'kl-brand-logo--row', className].filter(Boolean).join(' ');

  return (
    <span className={rootClass}>
      <img
        className="kl-brand-logo__symbol kl-brand-logo__symbol--light"
        src={knowlearnMapSymbol}
        alt=""
        aria-hidden
      />
      <img
        className="kl-brand-logo__symbol kl-brand-logo__symbol--dark"
        src={knowlearnMapSymbolDark}
        alt=""
        aria-hidden
      />
      {showWordmark && (
        <span className="kl-brand-wordmark">
          knowlearn
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

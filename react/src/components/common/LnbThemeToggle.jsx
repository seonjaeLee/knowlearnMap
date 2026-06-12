import { Monitor, Moon, Sun } from 'lucide-react';
import { THEME_MODES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import KlTooltip from './KlTooltip';
import './LnbThemeToggle.css';

const OPTIONS = [
  { mode: THEME_MODES.LIGHT, Icon: Sun, label: '라이트 모드' },
  { mode: THEME_MODES.DARK, Icon: Moon, label: '다크 모드' },
  { mode: THEME_MODES.SYSTEM, Icon: Monitor, label: '시스템 설정' },
];

function LnbThemeToggle({ collapsed = false }) {
  const { themeMode, setThemeMode } = useTheme();

  return (
    <div
      className={`lnb-theme-toggle ${collapsed ? 'lnb-theme-toggle--collapsed' : ''}`}
      role="group"
      aria-label="테마"
    >
      {!collapsed && (
        <span className="lnb-theme-toggle__label">테마</span>
      )}
      <div className="lnb-theme-toggle__buttons">
        {OPTIONS.map(({ mode, Icon, label }) => {
          const isActive = themeMode === mode;
          const btn = (
            <button
              key={mode}
              type="button"
              className={`lnb-theme-toggle__btn ${isActive ? 'is-active' : ''}`}
              aria-label={label}
              aria-pressed={isActive}
              onClick={() => setThemeMode(mode)}
            >
              <Icon size={14} aria-hidden />
            </button>
          );
          return collapsed ? (
            <KlTooltip key={mode} title={label} placement="right" enterDelay={0} leaveDelay={60}>
              <span className="lnb-theme-toggle__tooltip-wrap">{btn}</span>
            </KlTooltip>
          ) : (
            <KlTooltip key={mode} title={label} placement="top" enterDelay={300} leaveDelay={0}>
              <span className="lnb-theme-toggle__tooltip-wrap">{btn}</span>
            </KlTooltip>
          );
        })}
      </div>
    </div>
  );
}

export default LnbThemeToggle;

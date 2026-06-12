import { Monitor, Moon, Sun } from 'lucide-react';
import { THEME_MODES, isThemeModeSelectable } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import KlTooltip from './KlTooltip';
import './LnbThemeToggle.css';

const OPTIONS = [
  { mode: THEME_MODES.LIGHT, Icon: Sun, label: '라이트 모드' },
  { mode: THEME_MODES.DARK, Icon: Moon, label: '다크 모드', disabledLabel: '다크 모드 (준비 중)' },
  { mode: THEME_MODES.SYSTEM, Icon: Monitor, label: '시스템 설정', disabledLabel: '시스템 설정 (준비 중)' },
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
        {OPTIONS.map(({ mode, Icon, label, disabledLabel }) => {
          const selectable = isThemeModeSelectable(mode);
          const isActive = selectable && themeMode === mode;
          const tooltipTitle = selectable ? label : (disabledLabel || label);
          const btn = (
            <button
              key={mode}
              type="button"
              className={`lnb-theme-toggle__btn ${isActive ? 'is-active' : ''} ${!selectable ? 'is-disabled' : ''}`}
              aria-label={tooltipTitle}
              aria-pressed={isActive}
              disabled={!selectable}
              onClick={() => setThemeMode(mode)}
            >
              <Icon size={14} aria-hidden />
            </button>
          );
          return collapsed ? (
            <KlTooltip key={mode} title={tooltipTitle} placement="right" enterDelay={0} leaveDelay={60}>
              <span className="lnb-theme-toggle__tooltip-wrap">{btn}</span>
            </KlTooltip>
          ) : (
            <KlTooltip key={mode} title={tooltipTitle} placement="top" enterDelay={300} leaveDelay={0}>
              <span className="lnb-theme-toggle__tooltip-wrap">{btn}</span>
            </KlTooltip>
          );
        })}
      </div>
    </div>
  );
}

export default LnbThemeToggle;

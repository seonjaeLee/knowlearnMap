import {
  useCallback, useEffect, useId, useLayoutEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import { MoreVertical } from 'lucide-react';
import styles from './ToolbarMoreMenu.module.scss';

/**
 * 테이블 툴바용 ⋮ overflow 메뉴 (워크스페이스 .more-btn-container / .popup-menu 패턴).
 */
function ToolbarMoreMenu({ items, ariaLabel = '추가 메뉴', className = '' }) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const containerRef = useRef(null);
  const menuId = useId();

  const close = useCallback(() => setOpen(false), []);

  const handleToggle = useCallback((event) => {
    event.stopPropagation();
    setOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        close();
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') close();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, close]);

  useLayoutEffect(() => {
    if (!open) {
      setOpenUp(false);
      return undefined;
    }

    const updatePlacement = () => {
      const root = containerRef.current;
      if (!root) return;
      const menuEl = root.querySelector(`.${styles.menu}`);
      if (!menuEl) return;

      const scrollParent = root.closest('.table-area, .kl-split-table-area, .main-content')
        || document.documentElement;
      const pr = scrollParent.getBoundingClientRect();
      const tr = root.getBoundingClientRect();
      const menuHeight = menuEl.offsetHeight;
      const gapPx = 8; /* var(--spacing-sm) */
      const spaceBelow = pr.bottom - tr.bottom;
      const spaceAbove = tr.top - pr.top;

      let nextOpenUp = false;
      if (spaceBelow < menuHeight + gapPx) {
        nextOpenUp = spaceAbove >= menuHeight + gapPx || spaceAbove > spaceBelow;
      }
      setOpenUp(nextOpenUp);
    };

    updatePlacement();
    requestAnimationFrame(updatePlacement);

    const root = containerRef.current;
    const scrollParent = root?.closest('.table-area, .kl-split-table-area, .main-content');
    scrollParent?.addEventListener('scroll', updatePlacement, { passive: true });
    window.addEventListener('resize', updatePlacement);

    return () => {
      scrollParent?.removeEventListener('scroll', updatePlacement);
      window.removeEventListener('resize', updatePlacement);
    };
  }, [open]);

  if (!items?.length) return null;

  const rootClass = [styles.container, className].filter(Boolean).join(' ');

  return (
    <div ref={containerRef} className={rootClass}>
      <button
        type="button"
        className={['kl-toolbar-icon-toggle', open ? 'is-active' : ''].filter(Boolean).join(' ')}
        onClick={handleToggle}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
      >
        <MoreVertical size={18} aria-hidden />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className={[styles.menu, openUp ? styles.menuOpenUp : ''].filter(Boolean).join(' ')}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className={[
                styles.menuItem,
                item.variant === 'danger' ? styles.menuItemDanger : '',
              ].filter(Boolean).join(' ')}
              disabled={item.disabled}
              onClick={(event) => {
                event.stopPropagation();
                if (!item.disabled) {
                  item.onClick?.(event);
                  close();
                }
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

ToolbarMoreMenu.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.node.isRequired,
    icon: PropTypes.node,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    variant: PropTypes.oneOf(['default', 'danger']),
  })).isRequired,
  ariaLabel: PropTypes.string,
  className: PropTypes.string,
};

ToolbarMoreMenu.defaultProps = {
  ariaLabel: '추가 메뉴',
  className: '',
};

export default ToolbarMoreMenu;

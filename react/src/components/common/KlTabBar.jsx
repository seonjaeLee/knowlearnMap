import { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useKlTabIndicator } from '../../hooks/useKlTabIndicator';
import { useKlHorizontalScroll } from '../../hooks/useKlHorizontalScroll';

const SCROLL_STEP = 120;

function TabButton({ tab, value, setTabRef, onChange }) {
  return (
    <button
      ref={(el) => setTabRef(tab.id, el)}
      type="button"
      role="tab"
      aria-selected={value === tab.id}
      aria-controls={tab.panelId}
      id={tab.tabId}
      disabled={tab.disabled}
      className={[
        'kl-tab-bar__tab',
        value === tab.id ? 'is-active' : '',
        tab.className,
      ].filter(Boolean).join(' ')}
      onClick={() => onChange(tab.id)}
    >
      {tab.icon ?? null}
      {tab.label}
    </button>
  );
}

/**
 * 슬라이딩 indicator가 있는 2차 탭 바 (SSOT)
 * @see assets/styles/patterns/kl-tab-bar.css
 */
function KlTabBar({
  tabs,
  value,
  onChange,
  ariaLabel,
  variant = 'default',
  actions = null,
  className = '',
  scrollable = false,
  scrollTail = false,
  scrollTailAfterIndex = 0,
  scrollFade = false,
  scrollNav = false,
}) {
  const bodyRef = useRef(null);
  const useTailScroll = scrollTail && tabs.length > scrollTailAfterIndex + 1;

  const tailStartIndex = useMemo(() => {
    if (!useTailScroll) return tabs.length;
    return scrollTailAfterIndex + 1;
  }, [useTailScroll, scrollTailAfterIndex, tabs.length]);

  const pinnedTabs = useTailScroll ? tabs.slice(0, tailStartIndex) : tabs;
  const tailTabs = useTailScroll ? tabs.slice(tailStartIndex) : [];

  const { scrollRef, setTabRef, indicator } = useKlTabIndicator(
    value,
    useTailScroll ? bodyRef : null,
  );

  const {
    scrollRef: tailScrollRef,
    fade: tailFade,
    canScroll: tailCanScroll,
    scrollBy: tailScrollBy,
    handleWheel: tailHandleWheel,
    update: updateTailScroll,
  } = useKlHorizontalScroll(useTailScroll);

  useEffect(() => {
    if (useTailScroll) {
      updateTailScroll();
    }
  }, [useTailScroll, tailTabs.length, tabs, updateTailScroll]);

  useEffect(() => {
    if (!useTailScroll || pinnedTabs.some((t) => t.id === value)) return;
    const tailEl = tailScrollRef.current;
    if (!tailEl) return;
    const activeBtn = tailEl.querySelector('.kl-tab-bar__tab.is-active');
    activeBtn?.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' });
    updateTailScroll();
  }, [value, useTailScroll, pinnedTabs, updateTailScroll, tailScrollRef]);

  const rootClass = [
    'kl-tab-bar',
    variant !== 'default' ? `kl-tab-bar--${variant}` : '',
    useTailScroll ? 'kl-tab-bar--scroll-tail' : '',
    className,
  ].filter(Boolean).join(' ');

  const renderTab = (tab) => (
    <TabButton
      key={String(tab.id)}
      tab={tab}
      value={value}
      setTabRef={setTabRef}
      onChange={onChange}
    />
  );

  const indicatorNode = (
    <span
      className="kl-tab-bar__indicator"
      aria-hidden
      style={{
        width: indicator.visible ? indicator.width : 0,
        transform: `translateX(${indicator.left}px)`,
        opacity: indicator.visible ? 1 : 0,
      }}
    />
  );

  if (useTailScroll) {
    const tailScrollClass = [
      'kl-tab-bar__scroll',
      'kl-tab-bar__scroll--enabled',
      scrollFade && tailFade.left ? 'fade-l' : '',
      scrollFade && tailFade.right ? 'fade-r' : '',
    ].filter(Boolean).join(' ');

    return (
      <div className={rootClass}>
        <div className="kl-tab-bar__body" ref={bodyRef}>
          <div className="kl-tab-bar__track" role="tablist" aria-label={ariaLabel}>
            <div className="kl-tab-bar__pinned">
              {pinnedTabs.map((tab) => renderTab(tab))}
            </div>
            {tailTabs.length > 0 ? (
              <div className="kl-tab-bar__tail">
                {scrollNav && tailCanScroll.left ? (
                  <button
                    type="button"
                    className="kl-tab-bar__scroll-btn"
                    aria-label="변수 탭 왼쪽으로"
                    onClick={() => tailScrollBy(-SCROLL_STEP)}
                  >
                    <ChevronLeft size={14} strokeWidth={2.2} aria-hidden />
                  </button>
                ) : null}
                <div
                  className={tailScrollClass}
                  ref={tailScrollRef}
                  onWheel={tailHandleWheel}
                >
                  <div className="kl-tab-bar__list kl-tab-bar__list--tail">
                    {tailTabs.map((tab) => renderTab(tab))}
                  </div>
                </div>
                {scrollNav && tailCanScroll.right ? (
                  <button
                    type="button"
                    className="kl-tab-bar__scroll-btn"
                    aria-label="변수 탭 오른쪽으로"
                    onClick={() => tailScrollBy(SCROLL_STEP)}
                  >
                    <ChevronRight size={14} strokeWidth={2.2} aria-hidden />
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
          {indicatorNode}
        </div>
        {actions ? <div className="kl-tab-bar__actions">{actions}</div> : null}
      </div>
    );
  }

  const scrollClass = [
    'kl-tab-bar__scroll',
    scrollable ? 'kl-tab-bar__scroll--enabled' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={rootClass}>
      <div className={scrollClass} ref={scrollRef}>
        <div className="kl-tab-bar__list" role="tablist" aria-label={ariaLabel}>
          {tabs.map((tab) => renderTab(tab))}
          {indicatorNode}
        </div>
      </div>
      {actions ? <div className="kl-tab-bar__actions">{actions}</div> : null}
    </div>
  );
}

const tabShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.node.isRequired,
  icon: PropTypes.node,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  tabId: PropTypes.string,
  panelId: PropTypes.string,
});

KlTabBar.propTypes = {
  tabs: PropTypes.arrayOf(tabShape).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  ariaLabel: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'subtle', 'page', 'compact', 'panel']),
  actions: PropTypes.node,
  className: PropTypes.string,
  scrollable: PropTypes.bool,
  scrollTail: PropTypes.bool,
  scrollTailAfterIndex: PropTypes.number,
  scrollFade: PropTypes.bool,
  scrollNav: PropTypes.bool,
};

KlTabBar.defaultProps = {
  ariaLabel: undefined,
  variant: 'default',
  actions: null,
  className: '',
  scrollable: false,
  scrollTail: false,
  scrollTailAfterIndex: 0,
  scrollFade: false,
  scrollNav: false,
};

export default KlTabBar;

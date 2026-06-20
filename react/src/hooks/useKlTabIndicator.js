import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const INITIAL = { left: 0, width: 0, visible: false };

/**
 * KlTabBar 슬라이딩 indicator — active 탭 버튼 width/left 측정
 * @param {string|number} activeId
 * @param {import('react').RefObject<HTMLElement>|null} [measureRef] scrollTail 등 — 측정 기준 컨테이너
 */
export function useKlTabIndicator(activeId, measureRef = null) {
  const scrollRef = useRef(null);
  const tabRefs = useRef(new Map());
  const [indicator, setIndicator] = useState(INITIAL);

  const setTabRef = useCallback((id, el) => {
    if (el) {
      tabRefs.current.set(id, el);
    } else {
      tabRefs.current.delete(id);
    }
  }, []);

  const update = useCallback(() => {
    const scrollEl = measureRef?.current ?? scrollRef.current;
    const activeEl = tabRefs.current.get(activeId);
    if (!scrollEl || !activeEl) {
      setIndicator((prev) => (prev.visible ? INITIAL : prev));
      return;
    }
    const scrollRect = scrollEl.getBoundingClientRect();
    const tabRect = activeEl.getBoundingClientRect();
    setIndicator({
      left: tabRect.left - scrollRect.left + scrollEl.scrollLeft,
      width: tabRect.width,
      visible: true,
    });
  }, [activeId, measureRef]);

  useLayoutEffect(() => {
    update();
  }, [update]);

  useEffect(() => {
    const scrollEl = measureRef?.current ?? scrollRef.current;
    if (!scrollEl) return undefined;

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(scrollEl);
    tabRefs.current.forEach((el) => ro?.observe(el));

    scrollEl.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      ro?.disconnect();
      scrollEl.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update, activeId, measureRef]);

  return { scrollRef, setTabRef, indicator };
}

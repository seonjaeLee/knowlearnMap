import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const INITIAL = { left: false, right: false };

/**
 * 가로 스크롤 영역 — fade-l / fade-r · 좌우 이동 가능 여부
 */
export function useKlHorizontalScroll(enabled = true) {
  const scrollRef = useRef(null);
  const [fade, setFade] = useState(INITIAL);
  const [canScroll, setCanScroll] = useState(INITIAL);

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !enabled) {
      setFade(INITIAL);
      setCanScroll(INITIAL);
      return;
    }

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    const { scrollLeft } = el;
    const hasLeft = scrollLeft > 2;
    const hasRight = maxScrollLeft > 2 && scrollLeft < maxScrollLeft - 2;

    setFade({ left: hasLeft, right: hasRight });
    setCanScroll({ left: hasLeft, right: hasRight });
  }, [enabled]);

  useLayoutEffect(() => {
    update();
  }, [update]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !enabled) return undefined;

    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(el);
    Array.from(el.children).forEach((child) => ro?.observe(child));

    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      ro?.disconnect();
    };
  }, [update, enabled]);

  const scrollBy = useCallback((delta) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  }, []);

  const handleWheel = useCallback((event) => {
    const el = scrollRef.current;
    if (!el) return;
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      el.scrollBy({ left: event.deltaY, behavior: 'auto' });
    }
  }, []);

  return { scrollRef, fade, canScroll, scrollBy, handleWheel, update };
}

import { useEffect, useRef } from 'react';

/**
 * BasicTable · 버전 히스토리 등 — `basic-table-shell` / `kl-table-row-detail__card` 가로 스크롤 페이드.
 * scroll 래퍼 ref를 반환하며, shell에 `fade-l` / `fade-r` 클래스를 토글합니다.
 */
export function useBasicTableScrollFade(deps = []) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return undefined;

    const shellEl = scrollEl.closest('.basic-table-shell, .kl-table-row-detail__card');
    if (!shellEl) return undefined;

    const updateFade = () => {
      const maxScrollLeft = scrollEl.scrollWidth - scrollEl.clientWidth;
      shellEl.classList.toggle('fade-l', scrollEl.scrollLeft > 2);
      shellEl.classList.toggle('fade-r', maxScrollLeft > 2 && scrollEl.scrollLeft < maxScrollLeft - 2);
    };

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updateFade)
      : null;

    scrollEl.addEventListener('scroll', updateFade, { passive: true });
    resizeObserver?.observe(scrollEl);
    window.addEventListener('resize', updateFade);
    updateFade();

    return () => {
      scrollEl.removeEventListener('scroll', updateFade);
      window.removeEventListener('resize', updateFade);
      resizeObserver?.disconnect();
      shellEl.classList.remove('fade-l', 'fade-r');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scrollRef;
}

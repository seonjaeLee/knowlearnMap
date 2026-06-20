import { useCallback, useEffect, useRef, useState } from 'react';

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * @param {string | undefined} storageKey
 * @param {number} defaultPercent
 * @param {number} minPercent
 * @param {number} maxPercent
 */
export function loadSplitPanePercent(storageKey, defaultPercent, minPercent, maxPercent) {
  if (!storageKey || typeof window === 'undefined') return defaultPercent;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw == null || raw === '') return defaultPercent;
    const n = Number(raw);
    if (!Number.isFinite(n)) return defaultPercent;
    return clamp(n, minPercent, maxPercent);
  } catch {
    return defaultPercent;
  }
}

export function saveSplitPanePercent(storageKey, percent) {
  if (!storageKey || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey, String(percent));
  } catch {
    /* quota / private mode */
  }
}

/**
 * 좌·우 분할 패널의 좌측 너비(%) 드래그 조절.
 *
 * @param {object} options
 * @param {React.RefObject<HTMLElement>} options.containerRef 분할 컨테이너
 * @param {boolean} [options.leftCollapsed] true면 collapsedLeftWidthPx 고정
 * @param {number} [options.defaultLeftPercent]
 * @param {number} [options.minLeftPercent]
 * @param {number} [options.maxLeftPercent]
 * @param {number} [options.collapsedLeftWidthPx]
 * @param {number} [options.minCollapsedLeftWidthPx]
 * @param {boolean} [options.collapsedFitContent] 접힘 시 좌측 너비를 콘텐츠(제목 등)에 맞춤
 * @param {number} [options.minLeftWidthPx] 펼침 시 좌측 최소 px (clamp 하한)
 * @param {number} [options.maxLeftWidthPx] 펼침 시 좌측 최대 px (clamp 상한)
 * @param {string} [options.percentStorageKey] localStorage에 % 저장
 * @param {() => void} [options.onResizeStart] 드래그 시작 직전 (접힘 해제 등)
 */
export function useSplitPaneResize({
  containerRef,
  leftCollapsed = false,
  defaultLeftPercent = 45,
  minLeftPercent = 20,
  maxLeftPercent = 60,
  collapsedLeftWidthPx = 300,
  minCollapsedLeftWidthPx = 250,
  collapsedFitContent = false,
  minLeftWidthPx,
  maxLeftWidthPx,
  percentStorageKey,
  onResizeStart,
}) {
  const [leftPercent, setLeftPercent] = useState(() => loadSplitPanePercent(
    percentStorageKey,
    defaultLeftPercent,
    minLeftPercent,
    maxLeftPercent,
  ));
  const [isResizing, setIsResizing] = useState(false);
  const leftPercentRef = useRef(leftPercent);

  useEffect(() => {
    leftPercentRef.current = leftPercent;
  }, [leftPercent]);

  const effectiveCollapsed = leftCollapsed && !isResizing;

  const buildExpandedLeftStyle = () => {
    if (minLeftWidthPx != null || maxLeftWidthPx != null) {
      const lo = minLeftWidthPx != null ? `${minLeftWidthPx}px` : '0px';
      const hi = maxLeftWidthPx != null ? `${maxLeftWidthPx}px` : `${leftPercent}%`;
      const basis = `clamp(${lo}, ${leftPercent}%, ${hi})`;
      return {
        flex: `0 0 ${basis}`,
        maxWidth: basis,
        minWidth: 0,
      };
    }
    return {
      flex: `0 0 ${leftPercent}%`,
      maxWidth: `${leftPercent}%`,
      minWidth: 0,
    };
  };

  const leftPaneStyle = effectiveCollapsed
    ? (collapsedFitContent
      ? {
        flex: '0 0 auto',
        width: 'auto',
        maxWidth: 'none',
        minWidth: 0,
      }
      : {
        flex: `0 0 ${collapsedLeftWidthPx}px`,
        maxWidth: `${collapsedLeftWidthPx}px`,
        minWidth: `${minCollapsedLeftWidthPx}px`,
      })
    : buildExpandedLeftStyle();

  const handleResizerPointerDown = useCallback((event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();

    onResizeStart?.();

    const container = containerRef.current;
    if (!container) return;

    setIsResizing(true);
    document.body.classList.add('kl-split-pane-resizing');

    const onMove = (ev) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) return;
      const offsetX = ev.clientX - rect.left;
      const next = clamp((offsetX / rect.width) * 100, minLeftPercent, maxLeftPercent);
      setLeftPercent(next);
    };

    const onUp = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      document.body.classList.remove('kl-split-pane-resizing');
      setIsResizing(false);
      saveSplitPanePercent(percentStorageKey, leftPercentRef.current);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
  }, [
    containerRef,
    minLeftPercent,
    maxLeftPercent,
    onResizeStart,
    percentStorageKey,
  ]);

  return {
    leftPercent,
    setLeftPercent,
    leftPaneStyle,
    isResizing,
    effectiveCollapsed,
    collapsedFitContent,
    handleResizerPointerDown,
  };
}

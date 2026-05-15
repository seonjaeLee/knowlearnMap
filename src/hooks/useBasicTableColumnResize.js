import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
}

function loadStoredWidths(storageKey, defaultWidths, minWidths) {
    if (!storageKey || typeof window === 'undefined') return defaultWidths;
    try {
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) return defaultWidths;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length !== defaultWidths.length) return defaultWidths;
        if (!parsed.every((x) => typeof x === 'number' && Number.isFinite(x) && x > 0)) return defaultWidths;
        return parsed.map((w, i) => Math.max(minWidths[i] ?? 40, w));
    } catch {
        return defaultWidths;
    }
}

/**
 * `BasicTable`용 열 너비(px) 상태 + 헤더 경계 드래그 리사이즈.
 * 반환 `columns`의 `width`는 `'260px'` 문자열이며, 마지막 열을 제외한 헤더에 `resizeBoundaryAfter` 인덱스가 붙습니다.
 * `BasicTable`에 `onColumnResizeMouseDown={startResize}` 를 넘깁니다.
 *
 * @param {object} opts
 * @param {{ id: string, label: import('react').ReactNode, defaultWidthPx?: number, minWidthPx?: number, align?: 'left'|'center'|'right', ellipsis?: boolean, flex?: boolean }[]} opts.definitions
 *        `ellipsis: false` — 태그·버튼 등 복합 셀에서 말줄임 래퍼 비활성(기본은 true).
 *        `flex: true` — `width` 미지정(표 너비의 나머지). `defaultWidthPx` 없으면 `minWidthPx`로 리사이즈 상태만 유지.
 * @param {string} [opts.storageKey]
 * @param {boolean} [opts.enabled=true]
 */
export function useBasicTableColumnResize({ definitions, storageKey, enabled = true }) {
    const count = definitions.length;
    const minWidthsPx = useMemo(() => definitions.map((d) => d.minWidthPx ?? 40), [definitions]);
    const defaultWidthsPx = useMemo(
        () => definitions.map((d) => d.defaultWidthPx ?? d.minWidthPx ?? 80),
        [definitions]
    );

    if (minWidthsPx.length !== defaultWidthsPx.length || count === 0) {
        throw new Error('useBasicTableColumnResize: definitions가 비었거나 defaultWidthPx/minWidthPx 배열이 맞지 않습니다.');
    }

    const [widths, setWidths] = useState(() =>
        loadStoredWidths(storageKey, defaultWidthsPx, minWidthsPx)
    );

    const widthsRef = useRef(widths);
    useEffect(() => {
        widthsRef.current = widths;
    }, [widths]);

    const startResize = useCallback(
        (boundaryIndex, event) => {
            if (!enabled) return;
            event.preventDefault();
            event.stopPropagation();

            const startX = event.clientX;
            const start = [...widthsRef.current];
            const i = boundaryIndex;
            if (i < 0 || i >= start.length - 1) return;

            const pairTotal = start[i] + start[i + 1];
            const minL = minWidthsPx[i];
            const minR = minWidthsPx[i + 1];

            const lastPairRef = { left: start[i], right: start[i + 1] };
            let rafId = null;
            let scheduled = false;

            const flushPairToState = (left, right) => {
                setWidths((prev) => {
                    const next = [...prev];
                    next[i] = left;
                    next[i + 1] = right;
                    widthsRef.current = next;
                    return next;
                });
            };

            const onMove = (ev) => {
                const delta = ev.clientX - startX;
                let nextLeft = start[i] + delta;
                nextLeft = clamp(nextLeft, minL, pairTotal - minR);
                const nextRight = pairTotal - nextLeft;
                lastPairRef.left = nextLeft;
                lastPairRef.right = nextRight;

                if (scheduled) return;
                scheduled = true;
                rafId = window.requestAnimationFrame(() => {
                    scheduled = false;
                    rafId = null;
                    flushPairToState(lastPairRef.left, lastPairRef.right);
                });
            };

            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                document.body.style.removeProperty('cursor');
                document.body.style.removeProperty('user-select');

                if (rafId != null) {
                    window.cancelAnimationFrame(rafId);
                    rafId = null;
                }
                scheduled = false;

                const nl = lastPairRef.left;
                const nr = lastPairRef.right;
                setWidths((prev) => {
                    const next = [...prev];
                    next[i] = nl;
                    next[i + 1] = nr;
                    widthsRef.current = next;
                    if (storageKey && typeof window !== 'undefined') {
                        try {
                            window.localStorage.setItem(storageKey, JSON.stringify(next));
                        } catch {
                            /* ignore quota */
                        }
                    }
                    return next;
                });
            };

            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        },
        [enabled, minWidthsPx, storageKey]
    );

    const columns = useMemo(
        () =>
            definitions.map((d, idx) => ({
                id: d.id,
                label: d.label,
                align: d.align,
                width: d.flex ? undefined : `${widths[idx]}px`,
                ellipsis: d.ellipsis !== false,
                headLabelWrap: d.headLabelWrap,
                resizeBoundaryAfter: enabled && idx < definitions.length - 1 ? idx : undefined,
            })),
        [definitions, enabled, widths]
    );

    return {
        columns,
        startResize,
    };
}

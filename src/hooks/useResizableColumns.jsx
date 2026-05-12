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
 * `<table>` 열 너비를 엑셀처럼 드래그로 조절 (가로만).
 * 드래그 중에는 `<col>` DOM만 갱신하고, 종료 시 한 번만 React state + (선택) localStorage 반영.
 *
 * @param {object} opts
 * @param {number[]} opts.defaultWidthsPx 기본 열 너비(px), 순서대로
 * @param {number[]} opts.minWidthsPx 각 열 최소 너비(px)
 * @param {string} [opts.storageKey] 있으면 너비 배열 JSON 저장
 * @param {boolean} [opts.enabled=true]
 */
export function useResizableColumns({
    defaultWidthsPx,
    minWidthsPx,
    storageKey,
    enabled = true,
}) {
    if (minWidthsPx.length !== defaultWidthsPx.length) {
        throw new Error('useResizableColumns: minWidthsPx 길이가 defaultWidthsPx 와 같아야 합니다.');
    }

    const [widths, setWidths] = useState(() =>
        loadStoredWidths(storageKey, defaultWidthsPx, minWidthsPx)
    );

    const widthsRef = useRef(widths);
    const colRefs = useRef([]);
    useEffect(() => {
        widthsRef.current = widths;
    }, [widths]);

    useEffect(() => {
        if (!enabled) return;
        colRefs.current.forEach((col, i) => {
            if (col && widths[i] != null) {
                col.style.width = `${widths[i]}px`;
            }
        });
    }, [enabled, widths]);

    const applyPairImperative = useCallback((leftIdx, wLeft, wRight) => {
        const c0 = colRefs.current[leftIdx];
        const c1 = colRefs.current[leftIdx + 1];
        if (c0) c0.style.width = `${wLeft}px`;
        if (c1) c1.style.width = `${wRight}px`;
    }, []);

    const startResize = useCallback(
        (boundaryIndex, event) => {
            if (!enabled) return;
            event.preventDefault();
            event.stopPropagation();

            const startX = event.clientX;
            const start = [...widthsRef.current];
            const i = boundaryIndex;
            const pairTotal = start[i] + start[i + 1];
            const minL = minWidthsPx[i];
            const minR = minWidthsPx[i + 1];

            const onMove = (ev) => {
                const delta = ev.clientX - startX;
                let nextLeft = start[i] + delta;
                nextLeft = clamp(nextLeft, minL, pairTotal - minR);
                const nextRight = pairTotal - nextLeft;
                applyPairImperative(i, nextLeft, nextRight);
            };

            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                document.body.style.removeProperty('cursor');
                document.body.style.removeProperty('user-select');

                const c0 = colRefs.current[i];
                const c1 = colRefs.current[i + 1];
                const parsePx = (el) => {
                    if (!el?.style?.width) return null;
                    const m = /^([\d.]+)px$/.exec(el.style.width);
                    return m ? Number(m[1]) : null;
                };
                const wl = parsePx(c0) ?? widthsRef.current[i];
                const wr = parsePx(c1) ?? widthsRef.current[i + 1];

                setWidths((prev) => {
                    const next = [...prev];
                    next[i] = wl;
                    next[i + 1] = wr;
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
        [applyPairImperative, enabled, minWidthsPx, storageKey]
    );

    const setColRef = useCallback((index) => (el) => {
        colRefs.current[index] = el;
        if (el && widths[index] != null) {
            el.style.width = `${widths[index]}px`;
        }
    }, [widths]);

    const colGroup = useMemo(() => {
        if (!enabled) return null;
        return (
            <colgroup>
                {widths.map((w, idx) => (
                    <col key={idx} ref={setColRef(idx)} style={{ width: `${w}px` }} />
                ))}
            </colgroup>
        );
    }, [enabled, setColRef, widths]);

    return {
        enabled,
        widths,
        colGroup,
        startResize,
    };
}

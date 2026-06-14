import { useCallback, useState } from 'react';

/**
 * 클립보드 복사 + 시각 피드백 훅.
 *
 * const { copy, isCopied } = useCopyFeedback();
 *
 * copy(text)           — 단일 버튼
 * copy(text, 'key')    — 여러 버튼 구분
 * isCopied()           — 단일 버튼 상태
 * isCopied('key')      — 특정 버튼 상태
 *
 * @param {number} duration 피드백 유지 시간(ms). 기본 1500.
 */
export function useCopyFeedback(duration = 1500) {
  const [copiedKey, setCopiedKey] = useState(null);

  const copy = useCallback((text, key = '__default__') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), duration);
    });
  }, [duration]);

  const isCopied = useCallback((key = '__default__') => copiedKey === key, [copiedKey]);

  return { copy, isCopied };
}

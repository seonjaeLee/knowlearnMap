import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import BaseModal from './BaseModal';

/**
 * 위험 작업 확인용 모달.
 * 지정한 키워드(예: 도메인명)를 정확히 입력해야 확인 버튼이 활성화된다.
 *
 * props:
 *  - open      : 표시 여부
 *  - title     : 모달 제목
 *  - keyword   : 사용자가 정확히 입력해야 하는 문자열 (예: 도메인명)
 *  - message   : 본문 경고 (JSX 또는 문자열) — 무엇이 삭제되는지 등
 *  - confirmLabel / busyLabel : 확인 버튼 라벨
 *  - busy      : 진행 중(버튼 비활성 + busyLabel 표시, 닫기 차단)
 *  - onConfirm / onCancel
 */
export default function TypeToConfirmModal({
    open,
    title,
    keyword,
    message,
    confirmLabel = '삭제',
    busyLabel = '삭제 중...',
    busy = false,
    onConfirm,
    onCancel,
}) {
    const [value, setValue] = useState('');

    // 모달이 열릴 때마다 입력 초기화
    useEffect(() => {
        if (open) setValue('');
    }, [open]);

    const target = String(keyword ?? '').trim();
    const matched = target.length > 0 && value.trim() === target;

    return (
        <BaseModal
            open={open}
            title={title}
            onClose={busy ? () => {} : onCancel}
            maxWidth="xs"
            actionsAlign="right"
            actions={(
                <>
                    <Button variant="outlined" onClick={onCancel} disabled={busy}>
                        취소
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={onConfirm}
                        disabled={busy || !matched}
                    >
                        {busy ? busyLabel : confirmLabel}
                    </Button>
                </>
            )}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {typeof message === 'string'
                    ? <p style={{ margin: 0, whiteSpace: 'pre-line', lineHeight: 1.6 }}>{message}</p>
                    : message}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                    <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                        확인을 위해 <strong style={{ color: 'var(--color-text-primary)' }}>{keyword}</strong>
                        {' '}를 입력하세요
                    </label>
                    <input
                        type="text"
                        className="modal-input"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={keyword}
                        autoComplete="off"
                        autoFocus
                        disabled={busy}
                    />
                </div>
            </div>
        </BaseModal>
    );
}

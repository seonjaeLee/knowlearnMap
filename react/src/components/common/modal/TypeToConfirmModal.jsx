import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import { KL_MODAL_FORM_STACK_CLASS, klModalFormContentClassName } from './klModalForm';
import { homeRenameModalPaperSx } from './klModalPaper';

/**
 * 위험 작업 확인용 모달.
 * 지정한 키워드(예: 도메인명)를 정확히 입력해야 확인 버튼이 활성화된다.
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
            maxWidth={false}
            fullWidth={false}
            paperSx={homeRenameModalPaperSx}
            contentClassName={klModalFormContentClassName}
            actions={(
                <div className="kl-modal-actions-split">
                    <div className="kl-modal-actions-split__left" aria-hidden="true" />
                    <div className="kl-modal-actions-split__right">
                        <button
                            type="button"
                            className="kl-btn gray-outline md"
                            onClick={onCancel}
                            disabled={busy}
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            className="kl-btn danger-full md"
                            onClick={onConfirm}
                            disabled={busy || !matched}
                        >
                            {busy ? busyLabel : confirmLabel}
                        </button>
                    </div>
                </div>
            )}
        >
            <div className={KL_MODAL_FORM_STACK_CLASS}>
                {typeof message === 'string' ? (
                    <p className="kl-modal-form-helper" style={{ whiteSpace: 'pre-line' }}>
                        {message}
                    </p>
                ) : (
                    message
                )}

                <div className="kl-modal-form-row">
                    <label className="kl-modal-form-row__label" htmlFor="type-to-confirm-input">
                        확인 입력
                    </label>
                    <div className="kl-modal-form-row__control">
                        <p className="kl-modal-form-helper">
                            확인을 위해 <strong>{keyword}</strong> 를 입력하세요
                        </p>
                        <input
                            id="type-to-confirm-input"
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={keyword}
                            autoComplete="off"
                            autoFocus
                            disabled={busy}
                        />
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}

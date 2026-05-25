import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import BaseModal from './common/modal/BaseModal';
import { klModalFormContentClassName } from './common/modal/klModalForm';
import { klTallFormModalPaperSx } from './common/modal/klModalPaper';
import './ReportResultModal.css';

function ReportResultModal({ isOpen, onClose, status, result, error, progress }) {
    if (!isOpen) return null;

    const isProcessing = status === 'PENDING' || status === 'PROCESSING';
    const canClose = status === 'COMPLETED' || status === 'FAILED';

    const actions = useMemo(() => {
        if (status !== 'COMPLETED') return null;
        return (
            <div className="kl-modal-actions-split">
                <div className="kl-modal-actions-split__left" aria-hidden="true" />
                <div className="kl-modal-actions-split__right">
                    <button type="button" className="kl-btn gray-outline md" onClick={onClose}>
                        닫기
                    </button>
                    <button
                        type="button"
                        className="kl-btn primary-full md"
                        onClick={() => navigator.clipboard.writeText(result || '')}
                    >
                        복사하기
                    </button>
                </div>
            </div>
        );
    }, [onClose, result, status]);

    return (
        <BaseModal
            open={isOpen}
            onClose={canClose ? onClose : () => {}}
            title={isProcessing ? '보고서 생성 중...' : '보고서 결과'}
            maxWidth={false}
            fullWidth={false}
            paperSx={klTallFormModalPaperSx}
            showCloseButton={canClose}
            disableBackdropClose={!canClose}
            disableEscapeKeyDown={!canClose}
            contentClassName={klModalFormContentClassName}
            actions={actions}
        >
            <div className="report-result-modal-body">
                {isProcessing ? (
                    <div className="processing-state">
                        <div className="spinner" />
                        <p className="status-message">
                            {progress?.message || 'AI가 문서를 분석하고 있습니다...'}
                        </p>
                        <div className="progress-bar-container">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${progress?.percentage || 0}%` }}
                            />
                        </div>
                        <p className="progress-text">{progress?.percentage || 0}% 완료</p>
                    </div>
                ) : null}

                {status === 'FAILED' ? (
                    <div className="error-state">
                        <div className="error-icon">❌</div>
                        <h3>생성 실패</h3>
                        <p>{error || '알 수 없는 오류가 발생했습니다.'}</p>
                    </div>
                ) : null}

                {status === 'COMPLETED' ? (
                    <div className="result-content markdown-body">
                        <ReactMarkdown>{result}</ReactMarkdown>
                    </div>
                ) : null}
            </div>
        </BaseModal>
    );
}

export default ReportResultModal;

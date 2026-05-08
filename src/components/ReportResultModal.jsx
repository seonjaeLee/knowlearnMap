import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@mui/material';
import BaseModal from './common/modal/BaseModal';
import './ReportResultModal.css';

function ReportResultModal({ isOpen, onClose, status, result, error, progress }) {
    if (!isOpen) return null;

    const isProcessing = status === 'PENDING' || status === 'PROCESSING';
    const canClose = status === 'COMPLETED' || status === 'FAILED';

    const actions = useMemo(() => {
        if (status !== 'COMPLETED') return null;
        return (
            <>
                <Button variant="outlined" onClick={onClose}>닫기</Button>
                <Button variant="contained" onClick={() => navigator.clipboard.writeText(result || '')}>복사하기</Button>
            </>
        );
    }, [onClose, result, status]);

    return (
        <BaseModal
            open={isOpen}
            onClose={canClose ? onClose : () => {}}
            title={isProcessing ? '보고서 생성 중...' : '보고서 결과'}
            maxWidth="lg"
            fullWidth
            showCloseButton={canClose}
            disableBackdropClose={!canClose}
            disableEscapeKeyDown={!canClose}
            contentClassName="report-result-modal-content"
            actionsClassName="report-result-modal-actions"
            actions={actions}
        >
                <div className="report-result-modal-body">
                    {isProcessing && (
                        <div className="processing-state">
                            <div className="spinner"></div>
                            <p className="status-message">
                                {progress?.message || 'AI가 문서를 분석하고 있습니다...'}
                            </p>
                            <div className="progress-bar-container">
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${progress?.percentage || 0}%` }}
                                ></div>
                            </div>
                            <p className="progress-text">{progress?.percentage || 0}% 완료</p>
                        </div>
                    )}

                    {status === 'FAILED' && (
                        <div className="error-state">
                            <div className="error-icon">❌</div>
                            <h3>생성 실패</h3>
                            <p>{error || '알 수 없는 오류가 발생했습니다.'}</p>
                        </div>
                    )}

                    {status === 'COMPLETED' && (
                        <div className="result-content markdown-body">
                            <ReactMarkdown>{result}</ReactMarkdown>
                        </div>
                    )}
                </div>
        </BaseModal>
    );
}

export default ReportResultModal;

import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import './ReportResultModal.css';

function ReportResultModal({ isOpen, onClose, status, result, error, progress }) {
    const modalRef = useRef(null);

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                // Only allow closing if completed or failed, or explicitly cancelled (not implemented yet)
                if (status === 'COMPLETED' || status === 'FAILED') {
                    onClose();
                }
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose, status]);

    if (!isOpen) return null;

    const isProcessing = status === 'PENDING' || status === 'PROCESSING';

    return (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
            <div className="modal-container result-modal" ref={modalRef}>
                <div className="modal-header">
                    <div className="modal-header-content">
                        <span className="modal-icon">📊</span>
                        <h2 className="modal-title">
                            {isProcessing ? '보고서 생성 중...' : '보고서 결과'}
                        </h2>
                    </div>
                    {(status === 'COMPLETED' || status === 'FAILED') && (
                        <button className="modal-close-btn" onClick={onClose}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                            </svg>
                        </button>
                    )}
                </div>

                <div className="modal-body result-body">
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

                {status === 'COMPLETED' && (
                    <div className="modal-footer">
                        <button className="btn-secondary" onClick={onClose}>닫기</button>
                        <button className="btn-primary" onClick={() => navigator.clipboard.writeText(result)}>복사하기</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReportResultModal;

import React, { useState, useRef, useEffect } from 'react';
import { FileText, Table2, Edit2, Trash2, RotateCcw, RefreshCw, Loader2, Image, Presentation, FileType } from 'lucide-react';
import './DocumentSourceItem.css';

function DocumentSourceItem({
    document,
    progress,
    onSelect,
    isChecked,
    onCheckChange,
    onRename,
    onDelete,
    onReprocess,
    onSync,
    readOnly,
    deleting,
    deleteElapsedProp = 0
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const currentStatus = progress?.status || document.pipelineStatus;

    // STALLED: NotebookDetail에서 1회 확인 후 작업이 진행되지 않는 PENDING을 STALLED로 마킹
    const isStalled = currentStatus === 'STALLED' || currentStatus === 'FAILED';

    // CSV/DB 정형데이터 컬럼매핑 상태 확인
    const isStructured = document.sourceType === 'CSV' || document.sourceType === 'DATABASE';
    // 파이프라인이 동작 중이면 매핑 상태보다 파이프라인 상태 우선
    const isActiveProcessing = currentStatus === 'PROCESSING';
    const isCsvNeedMapping = isStructured && !isActiveProcessing
        && (document.columnMappingStatus === 'PENDING' || !document.columnMappingStatus);
    const isCsvMapped = isStructured && !isActiveProcessing
        && document.columnMappingStatus === 'MAPPED'
        && currentStatus !== 'COMPLETED';

    const getStatusIcon = () => {
        if (isCsvNeedMapping) return '⚙';
        if (isCsvMapped) return '✓';
        switch (currentStatus) {
            case 'COMPLETED':
                return '✓';
            case 'PROCESSING':
                return '⟳';
            case 'FAILED':
                return '✗';
            case 'STALLED':
                return '⚠';
            case 'PENDING':
            default:
                return '⋯';
        }
    };

    const getStatusColor = () => {
        if (isCsvNeedMapping) return '#e67700';
        if (isCsvMapped) return '#1a73e8';
        switch (currentStatus) {
            case 'COMPLETED':
                return '#4caf50';
            case 'PROCESSING':
                return '#2196f3';
            case 'FAILED':
                return '#f44336';
            case 'STALLED':
                return '#e67700';
            case 'PENDING':
            default:
                return '#9e9e9e';
        }
    };

    const getStatusText = () => {
        // CSV 전용 상태 표시
        if (isCsvNeedMapping) return '컬럼 매핑 필요';
        if (isCsvMapped) return '매핑 완료 · 처리 대기';

        switch (currentStatus) {
            case 'COMPLETED':
                return '완료';
            case 'PROCESSING':
                return progress?.currentStage || '처리 중';
            case 'FAILED':
                return '실패';
            case 'STALLED':
                return '재작업 필요';
            case 'PENDING':
            default:
                return '대기 중';
        }
    };

    const progressValue = progress?.progress || 0;
    const isProcessing = currentStatus === 'PROCESSING';
    const isRotating = getStatusIcon() === '⟳';

    // 메뉴 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        if (menuOpen) {
            window.document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            window.document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen]);

    const handleCheckboxClick = (e) => {
        e.stopPropagation();
        onCheckChange(document.id);
    };

    const handleMenuClick = (e) => {
        e.stopPropagation();
        setMenuOpen(!menuOpen);
    };

    // DATABASE + COMPLETED 상태일 때만 소스 갱신 가능
    const canSync = document.sourceType === 'DATABASE'
        && currentStatus === 'COMPLETED'
        && onSync;

    const handleMenuItemClick = (action) => {
        setMenuOpen(false);
        if (action === 'rename') {
            onRename(document);
        } else if (action === 'delete') {
            onDelete(document);
        } else if (action === 'reprocess') {
            onReprocess(document);
        } else if (action === 'sync') {
            onSync(document);
        }
    };

    return (
        <div className="document-source-item" style={{ position: 'relative' }}>
            {/* 삭제 중 오버레이 */}
            {deleting && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(255, 255, 255, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    borderRadius: 'inherit',
                    gap: '8px'
                }}>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite', color: '#e53935' }} />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#e53935' }}>
                        삭제중... {deleteElapsedProp > 0 && `(${deleteElapsedProp}초)`}
                    </span>
                </div>
            )}
            {/* 체크박스 */}
            <div className="document-checkbox" onClick={handleCheckboxClick}>
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => { }}
                    onClick={handleCheckboxClick}
                />
            </div>

            {/* 문서 정보 (클릭 시 상세 보기) */}
            <div className="document-content" onClick={onSelect}>
                <div className="source-header">
                    {(document.sourceType === 'CSV' || document.sourceType === 'DATABASE') ? (
                        <Table2 size={16} className="source-icon" style={{ color: document.sourceType === 'DATABASE' ? '#1a73e8' : '#4caf50' }} />
                    ) : document.sourceType === 'PPTX' ? (
                        <Presentation size={16} className="source-icon" style={{ color: '#d14836' }} />
                    ) : document.sourceType === 'DOCX' ? (
                        <FileType size={16} className="source-icon" style={{ color: '#2b579a' }} />
                    ) : (
                        <FileText size={16} className="source-icon" />
                    )}
                    <div className="source-info">
                        <div className="source-name" title={document.filename}>
                            {document.filename}
                        </div>
                        <div className="source-meta">
                            <span
                                className="status-badge"
                                style={{ color: getStatusColor() }}
                            >
                                <span className={`status-icon ${isRotating ? 'rotating' : ''}`}>
                                    {getStatusIcon()}
                                </span>
                                {getStatusText()}
                            </span>
                            {(document.sourceType === 'CSV' || document.sourceType === 'DATABASE') && document.totalRecords > 0 ? (
                                <span className="page-count">
                                    {document.totalRecords.toLocaleString()} 건
                                </span>
                            ) : document.pageCount > 0 ? (
                                <span className="page-count">
                                    {document.pageCount} 페이지
                                </span>
                            ) : null}
                            {document.imageCount > 0 && (
                                <span className="multimodal-badge" title={`이미지 ${document.imageCount}개`}>
                                    <Image size={11} /> {document.imageCount}
                                </span>
                            )}
                            {document.tableCount > 0 && (
                                <span className="multimodal-badge" title={`표 ${document.tableCount}개`}>
                                    <Table2 size={11} /> {document.tableCount}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {isCsvNeedMapping && (
                    <div className="csv-mapping-hint">
                        클릭하여 컬럼 매핑 설정 →
                    </div>
                )}

                {isProcessing && (
                    <div className="progress-container">
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${progressValue}%`,
                                    backgroundColor: getStatusColor()
                                }}
                            />
                        </div>
                        <span className="progress-text">{progressValue}%</span>
                    </div>
                )}
            </div>

            {/* 메뉴 버튼 */}
            {!readOnly && (
                <div className="document-menu" ref={menuRef}>
                    <button
                        className="menu-trigger"
                        onClick={handleMenuClick}
                        aria-label="메뉴"
                    >
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                            <circle cx="10" cy="4" r="1.5" />
                            <circle cx="10" cy="10" r="1.5" />
                            <circle cx="10" cy="16" r="1.5" />
                        </svg>
                    </button>

                    {menuOpen && (
                        <div className="menu-dropdown">
                            <button
                                className="menu-item"
                                onClick={() => handleMenuItemClick('rename')}
                            >
                                <Edit2 size={14} />
                                <span>제목 수정</span>
                            </button>
                            <button
                                className="menu-item delete"
                                onClick={() => handleMenuItemClick('delete')}
                            >
                                <Trash2 size={14} />
                                <span>삭제</span>
                            </button>
                            {isStalled && onReprocess && (
                                <button
                                    className="menu-item reprocess"
                                    onClick={() => handleMenuItemClick('reprocess')}
                                >
                                    <RotateCcw size={14} />
                                    <span>재실행</span>
                                </button>
                            )}
                            {canSync && (
                                <button
                                    className="menu-item"
                                    onClick={() => handleMenuItemClick('sync')}
                                >
                                    <RefreshCw size={14} />
                                    <span>소스 갱신</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default DocumentSourceItem;

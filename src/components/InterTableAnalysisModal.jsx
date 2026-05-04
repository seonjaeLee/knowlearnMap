import { useState, useEffect, useRef } from 'react';
import { X, Loader, ArrowRight, CheckCircle, Trash2, RotateCcw, Play, AlertCircle, Info } from 'lucide-react';
import { structuredApi } from '../services/api';
import { useAlert } from '../context/AlertContext';
import './InterTableAnalysisModal.css';

const RELATION_TYPES = [
    { value: 'FK', label: 'FK', desc: '외래키 관계', color: '#1d4ed8', bg: '#dbeafe' },
    { value: 'SHARED_KEY', label: 'SHARED_KEY', desc: '공유 키', color: '#92400e', bg: '#fef3c7' },
    { value: 'SEMANTIC', label: 'SEMANTIC', desc: '의미적 관계', color: '#7c3aed', bg: '#f3e8ff' },
];

function InterTableAnalysisModal({ workspaceId, onClose, onApplied }) {
    const { showAlert } = useAlert();
    const [loading, setLoading] = useState(false);
    const [applying, setApplying] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const modalRef = useRef(null);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    // Close on backdrop click
    const handleOverlayClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
        }
    };

    const handleAnalyze = async () => {
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const data = await structuredApi.analyzeInterTable(workspaceId);
            setResult(data);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || '알 수 없는 오류';
            setError('테이블 간 관계 분석 실패: ' + msg);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        if (!result || !result.interRelations || result.interRelations.length === 0) return;
        setApplying(true);
        setError('');
        try {
            await structuredApi.applyInterTable(workspaceId, result);
            showAlert('테이블 간 관계가 성공적으로 적용되었습니다.');
            if (onApplied) onApplied();
            onClose();
        } catch (err) {
            const msg = err.response?.data?.message || err.message || '알 수 없는 오류';
            setError('관계 적용 실패: ' + msg);
            showAlert('관계 적용 실패: ' + msg);
        } finally {
            setApplying(false);
        }
    };

    const handleDeleteRow = (index) => {
        if (!result || !result.interRelations) return;
        const updated = [...result.interRelations];
        updated.splice(index, 1);
        setResult({ ...result, interRelations: updated });
    };

    const handleFieldChange = (index, field, value) => {
        if (!result || !result.interRelations) return;
        const updated = [...result.interRelations];
        updated[index] = { ...updated[index], [field]: value };
        setResult({ ...result, interRelations: updated });
    };

    const getConfidenceClass = (confidence) => {
        if (confidence >= 0.8) return 'itm-confidence-high';
        if (confidence >= 0.5) return 'itm-confidence-medium';
        return 'itm-confidence-low';
    };

    const getRelationTypeStyle = (type) => {
        const found = RELATION_TYPES.find(r => r.value === type);
        if (found) return { background: found.bg, color: found.color };
        return { background: '#f1f5f9', color: '#475569' };
    };

    const relations = result?.interRelations || [];
    const hasRelations = relations.length > 0;

    return (
        <div className="itm-overlay" onClick={handleOverlayClick}>
            <div className="itm-modal" ref={modalRef} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="itm-header">
                    <div className="itm-header-left">
                        <Info size={18} color="#3b82f6" />
                        <span className="itm-title">테이블 간 관계 분석</span>
                        {result && (
                            <span className="itm-count-badge">
                                {relations.length}개 관계
                            </span>
                        )}
                    </div>
                    <button className="itm-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="itm-error">
                        <AlertCircle size={14} />
                        <span>{error}</span>
                        <button onClick={() => setError('')}>
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="itm-content">
                    {/* Analysis Note */}
                    {result?.analysisNote && (
                        <div className="itm-analysis-note">
                            <Info size={14} />
                            <span>{result.analysisNote}</span>
                        </div>
                    )}

                    {/* Initial state - no result, not loading */}
                    {!result && !loading && (
                        <div className="itm-empty-state">
                            <div className="itm-empty-icon">
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                    <rect x="4" y="8" width="16" height="14" rx="2" stroke="#94a3b8" strokeWidth="2" fill="#f1f5f9"/>
                                    <rect x="28" y="8" width="16" height="14" rx="2" stroke="#94a3b8" strokeWidth="2" fill="#f1f5f9"/>
                                    <rect x="16" y="28" width="16" height="14" rx="2" stroke="#94a3b8" strokeWidth="2" fill="#f1f5f9"/>
                                    <path d="M12 22 L18 28" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 2"/>
                                    <path d="M36 22 L30 28" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 2"/>
                                </svg>
                            </div>
                            <p className="itm-empty-text">
                                워크스페이스 내 정형 데이터 문서(CSV/DB) 간의 관계를 LLM으로 분석합니다.
                            </p>
                            <p className="itm-empty-subtext">
                                컬럼 이름, 데이터 패턴, 스키마 구조를 기반으로 FK, 공유 키, 의미적 관계를 자동 탐지합니다.
                            </p>
                            <button className="itm-btn itm-btn-analyze" onClick={handleAnalyze}>
                                <Play size={14} />
                                분석 시작
                            </button>
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="itm-loading">
                            <Loader size={32} className="spinner" />
                            <p>테이블 간 관계를 분석하고 있습니다...</p>
                            <span className="itm-loading-hint">테이블 수에 따라 수십 초가 소요될 수 있습니다.</span>
                        </div>
                    )}

                    {/* Result - has relations */}
                    {result && hasRelations && (
                        <div className="itm-table-wrapper">
                            <table className="itm-table">
                                <thead>
                                    <tr>
                                        <th className="itm-col-num">#</th>
                                        <th>소스 테이블</th>
                                        <th>소스 컬럼</th>
                                        <th className="itm-col-arrow"></th>
                                        <th>대상 테이블</th>
                                        <th>대상 컬럼</th>
                                        <th>관계 유형</th>
                                        <th>관계 설명</th>
                                        <th>신뢰도</th>
                                        <th>비고</th>
                                        <th className="itm-col-action"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {relations.map((rel, idx) => (
                                        <tr key={idx}>
                                            <td className="itm-col-num">{idx + 1}</td>
                                            <td className="itm-col-table-name">{rel.sourceTable}</td>
                                            <td className="itm-col-column-name"><code>{rel.sourceColumn}</code></td>
                                            <td className="itm-col-arrow">
                                                <ArrowRight size={14} color="#94a3b8" />
                                            </td>
                                            <td className="itm-col-table-name">{rel.targetTable}</td>
                                            <td className="itm-col-column-name"><code>{rel.targetColumn}</code></td>
                                            <td className="itm-col-type">
                                                <select
                                                    value={rel.relationType || ''}
                                                    onChange={(e) => handleFieldChange(idx, 'relationType', e.target.value)}
                                                    className="itm-select"
                                                    style={getRelationTypeStyle(rel.relationType)}
                                                >
                                                    {RELATION_TYPES.map(rt => (
                                                        <option key={rt.value} value={rt.value}>{rt.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="itm-col-relation">
                                                <input
                                                    type="text"
                                                    value={rel.relation || ''}
                                                    onChange={(e) => handleFieldChange(idx, 'relation', e.target.value)}
                                                    className="itm-input"
                                                    placeholder="관계 설명"
                                                />
                                            </td>
                                            <td className="itm-col-confidence">
                                                <span className={`itm-confidence-badge ${getConfidenceClass(rel.confidence || 0)}`}>
                                                    {((rel.confidence || 0) * 100).toFixed(0)}%
                                                </span>
                                            </td>
                                            <td className="itm-col-desc">
                                                <input
                                                    type="text"
                                                    value={rel.description || ''}
                                                    onChange={(e) => handleFieldChange(idx, 'description', e.target.value)}
                                                    className="itm-input itm-input-desc"
                                                    placeholder="비고"
                                                />
                                            </td>
                                            <td className="itm-col-action">
                                                <button
                                                    className="itm-delete-btn"
                                                    onClick={() => handleDeleteRow(idx)}
                                                    title="삭제"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Result - no relations found */}
                    {result && !hasRelations && !loading && (
                        <div className="itm-no-result">
                            <AlertCircle size={24} color="#94a3b8" />
                            <p>분석 결과 테이블 간 관계가 발견되지 않았습니다.</p>
                            <button className="itm-btn itm-btn-retry" onClick={handleAnalyze}>
                                <RotateCcw size={14} />
                                다시 분석
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="itm-footer">
                    {result && hasRelations && (
                        <button className="itm-btn itm-btn-retry" onClick={handleAnalyze} disabled={loading}>
                            <RotateCcw size={14} />
                            재분석
                        </button>
                    )}
                    <div className="itm-footer-right">
                        <button className="itm-btn itm-btn-secondary" onClick={onClose}>
                            닫기
                        </button>
                        {result && hasRelations && (
                            <button
                                className="itm-btn itm-btn-primary"
                                onClick={handleApply}
                                disabled={applying}
                            >
                                {applying ? (
                                    <>
                                        <Loader size={14} className="spinner" />
                                        적용 중...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={14} />
                                        적용
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InterTableAnalysisModal;

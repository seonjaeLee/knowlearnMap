import { useState, useEffect, useRef } from 'react';
import { X, Loader, Play, CheckCircle, RotateCcw, AlertCircle, Info, Clock, Layers, BarChart3 } from 'lucide-react';
import { structuredApi } from '../services/api';
import { useDialog } from '../hooks/useDialog';
import './AggregationStrategyModal.css';

const AGG_FUNCTIONS = [
    { value: 'SUM', label: 'SUM', desc: '합계' },
    { value: 'AVG', label: 'AVG', desc: '평균' },
    { value: 'COUNT', label: 'COUNT', desc: '건수' },
    { value: 'MIN', label: 'MIN', desc: '최솟값' },
    { value: 'MAX', label: 'MAX', desc: '최댓값' },
    { value: 'FIRST', label: 'FIRST', desc: '첫번째 값' },
    { value: 'LAST', label: 'LAST', desc: '마지막 값' },
    { value: 'DISTINCT_COUNT', label: 'DISTINCT_COUNT', desc: '고유값 수' },
    { value: 'SKIP', label: 'SKIP', desc: '제외' },
];

const TIME_GRANULARITIES = [
    { value: 'MONTHLY', label: '월별' },
    { value: 'QUARTERLY', label: '분기별' },
    { value: 'YEARLY', label: '연별' },
];

function AggregationStrategyModal({ docId, filename, workspaceId, onClose, onComplete }) {
    const { alert } = useDialog();
    const showAlert = (message) => { alert(message); };
    const [loading, setLoading] = useState(false);
    const [executing, setExecuting] = useState(false);
    const [strategy, setStrategy] = useState(null);
    const [error, setError] = useState('');
    const [executeResult, setExecuteResult] = useState(null);
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

    // Analyze aggregation strategy
    const handleAnalyze = async () => {
        setLoading(true);
        setError('');
        setStrategy(null);
        setExecuteResult(null);
        try {
            const data = await structuredApi.analyzeAggregation(docId, workspaceId);
            setStrategy(data);
        } catch (err) {
            setError('집계 전략 분석에 실패했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    // Execute aggregation
    const handleExecute = async () => {
        if (!strategy) return;
        setExecuting(true);
        setError('');
        setExecuteResult(null);
        try {
            const data = await structuredApi.executeAggregation(docId, workspaceId, strategy);
            setExecuteResult(data);
            showAlert(`집계가 완료되었습니다. ${(data.count || 0).toLocaleString()}건이 생성되었습니다.`);
            if (onComplete) onComplete();
        } catch (err) {
            setError('집계 실행에 실패했습니다. 전략 설정을 확인하고 다시 시도해주세요.');
            showAlert('집계 실행에 실패했습니다. 전략 설정을 확인하고 다시 시도해주세요.');
        } finally {
            setExecuting(false);
        }
    };

    // Update column strategy
    const handleColumnStrategyChange = (index, field, value) => {
        if (!strategy || !strategy.columnStrategies) return;
        const updated = [...strategy.columnStrategies];
        updated[index] = { ...updated[index], [field]: value };
        setStrategy({ ...strategy, columnStrategies: updated });
    };

    // Update summary settings (timeAxisColumn, timeGranularity, groupKeyColumn)
    const handleSummaryChange = (field, value) => {
        if (!strategy) return;

        const updatedStrategy = { ...strategy, [field]: value };

        // When timeAxisColumn changes, update isTimeAxis flags on column strategies
        if (field === 'timeAxisColumn' && strategy.columnStrategies) {
            updatedStrategy.columnStrategies = strategy.columnStrategies.map(col => ({
                ...col,
                isTimeAxis: col.columnName === value,
                aggFunction: col.columnName === value ? 'SKIP' : col.aggFunction,
            }));
        }

        // When groupKeyColumn changes, update isGroupKey flags on column strategies
        if (field === 'groupKeyColumn' && strategy.columnStrategies) {
            updatedStrategy.columnStrategies = strategy.columnStrategies.map(col => ({
                ...col,
                isGroupKey: col.columnName === value,
                aggFunction: col.columnName === value ? 'SKIP' : col.aggFunction,
            }));
        }

        setStrategy(updatedStrategy);
    };

    // Get agg function CSS class
    const getAggClass = (aggFunction) => {
        if (!aggFunction) return '';
        return 'agg-' + aggFunction.toLowerCase();
    };

    // Get type badge CSS class
    const getTypeClass = (detectedType) => {
        if (!detectedType) return 'type-unknown';
        const t = detectedType.toLowerCase();
        if (t.includes('date') || t.includes('time')) return 'type-date';
        if (t.includes('number') || t.includes('int') || t.includes('float') || t.includes('decimal') || t.includes('numeric')) return 'type-number';
        if (t.includes('bool')) return 'type-boolean';
        if (t.includes('string') || t.includes('text') || t.includes('varchar')) return 'type-string';
        return 'type-unknown';
    };

    // Get column name list for dropdown options
    const getColumnNames = () => {
        if (!strategy || !strategy.columnStrategies) return [];
        return strategy.columnStrategies.map(col => col.columnName);
    };

    const columns = strategy?.columnStrategies || [];
    const hasColumns = columns.length > 0;

    return (
        <div className="asm-overlay" onClick={handleOverlayClick}>
            <div className="asm-modal" ref={modalRef} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="asm-header">
                    <div className="asm-header-left">
                        <BarChart3 size={18} color="#f59e0b" />
                        <span className="asm-title">집계 전략 설정</span>
                        {filename && (
                            <span className="asm-filename" title={filename}>{filename}</span>
                        )}
                    </div>
                    <button className="asm-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="asm-error">
                        <AlertCircle size={14} />
                        <span>{error}</span>
                        <button onClick={() => setError('')}>
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="asm-content">
                    {/* Analysis Note */}
                    {strategy?.analysisNote && (
                        <div className="asm-analysis-note">
                            <Info size={14} />
                            <span>{strategy.analysisNote}</span>
                        </div>
                    )}

                    {/* Initial state - no strategy, not loading */}
                    {!strategy && !loading && (
                        <div className="asm-empty-state">
                            <div className="asm-empty-icon">
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                    <rect x="6" y="24" width="8" height="16" rx="2" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5"/>
                                    <rect x="20" y="16" width="8" height="24" rx="2" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1.5"/>
                                    <rect x="34" y="8" width="8" height="32" rx="2" fill="#fde68a" stroke="#d97706" strokeWidth="1.5"/>
                                    <line x1="4" y1="42" x2="44" y2="42" stroke="#94a3b8" strokeWidth="1.5"/>
                                </svg>
                            </div>
                            <p className="asm-empty-text">
                                대용량 정형 데이터의 집계 전략을 LLM으로 분석합니다.
                            </p>
                            <p className="asm-empty-subtext">
                                컬럼 타입과 데이터 패턴을 기반으로 시간축, 그룹 키, 집계 함수(SUM/AVG/COUNT 등)를 자동으로 제안합니다.
                            </p>
                            <button className="asm-btn asm-btn-analyze" onClick={handleAnalyze}>
                                <Play size={14} />
                                분석 시작
                            </button>
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="asm-loading">
                            <Loader size={32} className="asm-spinner" />
                            <p>집계 전략을 분석 중입니다...</p>
                            <span className="asm-loading-hint">컬럼 수에 따라 수십 초가 소요될 수 있습니다.</span>
                        </div>
                    )}

                    {/* Result - has columns */}
                    {strategy && hasColumns && !loading && (
                        <>
                            {/* Summary Settings */}
                            <div className="asm-summary">
                                <div className="asm-summary-item">
                                    <span className="asm-summary-label">
                                        <Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                                        시간축 컬럼
                                    </span>
                                    <select
                                        className="asm-summary-select"
                                        value={strategy.timeAxisColumn || ''}
                                        onChange={(e) => handleSummaryChange('timeAxisColumn', e.target.value)}
                                    >
                                        <option value="">-- 선택 --</option>
                                        {getColumnNames().map(name => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="asm-summary-item">
                                    <span className="asm-summary-label">
                                        <Layers size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                                        시간 단위
                                    </span>
                                    <select
                                        className="asm-summary-select"
                                        value={strategy.timeGranularity || ''}
                                        onChange={(e) => handleSummaryChange('timeGranularity', e.target.value)}
                                    >
                                        {TIME_GRANULARITIES.map(g => (
                                            <option key={g.value} value={g.value}>{g.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="asm-summary-item">
                                    <span className="asm-summary-label">
                                        <BarChart3 size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                                        그룹 키 컬럼
                                    </span>
                                    <select
                                        className="asm-summary-select"
                                        value={strategy.groupKeyColumn || ''}
                                        onChange={(e) => handleSummaryChange('groupKeyColumn', e.target.value)}
                                    >
                                        <option value="">-- 없음 --</option>
                                        {getColumnNames().map(name => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Column Strategy Table */}
                            <div className="asm-table-wrapper">
                                <table className="asm-table">
                                    <thead>
                                        <tr>
                                            <th className="asm-col-num">#</th>
                                            <th>컬럼명</th>
                                            <th>한글명</th>
                                            <th>타입</th>
                                            <th>집계 함수</th>
                                            <th>역할</th>
                                            <th>사유</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {columns.map((col, idx) => (
                                            <tr key={idx} className={col.aggFunction === 'SKIP' ? 'row-skip' : ''}>
                                                <td className="asm-col-num">{idx + 1}</td>
                                                <td className="asm-col-name">{col.columnName}</td>
                                                <td className="asm-col-name-ko">{col.columnNameKo || '-'}</td>
                                                <td className="asm-col-type">
                                                    <span className={`asm-type-badge ${getTypeClass(col.detectedType)}`}>
                                                        {col.detectedType || 'UNKNOWN'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <select
                                                        className={`asm-agg-select ${getAggClass(col.aggFunction)}`}
                                                        value={col.aggFunction || 'SKIP'}
                                                        onChange={(e) => handleColumnStrategyChange(idx, 'aggFunction', e.target.value)}
                                                    >
                                                        {AGG_FUNCTIONS.map(fn => (
                                                            <option key={fn.value} value={fn.value}>
                                                                {fn.label} ({fn.desc})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td>
                                                    <div className="asm-role-badges">
                                                        {col.isTimeAxis && (
                                                            <span className="asm-role-badge time-axis">
                                                                <Clock size={10} />
                                                                시간축
                                                            </span>
                                                        )}
                                                        {col.isGroupKey && (
                                                            <span className="asm-role-badge group-key">
                                                                <Layers size={10} />
                                                                그룹키
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="asm-reason" title={col.reason || ''}>
                                                        {col.reason || '-'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Execute Result Banner */}
                            {executeResult && (
                                <div className="asm-result-banner">
                                    <CheckCircle size={20} color="#059669" />
                                    <span className="asm-result-text">집계가 완료되었습니다.</span>
                                    <span className="asm-result-count">
                                        {(executeResult.count || 0).toLocaleString()} <span>건 생성</span>
                                    </span>
                                </div>
                            )}
                        </>
                    )}

                    {/* Result - no columns found */}
                    {strategy && !hasColumns && !loading && (
                        <div className="asm-empty-state">
                            <AlertCircle size={24} color="#94a3b8" />
                            <p className="asm-empty-text" style={{ marginTop: 12 }}>
                                분석 결과 집계 가능한 컬럼이 발견되지 않았습니다.
                            </p>
                            <button className="asm-btn asm-btn-retry" onClick={handleAnalyze}>
                                <RotateCcw size={14} />
                                다시 분석
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="asm-footer">
                    {strategy && hasColumns && (
                        <button className="asm-btn asm-btn-retry" onClick={handleAnalyze} disabled={loading || executing}>
                            <RotateCcw size={14} />
                            재분석
                        </button>
                    )}
                    <div className="asm-footer-right">
                        <button className="asm-btn asm-btn-secondary" onClick={onClose}>
                            닫기
                        </button>
                        {strategy && hasColumns && !executeResult && (
                            <button
                                className="asm-btn asm-btn-execute"
                                onClick={handleExecute}
                                disabled={executing || loading}
                            >
                                {executing ? (
                                    <>
                                        <Loader size={14} className="asm-spinner" />
                                        집계 실행 중...
                                    </>
                                ) : (
                                    <>
                                        <Play size={14} />
                                        집계 실행
                                    </>
                                )}
                            </button>
                        )}
                        {executeResult && (
                            <button className="asm-btn asm-btn-primary" onClick={onClose}>
                                <CheckCircle size={14} />
                                완료
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AggregationStrategyModal;

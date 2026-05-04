import { useState, useEffect, useRef } from 'react';
import './DbConnectionModal.css';
import { structuredApi } from '../services/api';
import { useAlert } from '../context/AlertContext';

const DB_TYPES = [
    { value: 'MYSQL', label: 'MySQL', defaultPort: 3306 },
    { value: 'POSTGRESQL', label: 'PostgreSQL', defaultPort: 5432 },
    { value: 'ORACLE', label: 'Oracle', defaultPort: 1521 },
    { value: 'MARIADB', label: 'MariaDB', defaultPort: 3306 },
];

const INITIAL_FORM = {
    connectionName: '',
    dbType: 'MYSQL',
    host: '',
    port: 3306,
    databaseName: '',
    username: '',
    password: '',
    schemaName: '',
};

function DbConnectionModal({ isOpen, onClose, workspaceId, domainId, onImportComplete }) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState(INITIAL_FORM);
    const [savedConnections, setSavedConnections] = useState([]);
    const [selectedConnectionId, setSelectedConnectionId] = useState(null);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [saving, setSaving] = useState(false);
    const [tables, setTables] = useState([]);
    const [loadingTables, setLoadingTables] = useState(false);
    const [selectedTables, setSelectedTables] = useState(new Set());
    const [previewTable, setPreviewTable] = useState(null);
    const [tableInfo, setTableInfo] = useState(null);
    const [loadingTableInfo, setLoadingTableInfo] = useState(false);
    const [importingTable, setImportingTable] = useState(null); // 현재 임포트 중인 테이블명
    const [tableFilter, setTableFilter] = useState('');
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [importProgress, setImportProgress] = useState(null);
    const modalRef = useRef(null);
    const { showAlert, showConfirm } = useAlert();

    useEffect(() => {
        if (isOpen && domainId) {
            loadConnections();
            setStep(1);
            setForm(INITIAL_FORM);
            setSelectedConnectionId(null);
            setTestResult(null);
            setTables([]);
            setTableFilter('');
            setSelectedTables(new Set());
            setPreviewTable(null);
            setTableInfo(null);
            setImportingTable(null);
            setImportResult(null);
        }
    }, [isOpen, domainId]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const loadConnections = async () => {
        try {
            const data = await structuredApi.db.getConnections(domainId);
            setSavedConnections(data || []);
        } catch (e) {
            console.error('연결 목록 로드 실패:', e);
        }
    };

    const handleFormChange = (field, value) => {
        setForm(prev => {
            const next = { ...prev, [field]: value };
            if (field === 'dbType') {
                const dbInfo = DB_TYPES.find(d => d.value === value);
                if (dbInfo) next.port = dbInfo.defaultPort;
            }
            return next;
        });
        setTestResult(null);
    };

    const handleSelectConnection = (conn) => {
        setSelectedConnectionId(conn.id);
        setForm({
            connectionName: conn.connectionName || '',
            dbType: conn.dbType || 'MYSQL',
            host: conn.host || '',
            port: conn.port || 3306,
            databaseName: conn.databaseName || '',
            username: conn.username || '',
            password: conn.password || '',
            schemaName: conn.schemaName || '',
        });
        setTestResult(null);
    };

    const handleNewConnection = () => {
        setSelectedConnectionId(null);
        setForm(INITIAL_FORM);
        setTestResult(null);
    };

    const handleTestConnection = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            // 저장된 연결이면 ID 기반 테스트 (비밀번호 마스킹 문제 방지)
            const result = selectedConnectionId
                ? await structuredApi.db.testSavedConnection(selectedConnectionId)
                : await structuredApi.db.testConnection(form);
            setTestResult(result);
            if (result) {
                showAlert('연결 테스트 성공!');
            } else {
                showAlert('연결 테스트 실패. 접속 정보를 확인하세요.');
            }
        } catch (e) {
            setTestResult(false);
            showAlert('DB 연결 테스트에 실패했습니다. 호스트, 포트, 계정 정보를 확인해주세요.');
        } finally {
            setTesting(false);
        }
    };

    const handleSaveConnection = async () => {
        if (!form.connectionName.trim()) {
            showAlert('연결 이름을 입력하세요.');
            return;
        }
        setSaving(true);
        try {
            const saved = await structuredApi.db.saveConnection(domainId, form);
            showAlert('연결 정보가 저장되었습니다.');
            setSelectedConnectionId(saved.id);
            await loadConnections();
        } catch (e) {
            showAlert('연결 정보 저장에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteConnection = async () => {
        if (!selectedConnectionId) {
            showAlert('삭제할 연결을 선택하세요.');
            return;
        }
        const confirmed = await showConfirm('이 연결을 삭제하시겠습니까?');
        if (!confirmed) return;
        try {
            await structuredApi.db.deleteConnection(selectedConnectionId);
            setSelectedConnectionId(null);
            setForm(INITIAL_FORM);
            setTestResult(null);
            await loadConnections();
        } catch (e2) {
            showAlert('연결 정보 삭제에 실패했습니다. 다시 시도해주세요.');
        }
    };

    const handleNextToTables = async () => {
        if (!selectedConnectionId) {
            showAlert('연결을 선택하세요.');
            return;
        }
        setLoadingTables(true);
        try {
            const data = await structuredApi.db.listTables(selectedConnectionId);
            setTables(data || []);
            setStep(2);
            setSelectedTables(new Set());
            setPreviewTable(null);
            setTableInfo(null);
        } catch (e) {
            showAlert('테이블 목록을 불러오는데 실패했습니다. 연결 상태를 확인해주세요.');
        } finally {
            setLoadingTables(false);
        }
    };

    const handleToggleTable = (tableName) => {
        setSelectedTables(prev => {
            const next = new Set(prev);
            if (next.has(tableName)) {
                next.delete(tableName);
            } else {
                next.add(tableName);
            }
            return next;
        });
    };

    const handlePreviewTable = async (tableName) => {
        setPreviewTable(tableName);
        setLoadingTableInfo(true);
        try {
            const info = await structuredApi.db.getTableInfo(selectedConnectionId, tableName);
            setTableInfo(info);
        } catch (e) {
            console.error('테이블 정보 조회 실패:', e);
            setTableInfo(null);
        } finally {
            setLoadingTableInfo(false);
        }
    };

    const importSingleTable = (tableName) => {
        return new Promise((resolve, reject) => {
            setImportingTable(tableName);
            setImportProgress({ phase: 'READING', readRows: 0, totalRows: 0, message: `[${tableName}] 임포트 시작 중...` });

            structuredApi.db.importTable(selectedConnectionId, workspaceId, tableName)
                .then(result => {
                    if (result && result.taskId) {
                        const pollProgress = async () => {
                            try {
                                const progress = await structuredApi.db.getImportProgress(result.taskId);
                                if (!progress) { setTimeout(pollProgress, 1000); return; }
                                setImportProgress({ ...progress, message: `[${tableName}] ${progress.message}` });
                                if (progress.phase === 'COMPLETED') {
                                    resolve(progress);
                                } else if (progress.phase === 'FAILED') {
                                    reject(new Error(progress.message));
                                } else {
                                    setTimeout(pollProgress, 1000);
                                }
                            } catch { setTimeout(pollProgress, 1500); }
                        };
                        setTimeout(pollProgress, 500);
                    } else {
                        resolve(result);
                    }
                })
                .catch(reject);
        });
    };

    const handleImport = async () => {
        const tableList = [...selectedTables];
        if (tableList.length === 0) {
            showAlert('테이블을 선택하세요.');
            return;
        }
        setImporting(true);

        let successCount = 0;
        let failedTables = [];

        for (let i = 0; i < tableList.length; i++) {
            const tbl = tableList[i];
            try {
                await importSingleTable(tbl);
                successCount++;
            } catch (e) {
                failedTables.push(tbl);
                console.error(`임포트 실패: ${tbl}`, e);
            }
        }

        setImporting(false);
        setImportingTable(null);
        setImportProgress(null);

        if (failedTables.length > 0) {
            showAlert(`${successCount}개 성공, ${failedTables.length}개 실패: ${failedTables.join(', ')}`);
        }

        if (successCount > 0) {
            setImportResult({ totalRows: successCount, tableCount: tableList.length });
            setStep(3);
            if (onImportComplete) onImportComplete();
        }
    };

    if (!isOpen) return null;

    const isFormValid = form.host && form.port && form.databaseName && form.username && form.password;

    const renderSteps = () => (
        <div className="db-steps">
            <div className={`db-step ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
                <span className="db-step-num">{step > 1 ? '✓' : '1'}</span>
                <span>연결 설정</span>
            </div>
            <span className="db-step-arrow">→</span>
            <div className={`db-step ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
                <span className="db-step-num">{step > 2 ? '✓' : '2'}</span>
                <span>테이블 선택</span>
            </div>
            <span className="db-step-arrow">→</span>
            <div className={`db-step ${step === 3 ? 'active' : ''}`}>
                <span className="db-step-num">3</span>
                <span>완료</span>
            </div>
        </div>
    );

    const renderStep1 = () => (
        <div className="db-split-panel">
            {/* Left: Saved connections list */}
            <div className="db-panel-left">
                <div className="db-panel-left-header">
                    <span className="db-panel-col-name">세션 이름</span>
                    <span className="db-panel-col-host">호스트</span>
                </div>
                <div className="db-session-list">
                    {savedConnections.map(conn => (
                        <div
                            key={conn.id}
                            className={`db-session-item ${selectedConnectionId === conn.id ? 'selected' : ''}`}
                            onClick={() => handleSelectConnection(conn)}
                        >
                            <span className="db-session-name">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.5, flexShrink: 0 }}>
                                    <path d="M12 2C6.48 2 2 5.6 2 10v4c0 4.4 4.48 8 10 8s10-3.6 10-8v-4c0-4.4-4.48-8-10-8z"/>
                                </svg>
                                {conn.connectionName}
                            </span>
                            <span className="db-session-host">{conn.host}</span>
                        </div>
                    ))}
                    {savedConnections.length === 0 && (
                        <div className="db-session-empty">저장된 연결이 없습니다</div>
                    )}
                </div>
                <div className="db-panel-left-actions">
                    <button className="db-icon-btn" onClick={handleNewConnection} title="신규">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                        신규
                    </button>
                    <button className="db-icon-btn" onClick={handleSaveConnection} disabled={!isFormValid || !form.connectionName.trim() || saving} title="저장">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>
                        {saving ? '저장...' : '저장'}
                    </button>
                    <button className="db-icon-btn db-icon-btn-danger" onClick={handleDeleteConnection} disabled={!selectedConnectionId} title="삭제">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                        삭제
                    </button>
                </div>
            </div>

            {/* Right: Connection form */}
            <div className="db-panel-right">
                <div className="db-form-table">
                    <div className="db-form-row">
                        <label className="db-form-label">연결 이름:</label>
                        <div className="db-form-value">
                            <input
                                type="text"
                                placeholder="예: 운영 DB, 테스트 MySQL"
                                value={form.connectionName}
                                onChange={e => handleFormChange('connectionName', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="db-form-row">
                        <label className="db-form-label">네트워크 유형:</label>
                        <div className="db-form-value">
                            <select value={form.dbType} onChange={e => handleFormChange('dbType', e.target.value)}>
                                {DB_TYPES.map(db => (
                                    <option key={db.value} value={db.value}>{db.label} (TCP/IP)</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="db-form-row">
                        <label className="db-form-label">호스트명 / IP:</label>
                        <div className="db-form-value">
                            <input
                                type="text"
                                placeholder="예: 192.168.1.100 또는 db.example.com"
                                value={form.host}
                                onChange={e => handleFormChange('host', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="db-form-row">
                        <label className="db-form-label">사용자:</label>
                        <div className="db-form-value">
                            <input
                                type="text"
                                placeholder="DB 사용자명"
                                value={form.username}
                                onChange={e => handleFormChange('username', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="db-form-row">
                        <label className="db-form-label">암호:</label>
                        <div className="db-form-value">
                            <input
                                type="password"
                                placeholder="DB 비밀번호"
                                value={form.password}
                                onChange={e => handleFormChange('password', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="db-form-row">
                        <label className="db-form-label">포트:</label>
                        <div className="db-form-value db-form-value-short">
                            <input
                                type="number"
                                value={form.port}
                                onChange={e => handleFormChange('port', parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>
                    <div className="db-form-row">
                        <label className="db-form-label">데이터베이스:</label>
                        <div className="db-form-value">
                            <input
                                type="text"
                                placeholder="예: mydb"
                                value={form.databaseName}
                                onChange={e => handleFormChange('databaseName', e.target.value)}
                            />
                        </div>
                    </div>
                    {(form.dbType === 'POSTGRESQL' || form.dbType === 'ORACLE') && (
                        <div className="db-form-row">
                            <label className="db-form-label">스키마:</label>
                            <div className="db-form-value">
                                <input
                                    type="text"
                                    placeholder={form.dbType === 'POSTGRESQL' ? 'public' : ''}
                                    value={form.schemaName}
                                    onChange={e => handleFormChange('schemaName', e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>
                {testResult !== null && (
                    <div className={`db-test-result ${testResult ? 'success' : 'fail'}`}>
                        {testResult ? '연결 성공' : '연결 실패'}
                    </div>
                )}
            </div>
        </div>
    );

    const renderImportProgress = () => {
        if (!importProgress) return null;
        const phase = importProgress.phase;
        const phaseLabel = phase === 'SAVING' ? '앱 DB 저장' : '외부 DB 읽기';

        // 퍼센트 계산
        let percentage = 0;
        if (phase === 'READING' && tableInfo && tableInfo.rowCount > 0) {
            percentage = Math.round((importProgress.readRows / tableInfo.rowCount) * 100);
        } else if (phase === 'SAVING' && importProgress.totalRows > 0) {
            percentage = Math.round((importProgress.readRows / importProgress.totalRows) * 100);
        }

        // 건수 텍스트
        let countText = '';
        if (phase === 'READING' && importProgress.readRows > 0) {
            const total = tableInfo ? tableInfo.rowCount : 0;
            countText = total > 0
                ? `${importProgress.readRows.toLocaleString()} / ${total.toLocaleString()}건 (${percentage}%)`
                : `${importProgress.readRows.toLocaleString()}건 읽음`;
        } else if (phase === 'SAVING' && importProgress.totalRows > 0) {
            countText = `${importProgress.readRows.toLocaleString()} / ${importProgress.totalRows.toLocaleString()}건 (${percentage}%)`;
        }

        return (
            <div className="db-import-progress-box">
                <div className="db-spinner" />
                <div className="db-progress-info">
                    <div className="db-progress-phase">{phaseLabel}</div>
                    <div className="db-progress-message">{importProgress.message || '처리 중...'}</div>
                    {percentage > 0 && (
                        <div className="db-progress-bar-wrap">
                            <div className="db-progress-bar-fill" style={{ width: `${percentage}%` }} />
                        </div>
                    )}
                    {countText && <div className="db-progress-count">{countText}</div>}
                </div>
            </div>
        );
    };

    const renderStep2 = () => (
        <>
            {importing && (
                renderImportProgress()
            )}
            {loadingTables ? (
                <div className="db-loading">
                    <div className="db-spinner" />
                    테이블 목록을 불러오는 중...
                </div>
            ) : tables.length === 0 ? (
                <div className="db-empty">테이블이 없습니다.</div>
            ) : (
                <div style={{ display: 'flex', gap: '16px', opacity: importing ? 0.4 : 1, pointerEvents: importing ? 'none' : 'auto' }}>
                    <div style={{ flex: '1' }}>
                        <div className="db-saved-title">테이블 목록 ({tables.length}개)</div>
                        <div className="db-table-filter">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                            </svg>
                            <input
                                type="text"
                                placeholder="테이블명 검색..."
                                value={tableFilter}
                                onChange={e => setTableFilter(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                            <button className="db-btn" style={{ fontSize: '11px', padding: '2px 8px' }}
                                onClick={() => {
                                    const filtered = tables.filter(t => t.tableName.toLowerCase().includes(tableFilter.toLowerCase()));
                                    setSelectedTables(new Set(filtered.map(t => t.tableName)));
                                }}>전체 선택</button>
                            <button className="db-btn" style={{ fontSize: '11px', padding: '2px 8px' }}
                                onClick={() => setSelectedTables(new Set())}>선택 해제</button>
                            {selectedTables.size > 0 && (
                                <span style={{ fontSize: '11px', color: '#1a73e8', lineHeight: '24px' }}>
                                    {selectedTables.size}개 선택됨
                                </span>
                            )}
                        </div>
                        <div className="db-table-list">
                            {tables.filter(t => t.tableName.toLowerCase().includes(tableFilter.toLowerCase())).map(t => (
                                <div
                                    key={t.tableName}
                                    className={`db-table-item ${previewTable === t.tableName ? 'selected' : ''}`}
                                    onClick={() => handlePreviewTable(t.tableName)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedTables.has(t.tableName)}
                                        onChange={(e) => { e.stopPropagation(); handleToggleTable(t.tableName); }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="db-table-checkbox"
                                    />
                                    <div className="db-table-name-wrap">
                                        <span className="db-table-name">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M4 4h16v4H4V4zm0 6h16v4H4v-4zm0 6h16v4H4v-4z" opacity="0.7"/>
                                            </svg>
                                            {t.tableName}
                                        </span>
                                        {t.tableComment && (
                                            <span className="db-table-comment">{t.tableComment}</span>
                                        )}
                                    </div>
                                    <span className="db-table-rows">{t.rowCount.toLocaleString()}행</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {previewTable && (
                        <div style={{ flex: '1' }}>
                            <div className="db-saved-title">
                                {previewTable} 컬럼 정보
                                {tableInfo && ` (${tableInfo.rowCount.toLocaleString()}행)`}
                            </div>
                            {loadingTableInfo ? (
                                <div className="db-loading">
                                    <div className="db-spinner" />
                                </div>
                            ) : tableInfo && tableInfo.columns ? (
                                <table className="db-columns-table">
                                    <thead>
                                        <tr>
                                            <th>컬럼명</th>
                                            <th>타입</th>
                                            <th>PK</th>
                                            <th>Comment</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableInfo.columns.map(col => (
                                            <tr key={col.columnName}>
                                                <td>{col.columnName}</td>
                                                <td>{col.dataType}</td>
                                                <td>{col.primaryKey ? <span className="db-pk-badge">PK</span> : ''}</td>
                                                <td className="db-col-comment">{col.comment || ''}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : null}
                        </div>
                    )}
                </div>
            )}
        </>
    );

    const renderStep3 = () => (
        <div className="db-import-result">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="#4caf50">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <h3>임포트 완료!</h3>
            {importResult && (
                <p>
                    {importResult.tableCount > 1
                        ? `${importResult.tableCount}개 테이블이 성공적으로 임포트되었습니다.`
                        : `테이블 데이터가 성공적으로 임포트되었습니다.`}
                </p>
            )}
            <p style={{ marginTop: '8px', color: '#888' }}>
                소스 목록에서 해당 데이터를 클릭하여 컬럼 매핑을 진행하세요.
            </p>
        </div>
    );

    return (
        <div className="db-modal-overlay" onClick={onClose}>
            <div className="db-modal-container" ref={modalRef} onClick={e => e.stopPropagation()}>
                <div className="db-modal-header">
                    <h2>
                        {step === 1 ? 'DB 테이블 연결' :
                         step === 2 ? '테이블 선택' : '임포트 완료'}
                    </h2>
                    <button className="db-modal-close" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>

                <div className="db-modal-body">
                    {renderSteps()}
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </div>

                <div className="db-modal-footer">
                    <div className="db-footer-left">
                        {step === 2 && (
                            <button className="db-btn" onClick={() => setStep(1)}>
                                ← 이전
                            </button>
                        )}
                    </div>
                    <div className="db-footer-right">
                        {step === 1 && (
                            <>
                                <button
                                    className="db-btn"
                                    onClick={handleTestConnection}
                                    disabled={!isFormValid || testing}
                                >
                                    {testing ? '테스트 중...' : '연결 테스트'}
                                    {testResult === true && ' ✓'}
                                    {testResult === false && ' ✗'}
                                </button>
                                <button
                                    className="db-btn db-btn-primary"
                                    onClick={handleNextToTables}
                                    disabled={!selectedConnectionId || loadingTables}
                                >
                                    {loadingTables ? '로딩...' : '열기'}
                                </button>
                                <button className="db-btn" onClick={onClose}>
                                    취소
                                </button>
                            </>
                        )}
                        {step === 2 && (
                            <button
                                className="db-btn db-btn-success"
                                onClick={handleImport}
                                disabled={selectedTables.size === 0 || importing}
                            >
                                {importing
                                    ? `임포트 중... (${importingTable || ''})`
                                    : selectedTables.size > 1
                                        ? `${selectedTables.size}개 테이블 임포트`
                                        : selectedTables.size === 1
                                            ? `'${[...selectedTables][0]}' 임포트`
                                            : '테이블을 선택하세요'}
                            </button>
                        )}
                        {step === 3 && (
                            <button className="db-btn db-btn-primary" onClick={onClose}>
                                닫기
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DbConnectionModal;

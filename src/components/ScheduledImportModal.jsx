import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Play, Loader2, Clock } from 'lucide-react';
import { structuredApi } from '../services/api';
import { useAlert } from '../context/AlertContext';
import './ScheduledImportModal.css';

function ScheduledImportModal({ workspaceId, documents, onClose }) {
    const { showAlert, showConfirm } = useAlert();
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        sourceType: 'DB_TABLE',
        sourceDocumentId: '',
        scheduleCron: '0 0 * * *',
        enabled: false
    });

    useEffect(() => {
        fetchConfigs();
    }, [workspaceId]);

    const fetchConfigs = async () => {
        setLoading(true);
        try {
            const data = await structuredApi.schedule.getConfigs(workspaceId);
            setConfigs(data || []);
        } catch (err) {
            console.error('스케줄 설정 조회 실패:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            await structuredApi.schedule.createConfig({
                workspaceId,
                sourceType: formData.sourceType,
                sourceDocumentId: formData.sourceDocumentId || null,
                scheduleCron: formData.scheduleCron,
                enabled: formData.enabled
            });
            showAlert('스케줄 설정이 생성되었습니다.', 'success');
            setShowForm(false);
            fetchConfigs();
        } catch (err) {
            showAlert('스케줄 설정 생성 실패: ' + (err.message || ''), 'error');
        }
    };

    const handleToggleEnabled = async (config) => {
        try {
            await structuredApi.schedule.updateConfig(config.id, {
                ...config,
                enabled: !config.enabled
            });
            fetchConfigs();
        } catch (err) {
            showAlert('상태 변경 실패', 'error');
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await showConfirm('이 스케줄 설정을 삭제하시겠습니까?');
        if (!confirmed) return;
        try {
            await structuredApi.schedule.deleteConfig(id);
            fetchConfigs();
        } catch (err) {
            showAlert('삭제 실패', 'error');
        }
    };

    const handleRunNow = async (id) => {
        try {
            await structuredApi.schedule.runNow(id);
            showAlert('수동 실행이 시작되었습니다.', 'success');
            setTimeout(fetchConfigs, 2000);
        } catch (err) {
            showAlert('실행 실패: ' + (err.message || ''), 'error');
        }
    };

    const getStatusClass = (status) => {
        if (status === 'SUCCESS') return 'sched-status-success';
        if (status === 'FAILED') return 'sched-status-failed';
        if (status === 'RUNNING') return 'sched-status-running';
        return '';
    };

    const structuredDocs = (documents || []).filter(d =>
        d.sourceType === 'CSV' || d.sourceType === 'DATABASE'
    );

    return (
        <div className="sched-modal-overlay" onClick={onClose}>
            <div className="sched-modal" onClick={e => e.stopPropagation()}>
                <div className="sched-modal-header">
                    <h3><Clock size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />스케줄 임포트 관리</h3>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                <div className="sched-modal-body">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <Loader2 size={32} style={{ color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
                        </div>
                    ) : (
                        <>
                            {configs.map(config => (
                                <div key={config.id} className="sched-config-card">
                                    <div className="sched-config-card-header">
                                        <h4>
                                            {config.sourceType}
                                            {config.sourceDocumentId && ` (문서 #${config.sourceDocumentId})`}
                                        </h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {config.lastRunStatus && (
                                                <span className={`sched-status-badge ${getStatusClass(config.lastRunStatus)}`}>
                                                    {config.lastRunStatus}
                                                </span>
                                            )}
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '12px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={config.enabled}
                                                    onChange={() => handleToggleEnabled(config)}
                                                />
                                                활성
                                            </label>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                                        <span>Cron: <code>{config.scheduleCron || '-'}</code></span>
                                        <span>마지막 실행: {config.lastRunAt ? new Date(config.lastRunAt).toLocaleString() : '-'}</span>
                                        <span>처리 건수: {config.lastRunCount || 0}</span>
                                    </div>
                                    {config.lastRunError && (
                                        <div style={{ fontSize: '11px', color: '#dc2626', marginBottom: '8px' }}>
                                            오류: {config.lastRunError}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => handleRunNow(config.id)}
                                            style={{
                                                padding: '4px 12px', background: '#3b82f6', color: '#fff',
                                                border: 'none', borderRadius: '6px', cursor: 'pointer',
                                                fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px'
                                            }}
                                        >
                                            <Play size={12} /> 지금 실행
                                        </button>
                                        <button
                                            onClick={() => handleDelete(config.id)}
                                            style={{
                                                padding: '4px 12px', background: '#fee2e2', color: '#dc2626',
                                                border: 'none', borderRadius: '6px', cursor: 'pointer',
                                                fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px'
                                            }}
                                        >
                                            <Trash2 size={12} /> 삭제
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {configs.length === 0 && !showForm && (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                                    등록된 스케줄 설정이 없습니다.
                                </div>
                            )}

                            {showForm && (
                                <div style={{ border: '2px dashed #3b82f6', borderRadius: '8px', padding: '20px', marginTop: '12px' }}>
                                    <h4 style={{ margin: '0 0 16px', fontSize: '14px', color: '#1e293b' }}>새 스케줄 설정</h4>
                                    <div className="sched-form-grid">
                                        <div className="sched-form-group">
                                            <label>소스 유형</label>
                                            <select
                                                value={formData.sourceType}
                                                onChange={e => setFormData(prev => ({ ...prev, sourceType: e.target.value }))}
                                            >
                                                <option value="DB_TABLE">DB 테이블</option>
                                                <option value="CSV_DIRECTORY">CSV 디렉토리</option>
                                                <option value="API">API</option>
                                            </select>
                                        </div>
                                        <div className="sched-form-group">
                                            <label>매핑 기준 문서</label>
                                            <select
                                                value={formData.sourceDocumentId}
                                                onChange={e => setFormData(prev => ({ ...prev, sourceDocumentId: e.target.value }))}
                                            >
                                                <option value="">-- 선택 --</option>
                                                {structuredDocs.map(doc => (
                                                    <option key={doc.id} value={doc.id}>
                                                        {doc.filename || doc.name} (#{doc.id})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="sched-form-group">
                                            <label>Cron 표현식</label>
                                            <input
                                                type="text"
                                                value={formData.scheduleCron}
                                                onChange={e => setFormData(prev => ({ ...prev, scheduleCron: e.target.value }))}
                                                placeholder="0 0 * * * (매일 자정)"
                                            />
                                        </div>
                                        <div className="sched-form-group">
                                            <label>활성화</label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '4px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.enabled}
                                                    onChange={e => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                                                />
                                                생성 즉시 활성화
                                            </label>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                                        <button
                                            onClick={handleCreate}
                                            style={{
                                                padding: '8px 20px', background: '#10b981', color: '#fff',
                                                border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
                                            }}
                                        >
                                            생성
                                        </button>
                                        <button
                                            onClick={() => setShowForm(false)}
                                            style={{
                                                padding: '8px 20px', background: '#f1f5f9', color: '#475569',
                                                border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
                                            }}
                                        >
                                            취소
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="sched-modal-footer">
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            style={{
                                padding: '10px 20px', background: '#3b82f6', color: '#fff',
                                border: 'none', borderRadius: '8px', cursor: 'pointer',
                                fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                        >
                            <Plus size={16} /> 새 스케줄 추가
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px', background: '#f1f5f9', color: '#475569',
                            border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
                        }}
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ScheduledImportModal;

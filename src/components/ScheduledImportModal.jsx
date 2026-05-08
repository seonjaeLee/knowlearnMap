import { useState, useEffect } from 'react';
import { Plus, Trash2, Play, Loader2 } from 'lucide-react';
import { Button } from '@mui/material';
import { structuredApi } from '../services/api';
import { useAlert } from '../context/AlertContext';
import { useDialog } from '../hooks/useDialog';
import BaseModal from './common/modal/BaseModal';
import './ScheduledImportModal.css';

function ScheduledImportModal({ workspaceId, documents, onClose }) {
    const { showAlert } = useAlert();
    const { confirm } = useDialog();
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
        const confirmed = await confirm('이 스케줄 설정을 삭제하시겠습니까?');
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

    const actions = (
        <>
            {!showForm && (
                <Button onClick={() => setShowForm(true)} variant="contained" startIcon={<Plus size={16} />}>
                    새 스케줄 추가
                </Button>
            )}
            <Button onClick={onClose} variant="outlined">
                닫기
            </Button>
        </>
    );

    return (
        <BaseModal
            open
            onClose={onClose}
            title="스케줄 임포트 관리"
            maxWidth="md"
            fullWidth
            contentClassName="sched-modal-content"
            actions={actions}
        >
                <div className="sched-modal-body">
                    {loading ? (
                        <div className="sched-loading">
                            <Loader2 size={32} className="sched-loading-icon" />
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
                                        <div className="sched-config-header-right">
                                            {config.lastRunStatus && (
                                                <span className={`sched-status-badge ${getStatusClass(config.lastRunStatus)}`}>
                                                    {config.lastRunStatus}
                                                </span>
                                            )}
                                            <label className="sched-enabled-label">
                                                <input
                                                    type="checkbox"
                                                    checked={config.enabled}
                                                    onChange={() => handleToggleEnabled(config)}
                                                />
                                                활성
                                            </label>
                                        </div>
                                    </div>
                                    <div className="sched-config-meta">
                                        <span>Cron: <code>{config.scheduleCron || '-'}</code></span>
                                        <span>마지막 실행: {config.lastRunAt ? new Date(config.lastRunAt).toLocaleString() : '-'}</span>
                                        <span>처리 건수: {config.lastRunCount || 0}</span>
                                    </div>
                                    {config.lastRunError && (
                                        <div className="sched-config-error">
                                            오류: {config.lastRunError}
                                        </div>
                                    )}
                                    <div className="sched-config-actions">
                                        <button onClick={() => handleRunNow(config.id)} className="sched-run-btn">
                                            <Play size={12} /> 지금 실행
                                        </button>
                                        <button onClick={() => handleDelete(config.id)} className="sched-delete-btn">
                                            <Trash2 size={12} /> 삭제
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {configs.length === 0 && !showForm && (
                                <div className="sched-empty">
                                    등록된 스케줄 설정이 없습니다.
                                </div>
                            )}

                            {showForm && (
                                <div className="sched-form-panel">
                                    <h4 className="sched-form-title">새 스케줄 설정</h4>
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
                                            <label className="sched-enabled-create-label">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.enabled}
                                                    onChange={e => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                                                />
                                                생성 즉시 활성화
                                            </label>
                                        </div>
                                    </div>
                                    <div className="sched-form-actions">
                                        <button onClick={handleCreate} className="sched-create-btn">
                                            생성
                                        </button>
                                        <button onClick={() => setShowForm(false)} className="sched-cancel-btn">
                                            취소
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
        </BaseModal>
    );
}

export default ScheduledImportModal;

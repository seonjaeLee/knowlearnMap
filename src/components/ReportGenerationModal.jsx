import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { workspaceApi } from '../services/api';
import BaseModal from './common/modal/BaseModal';
import { useDialog } from '../hooks/useDialog';
import './ReportGenerationModal.css';
import './ReportCreationModal.css';

function ReportGenerationModal({ isOpen, onClose, workspaceId }) {
    const { confirm } = useDialog();
    const [view, setView] = useState('list'); // 'list' | 'edit'
    const [roles, setRoles] = useState([]);
    const [editTarget, setEditTarget] = useState(null); // null | 'default' | role object
    const [editTitle, setEditTitle] = useState('');
    const [editPromptText, setEditPromptText] = useState('');
    const [editEnabled, setEditEnabled] = useState(true);
    const [defaultText, setDefaultText] = useState('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    // Load roles when modal opens
    useEffect(() => {
        if (isOpen && workspaceId) {
            loadRoles();
            setView('list');
            setEditTarget(null);
        }
    }, [isOpen, workspaceId]);

    const loadRoles = async () => {
        setLoading(true);
        try {
            const data = await workspaceApi.getRoles(workspaceId);
            setRoles(data || []);
        } catch (error) {
            console.error('Error loading roles:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // ===== Handlers =====

    const handleDefaultCardClick = async () => {
        setEditTarget('default');
        setEditTitle('기초값');
        setEditPromptText('');
        setView('edit');
        // Lazy load default text
        try {
            const text = await workspaceApi.getPersonaDefaultText(workspaceId);
            setDefaultText(typeof text === 'string' ? text : '');
            setEditPromptText(typeof text === 'string' ? text : '');
        } catch (error) {
            console.error('Error loading default text:', error);
            setDefaultText('');
            setEditPromptText('');
        }
    };

    const handleRoleCardClick = (role) => {
        setEditTarget(role);
        setEditTitle(role.roleName);
        setEditPromptText(role.promptText || '');
        setEditEnabled(role.enabled !== false);
        setView('edit');
    };

    const handleToggleEnabled = async (role, e) => {
        e.stopPropagation();
        const newEnabled = role.enabled === false;
        // Optimistic UI update
        setRoles(prev => prev.map(r =>
            r.id === role.id ? { ...r, enabled: newEnabled } : r
        ));
        try {
            await workspaceApi.updateRole(workspaceId, role.id, { enabled: newEnabled });
        } catch (error) {
            console.error('Error toggling role:', error);
            // Revert on error
            setRoles(prev => prev.map(r =>
                r.id === role.id ? { ...r, enabled: !newEnabled } : r
            ));
        }
    };

    const handleSave = async () => {
        if (!editTarget || editTarget === 'default') return;
        setSaving(true);
        try {
            const updated = await workspaceApi.updateRole(workspaceId, editTarget.id, {
                roleName: editTitle,
                promptText: editPromptText,
                enabled: editEnabled,
            });
            setRoles(prev => prev.map(r => r.id === editTarget.id ? updated : r));
            setView('list');
        } catch (error) {
            console.error('Error saving role:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!editTarget || editTarget === 'default' || !editTarget.id) return;
        const confirmed = await confirm('이 페르소나를 삭제하시겠습니까?');
        if (!confirmed) return;
        setSaving(true);
        try {
            await workspaceApi.deleteRole(workspaceId, editTarget.id);
            setRoles(prev => prev.filter(r => r.id !== editTarget.id));
            setView('list');
        } catch (error) {
            console.error('Error deleting role:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleAddPersona = () => {
        setEditTarget('new');
        setEditTitle('');
        setEditPromptText('');
        setEditEnabled(true);
        setView('edit');
    };

    const handleSaveNew = async () => {
        if (!editTitle.trim()) return;
        setSaving(true);
        try {
            const created = await workspaceApi.createRole(workspaceId, {
                roleName: editTitle,
                promptText: editPromptText,
                enabled: editEnabled,
            });
            setRoles(prev => [...prev, created]);
            setView('list');
        } catch (error) {
            console.error('Error creating role:', error);
        } finally {
            setSaving(false);
        }
    };

    // ========== Edit View ==========
    if (view === 'edit' && editTarget) {
        const isDefault = editTarget === 'default';
        const isNew = editTarget === 'new';
        const isExistingRole = !isDefault && !isNew;

        return (
            <BaseModal
                open={isOpen}
                onClose={onClose}
                title="페르소나 관리"
                subtitle={isNew ? '신규 페르소나' : isDefault ? '기초값' : editTitle}
                maxWidth="md"
                fullWidth
                contentClassName="report-generation-edit-modal-content"
            >
                    <div className="report-generation-edit-modal-body">
                        {/* 이름 */}
                        <div className="form-section">
                            <label className="form-label">이름</label>
                            {isDefault ? (
                                <div className="persona-default-name">
                                    기초값
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    className="form-textarea persona-title-field"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    placeholder="페르소나 이름"
                                />
                            )}
                        </div>

                        {/* 지시문 */}
                        <div className="form-section">
                            <label className="form-label">
                                {isDefault ? '기본 지시문 (읽기 전용)' : '지시문'}
                            </label>
                            <textarea
                                value={editPromptText}
                                onChange={(e) => setEditPromptText(e.target.value)}
                                readOnly={isDefault}
                                placeholder="이 페르소나의 역할과 관점을 설명하세요"
                                rows="8"
                                className={
                                    isDefault
                                        ? 'form-textarea persona-readonly-textarea'
                                        : 'form-textarea'
                                }
                            />
                        </div>

                        {/* 사용안함 체크박스 (기초값 제외) */}
                        {!isDefault && (
                            <div className="form-section">
                                <label className="persona-checkbox-label persona-checkbox-inline">
                                    <input
                                        type="checkbox"
                                        checked={!editEnabled}
                                        onChange={(e) => setEditEnabled(!e.target.checked)}
                                    />
                                    <span>사용안함</span>
                                </label>
                            </div>
                        )}

                        {/* 버튼 */}
                        {!isDefault && (
                            <div className="form-actions report-generation-edit-actions">
                                {/* 삭제 버튼: 기존 사용자 추가 페르소나만 */}
                                {isExistingRole && !editTarget.isDefault && (
                                    <Button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={saving}
                                        variant="outlined"
                                        color="error"
                                        className="persona-delete-btn"
                                    >
                                        삭제
                                    </Button>
                                )}
                                <Button
                                    type="button"
                                    onClick={isNew ? handleSaveNew : handleSave}
                                    disabled={saving || (!isDefault && !editTitle.trim())}
                                    variant="contained"
                                >
                                    {saving ? '저장 중...' : '저장'}
                                </Button>
                            </div>
                        )}
                    </div>
            </BaseModal>
        );
    }

    // ========== List View ==========
    return (
        <BaseModal
            open={isOpen}
            onClose={onClose}
            title="페르소나 관리"
            maxWidth="lg"
            fullWidth
            contentClassName="report-generation-list-modal-content"
        >
                <div className="report-generation-list-modal-body">
                    {loading ? (
                        <div className="report-generation-loading">
                            로딩 중...
                        </div>
                    ) : (
                        <>
                            <div className="format-section">
                                <h3 className="section-title">페르소나</h3>
                                <div className="format-grid">
                                    {/* 기초값 카드 — 항상 첫 번째, 하드코딩 */}
                                    <div
                                        className="format-card default-persona-card"
                                        onClick={handleDefaultCardClick}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <div className="format-header">
                                            <h4 className="format-title">기초값</h4>
                                        </div>
                                        <p className="format-description">
                                            기본 채팅 지시문입니다
                                        </p>
                                    </div>

                                    {/* workspace_role에서 로드된 역할 카드들 */}
                                    {roles.map(role => (
                                        <div
                                            key={role.id}
                                            className={`format-card ${role.enabled === false ? 'disabled-persona-card' : ''}`}
                                            onClick={() => handleRoleCardClick(role)}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <div className="format-header">
                                                <h4 className="format-title">{role.roleName}</h4>
                                                <span className="edit-icon-btn edit-icon-disabled">
                                                    ✏️
                                                </span>
                                            </div>
                                            <p className="format-description">
                                                {role.promptText
                                                    ? (role.promptText.length > 50 ? role.promptText.substring(0, 50) + '...' : role.promptText)
                                                    : ''}
                                            </p>
                                            <label className="persona-checkbox-label" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={role.enabled === false}
                                                    onChange={(e) => handleToggleEnabled(role, e)}
                                                />
                                                <span>사용안함</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 페르소나 추가 버튼 */}
                            <div className="format-section">
                                <button className="add-persona-btn" onClick={handleAddPersona}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                    </svg>
                                    페르소나 추가
                                </button>
                            </div>
                        </>
                    )}
                </div>
        </BaseModal>
    );
}

export default ReportGenerationModal;

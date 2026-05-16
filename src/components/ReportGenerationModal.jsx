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

    const isRoleDisabled = (role) => (
        role?.enabled === false
        || role?.enabled === 0
        || role?.enabled === '0'
        || role?.enabled === 'N'
    );

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
        setEditEnabled(!isRoleDisabled(role));
        setView('edit');
    };

    const handleToggleEnabled = async (role, e) => {
        e.stopPropagation();
        const newEnabled = isRoleDisabled(role);
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
            const nextRole = (updated && typeof updated === 'object')
                ? { ...editTarget, ...updated, enabled: editEnabled, roleName: editTitle, promptText: editPromptText }
                : { ...editTarget, enabled: editEnabled, roleName: editTitle, promptText: editPromptText };
            setRoles(prev => prev.map(r => r.id === editTarget.id ? nextRole : r));
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

    const isEdit = view === 'edit' && Boolean(editTarget);
    const isDefault = isEdit && editTarget === 'default';
    const isNew = isEdit && editTarget === 'new';
    const isExistingRole = isEdit && !isDefault && !isNew;

    const editActions = !isEdit ? null : isDefault ? (
        <div className="persona-actions-left">
            <Button
                type="button"
                onClick={() => setView('list')}
                variant="outlined"
                className="persona-list-move-btn"
            >
                목록이동
            </Button>
        </div>
    ) : (
        <>
            <div className="persona-actions-left">
                <Button
                    type="button"
                    onClick={() => setView('list')}
                    disabled={saving}
                    variant="outlined"
                    className="persona-list-move-btn"
                >
                    목록이동
                </Button>
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
            </div>
            <Button
                type="button"
                onClick={isNew ? handleSaveNew : handleSave}
                disabled={saving || !editTitle.trim()}
                variant="contained"
            >
                {saving ? '저장 중...' : '저장'}
            </Button>
        </>
    );

    return (
        <BaseModal
            open={isOpen}
            onClose={onClose}
            title="페르소나 관리"
            subtitle={
                isEdit
                    ? (isNew ? '신규 페르소나' : isDefault ? '기초값' : editTitle)
                    : '페르소나'
            }
            maxWidth="md"
            fullWidth
            headerVariant={isEdit ? 'default' : 'filled'}
            headerClassName="report-generation-modal-header"
            contentClassName={
                isEdit
                    ? 'report-generation-edit-modal-content report-generation-modal-content kl-modal-form'
                    : 'report-generation-list-modal-content report-generation-modal-content kl-modal-form'
            }
            actionsClassName="report-generation-modal-actions"
            actions={editActions}
        >
            {isEdit ? (
                <div className="report-generation-edit-modal-body">
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

                    <div className="form-section">
                        <label className="form-label">지시문</label>
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
                        {!isDefault && (
                            <label className="persona-checkbox-label persona-checkbox-inline">
                                <input
                                    type="checkbox"
                                    checked={!editEnabled}
                                    onChange={(e) => setEditEnabled(!e.target.checked)}
                                />
                                <span>사용안함</span>
                            </label>
                        )}
                    </div>
                </div>
            ) : (
                <div className="report-generation-list-modal-body">
                    {loading ? (
                        <div className="report-generation-loading">
                            로딩 중...
                        </div>
                    ) : (
                        <>
                            <div className="format-section">
                                <div className="format-grid">
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

                                    {roles.map(role => (
                                        <div
                                            key={role.id}
                                            className={`format-card ${isRoleDisabled(role) ? 'disabled-persona-card' : ''}`}
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
                                            <label
                                                className="persona-checkbox-label"
                                                onMouseDown={(e) => e.stopPropagation()}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isRoleDisabled(role)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => handleToggleEnabled(role, e)}
                                                />
                                                <span>사용안함</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="format-section">
                                <button type="button" className="add-persona-btn" onClick={handleAddPersona}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                    </svg>
                                    페르소나 추가
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </BaseModal>
    );
}

export default ReportGenerationModal;

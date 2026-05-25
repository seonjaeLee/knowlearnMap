import { useEffect, useState } from 'react';
import { workspaceApi } from '../services/api';
import BaseModal from './common/modal/BaseModal';
import { useDialog } from '../hooks/useDialog';
import './ReportGenerationModal.css';

/** 기초값(읽기전용) 지시문 — API 미반환·빈 값일 때 표시 */
const PERSONA_DEFAULT_PROMPT_TEXT =
    '범용 전문가로서 객관적이고 정확한 답변을 제공합니다. 검색 결과를 충실히 반영하여 사용자에게 유용한 정보를 전달합니다.';

function ReportGenerationModal({ isOpen, onClose, workspaceId }) {
    const { confirm } = useDialog();
    const [view, setView] = useState('list'); // 'list' | 'edit'
    const [roles, setRoles] = useState([]);
    const [editTarget, setEditTarget] = useState(null); // null | 'default' | 'new' | role object
    const [editTitle, setEditTitle] = useState('');
    const [editPromptText, setEditPromptText] = useState('');
    const [editEnabled, setEditEnabled] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    const isRoleDisabled = (role) => (
        role?.enabled === false
        || role?.enabled === 0
        || role?.enabled === '0'
        || role?.enabled === 'N'
    );

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

    const handleDefaultCardClick = async () => {
        setEditTarget('default');
        setEditTitle('기초값');
        setEditPromptText(PERSONA_DEFAULT_PROMPT_TEXT);
        setView('edit');
        try {
            const text = await workspaceApi.getPersonaDefaultText(workspaceId);
            const resolved = typeof text === 'string' && text.trim() ? text.trim() : PERSONA_DEFAULT_PROMPT_TEXT;
            setEditPromptText(resolved);
        } catch (error) {
            console.error('Error loading default text:', error);
            setEditPromptText(PERSONA_DEFAULT_PROMPT_TEXT);
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
        setRoles(prev => prev.map(r =>
            r.id === role.id ? { ...r, enabled: newEnabled } : r
        ));
        try {
            await workspaceApi.updateRole(workspaceId, role.id, { enabled: newEnabled });
        } catch (error) {
            console.error('Error toggling role:', error);
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

    const handleBackToList = () => {
        setView('list');
        setEditTarget(null);
    };

    const isEdit = view === 'edit' && Boolean(editTarget);
    const isDefault = isEdit && editTarget === 'default';
    const isNew = isEdit && editTarget === 'new';
    const isExistingRole = isEdit && !isDefault && !isNew;
    const canSave = !isDefault && (isNew || isExistingRole);

    const handleEditFormSubmit = (e) => {
        e.preventDefault();
        if (!canSave || saving || !editTitle.trim()) return;
        if (isNew) {
            handleSaveNew();
        } else {
            handleSave();
        }
    };

    const editSubtitle = isNew
        ? '신규 페르소나'
        : isDefault
            ? '기초값'
            : (editTitle || '페르소나');

    const editActions = !isEdit ? null : (
        <div className="kl-modal-actions-split">
            <div className="kl-modal-actions-split__left">
                <button
                    type="button"
                    onClick={handleBackToList}
                    disabled={saving}
                    className="kl-btn primary-outline md"
                >
                    목록이동
                </button>
                {isExistingRole && !editTarget.isDefault && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={saving}
                        className="kl-btn danger-outline md"
                    >
                        삭제
                    </button>
                )}
            </div>
            <div className="kl-modal-actions-split__right">
                {!isDefault && canSave && (
                    <button
                        type="submit"
                        form="persona-edit-form"
                        disabled={saving || !editTitle.trim()}
                        className="kl-btn primary-full md"
                    >
                        {saving ? '저장 중...' : '저장'}
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <BaseModal
            open={isOpen}
            onClose={onClose}
            title="페르소나 관리"
            subtitle={isEdit ? editSubtitle : '페르소나'}
            maxWidth="md"
            fullWidth
            headerVariant={isEdit ? 'default' : 'filled'}
            headerClassName="report-generation-modal-header"
            contentClassName={
                isEdit
                    ? 'persona-edit-modal-content report-generation-modal-content kl-modal-form kl-scrollbar-thin'
                    : 'report-generation-list-modal-content report-generation-modal-content kl-modal-form kl-scrollbar-thin'
            }
            actionsClassName="report-generation-modal-actions"
            actions={editActions}
        >
            {isEdit ? (
                <form
                    id="persona-edit-form"
                    onSubmit={handleEditFormSubmit}
                    className="persona-modal-form report-generation-edit-modal-body"
                >
                    <div className="kl-modal-form-row kl-vert-start">
                        <label className="kl-modal-form-row__label" htmlFor="persona-name">
                            이름
                            {!isDefault && (
                                <span className="kl-modal-form-required" aria-hidden="true"> *</span>
                            )}
                        </label>
                        <div className="kl-modal-form-row__control">
                            {isDefault ? (
                                <input
                                    id="persona-name"
                                    type="text"
                                    readOnly
                                    value="기초값"
                                    className="kl-form-readonly kl-form-readonly--control"
                                    aria-readonly="true"
                                />
                            ) : (
                                <input
                                    id="persona-name"
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    placeholder="페르소나 이름"
                                    disabled={saving}
                                    required
                                />
                            )}
                        </div>
                    </div>

                    <div className="kl-modal-form-field-stack">
                        <label className="kl-modal-form-field-stack__label" htmlFor="persona-prompt">
                            지시문
                        </label>
                        <div className="kl-modal-form-field-stack__control">
                            <textarea
                                id="persona-prompt"
                                value={editPromptText}
                                onChange={(e) => setEditPromptText(e.target.value)}
                                readOnly={isDefault}
                                aria-readonly={isDefault ? 'true' : undefined}
                                placeholder={isDefault ? undefined : '이 페르소나의 역할과 관점을 설명하세요'}
                                rows={8}
                                className={isDefault ? 'kl-form-readonly kl-form-readonly--control persona-instruction-textarea' : 'persona-instruction-textarea'}
                                disabled={saving && !isDefault}
                            />
                        </div>
                    </div>

                    {!isDefault && (
                        <div className="persona-disable-agreement">
                            <label className="persona-disable-consent" htmlFor="persona-disabled">
                                <input
                                    id="persona-disabled"
                                    type="checkbox"
                                    checked={!editEnabled}
                                    onChange={(e) => setEditEnabled(!e.target.checked)}
                                    disabled={saving}
                                />
                                <span>사용안함</span>
                            </label>
                        </div>
                    )}
                </form>
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
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handleDefaultCardClick();
                                            }
                                        }}
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
                                            className={`format-card add-set-card${isRoleDisabled(role) ? ' disabled-persona-card' : ''}`}
                                            onClick={() => handleRoleCardClick(role)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    handleRoleCardClick(role);
                                                }
                                            }}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <div className="format-header">
                                                <h4 className="format-title">{role.roleName}</h4>
                                                <span className="add-set-card__edit" aria-hidden>
                                                    ✏️
                                                </span>
                                            </div>
                                            <p className="format-description">
                                                {role.promptText
                                                    ? (role.promptText.length > 50 ? `${role.promptText.substring(0, 50)}...` : role.promptText)
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
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
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

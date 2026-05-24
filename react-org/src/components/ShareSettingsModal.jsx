import { useState, useEffect, useRef } from 'react';
import { X, Users, Globe, Lock } from 'lucide-react';
import { Button } from '@mui/material';
import { workspaceApi } from '../services/api';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import BaseModal from './common/modal/BaseModal';
import {
    shareFormModalPaperClassName,
    shareFormModalPaperSx,
} from './common/modal/supportFormModalPaperSx';
import {
    getMockSharedMembers,
    mockMemberSearchSuggestions,
} from '../data/workspaceShareMockData';
import './ShareSettingsModal.css';

const isWorkspaceMockEnabled = import.meta.env.VITE_ENABLE_WORKSPACE_MOCK === 'true';

function ShareSettingsModal({ workspace, onClose, onSaved }) {
    const [shareType, setShareType] = useState(workspace?.shareType || 'NONE');
    const [members, setMembers] = useState([]);
    const [newEmail, setNewEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [addingMember, setAddingMember] = useState(false);
    const { showAlert } = useAlert();
    const { isAdmin } = useAuth();

    // 자동완성 상태
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchTimerRef = useRef(null);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);

    useEffect(() => {
        if (!workspace) return;
        setShareType(workspace.shareType || 'NONE');
        if (workspace.shareType === 'INDIVIDUAL') {
            if (isWorkspaceMockEnabled) {
                setMembers(getMockSharedMembers(workspace.id));
            } else {
                fetchMembers();
            }
        } else {
            setMembers([]);
        }
    }, [workspace?.id]);

    // 외부 클릭 시 자동완성 닫기
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target) &&
                inputRef.current && !inputRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchMembers = async () => {
        if (isWorkspaceMockEnabled) {
            setMembers(getMockSharedMembers(workspace.id));
            return;
        }
        try {
            const data = await workspaceApi.getSharedMembers(workspace.id);
            setMembers(data || []);
        } catch (err) {
            console.error('공유 멤버 조회 실패:', err);
        }
    };

    const searchEmails = async (query) => {
        if (!query || query.trim().length < 1) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        try {
            const q = query.trim().toLowerCase();
            const existingIds = new Set(members.map((m) => m.memberId));
            const existingEmails = new Set(members.map((m) => (m.email || '').toLowerCase()));
            let results;
            if (isWorkspaceMockEnabled) {
                results = mockMemberSearchSuggestions.filter(
                    (r) => r.email.toLowerCase().includes(q)
                        && !existingIds.has(r.memberId)
                        && !existingEmails.has(r.email.toLowerCase()),
                );
            } else {
                results = await workspaceApi.searchMembers(q);
                results = (results || []).filter((r) => !existingIds.has(r.memberId));
            }
            setSuggestions(results);
            setShowSuggestions(results.length > 0);
            setSelectedIndex(-1);
        } catch (err) {
            console.error('멤버 검색 실패:', err);
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setNewEmail(value);

        // 디바운스 검색
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            searchEmails(value);
        }, 300);
    };

    const handleSelectSuggestion = (email) => {
        setNewEmail(email);
        setShowSuggestions(false);
        setSuggestions([]);
        // 선택 후 바로 추가
        handleAddMemberWithEmail(email);
    };

    const handleKeyDown = (e) => {
        if (showSuggestions && suggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, -1));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSelectSuggestion(suggestions[selectedIndex].email);
                } else {
                    handleAddMember();
                }
            } else if (e.key === 'Escape') {
                setShowSuggestions(false);
            }
        } else if (e.key === 'Enter') {
            handleAddMember();
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const memberEmails = shareType === 'INDIVIDUAL'
                ? members.map((m) => m.email).filter(Boolean)
                : undefined;
            let updated;
            if (isWorkspaceMockEnabled) {
                updated = { ...workspace, shareType, memberCount: memberEmails?.length ?? 0 };
            } else {
                updated = await workspaceApi.updateShare(workspace.id, shareType, memberEmails);
            }
            showAlert('공유 설정이 변경되었습니다.');
            onSaved?.(updated);
            onClose();
        } catch (err) {
            console.error('공유 설정 변경 실패:', err);
            showAlert(err.message || '공유 설정 변경에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async () => {
        if (!newEmail.trim()) return;
        await handleAddMemberWithEmail(newEmail.trim());
    };

    const handleAddMemberWithEmail = async (email) => {
        setAddingMember(true);
        setShowSuggestions(false);
        try {
            let added;
            if (isWorkspaceMockEnabled) {
                const store = getMockSharedMembers(workspace.id);
                if (store.some((m) => (m.email || '').toLowerCase() === email.toLowerCase())) {
                    showAlert('이미 추가된 멤버입니다.');
                    return;
                }
                added = {
                    memberId: `mock-share-${workspace.id}-${Date.now()}`,
                    email,
                    sharedAt: new Date().toISOString(),
                };
                store.push(added);
            } else {
                added = await workspaceApi.addSharedMember(workspace.id, email);
            }
            setMembers((prev) => [...prev, added]);
            setNewEmail('');
            setSuggestions([]);
            setShareType('INDIVIDUAL');
        } catch (err) {
            console.error('멤버 추가 실패:', err);
            showAlert(err.message || '멤버 추가에 실패했습니다.');
        } finally {
            setAddingMember(false);
        }
    };

    const handleRemoveMember = async (memberId) => {
        try {
            if (isWorkspaceMockEnabled) {
                const store = getMockSharedMembers(workspace.id);
                const next = store.filter((m) => m.memberId !== memberId);
                store.length = 0;
                store.push(...next);
            } else {
                await workspaceApi.removeSharedMember(workspace.id, memberId);
            }
            setMembers((prev) => prev.filter((m) => m.memberId !== memberId));
        } catch (err) {
            console.error('멤버 삭제 실패:', err);
            showAlert('멤버 삭제에 실패했습니다.');
        }
    };

    const handleShareTypeChange = (type) => {
        setShareType(type);
        if (type === 'INDIVIDUAL' && members.length === 0) {
            fetchMembers();
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('ko-KR', {
            month: 'short', day: 'numeric'
        });
    };

    return (
        <BaseModal
            open={Boolean(workspace)}
            onClose={onClose}
            title="공유 설정"
            subtitle={`워크스페이스 - ${workspace?.name || '-'}`}
            maxWidth={false}
            fullWidth={false}
            paperSx={shareFormModalPaperSx}
            paperClassName={shareFormModalPaperClassName}
            contentClassName="share-modal-content kl-modal-form"
            actionsClassName="share-modal-actions"
            actionsAlign="right"
            actions={(
                <>
                    <Button variant="outlined" onClick={onClose}>취소</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? '저장 중...' : '저장'}
                    </Button>
                </>
            )}
        >
            <div className="share-modal-body">
                    <div className="share-radio-group">
                        <label
                            className={`share-radio-item ${shareType === 'NONE' ? 'selected' : ''}`}
                            onClick={() => handleShareTypeChange('NONE')}
                        >
                            <input
                                type="radio"
                                name="shareType"
                                value="NONE"
                                checked={shareType === 'NONE'}
                                onChange={() => handleShareTypeChange('NONE')}
                            />
                            <div className="share-radio-label">
                                <div className="label-title">
                                    <Lock size={14} className="share-label-icon" />
                                    공유 없음
                                </div>
                                <div className="label-desc">소유자만 접근할 수 있습니다</div>
                            </div>
                        </label>

                        {isAdmin && (
                        <label
                            className={`share-radio-item ${shareType === 'ALL' ? 'selected' : ''}`}
                            onClick={() => handleShareTypeChange('ALL')}
                        >
                            <input
                                type="radio"
                                name="shareType"
                                value="ALL"
                                checked={shareType === 'ALL'}
                                onChange={() => handleShareTypeChange('ALL')}
                            />
                            <div className="share-radio-label">
                                <div className="label-title">
                                    <Globe size={14} className="share-label-icon" />
                                    전체 공유
                                </div>
                                <div className="label-desc">모든 사용자가 읽기 전용으로 접근할 수 있습니다 (관리자 전용)</div>
                            </div>
                        </label>
                        )}

                        <label
                            className={`share-radio-item ${shareType === 'INDIVIDUAL' ? 'selected' : ''}`}
                            onClick={() => handleShareTypeChange('INDIVIDUAL')}
                        >
                            <input
                                type="radio"
                                name="shareType"
                                value="INDIVIDUAL"
                                checked={shareType === 'INDIVIDUAL'}
                                onChange={() => handleShareTypeChange('INDIVIDUAL')}
                            />
                            <div className="share-radio-label">
                                <div className="label-title">
                                    <Users size={14} className="share-label-icon" />
                                    개별 공유
                                </div>
                                <div className="label-desc">지정한 사용자만 접근할 수 있습니다</div>
                            </div>
                        </label>
                    </div>

                    {shareType === 'INDIVIDUAL' && (
                        <div className="share-members-section">
                            <div className="share-form-row share-form-row--start">
                                <label className="share-form-row__label" htmlFor="share-member-email">
                                    공유 멤버 ({members.length})
                                </label>
                                <div className="share-form-row__control">
                                    <div className="share-member-input-group">
                                        <div className="share-member-input-field">
                                            <input
                                                id="share-member-email"
                                                ref={inputRef}
                                                type="text"
                                                placeholder="사용자 이메일 입력 (자동완성)"
                                                value={newEmail}
                                                onChange={handleEmailChange}
                                                onKeyDown={handleKeyDown}
                                                onFocus={() => {
                                                    if (suggestions.length > 0) setShowSuggestions(true);
                                                }}
                                                autoComplete="off"
                                            />
                                            {showSuggestions && suggestions.length > 0 ? (
                                                <div ref={suggestionsRef} className="share-autocomplete-dropdown">
                                                    {suggestions.map((s, idx) => (
                                                        <div
                                                            key={s.memberId}
                                                            className={`share-autocomplete-item ${idx === selectedIndex ? 'selected' : ''}`}
                                                            onClick={() => handleSelectSuggestion(s.email)}
                                                            onMouseEnter={() => setSelectedIndex(idx)}
                                                        >
                                                            {s.email}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>
                                        <button
                                            type="button"
                                            className="kl-btn-primary-sm"
                                            onClick={handleAddMember}
                                            disabled={addingMember || !newEmail.trim()}
                                        >
                                            {addingMember ? '...' : '추가'}
                                        </button>
                                    </div>
                                    <ul className="share-member-attach-list" aria-label="공유 멤버 목록">
                                        {members.length > 0 ? (
                                            members.map((m) => (
                                                <li key={m.memberId} className="share-member-attach-item">
                                                    <div className="share-member-attach-item__body">
                                                        <span className="share-member-attach-item__email">{m.email}</span>
                                                        {m.sharedAt ? (
                                                            <span className="share-member-attach-item__date">
                                                                공유 {formatDate(m.sharedAt)}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="kl-chip-dismiss-btn"
                                                        onClick={() => handleRemoveMember(m.memberId)}
                                                        title="삭제"
                                                        aria-label={`${m.email} 삭제`}
                                                    >
                                                        <X size={14} aria-hidden />
                                                    </button>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="share-member-attach-empty">공유된 멤버가 없습니다</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
            </div>
        </BaseModal>
    );
}

export default ShareSettingsModal;

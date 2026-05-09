import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { memberApi } from '../../services/api';
import { useDialog } from '../../hooks/useDialog';
import { Users, Search, RotateCcw, Pencil, Trash2, Unlock, Mail } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import BaseModal from '../../components/common/modal/BaseModal';
import KmModalSelect from '../../components/common/modal/KmModalSelect';
import './admin-common.css';
import './AdminMemberManagement.css';

const ROLE_BADGE = {
    ADMIN: 'admin-badge admin-badge-primary',
    SYSOP: 'admin-badge admin-badge-warn',
    USER: 'admin-badge admin-badge-neutral',
};

const GRADE_BADGE = {
    ADMIN: 'admin-badge admin-badge-primary',
    SPECIAL: 'admin-badge admin-badge-warn',
    MAX: 'admin-badge admin-badge-danger',
    PRO: 'admin-badge admin-badge-success',
    FREE: 'admin-badge admin-badge-neutral',
};

const STATUS_BADGE = {
    ACTIVE: 'admin-badge admin-badge-success',
    VERIFYING_EMAIL: 'admin-badge admin-badge-warn',
    WAITING_APPROVAL: 'admin-badge admin-badge-warn',
    APPROVED_WAITING_PASSWORD: 'admin-badge admin-badge-info',
};

function AdminMemberManagement() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editMember, setEditMember] = useState(null);
    const { alert, confirm } = useDialog();

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const data = await memberApi.getAll();
            setMembers(data || []);
        } catch (error) {
            console.error('Failed to fetch members:', error);
            await alert('사용자 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const filteredMembers = members.filter((member) => {
        const q = searchTerm.toLowerCase();
        return (
            (member.email && member.email.toLowerCase().includes(q)) ||
            (member.domain && member.domain.toLowerCase().includes(q)) ||
            (member.role && member.role.toLowerCase().includes(q))
        );
    });

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const handleDelete = async (member) => {
        const ok = await confirm(`"${member.email}" 사용자를 삭제하시겠습니까?`);
        if (!ok) return;
        try {
            await memberApi.delete(member.id);
            await alert('삭제되었습니다.');
            fetchMembers();
        } catch (error) {
            await alert(error?.error || '삭제에 실패했습니다.');
        }
    };

    const handleUnlock = async (member) => {
        const ok = await confirm(`"${member.email}" 계정 잠금을 해제하시겠습니까?`);
        if (!ok) return;
        try {
            await memberApi.update(member.id, { failedLoginAttempts: '0' });
            await alert('잠금이 해제되었습니다.');
            fetchMembers();
        } catch (error) {
            await alert('잠금 해제에 실패했습니다.');
        }
    };

    const handleResendVerification = async (member) => {
        const ok = await confirm(`"${member.email}"에게 인증 메일을 재발송하시겠습니까?`);
        if (!ok) return;
        try {
            await memberApi.resendVerification(member.id);
            await alert('인증 메일이 재발송되었습니다.');
            fetchMembers();
        } catch (error) {
            await alert(error?.error || '인증 메일 재발송에 실패했습니다.');
        }
    };

    const handleEditSave = async () => {
        if (!editMember) return;
        try {
            await memberApi.update(editMember.id, {
                role: editMember.role,
                grade: editMember.grade,
                status: editMember.status,
            });
            await alert('수정되었습니다.');
            setEditMember(null);
            fetchMembers();
        } catch (error) {
            await alert(error?.error || '수정에 실패했습니다.');
        }
    };

    return (
        <div className="admin-page">
            <AdminPageHeader
                icon={Users}
                title="사용자 관리"
                count={members.length}
                subtitle="등록된 회원의 권한·등급·잠금 상태를 조회하고 수정합니다."
                actions={
                    <button className="admin-btn" onClick={fetchMembers} title="새로고침">
                        <RotateCcw size={14} />
                        새로고침
                    </button>
                }
            />

            <div className="admin-toolbar">
                <div className="admin-toolbar-left">
                    <div className="admin-search">
                        <Search size={16} className="admin-search-icon" />
                        <input
                            type="text"
                            className="admin-search-input"
                            placeholder="이메일, 도메인, 권한 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="admin-loading-state">
                    <div className="admin-spinner" />
                    <span>데이터를 불러오는 중...</span>
                </div>
            ) : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>이메일</th>
                                <th>권한</th>
                                <th>등급</th>
                                <th>상태</th>
                                <th>도메인</th>
                                <th className="admin-col-center">실패횟수</th>
                                <th>잠금일시</th>
                                <th>최근로그인</th>
                                <th>가입일</th>
                                <th className="admin-col-actions">액션</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.length > 0 ? (
                                filteredMembers.map((member) => {
                                    const isLocked = member.failedLoginAttempts >= 5;
                                    return (
                                        <tr key={member.id}>
                                            <td className="admin-col-id">{member.id}</td>
                                            <td className="admin-member-email">{member.email}</td>
                                            <td>
                                                <span className={ROLE_BADGE[member.role] || 'admin-badge admin-badge-neutral'}>
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={GRADE_BADGE[member.grade] || 'admin-badge admin-badge-neutral'}>
                                                    {member.grade}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={STATUS_BADGE[member.status] || 'admin-badge admin-badge-neutral'}>
                                                    {member.status}
                                                </span>
                                            </td>
                                            <td className="admin-member-domain" title={member.domain || ''}>
                                                {member.domain || '-'}
                                            </td>
                                            <td className={`admin-col-center ${isLocked ? 'admin-member-locked-count' : ''}`}>
                                                {member.failedLoginAttempts || 0}
                                            </td>
                                            <td className={`admin-col-date ${isLocked ? 'admin-member-locked-date' : ''}`}>
                                                {member.accountLockedAt ? formatDate(member.accountLockedAt) : '-'}
                                            </td>
                                            <td className="admin-col-date">
                                                {member.lastLoginAt ? formatDate(member.lastLoginAt) : '-'}
                                            </td>
                                            <td className="admin-col-date">{formatDate(member.createdAt)}</td>
                                            <td className="admin-col-actions">
                                                {member.status === 'VERIFYING_EMAIL' && (
                                                    <button
                                                        className="admin-btn admin-btn-icon admin-btn-info"
                                                        onClick={() => handleResendVerification(member)}
                                                        title="인증 메일 재발송"
                                                        data-action-spacing="true"
                                                    >
                                                        <Mail size={14} />
                                                    </button>
                                                )}
                                                {isLocked && (
                                                    <button
                                                        className="admin-btn admin-btn-icon admin-btn-warn"
                                                        onClick={() => handleUnlock(member)}
                                                        title="잠금 해제"
                                                        data-action-spacing="true"
                                                    >
                                                        <Unlock size={14} />
                                                    </button>
                                                )}
                                                <button
                                                    className="admin-btn admin-btn-icon"
                                                    onClick={() => setEditMember({ ...member })}
                                                    title="수정"
                                                    data-action-spacing="true"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    className="admin-btn admin-btn-icon admin-btn-danger-soft"
                                                    onClick={() => handleDelete(member)}
                                                    title="삭제"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="11">
                                        <div className="admin-empty-state admin-member-empty">
                                            <p className="admin-empty-state-title">검색 결과가 없습니다</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <BaseModal
                open={Boolean(editMember)}
                title="사용자 수정"
                onClose={() => setEditMember(null)}
                maxWidth="xs"
                contentClassName="admin-member-edit-content km-modal-form"
                actions={(
                    <>
                        <Button variant="outlined" onClick={() => setEditMember(null)}>
                            취소
                        </Button>
                        <Button variant="contained" onClick={handleEditSave}>
                            저장
                        </Button>
                    </>
                )}
            >
                {editMember ? (
                    <>
                        <div className="admin-modal-email-display">{editMember.email}</div>

                        <div className="admin-field">
                            <label className="admin-field-label">권한 (Role)</label>
                            <KmModalSelect
                                includeEmptyOption={false}
                                value={editMember.role}
                                onChange={(e) => setEditMember({ ...editMember, role: e.target.value })}
                                options={['USER', 'SYSOP', 'ADMIN']}
                            />
                        </div>

                        <div className="admin-field">
                            <label className="admin-field-label">등급 (Grade)</label>
                            <KmModalSelect
                                includeEmptyOption={false}
                                value={editMember.grade}
                                onChange={(e) => setEditMember({ ...editMember, grade: e.target.value })}
                                optionItems={[
                                    { value: 'FREE', label: 'FREE' },
                                    { value: 'PRO', label: 'PRO' },
                                    { value: 'MAX', label: 'MAX' },
                                    { value: 'SPECIAL', label: 'SPECIAL (무제한)' },
                                ]}
                            />
                        </div>

                        <div className="admin-field">
                            <label className="admin-field-label">상태 (Status)</label>
                            <KmModalSelect
                                includeEmptyOption={false}
                                value={editMember.status}
                                onChange={(e) => setEditMember({ ...editMember, status: e.target.value })}
                                options={[
                                    'ACTIVE',
                                    'VERIFYING_EMAIL',
                                    'WAITING_APPROVAL',
                                    'APPROVED_WAITING_PASSWORD',
                                ]}
                            />
                        </div>
                    </>
                ) : null}
            </BaseModal>
        </div>
    );
}

export default AdminMemberManagement;

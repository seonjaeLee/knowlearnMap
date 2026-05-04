import React, { useState, useEffect } from 'react';
import { memberApi } from '../../services/api';
import { useAlert } from '../../context/AlertContext';
import { Users, Search, RotateCcw, Pencil, Trash2, X, Unlock, Mail } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import './admin-common.css';

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
    const { showAlert, showConfirm } = useAlert();

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const data = await memberApi.getAll();
            setMembers(data || []);
        } catch (error) {
            console.error('Failed to fetch members:', error);
            showAlert('사용자 목록을 불러오는데 실패했습니다.');
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
        const ok = await showConfirm(`"${member.email}" 사용자를 삭제하시겠습니까?`);
        if (!ok) return;
        try {
            await memberApi.delete(member.id);
            showAlert('삭제되었습니다.');
            fetchMembers();
        } catch (error) {
            showAlert(error?.error || '삭제에 실패했습니다.');
        }
    };

    const handleUnlock = async (member) => {
        const ok = await showConfirm(`"${member.email}" 계정 잠금을 해제하시겠습니까?`);
        if (!ok) return;
        try {
            await memberApi.update(member.id, { failedLoginAttempts: '0' });
            showAlert('잠금이 해제되었습니다.');
            fetchMembers();
        } catch (error) {
            showAlert('잠금 해제에 실패했습니다.');
        }
    };

    const handleResendVerification = async (member) => {
        const ok = await showConfirm(`"${member.email}"에게 인증 메일을 재발송하시겠습니까?`);
        if (!ok) return;
        try {
            await memberApi.resendVerification(member.id);
            showAlert('인증 메일이 재발송되었습니다.');
            fetchMembers();
        } catch (error) {
            showAlert(error?.error || '인증 메일 재발송에 실패했습니다.');
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
            showAlert('수정되었습니다.');
            setEditMember(null);
            fetchMembers();
        } catch (error) {
            showAlert(error?.error || '수정에 실패했습니다.');
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
                                            <td style={{ fontWeight: 500 }}>{member.email}</td>
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
                                            <td
                                                style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                                title={member.domain || ''}
                                            >
                                                {member.domain || '-'}
                                            </td>
                                            <td className="admin-col-center" style={isLocked ? { color: 'var(--admin-color-danger-on-soft)', fontWeight: 700 } : undefined}>
                                                {member.failedLoginAttempts || 0}
                                            </td>
                                            <td className="admin-col-date" style={isLocked ? { color: 'var(--admin-color-danger-on-soft)' } : undefined}>
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
                                                        style={{ marginRight: 4 }}
                                                    >
                                                        <Mail size={14} />
                                                    </button>
                                                )}
                                                {isLocked && (
                                                    <button
                                                        className="admin-btn admin-btn-icon admin-btn-warn"
                                                        onClick={() => handleUnlock(member)}
                                                        title="잠금 해제"
                                                        style={{ marginRight: 4 }}
                                                    >
                                                        <Unlock size={14} />
                                                    </button>
                                                )}
                                                <button
                                                    className="admin-btn admin-btn-icon"
                                                    onClick={() => setEditMember({ ...member })}
                                                    title="수정"
                                                    style={{ marginRight: 4 }}
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
                                        <div className="admin-empty-state" style={{ border: 'none', padding: '32px 0' }}>
                                            <p className="admin-empty-state-title">검색 결과가 없습니다</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {editMember && (
                <div className="admin-modal-overlay" onClick={() => setEditMember(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">사용자 수정</h3>
                            <button className="admin-modal-close" onClick={() => setEditMember(null)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="admin-modal-email-display">{editMember.email}</div>

                            <div className="admin-field">
                                <label className="admin-field-label">권한 (Role)</label>
                                <select
                                    className="admin-select"
                                    value={editMember.role}
                                    onChange={(e) => setEditMember({ ...editMember, role: e.target.value })}
                                >
                                    <option value="USER">USER</option>
                                    <option value="SYSOP">SYSOP</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>

                            <div className="admin-field">
                                <label className="admin-field-label">등급 (Grade)</label>
                                <select
                                    className="admin-select"
                                    value={editMember.grade}
                                    onChange={(e) => setEditMember({ ...editMember, grade: e.target.value })}
                                >
                                    <option value="FREE">FREE</option>
                                    <option value="PRO">PRO</option>
                                    <option value="MAX">MAX</option>
                                    <option value="SPECIAL">SPECIAL (무제한)</option>
                                </select>
                            </div>

                            <div className="admin-field">
                                <label className="admin-field-label">상태 (Status)</label>
                                <select
                                    className="admin-select"
                                    value={editMember.status}
                                    onChange={(e) => setEditMember({ ...editMember, status: e.target.value })}
                                >
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="VERIFYING_EMAIL">VERIFYING_EMAIL</option>
                                    <option value="WAITING_APPROVAL">WAITING_APPROVAL</option>
                                    <option value="APPROVED_WAITING_PASSWORD">APPROVED_WAITING_PASSWORD</option>
                                </select>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-btn" onClick={() => setEditMember(null)}>취소</button>
                            <button className="admin-btn admin-btn-primary" onClick={handleEditSave}>저장</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminMemberManagement;

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@mui/material';
import { memberApi } from '../../services/api';
import { useDialog } from '../../hooks/useDialog';
import { Users, Search, RotateCcw, FilePen, Trash2, Lock, Mail } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminTableFooter from '../../components/admin/AdminTableFooter';
import BaseModal from '../../components/common/modal/BaseModal';
import KmModalSelect from '../../components/common/modal/KmModalSelect';
import { mockAdminMembers } from '../../data/memberMockData';
import './admin-common.css';
import './AdminMemberManagement.css';

const isMemberMockEnabled = import.meta.env.VITE_ENABLE_MEMBER_MOCK === 'true';

/** 목록 성격에 따라 true: 좌측 체크박스 열·행 선택 상태 사용(벌크 작업 등) */
const SHOW_ROW_CHECKBOX_COLUMN = false;

const PAGE_SIZE = 15;

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
    const [page, setPage] = useState(0);
    const [selectedIds, setSelectedIds] = useState(() => new Set());
    /** API 실패 시 더미로 채우거나 `VITE_ENABLE_MEMBER_MOCK` 인 경우 — 삭제·잠금해제 등은 로컬 state만 반영 */
    const [adminListSource, setAdminListSource] = useState('live');
    const { alert, confirm } = useDialog();

    const fetchMembers = async () => {
        try {
            setLoading(true);
            if (isMemberMockEnabled) {
                setMembers(mockAdminMembers);
                setAdminListSource('mock');
                return;
            }
            const data = await memberApi.getAll();
            setMembers(data || []);
            setAdminListSource('live');
        } catch (error) {
            console.error('Failed to fetch members:', error);
            setMembers(mockAdminMembers);
            setAdminListSource('mock');
            await alert('사용자 목록을 불러오지 못해 더미 데이터를 표시합니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const filteredMembers = useMemo(() => {
        const q = searchTerm.toLowerCase();
        return members.filter((member) => (
            (member.email && member.email.toLowerCase().includes(q)) ||
            (member.domain && member.domain.toLowerCase().includes(q)) ||
            (member.role && member.role.toLowerCase().includes(q))
        ));
    }, [members, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));

    const paginatedMembers = useMemo(() => {
        const start = page * PAGE_SIZE;
        return filteredMembers.slice(start, start + PAGE_SIZE);
    }, [filteredMembers, page]);

    const searchTermRef = useRef(searchTerm);

    useEffect(() => {
        const max = Math.max(0, totalPages - 1);
        if (searchTermRef.current !== searchTerm) {
            searchTermRef.current = searchTerm;
            setPage(0);
        } else {
            setPage((p) => Math.min(p, max));
        }
    }, [searchTerm, totalPages]);

    const colCount = 11 + (SHOW_ROW_CHECKBOX_COLUMN ? 1 : 0);

    const allOnPageSelected = SHOW_ROW_CHECKBOX_COLUMN && paginatedMembers.length > 0
        && paginatedMembers.every((m) => selectedIds.has(m.id));

    const toggleSelectAllOnPage = () => {
        const ids = paginatedMembers.map((m) => m.id);
        setSelectedIds((prev) => {
            const next = new Set(prev);
            const every = ids.every((id) => next.has(id));
            if (every) ids.forEach((id) => next.delete(id));
            else ids.forEach((id) => next.add(id));
            return next;
        });
    };

    const toggleMemberRowSelected = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const rangeStart = filteredMembers.length === 0 ? 0 : page * PAGE_SIZE + 1;
    const rangeEnd = filteredMembers.length === 0 ? 0 : Math.min((page + 1) * PAGE_SIZE, filteredMembers.length);

    const pageButtonIndices = useMemo(() => {
        const total = totalPages;
        const current = page;
        if (total <= 7) return [...Array(total)].map((_, i) => i);
        const set = new Set([0, total - 1]);
        for (let i = current - 2; i <= current + 2; i += 1) {
            if (i >= 0 && i < total) set.add(i);
        }
        return [...set].sort((a, b) => a - b);
    }, [totalPages, page]);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const deleteUsesLocalState = isMemberMockEnabled || adminListSource === 'mock';

    const handleDelete = async (member) => {
        const ok = await confirm(`"${member.email}" 사용자를 삭제하시겠습니까?`);
        if (!ok) return;
        if (deleteUsesLocalState) {
            setMembers((prev) => prev.filter((m) => m.id !== member.id));
            await alert('삭제되었습니다.');
            return;
        }
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
        if (deleteUsesLocalState) {
            setMembers((prev) => prev.map((m) => (
                m.id === member.id
                    ? { ...m, failedLoginAttempts: 0, accountLockedAt: null }
                    : m
            )));
            await alert('잠금이 해제되었습니다.');
            return;
        }
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
        if (deleteUsesLocalState) {
            setMembers((prev) => prev.map((m) => (
                m.id === member.id && m.status === 'VERIFYING_EMAIL'
                    ? { ...m, status: 'ACTIVE' }
                    : m
            )));
            await alert('인증 메일이 재발송되었습니다.');
            return;
        }
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
        if (deleteUsesLocalState) {
            setMembers((prev) => prev.map((m) => (
                m.id === editMember.id
                    ? {
                        ...m,
                        role: editMember.role,
                        grade: editMember.grade,
                        status: editMember.status,
                    }
                    : m
            )));
            await alert('수정되었습니다.');
            setEditMember(null);
            return;
        }
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
            <div className="km-main-sticky-head">
            <AdminPageHeader
                icon={Users}
                title="사용자 관리"
                count={filteredMembers.length}
                actions={(
                    <button
                        type="button"
                        className="admin-btn admin-btn-icon"
                        onClick={fetchMembers}
                        title="새로고침"
                        aria-label="사용자 목록 새로고침"
                    >
                        <RotateCcw size={16} aria-hidden />
                    </button>
                )}
            />

            <div className="admin-toolbar">
                <div className="admin-toolbar-left">
                    <div className="admin-search">
                        <Search size={18} className="admin-search-icon" aria-hidden />
                        <input
                            type="text"
                            className="admin-search-input"
                            placeholder="이메일, 도메인, 권한 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="사용자 검색"
                        />
                    </div>
                </div>
            </div>
            </div>

            {loading ? (
                <div className="member-mgmt-loading">
                    데이터를 불러오는 중...
                </div>
            ) : (
                <div className="admin-table-card member-mgmt-table-card">
                    <div className="admin-table-wrap">
                        <table className="admin-table member-mgmt-table">
                            <thead>
                                <tr>
                                    {SHOW_ROW_CHECKBOX_COLUMN && (
                                        <th className="admin-th-select" scope="col">
                                            <input
                                                type="checkbox"
                                                checked={allOnPageSelected}
                                                onChange={toggleSelectAllOnPage}
                                                aria-label="이 페이지 모두 선택"
                                            />
                                        </th>
                                    )}
                                    <th scope="col" className="member-mgmt-th-id">ID</th>
                                    <th scope="col" className="member-mgmt-th-email">이메일</th>
                                    <th scope="col" className="member-mgmt-th-role">권한</th>
                                    <th scope="col" className="member-mgmt-th-grade">등급</th>
                                    <th scope="col" className="member-mgmt-th-status">상태</th>
                                    <th scope="col" className="member-mgmt-th-domain">도메인</th>
                                    <th scope="col" className="member-mgmt-th-failed admin-col-center">실패</th>
                                    <th scope="col" className="member-mgmt-th-locked">잠금일시</th>
                                    <th scope="col" className="member-mgmt-th-last">최근로그인</th>
                                    <th scope="col" className="member-mgmt-th-created">가입일</th>
                                    <th scope="col" className="member-mgmt-th-actions admin-col-actions">
                                        <span className="member-mgmt-actions-head">관리</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMembers.length > 0 ? (
                                    paginatedMembers.map((member) => {
                                        const isLocked = member.failedLoginAttempts >= 5;
                                        return (
                                            <tr key={member.id}>
                                                {SHOW_ROW_CHECKBOX_COLUMN && (
                                                    <td className="admin-td-select">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.has(member.id)}
                                                            onChange={() => toggleMemberRowSelected(member.id)}
                                                            aria-label={`${member.email} 선택`}
                                                        />
                                                    </td>
                                                )}
                                                <td className="member-mgmt-td-id admin-col-id">{member.id}</td>
                                                <td className="member-mgmt-td-email admin-member-email">{member.email}</td>
                                                <td className="member-mgmt-td-role">
                                                    <span className={ROLE_BADGE[member.role] || 'admin-badge admin-badge-neutral'}>
                                                        {member.role}
                                                    </span>
                                                </td>
                                                <td className="member-mgmt-td-grade">
                                                    <span className={GRADE_BADGE[member.grade] || 'admin-badge admin-badge-neutral'}>
                                                        {member.grade}
                                                    </span>
                                                </td>
                                                <td className="member-mgmt-td-status _ellipsis">
                                                    <span
                                                        className={STATUS_BADGE[member.status] || 'admin-badge admin-badge-neutral'}
                                                        title={member.status}
                                                    >
                                                        {member.status}
                                                    </span>
                                                </td>
                                                <td className="member-mgmt-td-domain admin-member-domain" title={member.domain || ''}>
                                                    {member.domain || '-'}
                                                </td>
                                                <td className={`member-mgmt-td-failed admin-col-center ${isLocked ? 'admin-member-locked-count' : ''}`}>
                                                    {member.failedLoginAttempts || 0}
                                                </td>
                                                <td className={`member-mgmt-td-locked admin-col-date ${isLocked ? 'admin-member-locked-date' : ''}`}>
                                                    {member.accountLockedAt ? formatDate(member.accountLockedAt) : '-'}
                                                </td>
                                                <td className="member-mgmt-td-last admin-col-date">
                                                    {member.lastLoginAt ? formatDate(member.lastLoginAt) : '-'}
                                                </td>
                                                <td className="member-mgmt-td-created admin-col-date">{formatDate(member.createdAt)}</td>
                                                <td className="member-mgmt-td-actions admin-col-actions">
                                                    <div className="member-mgmt-actions">
                                                        {member.status === 'VERIFYING_EMAIL' && (
                                                            <button
                                                                type="button"
                                                                className="km-table-icon-btn km-table-icon-btn--neutral"
                                                                onClick={() => handleResendVerification(member)}
                                                                title="인증 메일 재발송"
                                                                aria-label={`${member.email} 인증 메일 재발송`}
                                                            >
                                                                <Mail strokeWidth={1.75} aria-hidden />
                                                            </button>
                                                        )}
                                                        {isLocked && (
                                                            <button
                                                                type="button"
                                                                className="km-table-icon-btn km-table-icon-btn--neutral"
                                                                onClick={() => handleUnlock(member)}
                                                                title="잠금 해제"
                                                                aria-label={`${member.email} 잠금 해제`}
                                                            >
                                                                <Lock strokeWidth={1.75} aria-hidden />
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            className="km-table-icon-btn km-table-icon-btn--neutral"
                                                            onClick={() => setEditMember({ ...member })}
                                                            title="수정"
                                                            aria-label={`${member.email} 수정`}
                                                        >
                                                            <FilePen strokeWidth={1.75} aria-hidden />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="km-table-icon-btn km-table-icon-btn--danger"
                                                            onClick={() => handleDelete(member)}
                                                            title="삭제"
                                                            aria-label={`${member.email} 삭제`}
                                                        >
                                                            <Trash2 strokeWidth={1.75} aria-hidden />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr className="member-mgmt-tr-empty">
                                        <td colSpan={colCount} className="member-mgmt-empty">
                                            {members.length === 0
                                                ? '등록된 사용자가 없습니다.'
                                                : '검색 결과가 없습니다.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <AdminTableFooter
                        start={(
                            <span className="admin-table-footer-summary">
                                {filteredMembers.length === 0
                                    ? '표시할 사용자가 없습니다'
                                    : `전체 ${filteredMembers.length}명 중 ${rangeStart}–${rangeEnd}명 표시`}
                            </span>
                        )}
                        center={(
                            <nav className="admin-table-pagination" aria-label="페이지 이동">
                                <button
                                    type="button"
                                    className="admin-table-page-btn"
                                    disabled={page === 0}
                                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                                >
                                    이전
                                </button>
                                {pageButtonIndices.map((idx, arrayIndex) => (
                                    <React.Fragment key={idx}>
                                        {arrayIndex > 0 && pageButtonIndices[arrayIndex - 1] < idx - 1 && (
                                            <span className="admin-table-page-ellipsis" aria-hidden>…</span>
                                        )}
                                        <button
                                            type="button"
                                            className={`admin-table-page-btn${page === idx ? ' is-active' : ''}`}
                                            onClick={() => setPage(idx)}
                                        >
                                            {idx + 1}
                                        </button>
                                    </React.Fragment>
                                ))}
                                <button
                                    type="button"
                                    className="admin-table-page-btn"
                                    disabled={page >= totalPages - 1}
                                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                >
                                    다음
                                </button>
                            </nav>
                        )}
                    />
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

import React, {
    useState, useEffect, useMemo, useRef, useCallback,
} from 'react';
import { Button } from '@mui/material';
import { memberApi } from '../../services/api';
import { useDialog } from '../../hooks/useDialog';
import { useBasicTableColumnResize } from '../../hooks/useBasicTableColumnResize';
import { Users, Search, RotateCcw, FilePen, Trash2, Lock, Mail } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import BasicTable, { BasicTableFooter, BasicTablePaginationNav } from '../../components/common/BasicTable';
import BaseModal from '../../components/common/modal/BaseModal';
import KmModalSelect from '../../components/common/modal/KmModalSelect';
import { mockAdminMembers } from '../../data/memberMockData';
import './AdminMemberManagement.css';

const isMemberMockEnabled = import.meta.env.VITE_ENABLE_MEMBER_MOCK === 'true';

/** 목록 성격에 따라 true: 좌측 체크박스 열·행 선택 상태 사용(벌크 작업 등) */
const SHOW_ROW_CHECKBOX_COLUMN = false;

const PAGE_SIZE = 15;

/** `false`: `BasicTableFooter` 전체를 렌더하지 않음(요약·페이지네이션 DOM 모두 없음). `true`일 때는 기존처럼 좌측 요약 + 가운데 페이지네이션. 요약은 추후 상단으로 옮길 예정이어도 소스는 여기 유지. */
const SHOW_MEMBER_TABLE_FOOTER = false;

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

    const memberTableColumnDefinitions = useMemo(() => {
        const cols = [];
        if (SHOW_ROW_CHECKBOX_COLUMN) {
            cols.push({
                id: '_select',
                label: '선택',
                defaultWidthPx: 44,
                minWidthPx: 44,
                align: 'center',
                ellipsis: false,
            });
        }
        cols.push(
            { id: 'id', label: 'ID', defaultWidthPx: 64, minWidthPx: 56, align: 'left' },
            { id: 'email', label: '이메일', defaultWidthPx: 220, minWidthPx: 180, align: 'left' },
            { id: 'role', label: '권한', defaultWidthPx: 88, minWidthPx: 80, align: 'left' },
            { id: 'grade', label: '등급', defaultWidthPx: 88, minWidthPx: 80, align: 'left' },
            { id: 'status', label: '상태', defaultWidthPx: 140, minWidthPx: 120, align: 'left' },
            { id: 'domain', label: '도메인', defaultWidthPx: 120, minWidthPx: 96, align: 'left' },
            { id: 'failed', label: '실패', defaultWidthPx: 52, minWidthPx: 48, align: 'left' },
            { id: 'locked', label: '잠금일시', defaultWidthPx: 144, minWidthPx: 120, align: 'left' },
            { id: 'lastLogin', label: '최근로그인', defaultWidthPx: 150, minWidthPx: 104, align: 'left' },
            { id: 'created', label: '가입일', defaultWidthPx: 150, minWidthPx: 104, align: 'left' },
            {
                id: 'actions',
                label: <span className="member-mgmt-actions-head">관리</span>,
                defaultWidthPx: 140,
                minWidthPx: 140,
                align: 'right',
                ellipsis: false,
            },
        );
        return cols;
    }, []);

    const { columns: memberTableColumns, startResize: memberColumnStartResize } = useBasicTableColumnResize({
        definitions: memberTableColumnDefinitions,
        storageKey: 'km-admin-member-mgmt-columns-v1',
        enabled: true,
    });

    const fetchMembers = useCallback(async () => {
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
    }, [alert]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

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

    const tableMemberRows = SHOW_MEMBER_TABLE_FOOTER ? paginatedMembers : filteredMembers;

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

    const allOnPageSelected = SHOW_ROW_CHECKBOX_COLUMN && tableMemberRows.length > 0
        && tableMemberRows.every((m) => selectedIds.has(m.id));

    const toggleSelectAllOnPage = useCallback(() => {
        const ids = tableMemberRows.map((m) => m.id);
        setSelectedIds((prev) => {
            const next = new Set(prev);
            const every = ids.every((id) => next.has(id));
            if (every) ids.forEach((id) => next.delete(id));
            else ids.forEach((id) => next.add(id));
            return next;
        });
    }, [tableMemberRows]);

    const toggleMemberRowSelected = useCallback((id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const rangeStart = filteredMembers.length === 0 ? 0 : page * PAGE_SIZE + 1;
    const rangeEnd = filteredMembers.length === 0 ? 0 : Math.min((page + 1) * PAGE_SIZE, filteredMembers.length);

    const formatDate = useCallback((dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
        });
    }, []);

    const deleteUsesLocalState = isMemberMockEnabled || adminListSource === 'mock';

    const handleDelete = useCallback(async (member) => {
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
    }, [alert, confirm, deleteUsesLocalState, fetchMembers]);

    const handleUnlock = useCallback(async (member) => {
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
    }, [alert, confirm, deleteUsesLocalState, fetchMembers]);

    const handleResendVerification = useCallback(async (member) => {
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
    }, [alert, confirm, deleteUsesLocalState, fetchMembers]);

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

    const renderMemberCell = useCallback(({ column, row: member }) => {
        const isLocked = member.failedLoginAttempts >= 5;
        switch (column.id) {
            case '_select':
                return (
                    <input
                        type="checkbox"
                        checked={selectedIds.has(member.id)}
                        onChange={() => toggleMemberRowSelected(member.id)}
                        aria-label={`${member.email} 선택`}
                    />
                );
            case 'id':
                return <span className="member-mgmt-col-id">{member.id}</span>;
            case 'email':
                return <span className="admin-member-email">{member.email}</span>;
            case 'role':
                return (
                    <span className={ROLE_BADGE[member.role] || 'admin-badge admin-badge-neutral'}>
                        {member.role}
                    </span>
                );
            case 'grade':
                return (
                    <span className={GRADE_BADGE[member.grade] || 'admin-badge admin-badge-neutral'}>
                        {member.grade}
                    </span>
                );
            case 'status':
                return (
                    <div className="member-mgmt-status-cell">
                        <span
                            className={STATUS_BADGE[member.status] || 'admin-badge admin-badge-neutral'}
                            title={member.status}
                        >
                            {member.status}
                        </span>
                    </div>
                );
            case 'domain':
                return (
                    <span className="admin-member-domain" title={member.domain || ''}>
                        {member.domain || '-'}
                    </span>
                );
            case 'failed':
                return (
                    <span className={isLocked ? 'admin-member-locked-count' : undefined}>
                        {member.failedLoginAttempts || 0}
                    </span>
                );
            case 'locked':
                return (
                    <span className={`member-mgmt-col-date ${isLocked ? 'admin-member-locked-date' : ''}`}>
                        {member.accountLockedAt ? formatDate(member.accountLockedAt) : '-'}
                    </span>
                );
            case 'lastLogin':
                return (
                    <span className="member-mgmt-col-date">
                        {member.lastLoginAt ? formatDate(member.lastLoginAt) : '-'}
                    </span>
                );
            case 'created':
                return <span className="member-mgmt-col-date">{formatDate(member.createdAt)}</span>;
            case 'actions':
                return (
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
                );
            default:
                return undefined;
        }
    }, [
        selectedIds,
        formatDate,
        handleDelete,
        handleUnlock,
        handleResendVerification,
        toggleMemberRowSelected,
    ]);

    const headerColumns = useMemo(() => {
        if (!SHOW_ROW_CHECKBOX_COLUMN) return memberTableColumns;
        return memberTableColumns.map((col) => {
            if (col.id !== '_select') return col;
            return {
                ...col,
                label: (
                    <input
                        type="checkbox"
                        checked={allOnPageSelected}
                        onChange={toggleSelectAllOnPage}
                        aria-label="이 페이지 모두 선택"
                    />
                ),
            };
        });
    }, [memberTableColumns, allOnPageSelected, toggleSelectAllOnPage]);

    return (
        <div className="member-mgmt-page">
            <div className="km-main-sticky-head">
                <AdminPageHeader
                    icon={Users}
                    title="사용자 관리"
                    count={filteredMembers.length}
                    actions={(
                        <button
                            type="button"
                            className="member-mgmt-btn member-mgmt-btn--icon"
                            onClick={fetchMembers}
                            title="새로고침"
                            aria-label="사용자 목록 새로고침"
                        >
                            <RotateCcw size={16} aria-hidden />
                        </button>
                    )}
                />

                <div className="member-mgmt-toolbar">
                    <div className="member-mgmt-toolbar-left">
                        <div className="member-mgmt-search">
                            <Search size={18} className="member-mgmt-search-icon" aria-hidden />
                            <input
                                type="text"
                                className="member-mgmt-search-input"
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
                <div className="member-mgmt-table-card">
                    <div className="member-mgmt-table-shell basic-table-shell">
                        {filteredMembers.length === 0 ? (
                            <div className="member-mgmt-empty member-mgmt-empty--solo" role="status">
                                {members.length === 0
                                    ? '등록된 사용자가 없습니다.'
                                    : '검색 결과가 없습니다.'}
                            </div>
                        ) : (
                            <BasicTable
                                className="member-mgmt-basic-table"
                                columns={headerColumns}
                                data={tableMemberRows}
                                renderCell={renderMemberCell}
                                onColumnResizeMouseDown={memberColumnStartResize}
                            />
                        )}
                    </div>
                    {SHOW_MEMBER_TABLE_FOOTER ? (
                        <BasicTableFooter
                            start={(
                                <span className="basic-table-footer-summary">
                                    {filteredMembers.length === 0
                                        ? '표시할 사용자가 없습니다'
                                        : `전체 ${filteredMembers.length}명 중 ${rangeStart}–${rangeEnd}명 표시`}
                                </span>
                            )}
                            center={(
                                <BasicTablePaginationNav
                                    page={page}
                                    totalPages={totalPages}
                                    onPageChange={setPage}
                                />
                            )}
                        />
                    ) : null}
                </div>
            )}

            <BaseModal
                open={Boolean(editMember)}
                title="사용자 수정"
                onClose={() => setEditMember(null)}
                maxWidth="xs"
                contentClassName="member-mgmt-member-edit-content km-modal-form"
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
                        <div className="member-mgmt-modal-email-display">{editMember.email}</div>

                        <div className="member-mgmt-modal-field">
                            <span className="member-mgmt-modal-field-label">권한 (Role)</span>
                            <KmModalSelect
                                includeEmptyOption={false}
                                value={editMember.role}
                                onChange={(e) => setEditMember({ ...editMember, role: e.target.value })}
                                options={['USER', 'SYSOP', 'ADMIN']}
                            />
                        </div>

                        <div className="member-mgmt-modal-field">
                            <span className="member-mgmt-modal-field-label">등급 (Grade)</span>
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

                        <div className="member-mgmt-modal-field">
                            <span className="member-mgmt-modal-field-label">상태 (Status)</span>
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

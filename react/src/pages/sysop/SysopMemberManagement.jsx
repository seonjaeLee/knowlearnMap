import React, {
    useState, useEffect, useMemo, useRef, useCallback,
} from 'react';
import { memberApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useDialog } from '../../hooks/useDialog';
import { useBasicTableColumnResize } from '../../hooks/useBasicTableColumnResize';
import { Search, RotateCcw, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import BasicTable, { BasicTableFooter, BasicTablePaginationNav } from '../../components/common/BasicTable';
import {
    basicTableActionsColumnDef,
    basicTableActionsColumnMinWidthPx,
} from '../../components/common/table/basicTableActionsColumn';
import KlTableRowActions from '../../components/common/table/KlTableRowActions';
import KlIconButton from '../../components/common/KlIconButton';
import { listTableEmptyState } from '../../config/supportMock';
import { formatKlDateTimeCell } from '../../utils/formatKlDate';
import { isTableCellBlank } from '../../components/common/tableCellDisplay';
import BaseModal from '../../components/common/modal/BaseModal';
import { klFormModalPaperSx } from '../../components/common/modal/klModalPaper';
import {
    KL_MODAL_FORM_CONTROL_ROW_CLASS,
    KL_MODAL_FORM_ELEMENT_ID,
    KL_MODAL_FORM_FEEDBACK_CLASS,
    KL_MODAL_FORM_FEEDBACK_ERROR_CLASS,
    KL_MODAL_FORM_FEEDBACK_SUCCESS_CLASS,
    KL_MODAL_FORM_STACK_CLASS,
    klModalFormContentClassName,
} from '../../components/common/modal/klModalForm';
import { mockAdminMembers } from '../../data/memberMockData';
import {
    MemberTableGrade,
    MemberTableRole,
    MemberTableStatus,
} from '../../components/common/MemberTableCells';
import '../admin/admin-common.css';
import '../admin/AdminMemberManagement.css';
import '../../components/admin/DomainManagement.css';

const isMemberMockEnabled = import.meta.env.VITE_ENABLE_MEMBER_MOCK === 'true';

const SHOW_ROW_CHECKBOX_COLUMN = false;
const PAGE_SIZE = 15;
const SHOW_MEMBER_TABLE_FOOTER = false;

/**
 * SYSOP 전용 사용자 관리 페이지.
 * AdminMemberManagement 와 같은 UI 패턴이지만 다음이 다름:
 *  - 권한 옵션: USER / VIEWER 만 (SYSOP/ADMIN 불가)
 *  - 도메인: SYSOP 본인 도메인으로 자동 고정 (Select 제거, readonly 표시)
 *  - 도메인 fetch 없음 (domainApi.getAll 호출 안 함)
 *  - 멤버 목록은 SYSOP 본인 도메인 멤버만 표시 (백엔드가 필터링하지 않을 경우 프론트에서 필터)
 */
function SysopMemberManagement() {
    const { user } = useAuth();
    const sysopDomain = user?.domain || '';

    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editMember, setEditMember] = useState(null);
    const [createMember, setCreateMember] = useState(null);
    const [createSubmitting, setCreateSubmitting] = useState(false);
    const [loginIdCheckMessage, setLoginIdCheckMessage] = useState('');
    const [isLoginIdAvailable, setIsLoginIdAvailable] = useState(false);
    const [isLoginIdChecking, setIsLoginIdChecking] = useState(false);
    const [page, setPage] = useState(0);
    const [selectedIds, setSelectedIds] = useState(() => new Set());
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
            { id: 'status', label: '상태', defaultWidthPx: 170, minWidthPx: 150, align: 'left' },
            { id: 'domain', label: '도메인', defaultWidthPx: 120, minWidthPx: 96, align: 'left' },
            { id: 'failed', label: '실패', defaultWidthPx: 52, minWidthPx: 48, align: 'left' },
            { id: 'locked', label: '잠금일시', defaultWidthPx: 144, minWidthPx: 120, align: 'left' },
            { id: 'lastLogin', label: '최근로그인', defaultWidthPx: 160, minWidthPx: 110, align: 'left' },
            { id: 'created', label: '가입일', defaultWidthPx: 150, minWidthPx: 104, align: 'left' },
            basicTableActionsColumnDef({
                id: 'actions',
                buttonCount: 4,
                defaultWidthPx: basicTableActionsColumnMinWidthPx(4),
            }),
        );
        return cols;
    }, []);

    const { columns: memberTableColumns, startResize: memberColumnStartResize } = useBasicTableColumnResize({
        definitions: memberTableColumnDefinitions,
        storageKey: 'km-sysop-member-mgmt-columns-v2',
        enabled: true,
    });

    const fetchMembers = useCallback(async () => {
        try {
            setLoading(true);
            if (isMemberMockEnabled) {
                // 목업 데이터에서 SYSOP 본인 도메인 멤버만
                const filtered = sysopDomain
                    ? mockAdminMembers.filter((m) => m.domain === sysopDomain)
                    : mockAdminMembers;
                setMembers(filtered);
                setAdminListSource('mock');
                return;
            }
            const data = await memberApi.getAll();
            // 백엔드가 전체를 반환하더라도 프론트에서 SYSOP 본인 도메인만 필터링
            const list = Array.isArray(data) ? data : [];
            const filtered = sysopDomain
                ? list.filter((m) => m.domain === sysopDomain)
                : list;
            setMembers(filtered);
            setAdminListSource('live');
        } catch (error) {
            console.error('Failed to fetch members:', error);
            const fallback = sysopDomain
                ? mockAdminMembers.filter((m) => m.domain === sysopDomain)
                : mockAdminMembers;
            setMembers(fallback);
            setAdminListSource('mock');
            await alert('사용자 목록을 불러오지 못해 더미 데이터를 표시합니다.');
        } finally {
            setLoading(false);
        }
    }, [alert, sysopDomain]);

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

    const formatDate = useCallback((dateString) => formatKlDateTimeCell(dateString), []);

    const deleteUsesLocalState = isMemberMockEnabled || adminListSource === 'mock';

    /**
     * SYSOP 사용자 추가 모달 "등록" 버튼 활성화 조건:
     * 1) 로그인 ID 중복확인 'available'
     * 2) 비밀번호 + 확인 일치 (둘 다 입력)
     * 도메인은 자동 상속이라 별도 검증 불필요.
     */
    const canSubmit = useMemo(() => {
        if (!createMember) return false;
        if (!isLoginIdAvailable) return false;
        if (!createMember.password) return false;
        if (createMember.password !== createMember.passwordConfirm) return false;
        return true;
    }, [createMember, isLoginIdAvailable]);

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

    const resetLoginIdCheck = useCallback(() => {
        setIsLoginIdAvailable(false);
        setLoginIdCheckMessage('');
    }, []);

    const handleCheckLoginId = async () => {
        const trimmed = (createMember?.loginId || '').trim();
        if (trimmed.length < 3) {
            setLoginIdCheckMessage('3자 이상 입력하세요.');
            setIsLoginIdAvailable(false);
            return;
        }
        if (trimmed.toLowerCase() === 'admin') {
            setLoginIdCheckMessage('"admin"은 사용할 수 없습니다.');
            setIsLoginIdAvailable(false);
            return;
        }
        if (!/^[A-Za-z0-9._%+\-@]+$/.test(trimmed)) {
            setLoginIdCheckMessage('영문/숫자/._%+-@ 만 사용할 수 있습니다.');
            setIsLoginIdAvailable(false);
            return;
        }
        if (deleteUsesLocalState) {
            const exists = members.some(
                (m) => String(m.email || '').toLowerCase() === trimmed.toLowerCase(),
            );
            if (exists) {
                setLoginIdCheckMessage('이미 사용 중인 ID입니다.');
                setIsLoginIdAvailable(false);
            } else {
                setLoginIdCheckMessage('사용 가능한 ID입니다.');
                setIsLoginIdAvailable(true);
            }
            return;
        }
        try {
            setIsLoginIdChecking(true);
            const res = await memberApi.checkLoginId(trimmed);
            if (res?.available) {
                setLoginIdCheckMessage('사용 가능한 ID입니다.');
                setIsLoginIdAvailable(true);
            } else {
                setLoginIdCheckMessage('이미 사용 중인 ID입니다.');
                setIsLoginIdAvailable(false);
            }
        } catch (error) {
            setLoginIdCheckMessage(error?.message || '중복 확인에 실패했습니다.');
            setIsLoginIdAvailable(false);
        } finally {
            setIsLoginIdChecking(false);
        }
    };

    const handleCreateSubmit = async () => {
        if (!createMember) return;
        const trimmedId = (createMember.loginId || '').trim();
        if (trimmedId.length < 3) {
            await alert('로그인 ID는 3자 이상이어야 합니다.');
            return;
        }
        if (trimmedId.toLowerCase() === 'admin') {
            await alert('"admin"은 사용할 수 없습니다.');
            return;
        }
        if (!/^[A-Za-z0-9._%+\-@]+$/.test(trimmedId)) {
            await alert('로그인 ID는 영문/숫자/._%+-@ 만 사용할 수 있습니다.');
            return;
        }
        if (!isLoginIdAvailable) {
            await alert('로그인 ID 중복 확인을 해주세요.');
            return;
        }
        if (!createMember.password) {
            await alert('비밀번호를 입력하세요.');
            return;
        }
        if (createMember.password !== createMember.passwordConfirm) {
            await alert('비밀번호가 일치하지 않습니다.');
            return;
        }
        if (createMember.role !== 'USER' && createMember.role !== 'VIEWER') {
            await alert('SYSOP는 USER 또는 VIEWER 권한만 생성할 수 있습니다.');
            return;
        }
        if (!sysopDomain) {
            await alert('SYSOP 도메인 정보를 확인할 수 없습니다. 다시 로그인해주세요.');
            return;
        }

        if (deleteUsesLocalState) {
            const newMember = {
                id: Date.now(),
                email: trimmedId,
                role: createMember.role,
                grade: createMember.grade,
                status: 'ACTIVE',
                domain: sysopDomain,
                failedLoginAttempts: 0,
                accountLockedAt: null,
                lastLoginAt: null,
                createdAt: new Date().toISOString(),
            };
            setMembers((prev) => [...prev, newMember]);
            await alert('사용자가 등록되었습니다. (로컬)');
            setCreateMember(null);
            return;
        }

        try {
            setCreateSubmitting(true);
            await memberApi.create({
                loginId: trimmedId,
                password: createMember.password,
                role: createMember.role,
                grade: createMember.grade,
                // 도메인은 SYSOP 본인 도메인 강제 (백엔드가 무시하더라도 일관성 유지)
                domainName: sysopDomain,
            });
            await alert('사용자가 등록되었습니다.');
            setCreateMember(null);
            fetchMembers();
        } catch (error) {
            await alert(error?.message || '등록에 실패했습니다.');
        } finally {
            setCreateSubmitting(false);
        }
    };

    const handleEditSave = async () => {
        if (!editMember) return;
        // SYSOP 는 권한을 USER/VIEWER 로만 변경 가능
        if (editMember.role !== 'USER' && editMember.role !== 'VIEWER') {
            await alert('SYSOP는 USER 또는 VIEWER 권한으로만 변경할 수 있습니다.');
            return;
        }
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
                return <MemberTableRole role={member.role} />;
            case 'grade':
                return <MemberTableGrade grade={member.grade} />;
            case 'status':
                return <MemberTableStatus status={member.status} />;
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
            case 'lastLogin': {
                const lastLoginAt = member.lastLoginAt;
                return (
                    <span
                        className={isTableCellBlank(lastLoginAt) ? 'kl-table-cell-blank' : 'member-mgmt-col-date'}
                    >
                        {formatDate(lastLoginAt)}
                    </span>
                );
            }
            case 'created':
                return (
                    <span
                        className={isTableCellBlank(member.createdAt) ? 'kl-table-cell-blank' : 'member-mgmt-col-date'}
                    >
                        {formatDate(member.createdAt)}
                    </span>
                );
            case 'actions': {
                // SYSOP 는 자기 도메인 + USER/VIEWER 만 관리. 상위(SYSOP/ADMIN)는 액션 숨김 (실수 방지).
                const isManageable = (
                    (member.role === 'USER' || member.role === 'VIEWER')
                    && (!sysopDomain || member.domain === sysopDomain)
                );
                if (!isManageable) {
                    return <span className="kl-table-cell-blank">-</span>;
                }
                return (
                    <KlTableRowActions
                        actions={[
                            member.status === 'VERIFYING_EMAIL' && {
                                kind: 'mailResend',
                                onClick: () => handleResendVerification(member),
                                ariaLabel: `${member.email} 인증 메일 재발송`,
                            },
                            isLocked && {
                                kind: 'unlock',
                                onClick: () => handleUnlock(member),
                                ariaLabel: `${member.email} 잠금 해제`,
                            },
                            {
                                kind: 'edit',
                                onClick: () => setEditMember({ ...member }),
                                ariaLabel: `${member.email} 수정`,
                            },
                            {
                                kind: 'delete',
                                onClick: () => handleDelete(member),
                                ariaLabel: `${member.email} 삭제`,
                            },
                        ].filter(Boolean)}
                    />
                );
            }
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
        sysopDomain,
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

    const memberTableEmptyVariant = members.length === 0 ? 'default' : 'search';

    const openCreateModal = useCallback(() => {
        setCreateMember({
            loginId: '',
            password: '',
            passwordConfirm: '',
            role: 'USER',
            grade: 'FREE',
            domainName: sysopDomain,
        });
        setLoginIdCheckMessage('');
        setIsLoginIdAvailable(false);
    }, [sysopDomain]);

    return (
        <div className="kl-page kl-page--fill">
            <div className="kl-main-sticky-head">
                <PageHeader
                    title="사용자 관리"
                    breadcrumbs={['SYSOP센터', '사용자 관리']}
                />
            </div>

            <div className="table-area">
                    <div className="table-toolbar">
                        <div className="toolbar-left">
                            <span className="kl-table-toolbar-summary">
                                총 <strong>{filteredMembers.length}</strong>건
                                {sysopDomain ? (
                                    <> · 도메인 <strong>{sysopDomain}</strong></>
                                ) : null}
                            </span>
                        </div>
                        <div className="toolbar-right">
                            <div className="search-area">
                                <Search size={16} className="search-area-icon" aria-hidden />
                                <input
                                    type="text"
                                    className="search-area-input"
                                    placeholder="이메일, 도메인, 권한 검색..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    aria-label="사용자 검색"
                                />
                            </div>
                            <KlIconButton
                                tooltip="새로고침"
                                ariaLabel="사용자 목록 새로고침"
                                onClick={fetchMembers}
                                buttonClassName="kl-btn gray-outline md icon-only"
                                stopPropagation={false}
                            >
                                <RotateCcw size={16} aria-hidden />
                            </KlIconButton>
                            <button
                                type="button"
                                className="kl-btn primary-full md"
                                onClick={openCreateModal}
                            >
                                <Plus size={14} aria-hidden />
                                사용자 추가
                            </button>
                        </div>
                    </div>
                    <div className="basic-table-shell">
                        <BasicTable
                            columns={headerColumns}
                            data={loading ? [] : tableMemberRows}
                            renderCell={renderMemberCell}
                            onColumnResizeMouseDown={memberColumnStartResize}
                            emptyState={listTableEmptyState({
                                loading,
                                loadError: null,
                                loadingMessage: '데이터를 불러오는 중...',
                                emptyVariant: memberTableEmptyVariant,
                            })}
                        />
                    </div>
                    {!loading && SHOW_MEMBER_TABLE_FOOTER ? (
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

            <BaseModal
                open={Boolean(editMember)}
                title="사용자 수정"
                onClose={() => setEditMember(null)}
                maxWidth={false}
                fullWidth={false}
                paperSx={klFormModalPaperSx}
                contentClassName={klModalFormContentClassName}
                actions={(
                    <div className="kl-modal-actions-split">
                        <div className="kl-modal-actions-split__left" aria-hidden="true" />
                        <div className="kl-modal-actions-split__right">
                            <button
                                type="button"
                                className="kl-btn gray-outline md"
                                onClick={() => setEditMember(null)}
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                className="kl-btn primary-full md"
                                form={KL_MODAL_FORM_ELEMENT_ID}
                            >
                                저장
                            </button>
                        </div>
                    </div>
                )}
            >
                {editMember ? (
                    <form
                        id={KL_MODAL_FORM_ELEMENT_ID}
                        className={KL_MODAL_FORM_STACK_CLASS}
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleEditSave();
                        }}
                    >
                        <div className="kl-modal-form-row">
                            <label className="kl-modal-form-row__label" htmlFor="sysop-member-edit-email">
                                이메일
                            </label>
                            <div className="kl-modal-form-row__control">
                                <input
                                    id="sysop-member-edit-email"
                                    type="email"
                                    className="kl-form-readonly kl-form-readonly--control"
                                    value={editMember.email}
                                    readOnly
                                    aria-readonly="true"
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                        <div className="kl-modal-form-row">
                            <label className="kl-modal-form-row__label" htmlFor="sysop-member-edit-role">
                                권한 (Role)
                            </label>
                            <div className="kl-modal-form-row__control">
                                <select
                                    id="sysop-member-edit-role"
                                    value={editMember.role}
                                    onChange={(e) => setEditMember({ ...editMember, role: e.target.value })}
                                >
                                    <option value="USER">USER</option>
                                    <option value="VIEWER">VIEWER</option>
                                </select>
                            </div>
                        </div>
                        <div className="kl-modal-form-row">
                            <label className="kl-modal-form-row__label" htmlFor="sysop-member-edit-grade">
                                등급 (Grade)
                            </label>
                            <div className="kl-modal-form-row__control">
                                <select
                                    id="sysop-member-edit-grade"
                                    value={editMember.grade}
                                    onChange={(e) => setEditMember({ ...editMember, grade: e.target.value })}
                                >
                                    <option value="FREE">FREE</option>
                                    <option value="PRO">PRO</option>
                                    <option value="MAX">MAX</option>
                                    <option value="SPECIAL">SPECIAL (무제한)</option>
                                </select>
                            </div>
                        </div>
                        <div className="kl-modal-form-row">
                            <label className="kl-modal-form-row__label" htmlFor="sysop-member-edit-status">
                                상태 (Status)
                            </label>
                            <div className="kl-modal-form-row__control">
                                <select
                                    id="sysop-member-edit-status"
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
                    </form>
                ) : null}
            </BaseModal>

            <BaseModal
                open={Boolean(createMember)}
                title="사용자 추가"
                onClose={() => setCreateMember(null)}
                maxWidth={false}
                fullWidth={false}
                paperSx={klFormModalPaperSx}
                contentClassName={klModalFormContentClassName}
                actions={(
                    <div className="kl-modal-actions-split">
                        <div className="kl-modal-actions-split__left" aria-hidden="true" />
                        <div className="kl-modal-actions-split__right">
                            <button
                                type="button"
                                className="kl-btn gray-outline md"
                                onClick={() => setCreateMember(null)}
                                disabled={createSubmitting}
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                className="kl-btn primary-full md"
                                form={KL_MODAL_FORM_ELEMENT_ID}
                                disabled={createSubmitting || !canSubmit}
                            >
                                {createSubmitting ? '등록 중...' : '등록'}
                            </button>
                        </div>
                    </div>
                )}
            >
                {createMember ? (
                    <form
                        id={KL_MODAL_FORM_ELEMENT_ID}
                        className={KL_MODAL_FORM_STACK_CLASS}
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleCreateSubmit();
                        }}
                    >
                        <input
                            type="text"
                            name="km-trap-username"
                            autoComplete="username"
                            style={{ position: 'absolute', left: '-9999px', top: '-9999px', height: 0, width: 0, opacity: 0 }}
                            tabIndex={-1}
                            aria-hidden="true"
                            readOnly
                        />
                        <input
                            type="password"
                            name="km-trap-password"
                            autoComplete="current-password"
                            style={{ position: 'absolute', left: '-9999px', top: '-9999px', height: 0, width: 0, opacity: 0 }}
                            tabIndex={-1}
                            aria-hidden="true"
                            readOnly
                        />

                        <div className="kl-modal-form-row kl-vert-start">
                            <label className="kl-modal-form-row__label" htmlFor="sysop-member-create-loginid">
                                로그인 ID
                                <span className="kl-modal-form-required" aria-hidden="true"> *</span>
                            </label>
                            <div className="kl-modal-form-row__control">
                                <div className={KL_MODAL_FORM_CONTROL_ROW_CLASS}>
                                    <input
                                        id="sysop-member-create-loginid"
                                        type="text"
                                        name="km-create-loginid"
                                        autoComplete="off"
                                        value={createMember.loginId}
                                        onChange={(e) => {
                                            setCreateMember({ ...createMember, loginId: e.target.value });
                                            resetLoginIdCheck();
                                        }}
                                        placeholder="이메일 또는 ID (예: operator1)"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        className="kl-btn gray-fill md"
                                        onClick={handleCheckLoginId}
                                        disabled={isLoginIdChecking || !(createMember.loginId || '').trim()}
                                    >
                                        {isLoginIdChecking ? '확인 중...' : '중복확인'}
                                    </button>
                                </div>
                                {loginIdCheckMessage ? (
                                    <div
                                        className={`${KL_MODAL_FORM_FEEDBACK_CLASS} ${isLoginIdAvailable ? KL_MODAL_FORM_FEEDBACK_SUCCESS_CLASS : KL_MODAL_FORM_FEEDBACK_ERROR_CLASS}`}
                                        role="status"
                                    >
                                        {isLoginIdAvailable ? (
                                            <CheckCircle size={14} aria-hidden />
                                        ) : (
                                            <AlertCircle size={14} aria-hidden />
                                        )}
                                        {loginIdCheckMessage}
                                    </div>
                                ) : (
                                    <p className="kl-modal-form-helper">
                                        이메일 또는 영문/숫자 ID (3–255자). 중복확인 후 등록할 수 있습니다.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="kl-modal-form-row">
                            <label className="kl-modal-form-row__label" htmlFor="sysop-member-create-password">
                                비밀번호
                                <span className="kl-modal-form-required" aria-hidden="true"> *</span>
                            </label>
                            <div className="kl-modal-form-row__control">
                                <input
                                    id="sysop-member-create-password"
                                    type="password"
                                    name="km-create-newpass"
                                    autoComplete="new-password"
                                    value={createMember.password}
                                    onChange={(e) => setCreateMember({ ...createMember, password: e.target.value })}
                                    placeholder="비밀번호 입력"
                                />
                            </div>
                        </div>

                        <div className="kl-modal-form-row">
                            <label className="kl-modal-form-row__label" htmlFor="sysop-member-create-password-confirm">
                                비밀번호 확인
                                <span className="kl-modal-form-required" aria-hidden="true"> *</span>
                            </label>
                            <div className="kl-modal-form-row__control">
                                <input
                                    id="sysop-member-create-password-confirm"
                                    type="password"
                                    name="km-create-newpass-confirm"
                                    autoComplete="new-password"
                                    value={createMember.passwordConfirm}
                                    onChange={(e) => setCreateMember({
                                        ...createMember,
                                        passwordConfirm: e.target.value,
                                    })}
                                    placeholder="비밀번호 재입력"
                                />
                                {Boolean(createMember.passwordConfirm)
                                    && createMember.password !== createMember.passwordConfirm ? (
                                        <div className={`${KL_MODAL_FORM_FEEDBACK_CLASS} ${KL_MODAL_FORM_FEEDBACK_ERROR_CLASS}`} role="alert">
                                            <AlertCircle size={14} aria-hidden />
                                            비밀번호가 일치하지 않습니다.
                                        </div>
                                    ) : null}
                            </div>
                        </div>

                        <div className="kl-modal-form-row">
                            <label className="kl-modal-form-row__label" htmlFor="sysop-member-create-role">
                                권한 (Role)
                                <span className="kl-modal-form-required" aria-hidden="true"> *</span>
                            </label>
                            <div className="kl-modal-form-row__control">
                                <select
                                    id="sysop-member-create-role"
                                    value={createMember.role}
                                    onChange={(e) => setCreateMember({ ...createMember, role: e.target.value })}
                                >
                                    <option value="USER">USER</option>
                                    <option value="VIEWER">VIEWER</option>
                                </select>
                                <p className="kl-modal-form-helper">
                                    SYSOP는 USER(일반) 또는 VIEWER(조회 전용)만 생성할 수 있습니다.
                                </p>
                            </div>
                        </div>

                        <div className="kl-modal-form-row">
                            <label className="kl-modal-form-row__label" htmlFor="sysop-member-create-grade">
                                등급 (Grade)
                                <span className="kl-modal-form-required" aria-hidden="true"> *</span>
                            </label>
                            <div className="kl-modal-form-row__control">
                                <select
                                    id="sysop-member-create-grade"
                                    value={createMember.grade}
                                    onChange={(e) => setCreateMember({ ...createMember, grade: e.target.value })}
                                >
                                    <option value="FREE">FREE</option>
                                    <option value="PRO">PRO</option>
                                    <option value="MAX">MAX</option>
                                    <option value="SPECIAL">SPECIAL (무제한)</option>
                                </select>
                            </div>
                        </div>

                        <div className="kl-modal-form-row">
                            <label className="kl-modal-form-row__label" htmlFor="sysop-member-create-domain">
                                도메인
                            </label>
                            <div className="kl-modal-form-row__control">
                                <input
                                    id="sysop-member-create-domain"
                                    type="text"
                                    className="kl-form-readonly kl-form-readonly--control"
                                    value={sysopDomain || ''}
                                    readOnly
                                    aria-readonly="true"
                                />
                                <p className="kl-modal-form-helper">
                                    SYSOP 본인 도메인으로 자동 설정됩니다.
                                </p>
                            </div>
                        </div>
                    </form>
                ) : null}
            </BaseModal>
        </div>
    );
}

export default SysopMemberManagement;

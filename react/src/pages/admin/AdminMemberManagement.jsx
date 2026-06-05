import React, {
    useState, useEffect, useMemo, useRef, useCallback,
} from 'react';
import { apiCall, memberApi } from '../../services/api';
import { useDialog } from '../../hooks/useDialog';
import { useBasicTableColumnResize } from '../../hooks/useBasicTableColumnResize';
import {
    Users, Search, RotateCcw, Plus, CheckCircle, AlertCircle,
} from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import BasicTable, { BasicTableFooter, BasicTablePaginationNav } from '../../components/common/BasicTable';
import KlTableRowActions from '../../components/common/table/KlTableRowActions';
import KlIconButton from '../../components/common/KlIconButton';
import { listTableEmptyState } from '../../config/supportMock';
import { formatTableCellText, isTableCellBlank } from '../../components/common/tableCellDisplay';
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
import { mockDomains } from '../../data/domainMockData';
import './admin-common.css';
import './AdminMemberManagement.css';

const isMemberMockEnabled = import.meta.env.VITE_ENABLE_MEMBER_MOCK === 'true';
const isDomainMockEnabled = import.meta.env.VITE_ENABLE_DOMAIN_MOCK === 'true';

/** 목록 성격에 따라 true: 좌측 체크박스 열·행 선택 상태 사용(벌크 작업 등) */
const SHOW_ROW_CHECKBOX_COLUMN = false;

const PAGE_SIZE = 15;

/** 로그인 실패 횟수가 이 값 이상이면 계정 잠금(더미·표시 기준) */
const LOCK_FAILURE_THRESHOLD = 5;

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
    const [createMember, setCreateMember] = useState(null);
    const [createSubmitting, setCreateSubmitting] = useState(false);
    const [loginIdCheckMessage, setLoginIdCheckMessage] = useState('');
    const [isLoginIdAvailable, setIsLoginIdAvailable] = useState(false);
    const [isLoginIdChecking, setIsLoginIdChecking] = useState(false);
    const [domains, setDomains] = useState([]);
    const [page, setPage] = useState(0);
    const [selectedIds, setSelectedIds] = useState(() => new Set());
    /** 잠금 해제 직후 — 열린 자물쇠로 표시·더미에서 재잠금 가능 */
    const [unlockedMemberIds, setUnlockedMemberIds] = useState(() => new Set());
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

    const fetchDomains = useCallback(async () => {
        if (isDomainMockEnabled) {
            setDomains(mockDomains);
            return;
        }
        try {
            const data = await apiCall('/domains');
            setDomains(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch domains:', error);
            setDomains(mockDomains);
        }
    }, []);

    useEffect(() => {
        fetchDomains();
    }, [fetchDomains]);

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
        if (isTableCellBlank(dateString)) return formatTableCellText(dateString);
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
        });
    }, []);

    const deleteUsesLocalState = isMemberMockEnabled || adminListSource === 'mock';

    const canSubmitCreate = useMemo(() => {
        if (!createMember) return false;
        if (!isLoginIdAvailable) return false;
        if (!createMember.password) return false;
        if (createMember.password !== createMember.passwordConfirm) return false;
        if (!(createMember.domainName || '').trim()) return false;
        return true;
    }, [createMember, isLoginIdAvailable]);

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
        const domainName = (createMember.domainName || '').trim();
        if (!domainName) {
            await alert('도메인을 선택하세요.');
            return;
        }
        const allowedRoles = ['USER', 'SYSOP', 'ADMIN'];
        if (!allowedRoles.includes(createMember.role)) {
            await alert('권한을 확인해 주세요.');
            return;
        }

        if (deleteUsesLocalState) {
            const newMember = {
                id: Date.now(),
                email: trimmedId,
                role: createMember.role,
                grade: createMember.grade,
                status: 'ACTIVE',
                domain: domainName,
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
                domainName,
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

    const openCreateModal = useCallback(() => {
        const defaultDomain = domains.length > 0 ? (domains[0].name || '') : '';
        setCreateMember({
            loginId: '',
            password: '',
            passwordConfirm: '',
            role: 'USER',
            grade: 'FREE',
            domainName: defaultDomain,
        });
        setLoginIdCheckMessage('');
        setIsLoginIdAvailable(false);
    }, [domains]);

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

    const markMemberUnlocked = useCallback((memberId) => {
        setUnlockedMemberIds((prev) => {
            const next = new Set(prev);
            next.add(memberId);
            return next;
        });
    }, []);

    const clearMemberUnlocked = useCallback((memberId) => {
        setUnlockedMemberIds((prev) => {
            const next = new Set(prev);
            next.delete(memberId);
            return next;
        });
    }, []);

    const handleLock = useCallback(async (member) => {
        const ok = await confirm(`"${member.email}" 계정을 다시 잠그시겠습니까?`);
        if (!ok) return;
        if (deleteUsesLocalState) {
            const lockedAt = new Date().toISOString();
            setMembers((prev) => prev.map((m) => (
                m.id === member.id
                    ? { ...m, failedLoginAttempts: LOCK_FAILURE_THRESHOLD, accountLockedAt: lockedAt }
                    : m
            )));
            clearMemberUnlocked(member.id);
            await alert('계정이 잠금 처리되었습니다. (더미 목록)');
            return;
        }
        await alert(
            '재잠금 API는 백엔드 연동 후 사용할 수 있습니다.\n'
            + '로컬 테스트: VITE_ENABLE_MEMBER_MOCK=true 이거나 목록이 더미로 표시될 때만 재잠금이 동작합니다.',
        );
    }, [alert, confirm, deleteUsesLocalState, clearMemberUnlocked]);

    const handleUnlock = useCallback(async (member) => {
        const ok = await confirm(`"${member.email}" 계정 잠금을 해제하시겠습니까?`);
        if (!ok) return;
        if (deleteUsesLocalState) {
            setMembers((prev) => prev.map((m) => (
                m.id === member.id
                    ? { ...m, failedLoginAttempts: 0, accountLockedAt: null }
                    : m
            )));
            markMemberUnlocked(member.id);
            await alert('잠금이 해제되었습니다.');
            return;
        }
        try {
            await memberApi.update(member.id, { failedLoginAttempts: '0' });
            markMemberUnlocked(member.id);
            await alert('잠금이 해제되었습니다.');
            fetchMembers();
        } catch (error) {
            await alert('잠금 해제에 실패했습니다.');
        }
    }, [alert, confirm, deleteUsesLocalState, fetchMembers, markMemberUnlocked]);

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
        const isLocked = member.failedLoginAttempts >= LOCK_FAILURE_THRESHOLD;
        const showUnlockedIcon = !isLocked && unlockedMemberIds.has(member.id);
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
            case 'domain': {
                const domain = member.domain;
                return (
                    <span
                        className={isTableCellBlank(domain) ? 'kl-table-cell-blank' : 'admin-member-domain'}
                        title={!isTableCellBlank(domain) ? String(domain) : undefined}
                    >
                        {formatTableCellText(domain)}
                    </span>
                );
            }
            case 'failed':
                return (
                    <span className={isLocked ? 'admin-member-locked-count' : undefined}>
                        {member.failedLoginAttempts || 0}
                    </span>
                );
            case 'locked': {
                const lockedAt = member.accountLockedAt;
                return (
                    <span
                        className={[
                            isTableCellBlank(lockedAt) ? 'kl-table-cell-blank' : 'member-mgmt-col-date',
                            isLocked && !isTableCellBlank(lockedAt) ? 'admin-member-locked-date' : '',
                        ].filter(Boolean).join(' ')}
                    >
                        {formatDate(lockedAt)}
                    </span>
                );
            }
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
            case 'actions':
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
                            showUnlockedIcon && {
                                kind: 'unlocked',
                                tooltip: '잠금',
                                onClick: () => handleLock(member),
                                ariaLabel: `${member.email} 잠금`,
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
            default:
                return undefined;
        }
    }, [
        selectedIds,
        formatDate,
        handleDelete,
        handleUnlock,
        handleLock,
        handleResendVerification,
        toggleMemberRowSelected,
        unlockedMemberIds,
    ]);

    const memberTableEmptyVariant = members.length === 0 ? 'default' : 'search';

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
        <div className="kl-page kl-page--fill">
            <div className="kl-main-sticky-head">
                <AdminPageHeader
                    icon={Users}
                    title="사용자 관리"
                />

                
            </div>

            <div className="table-area">
                    <div className="table-toolbar">
                    <div className="toolbar-left">
                        <span className="kl-table-toolbar-summary">
                            총 <strong>{filteredMembers.length}</strong>건
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
                            className="member-mgmt-basic-table"
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
                            <label className="kl-modal-form-row__label" htmlFor="member-edit-email">
                                이메일
                            </label>
                            <div className="kl-modal-form-row__control">
                                <input
                                    id="member-edit-email"
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
                            <label className="kl-modal-form-row__label" htmlFor="member-edit-role">
                                권한 (Role)
                            </label>
                            <div className="kl-modal-form-row__control">
                                <select
                                    id="member-edit-role"
                                    value={editMember.role}
                                    onChange={(e) => setEditMember({ ...editMember, role: e.target.value })}
                                >
                                    <option value="USER">USER</option>
                                    <option value="SYSOP">SYSOP</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>
                        </div>

                        <div className="kl-modal-form-row">
                            <label className="kl-modal-form-row__label" htmlFor="member-edit-grade">
                                등급 (Grade)
                            </label>
                            <div className="kl-modal-form-row__control">
                                <select
                                    id="member-edit-grade"
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
                            <label className="kl-modal-form-row__label" htmlFor="member-edit-status">
                                상태 (Status)
                            </label>
                            <div className="kl-modal-form-row__control">
                                <select
                                    id="member-edit-status"
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
                                disabled={createSubmitting || !canSubmitCreate}
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
                            style={{
                                position: 'absolute', left: '-9999px', top: '-9999px', height: 0, width: 0, opacity: 0,
                            }}
                            tabIndex={-1}
                            aria-hidden="true"
                            readOnly
                        />
                        <input
                            type="password"
                            name="km-trap-password"
                            autoComplete="current-password"
                            style={{
                                position: 'absolute', left: '-9999px', top: '-9999px', height: 0, width: 0, opacity: 0,
                            }}
                            tabIndex={-1}
                            aria-hidden="true"
                            readOnly
                        />

                        <div className="kl-modal-form-row kl-vert-start">
                            <label className="kl-modal-form-row__label" htmlFor="admin-member-create-loginid">
                                로그인 ID
                                <span className="kl-modal-form-required" aria-hidden="true"> *</span>
                            </label>
                            <div className="kl-modal-form-row__control">
                                <div className={KL_MODAL_FORM_CONTROL_ROW_CLASS}>
                                    <input
                                        id="admin-member-create-loginid"
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
                            <label className="kl-modal-form-row__label" htmlFor="admin-member-create-password">
                                비밀번호
                                <span className="kl-modal-form-required" aria-hidden="true"> *</span>
                            </label>
                            <div className="kl-modal-form-row__control">
                                <input
                                    id="admin-member-create-password"
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
                            <label className="kl-modal-form-row__label" htmlFor="admin-member-create-password-confirm">
                                비밀번호 확인
                                <span className="kl-modal-form-required" aria-hidden="true"> *</span>
                            </label>
                            <div className="kl-modal-form-row__control">
                                <input
                                    id="admin-member-create-password-confirm"
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
                                        <div
                                            className={`${KL_MODAL_FORM_FEEDBACK_CLASS} ${KL_MODAL_FORM_FEEDBACK_ERROR_CLASS}`}
                                            role="alert"
                                        >
                                            <AlertCircle size={14} aria-hidden />
                                            비밀번호가 일치하지 않습니다.
                                        </div>
                                    ) : null}
                            </div>
                        </div>

                        <div className="kl-modal-form-row">
                            <label className="kl-modal-form-row__label" htmlFor="admin-member-create-role">
                                권한 (Role)
                                <span className="kl-modal-form-required" aria-hidden="true"> *</span>
                            </label>
                            <div className="kl-modal-form-row__control">
                                <select
                                    id="admin-member-create-role"
                                    value={createMember.role}
                                    onChange={(e) => setCreateMember({ ...createMember, role: e.target.value })}
                                >
                                    <option value="USER">USER</option>
                                    <option value="SYSOP">SYSOP</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>
                        </div>

                        <div className="kl-modal-form-row">
                            <label className="kl-modal-form-row__label" htmlFor="admin-member-create-grade">
                                등급 (Grade)
                                <span className="kl-modal-form-required" aria-hidden="true"> *</span>
                            </label>
                            <div className="kl-modal-form-row__control">
                                <select
                                    id="admin-member-create-grade"
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

                        <div className="kl-modal-form-row kl-vert-start">
                            <label className="kl-modal-form-row__label" htmlFor="admin-member-create-domain">
                                도메인
                                <span className="kl-modal-form-required" aria-hidden="true"> *</span>
                            </label>
                            <div className="kl-modal-form-row__control">
                                <select
                                    id="admin-member-create-domain"
                                    value={createMember.domainName}
                                    onChange={(e) => setCreateMember({
                                        ...createMember,
                                        domainName: e.target.value,
                                    })}
                                    disabled={domains.length === 0}
                                >
                                    {domains.length === 0 ? (
                                        <option value="">도메인 목록 없음</option>
                                    ) : (
                                        domains.map((d) => (
                                            <option key={d.id ?? d.name} value={d.name}>
                                                {d.name}
                                            </option>
                                        ))
                                    )}
                                </select>
                                <p className="kl-modal-form-helper">
                                    등록할 사용자가 소속될 도메인을 선택합니다.
                                </p>
                            </div>
                        </div>
                    </form>
                ) : null}
            </BaseModal>
        </div>
    );
}

export default AdminMemberManagement;

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { HelpCircle, RotateCcw } from 'lucide-react';
import { upgradeApi } from '../../services/api';
import { useDialog } from '../../hooks/useDialog';
import { useBasicTableColumnResize } from '../../hooks/useBasicTableColumnResize';
import BaseModal from '../../components/common/modal/BaseModal';
import {
    KL_MODAL_FORM_ELEMENT_ID,
    KL_MODAL_FORM_STACK_CLASS,
    klModalFormContentClassName,
} from '../../components/common/modal/klModalForm';
import { klFormModalPaperSx } from '../../components/common/modal/klModalPaper';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import BasicTable from '../../components/common/BasicTable';
import { formatTableCellText, isTableCellBlank } from '../../components/common/tableCellDisplay';
import KlPopover from '../../components/common/KlPopover';
import KlTableRowActions from '../../components/common/table/KlTableRowActions';
import KlIconButton from '../../components/common/KlIconButton';
import { listTableEmptyState } from '../../config/supportMock';
import { mockUpgradeRequests } from '../../data/upgradeRequestMockData';
import './admin-common.css';
import './AdminUpgradeRequests.css';

const isUpgradeMockEnabled = import.meta.env.VITE_ENABLE_UPGRADE_MOCK === 'true';

function formatUpgradeDate(dateString) {
    if (isTableCellBlank(dateString)) return formatTableCellText(dateString);
    return new Date(dateString).toLocaleDateString('ko-KR');
}

function AdminUpgradeRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    /** `live` | `mock` — mock이면 승인·거절은 로컬 state만 갱신 */
    const [listSource, setListSource] = useState('live');
    const { alert, confirm } = useDialog();

    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    /** 거절 사유 Popover — `{ anchorPosition: { top, left }, requestId, text }` (뷰포트 기준, DOM 앵커보다 위치 안정) */
    const [rejectReasonPopover, setRejectReasonPopover] = useState(null);

    const upgradeTableColumnDefinitions = useMemo(
        () => [
            { id: 'createdAt', label: '신청일', defaultWidthPx: 112, minWidthPx: 104, align: 'left' },
            { id: 'email', label: '이메일', defaultWidthPx: 200, minWidthPx: 160, align: 'left' },
            { id: 'company', label: '회사/소속', defaultWidthPx: 130, minWidthPx: 112, align: 'left' },
            { id: 'applicant', label: '담당자', defaultWidthPx: 88, minWidthPx: 72, align: 'left' },
            { id: 'phone', label: '전화번호', defaultWidthPx: 120, minWidthPx: 104, align: 'left' },
            { id: 'type', label: '유형', defaultWidthPx: 104, minWidthPx: 96, align: 'left', ellipsis: false },
            { id: 'status', label: '상태', defaultWidthPx: 180, minWidthPx: 140, align: 'left', ellipsis: false },
            {
                id: 'actions',
                label: <span className="admin-upgrade-actions-head">관리</span>,
                defaultWidthPx: 120,
                minWidthPx: 120,
                align: 'right',
                ellipsis: false,
            },
        ],
        []
    );

    const { columns: upgradeTableColumns, startResize: upgradeColumnStartResize } = useBasicTableColumnResize({
        definitions: upgradeTableColumnDefinitions,
        storageKey: 'kl-upgrade-requests-v1',
        enabled: true,
    });

    const fetchRequests = useCallback(async () => {
        if (isUpgradeMockEnabled) {
            setRequests(mockUpgradeRequests);
            setListSource('mock');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await upgradeApi.getAllRequests();
            const list = Array.isArray(data) ? data : [];
            setRequests(list);
            setListSource('live');
        } catch (err) {
            console.warn('[AdminUpgradeRequests] API 실패, 목 데이터로 표시:', err?.message || err);
            setRequests(mockUpgradeRequests);
            setListSource('mock');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleApprove = useCallback(
        async (id) => {
            const confirmed = await confirm(
                '승인하시겠습니까? 해당 회원의 등급이 변경되며 승인 메일이 발송됩니다.'
            );
            if (!confirmed) return;

            if (listSource === 'mock') {
                setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'APPROVED' } : r)));
                await alert('승인되었습니다. (목 데이터 모드)');
                return;
            }

            try {
                await upgradeApi.approveRequest(id);
                await alert('승인되었습니다.');
                fetchRequests();
            } catch (err) {
                await alert(err?.message || '승인 처리에 실패했습니다.');
            }
        },
        [alert, confirm, fetchRequests, listSource]
    );

    const openRejectModal = useCallback((id) => {
        setSelectedRequestId(id);
        setRejectReason('');
        setRejectModalOpen(true);
    }, []);

    const handleRejectSubmit = useCallback(async () => {
        if (!rejectReason.trim()) {
            await alert('거절 사유를 입력해주세요.');
            return;
        }

        if (listSource === 'mock') {
            setRequests((prev) =>
                prev.map((r) =>
                    r.id === selectedRequestId
                        ? { ...r, status: 'REJECTED', rejectReason: rejectReason.trim() }
                        : r
                )
            );
            await alert('거절 처리되었습니다. (목 데이터 모드)');
            setRejectModalOpen(false);
            return;
        }

        try {
            await upgradeApi.rejectRequest(selectedRequestId, rejectReason);
            await alert('거절 처리되었습니다. 메일이 발송되었습니다.');
            setRejectModalOpen(false);
            fetchRequests();
        } catch (err) {
            await alert(err?.message || '거절 처리에 실패했습니다.');
        }
    }, [alert, fetchRequests, listSource, rejectReason, selectedRequestId]);

    const renderUpgradeCell = useCallback(
        ({ column, row: req }) => {
            switch (column.id) {
                case 'createdAt': {
                    const createdAt = req.createdAt;
                    return (
                        <span
                            className={
                                isTableCellBlank(createdAt)
                                    ? 'kl-table-cell-blank'
                                    : 'admin-upgrade-date-text'
                            }
                        >
                            {formatUpgradeDate(createdAt)}
                        </span>
                    );
                }
                case 'email': {
                    const email = req.email;
                    return (
                        <span
                            className={isTableCellBlank(email) ? 'kl-table-cell-blank' : 'admin-upgrade-muted'}
                            title={!isTableCellBlank(email) ? String(email) : undefined}
                        >
                            {formatTableCellText(email)}
                        </span>
                    );
                }
                case 'company': {
                    const company = req.company;
                    return (
                        <span
                            className={isTableCellBlank(company) ? 'kl-table-cell-blank' : 'admin-upgrade-muted'}
                            title={!isTableCellBlank(company) ? String(company) : undefined}
                        >
                            {formatTableCellText(company)}
                        </span>
                    );
                }
                case 'applicant': {
                    const applicant = req.name;
                    return (
                        <span
                            className={isTableCellBlank(applicant) ? 'kl-table-cell-blank' : 'admin-upgrade-muted'}
                            title={!isTableCellBlank(applicant) ? String(applicant) : undefined}
                        >
                            {formatTableCellText(applicant)}
                        </span>
                    );
                }
                case 'phone': {
                    const phone = req.phone;
                    return (
                        <span
                            className={isTableCellBlank(phone) ? 'kl-table-cell-blank' : 'admin-upgrade-muted'}
                            title={!isTableCellBlank(phone) ? String(phone) : undefined}
                        >
                            {formatTableCellText(phone)}
                        </span>
                    );
                }
                case 'type':
                    return (
                        <span
                            className={`admin-upgrade-type-badge ${
                                req.type === 'MAX_CONSULTATION' ? 'is-max' : 'is-pro'
                            }`}
                        >
                            {req.type === 'PRO_UPGRADE' ? 'Pro 신청' : 'Max 상담'}
                        </span>
                    );
                case 'status': {
                    const status = req.status;
                    const statusKey = String(status || '').toLowerCase();
                    const reasonOpen =
                        rejectReasonPopover &&
                        rejectReasonPopover.requestId === req.id;
                    return (
                        <div className="admin-upgrade-status-cell">
                            <div className="admin-upgrade-status-row">
                                <span
                                    className={
                                        isTableCellBlank(status)
                                            ? 'kl-table-cell-blank'
                                            : `admin-upgrade-status status-${statusKey}`
                                    }
                                >
                                    {formatTableCellText(status)}
                                </span>
                                {status === 'REJECTED' && (
                                    <KlIconButton
                                        ariaLabel={`${req.email} 사유 보기`}
                                        buttonClassName="kl-popover-icon-btn"
                                        placement="top"
                                        onClick={(e) => {
                                            const el = e.currentTarget;
                                            const r = el.getBoundingClientRect();
                                            const text = (req.rejectReason || '').trim();
                                            setRejectReasonPopover((prev) => {
                                                if (prev?.requestId === req.id) {
                                                    return null;
                                                }
                                                return {
                                                    anchorPosition: {
                                                        top: r.bottom,
                                                        left: r.left,
                                                    },
                                                    requestId: req.id,
                                                    text: text || '등록된 거절 사유가 없습니다.',
                                                };
                                            });
                                        }}
                                        buttonProps={{
                                            'aria-expanded': Boolean(reasonOpen),
                                            'aria-haspopup': 'true',
                                            'aria-controls': 'admin-upgrade-reject-reason-popover',
                                        }}
                                    >
                                        <HelpCircle size={16} strokeWidth={1.75} aria-hidden />
                                    </KlIconButton>
                                )}
                            </div>
                        </div>
                    );
                }
                case 'actions':
                    if (req.status !== 'PENDING') return null;
                    return (
                        <KlTableRowActions
                            actions={[
                                {
                                    kind: 'reject',
                                    onClick: () => openRejectModal(req.id),
                                    ariaLabel: `${req.email} 신청 거절`,
                                },
                                {
                                    kind: 'approve',
                                    onClick: () => handleApprove(req.id),
                                    ariaLabel: `${req.email} 신청 승인`,
                                },
                            ]}
                        />
                    );
                default:
                    return undefined;
            }
        },
        [handleApprove, openRejectModal, rejectReasonPopover]
    );

    return (
        <div className="kl-page kl-page--fill">
            <div className="kl-main-sticky-head">
                <AdminPageHeader
                    title="승인 관리"
                    actions={(
                        <KlIconButton
                            tooltip="새로고침"
                            ariaLabel="승인 요청 목록 새로고침"
                            onClick={fetchRequests}
                            buttonClassName="kl-btn gray-outline md icon-only"
                            stopPropagation={false}
                        >
                            <RotateCcw size={16} aria-hidden />
                        </KlIconButton>
                    )}
                />
            </div>

            <div className="table-area">
                <div className="table-toolbar">
                <div className="toolbar-left">
                    <span className="kl-table-toolbar-summary">
                        총 <strong>{requests.length}</strong>건
                    </span>
                </div>
                </div>

                <div className="basic-table-shell">
                    <BasicTable
                        className="admin-upgrade-basic-table"
                        columns={upgradeTableColumns}
                        data={loading ? [] : requests}
                        renderCell={renderUpgradeCell}
                        onColumnResizeMouseDown={upgradeColumnStartResize}
                        emptyState={listTableEmptyState({
                            loading,
                            loadError: null,
                            loadingMessage: '데이터를 불러오는 중...',
                            emptyVariant: 'default',
                            emptyMessage: !loading && requests.length === 0
                                ? '대기 중인 요청이 없습니다.'
                                : undefined,
                        })}
                    />
                </div>
            </div>

            <KlPopover
                id="admin-upgrade-reject-reason-popover"
                open={Boolean(rejectReasonPopover)}
                anchorReference={rejectReasonPopover ? 'anchorPosition' : 'anchorEl'}
                anchorPosition={rejectReasonPopover?.anchorPosition}
                anchorEl={null}
                onClose={() => setRejectReasonPopover(null)}
            >
                {rejectReasonPopover ? (
                    <div className="admin-upgrade-reject-popover-inner">
                        <p className="admin-upgrade-reject-popover-title">사유</p>
                        <p className="admin-upgrade-reject-popover-text">{rejectReasonPopover.text}</p>
                    </div>
                ) : null}
            </KlPopover>

            {rejectModalOpen && (
                <BaseModal
                    open={rejectModalOpen}
                    onClose={() => setRejectModalOpen(false)}
                    title="거절 사유 입력"
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
                                    onClick={() => setRejectModalOpen(false)}
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="kl-btn danger-outline md"
                                    form={KL_MODAL_FORM_ELEMENT_ID}
                                >
                                    거절 처리
                                </button>
                            </div>
                        </div>
                    )}
                >
                    <form
                        id={KL_MODAL_FORM_ELEMENT_ID}
                        className={KL_MODAL_FORM_STACK_CLASS}
                        onSubmit={(e) => {
                            e.preventDefault();
                            void handleRejectSubmit();
                        }}
                    >
                        <p className="kl-modal-form-helper">
                            거절 사유를 입력하시면 해당 내용이 메일로 발송됩니다.
                        </p>
                        <div className="kl-modal-form-row kl-vert-start">
                            <label
                                className="kl-modal-form-row__label"
                                htmlFor="admin-upgrade-reject-reason"
                            >
                                거절 사유
                            </label>
                            <div className="kl-modal-form-row__control">
                                <textarea
                                    id="admin-upgrade-reject-reason"
                                    rows={5}
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="거절 사유를 자세히 적어주세요."
                                    autoFocus
                                />
                            </div>
                        </div>
                    </form>
                </BaseModal>
            )}
        </div>
    );
}

export default AdminUpgradeRequests;

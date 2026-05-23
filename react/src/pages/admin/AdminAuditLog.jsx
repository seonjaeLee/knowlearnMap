import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { auditLogApi } from '../../services/api';
import { useBasicTableColumnResize } from '../../hooks/useBasicTableColumnResize';
import { History, Search, RotateCcw } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import BasicTable, { BasicTableFooter, BasicTablePaginationNav } from '../../components/common/BasicTable';
import KlIconButton from '../../components/common/KlIconButton';
import { formatTableCellText, isTableCellBlank } from '../../components/common/tableCellDisplay';
import './admin-common.css';
import './AdminAuditLog.css';

const PAGE_SIZE = 50;

const EMPTY_FILTERS = Object.freeze({ entityType: '', action: '', actor: '' });

function AdminAuditLog() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalElements, setTotalElements] = useState(0);
    const [page, setPage] = useState(0);
    const [pageSize] = useState(PAGE_SIZE);
    const [filters, setFilters] = useState({ ...EMPTY_FILTERS });
    const [appliedFilters, setAppliedFilters] = useState({ ...EMPTY_FILTERS });

    const columnDefinitions = useMemo(() => ([
        { id: 'createdAt', label: '일시', defaultWidthPx: 160, minWidthPx: 130, align: 'left' },
        { id: 'actor', label: '작업자', defaultWidthPx: 200, minWidthPx: 150, align: 'left' },
        { id: 'action', label: 'Action', defaultWidthPx: 120, minWidthPx: 90, align: 'left' },
        { id: 'entityType', label: 'Entity', defaultWidthPx: 140, minWidthPx: 100, align: 'left' },
        { id: 'entityId', label: 'ID', defaultWidthPx: 80, minWidthPx: 60, align: 'left' },
        { id: 'details', label: '상세 (이전 → 새 값)', defaultWidthPx: 360, minWidthPx: 200, align: 'left' },
        { id: 'ipAddress', label: 'IP', defaultWidthPx: 140, minWidthPx: 100, align: 'left' },
    ]), []);

    const { columns, startResize } = useBasicTableColumnResize({
        definitions: columnDefinitions,
        storageKey: 'km-admin-audit-log-columns-v1',
        enabled: true,
    });

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const res = await auditLogApi.getLogs({
                entityType: appliedFilters.entityType || undefined,
                action: appliedFilters.action || undefined,
                actor: appliedFilters.actor || undefined,
                page,
                size: pageSize,
            });
            setLogs(Array.isArray(res?.content) ? res.content : []);
            setTotalElements(typeof res?.totalElements === 'number' ? res.totalElements : 0);
        } catch (err) {
            console.error('Audit log 조회 실패:', err);
            setLogs([]);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    }, [appliedFilters, page, pageSize]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
    /** 0건이 아니면 1페이지만 있어도 푸터 pagination 표시(건수 요약은 툴바만) */
    const showTableFooter = totalElements > 0;

    const hasActiveFilters = useMemo(
        () => Object.values(appliedFilters).some((value) => value.length > 0),
        [appliedFilters],
    );

    const tableEmptyVariant = hasActiveFilters ? 'search' : 'default';

    const normalizeFilterValues = useCallback((source) => ({
        entityType: source.entityType.trim(),
        action: source.action.trim(),
        actor: source.actor.trim(),
    }), []);

    const canSearch = useMemo(() => {
        const draft = normalizeFilterValues(filters);
        const applied = normalizeFilterValues(appliedFilters);
        return draft.entityType !== applied.entityType
            || draft.action !== applied.action
            || draft.actor !== applied.actor;
    }, [filters, appliedFilters, normalizeFilterValues]);

    const handleApplyFilters = useCallback(() => {
        setAppliedFilters({
            entityType: filters.entityType.trim(),
            action: filters.action.trim(),
            actor: filters.actor.trim(),
        });
        setPage(0);
    }, [filters]);

    const handleResetFilters = useCallback(() => {
        setFilters({ ...EMPTY_FILTERS });
        setAppliedFilters({ ...EMPTY_FILTERS });
        setPage(0);
    }, []);

    const handleFilterKeyDown = (e) => {
        if (e.key === 'Enter' && canSearch) {
            e.preventDefault();
            handleApplyFilters();
        }
    };

    const formatDateTime = useCallback((value) => {
        if (isTableCellBlank(value)) return formatTableCellText(value);
        try {
            return new Date(value).toLocaleString('ko-KR', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
            });
        } catch {
            return String(value);
        }
    }, []);

    const renderCell = useCallback(({ column, row }) => {
        switch (column.id) {
            case 'createdAt':
                return (
                    <span
                        className={isTableCellBlank(row.createdAt) ? 'kl-table-cell-blank audit-log-col-date' : 'audit-log-col-date'}
                        title={!isTableCellBlank(row.createdAt) ? String(row.createdAt) : undefined}
                    >
                        {formatDateTime(row.createdAt)}
                    </span>
                );
            case 'actor': {
                const display = row.actorEmail || (row.actorId != null ? `#${row.actorId}` : '-');
                const tip = row.actorEmail
                    ? `${row.actorEmail}${row.actorId != null ? ` (#${row.actorId})` : ''}`
                    : display;
                return (
                    <span className="audit-log-value" title={tip}>
                        {display}
                    </span>
                );
            }
            case 'action':
                return (
                    <span className="admin-badge admin-badge-neutral" title={row.action || ''}>
                        {row.action || '-'}
                    </span>
                );
            case 'entityType':
                return (
                    <span className="audit-log-value" title={row.entityType || ''}>
                        {row.entityType || '-'}
                    </span>
                );
            case 'entityId':
                return <span className="audit-log-col-id">{row.entityId ?? '-'}</span>;
            case 'details':
                return (
                    <span className="audit-log-value" title={row.details || ''}>
                        {row.details || '-'}
                    </span>
                );
            case 'ipAddress':
                return (
                    <span className="audit-log-value" title={row.ipAddress || ''}>
                        {row.ipAddress || '-'}
                    </span>
                );
            default:
                return undefined;
        }
    }, [formatDateTime]);

    return (
        <div className="kl-page kl-page--fill audit-log-page">
            <div className="kl-main-sticky-head">
                <AdminPageHeader
                    icon={History}
                    title="Audit Log"
                    actions={(
                        <KlIconButton
                            tooltip="새로고침"
                            ariaLabel="Audit Log 새로고침"
                            onClick={fetchLogs}
                            buttonClassName="kl-btn gray-outline md icon-only"
                            stopPropagation={false}
                        >
                            <RotateCcw size={16} aria-hidden />
                        </KlIconButton>
                    )}
                />
            </div>

            {loading ? (
                <div className="audit-log-loading">데이터를 불러오는 중...</div>
            ) : (
                <div className="table-area">
                    <div className="table-toolbar">
                        <div className="toolbar-left">
                            <span className="kl-table-toolbar-summary">
                                총 <strong>{totalElements.toLocaleString()}</strong>건
                            </span>
                        </div>
                        <div className="toolbar-right">
                            <div className="toolbar-bundle">
                                <div className="toolbar-bundle__fields">
                                    <div className="toolbar-field-group audit-log-toolbar__field audit-log-toolbar__field--entity">
                                        <label htmlFor="audit-log-filter-entity" className="toolbar-field-group__label">
                                            Entity
                                        </label>
                                        <input
                                            id="audit-log-filter-entity"
                                            type="text"
                                            className="kl-input gray-outline md"
                                            placeholder="예: WorkspaceEntity"
                                            value={filters.entityType}
                                            onChange={(e) => setFilters((p) => ({ ...p, entityType: e.target.value }))}
                                            onKeyDown={handleFilterKeyDown}
                                            aria-label="Entity Type 필터"
                                        />
                                    </div>
                                    <div className="toolbar-field-group audit-log-toolbar__field audit-log-toolbar__field--action">
                                        <label htmlFor="audit-log-filter-action" className="toolbar-field-group__label">
                                            Action
                                        </label>
                                        <input
                                            id="audit-log-filter-action"
                                            type="text"
                                            className="kl-input gray-outline md"
                                            placeholder="예: UPDATE"
                                            value={filters.action}
                                            onChange={(e) => setFilters((p) => ({ ...p, action: e.target.value }))}
                                            onKeyDown={handleFilterKeyDown}
                                            aria-label="Action 필터"
                                        />
                                    </div>
                                    <div className="toolbar-field-group audit-log-toolbar__field audit-log-toolbar__field--actor">
                                        <label htmlFor="audit-log-filter-actor" className="toolbar-field-group__label">
                                            Actor
                                        </label>
                                        <input
                                            id="audit-log-filter-actor"
                                            type="text"
                                            className="kl-input gray-outline md"
                                            placeholder="예: admin@example.com"
                                            value={filters.actor}
                                            onChange={(e) => setFilters((p) => ({ ...p, actor: e.target.value }))}
                                            onKeyDown={handleFilterKeyDown}
                                            aria-label="Actor 필터"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="kl-btn gray-fill md"
                                    onClick={handleApplyFilters}
                                    disabled={!canSearch}
                                >
                                    <Search size={12} aria-hidden />
                                    검색
                                </button>
                            </div>
                            <button
                                type="button"
                                className="kl-btn gray-outline md"
                                onClick={handleResetFilters}
                            >
                                초기화
                            </button>
                        </div>
                    </div>

                    <div className="basic-table-shell">
                        <BasicTable
                            className="audit-log-basic-table"
                            columns={columns}
                            data={logs}
                            renderCell={renderCell}
                            onColumnResizeMouseDown={startResize}
                            emptyState={{
                                variant: tableEmptyVariant,
                                message: hasActiveFilters ? '검색 결과가 없습니다.' : '감사 로그가 없습니다.',
                            }}
                        />
                    </div>

                    {showTableFooter ? (
                        <BasicTableFooter
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
        </div>
    );
}

export default AdminAuditLog;

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { adminArangoApi } from '../../services/api';
import { useDialog } from '../../hooks/useDialog';
import { useBasicTableColumnResize } from '../../hooks/useBasicTableColumnResize';
import { RotateCcw, ChevronRight } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import BasicTable from '../../components/common/BasicTable';
import BasicTableRowDetail from '../../components/common/BasicTableRowDetail';
import KlIconButton from '../../components/common/KlIconButton';
import KlBadge from '../../components/common/KlBadge';
import {
    getArangoDbExistsBadgeProps,
    getArangoWorkspaceStatusBadgeProps,
} from '../../components/common/klBadgeToneMaps';
import { listTableEmptyState } from '../../config/supportMock';
import { formatTableCellText, isTableCellBlank } from '../../components/common/tableCellDisplay';
import { mockArangoDatabases, mockArangoWorkspacesByDomainId } from '../../data/arangoAdminMockData';
import './admin-common.css';
import './AdminArangoManagement.css';

const isArangoMockEnabled = import.meta.env.VITE_ENABLE_ARANGO_MOCK === 'true';

function fmtCount(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n.toLocaleString() : '0';
}

function AdminArangoManagement() {
    const [databases, setDatabases] = useState([]);
    const [loading, setLoading] = useState(true);
    /** `live` | `mock` — mock이면 워크스페이스 상세도 로컬 맵 사용 */
    const [listSource, setListSource] = useState('live');
    const [expandedDomains, setExpandedDomains] = useState(() => new Set());
    const [workspaceDetails, setWorkspaceDetails] = useState({});
    const [loadingDetails, setLoadingDetails] = useState({});
    const { alert } = useDialog();

    const domainTableColumnDefinitions = useMemo(
        () => [
            { id: '_expand', label: '', defaultWidthPx: 44, minWidthPx: 40, align: 'left', ellipsis: false },
            { id: 'domainName', label: '도메인', defaultWidthPx: 168, minWidthPx: 120, align: 'left' },
            { id: 'arangoDbName', label: 'DB명', defaultWidthPx: 160, minWidthPx: 120, align: 'left' },
            { id: 'objectNodeCount', label: 'Objects', defaultWidthPx: 100, minWidthPx: 88, align: 'left' },
            { id: 'relationNodeCount', label: 'Relations', defaultWidthPx: 100, minWidthPx: 88, align: 'left' },
            { id: 'edgeCount', label: 'Edges', defaultWidthPx: 88, minWidthPx: 80, align: 'left' },
            { id: 'rdbWorkspaceCount', label: 'WS(RDB)', defaultWidthPx: 88, minWidthPx: 80, align: 'left' },
            { id: 'arangoWorkspaceCount', label: 'WS(Arango)', defaultWidthPx: 104, minWidthPx: 92, align: 'left' },
            { id: 'orphanWorkspaceCount', label: '고아', defaultWidthPx: 72, minWidthPx: 64, align: 'left' },
            { id: 'dbExists', label: 'DB상태', defaultWidthPx: 88, minWidthPx: 80, align: 'left', ellipsis: false },
        ],
        []
    );

    const workspaceTableColumnDefinitions = useMemo(
        () => [
            { id: 'workspaceId', label: 'WS ID', defaultWidthPx: 100, minWidthPx: 88, align: 'left' },
            { id: 'workspaceName', label: '워크스페이스명', defaultWidthPx: 200, minWidthPx: 140, align: 'left' },
            { id: 'createdBy', label: '소유자', defaultWidthPx: 160, minWidthPx: 120, align: 'left' },
            { id: 'objectNodeCount', label: 'Objects', defaultWidthPx: 88, minWidthPx: 80, align: 'left' },
            { id: 'relationNodeCount', label: 'Relations', defaultWidthPx: 88, minWidthPx: 80, align: 'left' },
            { id: 'edgeCount', label: 'Edges', defaultWidthPx: 80, minWidthPx: 72, align: 'left' },
            { id: 'arangoDocumentCount', label: '문서(Arango)', defaultWidthPx: 112, minWidthPx: 96, align: 'left' },
            { id: 'rdbDocumentCount', label: '문서(RDB)', defaultWidthPx: 104, minWidthPx: 88, align: 'left' },
            { id: '_status', label: '상태', defaultWidthPx: 88, minWidthPx: 80, align: 'left', ellipsis: false },
        ],
        []
    );

    const { columns: domainTableColumns, startResize: domainColumnStartResize } = useBasicTableColumnResize({
        definitions: domainTableColumnDefinitions,
        storageKey: 'kl-arango-domains-v1',
        enabled: true,
    });

    const { columns: workspaceTableColumns, startResize: workspaceColumnStartResize } = useBasicTableColumnResize({
        definitions: workspaceTableColumnDefinitions,
        storageKey: 'kl-arango-workspaces-v1',
        enabled: true,
    });

    const fetchDatabases = useCallback(async () => {
        if (isArangoMockEnabled) {
            setDatabases(mockArangoDatabases);
            setListSource('mock');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await adminArangoApi.getDatabases();
            const list = Array.isArray(data) ? data : [];
            setDatabases(list);
            setListSource('live');
        } catch (error) {
            console.warn('[AdminArangoManagement] API 실패, 목 데이터로 표시:', error?.message || error);
            setDatabases(mockArangoDatabases);
            setListSource('mock');
            await alert('ArangoDB 데이터베이스 목록을 불러오지 못했습니다. 샘플 목록을 표시합니다.');
        } finally {
            setLoading(false);
        }
    }, [alert]);

    useEffect(() => {
        fetchDatabases();
    }, [fetchDatabases]);

    const loadWorkspaces = useCallback(
        async (domainId) => {
            if (isArangoMockEnabled || listSource === 'mock') {
                setWorkspaceDetails((prev) => ({
                    ...prev,
                    [domainId]: mockArangoWorkspacesByDomainId[domainId] ?? [],
                }));
                return;
            }

            try {
                setLoadingDetails((prev) => ({ ...prev, [domainId]: true }));
                const data = await adminArangoApi.getWorkspaces(domainId);
                setWorkspaceDetails((prev) => ({
                    ...prev,
                    [domainId]: Array.isArray(data) ? data : [],
                }));
            } catch (error) {
                console.warn('[AdminArangoManagement] 워크스페이스 API 실패:', error?.message || error);
                await alert('워크스페이스 상세 정보를 불러오지 못했습니다. 샘플 데이터로 대체합니다.');
                setWorkspaceDetails((prev) => ({
                    ...prev,
                    [domainId]: mockArangoWorkspacesByDomainId[domainId] ?? [],
                }));
            } finally {
                setLoadingDetails((prev) => ({ ...prev, [domainId]: false }));
            }
        },
        [alert, listSource]
    );

    const handleRefresh = useCallback(() => {
        setExpandedDomains(new Set());
        setWorkspaceDetails({});
        setLoadingDetails({});
        fetchDatabases();
    }, [fetchDatabases]);

    const handleDomainRowClick = useCallback(
        (_e, { row }) => {
            const domainId = row.domainId;
            const isOpen = expandedDomains.has(domainId);

            setExpandedDomains((prev) => {
                const next = new Set(prev);
                if (isOpen) {
                    next.delete(domainId);
                } else {
                    next.add(domainId);
                }
                return next;
            });

            if (isOpen || workspaceDetails[domainId] != null) {
                return;
            }
            if (isArangoMockEnabled || listSource === 'mock') {
                setWorkspaceDetails((prev) => ({
                    ...prev,
                    [domainId]: mockArangoWorkspacesByDomainId[domainId] ?? [],
                }));
                return;
            }
            void loadWorkspaces(domainId);
        },
        [expandedDomains, listSource, loadWorkspaces, workspaceDetails]
    );

    const domainTableRows = useMemo(
        () => databases.map((d) => ({ ...d, id: d.domainId })),
        [databases]
    );

    const renderDomainCell = useCallback(
        ({ column, row }) => {
            switch (column.id) {
                case '_expand':
                    return (
                        <span className="kl-table-expand-chevron" aria-hidden>
                            <ChevronRight size={17} strokeWidth={1.75} />
                        </span>
                    );
                case 'domainName':
                case 'arangoDbName': {
                    const value = row[column.id];
                    return (
                        <span className={isTableCellBlank(value) ? 'kl-table-cell-blank' : undefined}>
                            {formatTableCellText(value)}
                        </span>
                    );
                }
                case 'objectNodeCount':
                case 'relationNodeCount':
                case 'edgeCount':
                case 'rdbWorkspaceCount':
                case 'arangoWorkspaceCount':
                    return fmtCount(row[column.id]);
                case 'orphanWorkspaceCount': {
                    const nOrphan = Number(row.orphanWorkspaceCount) || 0;
                    if (nOrphan > 0) {
                        return <span className="kl-table-badge-count kl-table-badge-count--bad">{nOrphan}</span>;
                    }
                    return <span className="kl-table-badge-count kl-table-badge-count--zero">0</span>;
                }
                case 'dbExists': {
                    const { label, tone } = getArangoDbExistsBadgeProps(row.dbExists);
                    return (
                        <KlBadge tone={tone} variant="compact">
                            {label}
                        </KlBadge>
                    );
                }
                default:
                    return undefined;
            }
        },
        []
    );

    const renderWorkspaceCell = useCallback(({ column, row }) => {
        switch (column.id) {
            case 'workspaceId': {
                const workspaceId = row.workspaceId;
                return (
                    <span
                        className={
                            isTableCellBlank(workspaceId)
                                ? 'kl-table-cell-blank'
                                : 'kl-table-nested-mono'
                        }
                    >
                        {isTableCellBlank(workspaceId) ? formatTableCellText(workspaceId) : String(workspaceId)}
                    </span>
                );
            }
            case 'workspaceName': {
                const workspaceName = row.workspaceName;
                return (
                    <span
                        className={[
                            'kl-table-nested-name',
                            row.isOrphan ? 'kl-table-nested-danger' : '',
                            isTableCellBlank(workspaceName) ? 'kl-table-cell-blank' : '',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                        title={!isTableCellBlank(workspaceName) ? String(workspaceName) : undefined}
                    >
                        {formatTableCellText(workspaceName)}
                    </span>
                );
            }
            case 'createdBy': {
                const createdBy = row.createdBy;
                return (
                    <span
                        className={
                            isTableCellBlank(createdBy)
                                ? 'kl-table-cell-blank'
                                : 'kl-table-nested-mono'
                        }
                        title={!isTableCellBlank(createdBy) ? String(createdBy) : undefined}
                    >
                        {formatTableCellText(createdBy)}
                    </span>
                );
            }
            case 'objectNodeCount':
            case 'relationNodeCount':
            case 'edgeCount':
            case 'arangoDocumentCount':
            case 'rdbDocumentCount':
                return <span className="kl-table-nested-num">{fmtCount(row[column.id])}</span>;
            case '_status': {
                const { label, tone } = getArangoWorkspaceStatusBadgeProps(row.isOrphan);
                return (
                    <KlBadge tone={tone} variant="inline">
                        {label}
                    </KlBadge>
                );
            }
            default:
                return undefined;
        }
    }, []);

    const domainRowClassName = useCallback(
        (row) => [
            'kl-table-expand-row',
            expandedDomains.has(row.domainId) ? 'is-open' : '',
        ].filter(Boolean).join(' '),
        [expandedDomains]
    );

    const domainRowAriaLabel = useCallback((row) => {
        const name = row.domainName || '도메인';
        return `${name}, 워크스페이스 상세 ${expandedDomains.has(row.domainId) ? '접기' : '펼치기'}`;
    }, [expandedDomains]);

    const renderRowDetail = useCallback(
        ({ row }) => {
            if (!expandedDomains.has(row.domainId)) return null;
            const domainId = row.domainId;
            const isLoading = Boolean(loadingDetails[domainId]);
            const list = workspaceDetails[domainId] ?? [];
            const rows = list.map((ws) => ({ ...ws, id: ws.workspaceId }));

            return (
                <BasicTableRowDetail
                    loading={isLoading}
                    loadingMessage="워크스페이스 상세 정보를 불러오는 중..."
                >
                    <BasicTable
                        className="kl-basic-table--nested"
                        columns={workspaceTableColumns}
                        data={rows}
                        renderCell={renderWorkspaceCell}
                        onColumnResizeMouseDown={workspaceColumnStartResize}
                        emptyState={{
                            variant: 'default',
                            message: '워크스페이스 데이터가 없습니다.',
                        }}
                    />
                </BasicTableRowDetail>
            );
        },
        [
            expandedDomains,
            loadingDetails,
            workspaceDetails,
            workspaceTableColumns,
            renderWorkspaceCell,
            workspaceColumnStartResize,
        ]
    );

    return (
        <div className="kl-page">
            <div className="kl-main-sticky-head">
                <AdminPageHeader
                    title="ArangoDB 관리"
                />
            </div>

            <div className="table-area">
                <div className="table-toolbar">
                    <div className="toolbar-left">
                        <span className="kl-table-toolbar-summary">
                            총 <strong>{databases.length}</strong>건
                        </span>
                    </div>
                    <div className="toolbar-right">
                        <KlIconButton
                            tooltip="새로고침"
                            ariaLabel="ArangoDB 목록 새로고침"
                            onClick={handleRefresh}
                            buttonClassName="kl-btn gray-outline md icon-only"
                            stopPropagation={false}
                        >
                            <RotateCcw size={16} aria-hidden />
                        </KlIconButton>
                    </div>
                </div>

                <div className="basic-table-shell basic-table-shell--expandable">
                    <BasicTable
                        columns={domainTableColumns}
                        data={loading ? [] : domainTableRows}
                        renderCell={renderDomainCell}
                        renderRowDetail={renderRowDetail}
                        onRowClick={handleDomainRowClick}
                        getRowClassName={domainRowClassName}
                        rowAriaLabel={domainRowAriaLabel}
                        onColumnResizeMouseDown={domainColumnStartResize}
                        emptyState={listTableEmptyState({
                            loading,
                            loadError: null,
                            loadingMessage: '데이터를 불러오는 중...',
                            emptyVariant: 'default',
                        })}
                    />
                </div>
            </div>
        </div>
    );
}

export default AdminArangoManagement;

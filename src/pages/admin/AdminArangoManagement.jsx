import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { adminArangoApi } from '../../services/api';
import { useDialog } from '../../hooks/useDialog';
import { useBasicTableColumnResize } from '../../hooks/useBasicTableColumnResize';
import { RotateCcw, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import BasicTable from '../../components/common/BasicTable';
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
    const [expandedDomain, setExpandedDomain] = useState(null);
    const [workspaceDetails, setWorkspaceDetails] = useState({});
    const [loadingDetails, setLoadingDetails] = useState({});
    const { alert } = useDialog();

    const domainTableColumnDefinitions = useMemo(
        () => [
            { id: '_expand', label: '', defaultWidthPx: 44, minWidthPx: 40, align: 'center', ellipsis: false },
            { id: 'domainName', label: '도메인', defaultWidthPx: 168, minWidthPx: 120, align: 'left' },
            { id: 'arangoDbName', label: 'DB명', defaultWidthPx: 160, minWidthPx: 120, align: 'left' },
            { id: 'objectNodeCount', label: 'Objects', defaultWidthPx: 100, minWidthPx: 88, align: 'center' },
            { id: 'relationNodeCount', label: 'Relations', defaultWidthPx: 100, minWidthPx: 88, align: 'center' },
            { id: 'edgeCount', label: 'Edges', defaultWidthPx: 88, minWidthPx: 80, align: 'center' },
            { id: 'rdbWorkspaceCount', label: 'WS(RDB)', defaultWidthPx: 88, minWidthPx: 80, align: 'center' },
            { id: 'arangoWorkspaceCount', label: 'WS(Arango)', defaultWidthPx: 104, minWidthPx: 92, align: 'center' },
            { id: 'orphanWorkspaceCount', label: '고아', defaultWidthPx: 72, minWidthPx: 64, align: 'center' },
            { id: 'dbExists', label: 'DB상태', defaultWidthPx: 88, minWidthPx: 80, align: 'center', ellipsis: false },
        ],
        []
    );

    const workspaceTableColumnDefinitions = useMemo(
        () => [
            { id: 'workspaceId', label: 'WS ID', defaultWidthPx: 100, minWidthPx: 88, align: 'left' },
            { id: 'workspaceName', label: '워크스페이스명', defaultWidthPx: 200, minWidthPx: 140, align: 'left' },
            { id: 'createdBy', label: '소유자', defaultWidthPx: 160, minWidthPx: 120, align: 'left' },
            { id: 'objectNodeCount', label: 'Objects', defaultWidthPx: 88, minWidthPx: 80, align: 'center' },
            { id: 'relationNodeCount', label: 'Relations', defaultWidthPx: 88, minWidthPx: 80, align: 'center' },
            { id: 'edgeCount', label: 'Edges', defaultWidthPx: 80, minWidthPx: 72, align: 'center' },
            { id: 'arangoDocumentCount', label: '문서(Arango)', defaultWidthPx: 112, minWidthPx: 96, align: 'center' },
            { id: 'rdbDocumentCount', label: '문서(RDB)', defaultWidthPx: 104, minWidthPx: 88, align: 'center' },
            { id: '_status', label: '상태', defaultWidthPx: 88, minWidthPx: 80, align: 'center', ellipsis: false },
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
        setExpandedDomain(null);
        setWorkspaceDetails({});
        setLoadingDetails({});
        fetchDatabases();
    }, [fetchDatabases]);

    const handleDomainRowClick = useCallback(
        (_e, { row }) => {
            const domainId = row.domainId;
            if (expandedDomain === domainId) {
                setExpandedDomain(null);
                return;
            }
            setExpandedDomain(domainId);
            if (workspaceDetails[domainId] != null) {
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
        [expandedDomain, listSource, loadWorkspaces, workspaceDetails]
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
                        <span className="arango-mgmt-expand-cell" aria-hidden>
                            {expandedDomain === row.domainId ? (
                                <ChevronDown size={16} strokeWidth={1.75} />
                            ) : (
                                <ChevronRight size={16} strokeWidth={1.75} />
                            )}
                        </span>
                    );
                case 'domainName':
                    return <span className="arango-mgmt-domain-name">{row.domainName || '-'}</span>;
                case 'arangoDbName':
                    return <span className="arango-mgmt-mono">{row.arangoDbName || '-'}</span>;
                case 'objectNodeCount':
                case 'relationNodeCount':
                case 'edgeCount':
                case 'rdbWorkspaceCount':
                case 'arangoWorkspaceCount':
                    return <span className="arango-mgmt-num">{fmtCount(row[column.id])}</span>;
                case 'orphanWorkspaceCount': {
                    const nOrphan = Number(row.orphanWorkspaceCount) || 0;
                    if (nOrphan > 0) {
                        return <span className="arango-mgmt-badge arango-mgmt-badge--danger">{nOrphan}</span>;
                    }
                    return <span className="arango-mgmt-badge arango-mgmt-badge--muted">0</span>;
                }
                case 'dbExists':
                    return row.dbExists ? (
                        <span className="arango-mgmt-badge arango-mgmt-badge--ok">정상</span>
                    ) : (
                        <span className="arango-mgmt-badge arango-mgmt-badge--off">없음</span>
                    );
                default:
                    return undefined;
            }
        },
        [expandedDomain]
    );

    const renderWorkspaceCell = useCallback(({ column, row }) => {
        switch (column.id) {
            case 'workspaceId':
                return <span className="arango-mgmt-mono">{row.workspaceId ?? '-'}</span>;
            case 'workspaceName':
                return (
                    <span className={row.isOrphan ? 'arango-mgmt-ws-name arango-mgmt-ws-name--orphan' : 'arango-mgmt-ws-name'}>
                        {row.workspaceName || '-'}
                    </span>
                );
            case 'createdBy':
                return <span className="arango-mgmt-muted">{row.createdBy || '-'}</span>;
            case 'objectNodeCount':
            case 'relationNodeCount':
            case 'edgeCount':
            case 'arangoDocumentCount':
            case 'rdbDocumentCount':
                return <span className="arango-mgmt-num">{fmtCount(row[column.id])}</span>;
            case '_status':
                return row.isOrphan ? (
                    <span className="arango-mgmt-badge arango-mgmt-badge--danger">고아</span>
                ) : (
                    <span className="arango-mgmt-badge arango-mgmt-badge--ok">정상</span>
                );
            default:
                return undefined;
        }
    }, []);

    const domainRowClassName = useCallback(
        (row) => (expandedDomain === row.domainId ? 'arango-mgmt-row-expanded' : ''),
        [expandedDomain]
    );

    const domainRowAriaLabel = useCallback((row) => {
        const name = row.domainName || '도메인';
        return `${name}, 워크스페이스 상세 ${expandedDomain === row.domainId ? '접기' : '펼치기'}`;
    }, [expandedDomain]);

    const renderRowDetail = useCallback(
        ({ row }) => {
            if (expandedDomain !== row.domainId) return null;
            const domainId = row.domainId;
            if (loadingDetails[domainId]) {
                return (
                    <div className="arango-mgmt-row-detail-loading" role="status">
                        <Loader2 className="arango-mgmt-spin" size={18} aria-hidden />
                        <span>워크스페이스 상세 정보를 불러오는 중...</span>
                    </div>
                );
            }
            const list = workspaceDetails[domainId] ?? [];
            const rows = list.map((ws) => ({ ...ws, id: ws.workspaceId }));
            if (rows.length === 0) {
                return (
                    <div className="arango-mgmt-row-detail-empty" role="status">
                        워크스페이스 데이터가 없습니다.
                    </div>
                );
            }
            return (
                <div className="arango-mgmt-row-detail-inner basic-table-shell">
                    <BasicTable
                        className="arango-mgmt-detail-basic-table"
                        columns={workspaceTableColumns}
                        data={rows}
                        renderCell={renderWorkspaceCell}
                        onColumnResizeMouseDown={workspaceColumnStartResize}
                    />
                </div>
            );
        },
        [
            expandedDomain,
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
                    count={databases.length}
                    actions={(
                        <button
                            type="button"
                            onClick={handleRefresh}
                            className="admin-btn admin-btn-icon"
                            title="새로고침"
                            aria-label="ArangoDB 목록 새로고침"
                        >
                            <RotateCcw size={16} aria-hidden />
                        </button>
                    )}
                />
            </div>

            {loading ? (
                <div className="arango-mgmt-loading">데이터를 불러오는 중...</div>
            ) : (
                <div className="table-area">
                    <div className="basic-table-shell">
                        {databases.length === 0 ? (
                            <div className="arango-mgmt-empty--solo" role="status">
                                등록된 도메인이 없습니다.
                            </div>
                        ) : (
                            <BasicTable
                                className="arango-mgmt-basic-table"
                                columns={domainTableColumns}
                                data={domainTableRows}
                                renderCell={renderDomainCell}
                                renderRowDetail={renderRowDetail}
                                onRowClick={handleDomainRowClick}
                                getRowClassName={domainRowClassName}
                                rowAriaLabel={domainRowAriaLabel}
                                onColumnResizeMouseDown={domainColumnStartResize}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminArangoManagement;

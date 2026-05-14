import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { workspaceApi } from '../../services/api';
import { useDialog } from '../../hooks/useDialog';
import { useBasicTableColumnResize } from '../../hooks/useBasicTableColumnResize';
import { Search, RotateCcw, Share2, Trash2 } from 'lucide-react';
import ShareSettingsModal from '../../components/ShareSettingsModal';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import BasicTable from '../../components/common/BasicTable';
import KmPopover from '../../components/common/KmPopover';
import { mockAdminWorkspaces } from '../../data/workspaceMockData';
import './AdminWorkspaceManagement.css';

const isWorkspaceMockEnabled = import.meta.env.VITE_ENABLE_WORKSPACE_MOCK === 'true';

function formatWorkspaceDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR');
}

function workspacePromptTagDefs(ws) {
    return [
        { label: 'chunk', value: ws.chunkPrompt, tone: ws.chunkPrompt === 'NONE' ? 'danger' : 'violet' },
        { label: 'ontology', value: ws.ontologyPrompt, tone: 'blue' },
        { label: 'chat', value: ws.chatResultPrompt, tone: 'green' },
        { label: 'content', value: ws.contentOntologyPrompt, tone: 'purple' },
        { label: 'schema', value: ws.schemaAnalysisPrompt, tone: 'orange' },
        { label: 'interTable', value: ws.interTableAnalysisPrompt, tone: 'cyan' },
        { label: 'aqlGen', value: ws.aqlGenerationPrompt, tone: 'indigo' },
        { label: 'aqlInterp', value: ws.aqlInterpretationPrompt, tone: 'pink' },
    ];
}

function workspacePromptSummaryLine(ws) {
    const n = workspacePromptTagDefs(ws).length;
    return `프롬프트 ${n}종`;
}

function AdminWorkspaceManagement() {
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareWorkspace, setShareWorkspace] = useState(null);
    /** { anchorEl: Element, workspace: object } | null — 프롬프트 열 상세 Popover */
    const [promptPopover, setPromptPopover] = useState(null);
    /** API 실패 시 더미로 채우거나 `VITE_ENABLE_WORKSPACE_MOCK` 인 경우 — 삭제를 로컬 state로만 처리 */
    const [adminListSource, setAdminListSource] = useState('live');
    const { alert, confirm } = useDialog();

    const workspaceTableColumnDefinitions = useMemo(
        () => [
            { id: 'name', label: '워크스페이스명', defaultWidthPx: 245, minWidthPx: 140, align: 'left' },
            { id: 'domainName', label: '도메인', defaultWidthPx: 150, minWidthPx: 100, align: 'left' },
            { id: 'createdBy', label: '소유자', defaultWidthPx: 200, minWidthPx: 120, align: 'left' },
            { id: 'documentCount', label: '문서수', defaultWidthPx: 72, minWidthPx: 72, align: 'left' },
            { id: '_share', label: '공유', defaultWidthPx: 88, minWidthPx: 88, align: 'left', ellipsis: false },
            { id: '_prompts', label: '프롬프트', defaultWidthPx: 140, minWidthPx: 120, align: 'left', ellipsis: false },
            { id: '_created', label: '생성일', defaultWidthPx: 110, minWidthPx: 100, align: 'left' },
            {
                id: '_actions',
                label: <span className="workspace-mgmt-actions-head">관리</span>,
                defaultWidthPx: 120,
                minWidthPx: 120,
                align: 'right',
                ellipsis: false,
            },
        ],
        []
    );

    const { columns: workspaceTableColumns, startResize: workspaceColumnStartResize } = useBasicTableColumnResize({
        definitions: workspaceTableColumnDefinitions,
        storageKey: 'km-admin-workspace-mgmt-columns-v1',
        enabled: true,
    });

    const fetchWorkspaces = useCallback(async () => {
        try {
            setLoading(true);
            if (isWorkspaceMockEnabled) {
                setWorkspaces(mockAdminWorkspaces);
                setAdminListSource('mock');
                return;
            }
            const data = await workspaceApi.adminGetAll();
            setWorkspaces(data || []);
            setAdminListSource('live');
        } catch (error) {
            console.error('Failed to fetch workspaces:', error);
            setWorkspaces(mockAdminWorkspaces);
            setAdminListSource('mock');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWorkspaces();
    }, [fetchWorkspaces]);

    const handleOpenShareModal = useCallback((ws) => {
        setShareWorkspace(ws);
        setShareModalOpen(true);
    }, []);

    const handleShareSaved = useCallback(() => {
        fetchWorkspaces();
    }, [fetchWorkspaces]);

    const deleteUsesLocalState = isWorkspaceMockEnabled || adminListSource === 'mock';

    const handleDelete = useCallback(
        async (id, name) => {
            const confirmed = await confirm(`"${name}" 워크스페이스를 삭제하시겠습니까?\n관련된 모든 문서와 데이터가 삭제됩니다.`);
            if (!confirmed) {
                return;
            }
            if (deleteUsesLocalState) {
                setWorkspaces((prev) => prev.filter((w) => w.id !== id));
                await alert('워크스페이스가 삭제되었습니다.');
                return;
            }
            try {
                await workspaceApi.delete(id);
                await alert('워크스페이스가 삭제되었습니다.');
                fetchWorkspaces();
            } catch (error) {
                console.error('Failed to delete workspace:', error);
                await alert('워크스페이스 삭제에 실패했습니다.');
            }
        },
        [alert, confirm, deleteUsesLocalState, fetchWorkspaces]
    );

    const filteredWorkspaces = useMemo(() => {
        const searchLower = searchTerm.toLowerCase();
        return workspaces.filter(
            (ws) =>
                (ws.name && ws.name.toLowerCase().includes(searchLower)) ||
                (ws.domainName && ws.domainName.toLowerCase().includes(searchLower)) ||
                (ws.createdBy && ws.createdBy.toLowerCase().includes(searchLower)) ||
                (ws.ontologyPrompt && ws.ontologyPrompt.toLowerCase().includes(searchLower))
        );
    }, [workspaces, searchTerm]);

    const renderWorkspaceCell = useCallback(
        ({ column, row: ws }) => {
            switch (column.id) {
                case 'name':
                    return (
                        <div className="workspace-mgmt-name-cell">
                            <span className="workspace-mgmt-icon" aria-hidden>
                                {ws.icon || '📄'}
                            </span>
                            <span className="workspace-mgmt-name-text">{ws.name}</span>
                        </div>
                    );
                case 'domainName':
                    return <span className="workspace-mgmt-muted">{ws.domainName || '-'}</span>;
                case 'createdBy':
                    return <span className="workspace-mgmt-muted">{ws.createdBy || '-'}</span>;
                case 'documentCount':
                    return <span className="workspace-mgmt-muted">{ws.documentCount ?? 0}</span>;
                case '_share':
                    return (
                        <span className={`workspace-mgmt-share-badge share-${(ws.shareType || 'NONE').toLowerCase()}`}>
                            {ws.shareType === 'ALL' ? '전체' : ws.shareType === 'INDIVIDUAL' ? '개별' : 'OFF'}
                        </span>
                    );
                case '_prompts': {
                    const popoverOpen = Boolean(
                        promptPopover && promptPopover.workspace && promptPopover.workspace.id === ws.id
                    );
                    return (
                        <div className="workspace-mgmt-prompt-cell">
                            <button
                                type="button"
                                className="workspace-mgmt-prompt-trigger"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPromptPopover({ anchorEl: e.currentTarget, workspace: ws });
                                }}
                                aria-expanded={popoverOpen}
                                aria-haspopup="true"
                                aria-controls="workspace-mgmt-prompt-popover"
                                title="프롬프트 전체 보기"
                            >
                                <span className="workspace-mgmt-prompt-trigger-text">
                                    {workspacePromptSummaryLine(ws)}
                                </span>
                                <span className="workspace-mgmt-prompt-trigger-suffix" aria-hidden>
                                    보기
                                </span>
                            </button>
                        </div>
                    );
                }
                case '_created':
                    return <span className="workspace-mgmt-date-text">{formatWorkspaceDate(ws.createdAt)}</span>;
                case '_actions':
                    return (
                        <div className="workspace-mgmt-actions">
                            <button
                                type="button"
                                onClick={() => handleOpenShareModal(ws)}
                                title="공유 설정"
                                aria-label={`${ws.name} 공유 설정`}
                                className={`km-table-icon-btn km-table-icon-btn--neutral ${ws.shareType !== 'NONE' ? 'workspace-mgmt-share-btn--active' : ''}`}
                            >
                                <Share2 strokeWidth={1.75} size={16} aria-hidden />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDelete(ws.id, ws.name)}
                                title="삭제"
                                aria-label={`${ws.name} 삭제`}
                                className="km-table-icon-btn km-table-icon-btn--danger"
                            >
                                <Trash2 strokeWidth={1.75} size={16} aria-hidden />
                            </button>
                        </div>
                    );
                default:
                    return undefined;
            }
        },
        [handleDelete, handleOpenShareModal, promptPopover]
    );

    return (
        <div className="workspace-mgmt-page">
            <div className="km-main-sticky-head">
                <AdminPageHeader
                    title="워크스페이스 관리"
                    count={filteredWorkspaces.length}
                    actions={(
                        <button
                            type="button"
                            onClick={fetchWorkspaces}
                            className="workspace-mgmt-btn workspace-mgmt-btn--icon"
                            title="새로고침"
                            aria-label="워크스페이스 목록 새로고침"
                        >
                            <RotateCcw size={16} aria-hidden />
                        </button>
                    )}
                />

                <div className="workspace-mgmt-toolbar">
                    <div className="workspace-mgmt-toolbar-left">
                        <div className="workspace-mgmt-search">
                            <Search size={18} className="workspace-mgmt-search-icon" aria-hidden />
                            <input
                                type="text"
                                className="workspace-mgmt-search-input"
                                placeholder="워크스페이스명, 도메인, 소유자 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                aria-label="워크스페이스 검색"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="workspace-mgmt-loading">
                    데이터를 불러오는 중...
                </div>
            ) : (
                <div className="workspace-mgmt-table-card">
                    <div className="workspace-mgmt-table-shell basic-table-shell">
                        {filteredWorkspaces.length === 0 ? (
                            <div className="workspace-mgmt-empty workspace-mgmt-empty--solo" role="status">
                                {searchTerm ? '검색 결과가 없습니다.' : '워크스페이스가 없습니다.'}
                            </div>
                        ) : (
                            <BasicTable
                                className="workspace-mgmt-basic-table"
                                columns={workspaceTableColumns}
                                data={filteredWorkspaces}
                                renderCell={renderWorkspaceCell}
                                onColumnResizeMouseDown={workspaceColumnStartResize}
                            />
                        )}
                    </div>
                </div>
            )}
            {shareModalOpen && shareWorkspace && (
                <ShareSettingsModal
                    workspace={shareWorkspace}
                    onClose={() => {
                        setShareModalOpen(false);
                        setShareWorkspace(null);
                    }}
                    onSaved={handleShareSaved}
                />
            )}

            <KmPopover
                id="workspace-mgmt-prompt-popover"
                open={Boolean(promptPopover)}
                anchorEl={promptPopover?.anchorEl ?? null}
                onClose={() => setPromptPopover(null)}
            >
                {promptPopover ? (
                    <div className="workspace-mgmt-prompt-popover-inner">
                        <div className="prompt-tag-grid">
                            {workspacePromptTagDefs(promptPopover.workspace).map(({ label, value, tone }) => (
                                <span
                                    key={label}
                                    className={`prompt-tag ${value ? 'prompt-tag--active' : ''}`}
                                    data-active={Boolean(value)}
                                    data-tone={value ? tone : ''}
                                >
                                    <span className="prompt-tag__label">{label}</span>
                                    <span className="prompt-tag__value">{value || '기본값'}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                ) : null}
            </KmPopover>
        </div>
    );
}

export default AdminWorkspaceManagement;

import React, { useState, useEffect } from 'react';
import { workspaceApi } from '../../services/api';
import { useDialog } from '../../hooks/useDialog';
import { useResizableColumns } from '../../hooks/useResizableColumns';
import { Search, RotateCcw, Share2, Trash2 } from 'lucide-react';
import ShareSettingsModal from '../../components/ShareSettingsModal';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { mockAdminWorkspaces } from '../../data/workspaceMockData';
import './admin-common.css';
import './AdminWorkspaceManagement.css';

const isWorkspaceMockEnabled = import.meta.env.VITE_ENABLE_WORKSPACE_MOCK === 'true';

/** 워크스페이스 관리 표 열(px) — 이름, 도메인, 소유자, 문서수, 공유, 프롬프트, 생성일, 관리 */
const WORKSPACE_TABLE_RESIZE_DEFAULTS_PX = [170, 110, 130, 72, 88, 290, 110, 120];
const WORKSPACE_TABLE_RESIZE_MINS_PX = [160, 100, 120, 72, 88, 200, 104, 120];

function AdminWorkspaceManagement() {
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareWorkspace, setShareWorkspace] = useState(null);
    /** API 실패 시 더미로 채우거나 `VITE_ENABLE_WORKSPACE_MOCK` 인 경우 — 삭제를 로컬 state로만 처리 */
    const [adminListSource, setAdminListSource] = useState('live');
    const { alert, confirm } = useDialog();

    const columnResize = useResizableColumns({
        defaultWidthsPx: WORKSPACE_TABLE_RESIZE_DEFAULTS_PX,
        minWidthsPx: WORKSPACE_TABLE_RESIZE_MINS_PX,
        storageKey: 'km-admin-workspace-mgmt-columns-v1',
        enabled: true,
    });

    const fetchWorkspaces = async () => {
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
    };

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const handleOpenShareModal = (ws) => {
        setShareWorkspace(ws);
        setShareModalOpen(true);
    };

    const handleShareSaved = () => {
        fetchWorkspaces();
    };

    const deleteUsesLocalState = isWorkspaceMockEnabled || adminListSource === 'mock';

    const handleDelete = async (id, name) => {
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
    };

    const filteredWorkspaces = workspaces.filter((ws) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (ws.name && ws.name.toLowerCase().includes(searchLower)) ||
            (ws.domainName && ws.domainName.toLowerCase().includes(searchLower)) ||
            (ws.createdBy && ws.createdBy.toLowerCase().includes(searchLower)) ||
            (ws.ontologyPrompt && ws.ontologyPrompt.toLowerCase().includes(searchLower))
        );
    });

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ko-KR');
    };

    const promptTagDefs = (ws) => [
        { label: 'chunk', value: ws.chunkPrompt, tone: ws.chunkPrompt === 'NONE' ? 'danger' : 'violet' },
        { label: 'ontology', value: ws.ontologyPrompt, tone: 'blue' },
        { label: 'chat', value: ws.chatResultPrompt, tone: 'green' },
        { label: 'content', value: ws.contentOntologyPrompt, tone: 'purple' },
        { label: 'schema', value: ws.schemaAnalysisPrompt, tone: 'orange' },
        { label: 'interTable', value: ws.interTableAnalysisPrompt, tone: 'cyan' },
        { label: 'aqlGen', value: ws.aqlGenerationPrompt, tone: 'indigo' },
        { label: 'aqlInterp', value: ws.aqlInterpretationPrompt, tone: 'pink' },
    ];

    return (
        <div className="admin-page">
            <div className="km-main-sticky-head">
            <AdminPageHeader
                title="워크스페이스 관리"
                count={filteredWorkspaces.length}
                actions={(
                    <button
                        type="button"
                        onClick={fetchWorkspaces}
                        className="admin-btn admin-btn-icon"
                        title="새로고침"
                        aria-label="워크스페이스 목록 새로고침"
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
                <div className="admin-table-card workspace-mgmt-table-card">
                    <div className="admin-table-wrap">
                        <table className="admin-table workspace-mgmt-table workspace-mgmt-table--resizable">
                            {columnResize.colGroup}
                            <thead>
                                <tr>
                                    <th scope="col" className="workspace-mgmt-th-name km-th-col-resizable">
                                        워크스페이스명
                                        <span
                                            className="km-col-resize-handle"
                                            onMouseDown={(e) => columnResize.startResize(0, e)}
                                            onClick={(e) => e.stopPropagation()}
                                            aria-hidden
                                        />
                                    </th>
                                    <th scope="col" className="workspace-mgmt-th-domain km-th-col-resizable">
                                        도메인
                                        <span
                                            className="km-col-resize-handle"
                                            onMouseDown={(e) => columnResize.startResize(1, e)}
                                            onClick={(e) => e.stopPropagation()}
                                            aria-hidden
                                        />
                                    </th>
                                    <th scope="col" className="workspace-mgmt-th-owner km-th-col-resizable">
                                        소유자
                                        <span
                                            className="km-col-resize-handle"
                                            onMouseDown={(e) => columnResize.startResize(2, e)}
                                            onClick={(e) => e.stopPropagation()}
                                            aria-hidden
                                        />
                                    </th>
                                    <th scope="col" className="workspace-mgmt-th-docs km-th-col-resizable">
                                        문서수
                                        <span
                                            className="km-col-resize-handle"
                                            onMouseDown={(e) => columnResize.startResize(3, e)}
                                            onClick={(e) => e.stopPropagation()}
                                            aria-hidden
                                        />
                                    </th>
                                    <th scope="col" className="workspace-mgmt-th-share km-th-col-resizable">
                                        공유
                                        <span
                                            className="km-col-resize-handle"
                                            onMouseDown={(e) => columnResize.startResize(4, e)}
                                            onClick={(e) => e.stopPropagation()}
                                            aria-hidden
                                        />
                                    </th>
                                    <th scope="col" className="workspace-mgmt-th-prompt km-th-col-resizable">
                                        프롬프트
                                        <span
                                            className="km-col-resize-handle"
                                            onMouseDown={(e) => columnResize.startResize(5, e)}
                                            onClick={(e) => e.stopPropagation()}
                                            aria-hidden
                                        />
                                    </th>
                                    <th scope="col" className="workspace-mgmt-th-created km-th-col-resizable">
                                        생성일
                                        <span
                                            className="km-col-resize-handle"
                                            onMouseDown={(e) => columnResize.startResize(6, e)}
                                            onClick={(e) => e.stopPropagation()}
                                            aria-hidden
                                        />
                                    </th>
                                    <th scope="col" className="workspace-mgmt-th-actions">
                                        <span className="workspace-mgmt-actions-head">관리</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredWorkspaces.length > 0 ? (
                                    filteredWorkspaces.map((ws) => (
                                        <tr key={ws.id}>
                                            <td className="workspace-mgmt-td-name">
                                                <div className="workspace-mgmt-name-cell">
                                                    <span className="workspace-mgmt-icon" aria-hidden>{ws.icon || '📄'}</span>
                                                    <span className="workspace-mgmt-name-text">{ws.name}</span>
                                                </div>
                                            </td>
                                            <td className="workspace-mgmt-td-domain workspace-mgmt-muted">{ws.domainName || '-'}</td>
                                            <td className="workspace-mgmt-td-owner workspace-mgmt-muted">{ws.createdBy || '-'}</td>
                                            <td className="workspace-mgmt-td-docs workspace-mgmt-muted">{ws.documentCount ?? 0}</td>
                                            <td className="workspace-mgmt-td-share">
                                                <span className={`workspace-mgmt-share-badge share-${(ws.shareType || 'NONE').toLowerCase()}`}>
                                                    {ws.shareType === 'ALL' ? '전체' : ws.shareType === 'INDIVIDUAL' ? '개별' : 'OFF'}
                                                </span>
                                            </td>
                                            <td className="workspace-mgmt-td-prompt">
                                                <div className="prompt-tag-grid">
                                                    {promptTagDefs(ws).map(({ label, value, tone }) => (
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
                                            </td>
                                            <td className="workspace-mgmt-td-created admin-col-date">{formatDate(ws.createdAt)}</td>
                                            <td className="workspace-mgmt-td-actions">
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
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr className="workspace-mgmt-tr-empty">
                                        <td colSpan={8} className="workspace-mgmt-empty">
                                            {searchTerm ? '검색 결과가 없습니다.' : '워크스페이스가 없습니다.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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
        </div>
    );
}

export default AdminWorkspaceManagement;

import React, { useState, useEffect } from 'react';
import { workspaceApi } from '../../services/api';
import { useDialog } from '../../hooks/useDialog';
import { Search, RotateCcw, Share2, Trash2 } from 'lucide-react';
import ShareSettingsModal from '../../components/ShareSettingsModal';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import './admin-common.css';
import './AdminWorkspaceManagement.css';

function AdminWorkspaceManagement() {
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareWorkspace, setShareWorkspace] = useState(null);
    const { alert, confirm } = useDialog();

    const fetchWorkspaces = async () => {
        try {
            setLoading(true);
            const data = await workspaceApi.adminGetAll();
            setWorkspaces(data || []);
        } catch (error) {
            console.error('Failed to fetch workspaces:', error);
            await alert('워크스페이스 목록을 불러오는데 실패했습니다.');
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

    const handleDelete = async (id, name) => {
        const confirmed = await confirm(`"${name}" 워크스페이스를 삭제하시겠습니까?\n관련된 모든 문서와 데이터가 삭제됩니다.`);
        if (!confirmed) {
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

    const filteredWorkspaces = workspaces.filter(ws => {
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
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="admin-page">
            <AdminPageHeader
                title="워크스페이스 관리"
                count={filteredWorkspaces.length}
                actions={(
                    <button onClick={fetchWorkspaces} className="admin-btn admin-btn-icon" title="새로고침">
                        <RotateCcw size={16} />
                    </button>
                )}
            />

            {/* Search Filter */}
            <div className="admin-toolbar">
                <div className="admin-toolbar-left">
                    <div className="admin-search">
                        <Search size={18} className="admin-search-icon" />
                        <input
                            type="text"
                            className="admin-search-input"
                            placeholder="워크스페이스명, 도메인, 소유자 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="admin-workspace-loading">
                    데이터를 불러오는 중...
                </div>
            ) : (
                <div className="table-container admin-workspace-table-wrap">
                    <table className="admin-workspace-table">
                        <thead>
                            <tr className="admin-workspace-header-row">
                                <th className="admin-workspace-th">워크스페이스명</th>
                                <th className="admin-workspace-th">도메인</th>
                                <th className="admin-workspace-th">소유자</th>
                                <th className="admin-workspace-th admin-workspace-th-center">문서수</th>
                                <th className="admin-workspace-th admin-workspace-th-center">공유</th>
                                <th className="admin-workspace-th">프롬프트</th>
                                <th className="admin-workspace-th">생성일</th>
                                <th className="admin-workspace-th admin-workspace-th-center">액션</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWorkspaces.length > 0 ? (
                                filteredWorkspaces.map(ws => (
                                    <tr key={ws.id} className="admin-workspace-row">
                                        <td className="admin-workspace-td admin-workspace-name-cell">
                                            <span className="admin-workspace-icon">{ws.icon || '📄'}</span>
                                            {ws.name}
                                        </td>
                                        <td className="admin-workspace-td admin-workspace-muted">{ws.domainName || '-'}</td>
                                        <td className="admin-workspace-td admin-workspace-muted">{ws.createdBy || '-'}</td>
                                        <td className="admin-workspace-td admin-workspace-center admin-workspace-muted">{ws.documentCount ?? 0}</td>
                                        <td className="admin-workspace-td admin-workspace-center">
                                            <span className={`admin-workspace-share-badge share-${(ws.shareType || 'NONE').toLowerCase()}`}>
                                                {ws.shareType === 'ALL' ? '전체' : ws.shareType === 'INDIVIDUAL' ? '개별' : 'OFF'}
                                            </span>
                                        </td>
                                        <td className="admin-workspace-td">
                                            <div className="prompt-tag-grid">
                                                {[
                                                    { label: 'chunk', value: ws.chunkPrompt, tone: ws.chunkPrompt === 'NONE' ? 'danger' : 'violet' },
                                                    { label: 'ontology', value: ws.ontologyPrompt, tone: 'blue' },
                                                    { label: 'chat', value: ws.chatResultPrompt, tone: 'green' },
                                                    { label: 'content', value: ws.contentOntologyPrompt, tone: 'purple' },
                                                    { label: 'schema', value: ws.schemaAnalysisPrompt, tone: 'orange' },
                                                    { label: 'interTable', value: ws.interTableAnalysisPrompt, tone: 'cyan' },
                                                    { label: 'aqlGen', value: ws.aqlGenerationPrompt, tone: 'indigo' },
                                                    { label: 'aqlInterp', value: ws.aqlInterpretationPrompt, tone: 'pink' },
                                                ].map(({ label, value, tone }) => (
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
                                        <td className="admin-workspace-td admin-workspace-muted admin-workspace-date">{formatDate(ws.createdAt)}</td>
                                        <td className="admin-workspace-td admin-workspace-center">
                                            <div className="admin-workspace-action-group">
                                                <button
                                                    onClick={() => handleOpenShareModal(ws)}
                                                    title="공유 설정"
                                                    className={`admin-workspace-icon-btn ${ws.shareType !== 'NONE' ? 'is-shared' : ''}`}
                                                >
                                                    <Share2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(ws.id, ws.name)}
                                                    title="삭제"
                                                    className="admin-workspace-icon-btn is-danger"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="admin-workspace-empty">
                                        {searchTerm ? '검색 결과가 없습니다.' : '워크스페이스가 없습니다.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            {/* Share Settings Modal */}
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

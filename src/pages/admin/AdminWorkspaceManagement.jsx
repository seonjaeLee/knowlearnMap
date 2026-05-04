import React, { useState, useEffect } from 'react';
import { workspaceApi } from '../../services/api';
import { useAlert } from '../../context/AlertContext';
import { Search, RotateCcw, Share2, Trash2 } from 'lucide-react';
import ShareSettingsModal from '../../components/ShareSettingsModal';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import './admin-common.css';

function AdminWorkspaceManagement() {
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareWorkspace, setShareWorkspace] = useState(null);
    const { showAlert, showConfirm } = useAlert();

    const fetchWorkspaces = async () => {
        try {
            setLoading(true);
            const data = await workspaceApi.adminGetAll();
            setWorkspaces(data || []);
        } catch (error) {
            console.error('Failed to fetch workspaces:', error);
            showAlert('워크스페이스 목록을 불러오는데 실패했습니다.', 'error');
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
        const confirmed = await showConfirm(`"${name}" 워크스페이스를 삭제하시겠습니까?\n관련된 모든 문서와 데이터가 삭제됩니다.`);
        if (!confirmed) {
            return;
        }
        try {
            await workspaceApi.delete(id);
            showAlert('워크스페이스가 삭제되었습니다.', 'success');
            fetchWorkspaces();
        } catch (error) {
            console.error('Failed to delete workspace:', error);
            showAlert('워크스페이스 삭제에 실패했습니다.', 'error');
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
                <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                    데이터를 불러오는 중...
                </div>
            ) : (
                <div className="table-container" style={{ overflowX: 'auto', background: 'white', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                    <table style={{ width: '100%', minWidth: '1200px', borderCollapse: 'collapse', fontSize: 'var(--admin-font-md)' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e0e0e0', textAlign: 'left' }}>
                                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#555' }}>워크스페이스명</th>
                                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#555' }}>도메인</th>
                                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#555' }}>소유자</th>
                                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#555', textAlign: 'center' }}>문서수</th>
                                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#555', textAlign: 'center' }}>공유</th>
                                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#555' }}>프롬프트</th>
                                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#555' }}>생성일</th>
                                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#555', textAlign: 'center' }}>액션</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWorkspaces.length > 0 ? (
                                filteredWorkspaces.map(ws => (
                                    <tr key={ws.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '12px 16px', fontWeight: 500, color: '#333' }}>
                                            <span style={{ marginRight: '6px' }}>{ws.icon || '📄'}</span>
                                            {ws.name}
                                        </td>
                                        <td style={{ padding: '12px 16px', color: '#666' }}>{ws.domainName || '-'}</td>
                                        <td style={{ padding: '12px 16px', color: '#666' }}>{ws.createdBy || '-'}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center', color: '#666' }}>{ws.documentCount ?? 0}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                fontSize: 'var(--admin-font-sm)',
                                                backgroundColor: ws.shareType === 'ALL' ? '#e8f5e9' : ws.shareType === 'INDIVIDUAL' ? '#ede9fe' : '#f5f5f5',
                                                color: ws.shareType === 'ALL' ? '#2e7d32' : ws.shareType === 'INDIVIDUAL' ? '#7c3aed' : '#9e9e9e',
                                                fontWeight: 500
                                            }}>
                                                {ws.shareType === 'ALL' ? '전체' : ws.shareType === 'INDIVIDUAL' ? '개별' : 'OFF'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div className="prompt-tag-grid">
                                                {[
                                                    { label: 'chunk', value: ws.chunkPrompt, color: ws.chunkPrompt === 'NONE' ? '#dc2626' : '#7c3aed' },
                                                    { label: 'ontology', value: ws.ontologyPrompt, color: '#1e40af' },
                                                    { label: 'chat', value: ws.chatResultPrompt, color: '#047857' },
                                                    { label: 'content', value: ws.contentOntologyPrompt, color: '#9333ea' },
                                                    { label: 'schema', value: ws.schemaAnalysisPrompt, color: '#ea580c' },
                                                    { label: 'interTable', value: ws.interTableAnalysisPrompt, color: '#0891b2' },
                                                    { label: 'aqlGen', value: ws.aqlGenerationPrompt, color: '#4f46e5' },
                                                    { label: 'aqlInterp', value: ws.aqlInterpretationPrompt, color: '#be185d' },
                                                ].map(({ label, value, color }) => (
                                                    <span key={label} className={`prompt-tag ${value ? 'prompt-tag--active' : ''}`}
                                                        style={value ? { borderColor: color, color } : {}}>
                                                        <span className="prompt-tag__label">{label}</span>
                                                        <span className="prompt-tag__value">{value || '기본값'}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px', color: '#666', fontSize: 'var(--admin-font-base)' }}>{formatDate(ws.createdAt)}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                                <button
                                                    onClick={() => handleOpenShareModal(ws)}
                                                    title="공유 설정"
                                                    style={{
                                                        padding: '6px',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        background: ws.shareType !== 'NONE' ? '#e8f5e9' : 'white',
                                                        color: ws.shareType !== 'NONE' ? '#2e7d32' : '#666',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <Share2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(ws.id, ws.name)}
                                                    title="삭제"
                                                    style={{
                                                        padding: '6px',
                                                        border: '1px solid #ffcdd2',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        background: 'white',
                                                        color: '#e53935',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: '#888' }}>
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

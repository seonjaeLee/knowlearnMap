import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Edit2, Trash2, Share2, FileText, Check, Users, Globe, Loader2 } from 'lucide-react';
import { workspaceApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import ShareSettingsModal from '../components/ShareSettingsModal';
// CSS is imported globally or via MainLayout, but we keep Home specific tweaks if any
// import './Home.css';

function Home() {
    const [searchParams] = useSearchParams();
    const filter = searchParams.get('filter') || 'MY'; // URL에서 필터 읽기

    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('최신순');
    const [openMenuId, setOpenMenuId] = useState(null);
    const [notebooks, setNotebooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Rename Modal State
    const [renameModalOpen, setRenameModalOpen] = useState(false);
    const [renamingNotebook, setRenamingNotebook] = useState(null);
    const [newName, setNewName] = useState('');

    // Prompt Modal State
    const [promptModalOpen, setPromptModalOpen] = useState(false);
    const [promptNotebook, setPromptNotebook] = useState(null);
    const [chunkPromptValue, setChunkPromptValue] = useState('');
    const [ontologyPromptValue, setOntologyPromptValue] = useState('');
    const [chatResultPromptValue, setChatResultPromptValue] = useState('');
    const [contentOntologyPromptValue, setContentOntologyPromptValue] = useState('');
    const [schemaAnalysisPromptValue, setSchemaAnalysisPromptValue] = useState('');
    const [interTableAnalysisPromptValue, setInterTableAnalysisPromptValue] = useState('');
    const [aqlGenerationPromptValue, setAqlGenerationPromptValue] = useState('');
    const [aqlInterpretationPromptValue, setAqlInterpretationPromptValue] = useState('');
    const [aggregationStrategyPromptValue, setAggregationStrategyPromptValue] = useState('');
    // 용도별 프롬프트 코드 목록
    const [chunkPromptCodes, setChunkPromptCodes] = useState([]);
    const [ontologyPromptCodes, setOntologyPromptCodes] = useState([]);
    const [chatPromptCodes, setChatPromptCodes] = useState([]);
    const [contentOntologyPromptCodes, setContentOntologyPromptCodes] = useState([]);
    const [schemaAnalysisPromptCodes, setSchemaAnalysisPromptCodes] = useState([]);
    const [interTableAnalysisPromptCodes, setInterTableAnalysisPromptCodes] = useState([]);
    const [aqlGenerationPromptCodes, setAqlGenerationPromptCodes] = useState([]);
    const [aqlInterpretationPromptCodes, setAqlInterpretationPromptCodes] = useState([]);
    const [aggregationStrategyPromptCodes, setAggregationStrategyPromptCodes] = useState([]);

    // 삭제 로딩
    const [deletingId, setDeletingId] = useState(null);

    // Share Settings Modal State
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareNotebook, setShareNotebook] = useState(null);

    const menuRef = useRef(null);
    const navigate = useNavigate();
    const { isAdmin, isAuthenticated } = useAuth();
    const { showAlert, showConfirm } = useAlert();

    // 워크스페이스 목록 불러오기
    useEffect(() => {
        // Wait for auth check to complete (handled by route protection usually, but useAuth helps)
        if (!isAuthenticated) return;

        const fetchWorkspaces = async () => {
            try {
                setLoading(true);
                let params = { filter };

                if (isAdmin) {
                    const selectedDomainId = localStorage.getItem('admin_selected_domain_id');
                    if (selectedDomainId) {
                        params.domainId = selectedDomainId;
                    }
                }

                const data = await workspaceApi.getAll(params);
                setNotebooks(data || []);
                setError(null);
            } catch (err) {
                console.error('워크스페이스 로드 실패:', err);
                setError('워크스페이스를 불러올 수 없습니다.');
                setNotebooks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkspaces();
    }, [isAuthenticated, isAdmin, filter]); // filter는 URL에서 읽음

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null);
            }
        };

        if (openMenuId !== null) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [openMenuId]);

    const handleMenuToggle = (e, notebookId) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === notebookId ? null : notebookId);
    };

    const handleDelete = async (e, notebookId) => {
        e.stopPropagation();

        const confirmed = await showConfirm('정말 삭제하시겠습니까?');
        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(notebookId);
            setOpenMenuId(null);
            await workspaceApi.delete(notebookId);
            setNotebooks(prev => prev.filter(nb => nb.id !== notebookId));
        } catch (err) {
            console.error('삭제 실패:', err);
            showAlert('삭제에 실패했습니다.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleOpenShareModal = (e, notebookId) => {
        e.stopPropagation();
        const notebook = notebooks.find(nb => nb.id === notebookId);
        if (notebook) {
            setShareNotebook(notebook);
            setShareModalOpen(true);
        }
        setOpenMenuId(null);
    };

    const handleShareSaved = (updated) => {
        setNotebooks(prev => prev.map(nb =>
            nb.id === updated.id ? { ...nb, isShared: updated.isShared, shareType: updated.shareType } : nb
        ));
    };

    const fetchPromptCodesByPurpose = async () => {
        try {
            const purposes = ['CHUNK', 'ONTOLOGY', 'CHAT_RESULT', 'CONTENT_ONTOLOGY', 'SCHEMA_ANALYSIS', 'INTER_TABLE_ANALYSIS', 'AQL_GENERATION', 'AQL_INTERPRETATION', 'AGGREGATION_STRATEGY'];
            const results = await Promise.all(
                purposes.map(purpose =>
                    fetch(`/api/v1/prompts?purpose=${encodeURIComponent(purpose)}&isActive=true&size=100`, { credentials: 'include' })
                        .then(r => r.ok ? r.json() : { data: { content: [] } })
                )
            );
            const extractCodes = (res) => {
                const content = res?.data?.content || res?.content || [];
                return Array.isArray(content) ? content.map(p => p.code) : [];
            };
            setChunkPromptCodes(extractCodes(results[0]));
            setOntologyPromptCodes(extractCodes(results[1]));
            setChatPromptCodes(extractCodes(results[2]));
            setContentOntologyPromptCodes(extractCodes(results[3]));
            setSchemaAnalysisPromptCodes(extractCodes(results[4]));
            setInterTableAnalysisPromptCodes(extractCodes(results[5]));
            setAqlGenerationPromptCodes(extractCodes(results[6]));
            setAqlInterpretationPromptCodes(extractCodes(results[7]));
            setAggregationStrategyPromptCodes(extractCodes(results[8]));
        } catch (err) {
            console.error('프롬프트 코드 목록 조회 실패:', err);
        }
    };

    const handleOpenPromptModal = (e, notebookId) => {
        e.stopPropagation();
        const notebook = notebooks.find(nb => nb.id === notebookId);
        if (notebook) {
            setPromptNotebook(notebook);
            setChunkPromptValue(notebook.chunkPrompt || '');
            setOntologyPromptValue(notebook.ontologyPrompt || '');
            setChatResultPromptValue(notebook.chatResultPrompt || '');
            setContentOntologyPromptValue(notebook.contentOntologyPrompt || '');
            setSchemaAnalysisPromptValue(notebook.schemaAnalysisPrompt || '');
            setInterTableAnalysisPromptValue(notebook.interTableAnalysisPrompt || '');
            setAqlGenerationPromptValue(notebook.aqlGenerationPrompt || '');
            setAqlInterpretationPromptValue(notebook.aqlInterpretationPrompt || '');
            setAggregationStrategyPromptValue(notebook.aggregationStrategyPrompt || '');
            setPromptModalOpen(true);
            fetchPromptCodesByPurpose();
        }
        setOpenMenuId(null);
    };

    const handleSavePrompt = async () => {
        if (!promptNotebook) return;
        try {
            const updateData = {
                name: promptNotebook.name,
                chunkPrompt: chunkPromptValue.trim() || null,
                ontologyPrompt: ontologyPromptValue.trim() || null,
                chatResultPrompt: chatResultPromptValue.trim() || null,
                contentOntologyPrompt: contentOntologyPromptValue.trim() || null,
                schemaAnalysisPrompt: schemaAnalysisPromptValue.trim() || null,
                interTableAnalysisPrompt: interTableAnalysisPromptValue.trim() || null,
                aqlGenerationPrompt: aqlGenerationPromptValue.trim() || null,
                aqlInterpretationPrompt: aqlInterpretationPromptValue.trim() || null,
                aggregationStrategyPrompt: aggregationStrategyPromptValue.trim() || null,
            };
            const updated = await workspaceApi.update(promptNotebook.id, updateData);
            setNotebooks(prev => prev.map(nb =>
                nb.id === promptNotebook.id ? {
                    ...nb,
                    chunkPrompt: updated.chunkPrompt,
                    ontologyPrompt: updated.ontologyPrompt,
                    chatResultPrompt: updated.chatResultPrompt,
                    contentOntologyPrompt: updated.contentOntologyPrompt,
                    schemaAnalysisPrompt: updated.schemaAnalysisPrompt,
                    interTableAnalysisPrompt: updated.interTableAnalysisPrompt,
                    aqlGenerationPrompt: updated.aqlGenerationPrompt,
                    aqlInterpretationPrompt: updated.aqlInterpretationPrompt,
                    aggregationStrategyPrompt: updated.aggregationStrategyPrompt,
                    defaultChunkPrompt: updated.defaultChunkPrompt,
                    defaultOntologyPrompt: updated.defaultOntologyPrompt,
                    defaultChatResultPrompt: updated.defaultChatResultPrompt,
                    defaultContentOntologyPrompt: updated.defaultContentOntologyPrompt,
                    defaultSchemaAnalysisPrompt: updated.defaultSchemaAnalysisPrompt,
                    defaultInterTableAnalysisPrompt: updated.defaultInterTableAnalysisPrompt,
                    defaultAqlGenerationPrompt: updated.defaultAqlGenerationPrompt,
                    defaultAqlInterpretationPrompt: updated.defaultAqlInterpretationPrompt,
                    defaultAggregationStrategyPrompt: updated.defaultAggregationStrategyPrompt
                } : nb
            ));
            setPromptModalOpen(false);
            showAlert('프롬프트가 저장되었습니다.');
        } catch (err) {
            console.error('프롬프트 저장 실패:', err);
            showAlert('프롬프트 저장에 실패했습니다.');
        }
    };

    const handleRename = (e, notebookId) => {
        e.stopPropagation();
        const notebook = notebooks.find(nb => nb.id === notebookId);
        if (notebook) {
            setRenamingNotebook(notebook);
            setNewName(notebook.name || notebook.title || '');
            setRenameModalOpen(true);
        }
        setOpenMenuId(null);
    };

    const handleRenameSubmit = async () => {
        if (!newName.trim()) {
            showAlert('워크스페이스 이름을 입력해주세요.');
            return;
        }

        try {
            const updated = await workspaceApi.update(renamingNotebook.id, {
                ...renamingNotebook,
                name: newName.trim()
            });

            setNotebooks(prev => prev.map(nb =>
                nb.id === updated.id ? { ...nb, name: updated.name, title: updated.name } : nb
            ));

            setRenameModalOpen(false);
            setRenamingNotebook(null);
            setNewName('');
        } catch (err) {
            console.error('이름 변경 실패:', err);
            showAlert('이름 변경에 실패했습니다.');
        }
    };

    const handleCreateNew = async () => {
        try {
            let selectedDomainId = null;
            if (isAdmin) {
                selectedDomainId = localStorage.getItem('admin_selected_domain_id');
                if (!selectedDomainId) {
                    showAlert("도메인을 선택해야 합니다."); // Should be redirected already but safety check
                    return;
                }
            }

            const newWorkspace = {
                name: 'Untitled notebook',
                description: '',
                icon: '📄',
                color: 'yellow',
                domainId: selectedDomainId ? parseInt(selectedDomainId) : null,
                isShared: filter === 'ALL' && isAdmin ? true : false // If creating in "All" view as Admin, make it shared? Optional logic.
            };

            const created = await workspaceApi.create(newWorkspace);
            setNotebooks(prev => [created, ...prev]);
            navigate(`/notebook/${created.id}`, { state: { openAddSource: true } });
        } catch (err) {
            console.error('워크스페이스 생성 실패:', err);
            showAlert('워크스페이스 생성에 실패했습니다.');
        }
    };

    const handleNotebookClick = (id) => {
        navigate(`/notebook/${id}`);
    };

    return (
        <div className="home-container">
            <div className="toolbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h1 className="page-title">
                        {filter === 'ALL' ? '전체 워크스페이스' : '내 워크스페이스'}
                    </h1>
                </div>


                <div className="toolbar-actions">
                    <div className="view-toggle">
                        <button
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="그리드 보기"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <rect x="2" y="2" width="7" height="7" />
                                <rect x="11" y="2" width="7" height="7" />
                                <rect x="2" y="11" width="7" height="7" />
                                <rect x="11" y="11" width="7" height="7" />
                            </svg>
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            title="리스트 보기"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <rect x="2" y="3" width="16" height="2" />
                                <rect x="2" y="8" width="16" height="2" />
                                <rect x="2" y="13" width="16" height="2" />
                            </svg>
                        </button>
                    </div>

                    <select
                        className="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="최신순">최신순</option>
                        <option value="오래된순">오래된순</option>
                        <option value="이름순">이름순</option>
                    </select>

                    <button className="new-note-btn" onClick={handleCreateNew}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        새 워크스페이스
                    </button>
                </div>
            </div>

            {/* 로딩 상태 */}
            {loading && (
                <div style={{
                    padding: '60px', textAlign: 'center',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#999'
                }}>
                    <div style={{
                        width: '32px', height: '32px', border: '3px solid #e0e0e0',
                        borderTopColor: '#1a73e8', borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite', marginBottom: '12px'
                    }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <p style={{ fontSize: '14px', margin: 0 }}>워크스페이스를 불러오는 중...</p>
                </div>
            )}

            {/* 에러 상태 */}
            {error && (
                <div style={{ padding: '40px', textAlign: 'center', color: '#d32f2f' }}>
                    <p>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}
                    >
                        다시 시도
                    </button>
                </div>
            )}

            {/* Notebooks Grid */}
            {!loading && !error && (
                <div className={`notebooks-container ${viewMode}`}>
                    {/* Table Header (List View Only) */}
                    {viewMode === 'list' && (
                        <div className="table-header">
                            <div className="header-icon"></div>
                            <div className="header-title">제목</div>
                            <div className="header-source">소스</div>
                            <div className="header-date">생성일</div>
                            <div className="header-role">역할</div>
                            <div className="header-actions"></div>
                        </div>
                    )}

                    {/* Create New Card */}
                    <div className="notebook-card create-card" onClick={handleCreateNew}>
                        <div className="create-card-content">
                            <div className="create-icon">
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="24" cy="24" r="20" />
                                    <path d="M24 16v16M16 24h16" strokeLinecap="round" />
                                </svg>
                            </div>
                            <span className="create-text">새 워크스페이스 만들기</span>
                        </div>
                    </div>

                    {/* Notebook Cards */}
                    {notebooks.map((notebook) => (
                        <div
                            key={notebook.id}
                            className={`notebook-card ${notebook.color || 'yellow'}`}
                            onClick={() => handleNotebookClick(notebook.id)}
                            style={{ position: 'relative' }}
                        >
                            {/* 삭제 중 오버레이 */}
                            {deletingId === notebook.id && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0, left: 0, right: 0, bottom: 0,
                                    background: 'rgba(255, 255, 255, 0.85)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 10,
                                    borderRadius: 'inherit',
                                    gap: '8px'
                                }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: '#e53935' }} />
                                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#e53935' }}>삭제중...</span>
                                </div>
                            )}
                            <div className="card-header">
                                <div className="notebook-icon" style={{ position: 'relative' }}>
                                    {notebook.icon || '📄'}
                                </div>
                                {notebook.shareType === 'ALL' && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        background: 'linear-gradient(135deg, #1a73e8, #4285f4)',
                                        color: 'white',
                                        padding: '4px 10px',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        boxShadow: '0 2px 4px rgba(26, 115, 232, 0.3)'
                                    }}>
                                        <Globe size={12} />
                                        <span>전체 공유</span>
                                    </div>
                                )}
                                {notebook.shareType === 'INDIVIDUAL' && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        background: 'linear-gradient(135deg, #059669, #10b981)',
                                        color: 'white',
                                        padding: '4px 10px',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        boxShadow: '0 2px 4px rgba(5, 150, 105, 0.3)'
                                    }}>
                                        <Users size={12} />
                                        <span>개별 공유</span>
                                    </div>
                                )}

                                {viewMode === 'grid' && (
                                    // Only show menu if Owner
                                    (notebook.role === 'Owner') && (
                                        <div className="more-btn-container" ref={openMenuId === notebook.id ? menuRef : null}>
                                            <button
                                                className="more-btn"
                                                onClick={(e) => handleMenuToggle(e, notebook.id)}
                                            >
                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                                    <circle cx="10" cy="4" r="1.5" />
                                                    <circle cx="10" cy="10" r="1.5" />
                                                    <circle cx="10" cy="16" r="1.5" />
                                                </svg>
                                            </button>
                                            {openMenuId === notebook.id && (
                                                <div className="popup-menu">
                                                    <button
                                                        className="menu-item"
                                                        onClick={(e) => handleRename(e, notebook.id)}
                                                    >
                                                        <Edit2 size={14} />
                                                        <span>제목 수정</span>
                                                    </button>
                                                    <button
                                                        className="menu-item delete"
                                                        onClick={(e) => handleDelete(e, notebook.id)}
                                                    >
                                                        <Trash2 size={14} />
                                                        <span>삭제</span>
                                                    </button>
                                                    {isAdmin && (
                                                        <>
                                                            <button
                                                                className="menu-item"
                                                                onClick={(e) => handleOpenShareModal(e, notebook.id)}
                                                            >
                                                                <Share2 size={14} />
                                                                <span>공유 설정</span>
                                                            </button>
                                                            <button
                                                                className="menu-item"
                                                                onClick={(e) => handleOpenPromptModal(e, notebook.id)}
                                                            >
                                                                {(notebook.ontologyPrompt || notebook.chatResultPrompt || notebook.chunkPrompt)
                                                                    ? <Check size={14} style={{ color: '#137333' }} />
                                                                    : <FileText size={14} />}
                                                                <span>프롬프트 변경</span>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                )}
                            </div>
                            <div className="card-body">
                                {viewMode === 'list' && <div className="notebook-icon">{notebook.icon || '📄'}</div>}
                                <h3 className="notebook-title">{notebook.name || notebook.title || 'Untitled'}</h3>
                                <p className="notebook-source">소스 {notebook.documentCount || 0}개</p>
                                <p className="notebook-date">{notebook.date || '2025. 12. 28.'}</p>
                                <p className="notebook-role">{notebook.role || 'Owner'}</p>

                                {viewMode === 'list' && (
                                    <div className="more-btn-container" ref={openMenuId === notebook.id ? menuRef : null}>
                                        <button
                                            className="more-btn"
                                            onClick={(e) => handleMenuToggle(e, notebook.id)}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                                <circle cx="10" cy="4" r="1.5" />
                                                <circle cx="10" cy="10" r="1.5" />
                                                <circle cx="10" cy="16" r="1.5" />
                                            </svg>
                                        </button>
                                        {openMenuId === notebook.id && (
                                            <div className="popup-menu">
                                                <button
                                                    className="menu-item"
                                                    onClick={(e) => handleRename(e, notebook.id)}
                                                >
                                                    <Edit2 size={14} />
                                                    <span>제목 수정</span>
                                                </button>
                                                <button
                                                    className="menu-item delete"
                                                    onClick={(e) => handleDelete(e, notebook.id)}
                                                >
                                                    <Trash2 size={14} />
                                                    <span>삭제</span>
                                                </button>
                                                {isAdmin && (
                                                    <>
                                                        <button
                                                            className="menu-item"
                                                            onClick={(e) => handleOpenShareModal(e, notebook.id)}
                                                        >
                                                            <Share2 size={14} />
                                                            <span>공유 설정</span>
                                                        </button>
                                                        <button
                                                            className="menu-item"
                                                            onClick={(e) => handleOpenPromptModal(e, notebook.id)}
                                                        >
                                                            {(notebook.ontologyPrompt || notebook.chatResultPrompt || notebook.chunkPrompt)
                                                                ? <Check size={14} style={{ color: '#137333' }} />
                                                                : <FileText size={14} />}
                                                            <span>프롬프트 변경</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Rename Modal */}
            {renameModalOpen && (
                <div className="modal-overlay" onClick={() => setRenameModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-icon">
                            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                                <circle cx="32" cy="32" r="28" fill="#4a5568" />
                                <path d="M32 20v24M20 32h24" stroke="white" strokeWidth="4" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h2 className="modal-title">워크스페이스 이름 변경</h2>
                        <input
                            type="text"
                            className="modal-input"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleRenameSubmit();
                                }
                            }}
                            placeholder="워크스페이스 이름"
                            autoFocus
                        />
                        <div className="modal-buttons">
                            <button
                                className="modal-btn cancel-btn"
                                onClick={() => setRenameModalOpen(false)}
                            >
                                취소
                            </button>
                            <button
                                className="modal-btn confirm-btn"
                                onClick={handleRenameSubmit}
                            >
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Prompt Modal */}
            {promptModalOpen && (
                <div className="modal-overlay" onClick={() => setPromptModalOpen(false)}>
                    <div className="modal-content" style={{ width: '680px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title" style={{ textAlign: 'center' }}>프롬프트 변경</h2>
                        <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px', textAlign: 'center' }}>
                            워크스페이스: {promptNotebook?.name}
                        </p>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '12px 16px',
                            marginBottom: '12px'
                        }}>
                            <div style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                                    청킹 프롬프트
                                </label>
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <select
                                        className="modal-input"
                                        style={{ flex: 1, marginBottom: 0, ...(chunkPromptValue === 'NONE' ? { backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#dc2626', fontWeight: '600' } : {}) }}
                                        value={chunkPromptValue}
                                        onChange={(e) => setChunkPromptValue(e.target.value)}
                                    >
                                        <option value="">-- 기본값 --</option>
                                        {chunkPromptCodes.map(code => (
                                            <option key={code} value={code}>{code}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setChunkPromptValue(chunkPromptValue === 'NONE' ? '' : 'NONE')}
                                        style={{
                                            padding: '8px 12px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            border: '1px solid',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            ...(chunkPromptValue === 'NONE'
                                                ? { backgroundColor: '#dc2626', color: '#fff', borderColor: '#dc2626' }
                                                : { backgroundColor: '#fff', color: '#64748b', borderColor: '#cbd5e1' })
                                        }}
                                    >
                                        NONE
                                    </button>
                                </div>
                                <div style={{ fontSize: '11px', color: chunkPromptValue === 'NONE' ? '#dc2626' : '#94a3b8', marginTop: '4px' }}>
                                    {chunkPromptValue === 'NONE' ? 'LLM 청킹 비활성화' : 'LLM 청킹 프롬프트'}
                                </div>
                            </div>

                            <div style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                                    온톨로지 프롬프트
                                </label>
                                <select
                                    className="modal-input"
                                    value={ontologyPromptValue}
                                    onChange={(e) => setOntologyPromptValue(e.target.value)}
                                >
                                    <option value="">-- 기본값 --</option>
                                    {ontologyPromptCodes.map(code => (
                                        <option key={code} value={code}>{code}</option>
                                    ))}
                                </select>
                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                    Chunk → LLM 온톨로지 추출
                                </div>
                            </div>

                            <div style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                                    채팅 프롬프트
                                </label>
                                <select
                                    className="modal-input"
                                    value={chatResultPromptValue}
                                    onChange={(e) => setChatResultPromptValue(e.target.value)}
                                >
                                    <option value="">-- 기본값 --</option>
                                    {chatPromptCodes.map(code => (
                                        <option key={code} value={code}>{code}</option>
                                    ))}
                                </select>
                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                    Chat 응답 생성
                                </div>
                            </div>

                            <div style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                                    CONTENT 온톨로지
                                </label>
                                <select
                                    className="modal-input"
                                    value={contentOntologyPromptValue}
                                    onChange={(e) => setContentOntologyPromptValue(e.target.value)}
                                >
                                    <option value="">-- 기본값 --</option>
                                    {contentOntologyPromptCodes.map(code => (
                                        <option key={code} value={code}>{code}</option>
                                    ))}
                                </select>
                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                    정형 Chunk → LLM 온톨로지
                                </div>
                            </div>

                            <div style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                                    스키마 분석
                                </label>
                                <select
                                    className="modal-input"
                                    value={schemaAnalysisPromptValue}
                                    onChange={(e) => setSchemaAnalysisPromptValue(e.target.value)}
                                >
                                    <option value="">-- 기본값 --</option>
                                    {schemaAnalysisPromptCodes.map(code => (
                                        <option key={code} value={code}>{code}</option>
                                    ))}
                                </select>
                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                    CSV/DB 스키마 자동 분석
                                </div>
                            </div>

                            <div style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                                    테이블 간 관계 분석
                                </label>
                                <select
                                    className="modal-input"
                                    value={interTableAnalysisPromptValue}
                                    onChange={(e) => setInterTableAnalysisPromptValue(e.target.value)}
                                >
                                    <option value="">-- 기본값 --</option>
                                    {interTableAnalysisPromptCodes.map(code => (
                                        <option key={code} value={code}>{code}</option>
                                    ))}
                                </select>
                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                    다건 테이블 간 FK/관계 분석
                                </div>
                            </div>

                            <div style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                                    AQL 생성
                                </label>
                                <select
                                    className="modal-input"
                                    value={aqlGenerationPromptValue}
                                    onChange={(e) => setAqlGenerationPromptValue(e.target.value)}
                                >
                                    <option value="">-- 기본값 --</option>
                                    {aqlGenerationPromptCodes.map(code => (
                                        <option key={code} value={code}>{code}</option>
                                    ))}
                                </select>
                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                    자연어 → AQL 쿼리 생성
                                </div>
                            </div>

                            <div style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                                    AQL 결과 해석
                                </label>
                                <select
                                    className="modal-input"
                                    value={aqlInterpretationPromptValue}
                                    onChange={(e) => setAqlInterpretationPromptValue(e.target.value)}
                                >
                                    <option value="">-- 기본값 --</option>
                                    {aqlInterpretationPromptCodes.map(code => (
                                        <option key={code} value={code}>{code}</option>
                                    ))}
                                </select>
                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                    AQL 쿼리 결과 자연어 해석
                                </div>
                            </div>

                            <div style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                                    집계 전략
                                </label>
                                <select
                                    className="modal-input"
                                    value={aggregationStrategyPromptValue}
                                    onChange={(e) => setAggregationStrategyPromptValue(e.target.value)}
                                >
                                    <option value="">-- 기본값 --</option>
                                    {aggregationStrategyPromptCodes.map(code => (
                                        <option key={code} value={code}>{code}</option>
                                    ))}
                                </select>
                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                    대규모 정형 데이터 집계 전략
                                </div>
                            </div>
                        </div>

                        <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '16px', lineHeight: '1.5' }}>
                            * 기본값: 상위 레벨(도메인 → 시스템) 설정을 따름 &nbsp;|&nbsp; NONE: 명시적 비활성화
                        </div>
                        <div className="modal-buttons">
                            <button
                                className="modal-btn cancel-btn"
                                onClick={() => setPromptModalOpen(false)}
                            >
                                취소
                            </button>
                            <button
                                className="modal-btn cancel-btn"
                                onClick={() => {
                                    const defChunk = promptNotebook?.defaultChunkPrompt || '';
                                    const defOntology = promptNotebook?.defaultOntologyPrompt || '';
                                    const defChat = promptNotebook?.defaultChatResultPrompt || '';
                                    const defContent = promptNotebook?.defaultContentOntologyPrompt || '';
                                    const defSchema = promptNotebook?.defaultSchemaAnalysisPrompt || '';
                                    const defInterTable = promptNotebook?.defaultInterTableAnalysisPrompt || '';
                                    const defAqlGen = promptNotebook?.defaultAqlGenerationPrompt || '';
                                    const defAqlInterp = promptNotebook?.defaultAqlInterpretationPrompt || '';
                                    setChunkPromptValue('');
                                    setOntologyPromptValue('');
                                    setChatResultPromptValue('');
                                    setContentOntologyPromptValue('');
                                    setSchemaAnalysisPromptValue('');
                                    setInterTableAnalysisPromptValue('');
                                    setAqlGenerationPromptValue('');
                                    setAqlInterpretationPromptValue('');
                                    setTimeout(() => {
                                        setChunkPromptValue(defChunk);
                                        setOntologyPromptValue(defOntology);
                                        setChatResultPromptValue(defChat);
                                        setContentOntologyPromptValue(defContent);
                                        setSchemaAnalysisPromptValue(defSchema);
                                        setInterTableAnalysisPromptValue(defInterTable);
                                        setAqlGenerationPromptValue(defAqlGen);
                                        setAqlInterpretationPromptValue(defAqlInterp);
                                    }, 0);
                                    showAlert('기본값으로 초기화되었습니다.');
                                }}
                                style={{ color: '#dc2626' }}
                            >
                                기본값 초기화
                            </button>
                            <button
                                className="modal-btn confirm-btn"
                                onClick={handleSavePrompt}
                            >
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Share Settings Modal */}
            {shareModalOpen && shareNotebook && (
                <ShareSettingsModal
                    workspace={shareNotebook}
                    onClose={() => {
                        setShareModalOpen(false);
                        setShareNotebook(null);
                    }}
                    onSaved={handleShareSaved}
                />
            )}
        </div>
    );
}

export default Home;

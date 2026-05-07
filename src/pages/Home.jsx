import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Edit2, Trash2, Share2, FileText, Check, Users, Globe, Loader2 } from 'lucide-react';
import { Button, TextField } from '@mui/material';
import { workspaceApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { useDialog } from '../hooks/useDialog';
import ShareSettingsModal from '../components/ShareSettingsModal';
import PageHeader from '../components/common/PageHeader';
import BaseModal from '../components/common/modal/BaseModal';
import './Home.css';

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
    /** 스크롤 영역 하단에서 팝업이 잘리지 않도록 위로 열기 */
    const [workspaceMenuOpenUp, setWorkspaceMenuOpenUp] = useState(false);
    const navigate = useNavigate();
    const { isAdmin, isAuthenticated } = useAuth();
    const { showAlert } = useAlert();
    const { confirm, alert } = useDialog();

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

    useLayoutEffect(() => {
        if (openMenuId === null) {
            setWorkspaceMenuOpenUp(false);
            return;
        }

        const updatePlacement = () => {
            const root = menuRef.current;
            if (!root) return;
            const trigger = root.querySelector('.more-btn');
            const menuEl = root.querySelector('.popup-menu');
            if (!trigger || !menuEl) return;

            const scrollParent = root.closest('.main-content');
            const pr = (scrollParent || document.documentElement).getBoundingClientRect();
            const tr = trigger.getBoundingClientRect();
            const menuHeight = menuEl.offsetHeight;
            const gap = 8;
            const spaceBelow = pr.bottom - tr.bottom;
            const spaceAbove = tr.top - pr.top;

            let openUp = false;
            if (spaceBelow < menuHeight + gap) {
                openUp = spaceAbove >= menuHeight + gap || spaceAbove > spaceBelow;
            }
            setWorkspaceMenuOpenUp(openUp);
        };

        updatePlacement();
        requestAnimationFrame(updatePlacement);

        const root = menuRef.current;
        const scrollParent = root?.closest('.main-content');
        window.addEventListener('resize', updatePlacement);
        scrollParent?.addEventListener('scroll', updatePlacement, true);

        return () => {
            window.removeEventListener('resize', updatePlacement);
            scrollParent?.removeEventListener('scroll', updatePlacement, true);
        };
    }, [openMenuId]);

    const handleMenuToggle = (e, notebookId) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === notebookId ? null : notebookId);
    };

    const handleDelete = async (e, notebookId) => {
        e.stopPropagation();

        const confirmed = await confirm({
            title: '워크스페이스 삭제',
            message: '정말 삭제하시겠습니까?\n관련 문서와 데이터가 함께 삭제됩니다.',
            confirmText: '삭제',
            cancelText: '취소',
            tone: 'danger',
            disableBackdropClose: true,
        });
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
            await alert({
                title: '삭제 실패',
                message: '워크스페이스 삭제에 실패했습니다.',
            });
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

    const handleResetPromptToDefault = () => {
        const defChunk = promptNotebook?.defaultChunkPrompt || '';
        const defOntology = promptNotebook?.defaultOntologyPrompt || '';
        const defChat = promptNotebook?.defaultChatResultPrompt || '';
        const defContent = promptNotebook?.defaultContentOntologyPrompt || '';
        const defSchema = promptNotebook?.defaultSchemaAnalysisPrompt || '';
        const defInterTable = promptNotebook?.defaultInterTableAnalysisPrompt || '';
        const defAqlGen = promptNotebook?.defaultAqlGenerationPrompt || '';
        const defAqlInterp = promptNotebook?.defaultAqlInterpretationPrompt || '';
        const defAgg = promptNotebook?.defaultAggregationStrategyPrompt || '';

        setChunkPromptValue('');
        setOntologyPromptValue('');
        setChatResultPromptValue('');
        setContentOntologyPromptValue('');
        setSchemaAnalysisPromptValue('');
        setInterTableAnalysisPromptValue('');
        setAqlGenerationPromptValue('');
        setAqlInterpretationPromptValue('');
        setAggregationStrategyPromptValue('');

        setTimeout(() => {
            setChunkPromptValue(defChunk);
            setOntologyPromptValue(defOntology);
            setChatResultPromptValue(defChat);
            setContentOntologyPromptValue(defContent);
            setSchemaAnalysisPromptValue(defSchema);
            setInterTableAnalysisPromptValue(defInterTable);
            setAqlGenerationPromptValue(defAqlGen);
            setAqlInterpretationPromptValue(defAqlInterp);
            setAggregationStrategyPromptValue(defAgg);
        }, 0);

        showAlert('기본값으로 초기화되었습니다.');
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
            await alert({
                title: '이름 변경',
                message: '워크스페이스 이름을 입력해주세요.',
            });
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
            await alert({
                title: '이름 변경 실패',
                message: '워크스페이스 이름 변경에 실패했습니다.',
            });
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

    const pageTitle = filter === 'ALL' ? '전체 워크스페이스' : '내 워크스페이스';
    const workspaceBreadcrumbs = (() => {
        const domainName = localStorage.getItem('admin_selected_domain_name');
        return domainName ? [domainName] : [];
    })();

    return (
        <div className="home-container">
            <div className="home-page-header">
                <PageHeader
                    title={pageTitle}
                    breadcrumbs={workspaceBreadcrumbs}
                    actions={(
                        <>
                            <div className="view-toggle">
                                <button
                                    type="button"
                                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                    onClick={() => setViewMode('grid')}
                                    title="그리드 보기"
                                >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                        <rect x="2" y="2" width="7" height="7" />
                                        <rect x="11" y="2" width="7" height="7" />
                                        <rect x="2" y="11" width="7" height="7" />
                                        <rect x="11" y="11" width="7" height="7" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                    onClick={() => setViewMode('list')}
                                    title="리스트 보기"
                                >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
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
                                aria-label="정렬"
                            >
                                <option value="최신순">최신순</option>
                                <option value="오래된순">오래된순</option>
                                <option value="이름순">이름순</option>
                            </select>

                            <button type="button" className="new-note-btn" onClick={handleCreateNew}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                새 워크스페이스
                            </button>
                        </>
                    )}
                />
            </div>

            {/* 로딩 상태 */}
            {loading && (
                <div className="home-loading-state">
                    <div className="home-loading-spinner" aria-hidden />
                    <p className="home-loading-text">워크스페이스를 불러오는 중...</p>
                </div>
            )}

            {/* 에러 상태 */}
            {error && (
                <div className="home-error-state">
                    <p>{error}</p>
                    <button
                        type="button"
                        className="home-error-retry"
                        onClick={() => window.location.reload()}
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
                            className={`notebook-card ${notebook.color || 'yellow'}${
                                openMenuId === notebook.id ? ' notebook-card--menu-open' : ''
                            }`}
                            onClick={() => handleNotebookClick(notebook.id)}
                        >
                            {/* 삭제 중 오버레이 */}
                            {deletingId === notebook.id && (
                                <div
                                    className="notebook-card-overlay--deleting"
                                    onClick={(e) => e.stopPropagation()}
                                    role="presentation"
                                >
                                    <Loader2 size={28} aria-hidden />
                                    <span className="notebook-card-overlay-label">삭제중...</span>
                                </div>
                            )}
                            <div className="card-header">
                                <div className="notebook-icon">
                                    {notebook.icon || '📄'}
                                </div>
                                <div className="card-header-right">
                                {notebook.shareType === 'ALL' && (
                                    <div className="notebook-share-badge notebook-share-badge--all">
                                        <Globe size={12} />
                                        <span>전체 공유</span>
                                    </div>
                                )}
                                {notebook.shareType === 'INDIVIDUAL' && (
                                    <div className="notebook-share-badge notebook-share-badge--individual">
                                        <Users size={12} />
                                        <span>조직 공유</span>
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
                                                <div
                                                    className={`popup-menu${workspaceMenuOpenUp ? ' popup-menu--open-up' : ''}`}
                                                >
                                                    <button
                                                        className="menu-item"
                                                        onClick={(e) => handleRename(e, notebook.id)}
                                                    >
                                                        <Edit2 size={14} />
                                                        <span>제목 수정</span>
                                                    </button>
                                                    {isAdmin && (
                                                        <>
                                                            <button
                                                                className="menu-item"
                                                                onClick={(e) => handleOpenPromptModal(e, notebook.id)}
                                                            >
                                                                {(notebook.ontologyPrompt || notebook.chatResultPrompt || notebook.chunkPrompt)
                                                                    ? <Check size={14} className="menu-item-icon--success" />
                                                                    : <FileText size={14} />}
                                                                <span>프롬프트 변경</span>
                                                            </button>
                                                            <button
                                                                className="menu-item"
                                                                onClick={(e) => handleOpenShareModal(e, notebook.id)}
                                                            >
                                                                <Share2 size={14} />
                                                                <span>공유 설정</span>
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        className="menu-item delete"
                                                        onClick={(e) => handleDelete(e, notebook.id)}
                                                    >
                                                        <Trash2 size={14} />
                                                        <span>삭제</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                )}
                                </div>
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
                                            <div
                                                className={`popup-menu${workspaceMenuOpenUp ? ' popup-menu--open-up' : ''}`}
                                            >
                                                <button
                                                    className="menu-item"
                                                    onClick={(e) => handleRename(e, notebook.id)}
                                                >
                                                    <Edit2 size={14} />
                                                    <span>제목 수정</span>
                                                </button>
                                                {isAdmin && (
                                                    <>
                                                        <button
                                                            className="menu-item"
                                                            onClick={(e) => handleOpenPromptModal(e, notebook.id)}
                                                        >
                                                            {(notebook.ontologyPrompt || notebook.chatResultPrompt || notebook.chunkPrompt)
                                                                ? <Check size={14} className="menu-item-icon--success" />
                                                                : <FileText size={14} />}
                                                            <span>프롬프트 변경</span>
                                                        </button>
                                                        <button
                                                            className="menu-item"
                                                            onClick={(e) => handleOpenShareModal(e, notebook.id)}
                                                        >
                                                            <Share2 size={14} />
                                                            <span>공유 설정</span>
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    className="menu-item delete"
                                                    onClick={(e) => handleDelete(e, notebook.id)}
                                                >
                                                    <Trash2 size={14} />
                                                    <span>삭제</span>
                                                </button>
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
            <BaseModal
                open={renameModalOpen}
                onClose={() => setRenameModalOpen(false)}
                title="워크스페이스 이름 변경"
                maxWidth="xs"
                disableBackdropClose
                actions={(
                    <>
                        <Button
                            variant="outlined"
                            onClick={() => setRenameModalOpen(false)}
                        >
                            취소
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleRenameSubmit}
                        >
                            저장
                        </Button>
                    </>
                )}
            >
                <div className="home-rename-modal-body">
                    <TextField
                        fullWidth
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleRenameSubmit();
                            }
                        }}
                        placeholder="워크스페이스 이름"
                        autoFocus
                        size="small"
                    />
                </div>
            </BaseModal>

            {/* Prompt Modal */}
            <BaseModal
                open={promptModalOpen}
                onClose={() => setPromptModalOpen(false)}
                title="프롬프트 변경"
                subtitle={`워크스페이스 - ${promptNotebook?.name || '-'}`}
                maxWidth="lg"
                fullWidth
                contentClassName="home-prompt-modal-content"
                actionsClassName="home-prompt-modal-actions"
                actionsAlign="left"
                actions={(
                    <div className="home-prompt-modal-action-layout">
                        <div className="home-prompt-modal-action-left">
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleResetPromptToDefault}
                            >
                                기본값 초기화
                            </Button>
                        </div>
                        <div className="home-prompt-modal-action-right">
                            <Button
                                variant="outlined"
                                onClick={() => setPromptModalOpen(false)}
                            >
                                취소
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleSavePrompt}
                            >
                                저장
                            </Button>
                        </div>
                    </div>
                )}
            >
                <div className="home-prompt-modal-shell">
                    <div className="home-prompt-modal-grid">
                            <div className="home-prompt-field">
                                <label className="home-prompt-label">
                                    청킹 프롬프트
                                </label>
                                <div className="home-prompt-row">
                                    <select
                                        className={`modal-input home-prompt-select-flex ${chunkPromptValue === 'NONE' ? 'modal-input--chunk-none' : ''}`}
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
                                        className={`home-prompt-none-btn ${chunkPromptValue === 'NONE' ? 'home-prompt-none-btn--active' : ''}`}
                                        onClick={() => setChunkPromptValue(chunkPromptValue === 'NONE' ? '' : 'NONE')}
                                    >
                                        NONE
                                    </button>
                                </div>
                                <div className={`home-prompt-hint ${chunkPromptValue === 'NONE' ? 'home-prompt-hint--danger' : ''}`}>
                                    {chunkPromptValue === 'NONE' ? 'LLM 청킹 비활성화' : 'LLM 청킹 프롬프트'}
                                </div>
                            </div>

                            <div className="home-prompt-field">
                                <label className="home-prompt-label">
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
                                <div className="home-prompt-hint">
                                    Chunk → LLM 온톨로지 추출
                                </div>
                            </div>

                            <div className="home-prompt-field">
                                <label className="home-prompt-label">
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
                                <div className="home-prompt-hint">
                                    Chat 응답 생성
                                </div>
                            </div>

                            <div className="home-prompt-field">
                                <label className="home-prompt-label">
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
                                <div className="home-prompt-hint">
                                    정형 Chunk → LLM 온톨로지
                                </div>
                            </div>

                            <div className="home-prompt-field">
                                <label className="home-prompt-label">
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
                                <div className="home-prompt-hint">
                                    CSV/DB 스키마 자동 분석
                                </div>
                            </div>

                            <div className="home-prompt-field">
                                <label className="home-prompt-label">
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
                                <div className="home-prompt-hint">
                                    다건 테이블 간 FK/관계 분석
                                </div>
                            </div>

                            <div className="home-prompt-field">
                                <label className="home-prompt-label">
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
                                <div className="home-prompt-hint">
                                    자연어 → AQL 쿼리 생성
                                </div>
                            </div>

                            <div className="home-prompt-field">
                                <label className="home-prompt-label">
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
                                <div className="home-prompt-hint">
                                    AQL 쿼리 결과 자연어 해석
                                </div>
                            </div>

                            <div className="home-prompt-field">
                                <label className="home-prompt-label">
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
                                <div className="home-prompt-hint">
                                    대규모 정형 데이터 집계 전략
                                </div>
                            </div>
                    </div>

                    <div className="home-prompt-footer-note">
                        * 기본값: 상위 레벨(도메인 → 시스템) 설정을 따름 &nbsp;|&nbsp; NONE: 명시적 비활성화
                    </div>
                </div>
            </BaseModal>

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

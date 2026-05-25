import { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Edit2, Trash2, Share2, FileText, Check, Users, Globe, Loader2, Plus, Info, RotateCcw } from 'lucide-react';
import { workspaceApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { useDialog } from '../hooks/useDialog';
import ShareSettingsModal from '../components/ShareSettingsModal';
import PageHeader from '../components/common/PageHeader';
import KlIconButton from '../components/common/KlIconButton';
import BasicTable from '../components/common/BasicTable';
import { listTableEmptyState } from '../config/supportMock';
import KlTableRowActions from '../components/common/table/KlTableRowActions';
import KlTooltip from '../components/common/KlTooltip';
import { formatTableCellText, isTableCellBlank } from '../components/common/tableCellDisplay';
import BaseModal from '../components/common/modal/BaseModal';
import KlModalSelect from '../components/common/modal/KlModalSelect';
import {
    homePromptModalPaperClassName,
    homePromptModalPaperSx,
} from '../components/common/modal/klModalPaper';
import './Home.css';

/**
 * API에서 가져온 프롬프트 코드가 적을 때도 셀렉트 목록·열기 목록을 확인할 수 있도록 샘플 코드를 보강합니다.
 * 저장 시 서버에 존재하지 않는 코드를 넣으면 오류가 날 수 있으니 UI 검증용 옵션 선택은 피해 주세요.
 */
const PROMPT_SELECT_UI_SAMPLES = ['SAMPLE_PROMPT_ALPHA', 'SAMPLE_PROMPT_BETA', 'SAMPLE_PROMPT_GAMMA'];

function mergePromptCodesForSelectUi(apiCodes) {
    const base = Array.isArray(apiCodes) ? [...apiCodes] : [];
    if (base.length >= 3) return base;
    return Array.from(new Set([...base, ...PROMPT_SELECT_UI_SAMPLES]));
}

const WORKSPACE_LIST_COLUMNS = [
    { id: 'title', label: '제목', width: '36%', align: 'left' },
    { id: 'source', label: '소스(개수)', width: 96, align: 'left', ellipsis: false },
    { id: 'createdAt', label: '소스생성일', width: 120, align: 'left' },
    { id: 'role', label: '역할', width: 88, align: 'left' },
    { id: '_actions', label: '관리', width: 156, align: 'right', ellipsis: false },
];

function formatWorkspaceCreatedAt(notebook) {
    const raw = notebook.createdAt || notebook.updatedAt || notebook.date;
    if (isTableCellBlank(raw)) return formatTableCellText(raw);
    const t = new Date(raw).getTime();
    if (!Number.isFinite(t)) return formatTableCellText(raw);
    return new Date(raw).toLocaleDateString('ko-KR');
}

function Home() {
    const [searchParams] = useSearchParams();
    const filter = searchParams.get('filter') || 'MY'; // URL에서 필터 읽기

    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('최신순');
    const [openMenuId, setOpenMenuId] = useState(null);
    /** 그리드 more-btn — KlTooltip 호버 직접 제어 (클릭·메뉴 열림 후 stuck 방지) */
    const [moreBtnHoverId, setMoreBtnHoverId] = useState(null);
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

    const fetchWorkspaces = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            setLoading(true);
            const params = { filter };

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
    }, [isAuthenticated, isAdmin, filter]);

    useEffect(() => {
        fetchWorkspaces();
    }, [fetchWorkspaces]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null);
                setMoreBtnHoverId(null);
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
        window.addEventListener('scroll', updatePlacement, true);
        scrollParent?.addEventListener('scroll', updatePlacement, true);

        return () => {
            window.removeEventListener('resize', updatePlacement);
            window.removeEventListener('scroll', updatePlacement, true);
            scrollParent?.removeEventListener('scroll', updatePlacement, true);
        };
    }, [openMenuId]);

    useEffect(() => {
        if (openMenuId !== null) {
            setMoreBtnHoverId(null);
        }
    }, [openMenuId]);

    const handleMenuToggle = (e, notebookId) => {
        e.stopPropagation();
        setMoreBtnHoverId(null);
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
            setChunkPromptCodes(mergePromptCodesForSelectUi(extractCodes(results[0])));
            setOntologyPromptCodes(mergePromptCodesForSelectUi(extractCodes(results[1])));
            setChatPromptCodes(mergePromptCodesForSelectUi(extractCodes(results[2])));
            setContentOntologyPromptCodes(mergePromptCodesForSelectUi(extractCodes(results[3])));
            setSchemaAnalysisPromptCodes(mergePromptCodesForSelectUi(extractCodes(results[4])));
            setInterTableAnalysisPromptCodes(mergePromptCodesForSelectUi(extractCodes(results[5])));
            setAqlGenerationPromptCodes(mergePromptCodesForSelectUi(extractCodes(results[6])));
            setAqlInterpretationPromptCodes(mergePromptCodesForSelectUi(extractCodes(results[7])));
            setAggregationStrategyPromptCodes(mergePromptCodesForSelectUi(extractCodes(results[8])));
        } catch (err) {
            console.error('프롬프트 코드 목록 조회 실패:', err);
        }
    };

    const openWorkspaceEditModal = useCallback((notebook) => {
        if (!notebook) return;
        setPromptNotebook(notebook);
        setNewName(notebook.name || notebook.title || '');
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
        if (isAdmin) {
            fetchPromptCodesByPurpose();
        }
    }, [isAdmin]);

    const handleOpenPromptModal = (e, notebookId) => {
        e.stopPropagation();
        const notebook = notebooks.find((nb) => nb.id === notebookId);
        openWorkspaceEditModal(notebook);
        setOpenMenuId(null);
    };

    const handleSavePrompt = async () => {
        if (!promptNotebook) return;
        if (!newName.trim()) {
            await alert({
                title: '프롬프트 변경',
                message: '워크스페이스 이름을 입력해주세요.',
            });
            return;
        }
        try {
            const updateData = {
                name: newName.trim(),
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
                    name: updated.name,
                    title: updated.name,
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

    const sortedNotebooks = useMemo(() => {
        const list = [...notebooks];
        const getName = (nb) => (nb.name || nb.title || '').trim();
        const getTime = (nb) => {
            const raw = nb.createdAt || nb.updatedAt || nb.date;
            const t = raw ? new Date(raw).getTime() : 0;
            return Number.isFinite(t) ? t : 0;
        };

        if (sortBy === '이름순') {
            return list.sort((a, b) => getName(a).localeCompare(getName(b), 'ko'));
        }
        if (sortBy === '오래된순') {
            return list.sort((a, b) => getTime(a) - getTime(b));
        }
        return list.sort((a, b) => getTime(b) - getTime(a));
    }, [notebooks, sortBy]);

    const renderWorkspaceListCell = useCallback(({ column, row: notebook }) => {
        switch (column.id) {
            case 'title':
                return (
                    <div className="home-workspace-list-title">
                        <span className="home-workspace-list-icon" aria-hidden>
                            {notebook.icon || '📄'}
                        </span>
                        <span className="home-workspace-list-name">
                            {notebook.name || notebook.title || 'Untitled'}
                        </span>
                        {notebook.shareType === 'ALL' ? (
                            <span className="notebook-share-badge notebook-share-badge--all home-workspace-list-badge">
                                <Globe size={12} aria-hidden />
                                <span>전체 공유</span>
                            </span>
                        ) : null}
                        {notebook.shareType === 'INDIVIDUAL' ? (
                            <span className="notebook-share-badge notebook-share-badge--individual home-workspace-list-badge">
                                <Users size={12} aria-hidden />
                                <span>조직 공유</span>
                            </span>
                        ) : null}
                    </div>
                );
            case 'source':
                return (
                    <span className="home-workspace-list-muted">
                        {notebook.documentCount ?? 0}
                    </span>
                );
            case 'createdAt':
                return (
                    <span
                        className={
                            isTableCellBlank(notebook.createdAt || notebook.updatedAt || notebook.date)
                                ? 'kl-table-cell-blank'
                                : 'home-workspace-list-muted'
                        }
                    >
                        {formatWorkspaceCreatedAt(notebook)}
                    </span>
                );
            case 'role': {
                const role = notebook.role;
                return (
                    <span className={isTableCellBlank(role) ? 'kl-table-cell-blank' : 'home-workspace-list-muted'}>
                        {formatTableCellText(role || 'Owner')}
                    </span>
                );
            }
            case '_actions': {
                if (notebook.role !== 'Owner') {
                    return <span className="kl-table-cell-blank">—</span>;
                }
                const workspaceLabel = notebook.name || notebook.title || '워크스페이스';
                if (deletingId === notebook.id) {
                    return (
                        <KlTableRowActions
                            prefix={<Loader2 className="kl-table-icon-btn__spin" size={16} aria-hidden />}
                            actions={[]}
                        />
                    );
                }
                const hasCustomPrompts = Boolean(
                    notebook.ontologyPrompt || notebook.chatResultPrompt || notebook.chunkPrompt,
                );
                const shareActive = notebook.shareType && notebook.shareType !== 'NONE';
                const adminActions = isAdmin
                    ? [
                          {
                              kind: 'custom',
                              tooltip: '프롬프트 변경',
                              tone: hasCustomPrompts ? 'success' : 'neutral',
                              ariaLabel: `${workspaceLabel} 프롬프트 변경`,
                              onClick: (e) => handleOpenPromptModal(e, notebook.id),
                              icon: hasCustomPrompts ? (
                                  <Check strokeWidth={1.75} aria-hidden />
                              ) : (
                                  <FileText strokeWidth={1.75} aria-hidden />
                              ),
                          },
                          {
                              kind: 'share',
                              accent: shareActive,
                              ariaLabel: `${workspaceLabel} 공유 설정`,
                              onClick: (e) => handleOpenShareModal(e, notebook.id),
                          },
                      ]
                    : [];
                return (
                    <KlTableRowActions
                        actions={[
                            {
                                kind: 'rename',
                                ariaLabel: `${workspaceLabel} 제목 수정`,
                                onClick: (e) => handleRename(e, notebook.id),
                            },
                            ...adminActions,
                            {
                                kind: 'delete',
                                ariaLabel: `${workspaceLabel} 삭제`,
                                onClick: (e) => handleDelete(e, notebook.id),
                            },
                        ]}
                    />
                );
            }
            default:
                return undefined;
        }
    }, [deletingId, isAdmin, notebooks]);

    return (
        <div className="kl-page kl-page--fill">
            <div className="kl-main-sticky-head">
                <PageHeader
                    title={pageTitle}
                    breadcrumbs={workspaceBreadcrumbs}
                    actions={(
                        <>
                            <KlIconButton
                                tooltip="새로고침"
                                ariaLabel="워크스페이스 목록 새로고침"
                                onClick={fetchWorkspaces}
                                buttonClassName="kl-btn gray-outline md icon-only"
                                stopPropagation={false}
                            >
                                <RotateCcw size={16} aria-hidden />
                            </KlIconButton>
                            <button type="button" className="kl-btn primary-full md" onClick={handleCreateNew}>
                                <Plus size={14} aria-hidden />
                                새 워크스페이스
                            </button>
                        </>
                    )}
                />
            </div>

            <div className="table-area">
                <div className="table-toolbar">
                    <div className="toolbar-left">
                        <span className="kl-table-toolbar-summary">
                            총 <strong>{sortedNotebooks.length}</strong>건
                        </span>
                    </div>
                    <div className="toolbar-right">
                        <div className="toolbar-view-toggle">
                            <KlTooltip
                                title="그리드 보기"
                                placement="bottom"
                                enterDelay={0}
                                triggerClassName="kl-icon-btn-tooltip-trigger"
                            >
                                <button
                                    type="button"
                                    className={`toolbar-view-btn ${viewMode === 'grid' ? 'is-active' : ''}`}
                                    onClick={() => setViewMode('grid')}
                                    aria-label="그리드 보기"
                                >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                        <rect x="2" y="2" width="7" height="7" />
                                        <rect x="11" y="2" width="7" height="7" />
                                        <rect x="2" y="11" width="7" height="7" />
                                        <rect x="11" y="11" width="7" height="7" />
                                    </svg>
                                </button>
                            </KlTooltip>
                            <KlTooltip
                                title="리스트 보기"
                                placement="bottom"
                                enterDelay={0}
                                triggerClassName="kl-icon-btn-tooltip-trigger"
                            >
                                <button
                                    type="button"
                                    className={`toolbar-view-btn ${viewMode === 'list' ? 'is-active' : ''}`}
                                    onClick={() => setViewMode('list')}
                                    aria-label="리스트 보기"
                                >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                        <rect x="2" y="3" width="16" height="2" />
                                        <rect x="2" y="8" width="16" height="2" />
                                        <rect x="2" y="13" width="16" height="2" />
                                    </svg>
                                </button>
                            </KlTooltip>
                        </div>

                        <select
                            className="toolbar-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            aria-label="정렬"
                        >
                            <option value="최신순">최신순</option>
                            <option value="오래된순">오래된순</option>
                            <option value="이름순">이름순</option>
                        </select>
                    </div>
                </div>

            {viewMode === 'list' && (
                <div className="basic-table-shell home-workspace-list-shell">
                    <BasicTable
                        className="home-workspace-basic-table"
                        columns={WORKSPACE_LIST_COLUMNS}
                        data={loading || error ? [] : sortedNotebooks}
                        renderCell={renderWorkspaceListCell}
                        onRowClick={(_e, { row }) => handleNotebookClick(row.id)}
                        onRowKeyDown={(_e, { row }) => {
                            if (_e.key === 'Enter' || _e.key === ' ') {
                                _e.preventDefault();
                                handleNotebookClick(row.id);
                            }
                        }}
                        rowAriaLabel={(row) => `${row.name || row.title || '워크스페이스'} 열기`}
                        getRowClassName={(row) => (
                            deletingId === row.id ? 'home-workspace-list-row--deleting' : ''
                        )}
                        emptyState={listTableEmptyState({
                            loading,
                            loadError: error,
                            loadingMessage: '워크스페이스를 불러오는 중입니다.',
                            emptyVariant: 'default',
                            emptyMessage: !loading && !error ? '워크스페이스가 없습니다.' : undefined,
                        })}
                    />
                </div>
            )}

            {viewMode === 'grid' && loading && (
                <div className="home-loading-state">
                    <div className="home-loading-spinner" aria-hidden />
                    <p className="home-loading-text">워크스페이스를 불러오는 중...</p>
                </div>
            )}

            {viewMode === 'grid' && error && (
                <div className="home-error-state">
                    <p>{error}</p>
                    <button
                        type="button"
                        className="home-error-retry"
                        onClick={() => fetchWorkspaces()}
                    >
                        다시 시도
                    </button>
                </div>
            )}

            {viewMode === 'grid' && !loading && !error && (
                <div className="notebooks-container grid">
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

                    {sortedNotebooks.map((notebook) => (
                        <div
                            key={notebook.id}
                            className={`notebook-card ${notebook.color || 'yellow'}${
                                openMenuId === notebook.id ? ' notebook-card--menu-open' : ''
                            }`}
                            onClick={() => handleNotebookClick(notebook.id)}
                        >
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

                                {notebook.role === 'Owner' && (
                                        <div className="more-btn-container" ref={openMenuId === notebook.id ? menuRef : null}>
                                            <KlTooltip
                                                title="메뉴"
                                                placement="bottom"
                                                enterDelay={0}
                                                leaveDelay={0}
                                                open={
                                                    moreBtnHoverId === notebook.id
                                                    && openMenuId !== notebook.id
                                                }
                                                triggerClassName="kl-icon-btn-tooltip-trigger"
                                            >
                                                <button
                                                    type="button"
                                                    className="more-btn"
                                                    onMouseEnter={() => {
                                                        if (openMenuId !== notebook.id) {
                                                            setMoreBtnHoverId(notebook.id);
                                                        }
                                                    }}
                                                    onMouseLeave={() => {
                                                        setMoreBtnHoverId((prev) => (
                                                            prev === notebook.id ? null : prev
                                                        ));
                                                    }}
                                                    onClick={(e) => handleMenuToggle(e, notebook.id)}
                                                    aria-label="워크스페이스 메뉴"
                                                    aria-haspopup="menu"
                                                    aria-expanded={openMenuId === notebook.id}
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                                        <circle cx="10" cy="4" r="1.5" />
                                                        <circle cx="10" cy="10" r="1.5" />
                                                        <circle cx="10" cy="16" r="1.5" />
                                                    </svg>
                                                </button>
                                            </KlTooltip>
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
                            <div className="card-body">
                                <h3 className="notebook-title">{notebook.name || notebook.title || 'Untitled'}</h3>
                                <p className="notebook-source">소스 {notebook.documentCount || 0}개</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            </div>

            {/* Rename Modal */}
            <BaseModal
                open={renameModalOpen}
                onClose={() => setRenameModalOpen(false)}
                title="워크스페이스 이름 변경"
                maxWidth="xs"
                disableBackdropClose
                contentClassName="home-rename-modal-content kl-modal-form"
                actionsClassName="home-rename-modal-actions"
                actionsAlign="right"
                actions={(
                    <>
                        <button
                            type="button"
                            className="kl-btn gray-outline md"
                            onClick={() => setRenameModalOpen(false)}
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            className="kl-btn primary-full md"
                            onClick={handleRenameSubmit}
                        >
                            저장
                        </button>
                    </>
                )}
            >
                <form
                    className="kl-modal-form-stack"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleRenameSubmit();
                    }}
                >
                    <div className="kl-modal-form-row">
                        <label className="kl-modal-form-row__label" htmlFor="workspace-rename-input">
                            워크스페이스 이름
                        </label>
                        <div className="kl-modal-form-row__control">
                            <input
                                id="workspace-rename-input"
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="이름 입력"
                                autoComplete="off"
                                autoFocus
                            />
                        </div>
                    </div>
                </form>
            </BaseModal>

            {/* Prompt Modal */}
            <BaseModal
                open={promptModalOpen}
                onClose={() => setPromptModalOpen(false)}
                title="프롬프트 변경"
                maxWidth={false}
                fullWidth={false}
                paperSx={homePromptModalPaperSx}
                paperClassName={homePromptModalPaperClassName}
                contentClassName="home-prompt-modal-content kl-modal-form"
                actionsClassName="home-prompt-modal-actions"
                actions={(
                    <div className="kl-modal-actions-split">
                        <div className="kl-modal-actions-split__left">
                            <button
                                type="button"
                                className="kl-btn primary-outline md"
                                onClick={handleResetPromptToDefault}
                            >
                                기본값 초기화
                            </button>
                        </div>
                        <div className="kl-modal-actions-split__right">
                            <button
                                type="button"
                                className="kl-btn gray-outline md"
                                onClick={() => setPromptModalOpen(false)}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                className="kl-btn primary-full md"
                                onClick={handleSavePrompt}
                            >
                                저장
                            </button>
                        </div>
                    </div>
                )}
            >
                <form
                    className="kl-modal-form-stack home-prompt-modal-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSavePrompt();
                    }}
                >
                        <div className="kl-modal-form-row">
                            <label className="kl-modal-form-row__label" htmlFor="workspace-prompt-name">
                                워크스페이스 이름
                            </label>
                            <div className="kl-modal-form-row__control">
                                <input
                                    id="workspace-prompt-name"
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="이름 입력"
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        <div className="kl-modal-form-row kl-vert-start">
                            <label className="kl-modal-form-row__label" htmlFor="workspace-prompt-chunk">
                                청킹 프롬프트
                            </label>
                            <div className="kl-modal-form-row__control">
                                <div className="home-prompt-inline-row">
                                    <KlModalSelect
                                        id="workspace-prompt-chunk"
                                        className="home-prompt-select-flex"
                                        value={chunkPromptValue}
                                        onChange={(e) => setChunkPromptValue(e.target.value)}
                                        options={chunkPromptCodes}
                                        includeNoneOption
                                        warn={chunkPromptValue === 'NONE'}
                                    />
                                    <button
                                        type="button"
                                        className={`home-prompt-none-btn ${chunkPromptValue === 'NONE' ? 'home-prompt-none-btn--active' : ''}`}
                                        onClick={() => setChunkPromptValue(chunkPromptValue === 'NONE' ? '' : 'NONE')}
                                    >
                                        NONE
                                    </button>
                                </div>
                                <p className={`kl-modal-form-helper${chunkPromptValue === 'NONE' ? ' kl-modal-form-helper--error' : ''}`}>
                                    {chunkPromptValue === 'NONE' ? 'LLM 청킹 비활성화' : 'LLM 청킹 프롬프트'}
                                </p>
                            </div>
                        </div>

                        <div className="kl-modal-form-row kl-vert-start">
                            <label className="kl-modal-form-row__label" htmlFor="workspace-prompt-ontology">
                                온톨로지 프롬프트
                            </label>
                            <div className="kl-modal-form-row__control">
                                <KlModalSelect
                                    id="workspace-prompt-ontology"
                                    value={ontologyPromptValue}
                                    onChange={(e) => setOntologyPromptValue(e.target.value)}
                                    options={ontologyPromptCodes}
                                />
                                <p className="kl-modal-form-helper">Chunk → LLM 온톨로지 추출</p>
                            </div>
                        </div>

                        <div className="kl-modal-form-row kl-vert-start">
                            <label className="kl-modal-form-row__label" htmlFor="workspace-prompt-chat">
                                채팅 프롬프트
                            </label>
                            <div className="kl-modal-form-row__control">
                                <KlModalSelect
                                    id="workspace-prompt-chat"
                                    value={chatResultPromptValue}
                                    onChange={(e) => setChatResultPromptValue(e.target.value)}
                                    options={chatPromptCodes}
                                />
                                <p className="kl-modal-form-helper">Chat 응답 생성</p>
                            </div>
                        </div>

                        <div className="kl-modal-form-row kl-vert-start">
                            <label
                                className="kl-modal-form-row__label home-prompt-label--stacked"
                                htmlFor="workspace-prompt-content-ontology"
                            >
                                <span className="home-prompt-label-line">CONTENT</span>
                                <span className="home-prompt-label-line">온톨로지</span>
                            </label>
                            <div className="kl-modal-form-row__control">
                                <KlModalSelect
                                    id="workspace-prompt-content-ontology"
                                    value={contentOntologyPromptValue}
                                    onChange={(e) => setContentOntologyPromptValue(e.target.value)}
                                    options={contentOntologyPromptCodes}
                                />
                                <p className="kl-modal-form-helper">정형 Chunk → LLM 온톨로지</p>
                            </div>
                        </div>

                        <div className="kl-modal-form-row kl-vert-start">
                            <label className="kl-modal-form-row__label" htmlFor="workspace-prompt-schema">
                                스키마 분석
                            </label>
                            <div className="kl-modal-form-row__control">
                                <KlModalSelect
                                    id="workspace-prompt-schema"
                                    value={schemaAnalysisPromptValue}
                                    onChange={(e) => setSchemaAnalysisPromptValue(e.target.value)}
                                    options={schemaAnalysisPromptCodes}
                                />
                                <p className="kl-modal-form-helper">CSV/DB 스키마 자동 분석</p>
                            </div>
                        </div>

                        <div className="kl-modal-form-row kl-vert-start">
                            <label className="kl-modal-form-row__label" htmlFor="workspace-prompt-inter-table">
                                테이블 간 관계
                            </label>
                            <div className="kl-modal-form-row__control">
                                <KlModalSelect
                                    id="workspace-prompt-inter-table"
                                    value={interTableAnalysisPromptValue}
                                    onChange={(e) => setInterTableAnalysisPromptValue(e.target.value)}
                                    options={interTableAnalysisPromptCodes}
                                />
                                <p className="kl-modal-form-helper">다건 테이블 간 FK/관계 분석</p>
                            </div>
                        </div>

                        <div className="kl-modal-form-row kl-vert-start">
                            <label className="kl-modal-form-row__label" htmlFor="workspace-prompt-aql-gen">
                                AQL 생성
                            </label>
                            <div className="kl-modal-form-row__control">
                                <KlModalSelect
                                    id="workspace-prompt-aql-gen"
                                    value={aqlGenerationPromptValue}
                                    onChange={(e) => setAqlGenerationPromptValue(e.target.value)}
                                    options={aqlGenerationPromptCodes}
                                />
                                <p className="kl-modal-form-helper">자연어 → AQL 쿼리 생성</p>
                            </div>
                        </div>

                        <div className="kl-modal-form-row kl-vert-start">
                            <label className="kl-modal-form-row__label" htmlFor="workspace-prompt-aql-interpret">
                                AQL 결과 해석
                            </label>
                            <div className="kl-modal-form-row__control">
                                <KlModalSelect
                                    id="workspace-prompt-aql-interpret"
                                    value={aqlInterpretationPromptValue}
                                    onChange={(e) => setAqlInterpretationPromptValue(e.target.value)}
                                    options={aqlInterpretationPromptCodes}
                                />
                                <p className="kl-modal-form-helper">AQL 쿼리 결과 자연어 해석</p>
                            </div>
                        </div>

                        <div className="kl-modal-form-row kl-vert-start">
                            <label className="kl-modal-form-row__label" htmlFor="workspace-prompt-aggregation">
                                집계 전략
                            </label>
                            <div className="kl-modal-form-row__control">
                                <KlModalSelect
                                    id="workspace-prompt-aggregation"
                                    value={aggregationStrategyPromptValue}
                                    onChange={(e) => setAggregationStrategyPromptValue(e.target.value)}
                                    options={aggregationStrategyPromptCodes}
                                />
                                <p className="kl-modal-form-helper">대규모 정형 데이터 집계 전략</p>
                            </div>
                        </div>

                    <div className="kl-infotxt-note">
                        <Info size={16} aria-hidden />
                        <span>
                            <strong>기본값</strong>은 상위 레벨(도메인 → 시스템) 설정을 따릅니다.
                            {' '}
                            <strong>NONE</strong>은 명시적 비활성화입니다.
                        </span>
                    </div>
                </form>
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

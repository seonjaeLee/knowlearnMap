import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // Added import for GFM support (tables)
import { workspaceApi, ontologyApi, reportApi, structuredApi, dictionaryApi } from '../services/api';
import { API_URL } from '../config/api';

import { documentApi } from '../services/documentApi';
import { chatApi } from '../services/chatApi';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, MessageSquare, Network, Book, Plus, Trash2, Search, RefreshCw, Users, Pen, X, Save, Copy, ChevronDown, ChevronRight, FileText, Upload, BookOpen, Database, ExternalLink } from 'lucide-react';

import DocumentSourceItem from './DocumentSourceItem';
import AddSourceModal from './AddSourceModal';
import ColumnMappingModal from './ColumnMappingModal';
import KnowledgeMapView from './KnowledgeMapView';
import KnowledgeGraphModal from './KnowledgeGraphModal';
import MiniKnowledgeGraph from './MiniKnowledgeGraph';
import DictionaryView from './DictionaryView';
import RenameDialog from './RenameDialog';
import ReportGenerationModal from './ReportGenerationModal';
import ReportResultModal from './ReportResultModal';
import PageHeader from './common/PageHeader';

import './NotebookDetail.css';

function NotebookDetail() {
    const { id } = useParams(); // workspace(notebook) ID
    const navigate = useNavigate();
    const location = useLocation();
    const { setLnbCollapsed } = useOutletContext() || {};
    const { user, isAdmin } = useAuth();

    const handleOpenEXP = () => {
        const domainId = localStorage.getItem('admin_selected_domain_id') || '';
        const params = new URLSearchParams();
        if (domainId) params.set('domainId', domainId);
        if (id) params.set('workspaceId', id);
        const qs = params.toString();

        // 호스트별 EXP 베이스 URL 결정
        //   - localhost / 127.0.0.1  → 로컬 개발 (http://localhost:5174)
        //   - 그 외(dev 서버)        → https://expdev.knowlearn.kr
        //   - 운영 도메인             → https://exp.knowlearn.kr
        const host = typeof window !== 'undefined' ? window.location.hostname : '';
        let expBase;
        if (host === 'localhost' || host === '127.0.0.1') {
            expBase = 'http://localhost:5174';
        } else if (host === 'knowlearn.kr' || host === 'www.knowlearn.kr' || host === 'knowlearnmap.knowlearn.kr') {
            expBase = 'https://exp.knowlearn.kr';
        } else {
            // dev/staging 기본값
            expBase = 'https://expdev.knowlearn.kr';
        }

        window.open(`${expBase}/dashboard${qs ? `?${qs}` : ''}`, '_blank');
    };
    const { showAlert, showConfirm } = useAlert();

    // --- State: Layout & Tabs ---
    const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
    const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('chat'); // chat, graph, dictionary

    // --- State: Data ---
    const [notebook, setNotebook] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- State: Chat ---
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const messagesEndRef = useRef(null);

    // --- State: Source Management ---
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncJobId, setSyncJobId] = useState(null);
    const [syncProgress, setSyncProgress] = useState(0);
    const [progressMap, setProgressMap] = useState({}); // documentId -> { status, progress, stage }
    const pollingRef = useRef({});

    // --- State: Document Selection ---
    const [selectedDocumentIds, setSelectedDocumentIds] = useState([]);

    // --- State: Rename ---
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [documentToRename, setDocumentToRename] = useState(null);

    // --- State: Document Viewer ---
    const [viewerOpen, setViewerOpen] = useState(false);
    const [csvMappingDoc, setCsvMappingDoc] = useState(null); // CSV 컬럼 매핑 모달용
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [documentPages, setDocumentPages] = useState([]);
    const [loadingPages, setLoadingPages] = useState(false);
    const [documentChunks, setDocumentChunks] = useState([]);
    const [loadingChunks, setLoadingChunks] = useState(false);
    const [viewerMode, setViewerMode] = useState('page'); // 'page' | 'chunk'

    // Search & Navigation
    const [searchQuery, setSearchQuery] = useState('');
    const [currentResultIndex, setCurrentResultIndex] = useState(0);
    const [searchResults, setSearchResults] = useState([]);

    // Pagination
    const [currentPageNum, setCurrentPageNum] = useState(1);
    const [itemsPerPage] = useState(5);

    // --- State: Dictionary Highlight & Chunk Modal ---
    const [highlightTerms, setHighlightTerms] = useState([]);
    const [chunkModalPage, setChunkModalPage] = useState(null);

    // --- State: Workspace Roles ---
    const [workspaceRoles, setWorkspaceRoles] = useState([]);
    const [activePersonaText, setActivePersonaText] = useState(null);
    const [activePersonaName, setActivePersonaName] = useState(null);
    // --- State: Saved Chats ---
    const [savedChats, setSavedChats] = useState([]);
    const [expandedSavedId, setExpandedSavedId] = useState(null);

    // --- State: Chat Debug Config ---
    const [chatDebugConfig, setChatDebugConfig] = useState({ showRagDebug: true, showOntologyDebug: true });

    // --- State: Deleting Document ---
    const [deletingDocId, setDeletingDocId] = useState(null);
    const [deleteElapsed, setDeleteElapsed] = useState(0);
    const deletingStartRef = useRef(null);

    // --- State: Report ---
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportResultModalOpen, setReportResultModalOpen] = useState(false);
    const [reportStatus, setReportStatus] = useState(null);
    const [reportResult, setReportResult] = useState(null);
    const [reportError, setReportError] = useState(null);
    const [reportProgress, setReportProgress] = useState(null);

    // --- State: BizMeta ---
    const [bizMetaOpen, setBizMetaOpen] = useState(false);
    const [bizMetaText, setBizMetaText] = useState('');
    const [bizMetaSaving, setBizMetaSaving] = useState(false);
    const bizMetaFileRef = useRef(null);

    // --- State: ItMeta ---
    const [itMetaOpen, setItMetaOpen] = useState(false);
    const [itMetaText, setItMetaText] = useState('');
    const [itMetaSaving, setItMetaSaving] = useState(false);
    const itMetaFileRef = useRef(null);

    // --- Helper Functions ---
    const fetchNotebook = async () => {
        try {
            const data = await workspaceApi.getById(id);
            setNotebook(data);
            // Fetch sync status
            setSyncStatus(data.syncStatus || 'SYNCED');
            // Load bizMeta / itMeta
            setBizMetaText(data.bizMeta || '');
            setItMetaText(data.itMeta || '');
        } catch (error) {
            console.error('Error fetching notebook:', error);
            setLoading(false); // Stop loading even on error
            // navigate('/workspaces'); // Optional: redirect on error
        }
    };

    const handleContentUpdate = () => {
        fetchNotebook();
    };

    // ... Polling Logic ... (Existing code)


    /**
     * 파이프라인 상태 폴링
     * @param {number} documentId
     * @param {boolean} waitForStart - true면 PENDING 응답을 허용 (재실행 직후 비동기 시작 대기)
     */
    const startProgressPolling = (documentId, waitForStart = false) => {
        if (pollingRef.current[documentId]) return;

        let pendingCount = 0;
        let nullCount = 0;
        const MAX_PENDING_RETRIES = 5; // PENDING 최대 허용 횟수 (약 10초)
        const MAX_NULL_RETRIES = 3;    // null(404) 최대 허용 횟수 (문서 삭제 감지)

        const poll = async () => {
            try {
                const status = await documentApi.getPipelineStatus(documentId);

                if (!status) {
                    nullCount++;
                    if (nullCount >= MAX_NULL_RETRIES) {
                        // 문서가 삭제되었거나 존재하지 않음 → 폴링 중단
                        clearInterval(pollingRef.current[documentId]);
                        delete pollingRef.current[documentId];
                    }
                    return;
                }
                nullCount = 0;

                setProgressMap(prev => ({
                    ...prev,
                    [documentId]: status
                }));

                if (status.status === 'COMPLETED' || status.status === 'FAILED') {
                    clearInterval(pollingRef.current[documentId]);
                    delete pollingRef.current[documentId];
                    setDocuments(prev => prev.map(doc =>
                        doc.id === documentId
                            ? { ...doc, status: status.status, pipelineStatus: status.status }
                            : doc
                    ));
                    // 파이프라인 완료 후 자동 동기화 완료 대기 → syncStatus 갱신
                    if (status.status === 'COMPLETED') {
                        const pollSync = (retries = 10) => {
                            setTimeout(async () => {
                                try {
                                    const data = await workspaceApi.getById(id);
                                    setNotebook(data);
                                    setSyncStatus(data.syncStatus || 'SYNCED');
                                    if (data.syncStatus !== 'SYNCED' && retries > 0) {
                                        pollSync(retries - 1);
                                    }
                                } catch (e) { /* ignore */ }
                            }, 3000);
                        };
                        pollSync();
                    }
                    return;
                }

                if (status.status === 'PROCESSING') {
                    // 작업 시작됨 → PROCESSING 상태로 업데이트
                    pendingCount = 0;
                    setDocuments(prev => prev.map(doc =>
                        doc.id === documentId
                            ? { ...doc, pipelineStatus: 'PROCESSING' }
                            : doc
                    ));
                    return;
                }

                // PENDING 상태 처리
                if (status.status === 'PENDING') {
                    if (waitForStart && pendingCount < MAX_PENDING_RETRIES) {
                        // 재실행 직후: 비동기 시작 대기 중, 폴링 계속
                        pendingCount++;
                        return;
                    }
                    // 시작 대기 아니거나 대기 횟수 초과 → STALLED
                    clearInterval(pollingRef.current[documentId]);
                    delete pollingRef.current[documentId];
                    setDocuments(prev => prev.map(doc =>
                        doc.id === documentId
                            ? { ...doc, pipelineStatus: 'STALLED' }
                            : doc
                    ));
                }
            } catch (error) {
                console.error(`Polling error for ${documentId}:`, error);
                clearInterval(pollingRef.current[documentId]);
                delete pollingRef.current[documentId];
            }
        };

        poll();
        pollingRef.current[documentId] = setInterval(poll, 2000);
    };

    /**
     * PENDING 문서 상태를 1회 확인하여 실제 작업 중인지 판별
     * - PROCESSING이면 폴링 시작
     * - 그 외(PENDING 유지)면 STALLED로 마킹
     */
    const checkPendingDocument = async (doc) => {
        try {
            const status = await documentApi.getPipelineStatus(doc.id);
            if (status && status.status === 'PROCESSING') {
                // 실제 작업 중 → 폴링 시작
                startProgressPolling(doc.id);
            } else {
                // 작업이 진행되지 않는 PENDING → 재작업 필요
                setDocuments(prev => prev.map(d =>
                    d.id === doc.id ? { ...d, pipelineStatus: 'STALLED' } : d
                ));
            }
        } catch {
            setDocuments(prev => prev.map(d =>
                d.id === doc.id ? { ...d, pipelineStatus: 'STALLED' } : d
            ));
        }
    };

    const fetchDocuments = useCallback(async () => {
        if (!id) return;
        try {
            const data = await documentApi.getByWorkspace(id);
            setDocuments(data || []);
            if (data && data.length > 0) {
                setSelectedDocumentIds(data.map(doc => doc.id));
            }

            data?.forEach(doc => {
                if (doc.pipelineStatus === 'PROCESSING') {
                    // 이미 작업 중인 문서 → 바로 폴링
                    startProgressPolling(doc.id);
                } else if (doc.pipelineStatus === 'PENDING') {
                    // CSV/DB 정형 데이터: 컬럼 매핑 대기 중이면 STALLED 체크 스킵
                    const isCsvPendingMapping = (doc.sourceType === 'CSV' || doc.sourceType === 'DATABASE')
                        && (!doc.columnMappingStatus || doc.columnMappingStatus === 'PENDING' || doc.columnMappingStatus === 'MAPPED');
                    if (!isCsvPendingMapping) {
                        checkPendingDocument(doc);
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    // --- Fetch Workspace Roles ---
    const fetchRoles = useCallback(async () => {
        if (!id) return;
        try {
            const roles = await workspaceApi.getRoles(id);
            setWorkspaceRoles(roles || []);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    }, [id]);

    // --- Load Chat History ---
    const loadChatHistory = useCallback(async () => {
        if (!id) return;
        try {
            const history = await chatApi.getHistory(id);
            if (history && history.length > 0) {
                const loaded = history.map(msg => ({
                    role: msg.role === 'USER' ? 'user' : 'assistant',
                    content: msg.content,
                    type: msg.messageType === 'DEBUG' ? 'debug' : undefined,
                    debugLabel: msg.debugLabel || undefined,
                    timestamp: new Date(msg.createdAt),
                }));
                setMessages(loaded);
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    }, [id]);

    // --- Load Saved Chats ---
    const loadSavedChats = useCallback(async () => {
        if (!id) return;
        try {
            const list = await chatApi.savedChat.getList(id);
            setSavedChats(list || []);
        } catch (error) {
            console.error('Failed to load saved chats:', error);
        }
    }, [id]);

    const handleSaveChat = async (msgIndex) => {
        const assistantMsg = messages[msgIndex];
        if (!assistantMsg || assistantMsg.role !== 'assistant') return;

        // Find the closest preceding user message
        let question = '';
        for (let i = msgIndex - 1; i >= 0; i--) {
            if (messages[i].role === 'user') {
                question = messages[i].content;
                break;
            }
        }
        if (!question) {
            showAlert('질문을 찾을 수 없습니다.', 'error');
            return;
        }

        try {
            await chatApi.savedChat.save(id, question, assistantMsg.content);
            showAlert('저장되었습니다.', 'success');
            loadSavedChats();
        } catch (error) {
            console.error('Failed to save chat:', error);
            showAlert('저장에 실패했습니다.', 'error');
        }
    };

    const handleCopyChat = async (content) => {
        try {
            await navigator.clipboard.writeText(content);
            showAlert('클립보드에 복사되었습니다.', 'success');
        } catch (error) {
            console.error('Failed to copy:', error);
            showAlert('복사에 실패했습니다.', 'error');
        }
    };

    const handleDeleteSavedChat = async (savedId) => {
        const confirmed = await showConfirm('저장된 항목을 삭제하시겠습니까?');
        if (!confirmed) return;
        try {
            await chatApi.savedChat.delete(savedId);
            setSavedChats(prev => prev.filter(c => c.id !== savedId));
            if (expandedSavedId === savedId) setExpandedSavedId(null);
        } catch (error) {
            console.error('Failed to delete saved chat:', error);
            showAlert('삭제에 실패했습니다.', 'error');
        }
    };

    const handleClearHistory = async () => {
        const confirmed = await showConfirm('대화 기록을 모두 삭제하시겠습니까?');
        if (!confirmed) return;
        try {
            await chatApi.clearHistory(id);
            setMessages([]);
        } catch (error) {
            console.error('Failed to clear chat history:', error);
            showAlert('대화 기록 삭제에 실패했습니다.', 'error');
        }
    };

    // --- Initial Load ---
    useEffect(() => {
        fetchNotebook();
        fetchDocuments();
        fetchRoles();
        loadChatHistory();
        loadSavedChats();

        // Load chat debug config from public API
        fetch(`${API_URL}/api/config/public/chat`, { credentials: 'include' })
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data?.data) setChatDebugConfig(data.data); })
            .catch(() => {});

        // Check for state from navigation (e.g. create new workspace -> open add source)
        if (location.state?.openAddSource) {
            setUploadModalOpen(true);
            // Clear state to prevent reopening on refresh
            window.history.replaceState({}, document.title);
        }

        return () => {
            // Cleanup polling
            Object.values(pollingRef.current).forEach(intervalId => clearInterval(intervalId));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, fetchDocuments]);

    // --- State: Chat Graph ---
    const [chatGraphData, setChatGraphData] = useState({ nodes: [], links: [] });
    const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);

    // --- State: Graph/Dictionary Cache ---
    const [cachedGraphData, setCachedGraphData] = useState(null);
    const [cachedDictionaryData, setCachedDictionaryData] = useState(null);
    const [cacheInvalidationKey, setCacheInvalidationKey] = useState(null);

    // --- Event Handlers: Chat ---
    const handleSendMessage = async (e, textOverride) => {
        e?.preventDefault();
        const msgText = typeof textOverride === 'string' ? textOverride : inputMessage;
        if (!msgText.trim() || isProcessing) return;

        const userMsg = { role: 'user', content: msgText, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInputMessage('');
        setIsProcessing(true);
        // Clear previous graph data on new search? Optional. Let's keep it until new results come.
        // setChatGraphData({ nodes: [], links: [] }); 

        try {
            // Call chat API with RAG and ontology search
            // If all documents are selected, pass null to use workspace-level filtering (more efficient)
            // If partial selection, pass the list of IDs
            const isAllSelected = documents.length > 0 && selectedDocumentIds.length === documents.length;
            const documentIdsToSend = isAllSelected ? null : selectedDocumentIds;

            const response = await chatApi.send(id, msgText, documentIdsToSend, activePersonaText);

            // [DEBUG] Log response flags for troubleshooting
            console.log('[Chat Debug]', {
                showRagDebug: response.showRagDebug,
                showOntologyDebug: response.showOntologyDebug,
                ragResultsCount: response.ragResults?.length || 0,
                ontologyResultsCount: response.ontologyResults?.length || 0
            });

            // Process Ontology Results for Graph
            if (response.ontologyResults && response.ontologyResults.length > 0) {
                const newNodes = new Map();
                const newLinks = [];

                response.ontologyResults.forEach(result => {
                    const meta = result.metadata || {};
                    if (meta.type === 'Node') {
                        if (!newNodes.has(meta.id)) {
                            newNodes.set(meta.id, {
                                id: meta.id,
                                name: meta.label || result.content.split(':')[0], // Fallback
                                group: 'entity',
                                val: 1
                            });
                        }
                    } else if (meta.type === 'Edge') {
                        if (meta.source && meta.target) {
                            newLinks.push({
                                source: meta.source,
                                target: meta.target,
                                label_ko: result.content
                            });

                            // Ensure valid source/target nodes exist
                            if (!newNodes.has(meta.source)) {
                                newNodes.set(meta.source, {
                                    id: meta.source,
                                    name: meta.sourceLabel || "Unknown",
                                    group: 'entity',
                                    val: 1
                                });
                            }
                            if (!newNodes.has(meta.target)) {
                                newNodes.set(meta.target, {
                                    id: meta.target,
                                    name: meta.targetLabel || "Unknown",
                                    group: 'entity',
                                    val: 1
                                });
                            }
                        }
                    }
                });

                // Fetch real edges from ArangoDB between found nodes
                const nodeIds = Array.from(newNodes.keys());
                let edgesFetched = false;

                if (nodeIds.length >= 1) {
                    try {
                        const edgeResponse = await fetch(`${API_URL}/api/graph/workspace/edges-between/${id}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ nodeIds })
                        });
                        if (edgeResponse.ok) {
                            const edgeResult = await edgeResponse.json();
                            const edgeData = edgeResult.data || edgeResult;

                            // Add neighbor nodes returned from backend
                            if (edgeData.nodes && edgeData.nodes.length > 0) {
                                edgeData.nodes.forEach(n => {
                                    const nId = n._id || n.id;
                                    if (nId && !newNodes.has(nId)) {
                                        newNodes.set(nId, {
                                            id: nId,
                                            name: n.label_ko || n.label_en || n._key || 'Unknown',
                                            group: n.category || 'neighbor',
                                            val: 0.6
                                        });
                                    }
                                });
                            }

                            if (edgeData.links && edgeData.links.length > 0) {
                                const fetchedLinks = edgeData.links.map(l => ({
                                    source: l._from,
                                    target: l._to,
                                    label_ko: l.label_ko || l.relation_ko || '',
                                    label_en: l.label_en || l.relation_en || ''
                                }));
                                // Merge: fetched edges + any edges from vector search
                                const edgeKeys = new Set(fetchedLinks.map(l => `${l.source}-${l.target}`));
                                newLinks.forEach(l => {
                                    const key = `${l.source}-${l.target}`;
                                    if (!edgeKeys.has(key)) fetchedLinks.push(l);
                                });
                                // Filter out orphan nodes (no edges)
                                const connectedIds = new Set();
                                fetchedLinks.forEach(l => {
                                    connectedIds.add(l.source);
                                    connectedIds.add(l.target);
                                });
                                const connectedNodes = Array.from(newNodes.values())
                                    .filter(n => connectedIds.has(n.id));
                                setChatGraphData({
                                    nodes: connectedNodes,
                                    links: fetchedLinks
                                });
                                edgesFetched = true;
                            }
                        }
                    } catch (err) {
                        console.error('Failed to fetch edges between nodes:', err);
                    }
                }

                if (!edgesFetched) {
                    if (newLinks.length > 0) {
                        // Filter out orphan nodes
                        const connectedIds = new Set();
                        newLinks.forEach(l => {
                            connectedIds.add(l.source);
                            connectedIds.add(l.target);
                        });
                        const connectedNodes = Array.from(newNodes.values())
                            .filter(n => connectedIds.has(n.id));
                        setChatGraphData({
                            nodes: connectedNodes,
                            links: newLinks
                        });
                    } else {
                        // No edges at all - don't show graph
                        setChatGraphData({ nodes: [], links: [] });
                    }
                }
            } else {
                // No ontology results
            }


            // [DEBUG] Show RAG results in chat (controlled by system config)
            if (chatDebugConfig.showRagDebug !== false && response.ragResults && response.ragResults.length > 0) {
                const ragDebugText = response.ragResults.map((r, i) =>
                    `[${i + 1}] score: ${r.score?.toFixed(4) || 'N/A'}\n${r.content}\nmetadata: ${JSON.stringify(r.metadata || {})}`
                ).join('\n\n');
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    type: 'debug',
                    debugLabel: `RAG_RESULT (${response.ragResults.length}건)`,
                    content: ragDebugText,
                    timestamp: new Date()
                }]);
            }

            // [DEBUG] Show Ontology results in chat (controlled by system config)
            if (chatDebugConfig.showOntologyDebug !== false && response.ontologyResults && response.ontologyResults.length > 0) {
                const ontologyDebugText = response.ontologyResults.map((r, i) =>
                    `[${i + 1}] score: ${r.score?.toFixed(4) || 'N/A'} | type: ${r.metadata?.type || 'N/A'}\n${r.content}\nmetadata: ${JSON.stringify(r.metadata || {})}`
                ).join('\n\n');
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    type: 'debug',
                    debugLabel: `ONTOLOGY_RESULT (${response.ontologyResults.length}건)`,
                    content: ontologyDebugText,
                    timestamp: new Date()
                }]);
            }

            // Format response message with LLM answer
            let responseContent = '';

            if (response.answer) {
                responseContent += response.answer;
            } else {
                responseContent = "LLM 답변을 생성하지 못했습니다.";
            }

            if (!responseContent) {
                responseContent = '검색 결과가 없습니다. 다른 질문을 시도해보세요.';
            }

            // 출처 정보 수집 (RAG + 온톨로지)
            const sources = [];
            if (response.ragResults) {
                response.ragResults.forEach(r => {
                    if (r.metadata) {
                        sources.push({
                            type: 'RAG',
                            documentName: r.metadata.filename,
                            documentId: r.metadata.document_id,
                            page: r.metadata.page,
                            chunkId: r.metadata.chunk_id,
                            score: r.score
                        });
                    }
                });
            }
            if (response.ontologyResults) {
                response.ontologyResults.forEach(r => {
                    if (r.metadata?.document_ids?.length > 0) {
                        sources.push({
                            type: r.metadata.type === 'Edge' ? 'Fact' : 'Entity',
                            label: r.metadata.label || r.metadata.sourceLabel,
                            documentIds: r.metadata.document_ids,
                            chunkIds: r.metadata.chunk_ids,
                            score: r.score
                        });
                    }
                });
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: responseContent,
                relatedQuestions: response.relatedQuestions,
                sources: sources.length > 0 ? sources : undefined,
                timestamp: new Date()
            }]);
            setIsProcessing(false);
        } catch (error) {
            console.error('Chat error:', error);
            const { getChatErrorMessage } = await import('../utils/errorMessages.js');
            const friendlyMsg = getChatErrorMessage(error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: friendlyMsg,
                isError: true,
                timestamp: new Date()
            }]);
            setIsProcessing(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSendMessage(e);
        }
    };

    useEffect(() => {
        // 가로 스크롤(notebook-layout)을 침범하지 않도록 세로 스크롤 부모만 직접 스크롤
        const node = messagesEndRef.current;
        if (!node) return;
        let scrollParent = node.parentElement;
        while (scrollParent) {
            const cs = getComputedStyle(scrollParent);
            if (cs.overflowY === 'auto' || cs.overflowY === 'scroll') {
                scrollParent.scrollTo({
                    top: scrollParent.scrollHeight,
                    behavior: 'smooth',
                });
                return;
            }
            scrollParent = scrollParent.parentElement;
        }
    }, [messages]);

    // --- Event Handlers: Source ---
    const handleCheckDocument = (docId) => {
        setSelectedDocumentIds(prev =>
            prev.includes(docId)
                ? prev.filter(id => id !== docId)
                : [...prev, docId]
        );
    };

    // --- Document Viewer Handlers ---
    const fetchDocumentPages = async (documentId) => {
        try {
            setLoadingPages(true);
            const pages = await documentApi.getPages(documentId);
            setDocumentPages(pages);
        } catch (error) {
            console.error('Failed to load pages:', error);
            showAlert('페이지를 불러오는데 실패했습니다.');
        } finally {
            setLoadingPages(false);
        }
    };

    const fetchDocumentChunks = async (documentId) => {
        try {
            setLoadingChunks(true);
            const chunks = await documentApi.getChunks(documentId);
            setDocumentChunks(chunks);
        } catch (error) {
            console.error('Failed to load chunks:', error);
            showAlert('청크를 불러오는데 실패했습니다.');
        } finally {
            setLoadingChunks(false);
        }
    };

    const handleViewerModeChange = (mode) => {
        setViewerMode(mode);
        setCurrentPageNum(1);
        if (mode === 'chunk' && selectedDocument && documentChunks.length === 0) {
            fetchDocumentChunks(selectedDocument.id);
        }
    };

    const closeDocumentViewer = () => {
        setViewerOpen(false);
        setSelectedDocument(null);
        setDocumentPages([]);
        setDocumentChunks([]);
        setViewerMode('page');
        setSearchQuery('');
        setSearchResults([]);
        setCurrentResultIndex(0);
        setCurrentPageNum(1);
    };

    // Search logic - find all matches
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setCurrentResultIndex(0);
            return;
        }

        const results = [];
        const source = viewerMode === 'chunk' ? documentChunks : documentPages;
        source.forEach(item => {
            const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            let match;
            let matchIndex = 0;
            while ((match = regex.exec(item.content)) !== null) {
                results.push({
                    pageId: item.id,
                    pageNumber: item.pageNumber,
                    matchIndex: matchIndex++
                });
            }
        });
        setSearchResults(results);
        setCurrentResultIndex(0);
    }, [searchQuery, documentPages, documentChunks, viewerMode]);

    // 개념/관계 사전 용어 로드 (하이라이트용)
    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        (async () => {
            try {
                const [concepts, relations] = await Promise.all([
                    dictionaryApi.getConcepts({ workspaceId: id, size: 10000 }),
                    dictionaryApi.getRelations({ workspaceId: id, size: 10000 }),
                ]);
                const terms = [];
                const pushItem = (it) => {
                    if (!it) return;
                    if (it.label) terms.push(it.label);
                    if (it.labelEn) terms.push(it.labelEn);
                    if (it.synonym) {
                        String(it.synonym).split(/[,;|]/).forEach(s => {
                            const t = s.trim();
                            if (t) terms.push(t);
                        });
                    }
                };
                concepts?.content?.forEach(pushItem);
                relations?.content?.forEach(pushItem);
                if (cancelled) return;
                const unique = [...new Set(terms)]
                    .filter(t => t && t.length >= 2)
                    .sort((a, b) => b.length - a.length);
                setHighlightTerms(unique);
            } catch (err) {
                console.error('Failed to load dictionary terms:', err);
            }
        })();
        return () => { cancelled = true; };
    }, [id]);

    // 사전 용어 매칭용 정규식 (길이 내림차순 정렬된 터미네이션으로 longest-match)
    const dictRegex = useMemo(() => {
        if (!highlightTerms || highlightTerms.length === 0) return null;
        const escaped = highlightTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        return new RegExp(`(${escaped.join('|')})`, 'gi');
    }, [highlightTerms]);

    // Highlight function (검색어 + 사전 용어)
    const highlightText = (text, query, pageId) => {
        if (!text) return text;
        const hasQuery = query && query.trim().length > 0;

        // 1단계: 검색어 하이라이트 (있을 경우) — 기존 로직 유지
        let nodes;
        if (hasQuery) {
            const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
            let matchIndex = 0;
            nodes = parts.map((part, i) => {
                if (part.toLowerCase() === query.toLowerCase()) {
                    const isCurrent = searchResults[currentResultIndex]?.pageId === pageId &&
                        searchResults[currentResultIndex]?.matchIndex === matchIndex;
                    matchIndex++;
                    return (
                        <mark key={`q-${i}`} className={isCurrent ? 'highlight-current' : 'highlight'}>
                            {part}
                        </mark>
                    );
                }
                return { __text: part, __key: `t-${i}` };
            });
        } else {
            nodes = [{ __text: text, __key: 't-0' }];
        }

        // 2단계: 남은 일반 텍스트에 사전 용어 하이라이트
        if (!dictRegex) {
            return nodes.map(n => (n && n.__text !== undefined ? n.__text : n));
        }
        const result = [];
        nodes.forEach(n => {
            if (n && n.__text !== undefined) {
                const sub = n.__text.split(dictRegex);
                sub.forEach((piece, j) => {
                    if (!piece) return;
                    if (j % 2 === 1) {
                        result.push(
                            <mark key={`${n.__key}-d-${j}`} className="dict-highlight">{piece}</mark>
                        );
                    } else {
                        result.push(piece);
                    }
                });
            } else {
                result.push(n);
            }
        });
        return result;
    };

    const goToPreviousResult = () => {
        if (currentResultIndex > 0) {
            setCurrentResultIndex(currentResultIndex - 1);
        }
    };

    const goToNextResult = () => {
        if (currentResultIndex < searchResults.length - 1) {
            setCurrentResultIndex(currentResultIndex + 1);
        }
    };

    // --- Event Handlers: Tabs ---
    const isReadOnly = notebook?.role !== 'Owner';

    // --- State: 워크스페이스 이름 인라인 편집 ---
    const [editingName, setEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState('');

    const handleNameSave = async () => {
        const trimmed = editNameValue.trim();
        setEditingName(false);
        if (!trimmed || trimmed === notebook.name) return;
        try {
            await workspaceApi.update(id, { ...notebook, name: trimmed });
            setNotebook(prev => ({ ...prev, name: trimmed }));
        } catch (e) {
            console.error('워크스페이스 이름 수정 실패:', e);
        }
    };

    // --- State: Sync Status (from DB) ---
    const [syncStatus, setSyncStatus] = useState('SYNCED'); // SYNCED, SYNC_NEEDED, SYNCING

    // --- Cache Invalidation: 동기화 상태 또는 문서 선택 변경 시 캐시 클리어 ---
    useEffect(() => {
        const newKey = `${syncStatus}-${selectedDocumentIds.sort().join(',')}`;
        if (cacheInvalidationKey !== null && cacheInvalidationKey !== newKey) {
            setCachedGraphData(null);
            setCachedDictionaryData(null);
        }
        setCacheInvalidationKey(newKey);
    }, [syncStatus, selectedDocumentIds]);

    // ... existing handlers ...

    // 삭제 경과 시간 타이머 (부모에서 관리 — 사이드바 접기/펴기에도 유지)
    useEffect(() => {
        if (!deletingDocId) {
            deletingStartRef.current = null;
            setDeleteElapsed(0);
            return;
        }
        deletingStartRef.current = Date.now();
        setDeleteElapsed(0);
        const timer = setInterval(() => {
            if (deletingStartRef.current) {
                setDeleteElapsed(Math.floor((Date.now() - deletingStartRef.current) / 1000));
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [deletingDocId]);

    const handleDeleteDocument = async (doc) => {
        if (isReadOnly) return;
        const confirmed = await showConfirm(`'${doc.filename}' 문서를 삭제하시겠습니까?`);
        if (!confirmed) return;
        try {
            setDeletingDocId(doc.id);
            await documentApi.delete(doc.id);
            setDocuments(prev => prev.filter(d => d.id !== doc.id));
            setSelectedDocumentIds(prev => prev.filter(id => id !== doc.id));
            // 삭제 API에서 ArangoDB cleanup + SYNCED 처리 완료 후 응답 → 워크스페이스 상태 갱신
            fetchNotebook();
        } catch (err) {
            console.error('삭제 실패:', err);
            showAlert('문서 삭제에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setDeletingDocId(null);
        }
    };

    const handleReprocessDocument = async (doc) => {
        if (isReadOnly) return;
        try {
            await documentApi.startPipeline(Number(id), doc.id);
            showAlert(`'${doc.filename}' 파이프라인 재실행을 시작했습니다.`, 'success');
            // 상태를 PROCESSING으로 변경하고 폴링 시작 (waitForStart=true: 비동기 시작 대기)
            setDocuments(prev => prev.map(d =>
                d.id === doc.id ? { ...d, pipelineStatus: 'PROCESSING' } : d
            ));
            startProgressPolling(doc.id, true);
        } catch (err) {
            console.error('재실행 실패:', err);
            showAlert('파이프라인 재실행에 실패했습니다.', 'error');
        }
    };

    const handleSourceSync = async (doc) => {
        if (isReadOnly) return;
        try {
            // 1. 갱신 정보 조회
            const syncInfo = await structuredApi.getSyncInfo(doc.id);
            if (!syncInfo.canSync) {
                showAlert('이 소스는 갱신이 불가능합니다. (DB 연결 정보가 없거나 DATABASE 타입이 아닙니다)', 'error');
                return;
            }

            const msg = syncInfo.estimatedNewRecords > 0
                ? `${syncInfo.estimatedNewRecords}건의 신규 데이터가 감지되었습니다.\n(현재 DB: ${syncInfo.currentDbCount.toLocaleString()}건, 기존: ${(syncInfo.lastSyncedCount || 0).toLocaleString()}건)\n\n갱신하시겠습니까?`
                : `신규 데이터가 감지되지 않았습니다.\n(현재 DB: ${syncInfo.currentDbCount.toLocaleString()}건)\n\n그래도 갱신을 시도하시겠습니까?`;

            // 2. 사용자 확인
            const confirmed = await showConfirm(msg);
            if (!confirmed) return;

            // 3. 갱신 실행
            const result = await structuredApi.syncSource(doc.id);
            showAlert(result.message, 'success');

            if (result.newRecords > 0) {
                // 처리가 시작되었으므로 상태 업데이트 + 폴링
                setDocuments(prev => prev.map(d =>
                    d.id === doc.id ? { ...d, pipelineStatus: 'PROCESSING' } : d
                ));
                startProgressPolling(doc.id, true);
            }

            // 문서 목록 갱신 (totalRecords 등 업데이트)
            fetchDocuments();
        } catch (err) {
            console.error('소스 갱신 실패:', err);
            showAlert('소스 갱신에 실패했습니다. 다시 시도해주세요.', 'error');
        }
    };

    const handleRenameDocument = (doc) => {
        if (isReadOnly) return;
        setDocumentToRename(doc);
        setRenameDialogOpen(true);
    };

    const handleRenameConfirm = async (newTitle) => {
        try {
            await documentApi.rename(documentToRename.id, newTitle);
            console.log("Renaming to", newTitle);
            setDocuments(prev => prev.map(d => d.id === documentToRename.id ? { ...d, filename: newTitle } : d));
            setRenameDialogOpen(false);
            setDocumentToRename(null);
        } catch (err) {
            console.error('이름 변경 실패:', err);
        }
    };

    const handleUploadComplete = () => {
        fetchDocuments();
        setUploadModalOpen(false);
    };

    const handleSync = async () => {
        if (isReadOnly) return;

        // Check if all documents are selected
        if (selectedDocumentIds.length !== documents.length) {
            showAlert('동기화를 진행하려면 모든 문서를 선택해야 합니다.');
            return;
        }

        if (syncStatus === 'SYNCED') {
            const confirmed = await showConfirm('변경된 사항이 없습니다. 그래도 동기화를 진행하시겠습니까?');
            if (!confirmed) return;
        } else {
            const confirmed = await showConfirm('ArangoDB와 동기화를 진행하시겠습니까?');
            if (!confirmed) return;
        }

        setIsSyncing(true);
        setSyncStatus('SYNCING'); // Show "동기화 중" status
        setSyncProgress(0);

        try {
            const jobId = await ontologyApi.sync(id, true);
            console.log("Sync started, jobId:", jobId);
            setSyncJobId(jobId);
        } catch (error) {
            showAlert('동기화 시작 중 오류가 발생했습니다.', 'error');
            console.error('Sync error:', error);
            setSyncStatus('SYNC_NEEDED'); // Revert to sync needed on error
            setIsSyncing(false);
        }
    };

    // Sync Polling Effect
    useEffect(() => {
        if (!syncJobId) return;

        const pollSync = async () => {
            try {
                const status = await ontologyApi.getSyncProgress(syncJobId);

                if (status.totalItems > 0) {
                    const percent = Math.floor((status.processedItems / status.totalItems) * 100);
                    setSyncProgress(percent);
                }

                if (status.status === 'COMPLETED') {
                    setSyncStatus('SYNCED');
                    setIsSyncing(false);
                    setSyncJobId(null);
                    showAlert('동기화가 완료되었습니다.');
                    // Refresh dictionary/graph view if needed?
                } else if (status.status === 'FAILED') {
                    setSyncStatus('SYNC_NEEDED');
                    setIsSyncing(false);
                    setSyncJobId(null);
                    showAlert('지식그래프 동기화에 실패했습니다. 잠시 후 다시 시도해주세요.', 'error');
                }
            } catch (err) {
                console.error("Sync polling error:", err);
            }
        };

        const intervalId = setInterval(pollSync, 1000);
        return () => clearInterval(intervalId);
    }, [syncJobId]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedDocumentIds(documents.map(d => d.id));
        } else {
            setSelectedDocumentIds([]);
        }
    };

    // 사이드 패널 토글: panel-center 가 flex grow/shrink 로 자연스럽게 폭을
    // 조정하므로 별도의 스크롤 보정이 필요 없음(layout 자체에 가로 스크롤
    // 미발생). 좌/우 끝 기준 접힘 시각 효과는 CSS transition: width 만으로 OK.
    const handleToggleLeftSidebar = () => setLeftSidebarOpen((prev) => !prev);
    const handleToggleRightSidebar = () => setRightSidebarOpen((prev) => !prev);

    const handleTabChange = (tab) => {
        if ((tab === 'graph' || tab === 'dictionary') && selectedDocumentIds.length === 0 && documents.length > 0) {
            setSelectedDocumentIds(documents.map(d => d.id));
        }

        setActiveTab(tab);

        /* 탭별 레이아웃: LNB 접기 + 채팅만 좌우 패널 펼침 / 지식그래프·사전은 좌우 접음 */
        setLnbCollapsed?.(true);
        if (tab === 'chat') {
            setLeftSidebarOpen(true);
            setRightSidebarOpen(true);
        } else if (tab === 'graph' || tab === 'dictionary') {
            setLeftSidebarOpen(false);
            setRightSidebarOpen(false);
        }
    };

    // 노트북 상세 진입 시 LNB 접기 (탭별 패널은 초기 state 또는 탭 전환에서 처리)
    useEffect(() => {
        setLnbCollapsed?.(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- 마운트 시 1회만
    }, []);

    // --- Persona Handlers ---
    const handlePersonaSelect = (role) => {
        if (role === null) {
            // "기초값" 선택
            setActivePersonaText(null);
            setActivePersonaName('기초값');
        } else if (!role.promptText) {
            return;
        } else if (activePersonaText === role.promptText && activePersonaName === role.roleName) {
            // 같은 페르소나 재클릭 → 기초값으로 복원
            setActivePersonaText(null);
            setActivePersonaName('기초값');
        } else {
            setActivePersonaText(role.promptText);
            setActivePersonaName(role.roleName);
        }
    };

    // --- Report Handlers ---
    const handleGenerateReport = async (data) => {
        setReportModalOpen(false);
        setReportResultModalOpen(true);
        setReportStatus('PROCESSING');
        setReportResult(null);
        setReportError(null);
        setReportProgress({ message: 'AI가 문서를 분석하고 있습니다...', percentage: 10 });

        try {
            const jobId = await reportApi.generate({
                workspaceId: Number(id),
                documentIds: selectedDocumentIds,
                template: data.template,
                customPrompt: data.customPrompt,
            });

            // Polling for status
            const pollInterval = setInterval(async () => {
                try {
                    const job = await reportApi.getStatus(jobId);
                    if (job.status === 'COMPLETED') {
                        clearInterval(pollInterval);
                        const resultData = await reportApi.getResult(jobId);
                        setReportStatus('COMPLETED');
                        setReportResult(resultData.result || resultData);
                        setReportProgress(null);
                    } else if (job.status === 'FAILED') {
                        clearInterval(pollInterval);
                        setReportStatus('FAILED');
                        setReportError(job.error || '보고서 생성에 실패했습니다.');
                        setReportProgress(null);
                    } else {
                        setReportProgress({
                            message: job.message || 'AI가 문서를 분석하고 있습니다...',
                            percentage: job.progress || 30,
                        });
                    }
                } catch (err) {
                    clearInterval(pollInterval);
                    setReportStatus('FAILED');
                    setReportError('상태 확인 중 오류가 발생했습니다.');
                    setReportProgress(null);
                }
            }, 3000);
        } catch (err) {
            setReportStatus('FAILED');
            setReportError(err.message || '보고서 생성 요청에 실패했습니다.');
            setReportProgress(null);
        }
    };

    // --- Render ---
    if (loading) return <div className="loading-screen">Loading Workspace...</div>;

    // Null safety: prevent crash if notebook hasn't loaded yet
    if (!notebook) {
        return <div className="loading-screen">Loading Workspace Data...</div>;
    }
  
    const showNotebookPageHeader = true;   //콘텐츠 타이틀 가리려면 false

    return (
        <>
            {showNotebookPageHeader && (
                <PageHeader
                    title={notebook.name || 'Untitled notebook'}
                    breadcrumbs={[
                        '워크스페이스',
                        '내 워크스페이스',
                        localStorage.getItem('admin_selected_domain_name')
                            || user?.domain
                            || user?.email?.split('@')[0]
                            || 'admin',
                    ]}
                />
            )}

            <div className="notebook-layout">
                {/* Left Panel: Sources */}
                <div className={`panel panel-left ${leftSidebarOpen ? '' : 'collapsed'} ${viewerOpen ? 'viewer-active' : ''}`}>
                    <div className="panel-header">
                        {leftSidebarOpen && (
                            <div className="panel-title notebook-panel-title">
                                {isReadOnly && <Users size={16} color="#5f6368" />}
                                <span className="notebook-panel-title-icon">{notebook.icon || '📄'}</span>
                                {editingName ? (
                                    <input
                                        autoFocus
                                        value={editNameValue}
                                        onChange={e => setEditNameValue(e.target.value)}
                                        onBlur={handleNameSave}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleNameSave();
                                            if (e.key === 'Escape') { setEditingName(false); setEditNameValue(notebook.name || ''); }
                                        }}
                                        className="notebook-panel-title-input"
                                    />
                                ) : (
                                    <span
                                        onClick={() => { if (!isReadOnly) { setEditingName(true); setEditNameValue(notebook.name || ''); } }}
                                        className={`notebook-panel-title-text ${isReadOnly ? 'readonly' : ''}`}
                                        title={isReadOnly ? notebook.name : '클릭하여 이름 수정'}
                                    >
                                        <span className="notebook-panel-title-name">{notebook.name || 'Untitled notebook'}</span>
                                        {!isReadOnly && <Pen size={12} className="notebook-panel-title-pen" />}
                                    </span>
                                )}
                            </div>
                        )}
                        <button className="panel-toggle-btn" onClick={handleToggleLeftSidebar}>
                            {leftSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                        </button>
                    </div>
                    <div className="panel-body">
                        {leftSidebarOpen ? (
                            <>
                                {/* Sync Status Warning - Compact */}
                                {!viewerOpen && syncStatus === 'SYNC_NEEDED' && (
                                    <div className="sync-status-warning sync-status-warning-needed">
                                        <span>⚠️</span>
                                        <span><strong>동기화 필요</strong> - 지식그래프/챗봇 제한됨</span>
                                    </div>
                                )}
                                {isSyncing && (
                                    <div className="sync-status-warning sync-status-warning-running">
                                        <span>🔄</span>
                                        <span>동기화 진행 중... ({syncProgress}%)</span>
                                        <div className="sync-progress-track">
                                            <div className="sync-progress-fill" style={{ width: `${syncProgress}%` }} />
                                        </div>
                                    </div>
                                )}
                                {!viewerOpen && (
                                    <div className="source-actions source-actions-stack">
                                        {!isReadOnly && (
                                            <div className="source-panel-group source-panel-group--actions">
                                                <button type="button" className="add-source-btn" onClick={() => setUploadModalOpen(true)}>
                                                    <Plus size={18} aria-hidden /> 소스 추가
                                                </button>
                                                <div className="source-meta-btn-row">
                                                    <button
                                                        type="button"
                                                        className={`source-meta-btn ${bizMetaText ? 'is-active' : ''}`}
                                                        onClick={() => setBizMetaOpen(true)}
                                                    >
                                                        <BookOpen size={14} aria-hidden /> 비즈 용어
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`source-meta-btn ${itMetaText ? 'is-active' : ''}`}
                                                        onClick={() => setItMetaOpen(true)}
                                                    >
                                                        <Database size={14} aria-hidden /> IT 용어
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="source-panel-group source-panel-group--search">
                                            <div className="source-search-wrap">
                                                <Search size={16} className="source-search-icon" />
                                                <input
                                                    type="text"
                                                    placeholder="찾아내 새 소스 검색하세요"
                                                    className="source-search-input"
                                                    disabled={documents.length === 0}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className={`source-list-section ${viewerOpen ? 'source-list-section--viewer' : ''}`}>
                                    {!viewerOpen && (
                                        <div className="source-panel-group source-panel-group--list-tools">
                                            <div className="source-toolbar-row">
                                                <label className={`source-select-all-label${documents.length === 0 ? ' is-disabled' : ''}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={documents.length > 0 && selectedDocumentIds.length === documents.length}
                                                        onChange={handleSelectAll}
                                                        className="source-select-all-checkbox"
                                                        disabled={documents.length === 0}
                                                    />
                                                    모두 선택
                                                </label>
                                                <div className="source-sync-group">
                                                    {!isReadOnly && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={handleSync}
                                                                title="동기화 (ArangoDB)"
                                                                disabled={isSyncing || documents.length === 0}
                                                                className={`source-sync-btn ${syncStatus === 'SYNCED' ? 'is-synced' : 'is-needed'}${documents.length === 0 ? ' is-disabled' : ''}`}
                                                            >
                                                                <RefreshCw
                                                                    size={16}
                                                                    className={syncStatus === 'SYNCING' ? "spin-animation" : ""}
                                                                />
                                                            </button>
                                                            <span className={`source-sync-text ${syncStatus === 'SYNCED' ? 'is-synced' : 'is-needed'}${documents.length === 0 ? ' is-disabled' : ''}`}>
                                                                {syncStatus === 'SYNCED' && '동기화 완료'}
                                                                {syncStatus === 'SYNC_NEEDED' && '동기화 필요'}
                                                                {syncStatus === 'SYNCING' && '동기화 중'}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className={`source-list ${viewerOpen ? 'viewer-mode' : ''}`}>
                                    {!viewerOpen ? (
                                        // Document List
                                        documents.length === 0 ? (
                                            <div className="source-empty-state">
                                                <Upload size={32} className="source-empty-icon" />
                                                <div className="source-empty-title">
                                                    등록된 문서가 없습니다
                                                </div>
                                                <div className="source-empty-description">
                                                    PDF, CSV 파일을 업로드하거나 DB를 연결하여 지식을 추가하세요.
                                                </div>
                                            </div>
                                        ) : (
                                            documents.map(doc => (
                                                <DocumentSourceItem
                                                    key={doc.id}
                                                    document={doc}
                                                    progress={progressMap[doc.id]}
                                                    isChecked={selectedDocumentIds.includes(doc.id)}
                                                    onCheckChange={handleCheckDocument}
                                                    onSelect={() => {
                                                        if (doc.sourceType === 'CSV' || doc.sourceType === 'DATABASE') {
                                                            setCsvMappingDoc({
                                                                ...doc,
                                                                _initialTab: (doc.pipelineStatus === 'COMPLETED' || doc.pipelineStatus === 'PROCESSING' || doc.columnMappingStatus === 'PROCESSING' || doc.columnMappingStatus === 'COMPLETED')
                                                                    ? 'status' : 'mapping'
                                                            });
                                                        } else {
                                                            setSelectedDocument(doc);
                                                            setViewerOpen(true);
                                                            fetchDocumentPages(doc.id);
                                                        }
                                                    }}
                                                    onRename={handleRenameDocument}
                                                    onDelete={handleDeleteDocument}
                                                    onReprocess={handleReprocessDocument}
                                                    onSync={handleSourceSync}
                                                    readOnly={isReadOnly}
                                                    deleting={deletingDocId === doc.id}
                                                    deleteElapsedProp={deletingDocId === doc.id ? deleteElapsed : 0}
                                                />
                                            ))
                                        )
                                    ) : (
                                        // Document Viewer
                                        <div className="document-viewer-panel">
                                            {/* Header */}
                                            <div className="viewer-panel-header">
                                                <h3 className="viewer-document-title">{selectedDocument?.filename}</h3>
                                                <button
                                                    className="close-viewer-btn"
                                                    onClick={closeDocumentViewer}
                                                    aria-label="닫기"
                                                >
                                                    ✕
                                                </button>
                                            </div>

                                            {/* Viewer Mode Tabs (페이지 / 청크) */}
                                            <div className="viewer-mode-tabs">
                                                <button
                                                    className={`viewer-mode-tab ${viewerMode === 'page' ? 'active' : ''}`}
                                                    onClick={() => handleViewerModeChange('page')}
                                                >
                                                    페이지 뷰
                                                </button>
                                                <button
                                                    className={`viewer-mode-tab ${viewerMode === 'chunk' ? 'active' : ''}`}
                                                    onClick={() => handleViewerModeChange('chunk')}
                                                >
                                                    청크 뷰 {documentChunks.length > 0 && `(${documentChunks.length})`}
                                                </button>
                                            </div>

                                            {/* Search & Controls */}
                                            <div className="viewer-controls">
                                                <div className="search-section">
                                                    <input
                                                        type="text"
                                                        placeholder={viewerMode === 'page' ? "페이지 내 검색..." : "청크 내 검색..."}
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="search-input"
                                                    />
                                                    {searchResults.length > 0 && (
                                                        <div className="search-navigation">
                                                            <button
                                                                onClick={goToPreviousResult}
                                                                disabled={currentResultIndex === 0}
                                                                title="이전 찾기"
                                                            >
                                                                ▲
                                                            </button>
                                                            <span className="result-counter">
                                                                {currentResultIndex + 1} / {searchResults.length}
                                                            </span>
                                                            <button
                                                                onClick={goToNextResult}
                                                                disabled={currentResultIndex === searchResults.length - 1}
                                                                title="다음 찾기"
                                                            >
                                                                ▼
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="pagination-controls">
                                                    {(() => {
                                                        const listLen = viewerMode === 'page' ? documentPages.length : documentChunks.length;
                                                        const totalPg = Math.ceil(listLen / itemsPerPage) || 1;
                                                        return (
                                                            <>
                                                                <button
                                                                    onClick={() => setCurrentPageNum(p => Math.max(1, p - 1))}
                                                                    disabled={currentPageNum === 1}
                                                                >
                                                                    ◀
                                                                </button>
                                                                <span>{currentPageNum} / {totalPg}</span>
                                                                <button
                                                                    onClick={() => setCurrentPageNum(p => Math.min(totalPg, p + 1))}
                                                                    disabled={currentPageNum >= totalPg}
                                                                >
                                                                    ▶
                                                                </button>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="viewer-content">
                                                {viewerMode === 'chunk' ? (
                                                    loadingChunks ? (
                                                        <div className="viewer-loading">청크 로딩 중...</div>
                                                    ) : documentChunks.length === 0 ? (
                                                        <div className="viewer-loading">청크가 없습니다. 문서 처리를 먼저 완료해주세요.</div>
                                                    ) : (
                                                        documentChunks
                                                            .slice((currentPageNum - 1) * itemsPerPage, currentPageNum * itemsPerPage)
                                                            .map(chunk => (
                                                                <div
                                                                    key={chunk.id}
                                                                    className="nb-doc-section nb-doc-section--interactive"
                                                                    onClick={() => setChunkModalPage({
                                                                        id: chunk.id,
                                                                        pageNumber: chunk.pageNumber,
                                                                        content: chunk.content,
                                                                        __isChunk: true,
                                                                        chunkIndex: chunk.chunkIndex
                                                                    })}
                                                                    title="클릭하여 전체 내용 보기"
                                                                >
                                                                    <div className="nb-doc-block-head">
                                                                        <span>Chunk #{chunk.chunkIndex}</span>
                                                                        {chunk.pageNumber != null && (
                                                                            <span style={{
                                                                                fontSize: '10px',
                                                                                padding: '1px 6px',
                                                                                borderRadius: '3px',
                                                                                marginLeft: '6px',
                                                                                background: '#e3f2fd',
                                                                                color: '#1565c0'
                                                                            }}>
                                                                                p.{chunk.pageNumber}
                                                                            </span>
                                                                        )}
                                                                        {chunk.ontologyStatus === 'COMPLETED' && (
                                                                            <span style={{
                                                                                fontSize: '10px',
                                                                                padding: '1px 6px',
                                                                                borderRadius: '3px',
                                                                                marginLeft: '4px',
                                                                                background: '#e8f5e9',
                                                                                color: '#2e7d32'
                                                                            }}>
                                                                                온톨로지 추출됨
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="nb-doc-block-body">
                                                                        {highlightText(chunk.content, searchQuery, chunk.id)}
                                                                    </div>
                                                                </div>
                                                            ))
                                                    )
                                                ) : loadingPages ? (
                                                    <div className="viewer-loading">로딩 중...</div>
                                                ) : (
                                                    documentPages
                                                        .slice((currentPageNum - 1) * itemsPerPage, currentPageNum * itemsPerPage)
                                                        .map(page => (
                                                            <div
                                                                key={page.id}
                                                                className="nb-doc-section nb-doc-section--interactive"
                                                                onClick={() => setChunkModalPage(page)}
                                                                title="클릭하여 전체 내용 보기"
                                                            >
                                                                <div className="nb-doc-block-head">
                                                                    <span>Page {page.pageNumber}</span>
                                                                    {page.contentType && page.contentType !== 'TEXT' && (
                                                                        <span style={{
                                                                            fontSize: '10px',
                                                                            padding: '1px 6px',
                                                                            borderRadius: '3px',
                                                                            marginLeft: '6px',
                                                                            background: page.contentType === 'IMAGE' ? '#e8f5e9'
                                                                                : page.contentType === 'TABLE' ? '#e3f2fd'
                                                                                : '#f3e5f5',
                                                                            color: page.contentType === 'IMAGE' ? '#2e7d32'
                                                                                : page.contentType === 'TABLE' ? '#1565c0'
                                                                                : '#7b1fa2'
                                                                        }}>
                                                                            {page.contentType === 'IMAGE' ? '이미지'
                                                                                : page.contentType === 'TABLE' ? '표'
                                                                                : page.contentType === 'MIXED' ? '혼합' : ''}
                                                                        </span>
                                                                    )}
                                                                    {page.layoutZone && page.layoutZone !== 'BODY' && (
                                                                        <span style={{
                                                                            fontSize: '10px',
                                                                            padding: '1px 6px',
                                                                            borderRadius: '3px',
                                                                            marginLeft: '4px',
                                                                            background: '#fff3e0',
                                                                            color: '#e65100'
                                                                        }}>
                                                                            {page.layoutZone === 'HEADER' ? '헤더'
                                                                                : page.layoutZone === 'FOOTER' ? '푸터' : page.layoutZone}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="nb-doc-block-body">
                                                                    {highlightText(page.content, searchQuery, page.id)}
                                                                </div>
                                                            </div>
                                                        ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                </div>
                            </>
                        ) : (
                            <div className="vertical-text">SOURCE</div>
                        )}
                    </div>
                </div>

                {/* Center Panel: Content */}
                <div className={`panel panel-center ${activeTab === 'dictionary' ? 'is-dictionary' : ''}`}>
                    <div className="tabs-header">
                        <div className={`tabs-primary ${isAdmin ? 'is-admin' : 'is-user'}`}>
                            <button
                                className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
                                onClick={() => handleTabChange('chat')}
                                disabled={selectedDocumentIds.length === 0 || syncStatus === 'SYNCING' || syncStatus === 'SYNC_NEEDED'}
                            >
                                <div className="tab-btn-content">
                                    <MessageSquare size={16} /> 채팅
                                </div>
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'graph' ? 'active' : ''}`}
                                onClick={() => handleTabChange('graph')}
                                disabled={selectedDocumentIds.length === 0 || syncStatus === 'SYNCING' || syncStatus === 'SYNC_NEEDED'}
                            >
                                <div className="tab-btn-content">
                                    <Network size={16} /> 지식 그래프
                                </div>
                            </button>
                            {isAdmin && (
                                <button
                                    className={`tab-btn ${activeTab === 'dictionary' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('dictionary')}
                                    disabled={selectedDocumentIds.length === 0}
                                >
                                    <div className="tab-btn-content">
                                        <Book size={16} /> 사전
                                    </div>
                                </button>
                            )}
                        </div>
                        {isAdmin && (
                            <button
                                className="tab-btn tab-btn-exp"
                                type="button"
                                onClick={handleOpenEXP}
                                title="온톨로지 사전 관리 화면으로 이동합니다 (새 탭)"
                            >
                                <div className="tab-btn-content">
                                    <span>온톨로지 관리</span>
                                    <ExternalLink size={14} aria-hidden />
                                </div>
                            </button>
                        )}
                    </div>

                    <div className="tab-content">
                        {activeTab === 'chat' && (
                            <div className="chat-container">
                                {/* Persona Selector Row */}
                                <div className="persona-selector-row">
                                    <span className="persona-selector-label">페르소나</span>
                                    <div className="persona-selector-buttons">
                                        <button
                                            className={`persona-selector-btn ${activePersonaText === null ? 'active' : ''}`}
                                            onClick={() => handlePersonaSelect(null)}
                                        >
                                            기초값
                                        </button>
                                        {workspaceRoles
                                            .filter(role => role.enabled !== false && role.promptText && role.promptText.trim() !== '')
                                            .map((role, idx) => (
                                                <button
                                                    key={role.id || idx}
                                                    className={`persona-selector-btn ${activePersonaText === role.promptText && role.promptText ? 'active' : ''}`}
                                                    onClick={() => handlePersonaSelect(role)}
                                                    disabled={!role.promptText}
                                                >
                                                    {role.roleName}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                                {messages.length > 0 && (
                                    <div style={{
                                        display: 'flex', justifyContent: 'flex-end',
                                        padding: '4px 8px', borderBottom: '1px solid #eee'
                                    }}>
                                        <button
                                            onClick={handleClearHistory}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '4px',
                                                padding: '4px 10px', fontSize: '12px', color: '#888',
                                                background: 'none', border: '1px solid #ddd', borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                            title="대화 초기화"
                                        >
                                            <Trash2 size={13} /> 대화 초기화
                                        </button>
                                    </div>
                                )}
                                <div className="chat-messages">
                                    {messages.length === 0 && (
                                        <div className="chat-empty-state" role="status">
                                            <div className="chat-empty-inner">
                                                <div className="chat-empty-icon" aria-hidden>
                                                    <MessageSquare size={48} strokeWidth={1.25} />
                                                </div>
                                                <p className="chat-empty-title">무엇이든 질문해보세요</p>
                                                <div className="chat-empty-desc">
                                                    업로드한 문서를 기반으로 지식그래프와 AI가 답변합니다.
                                                    {documents.length === 0 && (
                                                        <span className="chat-empty-hint">
                                                            먼저 좌측에서 문서를 추가해주세요.
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {messages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={`message ${msg.role} notebook-chat-message ${msg.role === 'user' ? 'is-user' : 'is-assistant'}`}
                                        >
                                            <div className={`notebook-chat-bubble ${msg.role === 'user' ? 'is-user' : ''} ${msg.type === 'debug' ? 'is-debug' : ''}`}>
                                                {msg.type === 'debug' ? (
                                                    <div>
                                                        <div className="notebook-debug-label">
                                                            {msg.debugLabel}
                                                        </div>
                                                        <pre className="notebook-debug-pre">
                                                            {msg.content}
                                                        </pre>
                                                    </div>
                                                ) : (
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                                )}

                                                {/* Phase 3: [ACTION: xxx] 패턴 감지 → 실행 버튼 렌더링 */}
                                                {msg.role === 'assistant' && msg.content && (() => {
                                                    const actionMatches = [...msg.content.matchAll(/\[ACTION:\s*([^\]]+)\]/g)];
                                                    if (actionMatches.length === 0) return null;
                                                    return (
                                                        <div className="notebook-action-box">
                                                            <span className="notebook-action-label">🎯 실행 가능 Action:</span>
                                                            {actionMatches.map((m, i) => (
                                                                <button key={i}
                                                                    onClick={async () => {
                                                                        const actionName = m[1].trim();
                                                                        const ok = await showConfirm(`"${actionName}" Action 을 실행하시겠습니까?`);
                                                                        if (!ok) return;
                                                                        try {
                                                                            // Action 이름으로 ID 를 조회하기 어려우므로 이름을 표시만 함.
                                                                            // 실제 실행은 어드민 Action 탭에서 수동 실행 권장.
                                                                            showAlert(`"${actionName}" Action 실행 요청됨.\n어드민센터 > Action > 수동 실행에서 진행하세요.`);
                                                                        } catch (e) { showAlert('Action 실행 실패: ' + e.message); }
                                                                    }}
                                                                    className="notebook-action-btn"
                                                                >
                                                                    ▶ {m[1].trim()}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    );
                                                })()}

                                                {msg.relatedQuestions && msg.relatedQuestions.length > 0 && (
                                                    <div className="notebook-followup-wrap">
                                                        <div className="notebook-followup-title">
                                                            💡 후속 질문
                                                        </div>
                                                        <div className="notebook-followup-list">
                                                            {msg.relatedQuestions.map((q, i) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => handleSendMessage(null, q)}
                                                                    disabled={isProcessing}
                                                                    className="notebook-followup-btn"
                                                                >
                                                                    {q}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* 출처 인용 */}
                                                {msg.sources && msg.sources.length > 0 && (
                                                    <div style={{ marginTop: '12px', borderTop: '1px solid #e8e8e8', paddingTop: '10px' }}>
                                                        <div style={{
                                                            fontSize: '11px', color: '#888', marginBottom: '6px',
                                                            display: 'flex', alignItems: 'center', gap: '4px'
                                                        }}>
                                                            <FileText size={12} /> 출처
                                                        </div>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                            {(() => {
                                                                const seen = new Set();
                                                                return msg.sources
                                                                    .filter(s => {
                                                                        const key = s.documentName || s.label || s.documentId;
                                                                        if (seen.has(key)) return false;
                                                                        seen.add(key);
                                                                        return true;
                                                                    })
                                                                    .slice(0, 5)
                                                                    .map((s, i) => (
                                                                        <span key={i} style={{
                                                                            padding: '2px 8px',
                                                                            backgroundColor: s.type === 'RAG' ? '#e8f0fe' : '#fef7e0',
                                                                            borderRadius: '12px',
                                                                            fontSize: '11px',
                                                                            color: s.type === 'RAG' ? '#1967d2' : '#b06000',
                                                                            cursor: s.documentId ? 'pointer' : 'default',
                                                                            whiteSpace: 'nowrap'
                                                                        }}
                                                                        title={s.page ? `${s.documentName} - ${s.page}페이지` : (s.documentName || s.label)}
                                                                        onClick={() => {
                                                                            if (s.documentId) {
                                                                                const doc = documents.find(d => d.id === s.documentId);
                                                                                if (doc) {
                                                                                    setSelectedDocument(doc);
                                                                                    setViewerOpen(true);
                                                                                    fetchDocumentPages(s.documentId);
                                                                                    if (s.page) setCurrentPageNum(s.page);
                                                                                }
                                                                            }
                                                                        }}>
                                                                            {s.type === 'RAG' ? '📄' : '🔗'} {s.documentName || s.label}{s.page ? ` p.${s.page}` : ''}
                                                                        </span>
                                                                    ));
                                                            })()}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Save / Copy buttons for non-debug assistant messages */}
                                                {msg.role === 'assistant' && msg.type !== 'debug' && (
                                                    <div className="notebook-chat-actions">
                                                        <button
                                                            onClick={() => handleSaveChat(idx)}
                                                            className="notebook-chat-action-btn"
                                                        >
                                                            <Save size={12} /> 저장
                                                        </button>
                                                        <button
                                                            onClick={() => handleCopyChat(msg.content)}
                                                            className="notebook-chat-action-btn"
                                                        >
                                                            <Copy size={12} /> 복사
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="notebook-chat-time">
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))}
                                    {isProcessing && (
                                        <div className="message assistant notebook-chat-message is-assistant">
                                            <div className="thinking-indicator notebook-thinking-indicator">
                                                <span className="thinking-dots">AI가 생각하고 있어요</span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                                {activePersonaName && (
                                    <div className="active-persona-banner">
                                        <span className="active-persona-text">
                                            {activePersonaName} 페르소나로 답변
                                            <button
                                                onClick={() => { setActivePersonaText(null); setActivePersonaName(null); }}
                                                className="active-persona-close-btn"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    </div>
                                )}
                                <div
                                    className={`message-input-area message-input-area-inline ${selectedDocumentIds.length === 0 || isProcessing ? 'is-disabled' : ''}`}
                                >
                                    <div className="message-input-composer">
                                        <textarea
                                            value={inputMessage}
                                            onChange={(e) => setInputMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder={selectedDocumentIds.length === 0 ? "대화할 문서를 선택해주세요." : "질문을 입력하세요..."}
                                            className={`message-input-textarea ${selectedDocumentIds.length === 0 ? 'is-disabled' : ''}`}
                                            disabled={isProcessing || selectedDocumentIds.length === 0}
                                            rows={1}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSendMessage}
                                            disabled={!inputMessage.trim() || isProcessing || selectedDocumentIds.length === 0}
                                            className="message-send-btn"
                                        >
                                            전송
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'graph' && (
                            <KnowledgeMapView
                                workspaceId={id}
                                documents={documents}
                                initialSelectedDocIds={selectedDocumentIds}
                                readOnly={isReadOnly}
                                cachedData={cachedGraphData}
                                onDataLoaded={(data) => setCachedGraphData(data)}
                            />
                        )}

                        {activeTab === 'dictionary' && isAdmin && (
                            <DictionaryView
                                workspaceId={id}
                                initialSelectedDocIds={selectedDocumentIds}
                                onUpdate={handleContentUpdate}
                                readOnly={true}
                                cachedData={cachedDictionaryData}
                                onDataLoaded={(data) => setCachedDictionaryData(data)}
                            />
                        )}
                    </div>
                </div>

                {/* Right Panel: Studio / Mini Graph */}
                <div className={`panel panel-right ${rightSidebarOpen ? '' : 'collapsed'}`}>
                    <div className="panel-header">
                        <button className="panel-toggle-btn panel-toggle-btn-right" onClick={handleToggleRightSidebar}>
                            {rightSidebarOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
                        </button>
                        {rightSidebarOpen && <div className="panel-title panel-title-right">스튜디오</div>}
                    </div>
                    {rightSidebarOpen && (
                        <div className="panel-body">

                            {/* Persona Management Button */}
                            <div className="studio-action-wrap">
                                <button
                                    type="button"
                                    onClick={() => setReportModalOpen(true)}
                                    disabled={selectedDocumentIds.length === 0}
                                    className={`studio-primary-btn ${selectedDocumentIds.length === 0 ? 'is-disabled' : ''}`}
                                >
                                    <FileText size={16} aria-hidden /> 페르소나 관리
                                </button>
                            </div>

                            <div className="studio-recent-box">
                                <h4 className="studio-recent-title">최근 생성물</h4>
                                {savedChats.length === 0 ? (
                                    <div className="studio-empty-text">
                                        저장된 항목이 없습니다.
                                    </div>
                                ) : (
                                    <div className="studio-saved-list">
                                        {savedChats.map(chat => (
                                            <div key={chat.id} className="studio-saved-item">
                                                <div
                                                    onClick={() => setExpandedSavedId(expandedSavedId === chat.id ? null : chat.id)}
                                                    className="studio-saved-item-header"
                                                >
                                                    {expandedSavedId === chat.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                    <span className="studio-saved-question">
                                                        {chat.question.length > 30 ? chat.question.substring(0, 30) + '...' : chat.question}
                                                    </span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteSavedChat(chat.id); }}
                                                        className="studio-saved-delete-btn"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                                {expandedSavedId === chat.id && (
                                                    <div className="studio-saved-expanded">
                                                        <div className="studio-saved-answer">
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{chat.answer}</ReactMarkdown>
                                                        </div>
                                                        <div className="studio-saved-actions">
                                                            <button
                                                                onClick={() => handleCopyChat(chat.answer)}
                                                                className="studio-saved-copy-btn"
                                                            >
                                                                <Copy size={11} /> 복사
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Mini Knowledge Graph (Chat Driven) */}
                            {chatGraphData.nodes.length > 0 && (
                                <MiniKnowledgeGraph
                                    nodes={chatGraphData.nodes}
                                    links={chatGraphData.links}
                                    onExpand={() => setIsGraphModalOpen(true)}
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Modals */}
                <AddSourceModal
                    isOpen={uploadModalOpen}
                    onClose={() => setUploadModalOpen(false)}
                    onUploadComplete={handleUploadComplete}
                    workspaceId={id}
                    domainId={notebook?.domainId}
                />

                {csvMappingDoc && (
                    <ColumnMappingModal
                        docId={csvMappingDoc.id}
                        filename={csvMappingDoc.filename}
                        workspaceId={id}
                        domainId={notebook?.domainId}
                        initialTab={csvMappingDoc._initialTab}
                        onClose={() => {
                            const closingDocId = csvMappingDoc.id;
                            setCsvMappingDoc(null);
                            // 모달 닫을 때 문서 상태 갱신 → fetchDocuments 내부에서 PROCESSING 폴링 자동 시작
                            // 약간의 지연: 백엔드가 PROCESSING으로 전환할 시간 확보
                            setTimeout(() => {
                                fetchDocuments();
                                // PROCESSING 전환이 늦을 수 있으므로 추가 폴링 시작 (이미 폴링 중이면 무시)
                                startProgressPolling(closingDocId, true);
                            }, 1500);
                        }}
                        onProcessingComplete={() => {
                            setCsvMappingDoc(null);
                            fetchDocuments();
                        }}
                    />
                )}

                <RenameDialog
                    isOpen={renameDialogOpen}
                    onClose={() => setRenameDialogOpen(false)}
                    title="문서 이름 변경"
                    currentName={documentToRename?.filename || ''}
                    onConfirm={handleRenameConfirm}
                />

                {/* Chunk(Page) 전체 내용 모달 */}
                {chunkModalPage && (
                    <div className="chunk-modal-overlay" onClick={() => setChunkModalPage(null)}>
                        <div className="chunk-modal" onClick={e => e.stopPropagation()}>
                            <div className="chunk-modal-header">
                                <div className="chunk-modal-title">
                                    <FileText size={16} />
                                    <span>
                                        {selectedDocument?.filename}
                                        {chunkModalPage.__isChunk
                                            ? ` - Chunk #${chunkModalPage.chunkIndex}${chunkModalPage.pageNumber != null ? ` (p.${chunkModalPage.pageNumber})` : ''}`
                                            : ` - Page ${chunkModalPage.pageNumber}`}
                                    </span>
                                </div>
                                <button
                                    className="chunk-modal-close"
                                    onClick={() => setChunkModalPage(null)}
                                    aria-label="닫기"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="chunk-modal-body">
                                {highlightText(chunkModalPage.content, searchQuery, chunkModalPage.id)}
                            </div>
                        </div>
                    </div>
                )}



                <ReportGenerationModal
                    isOpen={reportModalOpen}
                    onClose={() => {
                        setReportModalOpen(false);
                        fetchRoles();
                    }}
                    workspaceId={id}
                />

                <ReportResultModal
                    isOpen={reportResultModalOpen}
                    onClose={() => setReportResultModalOpen(false)}
                    status={reportStatus}
                    result={reportResult}
                    error={reportError}
                    progress={reportProgress}
                />

                {isGraphModalOpen && (
                    <KnowledgeGraphModal
                        isOpen={true}
                        onClose={() => setIsGraphModalOpen(false)}
                        workspaceId={id}
                        documents={documents}
                        initialSelectedDocIds={selectedDocumentIds}
                        overrideData={chatGraphData.nodes.length > 0 ? chatGraphData : null}
                    />
                )}

                {/* BizMeta Modal */}
                {bizMetaOpen && (
                    <div className="meta-modal-overlay" onClick={() => setBizMetaOpen(false)}>
                        <div className="meta-modal-content" onClick={e => e.stopPropagation()}>
                            <div className="meta-modal-header">
                                <h3 className="meta-modal-title">비즈니스 용어사전</h3>
                                <button onClick={() => setBizMetaOpen(false)} className="meta-modal-close-btn">
                                    <X size={20} />
                                </button>
                            </div>
                            <p className="meta-modal-description">
                                도메인 용어를 등록하면 AQL 생성 및 채팅 답변 품질이 향상됩니다.<br />
                                CSV 파일(이름, 설명) 업로드 또는 직접 편집할 수 있습니다.
                            </p>
                            <div className="meta-modal-actions">
                                <input
                                    ref={bizMetaFileRef}
                                    type="file"
                                    accept=".csv"
                                    className="meta-modal-hidden-input"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        try {
                                            setBizMetaSaving(true);
                                            const result = await workspaceApi.uploadBizMeta(id, file);
                                            setBizMetaText(result.data || '');
                                            showAlert('CSV 업로드 완료', 'success');
                                            fetchNotebook();
                                        } catch (err) {
                                            showAlert('CSV 파일 업로드에 실패했습니다. 파일 형식을 확인해주세요.', 'error');
                                        } finally {
                                            setBizMetaSaving(false);
                                            e.target.value = '';
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => bizMetaFileRef.current?.click()}
                                    disabled={bizMetaSaving}
                                    className="meta-modal-btn meta-modal-btn-secondary"
                                >
                                    <Upload size={14} /> CSV 업로드
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            setBizMetaSaving(true);
                                            await workspaceApi.saveBizMeta(id, bizMetaText);
                                            showAlert('용어사전 저장 완료', 'success');
                                            fetchNotebook();
                                        } catch (err) {
                                            showAlert('저장에 실패했습니다. 다시 시도해주세요.', 'error');
                                        } finally {
                                            setBizMetaSaving(false);
                                        }
                                    }}
                                    disabled={bizMetaSaving}
                                    className="meta-modal-btn meta-modal-btn-primary"
                                >
                                    <Save size={14} /> 저장
                                </button>
                            </div>
                            <textarea
                                value={bizMetaText}
                                onChange={e => setBizMetaText(e.target.value)}
                                placeholder='[&#10;  {"name":"공통코드","desc":"공통코드 그룹의 분류 안에서 실제 사용할 번호","owner":"홍길동","keyword":"공통코드, 코드"},&#10;  ...&#10;]'
                                className="meta-modal-textarea"
                            />
                        </div>
                    </div>
                )}

                {/* ItMeta Modal */}
                {itMetaOpen && (
                    <div className="meta-modal-overlay" onClick={() => setItMetaOpen(false)}>
                        <div className="meta-modal-content" onClick={e => e.stopPropagation()}>
                            <div className="meta-modal-header">
                                <h3 className="meta-modal-title">IT 용어사전 (컬럼 정보)</h3>
                                <button onClick={() => setItMetaOpen(false)} className="meta-modal-close-btn">
                                    <X size={20} />
                                </button>
                            </div>
                            <p className="meta-modal-description">
                                CSV 컬럼명과 의미를 등록하면 컬럼 매핑 및 AQL 생성 품질이 향상됩니다.<br />
                                CSV 파일(컬럼명, 설명) 업로드 또는 직접 편집할 수 있습니다.
                            </p>
                            <div className="meta-modal-actions">
                                <input
                                    ref={itMetaFileRef}
                                    type="file"
                                    accept=".csv"
                                    className="meta-modal-hidden-input"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        try {
                                            setItMetaSaving(true);
                                            const result = await workspaceApi.uploadItMeta(id, file);
                                            setItMetaText(result.data || '');
                                            showAlert('CSV 업로드 완료', 'success');
                                            fetchNotebook();
                                        } catch (err) {
                                            showAlert('CSV 파일 업로드에 실패했습니다. 파일 형식을 확인해주세요.', 'error');
                                        } finally {
                                            setItMetaSaving(false);
                                            e.target.value = '';
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => itMetaFileRef.current?.click()}
                                    disabled={itMetaSaving}
                                    className="meta-modal-btn meta-modal-btn-secondary"
                                >
                                    <Upload size={14} /> CSV 업로드
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            setItMetaSaving(true);
                                            await workspaceApi.saveItMeta(id, itMetaText);
                                            showAlert('IT 용어사전 저장 완료', 'success');
                                            fetchNotebook();
                                        } catch (err) {
                                            showAlert('저장에 실패했습니다. 다시 시도해주세요.', 'error');
                                        } finally {
                                            setItMetaSaving(false);
                                        }
                                    }}
                                    disabled={itMetaSaving}
                                    className="meta-modal-btn meta-modal-btn-primary"
                                >
                                    <Save size={14} /> 저장
                                </button>
                            </div>
                            <textarea
                                value={itMetaText}
                                onChange={e => setItMetaText(e.target.value)}
                                placeholder='[&#10;  {"table_name":"cls_m_code","table_desc":"코드마스터","column_name":"code_group","column_type":"varchar(50)","column_biz_meta":"공통코드그룹"},&#10;  ...&#10;]'
                                className="meta-modal-textarea"
                            />
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}

export default NotebookDetail;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useAlert } from '../context/AlertContext';
import './KnowledgeGraphModal.css';
import { API_URL } from '../config/api';
const isLocalAuthEnabled = import.meta.env.VITE_ENABLE_LOCAL_AUTH === 'true';
const LOCAL_GRAPH_KEY = 'localMockGraphByWorkspace';

const getDefaultLocalGraph = () => ({
    101: {
        nodes: [
            { _id: 'concept:cosmetics', _key: 'cosmetics', label_ko: '화장품', connectionCount: 6, isTopHub: true },
            { _id: 'concept:perfume', _key: 'perfume', label_ko: '향수', connectionCount: 4 },
            { _id: 'concept:brand', _key: 'brand', label_ko: '브랜드', connectionCount: 3 },
            { _id: 'concept:consumer', _key: 'consumer', label_ko: '소비자', connectionCount: 2 },
        ],
        links: [
            { _from: 'concept:perfume', _to: 'concept:cosmetics', label_ko: '포함한다' },
            { _from: 'concept:brand', _to: 'concept:perfume', label_ko: '출시한다' },
            { _from: 'concept:consumer', _to: 'concept:perfume', label_ko: '선호한다' },
        ],
    },
});

const getLocalGraphMap = () => {
    const raw = localStorage.getItem(LOCAL_GRAPH_KEY);
    if (!raw) {
        const defaults = getDefaultLocalGraph();
        localStorage.setItem(LOCAL_GRAPH_KEY, JSON.stringify(defaults));
        return defaults;
    }
    try {
        return JSON.parse(raw);
    } catch (_) {
        const defaults = getDefaultLocalGraph();
        localStorage.setItem(LOCAL_GRAPH_KEY, JSON.stringify(defaults));
        return defaults;
    }
};

export default function KnowledgeGraphModal({ isOpen, onClose, workspaceId, initialSelectedDocIds = [], documents = [], overrideData = null }) {
    const { showAlert } = useAlert();
    const [fullGraphData, setFullGraphData] = useState({ nodes: [], links: [] });
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const graphRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const containerRef = useRef(null);

    // Search States
    const [searchQuery, setSearchQuery] = useState('');
    const [depth, setDepth] = useState(1);
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [selectedDocumentIds, setSelectedDocumentIds] = useState(initialSelectedDocIds || []);
    const [isDocDropdownOpen, setIsDocDropdownOpen] = useState(false);

    // 메타 정보 (전체 그래프 규모)
    const [totalNodeCount, setTotalNodeCount] = useState(0);
    const [totalEdgeCount, setTotalEdgeCount] = useState(0);
    const [hasMore, setHasMore] = useState(false);

    // 확장된 노드 추적
    const [expandedNodes, setExpandedNodes] = useState(new Set());
    const [isExpanding, setIsExpanding] = useState(false);
    const initialFitDoneRef = useRef(false);

    // 로드된 노드 ID 추적 (확장 시 중복 제외용)
    const loadedNodeIdsRef = useRef(new Set());

    // 노드/링크 데이터 변환 함수
    const transformGraphData = useCallback((data) => {
        const rawNodes = Array.isArray(data.nodes) ? data.nodes : [];
        const rawLinks = Array.isArray(data.links) ? data.links : [];

        const nodes = rawNodes.map(n => ({
            ...n,
            id: n._id,
            name: n.label_ko || n.label_en || n.term_ko || n._key,
            val: n.connectionCount ? Math.min(n.connectionCount / 5, 5) + 1 : 1,
            isHub: n.connectionCount && n.connectionCount > 10,
            isSearchResult: n.isSearchResult || false
        }));

        const links = rawLinks.map(l => ({
            ...l,
            source: l._from,
            target: l._to
        }));

        return { nodes, links };
    }, []);

    // [1] 초기 로드: Hub 노드 + 1차 연결만 로드
    const fetchInitialGraphData = async (docIds = selectedDocumentIds) => {
        // [Override] If overrideData is provided (chat-driven graph), use it directly
        // Chat data is already in {id, name, source, target} format - skip transformGraphData
        if (overrideData && overrideData.nodes && overrideData.nodes.length > 0) {
            setFullGraphData(overrideData);
            setGraphData(overrideData);
            loadedNodeIdsRef.current = new Set(overrideData.nodes.map(n => n.id));
            return;
        }

        // [User Requirement] If no document is selected, show nothing.
        if (!docIds || docIds.length === 0) {
            setFullGraphData({ nodes: [], links: [] });
            setGraphData({ nodes: [], links: [] });
            setTotalNodeCount(0);
            setTotalEdgeCount(0);
            setHasMore(false);
            loadedNodeIdsRef.current.clear();
            return;
        }

        setIsLoading(true);
        try {
            if (isLocalAuthEnabled) {
                const graphMap = getLocalGraphMap();
                const localGraph = graphMap[String(workspaceId)] || { nodes: [], links: [] };
                setTotalNodeCount(localGraph.nodes.length);
                setTotalEdgeCount(localGraph.links.length);
                setHasMore(false);
                const transformed = transformGraphData(localGraph);
                setFullGraphData(transformed);
                setGraphData(transformed);
                loadedNodeIdsRef.current = new Set(transformed.nodes.map((n) => n.id));
                setExpandedNodes(new Set());
                return;
            }
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 1분 타임아웃

            // 초기 로드 API 사용 (Hub + 1차 연결)
            let url = `${API_URL}/api/graph/workspace/initial/${workspaceId}`;
            const queryParams = new URLSearchParams();
            docIds.forEach(id => queryParams.append('documentIds', id));
            url += `?${queryParams.toString()}`;

            const response = await fetch(url, {
                credentials: 'include',
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error('Failed to fetch initial graph data');
            }

            const result = await response.json();
            const data = result.data || result;

            // 메타 정보 저장
            setTotalNodeCount(data.totalNodeCount || 0);
            setTotalEdgeCount(data.totalEdgeCount || 0);
            setHasMore(data.hasMore || false);

            const transformed = transformGraphData(data);
            setFullGraphData(transformed);
            setGraphData(transformed);

            // 로드된 노드 ID 추적
            loadedNodeIdsRef.current = new Set(transformed.nodes.map(n => n.id));
            setExpandedNodes(new Set());

        } catch (error) {
            if (error.name === 'AbortError') {
                showAlert("데이터 요청 시간이 초과되었습니다.");
            } else {
                console.error("Failed to load initial graph data", error);
                showAlert("그래프 데이터를 불러오는데 실패했습니다.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // [2] 노드 확장: 특정 노드의 이웃 로드 (on-demand)
    const expandNode = async (nodeId) => {
        console.log('[expandNode] 호출됨 - nodeId:', nodeId);
        console.log('[expandNode] isExpanding:', isExpanding, ', expandedNodes.has:', expandedNodes.has(nodeId));

        if (isExpanding || expandedNodes.has(nodeId)) {
            console.log('[expandNode] 조건에 의해 리턴 - isExpanding:', isExpanding, ', already expanded:', expandedNodes.has(nodeId));
            return;
        }

        setIsExpanding(true);
        console.log('[expandNode] API 호출 시작 - workspaceId:', workspaceId);
        try {
            if (isLocalAuthEnabled) {
                showAlert("로컬 모드에서는 기본 그래프만 표시됩니다.", 'info');
                setExpandedNodes(prev => new Set([...prev, nodeId]));
                return;
            }
            const response = await fetch(`${API_URL}/api/graph/workspace/expand/${workspaceId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    nodeId: nodeId,
                    documentIds: selectedDocumentIds,
                    depth: 1,
                    excludeNodeIds: Array.from(loadedNodeIdsRef.current),
                    limit: 50
                })
            });

            console.log('[expandNode] API 응답 status:', response.status);
            if (!response.ok) {
                console.error('[expandNode] API 응답 실패:', response.status);
                throw new Error('Failed to expand node');
            }

            const result = await response.json();
            console.log('[expandNode] API 응답 result:', result);
            const data = result.data || result;
            console.log('[expandNode] 파싱된 data - nodes:', data.nodes?.length, ', links:', data.links?.length);

            if (data.nodes && data.nodes.length > 0) {
                const newTransformed = transformGraphData(data);

                // 기존 데이터에 새 데이터 병합
                setGraphData(prev => {
                    const existingNodeIds = new Set(prev.nodes.map(n => n.id));
                    const existingLinkKeys = new Set(prev.links.map(l => `${l.source?.id || l.source}-${l.target?.id || l.target}`));

                    const newNodes = newTransformed.nodes.filter(n => !existingNodeIds.has(n.id));
                    const newLinks = newTransformed.links.filter(l => {
                        const key = `${l.source}-${l.target}`;
                        return !existingLinkKeys.has(key);
                    });

                    // 로드된 노드 ID 업데이트
                    newNodes.forEach(n => loadedNodeIdsRef.current.add(n.id));

                    return {
                        nodes: [...prev.nodes, ...newNodes],
                        links: [...prev.links, ...newLinks]
                    };
                });

                setFullGraphData(prev => {
                    const existingNodeIds = new Set(prev.nodes.map(n => n.id));
                    const existingLinkKeys = new Set(prev.links.map(l => `${l.source?.id || l.source}-${l.target?.id || l.target}`));

                    const newNodes = newTransformed.nodes.filter(n => !existingNodeIds.has(n.id));
                    const newLinks = newTransformed.links.filter(l => {
                        const key = `${l.source}-${l.target}`;
                        return !existingLinkKeys.has(key);
                    });

                    return {
                        nodes: [...prev.nodes, ...newNodes],
                        links: [...prev.links, ...newLinks]
                    };
                });

                showAlert(`${newTransformed.nodes.length}개의 연결된 노드를 확장했습니다.`, 'success');
            } else {
                showAlert("더 이상 확장할 노드가 없습니다.", 'info');
            }

            // 확장된 노드 기록
            setExpandedNodes(prev => new Set([...prev, nodeId]));

        } catch (error) {
            console.error("Failed to expand node", error);
            showAlert("노드 확장에 실패했습니다.");
        } finally {
            setIsExpanding(false);
        }
    };

    // [3] 백엔드 검색 API 호출
    const handleBackendSearch = async () => {
        if (!searchQuery.trim()) {
            // 검색어 없으면 초기 데이터로 복원
            fetchInitialGraphData();
            return;
        }

        setIsSearching(true);
        try {
            if (isLocalAuthEnabled) {
                handleLocalSearch();
                return;
            }
            const queryParams = new URLSearchParams();
            queryParams.append('query', searchQuery.trim());
            queryParams.append('depth', depth);
            queryParams.append('limit', '300');
            selectedDocumentIds.forEach(id => queryParams.append('documentIds', id));

            const response = await fetch(
                `${API_URL}/api/graph/workspace/search/${workspaceId}?${queryParams.toString()}`,
                { credentials: 'include' }
            );

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const result = await response.json();
            const data = result.data || result;

            if (data.nodes && data.nodes.length > 0) {
                const transformed = transformGraphData(data);
                setGraphData(transformed);
                setFullGraphData(transformed);
                loadedNodeIdsRef.current = new Set(transformed.nodes.map(n => n.id));

                const matchedCount = data.matchedCount || transformed.nodes.filter(n => n.isSearchResult).length;
                showAlert(`'${searchQuery}'에 대해 ${matchedCount}개 노드 검색됨 (연결 포함 ${transformed.nodes.length}개)`, 'success');

                setTimeout(() => {
                    if (graphRef.current) {
                        graphRef.current.zoomToFit(400);
                    }
                }, 300);
            } else {
                showAlert('검색 결과가 없습니다.');
                setGraphData({ nodes: [], links: [] });
            }
        } catch (error) {
            console.error("Search failed", error);
            showAlert("검색에 실패했습니다.");
        } finally {
            setIsSearching(false);
        }
    };

    // 로컬 검색 (프론트엔드에서 필터링) - 작은 데이터셋용
    const handleLocalSearch = () => {
        if (!searchQuery.trim()) {
            setGraphData(fullGraphData);
            setTimeout(() => {
                if (graphRef.current) {
                    graphRef.current.zoomToFit(400);
                }
            }, 100);
            return;
        }

        setIsSearching(true);
        const term = searchQuery.trim().toLowerCase();

        // 1. Find Start Nodes (Wildcard Support)
        const startNodes = fullGraphData.nodes.filter(node => {
            const name = node.name.toLowerCase();
            if (term.includes('*')) {
                const regex = new RegExp('^' + term.replace(/\*/g, '.*') + '$');
                return regex.test(name);
            }
            return name.includes(term);
        });

        if (startNodes.length === 0) {
            showAlert('검색 결과가 없습니다.');
            setIsSearching(false);
            return;
        }

        // 2. BFS Traversal for Depth
        const visitedNodeIds = new Set();
        const activeLinks = new Set();
        let currentLevel = startNodes.map(n => n.id);

        currentLevel.forEach(id => visitedNodeIds.add(id));

        // Create Adjacency Map for fast lookup
        const adjacency = {};
        fullGraphData.links.forEach(link => {
            const sId = typeof link.source === 'object' ? link.source.id : link.source;
            const tId = typeof link.target === 'object' ? link.target.id : link.target;

            if (!adjacency[sId]) adjacency[sId] = [];
            if (!adjacency[tId]) adjacency[tId] = [];
            adjacency[sId].push({ target: tId, link });
            adjacency[tId].push({ target: sId, link });
        });

        for (let d = 0; d < depth; d++) {
            const nextLevel = [];
            currentLevel.forEach(nodeId => {
                const neighbors = adjacency[nodeId] || [];
                neighbors.forEach(({ target, link }) => {
                    activeLinks.add(link);
                    if (!visitedNodeIds.has(target)) {
                        visitedNodeIds.add(target);
                        nextLevel.push(target);
                    }
                });
            });
            currentLevel = nextLevel;
        }

        const filteredNodes = fullGraphData.nodes.map(n => ({
            ...n,
            isSearchResult: startNodes.some(sn => sn.id === n.id)
        })).filter(n => visitedNodeIds.has(n.id));
        const filteredLinks = Array.from(activeLinks);

        setGraphData({ nodes: filteredNodes, links: filteredLinks });
        setIsSearching(false);

        setTimeout(() => {
            if (graphRef.current) {
                graphRef.current.zoomToFit(400);
            }
        }, 300);
    };

    // 검색 핸들러 (데이터 크기에 따라 로컬/백엔드 선택)
    const handleSearch = () => {
        // 전체 노드 수가 많으면 백엔드 검색, 적으면 로컬 검색
        if (totalNodeCount > 500 || fullGraphData.nodes.length === 0) {
            handleBackendSearch();
        } else {
            handleLocalSearch();
        }
    };

    const handleReset = () => {
        setSearchQuery('');
        setDepth(1);
        initialFitDoneRef.current = false;
        fetchInitialGraphData();
    };

    // 노드 더블클릭 핸들러
    const handleNodeDoubleClick = (node) => {
        console.log('[handleNodeDoubleClick] 더블클릭 이벤트 발생! node:', node);
        if (node && node.id) {
            console.log('[handleNodeDoubleClick] expandNode 호출 - node.id:', node.id);
            expandNode(node.id);
        } else {
            console.log('[handleNodeDoubleClick] node 또는 node.id가 없음');
        }
    };

    useEffect(() => {
        if (isOpen && containerRef.current) {
            const updateDimensions = () => {
                if (containerRef.current) {
                    setDimensions({
                        width: containerRef.current.clientWidth,
                        height: containerRef.current.clientHeight
                    });
                }
            };
            updateDimensions();
            window.addEventListener('resize', updateDimensions);
            return () => window.removeEventListener('resize', updateDimensions);
        }
    }, [isOpen]);

    // Configure force simulation when data changes
    useEffect(() => {
        if (graphRef.current && graphData.nodes.length > 0) {
            const fg = graphRef.current;
            const nodeCount = graphData.nodes.length;
            // 노드 수에 비례해서 force 조정
            const chargeStrength = Math.max(-300, -100 - nodeCount * 5);
            const linkDist = Math.max(50, 80 + nodeCount * 2);
            fg.d3Force('charge').strength(chargeStrength);
            fg.d3Force('link').distance(linkDist);
        }
    }, [graphData]);

    // Data Load on Mount & Selection Change
    useEffect(() => {
        initialFitDoneRef.current = false;
        fetchInitialGraphData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDocumentIds, overrideData]);

    const handleDocumentToggle = (docId) => {
        const newSelected = selectedDocumentIds.includes(docId)
            ? selectedDocumentIds.filter(id => id !== docId)
            : [...selectedDocumentIds, docId];

        setSelectedDocumentIds(newSelected);
    };

    const handleSelectAllDocs = () => {
        if (selectedDocumentIds.length === documents.length) {
            setSelectedDocumentIds([]);
        } else {
            const allIds = documents.map(d => d.id);
            setSelectedDocumentIds(allIds);
        }
    };

    // Autocomplete
    const handleInputChange = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        if (val.length > 0 && fullGraphData.nodes.length > 0) {
            const matches = fullGraphData.nodes
                .filter(n => n.name.toLowerCase().includes(val.toLowerCase()))
                .map(n => n.name)
                .slice(0, 10);
            setSuggestions(matches);
        } else {
            setSuggestions([]);
        }
    };

    const selectSuggestion = (val) => {
        setSearchQuery(val);
        setSuggestions([]);
    };

    // 모달이 닫혀있으면 렌더링하지 않음
    if (!isOpen) {
        return null;
    }

    return (
        <div className="kg-modal-overlay" onClick={onClose}>
            <div className="kg-modal-content" style={{ width: '98%', height: '98vh', maxWidth: 'none', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0, flexWrap: 'wrap', gap: '10px' }}>
                    <h2 className="kg-modal-title" style={{ margin: 0 }}>지식 그래프</h2>

                    {/* Search Controls */}
                    <div className="kg-search-controls">
                        {/* 노드 카운트 정보 */}
                        <div className="kg-node-count" style={{ marginRight: '15px', fontWeight: 'bold', color: '#333', fontSize: '14px' }}>
                            <span>현재: {graphData.nodes.length}개</span>
                            {totalNodeCount > 0 && (
                                <span style={{ color: '#666', marginLeft: '5px' }}>
                                    / 전체: {totalNodeCount}개
                                </span>
                            )}
                            {hasMore && (
                                <span style={{ color: '#4a90d9', marginLeft: '5px', fontSize: '12px' }}>
                                    (더블클릭으로 확장)
                                </span>
                            )}
                        </div>

                        <div className="kg-input-group">
                            <input
                                type="text"
                                className="kg-search-input"
                                placeholder="노드 검색 (*와일드카드 가능)"
                                value={searchQuery}
                                onChange={handleInputChange}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            {suggestions.length > 0 && (
                                <ul className="kg-suggestions">
                                    {suggestions.map((s, i) => (
                                        <li key={i} onClick={() => selectSuggestion(s)}>{s}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="kg-input-group" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ color: '#333', fontSize: '14px', fontWeight: '500' }}>Depth:</span>
                            <input
                                type="number"
                                className="kg-depth-input"
                                min="1" max="5"
                                value={depth}
                                onChange={(e) => setDepth(parseInt(e.target.value))}
                                title="Depth (깊이)"
                                style={{ width: '60px' }}
                            />
                        </div>
                        <button className="kg-btn primary" onClick={handleSearch} disabled={isSearching}>
                            {isSearching ? '검색중...' : '검색'}
                        </button>
                        <button className="kg-btn secondary" onClick={handleReset}>초기화</button>
                    </div>

                    {/* Document Filter Dropdown - 채팅 검색 결과(overrideData)일 때는 숨김 */}
                    {!(overrideData && overrideData.nodes && overrideData.nodes.length > 0) && (
                        <div style={{ position: 'relative', marginLeft: '10px' }}>
                            <button
                                className="kg-btn secondary"
                                onClick={() => setIsDocDropdownOpen(!isDocDropdownOpen)}
                                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                                <span>문서 필터 ({selectedDocumentIds.length}/{documents.length})</span>
                                <span style={{ fontSize: '10px' }}>{isDocDropdownOpen ? '▲' : '▼'}</span>
                            </button>

                            {isDocDropdownOpen && (
                                <div className="kg-dropdown-menu" style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    transform: 'none',
                                    zIndex: 1000,
                                    backgroundColor: '#2d2d2d',
                                    border: '1px solid #444',
                                    borderRadius: '4px',
                                    padding: '8px',
                                    minWidth: '250px',
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                                }}>
                                    <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #444' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', color: '#fff', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={documents.length > 0 && selectedDocumentIds.length === documents.length}
                                                onChange={handleSelectAllDocs}
                                                style={{ marginRight: '8px' }}
                                            />
                                            전체 선택
                                        </label>
                                    </div>
                                    {documents.map(doc => (
                                        <div key={doc.id} style={{ marginBottom: '4px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', color: '#eee', fontSize: '13px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedDocumentIds.includes(doc.id)}
                                                    onChange={() => handleDocumentToggle(doc.id)}
                                                    style={{ marginRight: '8px' }}
                                                />
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }} title={doc.filename}>
                                                    {doc.filename}
                                                </span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ flex: 1 }}></div>

                    <button className="kg-close-btn" style={{ margin: 0 }} onClick={onClose}>닫기</button>
                </div>

                <div ref={containerRef} style={{ flex: 1, border: '1px solid #333', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                    {(isLoading || isExpanding) && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            zIndex: 2000,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: '#fff'
                        }}>
                            <div className="spinner" style={{
                                width: '40px',
                                height: '40px',
                                border: '4px solid rgba(255,255,255,0.3)',
                                borderRadius: '50%',
                                borderTop: '4px solid #fff',
                                animation: 'spin 1s linear infinite',
                                marginBottom: '10px'
                            }}></div>
                            <span>{isExpanding ? '노드 확장 중...' : '데이터 로딩 중...'}</span>
                            <style>{`
                                @keyframes spin {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                            `}</style>
                        </div>
                    )}
                    <ForceGraph2D
                        ref={graphRef}
                        width={dimensions.width}
                        height={dimensions.height}
                        cooldownTicks={100}
                        onEngineStop={() => {
                            if (!initialFitDoneRef.current && graphRef.current) {
                                graphRef.current.zoomToFit(400, 40);
                                initialFitDoneRef.current = true;
                            }
                        }}
                        graphData={graphData}
                        nodeLabel="name"
                        nodeAutoColorBy="group"
                        backgroundColor="#ffffff"
                        onNodeClick={(node) => console.log('[onNodeClick] 노드 클릭됨:', node?.name || node?.id)}
                        onNodeDoubleClick={handleNodeDoubleClick}

                        // Custom Node Rendering - 지식 그래프 탭과 동일한 방식
                        nodeCanvasObject={(node, ctx, globalScale) => {
                            const label = node.name || node.id || "Unknown";
                            const fontSize = 12 / globalScale;

                            // 노드 크기: globalScale로 나눠 화면에서 일정한 크기 유지
                            let baseRadius = 5;
                            if (node.isTopHub) {
                                baseRadius = 8;
                            } else if (node.isHub) {
                                baseRadius = 7;
                            } else if (node.isSearchResult) {
                                baseRadius = 6;
                            }
                            const nodeRadius = baseRadius / globalScale;

                            // 확장 상태 확인
                            const isExpanded = expandedNodes.has(node.id);
                            const canExpand = hasMore && !isExpanded;

                            // 검색 결과 노드 하이라이트
                            if (node.isSearchResult) {
                                ctx.beginPath();
                                ctx.arc(node.x, node.y, nodeRadius + (4 / globalScale), 0, 2 * Math.PI, false);
                                ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
                                ctx.fill();
                            }

                            // 노드 색상 결정
                            let fillColor = '#9BBFEE'; // 기본
                            if (node.isSearchResult) {
                                fillColor = '#ff6b6b';
                            } else if (node.isTopHub) {
                                fillColor = '#1565c0';
                            } else if (node.isHub) {
                                fillColor = '#4a90d9';
                            }

                            // Draw Node Circle
                            ctx.beginPath();
                            ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
                            ctx.fillStyle = fillColor;
                            ctx.fill();

                            // 테두리 스타일 (확장 상태에 따라)
                            if (canExpand) {
                                ctx.setLineDash([3 / globalScale, 2 / globalScale]);
                                ctx.strokeStyle = '#1976d2';
                                ctx.lineWidth = 2 / globalScale;
                            } else if (isExpanded) {
                                ctx.setLineDash([]);
                                ctx.strokeStyle = '#4CAF50';
                                ctx.lineWidth = 2 / globalScale;
                            } else {
                                ctx.setLineDash([]);
                                ctx.strokeStyle = '#6688AA';
                                ctx.lineWidth = 1.5 / globalScale;
                            }
                            ctx.stroke();
                            ctx.setLineDash([]);

                            // Draw Label
                            ctx.font = `${fontSize}px "Pretendard Variable", sans-serif`;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'top';
                            ctx.fillStyle = '#444';
                            ctx.fillText(label, node.x, node.y + nodeRadius + (2 / globalScale));

                            node.__bckgDimensions = [ctx.measureText(label).width, fontSize];
                        }}

                        // 클릭 영역 정의 - 지식 그래프 탭과 동일한 방식
                        nodePointerAreaPaint={(node, color, ctx, globalScale) => {
                            const baseRadius = node.isTopHub ? 8 : (node.isHub ? 7 : 5);
                            const nodeRadius = baseRadius / globalScale;
                            ctx.fillStyle = color;
                            ctx.beginPath();
                            ctx.arc(node.x, node.y, nodeRadius + (10 / globalScale), 0, 2 * Math.PI, false);
                            ctx.fill();
                        }}

                        // Custom Link Rendering - 지식 그래프 탭과 동일한 방식
                        linkCanvasObject={(link, ctx, globalScale) => {
                            const start = link.source;
                            const end = link.target;

                            if (typeof start.x !== 'number' || typeof end.x !== 'number') return;

                            const lineWidth = 1 / globalScale;
                            const arrowLength = 5 / globalScale;
                            const nodeRadius = 6 / globalScale;
                            const edgeColor = '#B0B0B0';

                            // Draw Line
                            ctx.beginPath();
                            ctx.moveTo(start.x, start.y);
                            ctx.lineTo(end.x, end.y);
                            ctx.strokeStyle = edgeColor;
                            ctx.lineWidth = lineWidth;
                            ctx.stroke();

                            // Draw Arrow Head
                            const angle = Math.atan2(end.y - start.y, end.x - start.x);
                            const tipX = end.x - (nodeRadius + lineWidth) * Math.cos(angle);
                            const tipY = end.y - (nodeRadius + lineWidth) * Math.sin(angle);

                            ctx.beginPath();
                            ctx.moveTo(tipX, tipY);
                            ctx.lineTo(
                                tipX - arrowLength * Math.cos(angle - Math.PI / 6),
                                tipY - arrowLength * Math.sin(angle - Math.PI / 6)
                            );
                            ctx.lineTo(
                                tipX - arrowLength * Math.cos(angle + Math.PI / 6),
                                tipY - arrowLength * Math.sin(angle + Math.PI / 6)
                            );
                            ctx.closePath();
                            ctx.fillStyle = edgeColor;
                            ctx.fill();

                            // Draw Label
                            const label = link.label_ko || link.label_en || link.relation_ko || link.relation_en;
                            if (label) {
                                const midX = (start.x + end.x) / 2;
                                const midY = (start.y + end.y) / 2;
                                const labelFontSize = 10 / globalScale;
                                ctx.font = `${labelFontSize}px "Pretendard Variable", sans-serif`;
                                const textWidth = ctx.measureText(label).width;
                                const padding = 2 / globalScale;

                                ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
                                ctx.fillRect(midX - textWidth / 2 - padding, midY - labelFontSize / 2 - padding, textWidth + padding * 2, labelFontSize + padding * 2);

                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                ctx.fillStyle = '#888';
                                ctx.fillText(label, midX, midY);
                            }
                        }}
                    />

                    {/* 범례 */}
                    <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '10px',
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#1565c0' }}></div>
                                <span>TopHub</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#4a90d9' }}></div>
                                <span>Hub</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#9BBFEE' }}></div>
                                <span>일반</span>
                            </div>
                            <div style={{ width: '1px', height: '12px', backgroundColor: '#ddd' }}></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px dashed #1976d2', backgroundColor: '#9BBFEE' }}></div>
                                <span>확장가능</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid #4CAF50', backgroundColor: '#9BBFEE' }}></div>
                                <span>확장됨</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

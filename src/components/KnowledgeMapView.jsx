import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Link2 } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import './KnowledgeGraphModal.css';
import { API_URL } from '../config/api';

function getCsrfToken() {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

export default function KnowledgeMapView({ workspaceId, documents = [], initialSelectedDocIds = [], cachedData = null, onDataLoaded = null }) {
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

    // 로드된 노드 ID 추적
    const loadedNodeIdsRef = useRef(new Set());

    // 경로 찾기 상태
    const [pathMode, setPathMode] = useState(false);
    const [fromNode, setFromNode] = useState('');
    const [toNode, setToNode] = useState('');
    const [isPathFinding, setIsPathFinding] = useState(false);
    const [pathResult, setPathResult] = useState(null);
    const [fromSuggestions, setFromSuggestions] = useState([]);
    const [toSuggestions, setToSuggestions] = useState([]);

    // Top Hub 목록 (사이드바용)
    const [topHubs, setTopHubs] = useState([]);
    const [currentHubId, setCurrentHubId] = useState(null);

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
            isSearchResult: n.isSearchResult || false,
            isPathNode: n.isPathNode || false,
            isStartNode: n.isStartNode || false,
            isEndNode: n.isEndNode || false,
            pathOrder: n.pathOrder
        }));

        const links = rawLinks.map(l => ({
            ...l,
            source: l._from,
            target: l._to,
            isPathEdge: l.isPathEdge || false
        }));

        return { nodes, links };
    }, []);

    // [1] 초기 로드: Hub 노드 + 1차 연결만 로드
    const fetchInitialGraphData = useCallback(async (docIds = selectedDocumentIds, useCache = true) => {
        if (!docIds || docIds.length === 0) {
            setFullGraphData({ nodes: [], links: [] });
            setGraphData({ nodes: [], links: [] });
            setTotalNodeCount(0);
            setTotalEdgeCount(0);
            setHasMore(false);
            loadedNodeIdsRef.current.clear();
            return;
        }

        // 캐시된 데이터가 있으면 사용 (메타데이터 포함 복원)
        if (useCache && cachedData && cachedData.nodes && cachedData.nodes.length > 0) {
            const transformed = transformGraphData(cachedData);
            setFullGraphData(transformed);
            setGraphData(transformed);
            loadedNodeIdsRef.current = new Set(transformed.nodes.map(n => n.id));
            // 캐시된 메타데이터 복원
            if (cachedData._meta) {
                setTopHubs(cachedData._meta.topHubs || []);
                setCurrentHubId(cachedData._meta.currentHubId || null);
                setTotalNodeCount(cachedData._meta.totalNodeCount || 0);
                setTotalEdgeCount(cachedData._meta.totalEdgeCount || 0);
                setHasMore(cachedData._meta.hasMore || false);
            }
            return;
        }

        setIsLoading(true);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000);

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

            // Top Hub 목록 저장
            if (data.topHubs && data.topHubs.length > 0) {
                setTopHubs(data.topHubs);
            }
            if (data.topHubId) {
                setCurrentHubId(data.topHubId);
            }

            const transformed = transformGraphData(data);
            setFullGraphData(transformed);
            setGraphData(transformed);

            // 로드된 노드 ID 추적
            loadedNodeIdsRef.current = new Set(transformed.nodes.map(n => n.id));
            setExpandedNodes(new Set());

            // 캐시 콜백 (메타데이터 포함)
            if (onDataLoaded) {
                onDataLoaded({
                    ...transformed,
                    _meta: {
                        topHubs: data.topHubs || [],
                        currentHubId: data.topHubId || null,
                        totalNodeCount: data.totalNodeCount || 0,
                        totalEdgeCount: data.totalEdgeCount || 0,
                        hasMore: data.hasMore || false,
                    }
                });
            }

            setTimeout(() => {
                if (graphRef.current) graphRef.current.zoomToFit(400);
            }, 300);

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
    }, [workspaceId, selectedDocumentIds, cachedData, transformGraphData, onDataLoaded, showAlert]);

    // [2] 노드 확장: 특정 노드의 이웃 로드 (on-demand)
    const expandNode = async (nodeId) => {
        if (isExpanding || expandedNodes.has(nodeId)) return;

        setIsExpanding(true);
        try {
            const csrfToken = getCsrfToken();
            const response = await fetch(`${API_URL}/api/graph/workspace/expand/${workspaceId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {}) },
                credentials: 'include',
                body: JSON.stringify({
                    nodeId: nodeId,
                    documentIds: selectedDocumentIds,
                    depth: 1,
                    excludeNodeIds: Array.from(loadedNodeIdsRef.current),
                    limit: 50
                })
            });

            if (!response.ok) {
                throw new Error('Failed to expand node');
            }

            const result = await response.json();
            const data = result.data || result;

            if (data.nodes && data.nodes.length > 0) {
                const newTransformed = transformGraphData(data);

                // 기존 데이터에 새 데이터 병합
                setGraphData(prev => {
                    const existingNodeIds = new Set(prev.nodes.map(n => n.id));
                    const existingLinkKeys = new Set(prev.links.map(l => `${l.source?.id || l.source}-${l.target?.id || l.target}`));

                    const newNodes = newTransformed.nodes.filter(n => !existingNodeIds.has(n.id));

                    // 새 노드 추가 후의 전체 노드 ID 집합
                    const allNodeIds = new Set([...existingNodeIds, ...newNodes.map(n => n.id)]);

                    // 링크 필터링: 중복 제외 + source/target 노드가 모두 존재해야 함
                    const newLinks = newTransformed.links.filter(l => {
                        const key = `${l.source}-${l.target}`;
                        const sourceId = l.source?.id || l.source;
                        const targetId = l.target?.id || l.target;
                        return !existingLinkKeys.has(key) && allNodeIds.has(sourceId) && allNodeIds.has(targetId);
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

                    // 새 노드 추가 후의 전체 노드 ID 집합
                    const allNodeIds = new Set([...existingNodeIds, ...newNodes.map(n => n.id)]);

                    // 링크 필터링: 중복 제외 + source/target 노드가 모두 존재해야 함
                    const newLinks = newTransformed.links.filter(l => {
                        const key = `${l.source}-${l.target}`;
                        const sourceId = l.source?.id || l.source;
                        const targetId = l.target?.id || l.target;
                        return !existingLinkKeys.has(key) && allNodeIds.has(sourceId) && allNodeIds.has(targetId);
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
        console.log('[handleBackendSearch] 백엔드 검색 시작 - query:', searchQuery);
        if (!searchQuery.trim()) {
            console.log('[handleBackendSearch] 검색어 없음 - 초기 데이터 로드');
            fetchInitialGraphData(selectedDocumentIds, false);
            return;
        }

        setIsSearching(true);
        try {
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
                showAlert(`'${searchQuery}'에 대해 ${matchedCount}개 노드 검색됨`, 'success');

                setTimeout(() => {
                    if (graphRef.current) graphRef.current.zoomToFit(400);
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

    // 로컬 검색 (프론트엔드 필터링)
    const handleLocalSearch = () => {
        console.log('[handleLocalSearch] 로컬 검색 시작 - query:', searchQuery);
        if (!searchQuery.trim()) {
            console.log('[handleLocalSearch] 검색어 없음 - fullGraphData 복원');
            setGraphData(fullGraphData);
            setTimeout(() => { if (graphRef.current) graphRef.current.zoomToFit(400); }, 100);
            return;
        }

        setIsSearching(true);
        const term = searchQuery.trim().toLowerCase();
        console.log('[handleLocalSearch] 검색어:', term, ', fullGraphData.nodes 개수:', fullGraphData.nodes.length);

        const startNodes = fullGraphData.nodes.filter(node => {
            const name = node.name.toLowerCase();
            if (term.includes('*')) {
                const regex = new RegExp('^' + term.replace(/\*/g, '.*') + '$');
                return regex.test(name);
            }
            return name.includes(term);
        });

        console.log('[handleLocalSearch] 매칭된 startNodes:', startNodes.length);
        if (startNodes.length === 0) {
            console.log('[handleLocalSearch] 검색 결과 없음');
            showAlert('검색 결과가 없습니다.');
            setIsSearching(false);
            return;
        }

        const visitedNodeIds = new Set();
        const activeLinks = new Set();
        let currentLevel = startNodes.map(n => n.id);
        currentLevel.forEach(id => visitedNodeIds.add(id));

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
        setTimeout(() => { if (graphRef.current) graphRef.current.zoomToFit(400); }, 300);
    };

    // 검색 핸들러
    const handleSearch = () => {
        console.log('[handleSearch] 검색 시작 - query:', searchQuery);
        console.log('[handleSearch] totalNodeCount:', totalNodeCount, ', fullGraphData.nodes.length:', fullGraphData.nodes.length);
        if (totalNodeCount > 500 || fullGraphData.nodes.length === 0) {
            console.log('[handleSearch] 백엔드 검색 호출');
            handleBackendSearch();
        } else {
            console.log('[handleSearch] 로컬 검색 호출');
            handleLocalSearch();
        }
    };

    const handleReset = () => {
        setSearchQuery('');
        setDepth(1);
        setPathMode(false);
        setFromNode('');
        setToNode('');
        setPathResult(null);
        fetchInitialGraphData(selectedDocumentIds, false);
    };

    // Hub 클릭 시 해당 Hub 중심으로 전환
    const handleHubClick = async (hubId) => {
        if (hubId === currentHubId) return;

        setIsLoading(true);
        try {
            let url = `${API_URL}/api/graph/workspace/hub/${workspaceId}?hubId=${encodeURIComponent(hubId)}`;
            selectedDocumentIds.forEach(id => {
                url += `&documentIds=${id}`;
            });

            const response = await fetch(url, { credentials: 'include' });

            if (!response.ok) {
                throw new Error('Failed to fetch hub graph');
            }

            const result = await response.json();
            const data = result.data || result;

            const transformed = transformGraphData(data);
            setGraphData(transformed);
            setFullGraphData(transformed);
            setCurrentHubId(hubId);
            loadedNodeIdsRef.current = new Set(transformed.nodes.map(n => n.id));
            setExpandedNodes(new Set());

            // hasMore 설정: 전체 노드보다 적으면 확장 가능
            setHasMore(totalNodeCount > transformed.nodes.length);

            // 선택한 Hub 이름 찾기
            const hubInfo = topHubs.find(h => h.nodeId === hubId);
            if (hubInfo) {
                showAlert(`'${hubInfo.name}' Hub 중심으로 전환`, 'success');
            }

            setTimeout(() => {
                if (graphRef.current) graphRef.current.zoomToFit(400);
            }, 300);

        } catch (error) {
            console.error('Hub graph fetch failed', error);
            showAlert('Hub 그래프 로딩 실패');
        } finally {
            setIsLoading(false);
        }
    };

    // 선택된 노드 ID 저장 (경로 찾기용)
    const [fromNodeId, setFromNodeId] = useState(null);
    const [toNodeId, setToNodeId] = useState(null);

    // 자동완성 debounce용 타이머
    const autocompleteTimerRef = useRef(null);

    // 경로 찾기 입력 자동완성 (백엔드 API 호출)
    const fetchPathSuggestions = async (input, setSuggestions) => {
        if (!input || input.trim().length === 0) {
            setSuggestions([]);
            return;
        }

        try {
            let url = `${API_URL}/api/graph/workspace/autocomplete/${workspaceId}?query=${encodeURIComponent(input.trim())}&limit=10`;
            if (selectedDocumentIds && selectedDocumentIds.length > 0) {
                selectedDocumentIds.forEach(id => {
                    url += `&documentIds=${id}`;
                });
            }

            const response = await fetch(url, {
                credentials: 'include'
            });

            if (response.ok) {
                const result = await response.json();
                const suggestions = result.data || [];
                setSuggestions(suggestions); // { id, name } 객체 배열
            }
        } catch (error) {
            console.error('Autocomplete fetch failed:', error);
            setSuggestions([]);
        }
    };

    const handleFromNodeChange = (e) => {
        const val = e.target.value;
        setFromNode(val);
        setFromNodeId(null); // 직접 입력 시 ID 초기화

        // Debounce: 300ms 후 API 호출
        if (autocompleteTimerRef.current) {
            clearTimeout(autocompleteTimerRef.current);
        }
        autocompleteTimerRef.current = setTimeout(() => {
            fetchPathSuggestions(val, setFromSuggestions);
        }, 300);
    };

    const handleToNodeChange = (e) => {
        const val = e.target.value;
        setToNode(val);
        setToNodeId(null); // 직접 입력 시 ID 초기화

        // Debounce: 300ms 후 API 호출
        if (autocompleteTimerRef.current) {
            clearTimeout(autocompleteTimerRef.current);
        }
        autocompleteTimerRef.current = setTimeout(() => {
            fetchPathSuggestions(val, setToSuggestions);
        }, 300);
    };

    const selectFromSuggestion = (suggestion) => {
        setFromNode(suggestion.name);
        setFromNodeId(suggestion.id);
        setFromSuggestions([]);
    };

    const selectToSuggestion = (suggestion) => {
        setToNode(suggestion.name);
        setToNodeId(suggestion.id);
        setToSuggestions([]);
    };

    // 노드 이름으로 ID 찾기 (자동완성에서 선택 안된 경우)
    const findNodeIdByName = async (nodeName) => {
        // 먼저 로드된 데이터에서 찾기
        const localNode = fullGraphData.nodes.find(n =>
            n.name.toLowerCase() === nodeName.toLowerCase()
        );
        if (localNode) return localNode.id;

        // 백엔드 자동완성 API로 찾기
        try {
            let url = `${API_URL}/api/graph/workspace/autocomplete/${workspaceId}?query=${encodeURIComponent(nodeName)}&limit=1`;
            if (selectedDocumentIds && selectedDocumentIds.length > 0) {
                selectedDocumentIds.forEach(id => {
                    url += `&documentIds=${id}`;
                });
            }

            const response = await fetch(url, { credentials: 'include' });
            if (response.ok) {
                const result = await response.json();
                const suggestions = result.data || [];
                if (suggestions.length > 0) {
                    return suggestions[0].id;
                }
            }
        } catch (error) {
            console.error('Node ID lookup failed:', error);
        }
        return null;
    };

    // [5] 경로 찾기
    const handleFindPath = async () => {
        if (!fromNode.trim() || !toNode.trim()) {
            showAlert('출발 노드와 도착 노드를 모두 입력해주세요.');
            return;
        }

        setIsPathFinding(true);

        try {
            // 노드 ID 확인 (자동완성에서 선택된 경우 이미 ID가 있음)
            let resolvedFromId = fromNodeId;
            let resolvedToId = toNodeId;

            // 자동완성에서 선택 안된 경우 이름으로 찾기
            if (!resolvedFromId) {
                resolvedFromId = await findNodeIdByName(fromNode.trim());
            }
            if (!resolvedToId) {
                resolvedToId = await findNodeIdByName(toNode.trim());
            }

            if (!resolvedFromId) {
                showAlert(`'${fromNode}' 노드를 찾을 수 없습니다. 자동완성에서 선택해주세요.`);
                setIsPathFinding(false);
                return;
            }
            if (!resolvedToId) {
                showAlert(`'${toNode}' 노드를 찾을 수 없습니다. 자동완성에서 선택해주세요.`);
                setIsPathFinding(false);
                return;
            }

            console.log('[handleFindPath] 경로 찾기:', resolvedFromId, '->', resolvedToId);

            const csrfToken2 = getCsrfToken();
            const response = await fetch(`${API_URL}/api/graph/workspace/path/${workspaceId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(csrfToken2 ? { 'X-XSRF-TOKEN': csrfToken2 } : {}) },
                credentials: 'include',
                body: JSON.stringify({
                    fromNodeId: resolvedFromId,
                    toNodeId: resolvedToId,
                    documentIds: selectedDocumentIds,
                    maxDepth: 10
                })
            });

            if (!response.ok) {
                throw new Error('경로 찾기 실패');
            }

            const result = await response.json();
            const data = result.data || result;

            console.log('[handleFindPath] 응답:', data);

            if (data.nodes && data.nodes.length > 0) {
                const transformed = transformGraphData(data);
                setGraphData(transformed);
                setPathResult({
                    from: fromNode.trim(),
                    to: toNode.trim(),
                    pathLength: transformed.nodes.length,
                    nodes: transformed.nodes
                });

                // 경로 표시
                const pathText = transformed.nodes
                    .sort((a, b) => (a.pathOrder || 0) - (b.pathOrder || 0))
                    .map(n => n.name)
                    .join(' → ');
                showAlert(`경로 발견: ${pathText}`, 'success');

                setTimeout(() => {
                    if (graphRef.current) graphRef.current.zoomToFit(400);
                }, 300);
            } else {
                setPathResult(null);
                showAlert('두 노드 사이의 경로를 찾을 수 없습니다.', 'warning');
            }
        } catch (error) {
            console.error('경로 찾기 실패:', error);
            showAlert('경로 찾기에 실패했습니다.');
        } finally {
            setIsPathFinding(false);
        }
    };

    // 노드 클릭으로 경로 입력 자동 채우기
    const handleNodeClickForPath = (node) => {
        if (pathMode) {
            if (!fromNode) {
                setFromNode(node.name);
                showAlert(`출발 노드: ${node.name}`, 'info');
            } else if (!toNode) {
                setToNode(node.name);
                showAlert(`도착 노드: ${node.name}`, 'info');
            }
        }
    };

    // 더블클릭 감지를 위한 ref
    const lastClickRef = useRef({ nodeId: null, time: 0 });

    // 노드 클릭 핸들러 (더블클릭 감지 포함)
    const handleNodeClick = (node) => {
        const now = Date.now();
        const lastClick = lastClickRef.current;

        console.log('[KnowledgeMapView] 노드 클릭:', node?.name || node?.id, ', pathMode:', pathMode);

        // 같은 노드를 300ms 이내에 다시 클릭하면 더블클릭으로 처리 (pathMode와 무관하게)
        if (lastClick.nodeId === node.id && (now - lastClick.time) < 300) {
            console.log('[KnowledgeMapView] 더블클릭 감지! node:', node.id);
            if (node && node.id) {
                expandNode(node.id);
            }
            lastClickRef.current = { nodeId: null, time: 0 };
            return;
        }

        // 클릭 시간 기록
        lastClickRef.current = { nodeId: node.id, time: now };

        // 경로 모드에서 단일 클릭은 노드 선택
        if (pathMode) {
            handleNodeClickForPath(node);
        }
    };

    useLayoutEffect(() => {
        const el = containerRef.current;
        if (!el) return undefined;

        const updateDimensions = () => {
            setDimensions({
                width: el.clientWidth,
                height: el.clientHeight
            });
        };

        updateDimensions();

        const ro = typeof ResizeObserver !== 'undefined'
            ? new ResizeObserver(() => updateDimensions())
            : null;
        if (ro) ro.observe(el);

        window.addEventListener('resize', updateDimensions);
        const id = requestAnimationFrame(() => updateDimensions());

        return () => {
            cancelAnimationFrame(id);
            if (ro) ro.disconnect();
            window.removeEventListener('resize', updateDimensions);
        };
    }, []);

    useEffect(() => {
        fetchInitialGraphData();
    }, [selectedDocumentIds]);

    useEffect(() => {
        if (initialSelectedDocIds) {
            setSelectedDocumentIds(initialSelectedDocIds);
        }
    }, [initialSelectedDocIds]);

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
            setSelectedDocumentIds(documents.map(d => d.id));
        }
    };

    // 검색 자동완성용 타이머
    const searchAutocompleteTimerRef = useRef(null);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setSearchQuery(val);

        // Debounce: 300ms 후 백엔드 API 호출
        if (searchAutocompleteTimerRef.current) {
            clearTimeout(searchAutocompleteTimerRef.current);
        }

        if (val.trim().length > 0) {
            searchAutocompleteTimerRef.current = setTimeout(async () => {
                try {
                    let url = `${API_URL}/api/graph/workspace/autocomplete/${workspaceId}?query=${encodeURIComponent(val.trim())}&limit=10`;
                    if (selectedDocumentIds && selectedDocumentIds.length > 0) {
                        selectedDocumentIds.forEach(id => {
                            url += `&documentIds=${id}`;
                        });
                    }

                    const response = await fetch(url, { credentials: 'include' });
                    if (response.ok) {
                        const result = await response.json();
                        const data = result.data || [];
                        setSuggestions(data); // { id, name, category } 객체 배열
                    }
                } catch (error) {
                    console.error('Search autocomplete failed:', error);
                    setSuggestions([]);
                }
            }, 300);
        } else {
            setSuggestions([]);
        }
    };

    const selectSuggestion = (suggestion) => {
        setSearchQuery(suggestion.name || suggestion);
        setSuggestions([]);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', position: 'relative', minHeight: 0 }}>
            <div className="kg-body-hscroll">
            <div className="kg-body-inner">
            {/* Toolbar: 한 줄(스크롤은 하단 .kg-body-hscroll) */}
            <div className="kg-toolbar">
                <div className="kg-toolbar-scroll">
                {/* 노드 카운트 + 현재 Hub 표시 — 사전 탭 뷰헤더·필터와 동일 톤 */}
                <div className="kg-toolbar-stats">
                    {currentHubId && topHubs.length > 0 && (
                        <span className="kg-toolbar-hub-badge">
                            Hub: {topHubs.find(h => h.nodeId === currentHubId)?.name || ''}
                        </span>
                    )}
                    <span className="kg-toolbar-stats-count">노드: {graphData.nodes.length}개</span>
                    {totalNodeCount > 0 && (
                        <span className="kg-toolbar-stats-muted">
                            (전체 {totalNodeCount}개)
                        </span>
                    )}
                    {hasMore && (
                        <span className="kg-toolbar-stats-hint">· 더블클릭 확장</span>
                    )}
                </div>

                <div className="kg-input-group">
                    <input
                        type="text"
                        className="kg-search-input"
                        placeholder="노드 검색 (*와일드카드)"
                        value={searchQuery}
                        onChange={handleInputChange}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    {suggestions.length > 0 && (
                        <ul className="kg-suggestions">
                            {suggestions.map((s, i) => (
                                <li key={i} onClick={() => selectSuggestion(s)}>
                                    {s.name || s}{s.category ? <span style={{ color: '#888', fontSize: '11px' }}> ({s.category})</span> : ''}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="kg-input-group kg-depth-row">
                    <span className="kg-depth-label">Depth:</span>
                    <input
                        type="number"
                        className="kg-depth-input"
                        min="1" max="5"
                        value={depth}
                        onChange={(e) => setDepth(parseInt(e.target.value))}
                        title="Depth"
                    />
                </div>
                <button className="kg-btn primary" onClick={handleSearch} disabled={isSearching || pathMode}>
                    {isSearching ? '검색중...' : '검색'}
                </button>
                <button className="kg-btn secondary" onClick={handleReset}>초기화</button>

                {/* 경로 찾기 구분선 */}
                <div className="kg-toolbar-divider" aria-hidden />

                {/* 경로 찾기 토글 */}
                <button
                    type="button"
                    className={`kg-btn kg-btn-with-icon ${pathMode ? 'primary' : 'secondary'}`}
                    onClick={() => {
                        setPathMode(!pathMode);
                        if (!pathMode) {
                            setFromNode('');
                            setToNode('');
                            setPathResult(null);
                        }
                    }}
                    title="경로 찾기 모드"
                >
                    <Link2 className="kg-btn-icon" size={14} strokeWidth={2} aria-hidden />
                    <span>경로찾기</span>
                </button>

                {/* 경로 찾기 입력 */}
                {pathMode && (
                    <>
                        <div className="kg-input-group" style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="kg-search-input"
                                style={{ width: '120px' }}
                                placeholder="출발 노드 (*)"
                                value={fromNode}
                                onChange={handleFromNodeChange}
                                onBlur={() => setTimeout(() => setFromSuggestions([]), 200)}
                            />
                            {fromSuggestions.length > 0 && (
                                <ul className="kg-suggestions" style={{ width: '250px' }}>
                                    {fromSuggestions.map((s, i) => (
                                        <li key={i} onClick={() => selectFromSuggestion(s)}>
                                            {s.name}{s.category ? <span style={{ color: '#888', fontSize: '11px' }}> ({s.category})</span> : ''}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <span style={{ color: '#666' }}>→</span>
                        <div className="kg-input-group" style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="kg-search-input"
                                style={{ width: '120px' }}
                                placeholder="도착 노드 (*)"
                                value={toNode}
                                onChange={handleToNodeChange}
                                onKeyDown={(e) => e.key === 'Enter' && handleFindPath()}
                                onBlur={() => setTimeout(() => setToSuggestions([]), 200)}
                            />
                            {toSuggestions.length > 0 && (
                                <ul className="kg-suggestions" style={{ width: '250px' }}>
                                    {toSuggestions.map((s, i) => (
                                        <li key={i} onClick={() => selectToSuggestion(s)}>
                                            {s.name}{s.category ? <span style={{ color: '#888', fontSize: '11px' }}> ({s.category})</span> : ''}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <button
                            className="kg-btn primary"
                            onClick={handleFindPath}
                            disabled={isPathFinding}
                        >
                            {isPathFinding ? '찾는중...' : '경로찾기'}
                        </button>
                    </>
                )}

                {/* Document Filter */}
                <div style={{ position: 'relative', marginLeft: 'auto', display: 'none' }}>
                    <button
                        className="kg-btn secondary"
                        onClick={() => setIsDocDropdownOpen(!isDocDropdownOpen)}
                    >
                        문서 필터 ({selectedDocumentIds.length}/{documents.length}) ▼
                    </button>
                    {isDocDropdownOpen && (
                        <div className="kg-dropdown-menu" style={{
                            position: 'absolute', top: '100%', right: 0, zIndex: 1000,
                            backgroundColor: '#2d2d2d', border: '1px solid #444',
                            padding: '8px', minWidth: '250px', maxHeight: '300px', overflowY: 'auto'
                        }}>
                            <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #444' }}>
                                <label style={{ display: 'flex', alignItems: 'center', color: '#fff', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={documents.length > 0 && selectedDocumentIds.length === documents.length} onChange={handleSelectAllDocs} style={{ marginRight: '8px' }} />
                                    전체 선택
                                </label>
                            </div>
                            {documents.map(doc => (
                                <div key={doc.id} style={{ marginBottom: '4px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', color: '#eee', fontSize: '13px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={selectedDocumentIds.includes(doc.id)} onChange={() => handleDocumentToggle(doc.id)} style={{ marginRight: '8px' }} />
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }} title={doc.filename}>{doc.filename}</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                </div>
            </div>

            <div className="kg-graph-layout-row">
                {/* Hub 사이드바 */}
                {topHubs.length > 0 && (
                    <div style={{
                        width: '180px',
                        minWidth: '180px',
                        backgroundColor: '#fafafa',
                        borderRight: '1px solid #e0e0e0',
                        overflowY: 'auto',
                        padding: '10px 0'
                    }}>
                        <div style={{
                            padding: '8px 12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#666',
                            borderBottom: '1px solid #e0e0e0',
                            marginBottom: '5px'
                        }}>
                            TOP 10 Hub 노드
                        </div>
                        {topHubs.map((hub, index) => (
                            <div
                                key={hub.nodeId}
                                onClick={() => handleHubClick(hub.nodeId)}
                                style={{
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    backgroundColor: currentHubId === hub.nodeId ? '#e3f2fd' : 'transparent',
                                    borderLeft: currentHubId === hub.nodeId ? '3px solid #1976d2' : '3px solid transparent',
                                    transition: 'all 0.2s',
                                    borderBottom: '1px solid #f0f0f0'
                                }}
                                onMouseEnter={(e) => {
                                    if (currentHubId !== hub.nodeId) {
                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (currentHubId !== hub.nodeId) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span style={{
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        color: currentHubId === hub.nodeId ? '#1976d2' : '#888',
                                        minWidth: '18px'
                                    }}>
                                        {index + 1}.
                                    </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: '13px',
                                            fontWeight: currentHubId === hub.nodeId ? '600' : '400',
                                            color: currentHubId === hub.nodeId ? '#1976d2' : '#333',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }} title={hub.name + (hub.category ? ` (${hub.category})` : '')}>
                                            {hub.name}
                                            {hub.category && <span style={{ color: '#888', fontSize: '10px', marginLeft: '3px' }}>({hub.category})</span>}
                                        </div>
                                        <div style={{
                                            fontSize: '11px',
                                            color: '#888'
                                        }}>
                                            연결 {hub.connectionCount}개
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 그래프 영역 */}
                <div ref={containerRef} className="kg-graph-pane">
                {/* 로딩 인디케이터 */}
                {(isLoading || isExpanding) && (
                    <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 100,
                        background: 'rgba(255,255,255,0.95)',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '20px',
                                height: '20px',
                                border: '3px solid #e0e0e0',
                                borderTop: '3px solid #4a90d9',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }}></div>
                            <span style={{ color: '#5f6368', fontSize: '12px', fontWeight: '500' }}>
                                {isExpanding ? '노드 확장 중...' : '데이터 로딩 중...'}
                            </span>
                        </div>
                        <style>{`
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `}</style>
                    </div>
                )}

                {graphData.nodes.length === 0 && !isLoading && (
                    <div className="kg-empty-graph" role="status" aria-live="polite">
                        <div className="kg-empty-graph-inner">
                            <div className="kg-empty-graph-icon" aria-hidden>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="6" cy="6" r="3" />
                                    <circle cx="18" cy="6" r="3" />
                                    <circle cx="12" cy="18" r="3" />
                                    <line x1="8.5" y1="7.5" x2="10.5" y2="16" />
                                    <line x1="15.5" y1="7.5" x2="13.5" y2="16" />
                                </svg>
                            </div>
                            <p className="kg-empty-graph-title">지식그래프가 비어있습니다</p>
                            <p className="kg-empty-graph-desc">
                                문서를 업로드하고 처리하면 자동으로 그래프가 생성됩니다
                            </p>
                        </div>
                    </div>
                )}

                <ForceGraph2D
                    ref={graphRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    graphData={graphData}
                    nodeLabel="name"
                    nodeAutoColorBy="group"
                    backgroundColor="#ffffff"
                    cooldownTicks={100}
                    onEngineStop={() => graphRef.current?.zoomToFit(400)}
                    onNodeClick={handleNodeClick}
                    // 클릭 영역 정의 (커스텀 nodeCanvasObject 사용 시 필수)
                    nodePointerAreaPaint={(node, color, ctx, globalScale) => {
                        const baseRadius = node.isTopHub ? 8 : (node.isHub ? 7 : 5);
                        const nodeRadius = baseRadius / globalScale;
                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, nodeRadius + (10 / globalScale), 0, 2 * Math.PI, false);
                        ctx.fill();
                    }}
                    nodeCanvasObject={(node, ctx, globalScale) => {
                        const label = node.name || node.id || "Unknown";
                        const fontSize = 12 / globalScale;

                        // 노드 크기: 화면에서 일정한 크기 유지 (globalScale로 나눔)
                        // 기본 5px, 최대 9px (화면 기준)
                        let baseRadius = 5;  // 기본
                        if (node.isPathNode) {
                            baseRadius = node.isStartNode || node.isEndNode ? 9 : 7;
                        } else if (node.isTopHub) {
                            baseRadius = 8;
                        } else if (node.isHub) {
                            baseRadius = 7;
                        } else if (node.isSearchResult) {
                            baseRadius = 6;
                        }
                        const nodeRadius = baseRadius / globalScale;

                        // 확장 상태 확인
                        const isExpanded = expandedNodes.has(node.id);
                        const canExpand = hasMore && !isExpanded && !node.isPathNode;

                        // 경로 노드 하이라이트 (외곽 글로우)
                        if (node.isPathNode) {
                            ctx.beginPath();
                            ctx.arc(node.x, node.y, nodeRadius + (5 / globalScale), 0, 2 * Math.PI, false);
                            ctx.fillStyle = node.isStartNode ? 'rgba(76, 175, 80, 0.4)' :
                                           node.isEndNode ? 'rgba(244, 67, 54, 0.4)' :
                                           'rgba(255, 152, 0, 0.4)';
                            ctx.fill();
                        }

                        // 검색 결과 노드 하이라이트
                        if (node.isSearchResult && !node.isPathNode) {
                            ctx.beginPath();
                            ctx.arc(node.x, node.y, nodeRadius + (4 / globalScale), 0, 2 * Math.PI, false);
                            ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
                            ctx.fill();
                        }

                        // 노드 원 색상 결정
                        let fillColor = '#9BBFEE'; // 기본
                        if (node.isStartNode) {
                            fillColor = '#4CAF50'; // 녹색 (출발)
                        } else if (node.isEndNode) {
                            fillColor = '#F44336'; // 빨간색 (도착)
                        } else if (node.isPathNode) {
                            fillColor = '#FF9800'; // 주황색 (경로)
                        } else if (node.isSearchResult) {
                            fillColor = '#ff6b6b';
                        } else if (node.isTopHub) {
                            fillColor = '#1565c0'; // 진한 파란색 (Top Hub)
                        } else if (node.isHub) {
                            fillColor = '#4a90d9';
                        }

                        // 노드 원
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
                        ctx.fillStyle = fillColor;
                        ctx.fill();

                        // 테두리 스타일 결정 (확장 상태에 따라)
                        if (canExpand) {
                            // 확장 가능: 파란 점선 테두리
                            ctx.setLineDash([3 / globalScale, 2 / globalScale]);
                            ctx.strokeStyle = '#1976d2';
                            ctx.lineWidth = 2 / globalScale;
                        } else if (isExpanded) {
                            // 확장됨: 녹색 실선 테두리
                            ctx.setLineDash([]);
                            ctx.strokeStyle = '#4CAF50';
                            ctx.lineWidth = 2 / globalScale;
                        } else {
                            // 일반 테두리
                            ctx.setLineDash([]);
                            ctx.strokeStyle = node.isPathNode ? '#333' : '#6688AA';
                            ctx.lineWidth = (node.isPathNode ? 2 : 1.5) / globalScale;
                        }
                        ctx.stroke();
                        ctx.setLineDash([]);  // 점선 초기화

                        // 경로 순서 번호 표시
                        if (node.isPathNode && node.pathOrder !== undefined) {
                            ctx.font = `bold ${10 / globalScale}px sans-serif`;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillStyle = '#fff';
                            ctx.fillText(String(node.pathOrder + 1), node.x, node.y);
                        }

                        // 라벨
                        ctx.font = `${node.isPathNode ? 'bold ' : ''}${fontSize}px "Pretendard Variable", sans-serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'top';
                        ctx.fillStyle = node.isPathNode ? '#000' : '#444';
                        ctx.fillText(label, node.x, node.y + nodeRadius + (2 / globalScale));

                        node.__bckgDimensions = [ctx.measureText(label).width, fontSize];
                    }}
                    linkCanvasObject={(link, ctx, globalScale) => {
                        const start = link.source;
                        const end = link.target;
                        if (typeof start.x !== 'number' || typeof end.x !== 'number') return;

                        const isPathEdge = link.isPathEdge;
                        const lineWidth = (isPathEdge ? 3 : 1) / globalScale;
                        const arrowLength = (isPathEdge ? 8 : 5) / globalScale;
                        const nodeRadius = (isPathEdge ? 10 : 6) / globalScale;
                        const edgeColor = isPathEdge ? '#FF5722' : '#B0B0B0';

                        ctx.beginPath();
                        ctx.moveTo(start.x, start.y);
                        ctx.lineTo(end.x, end.y);
                        ctx.strokeStyle = edgeColor;
                        ctx.lineWidth = lineWidth;
                        ctx.stroke();

                        const angle = Math.atan2(end.y - start.y, end.x - start.x);
                        const tipX = end.x - (nodeRadius + lineWidth) * Math.cos(angle);
                        const tipY = end.y - (nodeRadius + lineWidth) * Math.sin(angle);

                        ctx.beginPath();
                        ctx.moveTo(tipX, tipY);
                        ctx.lineTo(tipX - arrowLength * Math.cos(angle - Math.PI / 6), tipY - arrowLength * Math.sin(angle - Math.PI / 6));
                        ctx.lineTo(tipX - arrowLength * Math.cos(angle + Math.PI / 6), tipY - arrowLength * Math.sin(angle + Math.PI / 6));
                        ctx.closePath();
                        ctx.fillStyle = edgeColor;
                        ctx.fill();

                        const label = link.label_ko || link.label_en || link.relation_ko || link.relation_en;
                        if (label) {
                            const midX = (start.x + end.x) / 2;
                            const midY = (start.y + end.y) / 2;
                            const fontSize = 10 / globalScale;
                            ctx.font = `${fontSize}px sans-serif`;
                            const textWidth = ctx.measureText(label).width;
                            const padding = 2 / globalScale;

                            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
                            ctx.fillRect(midX - textWidth / 2 - padding, midY - fontSize / 2 - padding, textWidth + padding * 2, fontSize + padding * 2);

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
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '11px',
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
                            <div style={{
                                width: '10px', height: '10px', borderRadius: '50%',
                                border: '2px dashed #1976d2', backgroundColor: '#9BBFEE'
                            }}></div>
                            <span>확장가능</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{
                                width: '10px', height: '10px', borderRadius: '50%',
                                border: '2px solid #4CAF50', backgroundColor: '#9BBFEE'
                            }}></div>
                            <span>확장됨</span>
                        </div>
                        {pathResult && (
                            <>
                                <div style={{ width: '1px', height: '12px', backgroundColor: '#ddd' }}></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#4CAF50' }}></div>
                                    <span>출발</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FF9800' }}></div>
                                    <span>경로</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F44336' }}></div>
                                    <span>도착</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            </div>{/* Hub 사이드바 + 그래프 영역 wrapper 닫기 */}
            </div>{/* kg-body-inner */}
            </div>{/* kg-body-hscroll: 가로 스크롤바 = 탭 콘텐츠 하단 */}
        </div>
    );
}

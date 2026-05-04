import { useState, useEffect, useCallback, useRef } from 'react';
import './DictionaryView.css';
import { dictionaryApi } from '../services/api';
import { useAlert } from '../context/AlertContext';
import { Edit2, ArrowRightCircle, ChevronLeft, ChevronRight, X, Plus, BookOpen } from 'lucide-react';

/** 카테고리 API 결과와 테이블 행의 category 값을 합침 — API가 빈 배열이거나 캐시에 categories만 ['All']일 때도 행에 나온 카테고리가 select에 남음 */
function mergeDictionaryCategories(existingList, rows) {
    const fromRows = [...new Set((rows || []).map((r) => r.category).filter(Boolean))];
    const base = Array.isArray(existingList) ? existingList.filter((c) => c === 'All' || Boolean(c)) : ['All'];
    const withoutAll = base.filter((c) => c !== 'All');
    const seen = new Set();
    const out = ['All'];
    for (const c of [...withoutAll, ...fromRows]) {
        if (c && !seen.has(c)) {
            seen.add(c);
            out.push(c);
        }
    }
    return out;
}

function DictionaryView({ workspaceId, initialSelectedDocIds = [], onUpdate, readOnly, cachedData = null, onDataLoaded = null }) {
    const { showAlert, showConfirm } = useAlert();
    const [viewMode, setViewMode] = useState('concept'); // 'concept' | 'relation' | 'action'
    // 정렬: 'recent' (id,desc) | 'name' (termKo/relationKo/actionKo,asc) | 'oldest' (id,asc)
    const [sortOption, setSortOption] = useState('recent');
    const [selectedCategory, setSelectedCategory] = useState({ id: 'All', name: 'All', label: '전체' });
    const [data, setData] = useState([]);
    const [categories, setCategories] = useState(['All']);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmedSearch, setConfirmedSearch] = useState(''); // 실제 테이블 검색에 사용

    // 자동완성
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);
    const controlsScrollRef = useRef(null);

    // Pagination
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0); // 총건수 (필터 없을 때의 전체 건수)
    const pageSize = 20;

    // Refs to prevent infinite loop (onDataLoaded, categories change every render)
    const onDataLoadedRef = useRef(onDataLoaded);
    onDataLoadedRef.current = onDataLoaded;
    const categoriesRef = useRef(categories);
    categoriesRef.current = categories;

    /** 현재 개념/관계/액션 탭에 대해 getCategories가 준 목록(및 탭 전환 시 즉시 리셋) — 다른 탭 카테고리와 섞이지 않게 함 */
    const categoryOptionsFromApiRef = useRef(['All']);

    // Modals
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTerm, setEditingTerm] = useState(null);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [moveSourceItem, setMoveSourceItem] = useState(null);
    const [moveSearchTerm, setMoveSearchTerm] = useState('');
    const [moveTargetId, setMoveTargetId] = useState(null);
    const [allCandidates, setAllCandidates] = useState([]);
    const [loadingCandidates, setLoadingCandidates] = useState(false);
    const [candidatePage, setCandidatePage] = useState(0);
    const [hasMoreCandidates, setHasMoreCandidates] = useState(true);
    const [keepSourceAsSynonym, setKeepSourceAsSynonym] = useState(true);

    // 정렬 sort 문자열 — viewMode 별 name field 다름. 검색 중엔 백엔드가 ORDER BY id DESC 로 고정됨.
    // 함수 선언(hoisting) 으로 fetchData useCallback 이전에 참조 가능.
    function buildSortParam() {
        if (sortOption === 'recent') return 'id,desc';
        if (sortOption === 'oldest') return 'id,asc';
        if (sortOption === 'nodes')  return 'refs,desc';  // 백엔드가 native 쿼리로 COUNT(reference) 기준 정렬
        if (sortOption === 'name') {
            const field = viewMode === 'concept' ? 'termKo'
                : viewMode === 'action' ? 'actionKo'
                : 'relationKo';
            return `${field},asc`;
        }
        return 'id,desc';
    }

    // 외부 클릭 시 자동완성 닫기
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 자동완성: 입력 시 서버에서 후보 검색
    useEffect(() => {
        if (!searchTerm.trim() || !workspaceId) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                const params = { workspaceId, page: 0, size: 10, search: searchTerm.trim(), sort: 'id,desc' };
                if (initialSelectedDocIds.length > 0) {
                    params.documentIds = initialSelectedDocIds.join(',');
                }
                let result;
                if (viewMode === 'concept')      result = await dictionaryApi.getConcepts(params);
                else if (viewMode === 'action')  result = await dictionaryApi.getActions(params);
                else                             result = await dictionaryApi.getRelations(params);
                if (result && result.content) {
                    setSuggestions(result.content);
                    setShowSuggestions(true);
                }
            } catch (err) {
                console.error('Autocomplete error', err);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, workspaceId, viewMode, initialSelectedDocIds]);

    // 자동완성 항목 선택
    const handleSelectSuggestion = (label) => {
        setSearchTerm(label);
        setConfirmedSearch(label);
        setShowSuggestions(false);
        setPage(0);
    };

    // Enter 키로 검색 실행
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            setConfirmedSearch(searchTerm.trim());
            setShowSuggestions(false);
            setPage(0);
        }
    };

    // 탭 전환 시 전체 초기화 (카테고리 + 검색 + 페이지)
    const handleTabChange = (newMode) => {
        setViewMode(newMode);
        setSelectedCategory({ id: 'All', name: 'All', label: '전체' });
        categoryOptionsFromApiRef.current = ['All'];
        setCategories(['All']);
        setSearchTerm('');
        setConfirmedSearch('');
        setSuggestions([]);
        setShowSuggestions(false);
        setPage(0);
    };

    // Fetch Categories
    const fetchCategories = useCallback(async () => {
        if (!workspaceId) return;
        try {
            const params = { type: viewMode, workspaceId };
            if (initialSelectedDocIds.length > 0) {
                params.documentIds = initialSelectedDocIds.join(',');
            }
            const result = await dictionaryApi.getCategories(params);
            if (Array.isArray(result)) {
                if (result.length > 0) {
                    const apiOnly = mergeDictionaryCategories(['All', ...result], []);
                    categoryOptionsFromApiRef.current = apiOnly;
                    setCategories(apiOnly);
                } else {
                    /* 빈 배열: 이전 탭 목록 유지 금지. setState는 fetchData(행 병합)에 맡김 — 여기서 덮어쓰면 순서에 따라 행 카테고리가 사라짐 */
                    categoryOptionsFromApiRef.current = ['All'];
                }
            } else {
                categoryOptionsFromApiRef.current = ['All'];
            }
        } catch (error) {
            console.error("Failed to fetch categories", error);
            categoryOptionsFromApiRef.current = ['All'];
        }
    }, [workspaceId, viewMode, initialSelectedDocIds]);

    // Fetch Data - 안정적 의존성만 포함 (onDataLoaded, categories는 ref 사용)
    const fetchData = useCallback(async (useCache = true) => {
        if (!workspaceId) return;

        // 검색어/카테고리 없고 캐시 사용 가능 시 (sort 가 기본 recent 일 때만 캐시 활용)
        if (useCache && sortOption === 'recent' && page === 0 && !confirmedSearch && selectedCategory.id === 'All' && cachedData && cachedData.viewMode === viewMode && cachedData.data && cachedData.data.length > 0) {
            setData(cachedData.data);
            const merged = mergeDictionaryCategories(cachedData.categories || ['All'], cachedData.data);
            categoryOptionsFromApiRef.current = merged;
            setCategories(merged);
            setTotalPages(cachedData.totalPages || 0);
            setTotalElements(cachedData.totalElements || 0);
            setGrandTotal(cachedData.totalElements || 0);
            return;
        }

        setLoading(true);
        try {
            const params = {
                workspaceId,
                page,
                size: pageSize,
                sort: buildSortParam()
            };
            if (initialSelectedDocIds.length > 0) {
                params.documentIds = initialSelectedDocIds.join(',');
            }
            if (confirmedSearch) {
                params.search = confirmedSearch;
            }
            if (selectedCategory.id !== 'All') {
                params.category = selectedCategory.id;
            }

            let result;
            if (viewMode === 'concept')      result = await dictionaryApi.getConcepts(params);
            else if (viewMode === 'action')  result = await dictionaryApi.getActions(params);
            else                             result = await dictionaryApi.getRelations(params);

            if (result && result.content) {
                setData(result.content);
                setTotalPages(result.totalPages || 0);
                setTotalElements(result.totalElements || 0);

                const nextCategories = mergeDictionaryCategories(categoryOptionsFromApiRef.current, result.content);
                categoryOptionsFromApiRef.current = nextCategories;
                setCategories(nextCategories);

                // 필터 없을 때 총건수 갱신
                if (!confirmedSearch && selectedCategory.id === 'All') {
                    setGrandTotal(result.totalElements || 0);
                }

                // 검색어/카테고리 없고 기본(recent) 정렬일 때만 캐시 저장.
                // 다른 정렬에서 호출하면 cachedData 변경 → fetchData 재생성 → 무한 루프 발생.
                if (sortOption === 'recent' && page === 0 && !confirmedSearch && selectedCategory.id === 'All' && onDataLoadedRef.current) {
                    onDataLoadedRef.current({
                        viewMode,
                        data: result.content,
                        categories: nextCategories,
                        totalPages: result.totalPages || 0,
                        totalElements: result.totalElements || 0
                    });
                }
            } else {
                setData([]);
                setTotalPages(0);
                setTotalElements(0);
            }
        } catch (error) {
            console.error("Failed to fetch dictionary data", error);
        } finally {
            setLoading(false);
        }
    }, [workspaceId, viewMode, page, confirmedSearch, selectedCategory.id, initialSelectedDocIds, cachedData, sortOption]);

    useEffect(() => {
        setPage(0);
        fetchCategories();
    }, [fetchCategories, viewMode, initialSelectedDocIds]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // 유의어 관련 state
    const [editSynonyms, setEditSynonyms] = useState([]);
    const [newSynonymText, setNewSynonymText] = useState('');
    const [synonymLoading, setSynonymLoading] = useState(false);

    const handleEditClick = async (item) => {
        setEditingTerm({ ...item });
        setNewSynonymText('');
        setIsEditModalOpen(true);
        // 유의어 목록 조회
        try {
            let syns;
            if (viewMode === 'concept')      syns = await dictionaryApi.getConceptSynonyms(item.id);
            else if (viewMode === 'action')  syns = await dictionaryApi.getActionSynonyms(item.id);
            else                             syns = await dictionaryApi.getRelationSynonyms(item.id);
            setEditSynonyms(Array.isArray(syns) ? syns : []);
        } catch (e) {
            console.error('Failed to load synonyms', e);
            setEditSynonyms([]);
        }
    };

    const handleAddSynonym = async () => {
        if (!newSynonymText.trim() || !editingTerm) return;
        setSynonymLoading(true);
        try {
            let result;
            if (viewMode === 'concept')      result = await dictionaryApi.addConceptSynonym(editingTerm.id, newSynonymText.trim());
            else if (viewMode === 'action')  result = await dictionaryApi.addActionSynonym(editingTerm.id, newSynonymText.trim());
            else                             result = await dictionaryApi.addRelationSynonym(editingTerm.id, newSynonymText.trim());
            setEditSynonyms(prev => [...prev, result]);
            setNewSynonymText('');
        } catch (e) {
            showAlert('유의어 추가에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setSynonymLoading(false);
        }
    };

    const handleDeleteSynonym = async (synId) => {
        setSynonymLoading(true);
        try {
            if (viewMode === 'concept')      await dictionaryApi.deleteConceptSynonym(synId);
            else if (viewMode === 'action')  await dictionaryApi.deleteActionSynonym(synId);
            else                             await dictionaryApi.deleteRelationSynonym(synId);
            setEditSynonyms(prev => prev.filter(s => s.id !== synId));
        } catch (e) {
            showAlert('유의어 삭제에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setSynonymLoading(false);
        }
    };

    const handleSynonymKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSynonym();
        }
    };

    // Move modal search with debounce
    useEffect(() => {
        if (!isMoveModalOpen) return;
        const timer = setTimeout(() => {
            setCandidatePage(0);
            setAllCandidates([]);
            setHasMoreCandidates(true);
            fetchAllCandidates(viewMode, 0, moveSearchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [moveSearchTerm, isMoveModalOpen]);

    const fetchAllCandidates = async (currentViewMode, pageNum, searchTerm) => {
        setLoadingCandidates(true);
        try {
            const params = {
                workspaceId,
                page: pageNum,
                size: 20,
                sort: buildSortParam()
            };
            if (searchTerm) {
                params.search = searchTerm;
            }

            let result;
            if (currentViewMode === 'concept')      result = await dictionaryApi.getConcepts(params);
            else if (currentViewMode === 'action')  result = await dictionaryApi.getActions(params);
            else                                    result = await dictionaryApi.getRelations(params);

            if (result && result.content) {
                if (pageNum === 0) {
                    setAllCandidates(result.content);
                } else {
                    setAllCandidates(prev => [...prev, ...result.content]);
                }
                setHasMoreCandidates(!result.last);
            } else {
                if (pageNum === 0) setAllCandidates([]);
                setHasMoreCandidates(false);
            }
        } catch (error) {
            console.error("Failed to fetch candidates", error);
            if (pageNum === 0) setAllCandidates([]);
        } finally {
            setLoadingCandidates(false);
        }
    };

    const handleLoadMoreCandidates = () => {
        if (!loadingCandidates && hasMoreCandidates) {
            const nextPage = candidatePage + 1;
            setCandidatePage(nextPage);
            fetchAllCandidates(viewMode, nextPage, moveSearchTerm);
        }
    };

    const handleMoveClick = (item) => {
        setMoveSourceItem(item);
        setMoveSearchTerm('');
        setMoveTargetId(null);
        setAllCandidates([]);
        setCandidatePage(0);
        setHasMoreCandidates(true);
        setIsMoveModalOpen(true);
        setKeepSourceAsSynonym(true);
    };

    const handleSaveEdit = async () => {
        if (!editingTerm) return;
        try {
            if (viewMode === 'concept')      await dictionaryApi.updateConcept(editingTerm.id, editingTerm);
            else if (viewMode === 'action')  await dictionaryApi.updateAction(editingTerm.id, editingTerm);
            else                             await dictionaryApi.updateRelation(editingTerm.id, editingTerm);
            setIsEditModalOpen(false);
            setEditSynonyms([]);
            fetchData(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            showAlert("사전 항목 저장에 실패했습니다. 다시 시도해주세요.");
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await showConfirm("정말로 삭제하시겠습니까?");
        if (!confirmed) return;
        try {
            if (viewMode === 'concept')      await dictionaryApi.deleteConcept(id);
            else if (viewMode === 'action')  await dictionaryApi.deleteAction(id);
            else                             await dictionaryApi.deleteRelation(id);
            fetchData(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            showAlert("사전 항목 삭제에 실패했습니다. 다시 시도해주세요.");
        }
    };

    const handleConfirmMove = async () => {
        if (!moveSourceItem || !moveTargetId) return;
        try {
            const payload = {
                sourceId: moveSourceItem.id,
                targetId: moveTargetId,
                workspaceId: workspaceId,
                mode: 'move',
                keepSourceAsSynonym: keepSourceAsSynonym
            };
            if (viewMode === 'concept')      await dictionaryApi.mergeConcepts(payload);
            else if (viewMode === 'action')  await dictionaryApi.mergeActions(payload);
            else                             await dictionaryApi.mergeRelations(payload);
            setIsMoveModalOpen(false);
            fetchData(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            showAlert("사전 항목 이동에 실패했습니다. 다시 시도해주세요.");
        }
    };

    const handleModalChange = (field, value) => {
        setEditingTerm(prev => ({ ...prev, [field]: value }));
    };

    const handleControlsWheel = (e) => {
        const el = controlsScrollRef.current;
        if (!el) return;
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault();
            el.scrollBy({ left: e.deltaY, behavior: 'auto' });
        }
    };

    // 카테고리 필터는 서버에서 처리 — 클라이언트 필터 불필요
    const filteredData = data;

    // 카테고리 문자열 렌더 — ':' 계층 구분자를 빨간 굵은 글씨로 표시
    const renderCategory = (cat) => {
        if (!cat) return '-';
        const parts = String(cat).split(':');
        if (parts.length === 1) return parts[0];
        return parts.map((part, i) => (
            <span key={i}>
                {part}
                {i < parts.length - 1 && (
                    <span style={{ color: '#e53935', fontWeight: 800, margin: '0 3px' }}>:</span>
                )}
            </span>
        ));
    };

    return (
        <div className="dictionary-view">
            <div className="view-header">
                <div className="tab-group">
                    <button
                        className={`dictionary-mode-tab ${viewMode === 'concept' ? 'active' : ''}`}
                        onClick={() => handleTabChange('concept')}
                    >
                        <span className="dictionary-mode-tab-label">개념</span>
                        <span className="dictionary-mode-tab-subtitle">Concepts</span>
                    </button>
                    <button
                        className={`dictionary-mode-tab ${viewMode === 'relation' ? 'active' : ''}`}
                        onClick={() => handleTabChange('relation')}
                    >
                        <span className="dictionary-mode-tab-label">관계</span>
                        <span className="dictionary-mode-tab-subtitle">Relations</span>
                    </button>
                    <button
                        className={`dictionary-mode-tab ${viewMode === 'action' ? 'active' : ''}`}
                        onClick={() => handleTabChange('action')}
                    >
                        <span className="dictionary-mode-tab-label">액션</span>
                        <span className="dictionary-mode-tab-subtitle">Actions</span>
                    </button>
                    <div className="item-count-info">
                        <span>
                            {(selectedCategory.id !== 'All' || confirmedSearch)
                                ? `${totalElements}건 / ${grandTotal}건`
                                : `${totalElements}건`}
                        </span>
                    </div>
                </div>

                <div className="filter-search-scroll-wrap">
                    <div
                        className="filter-search-scroll"
                        ref={controlsScrollRef}
                        onWheel={handleControlsWheel}
                    >
                        <div className="filter-search-group">
                            <div className="category-filter-inline">
                                <label htmlFor="category-select" className="visually-hidden">카테고리</label>
                                <select
                                    id="category-select"
                                    aria-label="카테고리 선택"
                                    value={selectedCategory.id}
                                    onChange={(e) => {
                                        const catId = e.target.value;
                                        setSelectedCategory({ id: catId, name: catId, label: catId });
                                        setPage(0);
                                    }}
                                >
                                    {categories.map((cat, idx) => (
                                        <option key={idx} value={cat === 'All' ? 'All' : cat}>
                                            {cat === 'All' ? '전체' : cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="category-filter-inline">
                                <label htmlFor="sort-select" className="visually-hidden">정렬</label>
                                <select
                                    id="sort-select"
                                    aria-label="정렬 선택"
                                    value={sortOption}
                                    onChange={(e) => { setSortOption(e.target.value); setPage(0); }}
                                    title={confirmedSearch ? '검색 중에는 최근순 고정' : ''}
                                    disabled={!!confirmedSearch}
                                >
                                    <option value="recent">최근순</option>
                                    <option value="oldest">오래된순</option>
                                    <option value="name">이름순 (가나다)</option>
                                    <option value="nodes" disabled={selectedCategory.id !== 'All'}>
                                        노드 많은순{selectedCategory.id !== 'All' ? ' (전체에서만)' : ''}
                                    </option>
                                </select>
                            </div>

                            <div className="search-bar" ref={searchRef} style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    placeholder="검색어 입력 후 Enter..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                                />

                                {/* 자동완성 드롭다운 */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div style={{
                                        position: 'absolute', top: '100%', left: 0, right: 0,
                                        backgroundColor: 'white', border: '1px solid #ddd', borderTop: 'none',
                                        borderRadius: '0 0 6px 6px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                        zIndex: 100, maxHeight: '240px', overflowY: 'auto'
                                    }}>
                                        {suggestions.map(item => (
                                            <div
                                                key={item.id}
                                                onClick={() => handleSelectSuggestion(item.label)}
                                                style={{
                                                    padding: '8px 12px', cursor: 'pointer',
                                                    borderBottom: '1px solid #f5f5f5',
                                                    display: 'flex', alignItems: 'center', gap: '8px',
                                                    fontSize: '13px'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f7ff'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                            >
                                                <span style={{
                                                    fontSize: '10px', padding: '1px 6px', borderRadius: '3px',
                                                    backgroundColor: '#e8eaf6', color: '#3949ab', flexShrink: 0
                                                }}>
                                                    {renderCategory(item.category)}
                                                </span>
                                                <span style={{ fontWeight: 500 }}>{item.label}</span>
                                                {item.labelEn && (
                                                    <span style={{ color: '#999', fontSize: '11px' }}>({item.labelEn})</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="content-area">

                <div className="data-table">
                    <div className="table-header">
                        <div className="header-cell" style={{ flex: 1.5 }}>카테고리</div>
                        <div className="header-cell" style={{ flex: 2 }}>용어(KR)</div>
                        <div className="header-cell" style={{ flex: 2 }}>용어(EN)</div>
                        <div className="header-cell" style={{ flex: 3 }}>설명</div>
                        <div className="header-cell" style={{ flex: 2 }}>유의어</div>
                        {!readOnly && <div className="header-cell action-column" style={{ justifyContent: 'center', flex: 0.8 }}>관리</div>}
                    </div>

                    <div className="term-list">
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                                <div style={{
                                    width: '24px', height: '24px', border: '2px solid #e0e0e0',
                                    borderTopColor: '#1a73e8', borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite', margin: '0 auto 8px'
                                }} />
                                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                                사전 데이터를 불러오는 중...
                            </div>
                        ) : filteredData.length === 0 ? (
                            <div className="dict-empty-state" role="status" aria-live="polite">
                                <div className="dict-empty-inner">
                                    <div className="dict-empty-icon" aria-hidden>
                                        <BookOpen size={48} strokeWidth={1.25} />
                                    </div>
                                    <p className="dict-empty-title">
                                        {searchTerm ? '검색 결과가 없습니다' : '온톨로지 사전이 비어있습니다'}
                                    </p>
                                    <p className="dict-empty-desc">
                                        {searchTerm
                                            ? '다른 검색어를 시도하거나 카테고리 필터를 변경해보세요.'
                                            : '문서를 업로드하고 처리하면 자동으로 개념과 관계가 추출됩니다.'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            filteredData.map(item => (
                                <div key={item.id} className="term-item">
                                    <div className="term-cell" style={{ flex: 1.5 }}>
                                        <span className="category-tag">{renderCategory(item.category)}</span>
                                    </div>
                                    <div className="term-cell" style={{ flex: 2, fontWeight: 'bold' }}>{item.label}</div>
                                    <div className="term-cell" style={{ flex: 2, color: '#555' }}>{item.labelEn}</div>
                                    <div className="term-cell" style={{ flex: 3, fontSize: '0.9em', color: '#666' }}>
                                        {item.description && item.description.length > 50
                                            ? item.description.substring(0, 50) + '...'
                                            : item.description}
                                    </div>
                                    <div className="term-cell" style={{ flex: 2, color: '#888', fontStyle: 'italic' }}>
                                        {item.synonym || '-'}
                                    </div>
                                    {!readOnly && (
                                        <div className="term-cell action-column" style={{ justifyContent: 'center', gap: '4px', flex: 0.8 }}>
                                            <button className="icon-btn edit-btn" onClick={() => handleEditClick(item)} title="수정">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="icon-btn move-btn" onClick={() => handleMoveClick(item)} title="이동 (병합)">
                                                <ArrowRightCircle size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination Controls */}
                    <div className="pagination-container">
                        <div className="pagination">
                            <button
                                disabled={page === 0}
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span>{page + 1} / {totalPages || 1}</span>
                            <button
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage(p => p + 1)}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && editingTerm && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal" style={{ width: '480px' }}>
                        <h3>항목 수정</h3>
                        <div className="edit-form">
                            <div className="form-group">
                                <label>라벨(KR)</label>
                                <input
                                    type="text"
                                    value={editingTerm.label || ''}
                                    onChange={(e) => handleModalChange('label', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>라벨(EN)</label>
                                <input
                                    type="text"
                                    value={editingTerm.labelEn || ''}
                                    onChange={(e) => handleModalChange('labelEn', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>설명</label>
                                <textarea
                                    value={editingTerm.description || ''}
                                    onChange={(e) => handleModalChange('description', e.target.value)}
                                    rows="3"
                                />
                            </div>
                            {/* 유의어 */}
                            <div className="form-group">
                                <label>유의어</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px', minHeight: '28px' }}>
                                    {editSynonyms.length === 0 && (
                                        <span style={{ color: '#999', fontSize: '12px' }}>등록된 유의어가 없습니다.</span>
                                    )}
                                    {editSynonyms.map(syn => (
                                        <span key={syn.id} style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            padding: '3px 8px 3px 10px', borderRadius: '14px',
                                            backgroundColor: '#e3f2fd', color: '#1565c0', fontSize: '12px',
                                            border: '1px solid #bbdefb'
                                        }}>
                                            {syn.synonym}
                                            {!readOnly && (
                                                <button
                                                    onClick={() => handleDeleteSynonym(syn.id)}
                                                    disabled={synonymLoading}
                                                    style={{
                                                        background: 'none', border: 'none', cursor: 'pointer',
                                                        padding: '0', display: 'flex', alignItems: 'center',
                                                        color: '#1565c0', opacity: synonymLoading ? 0.5 : 1
                                                    }}
                                                    title="삭제"
                                                >
                                                    <X size={13} />
                                                </button>
                                            )}
                                        </span>
                                    ))}
                                </div>
                                {!readOnly && (
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <input
                                            type="text"
                                            placeholder="유의어 입력 후 Enter 또는 + 클릭"
                                            value={newSynonymText}
                                            onChange={(e) => setNewSynonymText(e.target.value)}
                                            onKeyDown={handleSynonymKeyDown}
                                            style={{ flex: 1 }}
                                            disabled={synonymLoading}
                                        />
                                        <button
                                            onClick={handleAddSynonym}
                                            disabled={!newSynonymText.trim() || synonymLoading}
                                            style={{
                                                padding: '4px 10px', border: '1px solid #1976d2', borderRadius: '4px',
                                                backgroundColor: newSynonymText.trim() ? '#1976d2' : '#ccc',
                                                color: 'white', cursor: newSynonymText.trim() ? 'pointer' : 'not-allowed',
                                                display: 'flex', alignItems: 'center'
                                            }}
                                            title="유의어 추가"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-buttons">
                            <button className="cancel-btn" onClick={() => { setIsEditModalOpen(false); setEditSynonyms([]); }}>취소</button>
                            <button className="save-btn" onClick={handleSaveEdit}>저장</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Move Modal */}
            {isMoveModalOpen && moveSourceItem && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal" style={{ width: '500px' }}>
                        <h3>{viewMode === 'concept' ? '개념' : '관계'} 이동 (병합)</h3>
                        <p style={{ color: '#666', fontSize: '13px', marginBottom: '16px' }}>
                            <b>'{moveSourceItem.label}'</b> {viewMode === 'concept' ? '개념' : '관계'}을 다른 {viewMode === 'concept' ? '개념' : '관계'}으로 이동(병합)합니다. <br />
                            이동 후 원본 {viewMode === 'concept' ? '개념' : '관계'}은 삭제되며, 모든 문서 출처와 관계가 대상 {viewMode === 'concept' ? '개념' : '관계'}으로 이전됩니다.
                        </p>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>이동할 대상 검색</label>
                            <input
                                type="text"
                                placeholder="대상 검색..."
                                value={moveSearchTerm}
                                onChange={(e) => setMoveSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                            <div
                                style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}
                                onScroll={(e) => {
                                    const { scrollTop, scrollHeight, clientHeight } = e.target;
                                    if (scrollHeight - scrollTop <= clientHeight + 50) {
                                        handleLoadMoreCandidates();
                                    }
                                }}
                            >
                                {allCandidates
                                    .filter(t => t.id !== moveSourceItem.id)
                                    .map(t => (
                                        <div
                                            key={t.id}
                                            onClick={() => setMoveTargetId(t.id)}
                                            style={{
                                                padding: '8px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0',
                                                backgroundColor: moveTargetId === t.id ? '#e3f2fd' : 'white',
                                                display: 'flex', alignItems: 'center', gap: '8px'
                                            }}
                                        >
                                            <span className="category-tag small" style={{ fontSize: '10px', padding: '2px 6px' }}>{t.category}</span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{t.label}</div>
                                                <div style={{ fontSize: '11px', color: '#666' }}>{t.labelEn}</div>
                                            </div>
                                        </div>
                                    ))}
                                {loadingCandidates && (
                                    <div style={{ padding: '8px', color: '#666', textAlign: 'center' }}>목록 불러오는 중...</div>
                                )}
                                {!loadingCandidates && allCandidates.length === 0 && (
                                    <div style={{ padding: '8px', color: '#666', textAlign: 'center' }}>검색 결과가 없습니다.</div>
                                )}
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                id="keepSourceAsSynonym"
                                checked={keepSourceAsSynonym}
                                onChange={(e) => setKeepSourceAsSynonym(e.target.checked)}
                                style={{ marginRight: '8px' }}
                            />
                            <label htmlFor="keepSourceAsSynonym" style={{ fontSize: '13px', color: '#333', cursor: 'pointer' }}>
                                원본 용어를 유의어로 추가 (병합 후 검색 가능)
                            </label>
                        </div>

                        <div className="modal-buttons">
                            <button className="cancel-btn" onClick={() => setIsMoveModalOpen(false)}>취소</button>
                            <button
                                className="save-btn"
                                onClick={handleConfirmMove}
                                disabled={!moveTargetId}
                                style={{ backgroundColor: moveTargetId ? '#1976d2' : '#ccc', cursor: moveTargetId ? 'pointer' : 'not-allowed' }}
                            >
                                이동
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DictionaryView;

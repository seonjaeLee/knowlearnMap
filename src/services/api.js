import { API_BASE_URL, API_URL } from '../config/api';
const isLocalAuthEnabled = import.meta.env.VITE_ENABLE_LOCAL_AUTH === 'true';
const LOCAL_WORKSPACES_KEY = 'localMockWorkspaces';
const LOCAL_WORKSPACE_ROLES_KEY = 'localMockWorkspaceRolesByWorkspace';
const LOCAL_DICTIONARY_KEY = 'localMockDictionaryByWorkspace';

/**
 * XSRF-TOKEN 쿠키에서 CSRF 토큰 읽기
 */
function getCsrfToken() {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

const getDefaultLocalWorkspaces = () => ([
    {
        id: 101,
        name: 'Untitled notebook',
        title: 'Untitled notebook',
        description: '',
        icon: '📄',
        color: 'yellow',
        role: 'Owner',
        date: '2026. 04. 28.',
        documentCount: 1,
        domainId: 3,
        shareType: 'NONE',
    },
]);

const getLocalWorkspaces = () => {
    const raw = localStorage.getItem(LOCAL_WORKSPACES_KEY);
    if (!raw) {
        const defaults = getDefaultLocalWorkspaces();
        localStorage.setItem(LOCAL_WORKSPACES_KEY, JSON.stringify(defaults));
        return defaults;
    }
    try {
        return JSON.parse(raw);
    } catch (_) {
        const defaults = getDefaultLocalWorkspaces();
        localStorage.setItem(LOCAL_WORKSPACES_KEY, JSON.stringify(defaults));
        return defaults;
    }
};

const setLocalWorkspaces = (items) => {
    localStorage.setItem(LOCAL_WORKSPACES_KEY, JSON.stringify(items));
};

const getDefaultLocalRoles = () => ([
    {
        id: 1,
        roleName: '기초값',
        promptText: '문서 기반으로 간결하고 정확하게 답변합니다.',
        enabled: true,
    },
]);

const getLocalRolesMap = () => {
    const raw = localStorage.getItem(LOCAL_WORKSPACE_ROLES_KEY);
    if (!raw) {
        const defaults = {};
        localStorage.setItem(LOCAL_WORKSPACE_ROLES_KEY, JSON.stringify(defaults));
        return defaults;
    }
    try {
        return JSON.parse(raw);
    } catch (_) {
        const defaults = {};
        localStorage.setItem(LOCAL_WORKSPACE_ROLES_KEY, JSON.stringify(defaults));
        return defaults;
    }
};

const setLocalRolesMap = (map) => {
    localStorage.setItem(LOCAL_WORKSPACE_ROLES_KEY, JSON.stringify(map));
};

const getDefaultLocalDictionary = () => ({
    concepts: [
        {
            id: 1001,
            category: '뷰티:제품',
            label: '향수',
            labelEn: 'Perfume',
            description: '향을 중심으로 한 화장품 제품군',
            refs: 12,
            synonyms: ['퍼퓸', '향수제품'],
        },
    ],
    relations: [
        {
            id: 2001,
            category: '분류',
            label: '포함한다',
            labelEn: 'includes',
            description: '상위 카테고리가 하위 대상을 포함함',
            refs: 8,
            synonyms: ['내포한다'],
        },
    ],
    actions: [
        {
            id: 3001,
            category: '운영',
            label: '추천한다',
            labelEn: 'recommend',
            description: '문맥 기반으로 대상을 추천',
            refs: 5,
            synonyms: ['권장한다'],
        },
    ],
});

const getLocalDictionaryMap = () => {
    const raw = localStorage.getItem(LOCAL_DICTIONARY_KEY);
    if (!raw) {
        const defaults = {};
        localStorage.setItem(LOCAL_DICTIONARY_KEY, JSON.stringify(defaults));
        return defaults;
    }
    try {
        return JSON.parse(raw);
    } catch (_) {
        const defaults = {};
        localStorage.setItem(LOCAL_DICTIONARY_KEY, JSON.stringify(defaults));
        return defaults;
    }
};

const setLocalDictionaryMap = (map) => {
    localStorage.setItem(LOCAL_DICTIONARY_KEY, JSON.stringify(map));
};

const ensureLocalDictionary = (workspaceId) => {
    const map = getLocalDictionaryMap();
    const key = String(workspaceId);
    if (!map[key]) {
        map[key] = getDefaultLocalDictionary();
        setLocalDictionaryMap(map);
    }
    return { map, key, data: map[key] };
};

const localDictionaryList = (workspaceId, type) => {
    const { data } = ensureLocalDictionary(workspaceId);
    return Array.isArray(data[type]) ? data[type] : [];
};

const paginateLocalDictionary = (items, params = {}) => {
    const page = Number(params.page || 0);
    const size = Number(params.size || 20);
    const search = (params.search || '').trim().toLowerCase();
    const category = params.category;

    let filtered = [...items];
    if (search) {
        filtered = filtered.filter((item) =>
            [item.label, item.labelEn, item.description, item.category]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(search))
        );
    }
    if (category && category !== 'All') {
        filtered = filtered.filter((item) => String(item.category || '') === String(category));
    }

    const totalElements = filtered.length;
    const start = page * size;
    const end = start + size;
    return {
        content: filtered.slice(start, end),
        totalPages: Math.ceil(totalElements / size),
        totalElements,
        last: end >= totalElements,
    };
};

/**
 * API 호출 공통 함수
 */
export const apiCall = async (endpoint, options = {}) => {
    try {
        const csrfToken = getCsrfToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        // 상태 변경 요청(POST/PUT/DELETE/PATCH)에 CSRF 토큰 추가
        if (csrfToken && options.method && options.method !== 'GET') {
            headers['X-XSRF-TOKEN'] = csrfToken;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
            credentials: 'include',
        });

        if (response.status === 401) {
            window.dispatchEvent(new Event('auth:expired'));
            throw new Error('세션이 만료되었습니다.');
        }

        if (!response.ok) {
            let errorMsg;
            try {
                const errorBody = await response.json();
                if (errorBody && errorBody.message) {
                    errorMsg = errorBody.message;
                }
            } catch (_) { /* JSON 파싱 실패 시 기본 메시지 */ }
            if (!errorMsg) {
                const { getHttpErrorMessage } = await import('../utils/errorMessages.js');
                errorMsg = getHttpErrorMessage(response.status);
            }
            throw new Error(errorMsg);
        }

        const text = await response.text();
        const data = text ? JSON.parse(text) : {};

        // 백엔드 ApiResponse 포맷 처리
        if (data.success === false) {
            throw new Error(data.message || '요청 실패');
        }

        // ApiResponse 래퍼가 있으면 data.data 반환, 없으면 data 그대로 반환
        return data.data !== undefined ? data.data : data;
    } catch (error) {
        console.error('API 호출 실패:', error);
        throw error;
    }
};

/**
 * Workspace API
 */
export const workspaceApi = {
    /**
     * 모든 워크스페이스 조회
     */
    getAll: async (params = {}) => {
        if (isLocalAuthEnabled) {
            const all = getLocalWorkspaces();
            const domainId = params?.domainId;
            return domainId ? all.filter((w) => String(w.domainId) === String(domainId)) : all;
        }
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/workspaces?${queryString}` : '/workspaces';
        return await apiCall(endpoint);
    },

    /**
     * 워크스페이스 단건 조회
     */
    getById: async (id) => {
        if (isLocalAuthEnabled) {
            const found = getLocalWorkspaces().find((w) => Number(w.id) === Number(id));
            if (!found) throw new Error('워크스페이스를 찾을 수 없습니다.');
            return found;
        }
        return await apiCall(`/workspaces/${id}`);
    },

    /**
     * 워크스페이스 생성
     */
    create: async (workspaceData) => {
        if (isLocalAuthEnabled) {
            const list = getLocalWorkspaces();
            const nextId = Math.max(0, ...list.map((w) => Number(w.id) || 0)) + 1;
            const created = {
                ...workspaceData,
                id: nextId,
                title: workspaceData.name || 'Untitled notebook',
                role: 'Owner',
                date: new Date().toISOString().slice(0, 10).replace(/-/g, '. ') + '.',
                documentCount: 0,
                shareType: workspaceData.isShared ? 'ALL' : 'NONE',
            };
            setLocalWorkspaces([created, ...list]);
            return created;
        }
        return await apiCall('/workspaces', {
            method: 'POST',
            body: JSON.stringify(workspaceData),
        });
    },

    /**
     * 워크스페이스 수정
     */
    update: async (id, workspaceData) => {
        if (isLocalAuthEnabled) {
            const list = getLocalWorkspaces();
            const updated = list.map((w) =>
                Number(w.id) === Number(id)
                    ? { ...w, ...workspaceData, title: workspaceData.name || w.title }
                    : w
            );
            setLocalWorkspaces(updated);
            return updated.find((w) => Number(w.id) === Number(id));
        }
        return await apiCall(`/workspaces/${id}`, {
            method: 'PUT',
            body: JSON.stringify(workspaceData),
        });
    },

    /**
     * 워크스페이스 삭제
     */
    delete: async (id) => {
        if (isLocalAuthEnabled) {
            const list = getLocalWorkspaces().filter((w) => Number(w.id) !== Number(id));
            setLocalWorkspaces(list);
            return true;
        }
        return await apiCall(`/workspaces/${id}`, {
            method: 'DELETE',
        });
    },

    /**
     * 비즈메타 CSV 업로드
     */
    uploadBizMeta: async (id, file) => {
        const formData = new FormData();
        formData.append('file', file);
        const csrfToken = getCsrfToken();
        const headers = {};
        if (csrfToken) headers['X-XSRF-TOKEN'] = csrfToken;
        const response = await fetch(`${API_BASE_URL}/workspaces/${id}/biz-meta/upload`, {
            method: 'POST',
            headers,
            body: formData,
            credentials: 'include',
        });
        return await response.json();
    },

    /**
     * 비즈메타 직접 저장
     */
    saveBizMeta: async (id, bizMeta) => {
        return await apiCall(`/workspaces/${id}/biz-meta`, {
            method: 'PUT',
            body: JSON.stringify({ bizMeta }),
        });
    },

    /**
     * IT메타 CSV 업로드
     */
    uploadItMeta: async (id, file) => {
        const formData = new FormData();
        formData.append('file', file);
        const csrfToken = getCsrfToken();
        const headers = {};
        if (csrfToken) headers['X-XSRF-TOKEN'] = csrfToken;
        const response = await fetch(`${API_BASE_URL}/workspaces/${id}/it-meta/upload`, {
            method: 'POST',
            headers,
            body: formData,
            credentials: 'include',
        });
        return await response.json();
    },

    /**
     * IT메타 직접 저장
     */
    saveItMeta: async (id, itMeta) => {
        return await apiCall(`/workspaces/${id}/it-meta`, {
            method: 'PUT',
            body: JSON.stringify({ itMeta }),
        });
    },

    /**
     * 워크스페이스 공유 상태 토글 (Admin 전용) - 하위 호환
     */
    toggleShare: async (id) => {
        return await apiCall(`/workspaces/${id}/share`, {
            method: 'PUT',
        });
    },

    /**
     * 워크스페이스 공유 설정 변경 (3모드: NONE/ALL/INDIVIDUAL)
     */
    updateShare: async (id, shareType, memberEmails) => {
        const body = { shareType };
        if (memberEmails && memberEmails.length > 0) {
            body.memberEmails = memberEmails;
        }
        return await apiCall(`/workspaces/${id}/share`, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    },

    /**
     * 개별 공유 멤버 목록 조회
     */
    getSharedMembers: async (id) => {
        return await apiCall(`/workspaces/${id}/share/members`);
    },

    /**
     * 개별 공유 멤버 추가
     */
    addSharedMember: async (id, email) => {
        return await apiCall(`/workspaces/${id}/share/members`, {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    /**
     * 개별 공유 멤버 삭제
     */
    removeSharedMember: async (id, memberId) => {
        return await apiCall(`/workspaces/${id}/share/members/${memberId}`, {
            method: 'DELETE',
        });
    },

    /**
     * 멤버 이메일 검색 (자동완성)
     */
    searchMembers: async (query) => {
        return await apiCall(`/workspaces/admin/members/search?q=${encodeURIComponent(query)}`);
    },

    /**
     * 전체 워크스페이스 조회 (Admin 전용)
     */
    adminGetAll: async () => {
        return await apiCall('/workspaces/admin/all');
    },

    /**
     * 워크스페이스 역할 목록 조회
     */
    getRoles: async (workspaceId) => {
        if (isLocalAuthEnabled) {
            const map = getLocalRolesMap();
            const key = String(workspaceId);
            if (!map[key]) {
                map[key] = getDefaultLocalRoles();
                setLocalRolesMap(map);
            }
            return map[key];
        }
        return await apiCall(`/workspaces/${workspaceId}/roles`);
    },

    /**
     * 워크스페이스 역할 일괄 저장
     */
    saveRoles: async (workspaceId, roles) => {
        return await apiCall(`/workspaces/${workspaceId}/roles`, {
            method: 'PUT',
            body: JSON.stringify(roles),
        });
    },

    /**
     * 워크스페이스 역할 단건 추가
     */
    createRole: async (workspaceId, roleData) => {
        return await apiCall(`/workspaces/${workspaceId}/roles`, {
            method: 'POST',
            body: JSON.stringify(roleData),
        });
    },

    /**
     * 워크스페이스 역할 단건 수정
     */
    updateRole: async (workspaceId, roleId, roleData) => {
        return await apiCall(`/workspaces/${workspaceId}/roles/${roleId}`, {
            method: 'PUT',
            body: JSON.stringify(roleData),
        });
    },

    /**
     * 워크스페이스 역할 단건 삭제
     */
    deleteRole: async (workspaceId, roleId) => {
        return await apiCall(`/workspaces/${workspaceId}/roles/${roleId}`, {
            method: 'DELETE',
        });
    },

    /**
     * 기초값 페르소나 기본 텍스트 조회
     */
    getPersonaDefaultText: async (workspaceId) => {
        return await apiCall(`/workspaces/${workspaceId}/persona/default-text`);
    },
};

/**
 * Prompt API
 */
export const promptApi = {
    /**
     * 모든 프롬프트 조회
     */
    getAll: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/v1/prompts?${queryString}` : '/v1/prompts';
        return await apiCall(endpoint);
    },

    /**
     * 프롬프트 단건 조회
     */
    getById: async (code) => {
        return await apiCall(`/v1/prompts/${code}`);
    },

    /**
     * 프롬프트 생성
     */
    create: async (promptData) => {
        return await apiCall('/v1/prompts', {
            method: 'POST',
            body: JSON.stringify(promptData),
        });
    },

    /**
     * 프롬프트 수정
     */
    update: async (code, promptData) => {
        return await apiCall(`/v1/prompts/${code}`, {
            method: 'PUT',
            body: JSON.stringify(promptData),
        });
    },

    /**
     * 프롬프트 삭제
     */
    delete: async (code) => {
        return await apiCall(`/v1/prompts/${code}`, {
            method: 'DELETE',
        });
    },
};

/**
 * Ontology API
 */
export const ontologyApi = {
    /**
     * ArangoDB 동기화
     */
    sync: async (workspaceId, dropExist = true) => {
        return await apiCall(`/ontology/sync/${workspaceId}?dropExist=${dropExist}`, {
            method: 'POST',
        });
    },
    /**
     * ArangoDB 동기화 진행 상황 조회
     */
    getSyncProgress: async (jobId) => {
        return await apiCall(`/ontology/sync/progress/${jobId}`);
    },
};

/**
 * Dictionary API
 */
export const dictionaryApi = {
    getConcepts: async (params) => {
        if (isLocalAuthEnabled) {
            const workspaceId = params?.workspaceId || 0;
            return paginateLocalDictionary(localDictionaryList(workspaceId, 'concepts'), params);
        }
        const queryString = new URLSearchParams(params).toString();
        return await apiCall(`/dictionary/concepts?${queryString}`);
    },
    getRelations: async (params) => {
        if (isLocalAuthEnabled) {
            const workspaceId = params?.workspaceId || 0;
            return paginateLocalDictionary(localDictionaryList(workspaceId, 'relations'), params);
        }
        const queryString = new URLSearchParams(params).toString();
        return await apiCall(`/dictionary/relations?${queryString}`);
    },
    getCategories: async (params) => {
        if (isLocalAuthEnabled) {
            const workspaceId = params?.workspaceId || 0;
            const type = params?.type === 'relation' ? 'relations' : params?.type === 'action' ? 'actions' : 'concepts';
            const list = localDictionaryList(workspaceId, type);
            const set = new Set(list.map((item) => item.category).filter(Boolean));
            return [...set];
        }
        const queryString = new URLSearchParams(params).toString();
        return await apiCall(`/dictionary/categories?${queryString}`);
    },
    updateConcept: async (id, data) => {
        return await apiCall(`/dictionary/concepts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    updateRelation: async (id, data) => {
        return await apiCall(`/dictionary/relations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    deleteConcept: async (id) => {
        return await apiCall(`/dictionary/concepts/${id}`, {
            method: 'DELETE',
        });
    },
    deleteRelation: async (id) => {
        return await apiCall(`/dictionary/relations/${id}`, {
            method: 'DELETE',
        });
    },
    mergeConcepts: async (data) => {
        return await apiCall('/dictionary/concepts/merge', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    mergeRelations: async (data) => {
        return await apiCall('/dictionary/relations/merge', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    // 유의어 CRUD
    getConceptSynonyms: async (conceptId) => {
        return await apiCall(`/dictionary/concepts/${conceptId}/synonyms`);
    },
    getRelationSynonyms: async (relationId) => {
        return await apiCall(`/dictionary/relations/${relationId}/synonyms`);
    },
    addConceptSynonym: async (conceptId, synonym) => {
        return await apiCall(`/dictionary/concepts/${conceptId}/synonyms`, {
            method: 'POST',
            body: JSON.stringify({ synonym }),
        });
    },
    addRelationSynonym: async (relationId, synonym) => {
        return await apiCall(`/dictionary/relations/${relationId}/synonyms`, {
            method: 'POST',
            body: JSON.stringify({ synonym }),
        });
    },
    deleteConceptSynonym: async (synonymId) => {
        return await apiCall(`/dictionary/concepts/synonyms/${synonymId}`, {
            method: 'DELETE',
        });
    },
    deleteRelationSynonym: async (synonymId) => {
        return await apiCall(`/dictionary/relations/synonyms/${synonymId}`, {
            method: 'DELETE',
        });
    },

    // V20260427: Action Dictionary
    getActions: async (params) => {
        if (isLocalAuthEnabled) {
            const workspaceId = params?.workspaceId || 0;
            return paginateLocalDictionary(localDictionaryList(workspaceId, 'actions'), params);
        }
        const queryString = new URLSearchParams(params).toString();
        return await apiCall(`/dictionary/actions?${queryString}`);
    },
    updateAction: async (id, data) => {
        return await apiCall(`/dictionary/actions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    deleteAction: async (id) => {
        return await apiCall(`/dictionary/actions/${id}`, {
            method: 'DELETE',
        });
    },
    getActionSynonyms: async (actionId) => {
        return await apiCall(`/dictionary/actions/${actionId}/synonyms`);
    },
    addActionSynonym: async (actionId, synonym) => {
        return await apiCall(`/dictionary/actions/${actionId}/synonyms`, {
            method: 'POST',
            body: JSON.stringify({ synonym }),
        });
    },
    deleteActionSynonym: async (synonymId) => {
        return await apiCall(`/dictionary/actions/synonyms/${synonymId}`, {
            method: 'DELETE',
        });
    },
    mergeActions: async (data) => {
        return await apiCall('/dictionary/actions/merge', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
};

/**
 * Upgrade API
 */
export const upgradeApi = {
    request: async (formData) => {
        const csrfToken = getCsrfToken();
        const headers = {};
        if (csrfToken) headers['X-XSRF-TOKEN'] = csrfToken;
        const response = await fetch(`${API_BASE_URL}/upgrade/request`, {
            method: 'POST',
            headers,
            body: formData,
            // Do NOT set Content-Type header for FormData, browser does it with boundary
            credentials: 'include',
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }

        // Backend returns plain text message, usually
        return await response.text();
    },

    // Admin Endpoints
    getAllRequests: async () => {
        return await apiCall('/admin/upgrades');
    },

    approveRequest: async (id) => {
        return await apiCall(`/admin/upgrades/${id}/approve`, {
            method: 'PUT'
        });
    },

    rejectRequest: async (id, reason) => {
        return await apiCall(`/admin/upgrades/${id}/reject`, {
            method: 'PUT',
            body: JSON.stringify({ reason })
        });
    },

    checkStatus: async () => {
        return await apiCall('/upgrade/status');
    },

    getGradeLimits: async () => {
        return await apiCall('/config/public/grade-limits');
    }
};

/**
 * Member API
 */
export const memberApi = {
    getAll: async (page = 0, size = 100) => {
        const data = await apiCall(`/members?page=${page}&size=${size}`);
        // Page 응답: { content: [...], totalElements, ... } → content 배열 반환 (하위 호환)
        return data.content !== undefined ? data.content : data;
    },
    update: async (id, data) => {
        return await apiCall(`/members/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    delete: async (id) => {
        return await apiCall(`/members/${id}`, {
            method: 'DELETE'
        });
    },
    resendVerification: async (id) => {
        return await apiCall(`/members/${id}/resend-verification`, {
            method: 'POST'
        });
    },
    changeGrade: async (username, grade) => {
        // Using query params as per MemberController
        return await apiCall(`/members/change-grade?username=${username}&grade=${grade}`, {
            method: 'POST'
        });
    }
};

/**
 * Structured Data API (CSV/정형 데이터)
 */
export const configApi = {
    getSemanticOptions: async (domainId) => {
        const query = domainId ? `?domainId=${domainId}` : '';
        return await apiCall(`/config/public/semantic-options${query}`);
    },
    // 프롬프트 테스트 드롭다운용 LLM 모델 목록. SLLM 라벨은 system_config.SLLM_DISPLAY_NAME 에서 동적 로드.
    getLlmModels: async () => {
        return await apiCall('/config/public/llm-models');
    },
};

export const structuredApi = {
    uploadCsv: async (workspaceId, file) => {
        const formData = new FormData();
        formData.append('workspaceId', workspaceId);
        formData.append('file', file);
        const csrfToken = getCsrfToken();
        const headers = {};
        if (csrfToken) headers['X-XSRF-TOKEN'] = csrfToken;
        const response = await fetch(`${API_BASE_URL}/structured/upload-csv`, {
            method: 'POST',
            headers,
            body: formData,
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.data; // { taskId, totalRows }
    },

    getCsvUploadProgress: async (taskId) => {
        return await apiCall(`/structured/upload-csv/progress/${taskId}`);
    },

    getPreview: async (docId) => {
        return await apiCall(`/structured/${docId}/preview`);
    },

    getColumns: async (docId) => {
        return await apiCall(`/structured/${docId}/columns`);
    },

    updateColumns: async (docId, mappings) => {
        return await apiCall(`/structured/${docId}/columns`, {
            method: 'PUT',
            body: JSON.stringify(mappings)
        });
    },

    processSample: async (docId) => {
        return await apiCall(`/structured/${docId}/process-sample`, {
            method: 'POST'
        });
    },

    processAll: async (docId) => {
        return await apiCall(`/structured/${docId}/process-all`, {
            method: 'POST'
        });
    },

    processRetry: async (docId) => {
        return await apiCall(`/structured/${docId}/process-retry`, {
            method: 'POST'
        });
    },

    reprocess: async (docId) => {
        return await apiCall(`/structured/${docId}/reprocess`, {
            method: 'POST'
        });
    },

    getStatus: async (docId) => {
        return await apiCall(`/structured/${docId}/status`);
    },

    analyzeSchema: async (docId, workspaceId, hints) => {
        return await apiCall(`/structured/${docId}/analyze-schema?workspaceId=${workspaceId}`, {
            method: 'POST',
            body: hints ? JSON.stringify(hints) : undefined
        });
    },

    applySchema: async (docId, analysis) => {
        return await apiCall(`/structured/${docId}/apply-schema`, {
            method: 'POST',
            body: JSON.stringify(analysis)
        });
    },

    getQualityReport: async (docId) => {
        return await apiCall(`/structured/${docId}/quality-report`);
    },

    // Phase 2: 테이블 간 관계 분석
    analyzeInterTable: async (workspaceId) => {
        return await apiCall(`/structured/workspace/${workspaceId}/analyze-inter-table`, {
            method: 'POST'
        });
    },

    applyInterTable: async (workspaceId, result) => {
        return await apiCall(`/structured/workspace/${workspaceId}/apply-inter-table`, {
            method: 'POST',
            body: JSON.stringify(result)
        });
    },

    detectSeries: async (workspaceId) => {
        return await apiCall(`/structured/workspace/${workspaceId}/detect-series`);
    },

    // Aggregation strategy
    analyzeAggregation: async (docId, workspaceId) => {
        return await apiCall(`/structured/${docId}/analyze-aggregation?workspaceId=${workspaceId}`, {
            method: 'POST'
        });
    },
    executeAggregation: async (docId, workspaceId, strategy) => {
        return await apiCall(`/structured/${docId}/execute-aggregation?workspaceId=${workspaceId}`, {
            method: 'POST',
            body: JSON.stringify(strategy)
        });
    },
    getAggregatedSummary: async (docId) => {
        return await apiCall(`/structured/${docId}/aggregated-summary`);
    },

    // Mapping Templates
    listTemplates: async (workspaceId) => {
        return await apiCall(`/structured/templates?workspaceId=${workspaceId}`);
    },
    saveAsTemplate: async (docId, workspaceId, name, description) => {
        return await apiCall(`/structured/${docId}/save-as-template?workspaceId=${workspaceId}`, {
            method: 'POST',
            body: JSON.stringify({ name, description })
        });
    },
    applyTemplate: async (docId, templateId) => {
        return await apiCall(`/structured/${docId}/apply-template`, {
            method: 'POST',
            body: JSON.stringify({ templateId })
        });
    },
    deleteTemplate: async (templateId) => {
        return await apiCall(`/structured/templates/${templateId}`, {
            method: 'DELETE'
        });
    },

    // 소스 갱신 (증분 임포트)
    getSyncInfo: async (docId) => {
        return await apiCall(`/structured/${docId}/sync-info`);
    },
    syncSource: async (docId) => {
        return await apiCall(`/structured/${docId}/sync`, {
            method: 'POST'
        });
    },

    // 처리 모드 추천/변경
    recommendProcessingMode: async (docId) => {
        return await apiCall(`/structured/${docId}/recommend-processing-mode`);
    },
    updateTableType: async (docId, tableType) => {
        return await apiCall(`/structured/${docId}/table-type`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tableType })
        });
    },

    // Phase 3: 스케줄 임포트
    schedule: {
        getConfigs: async (workspaceId) => {
            return await apiCall(`/structured/schedule/configs?workspaceId=${workspaceId}`);
        },
        createConfig: async (config) => {
            return await apiCall(`/structured/schedule/configs`, {
                method: 'POST',
                body: JSON.stringify(config)
            });
        },
        updateConfig: async (id, config) => {
            return await apiCall(`/structured/schedule/configs/${id}`, {
                method: 'PUT',
                body: JSON.stringify(config)
            });
        },
        deleteConfig: async (id) => {
            return await apiCall(`/structured/schedule/configs/${id}`, {
                method: 'DELETE'
            });
        },
        runNow: async (id) => {
            return await apiCall(`/structured/schedule/configs/${id}/run`, {
                method: 'POST'
            });
        },
    },

    // Phase 4: Text-to-AQL
    aql: {
        generate: async (workspaceId, query) => {
            return await apiCall(`/structured/aql/generate`, {
                method: 'POST',
                body: JSON.stringify({ workspaceId, query })
            });
        },
        execute: async (workspaceId, query, aql) => {
            return await apiCall(`/structured/aql/execute`, {
                method: 'POST',
                body: JSON.stringify({ workspaceId, query, aql })
            });
        },
        getSchema: async (workspaceId) => {
            return await apiCall(`/structured/aql/schema?workspaceId=${workspaceId}`);
        },
    },

    // Phase 5: Text-to-SQL (PostgreSQL raw data)
    sql: {
        generate: async (workspaceId, query) => {
            return await apiCall(`/structured/sql/generate`, {
                method: 'POST',
                body: JSON.stringify({ workspaceId, query })
            });
        },
        execute: async (workspaceId, query, sql) => {
            return await apiCall(`/structured/sql/execute`, {
                method: 'POST',
                body: JSON.stringify({ workspaceId, query, sql })
            });
        },
        getSchema: async (workspaceId) => {
            return await apiCall(`/structured/sql/schema?workspaceId=${workspaceId}`);
        },
    },

    // DB 연결 API
    db: {
        saveConnection: async (domainId, connectionData) => {
            return await apiCall(`/structured/db/connections?domainId=${domainId}`, {
                method: 'POST',
                body: JSON.stringify(connectionData)
            });
        },
        getConnections: async (domainId) => {
            return await apiCall(`/structured/db/connections/domain/${domainId}`);
        },
        deleteConnection: async (connectionId) => {
            return await apiCall(`/structured/db/connections/${connectionId}`, {
                method: 'DELETE'
            });
        },
        testConnection: async (connectionData) => {
            return await apiCall(`/structured/db/connections/test`, {
                method: 'POST',
                body: JSON.stringify(connectionData)
            });
        },
        testSavedConnection: async (connectionId) => {
            return await apiCall(`/structured/db/connections/${connectionId}/test`, {
                method: 'POST'
            });
        },
        listTables: async (connectionId) => {
            return await apiCall(`/structured/db/connections/${connectionId}/tables`);
        },
        getTableInfo: async (connectionId, tableName) => {
            return await apiCall(`/structured/db/connections/${connectionId}/tables/${tableName}`);
        },
        importTable: async (connectionId, workspaceId, tableName) => {
            return await apiCall(`/structured/db/connections/${connectionId}/import?workspaceId=${workspaceId}&tableName=${encodeURIComponent(tableName)}`, {
                method: 'POST'
            });
        },
        getImportProgress: async (taskId) => {
            return await apiCall(`/structured/db/import-progress/${taskId}`);
        },
    },
};

/**
 * Report API
 */
export const reportApi = {
    generate: async (request) => {
        // Returns jobId (string)
        const response = await apiCall('/report/generate', {
            method: 'POST',
            body: JSON.stringify(request)
        });
        return response.jobId;
    },
    getStatus: async (jobId) => {
        // Returns ReportJob object
        return await apiCall(`/report/status/${jobId}`);
    },
    getResult: async (jobId) => {
        // Returns Result String
        return await apiCall(`/report/result/${jobId}`);
    }
};

/**
 * FAQ API
 */
export const faqApi = {
    getAll: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/faq?${queryString}` : '/faq';
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            credentials: 'include',
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    },
    getCategories: async () => {
        return await apiCall('/faq/categories');
    },
    getById: async (id) => {
        return await apiCall(`/faq/${id}`);
    },
    create: async (data) => {
        return await apiCall('/faq', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    update: async (id, data) => {
        return await apiCall(`/faq/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    delete: async (id) => {
        return await apiCall(`/faq/${id}`, {
            method: 'DELETE',
        });
    },
};

/**
 * Image API
 */
export const imageApi = {
    upload: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const csrfToken = getCsrfToken();
        const headers = {};
        if (csrfToken) headers['X-XSRF-TOKEN'] = csrfToken;
        const response = await fetch(`${API_BASE_URL}/images/upload`, {
            method: 'POST',
            headers,
            body: formData,
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success === false) {
            throw new Error(data.message || '이미지 업로드 실패');
        }

        return data.data;
    },
};

/**
 * Notice API
 */
export const noticeApi = {
    getAll: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/notices?${queryString}` : '/notices';
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            credentials: 'include',
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    },
    getById: async (id) => {
        return await apiCall(`/notices/${id}`);
    },
    create: async (data) => {
        return await apiCall('/notices', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    update: async (id, data) => {
        return await apiCall(`/notices/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    delete: async (id) => {
        return await apiCall(`/notices/${id}`, {
            method: 'DELETE',
        });
    },
    getUnreadCount: async () => {
        return await apiCall('/notices/unread-count');
    },
    getUnread: async () => {
        return await apiCall('/notices/unread');
    },
    markAsRead: async (id) => {
        return await apiCall(`/notices/${id}/read`, {
            method: 'POST',
        });
    },
    markAllAsRead: async () => {
        return await apiCall('/notices/read-all', {
            method: 'POST',
        });
    },
};

/**
 * QnA API
 */
/**
 * Action API — 온톨로지 Action CRUD + 바인딩 + 이력 + Excel
 */
export const actionApi = {
    list: (workspaceId) => apiCall(`/actions?workspaceId=${workspaceId}`),
    detail: (id) => apiCall(`/actions/${id}`),
    create: (body) => apiCall('/actions', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => apiCall(`/actions/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    remove: (id) => apiCall(`/actions/${id}`, { method: 'DELETE' }),
    listBindings: (id) => apiCall(`/actions/${id}/bindings`),
    createBinding: (id, body) => apiCall(`/actions/${id}/bindings`, { method: 'POST', body: JSON.stringify(body) }),
    deleteBinding: (bid) => apiCall(`/actions/bindings/${bid}`, { method: 'DELETE' }),
    bindingsForObject: (objectId) => apiCall(`/actions/by-object/${objectId}`),
    logs: (id, page = 0, size = 20) => apiCall(`/actions/${id}/logs?page=${page}&size=${size}`),
    exportExcel: async (workspaceId) => {
        const response = await fetch(`${API_BASE_URL}/actions/export?workspaceId=${workspaceId}`, { credentials: 'include' });
        if (!response.ok) throw new Error('Excel 다운로드 실패');
        const blob = await response.blob();
        _downloadBlob(blob, 'ontology_actions.xlsx');
    },
    importExcel: async (workspaceId, file, replace = false) => {
        const formData = new FormData();
        formData.append('file', file);
        return _uploadForm(`/actions/import?workspaceId=${workspaceId}&replace=${replace}`, formData);
    },
};

/**
 * Admin ArangoDB API
 */
export const adminArangoApi = {
    getDatabases: async () => {
        return await apiCall('/admin/arango/databases');
    },
    getWorkspaces: async (domainId) => {
        return await apiCall(`/admin/arango/databases/${domainId}/workspaces`);
    },
};

/**
 * Admin Config API
 */
export const adminConfigApi = {
    getAll: async (category) => {
        const query = category ? `?category=${encodeURIComponent(category)}` : '';
        return await apiCall(`/admin/config${query}`);
    },
    getCategories: async () => {
        return await apiCall('/admin/config/categories');
    },
    getByCategory: async (category) => {
        return await apiCall(`/admin/config/category/${category}`);
    },
    get: async (key) => {
        return await apiCall(`/admin/config/${key}`);
    },
    update: async (key, value) => {
        return await apiCall(`/admin/config/${key}`, {
            method: 'PUT',
            body: JSON.stringify({ value })
        });
    },
    refreshCache: async () => {
        return await apiCall('/admin/config/refresh', {
            method: 'POST'
        });
    },
};

/**
 * Admin Semantic Global API — 전역 카테고리/관계 테이블 기반 CRUD + Excel 업다운
 * (semantic_global_category / semantic_global_relation 테이블 사용.
 *  이전 버전 adminSemanticOptionsApi 는 system_config 기반이었으며 deprecated.)
 */
export const adminSemanticApi = {
    // ─── 카테고리 (type 별: OBJECT | RELATION | ACTION, 기본 OBJECT) ───
    // V20260424 이후 ontology_category 단일 테이블을 type 으로 나눠 사용.
    listCategories: async (type = 'OBJECT') =>
        apiCall(`/admin/semantic-global/categories?type=${encodeURIComponent(type)}`),
    createCategory: async (body) =>
        apiCall('/admin/semantic-global/categories', { method: 'POST', body: JSON.stringify(body) }),
    updateCategory: async (id, body) =>
        apiCall(`/admin/semantic-global/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteCategory: async (id) =>
        apiCall(`/admin/semantic-global/categories/${id}`, { method: 'DELETE' }),
    exportCategories: async (type = 'OBJECT') => {
        const response = await fetch(`${API_BASE_URL}/admin/semantic-global/categories/export?type=${encodeURIComponent(type)}`, {
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Excel 다운로드 실패');
        const blob = await response.blob();
        _downloadBlob(blob, 'semantic_global_category.xlsx');
    },
    importCategories: async (file, replace = false, type = 'OBJECT') => {
        const formData = new FormData();
        formData.append('file', file);
        const url = `/admin/semantic-global/categories/import?replace=${replace}&type=${encodeURIComponent(type)}`;
        return _uploadForm(url, formData);
    },
    templateCategories: async () => _downloadTemplate('categories', 'ontology_category_template.xlsx'),

    // ─── 관계 ───
    listRelations: async () =>
        apiCall('/admin/semantic-global/relations'),
    createRelation: async (body) =>
        apiCall('/admin/semantic-global/relations', { method: 'POST', body: JSON.stringify(body) }),
    updateRelation: async (id, body) =>
        apiCall(`/admin/semantic-global/relations/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteRelation: async (id) =>
        apiCall(`/admin/semantic-global/relations/${id}`, { method: 'DELETE' }),
    exportRelations: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/semantic-global/relations/export`, {
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Excel 다운로드 실패');
        const blob = await response.blob();
        _downloadBlob(blob, 'semantic_global_relation.xlsx');
    },
    importRelations: async (file, replace = false) => {
        const formData = new FormData();
        formData.append('file', file);
        const url = `/admin/semantic-global/relations/import?replace=${replace}`;
        return _uploadForm(url, formData);
    },
    templateRelations: async () => _downloadTemplate('relations', 'semantic_global_relation_template.xlsx'),

    // ─── Object (카테고리 참조 포함) ───
    listObjects: async () =>
        apiCall('/admin/semantic-global/objects'),
    createObject: async (body) =>
        apiCall('/admin/semantic-global/objects', { method: 'POST', body: JSON.stringify(body) }),
    updateObject: async (id, body) =>
        apiCall(`/admin/semantic-global/objects/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteObject: async (id) =>
        apiCall(`/admin/semantic-global/objects/${id}`, { method: 'DELETE' }),
    exportObjects: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/semantic-global/objects/export`, {
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Excel 다운로드 실패');
        const blob = await response.blob();
        _downloadBlob(blob, 'semantic_global_object.xlsx');
    },
    importObjects: async (file, replace = false) => {
        const formData = new FormData();
        formData.append('file', file);
        const url = `/admin/semantic-global/objects/import?replace=${replace}`;
        return _uploadForm(url, formData);
    },
    templateObjects: async () => _downloadTemplate('objects', 'semantic_global_object_template.xlsx'),

    // ─── Action ───
    listActions: async () =>
        apiCall('/admin/semantic-global/actions'),
    createAction: async (body) =>
        apiCall('/admin/semantic-global/actions', { method: 'POST', body: JSON.stringify(body) }),
    updateAction: async (id, body) =>
        apiCall(`/admin/semantic-global/actions/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteAction: async (id) =>
        apiCall(`/admin/semantic-global/actions/${id}`, { method: 'DELETE' }),
    exportActions: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/semantic-global/actions/export`, {
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Excel 다운로드 실패');
        const blob = await response.blob();
        _downloadBlob(blob, 'semantic_global_action.xlsx');
    },
    importActions: async (file, replace = false) => {
        const formData = new FormData();
        formData.append('file', file);
        const url = `/admin/semantic-global/actions/import?replace=${replace}`;
        return _uploadForm(url, formData);
    },
    templateActions: async () => _downloadTemplate('actions', 'semantic_global_action_template.xlsx'),
};

// 양식(template) 다운로드 공용 헬퍼 — 헤더 + 샘플 1행이 들어있는 xlsx 를 내려받는다.
async function _downloadTemplate(kind, filename) {
    const response = await fetch(`${API_BASE_URL}/admin/semantic-global/${kind}/template`, {
        credentials: 'include',
    });
    if (!response.ok) throw new Error('양식 다운로드 실패');
    const blob = await response.blob();
    _downloadBlob(blob, filename);
}

// 브라우저 다운로드 트리거
function _downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

// multipart/form-data 업로드 (CSRF 포함, Content-Type 자동 설정)
async function _uploadForm(endpoint, formData) {
    const csrfMatch = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    const csrfToken = csrfMatch ? decodeURIComponent(csrfMatch[1]) : null;
    const headers = {};
    if (csrfToken) headers['X-XSRF-TOKEN'] = csrfToken;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
    });
    if (!response.ok) {
        let msg;
        try {
            const body = await response.json();
            msg = body?.message;
        } catch (_) { /* ignore */ }
        throw new Error(msg || 'Upload failed');
    }
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (data.success === false) throw new Error(data.message || 'Upload failed');
    return data.data !== undefined ? data.data : data;
}

/**
 * Admin Semantic Options API — 전역 카테고리/관계 CRUD (DEPRECATED)
 * (system_config 에 JSON 배열로 저장. 새 adminSemanticApi 사용 권장)
 */
export const adminSemanticOptionsApi = {
    getGlobalCategories: async () => {
        return await apiCall('/admin/semantic-options/global-categories');
    },
    setGlobalCategories: async (items) => {
        return await apiCall('/admin/semantic-options/global-categories', {
            method: 'PUT',
            body: JSON.stringify(items),
        });
    },
    getGlobalRelations: async () => {
        return await apiCall('/admin/semantic-options/global-relations');
    },
    setGlobalRelations: async (items) => {
        return await apiCall('/admin/semantic-options/global-relations', {
            method: 'PUT',
            body: JSON.stringify(items),
        });
    },
};

/**
 * QnA API
 */
export const qnaApi = {
    getQuestions: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/qna?${queryString}` : '/qna';
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            credentials: 'include',
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    },
    getQuestion: async (id) => {
        return await apiCall(`/qna/${id}`);
    },
    createQuestion: async (data) => {
        return await apiCall('/qna', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    updateQuestion: async (id, data) => {
        return await apiCall(`/qna/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    deleteQuestion: async (id) => {
        return await apiCall(`/qna/${id}`, {
            method: 'DELETE',
        });
    },
    togglePin: async (id) => {
        return await apiCall(`/qna/${id}/pin`, {
            method: 'PUT',
        });
    },
    createAnswer: async (questionId, data) => {
        return await apiCall(`/qna/${questionId}/answers`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    updateAnswer: async (answerId, data) => {
        return await apiCall(`/qna/answers/${answerId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    deleteAnswer: async (answerId) => {
        return await apiCall(`/qna/answers/${answerId}`, {
            method: 'DELETE',
        });
    },
};

/**
 * Lineage API - 데이터 출처 추적
 */
export const lineageApi = {
    getByChunkIds: async (chunkIds) => {
        return await apiCall('/lineage/chunks', {
            method: 'POST',
            body: JSON.stringify(chunkIds),
        });
    },
    getByDocumentIds: async (documentIds) => {
        return await apiCall('/lineage/documents', {
            method: 'POST',
            body: JSON.stringify(documentIds),
        });
    },
};

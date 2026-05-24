import { API_URL } from '../config/api';
const isLocalAuthEnabled = import.meta.env.VITE_ENABLE_LOCAL_AUTH === 'true';
const LOCAL_DOCS_KEY = 'localMockDocumentsByWorkspace';

function getCsrfToken() {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

function csrfHeaders(extra = {}) {
    const token = getCsrfToken();
    return token ? { 'X-XSRF-TOKEN': token, ...extra } : extra;
}

const getDefaultLocalDocs = () => ({
    101: [
        {
            id: 1001,
            workspaceId: 101,
            filename: '화장품 5페이지.pdf',
            pageCount: 5,
            status: 'DONE',
        },
    ],
});

const getLocalDocsMap = () => {
    const raw = localStorage.getItem(LOCAL_DOCS_KEY);
    if (!raw) {
        const defaults = getDefaultLocalDocs();
        localStorage.setItem(LOCAL_DOCS_KEY, JSON.stringify(defaults));
        return defaults;
    }
    try {
        return JSON.parse(raw);
    } catch (_) {
        const defaults = getDefaultLocalDocs();
        localStorage.setItem(LOCAL_DOCS_KEY, JSON.stringify(defaults));
        return defaults;
    }
};

const setLocalDocsMap = (map) => {
    localStorage.setItem(LOCAL_DOCS_KEY, JSON.stringify(map));
};

const check401 = (response) => {
    if (response.status === 401) {
        window.dispatchEvent(new Event('auth:expired'));
        throw new Error('세션이 만료되었습니다.');
    }
};

/**
 * Document API 서비스
 */
export const documentApi = {
    /**
     * 워크스페이스의 문서 목록 조회
     * @param {number} workspaceId - 워크스페이스 ID
     * @returns {Promise<Array>} 문서 목록
     */
    getByWorkspace: async (workspaceId) => {
        if (isLocalAuthEnabled) {
            const map = getLocalDocsMap();
            return map[String(workspaceId)] || [];
        }
        const response = await fetch(`${API_URL}/api/documents/workspace/${workspaceId}`, {
            credentials: 'include'
        });
        check401(response);
        if (!response.ok) {
            throw new Error('문서 목록을 불러오는데 실패했습니다.');
        }
        const result = await response.json();
        return result.data || [];
    },

    /**
     * 문서 상세 조회
     * @param {number} documentId - 문서 ID
     * @returns {Promise<Object>} 문서 정보
     */
    getById: async (documentId) => {
        if (isLocalAuthEnabled) {
            const map = getLocalDocsMap();
            const document = Object.values(map).flat().find((doc) => Number(doc.id) === Number(documentId));
            return document || null;
        }
        const response = await fetch(`${API_URL}/api/documents/${documentId}`, {
            credentials: 'include'
        });
        check401(response);
        if (!response.ok) {
            throw new Error('문서 정보를 불러오는데 실패했습니다.');
        }
        const result = await response.json();
        return result.data;
    },

    /**
     * 파이프라인 상태 조회
     * @param {number} documentId - 문서 ID
     * @returns {Promise<Object|null>} 파이프라인 상태 정보
     */
    getPipelineStatus: async (documentId) => {
        if (isLocalAuthEnabled) {
            return { status: 'DONE', progress: 100, message: '완료' };
        }
        try {
            const response = await fetch(`${API_URL}/api/pipeline/status/${documentId}`, {
                credentials: 'include'
            });
            check401(response);
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            if (error.message === '세션이 만료되었습니다.') throw error;
            console.error('Failed to fetch pipeline status:', error);
            return null;
        }
    },

    /**
     * 문서의 모든 페이지 조회
     * @param {number} documentId - 문서 ID
     * @returns {Promise<Array>} 페이지 목록
     */
    getPages: async (documentId) => {
        if (isLocalAuthEnabled) {
            return [
                { id: 1, pageNumber: 1, content: '화장품 시장은 지속적으로 성장하고 있습니다.' },
                { id: 2, pageNumber: 2, content: '향수 제품군은 프리미엄 카테고리에서 강세를 보입니다.' },
            ];
        }
        const response = await fetch(`${API_URL}/api/documents/${documentId}/pages`, {
            credentials: 'include'
        });
        check401(response);
        if (!response.ok) {
            throw new Error('문서 페이지를 불러오는데 실패했습니다.');
        }
        const result = await response.json();
        return result.data || [];
    },

    /**
     * 문서의 모든 청크 조회 (chunk_index 순)
     * @param {number} documentId - 문서 ID
     * @returns {Promise<Array>} 청크 목록
     */
    getChunks: async (documentId) => {
        if (isLocalAuthEnabled) {
            return [
                { id: 1, chunkIndex: 0, content: '향수 카테고리와 관련된 주요 개념 노드' },
                { id: 2, chunkIndex: 1, content: '조향사, 원료, 테스트 사이의 관계 정리' },
            ];
        }
        const response = await fetch(`${API_URL}/api/documents/${documentId}/chunks`, {
            credentials: 'include'
        });
        check401(response);
        if (!response.ok) {
            throw new Error('문서 청크를 불러오는데 실패했습니다.');
        }
        const result = await response.json();
        return result.data || [];
    },

    /**
     * 문서 삭제
     * @param {number} documentId - 문서 ID
     */
    delete: async (documentId) => {
        if (isLocalAuthEnabled) {
            const map = getLocalDocsMap();
            const nextMap = Object.fromEntries(
                Object.entries(map).map(([workspaceId, docs]) => [
                    workspaceId,
                    (docs || []).filter((doc) => Number(doc.id) !== Number(documentId)),
                ])
            );
            setLocalDocsMap(nextMap);
            return { success: true };
        }
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 120초 타임아웃
        try {
            const response = await fetch(`${API_URL}/api/documents/${documentId}`, {
                method: 'DELETE',
                headers: csrfHeaders(),
                credentials: 'include',
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            check401(response);
            if (!response.ok) {
                let errorMsg = '문서 삭제에 실패했습니다.';
                try {
                    const body = await response.json();
                    if (body && body.message) errorMsg = body.message;
                } catch (_) { /* ignore parse error */ }
                throw new Error(errorMsg);
            }
            return await response.json();
        } catch (err) {
            clearTimeout(timeoutId);
            if (err.name === 'AbortError') {
                throw new Error('삭제 요청이 시간 초과되었습니다. 백엔드에서 처리 중일 수 있으니 잠시 후 새로고침 해주세요.');
            }
            throw err;
        }
    },

    /**
     * 문서 이름 변경 (Update)
     * @param {number} documentId - 문서 ID
     * @param {string} newFilename - 새 파일명
     */
    /**
     * 파이프라인 수동 재실행
     */
    startPipeline: async (workspaceId, documentId) => {
        if (isLocalAuthEnabled) {
            return { status: 'DONE', message: '로컬 모드 완료' };
        }
        const response = await fetch(`${API_URL}/api/pipeline/start`, {
            method: 'POST',
            headers: csrfHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ workspaceId, documentId }),
            credentials: 'include'
        });
        check401(response);
        if (!response.ok) {
            throw new Error('문서 처리를 시작하는데 실패했습니다.');
        }
        return await response.json();
    },

    rename: async (documentId, newFilename) => {
        if (isLocalAuthEnabled) {
            const map = getLocalDocsMap();
            const nextMap = Object.fromEntries(
                Object.entries(map).map(([workspaceId, docs]) => [
                    workspaceId,
                    (docs || []).map((doc) =>
                        Number(doc.id) === Number(documentId)
                            ? { ...doc, filename: newFilename }
                            : doc
                    ),
                ])
            );
            setLocalDocsMap(nextMap);
            return { success: true };
        }
        const response = await fetch(`${API_URL}/api/documents/${documentId}`, {
            method: 'PUT',
            headers: csrfHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ filename: newFilename }),
            credentials: 'include'
        });
        check401(response);
        if (!response.ok) {
            throw new Error('문서 이름 변경에 실패했습니다.');
        }
        return await response.json();
    }
};

import { API_BASE_URL } from '../config/api';
const isLocalAuthEnabled = import.meta.env.VITE_ENABLE_LOCAL_AUTH === 'true';
const LOCAL_CHAT_HISTORY_KEY = 'localMockChatHistoryByWorkspace';
const LOCAL_SAVED_CHAT_KEY = 'localMockSavedChatsByWorkspace';

function getCsrfToken() {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

/**
 * API 호출 공통 함수
 */
const apiCall = async (endpoint, options = {}) => {
    try {
        const csrfToken = getCsrfToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        if (csrfToken && options.method && options.method !== 'GET') {
            headers['X-XSRF-TOKEN'] = csrfToken;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers,
            credentials: 'include',
            ...options,
        });

        if (response.status === 401) {
            window.dispatchEvent(new Event('auth:expired'));
            throw new Error('세션이 만료되었습니다.');
        }

        if (!response.ok) {
            const { getHttpErrorMessage } = await import('../utils/errorMessages.js');
            let errorMsg;
            try {
                const errorBody = await response.json();
                if (errorBody && errorBody.message) errorMsg = errorBody.message;
            } catch (_) {}
            throw new Error(errorMsg || getHttpErrorMessage(response.status));
        }

        const data = await response.json();

        // 백엔드 ApiResponse 포맷 처리
        if (data.success === false) {
            throw new Error(data.message || '요청 실패');
        }

        return data.data; // ApiResponse의 data 필드 반환
    } catch (error) {
        console.error('API 호출 실패:', error);
        throw error;
    }
};

const getLocalMap = (key, fallback) => {
    const raw = localStorage.getItem(key);
    if (!raw) {
        localStorage.setItem(key, JSON.stringify(fallback));
        return fallback;
    }
    try {
        return JSON.parse(raw);
    } catch (_) {
        localStorage.setItem(key, JSON.stringify(fallback));
        return fallback;
    }
};

const setLocalMap = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

/**
 * Chat API
 */
export const chatApi = {
    /**
     * Send chat message with RAG and ontology search
     * 
     * @param {number} workspaceId - Workspace ID
     * @param {string} message - User message
     * @param {number[]} documentIds - Optional document IDs for filtering
     * @returns {Promise<{ragResults: Array, ontologyResults: Array}>}
     */
    send: async (workspaceId, message, documentIds = null, personaText = null) => {
        if (isLocalAuthEnabled) {
            const now = new Date().toISOString();
            const historyMap = getLocalMap(LOCAL_CHAT_HISTORY_KEY, {});
            const wid = String(workspaceId);
            const current = Array.isArray(historyMap[wid]) ? historyMap[wid] : [];

            const ragResults = [
                {
                    score: 0.9321,
                    content: '향수 카테고리의 프리미엄 매출 비중은 전년 대비 증가 추세입니다.',
                    metadata: { filename: '화장품 5페이지.pdf', document_id: 1001, page: 2, chunk_id: 2 },
                },
            ];

            const ontologyResults = [
                {
                    score: 0.8842,
                    content: '향수 - 포함한다 - 화장품',
                    metadata: {
                        type: 'Edge',
                        source: 'concept:perfume',
                        sourceLabel: '향수',
                        target: 'concept:cosmetics',
                        targetLabel: '화장품',
                        label: '포함한다',
                        document_ids: [1001],
                        chunk_ids: [2],
                    },
                },
            ];

            const answer = `질문: "${message}"\n로컬 더미 응답입니다. 현재 워크스페이스의 문서 기반으로 향수/화장품 관련 지식 그래프를 확인할 수 있습니다.`;

            historyMap[wid] = [
                ...current,
                { role: 'user', content: message, timestamp: now },
                { role: 'assistant', content: answer, timestamp: now },
            ];
            setLocalMap(LOCAL_CHAT_HISTORY_KEY, historyMap);

            return {
                answer,
                ragResults,
                ontologyResults,
                relatedQuestions: ['향수와 화장품의 관계를 그래프로 보여줘'],
                personaText,
                documentIds,
            };
        }
        return await apiCall('/chat/send', {
            method: 'POST',
            body: JSON.stringify({
                workspaceId,
                message,
                documentIds,
                personaText
            })
        });
    },

    /**
     * Get chat history for a workspace
     * @param {number} workspaceId
     * @returns {Promise<Array>} List of chat messages
     */
    getHistory: async (workspaceId) => {
        if (isLocalAuthEnabled) {
            const historyMap = getLocalMap(LOCAL_CHAT_HISTORY_KEY, {});
            return historyMap[String(workspaceId)] || [];
        }
        return await apiCall(`/chat/history/${workspaceId}`);
    },

    /**
     * Clear chat history for a workspace
     * @param {number} workspaceId
     * @returns {Promise<string>}
     */
    clearHistory: async (workspaceId) => {
        if (isLocalAuthEnabled) {
            const historyMap = getLocalMap(LOCAL_CHAT_HISTORY_KEY, {});
            historyMap[String(workspaceId)] = [];
            setLocalMap(LOCAL_CHAT_HISTORY_KEY, historyMap);
            return 'OK';
        }
        return await apiCall(`/chat/history/${workspaceId}`, {
            method: 'DELETE'
        });
    },

    /**
     * Saved chat operations
     */
    savedChat: {
        save: async (workspaceId, question, answer) => {
            if (isLocalAuthEnabled) {
                const map = getLocalMap(LOCAL_SAVED_CHAT_KEY, {});
                const wid = String(workspaceId);
                const list = Array.isArray(map[wid]) ? map[wid] : [];
                const nextId = Math.max(0, ...Object.values(map).flat().map((v) => Number(v.id) || 0)) + 1;
                const item = { id: nextId, question, answer, createdAt: new Date().toISOString() };
                map[wid] = [item, ...list];
                setLocalMap(LOCAL_SAVED_CHAT_KEY, map);
                return item;
            }
            return await apiCall('/chat/saved', {
                method: 'POST',
                body: JSON.stringify({ workspaceId, question, answer })
            });
        },
        getList: async (workspaceId) => {
            if (isLocalAuthEnabled) {
                const map = getLocalMap(LOCAL_SAVED_CHAT_KEY, {});
                return map[String(workspaceId)] || [];
            }
            return await apiCall(`/chat/saved/${workspaceId}`);
        },
        delete: async (id) => {
            if (isLocalAuthEnabled) {
                const map = getLocalMap(LOCAL_SAVED_CHAT_KEY, {});
                const next = Object.fromEntries(
                    Object.entries(map).map(([workspaceId, items]) => [
                        workspaceId,
                        (items || []).filter((item) => Number(item.id) !== Number(id)),
                    ])
                );
                setLocalMap(LOCAL_SAVED_CHAT_KEY, next);
                return true;
            }
            return await apiCall(`/chat/saved/${id}`, {
                method: 'DELETE'
            });
        }
    }
};

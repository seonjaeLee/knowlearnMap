/**
 * `VITE_ENABLE_WORKSPACE_MOCK=true` 일 때 공유 설정 팝업 UI 확인용
 * — 워크스페이스 id별 초기 공유 멤버(개별 공유 미리보기)
 */

/** @type {Record<number, Array<{ memberId: string, email: string, sharedAt: string }>>} */
export const mockSharedMembersByWorkspaceId = {
    /** 스키마 실험실 — 멤버 2명 있음 상태로 미리보기 */
    5105: [
        { memberId: 'mock-share-5105-1', email: 'designer@company.com', sharedAt: '2026-05-10T10:00:00.000Z' },
        { memberId: 'mock-share-5105-2', email: 'analyst@company.com', sharedAt: '2026-05-12T14:30:00.000Z' },
    ],
    5102: [
        { memberId: 'mock-share-5102-1', email: 'john@company.com', sharedAt: '2026-04-23T09:00:00.000Z' },
    ],
};

/** 이메일 자동완성 후보 */
export const mockMemberSearchSuggestions = [
    { memberId: 'mock-user-admin', email: 'admin@company.com' },
    { memberId: 'mock-user-analyst', email: 'analyst@company.com' },
    { memberId: 'mock-user-designer', email: 'designer@company.com' },
    { memberId: 'mock-user-john', email: 'john@company.com' },
    { memberId: 'mock-user-park', email: 'park@company.com' },
];

const sessionStore = {};

export function getMockSharedMembers(workspaceId) {
    if (!sessionStore[workspaceId]) {
        const seed = mockSharedMembersByWorkspaceId[workspaceId];
        sessionStore[workspaceId] = seed ? seed.map((m) => ({ ...m })) : [];
    }
    return sessionStore[workspaceId];
}

export function resetMockSharedMembersSession() {
    Object.keys(sessionStore).forEach((k) => delete sessionStore[k]);
}

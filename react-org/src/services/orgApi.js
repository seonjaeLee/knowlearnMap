import { apiCall } from './api';

/**
 * 조직 / 멤버 관리 API 헬퍼 (V20260429).
 * 백엔드: /api/org/* + /api/invite/*
 */
export const orgApi = {
    // 본인 정보 / 조직 ──
    me: async () => apiCall('/org/me'),

    // sysop: 멤버 관리 ──
    listMembers: async () => apiCall('/org/members'),
    listPendingInvites: async () => apiCall('/org/invites/pending'),
    inviteMember: async (email, role) => apiCall('/org/members', {
        method: 'POST',
        body: JSON.stringify({ email, role }),
    }),
    changeRole: async (memberId, role) => apiCall(`/org/members/${memberId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
    }),
    removeMember: async (memberId) => apiCall(`/org/members/${memberId}`, {
        method: 'DELETE',
    }),
    resendInvite: async (memberId) => apiCall(`/org/members/${memberId}/resend-invite`, {
        method: 'POST',
    }),

    // 본인 self-leave (user/viewer) ──
    leaveOrganization: async () => apiCall('/org/me/leave', { method: 'POST' }),

    // 초대 토큰 (인증 불필요) ──
    checkInviteToken: async (token) =>
        apiCall(`/invite/check?token=${encodeURIComponent(token)}`),
    acceptInvite: async (token, password) => apiCall('/invite/accept', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
    }),
};

export default orgApi;

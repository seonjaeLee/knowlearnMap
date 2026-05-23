/**
 * 어드민 승인 관리(`/admin/upgrades`) UI용 로컬 더미.
 * `VITE_ENABLE_UPGRADE_MOCK=true` 또는 API 실패 시 사용.
 */
export const mockUpgradeRequests = [
    {
        id: 9001,
        createdAt: '2026-05-10T10:20:00.000Z',
        email: 'founder@startup.io',
        company: '스타트업랩',
        name: '김대표',
        phone: '010-2345-6789',
        type: 'PRO_UPGRADE',
        status: 'PENDING',
    },
    {
        id: 9002,
        createdAt: '2026-05-11T14:05:00.000Z',
        email: 'design.lead@agency.kr',
        company: '에이전시코리아',
        name: '이디자인',
        phone: '010-1111-2222',
        type: 'MAX_CONSULTATION',
        status: 'PENDING',
    },
    {
        id: 9003,
        createdAt: '2026-05-08T09:00:00.000Z',
        email: 'analyst@voc.io',
        company: 'VOC 분석팀',
        name: '박분석',
        phone: '02-333-4444',
        type: 'PRO_UPGRADE',
        status: 'APPROVED',
    },
    {
        id: 9004,
        createdAt: '2026-05-01T16:30:00.000Z',
        email: 'trial.user@example.com',
        company: '(개인)',
        name: '최체험',
        phone: '010-9999-0000',
        type: 'PRO_UPGRADE',
        status: 'REJECTED',
        rejectReason: '제출 서류에 회사 정보가 확인되지 않습니다.',
    },
    {
        id: 9005,
        createdAt: '2026-05-12T11:00:00.000Z',
        email: 'devops@enterprise.co.kr',
        company: '엔터프라이즈코리아',
        name: '정운영',
        phone: '010-5555-6666',
        type: 'MAX_CONSULTATION',
        status: 'PENDING',
    },
];

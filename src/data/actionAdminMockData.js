/**
 * Action 관리 UI용 로컬 더미
 * `VITE_ENABLE_ACTION_MOCK=true` 또는 목록 API 실패 시 사용.
 * 기본 샘플은 workspaceId 71 기준.
 */

export const mockAdminActions = [
  {
    id: 1,
    workspaceId: 71,
    nameEn: 'SummarizeDocument',
    nameKo: '문서 요약',
    actionType: 'LLM',
    approvalMode: 'AUTO',
    category: '문서 처리',
    status: 'active',
  },
  {
    id: 2,
    workspaceId: 71,
    nameEn: 'ExtractEntities',
    nameKo: '개체 추출',
    actionType: 'PIPELINE',
    approvalMode: 'MANUAL',
    category: '지식 추출',
    status: 'active',
  },
  {
    id: 3,
    workspaceId: 71,
    nameEn: 'ValidateTriple',
    nameKo: '트리플 검증',
    actionType: 'RULE',
    approvalMode: 'AUTO',
    category: '온톨로지',
    status: 'active',
  },
  {
    id: 4,
    workspaceId: 71,
    nameEn: 'NotifyOwner',
    nameKo: '소유자 알림',
    actionType: 'WEBHOOK',
    approvalMode: 'AUTO',
    category: '알림',
    status: 'inactive',
  },
  {
    id: 5,
    workspaceId: 71,
    nameEn: 'RunGraphQuery',
    nameKo: '그래프 조회 실행',
    actionType: 'QUERY',
    approvalMode: 'AUTO',
    category: '그래프',
    status: 'active',
  },
  {
    id: 6,
    workspaceId: 71,
    nameEn: 'GenerateReport',
    nameKo: '리포트 생성',
    actionType: 'LLM',
    approvalMode: 'MANUAL',
    category: '문서 처리',
    status: 'active',
  },
];

export const mockActionLogsByActionId = {
  1: [
    {
      id: 1001,
      executedAt: '2026-05-16T09:12:04.000Z',
      triggerSource: 'TRIPLE',
      status: 'SUCCESS',
      durationMs: 842,
      errorMessage: null,
    },
    {
      id: 1002,
      executedAt: '2026-05-15T18:40:22.000Z',
      triggerSource: 'MANUAL',
      status: 'SUCCESS',
      durationMs: 1203,
      errorMessage: null,
    },
  ],
  2: [
    {
      id: 1003,
      executedAt: '2026-05-14T11:05:33.000Z',
      triggerSource: 'OBJECT',
      status: 'FAILED',
      durationMs: 310,
      errorMessage: '입력 스키마 불일치: required field missing',
    },
  ],
  3: [
    {
      id: 1006,
      executedAt: '2026-05-11T14:18:09.000Z',
      triggerSource: 'TRIPLE',
      status: 'SUCCESS',
      durationMs: 124,
      errorMessage: null,
    },
  ],
  4: [
    {
      id: 1007,
      executedAt: '2026-05-10T08:55:41.000Z',
      triggerSource: 'WEBHOOK',
      status: 'FAILED',
      durationMs: 89,
      errorMessage: 'Webhook endpoint timeout (504)',
    },
  ],
  5: [
    {
      id: 1004,
      executedAt: '2026-05-13T07:22:18.000Z',
      triggerSource: 'SCHEDULE',
      status: 'SUCCESS',
      durationMs: 56,
      errorMessage: null,
    },
    {
      id: 1005,
      executedAt: '2026-05-12T07:22:18.000Z',
      triggerSource: 'SCHEDULE',
      status: 'SUCCESS',
      durationMs: 61,
      errorMessage: null,
    },
  ],
  6: [
    {
      id: 1008,
      executedAt: '2026-05-09T16:30:00.000Z',
      triggerSource: 'MANUAL',
      status: 'SUCCESS',
      durationMs: 4521,
      errorMessage: null,
    },
    {
      id: 1009,
      executedAt: '2026-05-08T16:30:00.000Z',
      triggerSource: 'MANUAL',
      status: 'FAILED',
      durationMs: 2100,
      errorMessage: 'LLM rate limit exceeded',
    },
  ],
};

/** 실행 이력 UI 미리보기용 기본 Action ID */
export const MOCK_ACTION_LOG_DEMO_ID = 1;

/** workspaceId 에 맞는 Action 목록 (없으면 71 샘플 전체) */
export function getMockActionsForWorkspace(workspaceId) {
  const ws = Number(workspaceId);
  const matched = mockAdminActions.filter((a) => a.workspaceId === ws);
  if (matched.length > 0) return matched;
  return mockAdminActions;
}

/** Action ID 기준 실행 이력 (페이지 형태 mock) */
export function getMockActionLogs(actionId, page = 0, size = 50) {
  const id = Number(actionId);
  const rows = mockActionLogsByActionId[id] || [];
  const start = page * size;
  const content = rows.slice(start, start + size);
  return { content, totalElements: rows.length };
}

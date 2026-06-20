/** 테이블·목록 — EnumChip(compact) / StatusInline(inline) tone 매핑 */

export const PROMPT_SECURITY_LEVEL_TONE = {
  TEMP: 'neutral',
  PUBLIC: 'ok',
  INTERNAL: 'info',
  CONFIDENTIAL: 'warn',
  TOP_SECRET: 'danger',
};

export function getPromptSecurityLevelTone(value) {
  return PROMPT_SECURITY_LEVEL_TONE[value] ?? 'neutral';
}

const WORKSPACE_SHARE_LABEL = {
  ALL: '전체',
  INDIVIDUAL: '개별',
  NONE: 'OFF',
};

const WORKSPACE_SHARE_TONE = {
  ALL: 'ok',
  INDIVIDUAL: 'info',
  NONE: 'neutral',
};

export function getWorkspaceShareBadgeProps(shareType) {
  const key = shareType || 'NONE';
  return {
    label: WORKSPACE_SHARE_LABEL[key] ?? WORKSPACE_SHARE_LABEL.NONE,
    tone: WORKSPACE_SHARE_TONE[key] ?? 'neutral',
  };
}

const UPGRADE_STATUS_TONE = {
  APPROVED: 'ok',
  REJECTED: 'danger',
  PENDING: 'warn',
};

export function getUpgradeStatusTone(status) {
  return UPGRADE_STATUS_TONE[status] ?? 'neutral';
}

export function getActionListStatusTone(status) {
  return status === 'active' ? 'ok' : 'neutral';
}

export function getActionLogStatusTone(status) {
  return status === 'SUCCESS' ? 'ok' : 'danger';
}

export function getArangoDbExistsBadgeProps(dbExists) {
  return dbExists
    ? { label: '정상', tone: 'ok' }
    : { label: '없음', tone: 'neutral' };
}

export function getArangoWorkspaceStatusBadgeProps(isOrphan) {
  return isOrphan
    ? { label: '고아', tone: 'danger' }
    : { label: '정상', tone: 'ok' };
}

export function getQnaStatusBadgeProps(status) {
  return status === 'ANSWERED'
    ? { label: '답변완료', tone: 'ok' }
    : { label: '답변대기', tone: 'warn' };
}

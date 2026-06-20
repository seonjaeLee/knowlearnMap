/** 사용자·Sysop 관리 — 권한·등급·상태 표시 (예외만 뱃지·색 강조) */

const ELEVATED_MEMBER_ROLES = new Set(['ADMIN', 'SYSOP']);

export const MEMBER_ROLE_BADGE_TONE = {
  ADMIN: 'info',
  SYSOP: 'warn',
};

/** 등급 — 텍스트 농담·굵기 (색 뱃지 없음) */
export const MEMBER_GRADE_TEXT_CLASS = {
  FREE: 'kl-grade-tier-text kl-grade-tier-text--free',
  PRO: 'kl-grade-tier-text kl-grade-tier-text--pro',
  MAX: 'kl-grade-tier-text kl-grade-tier-text--max',
  SPECIAL: 'kl-grade-tier-text kl-grade-tier-text--special',
  ADMIN: 'kl-grade-tier-text kl-grade-tier-text--admin',
};

/** 승인관리 유형 — 등급 티어와 동일 스타일 */
export function getUpgradeTypeGradeDisplay(type) {
  if (type === 'MAX_CONSULTATION') {
    return { tier: 'MAX', label: 'Max 상담' };
  }
  return { tier: 'PRO', label: 'Pro 신청' };
}

export const MEMBER_STATUS_BADGE_TONE = {
  VERIFYING_EMAIL: 'warn',
  WAITING_APPROVAL: 'warn',
  APPROVED_WAITING_PASSWORD: 'info',
};

export function isElevatedMemberRole(role) {
  return ELEVATED_MEMBER_ROLES.has(role);
}

export function getMemberRoleBadgeTone(role) {
  return MEMBER_ROLE_BADGE_TONE[role] ?? 'neutral';
}

export function getMemberGradeTextClass(grade) {
  return MEMBER_GRADE_TEXT_CLASS[grade] ?? 'kl-grade-tier-text kl-grade-tier-text--pro';
}

export function isDefaultMemberStatus(status) {
  return status === 'ACTIVE';
}

export function getMemberStatusBadgeTone(status) {
  return MEMBER_STATUS_BADGE_TONE[status] ?? 'warn';
}

/** 조직 멤버 관리 (OrgMembers) */
export const ORG_MEMBER_ROLE_BADGE_TONE = {
  USER: 'info',
  VIEWER: 'neutral',
  SYSOP: 'warn',
};

export function getOrgMemberRoleBadgeTone(role) {
  return ORG_MEMBER_ROLE_BADGE_TONE[role] ?? 'neutral';
}

export function getOrgMemberStatusBadgeTone(status) {
  return status === 'ACTIVE' ? 'ok' : 'neutral';
}

export function getOrgInviteStatusBadgeTone(expired) {
  return expired ? 'danger' : 'warn';
}

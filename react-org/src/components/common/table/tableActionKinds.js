import {
  Ban,
  Check,
  Edit2,
  Lock,
  LockOpen,
  Mail,
  Pencil,
  Share2,
  Trash2,
} from 'lucide-react';

/** 표 관리 열 액션 kind — `KlTableRowActions`의 `actions[].kind` */
export const TABLE_ACTION_KINDS = {
  mailResend: 'mailResend',
  unlock: 'unlock',
  unlocked: 'unlocked',
  lock: 'lock',
  approve: 'approve',
  reject: 'reject',
  share: 'share',
  edit: 'edit',
  delete: 'delete',
  rename: 'rename',
  custom: 'custom',
};

const ICON_PROPS = { strokeWidth: 1.75, 'aria-hidden': true };

/**
 * kind별 기본 툴팁·톤·아이콘. `tooltip`·`tone`·`icon`으로 덮어쓸 수 있음.
 */
export const TABLE_ACTION_PRESETS = {
  [TABLE_ACTION_KINDS.mailResend]: {
    tooltip: '인증 메일 재발송',
    tone: 'neutral',
    Icon: Mail,
  },
  [TABLE_ACTION_KINDS.unlock]: {
    tooltip: '잠금 해제',
    tone: 'neutral',
    Icon: Lock,
  },
  [TABLE_ACTION_KINDS.unlocked]: {
    tooltip: '잠금 해제됨',
    tone: 'neutral',
    Icon: LockOpen,
  },
  [TABLE_ACTION_KINDS.lock]: {
    tooltip: '잠금',
    tone: 'neutral',
    Icon: Lock,
  },
  [TABLE_ACTION_KINDS.approve]: {
    tooltip: '승인',
    tone: 'success',
    Icon: Check,
  },
  [TABLE_ACTION_KINDS.reject]: {
    tooltip: '거절',
    tone: 'danger',
    Icon: Ban,
  },
  [TABLE_ACTION_KINDS.share]: {
    tooltip: '공유 설정',
    tone: 'neutral',
    Icon: Share2,
  },
  [TABLE_ACTION_KINDS.edit]: {
    tooltip: '수정',
    tone: 'neutral',
    Icon: Pencil,
  },
  [TABLE_ACTION_KINDS.delete]: {
    tooltip: '삭제',
    tone: 'danger',
    Icon: Trash2,
  },
  [TABLE_ACTION_KINDS.rename]: {
    tooltip: '제목 수정',
    tone: 'neutral',
    Icon: Edit2,
  },
};

export const TABLE_ACTION_ICON_PROPS = ICON_PROPS;

/** Trash2 / Ban / Check 는 16px 고정 */
export function tableActionIconNeedsSize(IconComponent) {
  return IconComponent === Trash2 || IconComponent === Ban || IconComponent === Check;
}

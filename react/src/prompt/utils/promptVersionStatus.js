import { formatKlDateTime } from '../../utils/formatKlDate';

/**
 * 버전 목록·헤더 배지용 상태 라벨
 */
export function getPromptVersionStatus(version, selectedVersionId) {
  if (!version) {
    return { label: '보관', tone: 'archived' };
  }
  if (version.isActive) {
    return { label: '활성', tone: 'active' };
  }
  if (version.id === selectedVersionId || version.status === 'draft') {
    return { label: '편집중', tone: 'editing' };
  }
  return { label: '보관', tone: 'archived' };
}

/** @deprecated import { formatKlDateTime } from utils/formatKlDate */
export const formatPromptVersionDate = formatKlDateTime;

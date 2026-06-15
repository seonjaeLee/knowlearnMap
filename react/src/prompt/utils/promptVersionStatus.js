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

export function formatPromptVersionDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${day} ${h}:${min}`;
}

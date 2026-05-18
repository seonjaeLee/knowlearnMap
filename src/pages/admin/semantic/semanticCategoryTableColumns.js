/** 온톨로지 좌측 카테고리 패널 BasicTable 열 정의 (접힘·펼침 동일) */

export const semanticCategoryColumnDefinitions = [
  { id: 'id', label: 'ID', defaultWidthPx: 60, minWidthPx: 56, align: 'center' },
  { id: 'nameEn', label: '이름', defaultWidthPx: 130, minWidthPx: 100, align: 'left', ellipsis: false },
  { id: 'nameKo', label: '한글명', defaultWidthPx: 80, minWidthPx: 64, align: 'left' },
  { id: 'code', label: '코드', defaultWidthPx: 90, minWidthPx: 72, align: 'left' },
  { id: 'description', label: '설명', minWidthPx: 100, align: 'left', flex: true },
  {
    id: 'actions',
    label: '관리',
    defaultWidthPx: 80,
    minWidthPx: 80,
    align: 'right',
    ellipsis: false,
  },
];

/** @deprecated 접힘·펼침 동일 정의 — semanticCategoryColumnDefinitions 사용 */
export const semanticCategoryColumnDefinitionsFull = semanticCategoryColumnDefinitions;

/** @deprecated 접힘·펼침 동일 정의 — semanticCategoryColumnDefinitions 사용 */
export const semanticCategoryColumnDefinitionsCollapsed = semanticCategoryColumnDefinitions;

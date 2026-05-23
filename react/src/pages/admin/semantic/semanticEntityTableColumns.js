/** 온톨로지 우측 패널(객체·관계·액션) BasicTable 열 정의 */

export const semanticEntityColumnDefinitions = [
  { id: 'id', label: 'ID', defaultWidthPx: 64, minWidthPx: 56, align: 'left' },
  { id: 'nameEn', label: '영문명', defaultWidthPx: 180, minWidthPx: 140, align: 'left' },
  { id: 'nameKo', label: '한글명', defaultWidthPx: 140, minWidthPx: 112, align: 'left' },
  { id: 'categoryNameEn', label: '카테고리', defaultWidthPx: 160, minWidthPx: 120, align: 'left', ellipsis: false },
  { id: 'description', label: '설명', defaultWidthPx: 220, minWidthPx: 160, align: 'left' },
  {
    id: 'actions',
    label: '관리',
    defaultWidthPx: 92,
    minWidthPx: 92,
    align: 'right',
    ellipsis: false,
  },
];

/** 온톨로지 좌측 카테고리 패널 BasicTable 열 정의 */

import { basicTableActionsColumnDef } from '../../../components/common/table/basicTableActionsColumn';

const categoryActionsColumn = basicTableActionsColumnDef({ buttonCount: 2 });

/** 접힘(좌측 ~300px) — 이름 · 한글명 · 관리 */
export const semanticCategoryColumnDefinitionsCollapsed = [
  { id: 'nameEn', label: '이름', defaultWidthPx: 130, minWidthPx: 100, align: 'left', ellipsis: false },
  { id: 'nameKo', label: '한글명', defaultWidthPx: 80, minWidthPx: 64, align: 'left' },
  categoryActionsColumn,
];

/** 펼침 — 코드 · 설명 포함 */
export const semanticCategoryColumnDefinitionsFull = [
  { id: 'nameEn', label: '이름', defaultWidthPx: 130, minWidthPx: 100, align: 'left', ellipsis: false },
  { id: 'nameKo', label: '한글명', defaultWidthPx: 80, minWidthPx: 64, align: 'left' },
  { id: 'code', label: '코드', defaultWidthPx: 90, minWidthPx: 72, align: 'left' },
  { id: 'description', label: '설명', minWidthPx: 100, align: 'left', flex: true },
  categoryActionsColumn,
];

/** @deprecated semanticCategoryColumnDefinitionsFull 사용 */
export const semanticCategoryColumnDefinitions = semanticCategoryColumnDefinitionsFull;

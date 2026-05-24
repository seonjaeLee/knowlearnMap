/**
 * 온톨로지(시멘틱) 어드민 UI용 로컬 더미
 * `VITE_ENABLE_SEMANTIC_MOCK=true` 또는 목록 API 실패 시 semanticAdminMockStore 에서 사용.
 */

export const mockSemanticCategoriesSeed = [
  { id: 1, type: 'OBJECT', nameEn: 'Entity', nameKo: '엔티티', code: 'entity', parentId: null, path: 'Entity', description: '최상위 객체 분류' },
  { id: 2, type: 'OBJECT', nameEn: 'Person', nameKo: '사람', code: 'person', parentId: 1, path: 'Entity/Person', description: null },
  { id: 3, type: 'OBJECT', nameEn: 'Organization', nameKo: '조직', code: 'organization', parentId: 1, path: 'Entity/Organization', description: null },
  { id: 4, type: 'OBJECT', nameEn: 'Product', nameKo: '제품', code: 'product', parentId: null, path: 'Product', description: '제품·자재' },
  { id: 5, type: 'OBJECT', nameEn: 'Document', nameKo: '문서', code: 'document', parentId: null, path: 'Document', description: null },

  { id: 101, type: 'RELATION', nameEn: 'Structural', nameKo: '구조', code: 'structural', parentId: null, path: 'Structural', description: '구조적 관계' },
  { id: 102, type: 'RELATION', nameEn: 'BelongsTo', nameKo: '소속', code: 'belongs-to', parentId: 101, path: 'Structural/BelongsTo', description: null },
  { id: 103, type: 'RELATION', nameEn: 'Semantic', nameKo: '의미', code: 'semantic', parentId: null, path: 'Semantic', description: '의미적 관계' },

  { id: 201, type: 'ACTION', nameEn: 'Document', nameKo: '문서', code: 'document-action', parentId: null, path: 'Document', description: '문서 처리 액션' },
  { id: 202, type: 'ACTION', nameEn: 'Graph', nameKo: '그래프', code: 'graph-action', parentId: null, path: 'Graph', description: '그래프·온톨로지 액션' },
  { id: 203, type: 'ACTION', nameEn: 'Validation', nameKo: '검증', code: 'validation', parentId: 202, path: 'Graph/Validation', description: null },
];

export const mockSemanticObjectsSeed = [
  { id: 1, nameEn: 'PatientRecord', nameKo: '환자기록', categoryId: 2, categoryNameEn: 'Person', description: '환자 단위 기록' },
  { id: 2, nameEn: 'Hospital', nameKo: '병원', categoryId: 3, categoryNameEn: 'Organization', description: null },
  { id: 3, nameEn: 'MedicalDevice', nameKo: '의료기기', categoryId: 4, categoryNameEn: 'Product', description: '의료기기 SKU' },
  { id: 4, nameEn: 'ClinicalNote', nameKo: '진료노트', categoryId: 5, categoryNameEn: 'Document', description: '비정형 진료 기록' },
  { id: 5, nameEn: 'Department', nameKo: '부서', categoryId: 3, categoryNameEn: 'Organization', description: null },
];

export const mockSemanticRelationsSeed = [
  { id: 1, nameEn: 'WorksFor', nameKo: '근무', categoryId: 102, categoryNameEn: 'BelongsTo', description: 'Person → Organization' },
  { id: 2, nameEn: 'HasRole', nameKo: '역할보유', categoryId: 103, categoryNameEn: 'Semantic', description: null },
  { id: 3, nameEn: 'Contains', nameKo: '포함', categoryId: 101, categoryNameEn: 'Structural', description: '계층 포함' },
  { id: 4, nameEn: 'RelatedTo', nameKo: '관련', categoryId: 103, categoryNameEn: 'Semantic', description: '일반 연관' },
];

export const mockSemanticActionsSeed = [
  { id: 1, nameEn: 'SummarizeDocument', nameKo: '문서요약', categoryId: 201, categoryNameEn: 'Document', description: 'LLM 요약' },
  { id: 2, nameEn: 'ExtractTriple', nameKo: '트리플추출', categoryId: 202, categoryNameEn: 'Graph', description: null },
  { id: 3, nameEn: 'ValidateOntology', nameKo: '온톨로지검증', categoryId: 203, categoryNameEn: 'Validation', description: '스키마 검증' },
  { id: 4, nameEn: 'NotifyOwner', nameKo: '소유자알림', categoryId: 201, categoryNameEn: 'Document', description: null },
];

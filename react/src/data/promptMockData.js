/**
 * 프롬프트 관리 로컬 더미 데이터.
 * `config/promptMock.js`(dev 기본 mock) · `VITE_ENABLE_PROMPT_MOCK=true` · API 실패 시 사용.
 */
export const mockPromptCategories = ['SYSTEM', 'RAG', 'ANALYSIS', 'ETL', 'CHAT'];

export const mockPromptPurposes = [
  'CHUNK',
  'ONTOLOGY',
  'CHAT_RESULT',
  'CONTENT_ONTOLOGY',
  'SCHEMA_ANALYSIS',
  'INTER_TABLE_ANALYSIS',
  'AQL_GENERATION',
  'AQL_INTERPRETATION',
  'AGGREGATION_STRATEGY',
];

const now = Date.now();

const initialPromptRows = [
  {
    id: 1,
    code: 'DEFAULT_CHUNK_FYI',
    name: '기본 청킹 안내',
    description: '문서 본문을 문맥 단위로 안정적으로 청킹하기 위한 기본 프롬프트',
    category: 'RAG',
    purpose: 'CHUNK',
    securityLevel: 'PUBLIC',
    activeVersion: 'v3',
    versionCount: 3,
    isActive: true,
    updatedAt: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 6,
    code: 'DEFAULT_CHUNK_FAST',
    name: '고속 청킹',
    description: '대용량 문서를 빠르게 분할할 때 사용하는 경량 청킹 프롬프트',
    category: 'RAG',
    purpose: 'CHUNK',
    securityLevel: 'PUBLIC',
    activeVersion: 'v2',
    versionCount: 2,
    isActive: true,
    updatedAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 7,
    code: 'DEFAULT_CHUNK_SEMANTIC',
    name: '시맨틱 청킹',
    description: '문단·제목 구조를 반영해 의미 단위로 청크 경계를 잡는 프롬프트',
    category: 'RAG',
    purpose: 'CHUNK',
    securityLevel: 'INTERNAL',
    activeVersion: 'v4',
    versionCount: 6,
    isActive: true,
    updatedAt: new Date(now - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 8,
    code: 'DEFAULT_CHUNK_TABLE',
    name: '표·목록 청킹',
    description: '표·불릿 목록이 포함된 문서에서 행·블록 단위 분할 규칙을 정의합니다.',
    category: 'ETL',
    purpose: 'CHUNK',
    securityLevel: 'INTERNAL',
    activeVersion: 'v1',
    versionCount: 1,
    isActive: true,
    updatedAt: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 9,
    code: 'DEFAULT_CHUNK_LEGACY',
    name: '레거시 청킹 (비활성)',
    description: '구버전 청킹 규칙 — 신규 워크스페이스에는 사용하지 않음',
    category: 'RAG',
    purpose: 'CHUNK',
    securityLevel: 'PUBLIC',
    activeVersion: 'v8',
    versionCount: 8,
    isActive: false,
    updatedAt: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: 2,
    code: 'DEFAULT_ONTOLOGY_FYI',
    name: '온톨로지 생성 기본',
    description: '엔터티/관계 후보를 한국어 기준으로 추출하는 온톨로지 생성 프롬프트',
    category: 'ANALYSIS',
    purpose: 'ONTOLOGY',
    securityLevel: 'INTERNAL',
    activeVersion: 'v5',
    versionCount: 5,
    isActive: true,
    updatedAt: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 3,
    code: 'DEFAULT_CHAT_RESULT',
    name: '채팅 응답 기본',
    description: '근거 우선 답변과 금지 응답 패턴을 포함한 사용자 응답 템플릿',
    category: 'CHAT',
    purpose: 'CHAT_RESULT',
    securityLevel: 'CONFIDENTIAL',
    activeVersion: 'v2',
    versionCount: 4,
    isActive: true,
    updatedAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 4,
    code: 'DEFAULT_AQL_GEN_SAFE',
    name: 'AQL 생성 안전모드',
    description: '읽기 전용 쿼리 제약이 포함된 AQL 생성 프롬프트',
    category: 'ETL',
    purpose: 'AQL_GENERATION',
    securityLevel: 'INTERNAL',
    activeVersion: 'v1',
    versionCount: 1,
    isActive: false,
    updatedAt: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 5,
    code: 'DEFAULT_SCHEMA_ANALYSIS',
    name: '스키마 분석 기본',
    description: 'DDL/컬럼 설명으로부터 분석 가능한 스키마 요약을 생성합니다.',
    category: 'ANALYSIS',
    purpose: 'SCHEMA_ANALYSIS',
    securityLevel: 'PUBLIC',
    activeVersion: 'v7',
    versionCount: 9,
    isActive: true,
    updatedAt: new Date(now - 1000 * 60 * 30).toISOString(),
  },
];

let promptStore = initialPromptRows.map((item) => ({ ...item }));

function sortByUpdatedAtDesc(rows) {
  return [...rows].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export function getMockPrompts(params = {}) {
  const { isActive, search, category, purpose, page = 0, size = 20 } = params;
  const normalizedSearch = String(search || '').trim().toLowerCase();
  const numericPage = Number(page) || 0;
  const numericSize = Math.max(1, Number(size) || 20);

  let filtered = sortByUpdatedAtDesc(promptStore);
  if (typeof isActive === 'boolean') {
    filtered = filtered.filter((item) => item.isActive === isActive);
  }
  if (category) {
    filtered = filtered.filter((item) => item.category === category);
  }
  if (purpose) {
    filtered = filtered.filter((item) => item.purpose === purpose);
  }
  if (normalizedSearch) {
    filtered = filtered.filter((item) =>
      [item.code, item.name, item.description].some((field) =>
        String(field || '').toLowerCase().includes(normalizedSearch)
      )
    );
  }

  const totalElements = filtered.length;
  const start = numericPage * numericSize;
  const content = filtered.slice(start, start + numericSize);
  return {
    content,
    totalElements,
    totalPages: Math.ceil(totalElements / numericSize),
    number: numericPage,
    size: numericSize,
  };
}

export function getMockPrompt(code) {
  return promptStore.find((item) => item.code === code) || null;
}

export function createMockPrompt(data) {
  const newPrompt = {
    id: Math.max(0, ...promptStore.map((item) => item.id || 0)) + 1,
    code: data.code,
    name: data.name || data.code,
    description: data.description || '',
    category: data.category || '',
    purpose: data.purpose || '',
    securityLevel: data.securityLevel || 'PUBLIC',
    activeVersion: 'v1',
    versionCount: 1,
    isActive: true,
    updatedAt: new Date().toISOString(),
  };
  promptStore = [newPrompt, ...promptStore];
  return {
    ...newPrompt,
    publishVersionId: 1,
  };
}

export function updateMockPrompt(code, data) {
  const index = promptStore.findIndex((item) => item.code === code);
  if (index === -1) return null;
  const updated = {
    ...promptStore[index],
    ...data,
    code: promptStore[index].code,
    updatedAt: new Date().toISOString(),
  };
  promptStore[index] = updated;
  return updated;
}

export function deleteMockPrompt(code) {
  const before = promptStore.length;
  promptStore = promptStore.filter((item) => item.code !== code);
  return before !== promptStore.length;
}

export function isMockPromptCodeDuplicated(code) {
  return promptStore.some((item) => item.code === code);
}

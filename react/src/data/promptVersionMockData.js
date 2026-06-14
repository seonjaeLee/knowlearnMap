/**
 * 프롬프트 버전·에디터 상세 mock — `promptMock.js` 와 함께 사용.
 */

const semanticPromptBody = `You are a document chunking assistant for Korean technical documents.

Split the following document into chunks based on the rule: {{rule}}.
Output language: {{lang}}.
Maximum characters per chunk: {{max_length}}.
Preserve section headings: {{preserve_headings}}.

Return only valid JSON array of chunk objects with "index" and "text" fields.`;

const semanticVariableSchema = [
  {
    key: 'rule',
    label: '청킹 규칙',
    type: 'string',
    required: true,
    editable: true,
    defaultValue: 'semantic-paragraph',
    description: '문맥·문단 단위 분할 규칙',
    content: '문단 경계를 우선하고, 3문장 이상은 하위 문장 단위로 분할',
  },
  {
    key: 'lang',
    label: '출력 언어',
    type: 'string',
    required: true,
    editable: false,
    defaultValue: 'ko',
    description: '청크 메타데이터 언어',
    content: 'ko',
  },
  {
    key: 'max_length',
    label: '최대 길이',
    type: 'string',
    required: true,
    editable: true,
    defaultValue: '1200',
    description: '청크당 최대 문자 수',
    content: '1200',
  },
  {
    key: 'preserve_headings',
    label: '제목 보존',
    type: 'string',
    required: false,
    editable: true,
    defaultValue: 'true',
    description: 'H1~H3 제목을 청크 앞에 유지',
    content: 'true',
  },
];

const fyiPromptBody = `Split document text into stable chunks for RAG indexing.
Chunk size hint: {{chunk_size}}.
Overlap: {{overlap}} tokens.`;

const fyiVariableSchema = [
  {
    key: 'chunk_size',
    label: '청크 크기',
    type: 'string',
    required: true,
    editable: true,
    defaultValue: '800',
    description: '',
    content: '800',
  },
  {
    key: 'overlap',
    label: '오버랩',
    type: 'string',
    required: false,
    editable: false,
    defaultValue: '50',
    description: '',
    content: '50',
  },
];

const fastPromptBody = `Fast chunking mode. Max length: {{max_length}}. Delimiter: {{delimiter}}.`;

const fastVariableSchema = [
  {
    key: 'max_length',
    label: '최대 길이',
    type: 'string',
    required: true,
    editable: true,
    defaultValue: '600',
    description: '',
    content: '600',
  },
  {
    key: 'delimiter',
    label: '구분자',
    type: 'string',
    required: false,
    editable: false,
    defaultValue: '\\n\\n',
    description: '',
    content: '\\n\\n',
  },
];

const tablePromptBody = `Chunk tables and bullet lists separately.
Table row batch size: {{row_batch}}.
List item mode: {{list_mode}}.`;

const schemaAnalysisPromptBody = `You are a document chunking assistant. Split the following document into chunks based on the rule: {{rule}}. Language: {{lang}}. Max length per chunk: {{max_length}} characters.`;

const schemaAnalysisVariableSchema = [
  {
    key: 'rule',
    label: '청킹 규칙',
    type: 'string',
    required: true,
    editable: true,
    defaultValue: 'semantic-paragraph',
    description: '문맥·문단 단위 분할 규칙',
    content: 'semantic-paragraph',
  },
  {
    key: 'lang',
    label: '출력 언어',
    type: 'string',
    required: true,
    editable: false,
    defaultValue: 'ko',
    description: '청크 메타데이터 언어',
    content: 'ko',
  },
  {
    key: 'max_length',
    label: '최대 길이',
    type: 'string',
    required: true,
    editable: true,
    defaultValue: '1200',
    description: '청크당 최대 문자 수',
    content: '1200',
  },
];

const tableVariableSchema = [
  {
    key: 'row_batch',
    label: '표 행 묶음',
    type: 'string',
    required: true,
    editable: true,
    defaultValue: '10',
    description: '',
    content: '10',
  },
  {
    key: 'list_mode',
    label: '목록 모드',
    type: 'string',
    required: true,
    editable: true,
    defaultValue: 'item',
    description: '',
    content: 'item',
  },
];

function buildVersions(code, rows) {
  return rows.map((row) => ({ ...row, promptCode: code }));
}

const versionStoreByCode = {
  DEFAULT_CHUNK_SEMANTIC: buildVersions('DEFAULT_CHUNK_SEMANTIC', [
    {
      id: 701,
      version: 4,
      isActive: true,
      status: 'published',
      notes: '제목 보존 변수·표시명(label) 반영',
      content: semanticPromptBody,
      variableSchema: semanticVariableSchema,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 702,
      version: 3,
      isActive: false,
      status: 'draft',
      notes: 'max_length 기본값 조정',
      content: semanticPromptBody,
      variableSchema: semanticVariableSchema.map((v) => (
        v.key === 'max_length' ? { ...v, content: '1000' } : { ...v }
      )),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 703,
      version: 2,
      isActive: false,
      status: 'archived',
      notes: '초기 시맨틱 규칙',
      content: semanticPromptBody.replace('Preserve section headings', 'Ignore headings'),
      variableSchema: semanticVariableSchema.slice(0, 3),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ]),
  DEFAULT_CHUNK_FYI: buildVersions('DEFAULT_CHUNK_FYI', [
    {
      id: 711,
      version: 3,
      isActive: true,
      status: 'published',
      notes: '기본 안내 문구 정리',
      content: fyiPromptBody,
      variableSchema: fyiVariableSchema,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 712,
      version: 2,
      isActive: false,
      status: 'draft',
      notes: '오버랩 기본값 변경',
      content: fyiPromptBody,
      variableSchema: fyiVariableSchema,
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ]),
  DEFAULT_CHUNK_FAST: buildVersions('DEFAULT_CHUNK_FAST', [
    {
      id: 721,
      version: 2,
      isActive: true,
      status: 'published',
      notes: '고속 모드',
      content: fastPromptBody,
      variableSchema: fastVariableSchema,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 722,
      version: 1,
      isActive: false,
      status: 'archived',
      notes: '최초 버전',
      content: fastPromptBody,
      variableSchema: fastVariableSchema,
      updatedAt: new Date(Date.now() - 604800000).toISOString(),
    },
  ]),
  DEFAULT_CHUNK_TABLE: buildVersions('DEFAULT_CHUNK_TABLE', [
    {
      id: 731,
      version: 1,
      isActive: true,
      status: 'published',
      notes: '표·목록 전용',
      content: tablePromptBody,
      variableSchema: tableVariableSchema,
      updatedAt: new Date().toISOString(),
    },
  ]),
  DEFAULT_SCHEMA_ANALYSIS: buildVersions('DEFAULT_SCHEMA_ANALYSIS', [
    {
      id: 801,
      version: 3,
      isActive: false,
      status: 'draft',
      notes: 'max_length 기본값 조정',
      content: schemaAnalysisPromptBody,
      variableSchema: schemaAnalysisVariableSchema,
      updatedAt: new Date('2026-05-12T10:30:00').toISOString(),
    },
    {
      id: 802,
      version: 2,
      isActive: true,
      status: 'published',
      notes: '스키마 요약 출력 형식 정리',
      content: schemaAnalysisPromptBody,
      variableSchema: schemaAnalysisVariableSchema,
      updatedAt: new Date('2026-05-10T14:20:00').toISOString(),
    },
    {
      id: 803,
      version: 1,
      isActive: false,
      status: 'archived',
      notes: '초기 스키마 분석 프롬프트',
      content: schemaAnalysisPromptBody.replace('Max length per chunk', 'Max chunk size'),
      variableSchema: schemaAnalysisVariableSchema.slice(0, 2),
      updatedAt: new Date('2026-04-01T09:00:00').toISOString(),
    },
  ]),
};

let mutableStore = JSON.parse(JSON.stringify(versionStoreByCode));

function cloneVersions(code) {
  const list = mutableStore[code];
  return list ? list.map((v) => ({ ...v, variableSchema: v.variableSchema?.map((s) => ({ ...s })) })) : [];
}

export function getMockVersions(code) {
  const content = cloneVersions(code);
  return {
    content,
    totalElements: content.length,
    totalPages: 1,
    number: 0,
    size: content.length || 20,
  };
}

export function getMockVersion(code, versionId) {
  const list = mutableStore[code] || [];
  const found = list.find((v) => v.id === Number(versionId) || v.id === versionId);
  return found ? { ...found, variableSchema: found.variableSchema?.map((s) => ({ ...s })) } : null;
}

export function updateMockVersion(code, versionId, data) {
  const list = mutableStore[code];
  if (!list) return null;
  const index = list.findIndex((v) => v.id === Number(versionId) || v.id === versionId);
  if (index === -1) return null;
  const updated = {
    ...list[index],
    ...data,
    id: list[index].id,
    version: list[index].version,
    updatedAt: new Date().toISOString(),
  };
  list[index] = updated;
  return updated;
}

export function createMockVersion(code, data) {
  if (!mutableStore[code]) {
    mutableStore[code] = [];
  }
  const list = mutableStore[code];
  const maxVer = Math.max(0, ...list.map((v) => Number(v.version) || 0));
  const newId = Math.max(0, ...list.map((v) => v.id || 0)) + 1;
  const created = {
    id: newId,
    version: data.version ? Number(data.version) : maxVer + 1,
    isActive: false,
    status: data.status || 'draft',
    notes: data.notes || '',
    content: data.content || '',
    variableSchema: data.variableSchema || [],
    updatedAt: new Date().toISOString(),
    promptCode: code,
  };
  list.unshift(created);
  return created;
}

export function publishMockVersion(code, versionId) {
  const list = mutableStore[code];
  if (!list) return null;
  list.forEach((v) => {
    v.isActive = v.id === Number(versionId) || v.id === versionId;
    if (v.isActive) v.status = 'published';
  });
  return list.find((v) => v.id === Number(versionId) || v.id === versionId) || null;
}

export function deleteMockVersion(code, versionId) {
  const list = mutableStore[code];
  if (!list) return false;
  const before = list.length;
  mutableStore[code] = list.filter((v) => v.id !== Number(versionId) && v.id !== versionId);
  return mutableStore[code].length !== before;
}

export function resetMockVersionStore() {
  mutableStore = JSON.parse(JSON.stringify(versionStoreByCode));
}

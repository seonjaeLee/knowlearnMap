/**
 * 스냅샷(테스트 이력) 더미 데이터
 * useSnapshots 훅에서 API 실패 시 fallback으로 사용
 */

const now = Date.now();
const d = (offsetMs) => new Date(now - offsetMs).toISOString();

const MOCK_SNAPSHOTS = {
  DEFAULT_CHUNK_SEMANTIC: [
    {
      id: 1001,
      testName: '의미 단위 청킹 기본 테스트',
      versionId: 701,
      content: 'You are a document chunking assistant...\n[rule: 문단 경계 우선]\n[lang: ko]',
      response: {
        text: '{"chunks":[{"index":0,"text":"문서 도입부 요약"},{"index":1,"text":"본론 1단락"},{"index":2,"text":"본론 2단락"}]}',
        tokens_used: 412,
        latency_ms: 1840,
      },
      llmConfig: { model: 'AISTUDIO' },
      success: true,
      satisfaction: 4,
      tokensUsed: 412,
      latencyMs: 1840,
      notes: '기본 파라미터로 진행',
      createdAt: d(0),
    },
    {
      id: 1002,
      testName: '최대 길이 1000자 테스트',
      versionId: 702,
      content: 'You are a document chunking assistant...\n[max_length: 1000]',
      response: {
        text: '{"chunks":[{"index":0,"text":"단락 1"},{"index":1,"text":"단락 2"},{"index":2,"text":"단락 3"},{"index":3,"text":"단락 4"}]}',
        tokens_used: 538,
        latency_ms: 2100,
      },
      llmConfig: { model: 'OPENAI' },
      success: true,
      satisfaction: 5,
      tokensUsed: 538,
      latencyMs: 2100,
      notes: '청크 수 증가 확인',
      createdAt: d(3600000),
    },
    {
      id: 1003,
      testName: '제목 보존 비활성 테스트',
      versionId: 701,
      content: 'You are a document chunking assistant...\n[preserve_headings: false]',
      response: {
        text: null,
        tokens_used: 0,
        latency_ms: 320,
      },
      llmConfig: { model: 'ANTHROPIC' },
      success: false,
      satisfaction: 1,
      tokensUsed: 0,
      latencyMs: 320,
      notes: '응답 파싱 오류 발생',
      createdAt: d(7200000),
    },
    {
      id: 1004,
      testName: 'Gemini Flash 비교 테스트',
      versionId: 703,
      content: 'You are a document chunking assistant...\n[rule: fast-sentence]',
      response: {
        text: '{"chunks":[{"index":0,"text":"요약 단락"},{"index":1,"text":"내용 단락"}]}',
        tokens_used: 290,
        latency_ms: 950,
      },
      llmConfig: { model: 'AISTUDIO' },
      success: true,
      satisfaction: 3,
      tokensUsed: 290,
      latencyMs: 950,
      notes: '속도 우선 모델 비교',
      createdAt: d(86400000),
    },
    {
      id: 1005,
      testName: 'OpenAI GPT-4 품질 검증',
      versionId: 701,
      content: 'You are a document chunking assistant...\n[rule: semantic-paragraph]\n[lang: ko]',
      response: {
        text: '{"chunks":[{"index":0,"text":"서론"},{"index":1,"text":"본론 상세 내용 (3문장 분할)"},{"index":2,"text":"결론 요약"}]}',
        tokens_used: 672,
        latency_ms: 3200,
      },
      llmConfig: { model: 'OPENAI' },
      success: true,
      satisfaction: 5,
      tokensUsed: 672,
      latencyMs: 3200,
      notes: '품질 우수 — 운영 배포 후보',
      createdAt: d(172800000),
    },
  ],
  DEFAULT_SCHEMA_ANALYSIS: [
    {
      id: 2001,
      testName: '스키마 분석 DDL 테스트',
      versionId: 101,
      content: 'You are a schema analysis assistant...\n[ddl: CREATE TABLE users (...)]',
      response: {
        text: '{"summary":"users 테이블 분석 완료","columns":5,"constraints":2}',
        tokens_used: 348,
        latency_ms: 1250,
      },
      llmConfig: { model: 'AISTUDIO' },
      success: true,
      satisfaction: 4,
      tokensUsed: 348,
      latencyMs: 1250,
      notes: null,
      createdAt: d(1800000),
    },
    {
      id: 2002,
      testName: '복잡 JOIN 스키마 분석',
      versionId: 101,
      content: 'You are a schema analysis assistant...\n[ddl: CREATE TABLE orders (...) JOIN users]',
      response: {
        text: '{"summary":"외래키 관계 분석","tables":2,"joins":1}',
        tokens_used: 520,
        latency_ms: 1890,
      },
      llmConfig: { model: 'OPENAI' },
      success: true,
      satisfaction: 4,
      tokensUsed: 520,
      latencyMs: 1890,
      notes: '멀티 테이블 분석 정확도 확인',
      createdAt: d(90000000),
    },
  ],
};

const DEFAULT_MOCK = {
  content: [],
  totalElements: 0,
};

/**
 * promptCode에 해당하는 더미 스냅샷 목록 반환
 * @param {string} code
 * @param {{ versionId?: string, model?: string }} params
 */
export function getMockSnapshots(code, params = {}) {
  const list = MOCK_SNAPSHOTS[code] || [];
  let filtered = [...list];

  if (params.versionId) {
    filtered = filtered.filter(
      (s) => String(s.versionId) === String(params.versionId),
    );
  }
  if (params.model) {
    filtered = filtered.filter((s) => {
      const cfg = typeof s.llmConfig === 'string' ? JSON.parse(s.llmConfig) : s.llmConfig;
      return cfg?.model === params.model;
    });
  }

  return {
    content: filtered,
    totalElements: filtered.length,
  };
}

export default MOCK_SNAPSHOTS;

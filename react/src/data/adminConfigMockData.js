/**
 * 어드민 시스템 설정(`/admin/config`) UI용 로컬 더미.
 * `VITE_ENABLE_ADMIN_CONFIG_MOCK=true` 또는 API 실패 시 사용.
 *
 * `valuePresentation: 'textarea'` — 값 열을 textarea 형으로(카테고리 외에도 지정 가능).
 */
export const mockAdminConfigCategories = [
    'ARANGO',
    'BATCH',
    'CHAT',
    'FILE',
    'GRADE',
    'GRAPH',
    'MODEL',
    'PERSONA',
    'PROMPT',
    'ROLE',
    'SEMANTIC',
    'SLLM',
    'STATUS',
    'TIMEOUT',
    'ETC',
];

/** 백엔드 `SystemConfigResponse`와 유사한 필드 */
export const mockAdminConfigItems = [
    {
        category: 'BATCH',
        configKey: 'LLM_BATCH_SIZE',
        configValue: '32',
        dataType: 'INT',
        description: '한 번의 LLM 호출에 포함되는 레코드 개수',
    },
    {
        category: 'BATCH',
        configKey: 'LLM_PARALLEL_SIZE',
        configValue: '4',
        dataType: 'INT',
        description: '동시에 실행되는 LLM 워커 스레드 수',
    },
    {
        category: 'GRAPH',
        configKey: 'GRAPH_MAX_NODES',
        configValue: '1500',
        dataType: 'INT',
        description: '지식그래프 시각화 시 노드 상한',
    },
    {
        category: 'GRAPH',
        configKey: 'GRAPH_MAX_EDGES',
        configValue: '4000',
        dataType: 'INT',
        description: '지식그래프 시각화 시 엣지 상한',
    },
    {
        category: 'MODEL',
        configKey: 'DEFAULT_LLM_MODEL',
        configValue: 'gpt-4.1-mini',
        dataType: 'STRING',
        description: '기본 채팅·요약에 사용하는 LLM 모델 식별자',
    },
    {
        category: 'MODEL',
        configKey: 'EMBEDDING_MODEL',
        configValue: 'text-embedding-3-small',
        dataType: 'STRING',
        description: '문서 임베딩에 사용하는 모델',
    },
    {
        category: 'TIMEOUT',
        configKey: 'API_TIMEOUT_MS',
        configValue: '120000',
        dataType: 'LONG',
        description: '외부 API 호출 타임아웃(밀리초)',
    },
    {
        category: 'TIMEOUT',
        configKey: 'RETRY_MAX_ATTEMPTS',
        configValue: '3',
        dataType: 'INT',
        description: '일시 오류 시 최대 재시도 횟수',
    },
    {
        category: 'GRADE',
        configKey: 'GRADE_FREE_MAX_WORKSPACES',
        configValue: '3',
        dataType: 'INT',
        description: 'FREE 등급 워크스페이스 최대 개수',
    },
    {
        category: 'GRADE',
        configKey: 'GRADE_PRO_MAX_WORKSPACES',
        configValue: '50',
        dataType: 'INT',
        description: 'PRO 등급 워크스페이스 최대 개수',
    },
    {
        category: 'ARANGO',
        configKey: 'ARANGO_COLLECTION_OBJECTS',
        configValue: 'km_objects',
        dataType: 'STRING',
        description: '객체 노드 컬렉션명',
    },
    {
        category: 'CHAT',
        configKey: 'CHAT_DEBUG_PANEL',
        configValue: 'false',
        dataType: 'BOOLEAN',
        description: '채팅 디버그 패널 표시 여부',
    },
    {
        category: 'FILE',
        configKey: 'UPLOAD_MAX_MB',
        configValue: '50',
        dataType: 'INT',
        description: '단일 파일 업로드 최대 MB',
    },
    {
        category: 'ROLE',
        configKey: 'DEFAULT_ROLE_CODE',
        configValue: 'USER',
        dataType: 'STRING',
        description: '신규 가입 시 기본 역할 코드',
    },
    {
        category: 'STATUS',
        configKey: 'DOC_STATUS_PUBLISHED',
        configValue: 'PUBLISHED',
        dataType: 'STRING',
        description: '문서 게시 상태 코드',
    },
    {
        category: 'PROMPT',
        configKey: 'DEFAULT_SUMMARY_PROMPT_CODE',
        configValue: 'SUMMARY_V2',
        dataType: 'STRING',
        description: '요약용 기본 프롬프트 코드',
    },
    {
        category: 'PERSONA',
        configKey: 'DEFAULT_PERSONA_PRESET',
        configValue:
            '당신은 전문 지식 어시스턴트입니다.\n'
            + '- 근거가 있는 경우에만 단정적으로 답합니다.\n'
            + '- 불확실하면 "모르겠습니다"라고 말합니다.\n'
            + '- 한국어로 간결하게 작성합니다.',
        dataType: 'STRING',
        description: '기본 페르소나(여러 줄). dev와 동일하게 textarea 형으로 표시됩니다.',
    },
    {
        category: 'SEMANTIC',
        configKey: 'SEMANTIC_GLOBAL_OPTIONS_JSON',
        configValue:
            '{\n'
            + '  "objectCategories": ["Person", "Organization", "Product"],\n'
            + '  "relationWhitelist": ["Works_On", "Located_In"],\n'
            + '  "notes": "온톨로지 UI용 샘플 JSON"\n'
            + '}',
        dataType: 'STRING',
        description: '시멘틱 옵션(JSON). 긴 문자열 textarea로 확인합니다.',
    },
    {
        category: 'SLLM',
        configKey: 'SLLM_ROUTING_RULES_YAML',
        configValue:
            'routes:\n'
            + '  - name: fast-path\n'
            + '    model: small-chat\n'
            + '    max_tokens: 512\n'
            + '  - name: quality-path\n'
            + '    model: large-chat\n'
            + '    max_tokens: 4096\n',
        dataType: 'STRING',
        description: 'SLLM 라우팅 규칙(샘플 YAML). textarea 형으로 확인합니다.',
    },
    {
        category: 'ETC',
        configKey: 'MAINTENANCE_MODE',
        configValue: 'false',
        dataType: 'BOOLEAN',
        description: 'true이면 일반 사용자 요청을 제한합니다.',
    },
    {
        category: 'ETC',
        configKey: 'FEATURE_FLAGS_JSON',
        configValue: '{"betaNotebook":false}',
        dataType: 'STRING',
        description: '기능 플래그(JSON 문자열)',
    },
];

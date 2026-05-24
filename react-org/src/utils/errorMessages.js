/**
 * 사용자 친화적 에러 메시지 매핑
 * - HTTP 상태 코드 → 한국어 메시지
 * - LLM/AI 관련 에러 → 구체적 안내
 * - 기술적 에러 → 일반적 안내
 */

const HTTP_ERROR_MESSAGES = {
  400: '요청 형식이 올바르지 않습니다. 입력값을 확인해주세요.',
  401: '로그인이 필요합니다. 다시 로그인해주세요.',
  403: '이 작업에 대한 권한이 없습니다.',
  404: '요청하신 데이터를 찾을 수 없습니다.',
  408: '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.',
  409: '다른 작업과 충돌이 발생했습니다. 새로고침 후 다시 시도해주세요.',
  413: '파일 크기가 너무 큽니다. 허용 크기를 확인해주세요.',
  429: 'AI 서비스 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
  500: '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
  502: '서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.',
  503: '서비스가 일시적으로 이용 불가합니다. 잠시 후 다시 시도해주세요.',
};

const LLM_ERROR_PATTERNS = [
  { pattern: /quota|할당량|rate.?limit/i, message: 'AI 서비스 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.' },
  { pattern: /timeout|시간.?초과|timed?\s?out/i, message: 'AI 응답 생성에 시간이 오래 걸리고 있습니다. 잠시 후 다시 시도해주세요.' },
  { pattern: /model.*unavailable|서비스.*불가/i, message: 'AI 모델이 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.' },
  { pattern: /api.*key|인증.*실패|unauthorized/i, message: 'AI 서비스 인증에 문제가 있습니다. 관리자에게 문의해주세요.' },
  { pattern: /parse|파싱|json/i, message: 'AI 응답을 처리하는 중 문제가 발생했습니다. 다시 시도해주세요.' },
  { pattern: /connection|연결|network|fetch/i, message: '서버 연결에 실패했습니다. 네트워크 상태를 확인해주세요.' },
];

/**
 * HTTP 상태 코드로부터 사용자 친화적 메시지 반환
 */
export function getHttpErrorMessage(status) {
  return HTTP_ERROR_MESSAGES[status] || `요청 처리에 실패했습니다. (오류 코드: ${status})`;
}

/**
 * 에러 객체에서 사용자 친화적 메시지 추출
 * - 서버에서 보낸 한국어 메시지가 있으면 그대로 사용
 * - HTTP 상태 코드만 있으면 매핑된 메시지 사용
 * - LLM 관련 에러 패턴 감지
 * - 기술적 에러는 일반 메시지로 대체
 */
export function getFriendlyErrorMessage(error, fallbackMessage = '요청 처리에 실패했습니다. 잠시 후 다시 시도해주세요.') {
  if (!error) return fallbackMessage;

  const errorMsg = typeof error === 'string' ? error : (error.message || '');

  // 이미 한국어 사용자 친화적 메시지인 경우 그대로 반환
  if (isKoreanUserMessage(errorMsg)) {
    return errorMsg;
  }

  // HTTP 상태 코드 패턴 매칭
  const httpMatch = errorMsg.match(/HTTP error!?\s*status:\s*(\d+)/i);
  if (httpMatch) {
    return getHttpErrorMessage(parseInt(httpMatch[1]));
  }

  // LLM 관련 에러 패턴 매칭
  for (const { pattern, message } of LLM_ERROR_PATTERNS) {
    if (pattern.test(errorMsg)) {
      return message;
    }
  }

  // 네트워크 에러
  if (error instanceof TypeError && errorMsg.includes('fetch')) {
    return '서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.';
  }

  // 기술적 에러 메시지 (영어, 스택트레이스 등) → 일반 메시지로 대체
  if (isTechnicalMessage(errorMsg)) {
    return fallbackMessage;
  }

  return errorMsg || fallbackMessage;
}

/**
 * 채팅 에러에 특화된 메시지 생성
 */
export function getChatErrorMessage(error) {
  return getFriendlyErrorMessage(error, '답변 생성에 실패했습니다. 다시 시도해주세요.');
}

/**
 * 파일 업로드 에러 메시지
 */
export function getUploadErrorMessage(error) {
  const msg = typeof error === 'string' ? error : (error?.message || '');
  if (/413|too large|크기/i.test(msg)) {
    return '파일 크기가 허용 범위를 초과합니다. 더 작은 파일을 사용해주세요.';
  }
  if (/unsupported|지원하지 않는|format|형식/i.test(msg)) {
    return '지원하지 않는 파일 형식입니다. PDF 또는 CSV 파일을 업로드해주세요.';
  }
  return getFriendlyErrorMessage(error, '파일 업로드에 실패했습니다. 다시 시도해주세요.');
}

/**
 * 파이프라인 에러 메시지
 */
export function getPipelineErrorMessage(error) {
  const msg = typeof error === 'string' ? error : (error?.message || '');
  if (/quota|할당량|429/i.test(msg)) {
    return 'AI 서비스 요청 한도를 초과하여 처리가 중단되었습니다. 잠시 후 다시 시도해주세요.';
  }
  if (/parse|파싱/i.test(msg)) {
    return '문서 분석 중 일부 내용을 처리하지 못했습니다. 문서 형식을 확인해주세요.';
  }
  return getFriendlyErrorMessage(error, '문서 처리에 실패했습니다. 잠시 후 다시 시도해주세요.');
}

// --- 내부 헬퍼 ---

function isKoreanUserMessage(msg) {
  if (!msg) return false;
  // 한국어 문자가 30% 이상이고 기술적 용어가 없으면 사용자용 메시지로 판단
  const koreanChars = (msg.match(/[\uac00-\ud7af]/g) || []).length;
  const ratio = koreanChars / msg.length;
  return ratio > 0.3 && !isTechnicalMessage(msg);
}

function isTechnicalMessage(msg) {
  if (!msg) return false;
  const technicalPatterns = [
    /^[A-Z][a-z]+Exception/,         // Java exception names
    /^\w+Error:/,                     // JS error names
    /at\s+\w+\.\w+\(/,               // Stack trace
    /java\.\w+\./,                    // Java package names
    /org\.springframework/,           // Spring framework
    /Cannot read propert/,            // JS runtime error
    /undefined is not/,              // JS runtime error
    /null pointer/i,                 // NullPointer
    /SQL.*syntax/i,                  // SQL syntax errors
  ];
  return technicalPatterns.some(p => p.test(msg));
}

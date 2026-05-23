/** 고객센터 목록 API 응답 — 배열·ApiResponse·페이지 객체 등 형태 통일 */
export function normalizeSupportListPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload?.data !== undefined) {
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.data?.content)) return payload.data.content;
  }
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
}

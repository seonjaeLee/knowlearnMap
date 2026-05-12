# Modal Migration Plan (1차)

## 1) 범위

- 공통 인프라 도입:
  - `BaseModal`
  - `DialogProvider` / `useDialog`
- 기존 개별 팝업은 동작 보장을 위해 점진 전환

## 2) 단계별 계획

### Phase 1: 기반 도입

- [x] 공통 모달 컴포넌트 생성
- [x] 전역 다이얼로그 훅(`alert`, `confirm`, `prompt`) 생성
- [x] 앱 루트 provider 연결
- [ ] 샘플 페이지 1곳에서 사용 예시 적용

### Phase 2: 단순 다이얼로그 전환

- [ ] 삭제 확인류를 `useDialog().confirm`으로 점진 전환
- [ ] 단순 안내류를 `useDialog().alert`로 점진 전환
- [ ] 이름 입력류를 `useDialog().prompt`로 전환

### Phase 3: 폼 모달 전환

- [ ] 공지/FAQ/QnA 작성 모달을 `BaseModal` 기반으로 정리
- [ ] 중복 footer/닫기/버튼 로직 제거
- [ ] 폼 검증 메시지/오류 표기 규칙 통일

### Phase 4: 복합 모달 전환

- [ ] DB 연결/그래프/사전 등 대형 모달 전환 설계
- [ ] 성능/접근성(포커스, 키보드, 스크롤) 점검

## 3) 리스크와 대응

- 리스크: 기존 `AlertContext`와 신규 `DialogContext` 이중 운영
  - 대응: 2차에서 공통 API 어댑터 작성 후 단일화
- 리스크: 모달별 기존 CSS 충돌
  - 대응: 모듈 스코프 강화, 필요 시 최소 범위 `!important`
- 리스크: 페이지별 닫기 정책 불일치
  - 대응: 스펙 문서 기준으로 표준 옵션 강제

## 4) 인수인계 체크리스트

- [ ] 공통 컴포넌트 위치/책임 공유
- [ ] `useDialog` API 사용 예시 공유
- [ ] 전환 우선순위 대상 목록 공유
- [ ] 롤백 방법(기존 AlertContext fallback) 공유
- [ ] `docs/ui-history.md` — **담당자가 요청할 때만** 갱신(`.cursor/rules/ui-history-on-request.mdc`); 자동 반영 체크 항목 아님

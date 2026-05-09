# Modal Spec (확정 v1)

이 문서는 모달 UI 작업을 반복 보정 방식이 아니라 규격 기반으로 진행하기 위한 확정 기준이다.

## 1) 핵심 원칙

- 모달 구조는 `BaseModal` 기준으로 통일한다.
- 헤더(타이틀) 규격은 하단 버튼 유무와 무관하게 동일하게 적용한다.
- 화면별 CSS는 도메인 콘텐츠 레이아웃만 담당하고, 버튼/상태/헤더 기본 톤은 공통 규격을 따른다.
- 본 규격은 `닫기(X) 버튼이 있는 팝업`에만 적용한다.
- `alert / confirm / prompt`(Decision)는 본 일괄 정리 범위에서 제외한다.

## 2) 레이아웃 규격 (고정)

- 헤더: `16px 24px`, 제목 좌측 + 닫기 버튼 우측, 하단 라인 1px
- 콘텐츠 기본 패딩: `24px 32px`
- 하단 액션 패딩: `24px 24px`
- 모달 내부 기본 섹션 간격: `16px`

## 3) 타입 분류 (운영 기준)

### A. Decision (`alert` / `confirm` / `prompt`)
- 호출: `useDialog`
- 정렬: 제목/액션 중앙 정렬 허용
- 타이틀·본문 글자 크기: 공통 팝업과 동일 — 제목은 `BaseModal` `.title`(`--font-size-lg`), 본문은 `.contentInner`와 동일(`--font-size-sm`)
- 버튼: 취소(보조) + 확인(주행동)
- 본 스펙의 Form/No-Footer 일괄 리팩터링 대상에서 제외

### B. Form (편집/생성)
- 레이아웃: Header / Content / Footer(actions)
- 버튼: 취소(Outlined), 저장/확인(Contained), 삭제는 필요 시 좌측 그룹

### C. No-Footer (뷰어/읽기형)
- 레이아웃: Header / Content
- 하단 actions 없음
- 단, 헤더 규격은 A/B와 동일

## 4) 버튼 규격

- 공통 radius: `4px` (`var(--radius-sm)`)
- **일반 모달·Decision(alert / confirm / prompt) 공통** 버튼 패딩: `4px 16px` (`var(--spacing-xs)` × `var(--spacing-md)`), 글자 크기는 `--font-size-base`(14px)로 일반 액션 버튼과 통일
- Decision만 actions **가운데 정렬**, 버튼 **`min-width: 100px`**(일반 폼 모달의 contained `min-width: 150px`와 구분)
- Contained 기본/hover/active/disabled 색상은 공통 토큰으로 상태별 명시
- 취소 버튼은 파란 contained 사용 금지(기본 Outlined)

## 5) 업로드 버튼 배치 규칙

- "팝업 내부 업로드 버튼"은 콘텐츠 우상단에 배치한다.
- 하단 actions에는 취소/저장 등 주행동 버튼만 둔다.

## 6) 현재 우선 관리 대상 (팝업 매핑)

| 팝업 | 타입 | 비고 |
|---|---|---|
| 워크스페이스 삭제 확인 | Decision | 취소/삭제 색상 상태 고정 |
| 페르소나 관리(목록) | No-Footer | 카드/추가 버튼 중심 |
| 페르소나 관리(편집/신규/기초값) | Form | 하단 액션 규격 적용 |
| 소스 추가 | No-Footer | 헤더 + 콘텐츠 중심 |
| 비즈니스/IT 용어사전 | Form | 업로드 버튼 콘텐츠 우상단, 하단 취소/저장 |

## 7) 예외 처리 원칙

- **`paperSx`**: MUI Dialog **Paper**에 넘기는 `sx` 객체. 모달 **가로·세로·`maxHeight`** 등을 페이지에서 지정할 때 사용한다. 보통 **`maxWidth={false}`** · **`fullWidth={false}`** 와 함께 쓴다. 콘텐츠 스크롤은 Paper를 `display: flex` / `flexDirection: column` 으로 두고 `DialogContent`에 `flex: 1`·`minHeight: 0`·`overflow: auto` 를 맞춘다.
- `headerClassName`, `contentClassName`, `actionsClassName`는 간격 보정 목적만 허용한다.
- 공통 규격을 깨는 색상/버튼 상태 오버라이드는 금지한다.
- 예외가 필요한 경우 반드시 이 문서에 항목을 추가한 뒤 적용한다.

## 8) 완료 기준 (DoD)

- 동일 타입 모달끼리 헤더/콘텐츠/액션 간격이 동일하다.
- 버튼 상태(기본/hover/active/disabled)가 타입 내에서 동일하다.
- 신규 모달은 생성 시 타입(A/B/C)을 문서화하고 시작한다.

## 9) 팝업 본문 폼 컨트롤 (입력·선택·체크 등)

- 상세 규격·클래스·적용 방법은 **[`modal-form-spec.md`](./modal-form-spec.md)** 를 따른다.
- 요약: `BaseModal` **`contentClassName`** 에 **`km-modal-form`** 추가, 필드 블록은 **`ModalFormField`** 또는 동일 의미의 `km-modal-form-*` 클래스.

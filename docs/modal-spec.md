# Modal Spec (초안)

이 문서는 현재 팝업을 공통 규격으로 정리하기 위한 인수인계용 스펙 초안입니다.

## 1) 공통 UX 규격

- 레이아웃: Header / Body / Footer
- Header 정렬: 제목 좌측, 닫기(X) 버튼 우측
- Footer 버튼 정렬: 기본 우측(`actionsAlign='right'`), 예외 케이스만 가운데 정렬 허용
- 버튼 그룹: 성격이 다른 단독 액션(예: 기본값 초기화)은 좌측, 취소/저장 같은 주 흐름 액션은 우측 그룹
- 파란 채움 버튼(`contained`): 팝업 내부 기본 `min-width: 150px`
- 닫기 정책:
  - 기본: ESC 허용, backdrop 클릭 허용
  - 데이터 손실 위험 모달: backdrop 닫기 비활성화
- 스크롤 정책:
  - 모달 전체가 아닌 Body 영역 스크롤 우선

## 2) 버튼 계층

- Primary: 확정/저장/적용
- Secondary: 취소/닫기
- Danger: 삭제/파기 (`confirm`의 `tone: 'danger'`)

## 3) 타입 분류

- 시스템 다이얼로그: `alert`, `confirm`, `prompt`
- 도메인 폼 모달: 생성/수정(공지, FAQ, QnA, 워크스페이스명 변경 등)
- 대형 작업 모달: 문서 뷰어/그래프/DB 연결 등

## 4) 1차 전환 대상 (제안)

| 팝업 | 유형 | 우선순위 | 전환 방식 |
|---|---|---|---|
| 워크스페이스 이름 변경 | prompt 성격 | 상 | `useDialog().prompt` 우선 적용 |
| 삭제 확인(공통) | confirm 성격 | 상 | `useDialog().confirm` 공통화 |
| 공지사항 작성 | 폼 모달 | 중 | `BaseModal` 기반 도메인 래퍼 |
| QnA 작성 | 폼 모달 | 중 | `BaseModal` 기반 도메인 래퍼 |
| FAQ 상세/수정 | 폼 모달 | 중 | `BaseModal` 기반 도메인 래퍼 |

## 5) 옵션 표준(안)

| 옵션 | 설명 | 기본값 |
|---|---|---|
| `title` | 모달 타이틀 | 타입별 기본값 |
| `message` | 설명/본문 텍스트 | `''` |
| `confirmText` | 확인 버튼 문구 | `확인` |
| `cancelText` | 취소 버튼 문구 | `취소` |
| `disableBackdropClose` | 바깥 클릭 닫기 차단 | `false` (`prompt`는 `true` 권장) |
| `disableEscapeKeyDown` | ESC 닫기 차단 | `false` |
| `tone` | 버튼 톤 (`primary`/`danger`) | `primary` |
| `actionsAlign` | 하단 버튼 정렬 (`left`/`center`/`right`) | `right` |

## 6) 검증/에러 처리 기준

- `prompt`는 `validator` 함수로 즉시 검증
- API 에러는 원문 노출보다 사용자 메시지 우선
- 성공/실패 안내 문구 템플릿을 도메인별로 통일

## 7) 완료 기준 (Definition of Done)

- 동일 유형 모달의 헤더/푸터/버튼 톤 일치
- 안내/확인성 다이얼로그는 `useDialog`로만 처리
- 신규 모달은 `BaseModal` 미사용 시 사유 기록

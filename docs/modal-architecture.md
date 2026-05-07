# Modal Architecture (1차)

이 문서는 MAP 프로젝트의 팝업/다이얼로그를 일관되게 관리하기 위한 1차 아키텍처를 정리합니다.

## 1) 목표

- 팝업 UI 구조(헤더/본문/푸터) 일관화
- `alert`, `confirm`, `prompt` 호출 방식 통일
- 모달별 중복 상태(`isOpen`, `confirmOpen`, `selectedItem`) 감소
- 디자인 토큰(`src/index.css`) 기반 스타일 관리

## 2) 구성 요소

### `BaseModal`

- 경로: `src/components/common/modal/BaseModal.jsx`
- 역할: MUI `Dialog` 기반 공통 모달 프레임
- 제공 기능:
  - 헤더 타이틀(좌측) + 닫기 버튼(우측)
  - 본문 스크롤 영역
  - 푸터 액션 영역(정렬 옵션: 좌/중/우)
  - 배경 클릭 닫기/ESC 닫기 제어
  - 사이즈(`maxWidth`) 및 fullWidth 제어

### `DialogProvider`, `useDialog`

- 경로: `src/context/DialogContext.jsx`, `src/hooks/useDialog.js`
- 역할: 전역 `alert/confirm/prompt` 서비스
- 사용 API:
  - `await alert(options | message)`
  - `const ok = await confirm(options | message)`
  - `const value = await prompt(options | message)` (`취소` 시 `null`)

## 3) 기본 설계 원칙

- 모달 구조는 `BaseModal`로 통일하고, 도메인 모달은 내부 폼만 담당
- 단순 안내/확인성 UI는 `useDialog` 우선 사용
- 위험 액션(삭제/초기화)은 `confirm({ tone: 'danger' })` 사용
- 스타일은 SCSS 모듈 중심(`*.module.scss`)으로 관리
- 간격/라운드/타이포는 토큰(`var(--spacing-*)`, `var(--radius-*)`, `--font-*`) 우선

## 4) 옵션 명세 (1차)

### `BaseModal` 주요 props

- `open`, `onClose`, `title`, `children`, `actions`
- `maxWidth`, `fullWidth`
- `disableBackdropClose`, `disableEscapeKeyDown`
- `showCloseButton`, `actionsAlign`

### `useDialog` 옵션

- 공통: `title`, `message`, `confirmText`, `cancelText`
- 제어: `disableBackdropClose`, `disableEscapeKeyDown`
- confirm 전용: `tone` (`primary` | `danger`)
- prompt 전용: `defaultValue`, `placeholder`, `validator`

## 5) 권장 사용 패턴

- 화면 컴포넌트
  - CRUD 성공/실패 안내: `alert`
  - 삭제/중요 변경: `confirm`
  - 간단 텍스트 입력: `prompt`
- 대형 폼 모달
  - `BaseModal`을 래핑한 도메인 모달 컴포넌트로 분리
  - 제출/취소/검증 로직만 페이지에 남김

## 6) 후속 과제

- 기존 `AlertContext`와 `DialogContext` 통합 전략 확정
- 구형 CSS 모달(`position: fixed`)을 `BaseModal` 기반으로 단계적 전환
- 포커스 트랩/접근성(aria) 점검 체크리스트 추가

# Modal Guide (모달 가이드)

팝업·다이얼로그 작업용 **단일 문서**.  
전체 UI 가이드는 [`kl-ui-guide.md`](./kl-ui-guide.md) — 모달만 볼 때는 **본 파일**만 읽으면 됩니다.

> **일괄 이관:** **`.cursor/rules/handoff-modal-ui-rollout.mdc`** — 전 메뉴·**`NotebookDetail` 포함** `BaseModal` 마크업·클래스 통일

**기준 코드**

- **마크업·푸터·폼 UX (단일 예시):** `src/components/ReportGenerationModal.{jsx,css}` — 노트북 **페르소나 관리** 팝업
- **Paper 숫자:** `src/components/common/modal/klModalPaper.js`
- **Form 본문 class·id:** `src/components/common/modal/klModalForm.js` (페이지별 `*-create-form` 금지)
- **껍데기:** `src/components/common/modal/BaseModal.{jsx,module.scss}`
- Decision: `DialogContext` · `useDialog.js`
- 스타일: `kl-modal-form.css` · `kl-layout-modal.css` (`kl-global.css`)

---

## 1. 핵심 원칙

- 모달 **껍데기**는 `BaseModal`로 통일한다.
- 단순 안내·확인·짧은 입력 → **`useDialog()`** (`alert` / `confirm` / `prompt`).
- 생성·수정·조회·대형 폼 → JSX **`<BaseModal …>`**.
- 헤더(타이틀) 규격은 하단 버튼 유무와 **무관하게 동일**.
- 화면별 CSS는 **도메인 콘텐츠 레이아웃만** — 버튼·헤더 기본 톤은 공통 규격.
- 간격·색·라운드는 **`var(--spacing-*)`**, **`var(--color-*)`**, **`var(--radius-sm)`** 등 토큰 우선.

---

## 2. 두 가지 모달

| | **① 일반 팝업** | **② Decision** |
|:--|:--|:--|
| **용도** | 생성·수정·조회·대형 폼 | 안내·확인·짧은 입력 |
| **호출** | JSX `<BaseModal …>` | `useDialog()` |
| **닫기 X** | 기본 표시 | `alert`·`confirm` 숨김 · `prompt`는 표시 |
| **하단 버튼** | `actions` prop | `DialogContext`가 조립 |
| **정렬** | 기본 좌(타이틀) / 우(액션) | 제목·본문·버튼 **가운데** |

### 2.1 일반 팝업 타입

| 타입 | 레이아웃 | 하단 버튼 |
|:--|:--|:--|
| **Form** | Header · Content · **Footer(actions)** | 취소 Outlined + 저장/확인 Contained (삭제는 필요 시 좌측) |
| **No-Footer** | Header · Content | 없음 (`actions` 미전달) |

- 업로드·부가 행동 → **본문 우상단** / 하단에는 취소·저장만.
- 카드 크기 → **`klModalPaper.js`의 `paperSx`** + 필요 시 `maxWidth={false}` · `fullWidth={false}` (Form 550·상세 670 등 숫자는 SSOT 한곳).

### 2.2 Decision (`alert` / `confirm` / `prompt`)

| 종류 | 버튼 | 비고 |
|:--|:--|:--|
| **alert** | 확인만 | |
| **confirm** | 취소 + 확인 | `tone: 'danger'` (삭제 등) |
| **prompt** | 취소 + 확인 | 본문 입력 · `contentClassName`에 `kl-modal-form` |

- 취소 Outlined(회색) · 확인 Contained · **취소에 파란 Contained 금지**.
- Decision 버튼 **`min-width: 100px`** (Form contained **150px**와 구분).

### 2.3 Promo shell (요금제 등 마케팅·선택형)

업무 Form 팝업과 **의도적으로 다른 쉘**을 쓰는 경우. `BaseModal` 필수 아님.

| | **Work shell** (`BaseModal`) | **Promo shell** (예: `UpgradeModal`) |
|:--|:--|:--|
| **용도** | 생성·수정·조회·업무 폼 | 플랜 선택·신청·온보딩 등 |
| **껍데기** | MUI `Dialog` + `BaseModal` | 커스텀 오버레이·카드 (step 슬라이드·폭 애니메이션 가능) |
| **제목** | 좌측 정렬 + 헤더 하단 라인 | **가운데 정렬 가능**, 라인 없음 |
| **닫기 X** | MUI `IconButton` + `CloseIcon` | **`KlModalClose`** (`kl-modal-close`) |
| **본문 폼** | `kl-modal-form` | 페이지 전용 클래스 (요금제: `upgrade-form-*`) |

**닫기 버튼 — Work·Promo 공통 affordance (SSOT)**

| 항목 | 규격 |
|------|------|
| 컴포넌트 | `src/components/common/KlModalClose.jsx` |
| CSS | `patterns/kl-modal-close.css` (`kl-global.css` 로드) |
| 클래스 | `kl-modal-close` |
| 아이콘 | lucide `X` 18px · `aria-label="닫기"` |
| 크기 | `var(--kl-control-height)` 정사각 |
| 색 | 기본 `--color-text-secondary` · hover `--color-bg-hover` + `--color-text-primary` |
| 포커스 | `--shadow-focus-input` |
| 금지 | 텍스트 `×` 단독 · 페이지별 `*-modal-close` 색·hover 임의 정의 |

- Promo 헤더에서 닫기 **위치만** 쉘별로 조정 가능 (예: `upgrade-modal-header__close` — absolute 우측).
- Work shell `BaseModal` 닫기는 당분간 MUI 유지. 이관 시 `KlModalClose`로 통일 검토.

**참조 구현:** `src/components/UpgradeModal.{jsx,css}`

---

## 3. 레이아웃 규격 (Work shell · 고정)

| 영역 | 규격 |
|------|------|
| 헤더 | `16px 24px`, 제목 좌 + 닫기 우, 하단 라인 1px |
| 콘텐츠 기본 패딩 | `24px 32px` |
| 하단 액션 패딩 | `24px 24px` |
| 섹션 간격 | `16px` (`--spacing-md`) |
| 버튼 radius | `4px` (`--radius-sm`) |
| 버튼 패딩 | `4px 16px` — 글자 `--font-size-base`(14px) |

---

## 4. `BaseModal` — prop · SCSS

| 화면 | prop | SCSS (`BaseModal.module.scss`) |
|:--|:--|:--|
| 카드 | `paperClassName` `paperSx` | `.dialogPaper` |
| 헤더 | `title` `subtitle` `headerAlign` `headerClassName` | `.header` `.headerCenter` |
| 본문 | `contentClassName` `children` | `.content` `.contentInner` |
| **하단 버튼** | **`actions`** (`kl-modal-actions-split`) | **`.actions`** · `kl-layout-modal.css` |

**`useDialog` API (요약)**

- `await alert(message | options)`
- `const ok = await confirm(message | options)` — `tone: 'danger'`
- `const value = await prompt(message | options)` — 취소 시 `null`

Decision 전용 스타일 → `DialogContext.module.scss` (`.decisionPaper`, `.decisionHeader`, `.decisionActions` …).

**스크롤:** Paper `display: flex` / `flexDirection: column`, 본문 `flex: 1` · `minHeight: 0` · `overflow: auto`.  
본문 스크롤바 → `patterns/kl-scrollbar-thin.css` · `.kl-base-modal-content`.

---

## 5. 팝업 본문 폼 (`kl-modal-form`)

**적용:** `BaseModal` **콘텐츠**만. 페이지 본문·테이블 셀 dense UI는 범위 밖.  
Decision 중 **prompt**만 본문에 폼 클래스 추가.

### 5.1 적용 방법

```jsx
import {
  KL_MODAL_FORM_ELEMENT_ID,
  KL_MODAL_FORM_STACK_CLASS,
  klModalFormContentClassName,
} from '.../common/modal/klModalForm';

<BaseModal contentClassName={klModalFormContentClassName} ...>
  <form
    id={KL_MODAL_FORM_ELEMENT_ID}
    className={KL_MODAL_FORM_STACK_CLASS}
    onSubmit={handleSubmit}
  >
    ...
  </form>
</BaseModal>
```

**고객센터 등록·수정 Form** — `notice-create-form` · `faq-create-form` · `qna-create-form` 등 **페이지별 `<form>` id/class 사용 금지**. 위 상수만 쓴다. (동시에 모달 1개만 열리므로 `id="kl-modal-form"` 공유 가능.)

필드 블록:

- **`ModalFormField`** 권장 — `label`, `children`, `helperText`, `required`, `error`
- 수동 — `kl-modal-form-field` 등, **반드시 `.kl-modal-form` 조상 안**

### 5.2 클래스

| 클래스 | 역할 |
|--------|------|
| `kl-modal-form` | 콘텐츠 루트 — 여기서만 폼 컨트롤 규격 활성 (`klModalFormContentClassName`) |
| `kl-modal-form-stack` | `<form>` 세로 스택 — row·content-field 간 `gap` (`KL_MODAL_FORM_STACK_CLASS`) |
| `kl-modal-form` (id) | `<form id="kl-modal-form">` — 푸터 `form` 속성 연결 (`KL_MODAL_FORM_ELEMENT_ID`) |
| `kl-modal-form-row` | 라벨(좌)·컨트롤(우) 한 줄, 라벨 top — `kl-layout-modal.css` |
| `kl-modal-form-field-stack` | 라벨 위·컨트롤 아래 (긴 textarea 등) |
| `kl-modal-form-field` | 라벨·컨트롤·보조문 세로 스택 (레거시·ModalFormField) |
| `kl-modal-form-label` | 필드 라벨 |
| `kl-modal-form-control` | 컨트롤 래퍼 `width: 100%` |
| `kl-modal-form-helper` | 보조 문구 (컨트롤 열 내 입력 하단) |
| `kl-modal-form-helper--legal` | 법적·긴 안내 (`font-size-xs`) |
| `kl-modal-form-inline-controls` | row 컨트롤 열 — 좁은 숫자 입력 + 체크박스 가로 (`__field` 자식) |
| `kl-modal-form-check` | 체크박스 라벨 (활성화 등, `font-size-sm`) |
| `kl-modal-form-check--emphasis` | 체크박스 라벨 강조 (동의 제목, `font-size-base`) |
| `kl-modal-form-control--warning` | 경고 테두리·빨간 글자, 배경은 일반 컨트롤과 동일 (`KL_MODAL_FORM_CONTROL_WARNING_CLASS`, 청킹 NONE 등) |

**금지:** `faq-order-*`, `faq-active-*`, `qna-privacy-consent` 등 **메뉴·도메인 접두 클래스** — 위 전역 클래스·`klModalForm.js` 상수만 사용.

### 5.3 토큰·리듬

| 항목 | 값 |
|------|-----|
| 모서리 | `--radius-sm` (4px) |
| 테두리 | `1px solid var(--color-border)` |
| 포커스 | `var(--color-accent)` + `var(--shadow-focus-input)` |
| input/textarea 패딩 | `calc(var(--spacing-sm) + var(--spacing-xs))` `14px` |
| 필드 블록 간격 (`kl-modal-form-stack` gap) | `--spacing-sm` (8px) |
| 라벨↔컨트롤 | `--spacing-sm` |

**유지보수:** `kit/kl-modal-form.css` + `legacy/kl-legacy-modal.css` (`.modal-native-field`, `.modal-input`) **함께** 본다.

### 5.4 MUI · select

- MUI `TextField` / `Select` / `Checkbox` — `.kl-modal-form` 안 Outlined 기준, 페이지 `sx`로 테두리 덮어쓰기 지양.
- **네이티브 `<select>` 지양** → **`KlModalSelect`** (`kl-modal-select-menu-paper`).

---

## 6. 예외 · DoD

**허용 예외**

- `headerClassName` / `contentClassName` / `actionsClassName` — **간격 보정만**
- `paperSx` — Paper 가로·세로·`maxHeight`
- 색·버튼 상태 공통 규칙 깨는 오버라이드 **금지** — 필요 시 본 문서에 항목 추가 후 적용

**완료 기준 (DoD)**

- 동일 타입끼리 헤더·본문·액션 간격 동일
- 버튼 hover/active/disabled 동일
- 신규 모달은 타입(Form / No-Footer / Decision)을 정하고 시작

**우선 관리 팝업 (예)**

| 팝업 | 타입 |
|------|------|
| 워크스페이스 삭제 확인 | Decision |
| 페르소나 목록 | No-Footer |
| 페르소나 편집 | Form |
| 소스 추가 | No-Footer |
| 용어사전 | Form |
| 요금제·플랜 선택 | **Promo** (`UpgradeModal` — §2.3) |

---

## 7. 마이그레이션 현황 (참고)

| 단계 | 내용 | 상태 |
|------|------|------|
| Phase 1 | `BaseModal`, `DialogProvider`, `useDialog` | ✅ |
| Phase 2 | 삭제·안내 → `useDialog` | 진행 중 |
| Phase 3 | 작성 모달 `BaseModal` + `kl-modal-form` | 진행 중 |
| Phase 4 | 대형 모달·a11y | 예정 |

**리스크:** `AlertContext`와 `DialogContext` 이중 운영 → 어댑터·단일화는 별도 합의.

---

## 8. CSS · 파일 위치

| 수정 목적 | 파일 |
|-----------|------|
| 모달 카드·헤더·본문·액션 패딩 | `BaseModal.module.scss` |
| Decision 레이아웃 | `DialogContext.module.scss` |
| 팝업 안 input/select/MUI | `styles/kit/kl-modal-form.css` |
| 모달 필드 행·라벨 shell | `styles/layout/kl-layout-modal.css` |
| **모달 닫기 (Promo·공통)** | `patterns/kl-modal-close.css` · `components/common/KlModalClose.jsx` |
| 레거시 `.modal-overlay` 등 | `styles/legacy/kl-legacy-modal.css` |

**신규·수정 모달** — 상세 점검은 **§9 공통 팝업 구성 체크리스트** 를 따른다.

---

## 9. 공통 팝업 구성 체크리스트

팝업 1건을 추가·수정·리뷰할 때 **아래를 순서대로 확인**한다.

### 9.0 작업 중 전역화 질문 (에이전트·개발 공통)

메뉴 단위로 팝업을 손볼 때, 지시 범위 안에서 **아직 전역이 아닌 class·CSS**(`faq-*`, `notice-*`, `*-create-form`, 페이지 전용 form-row CSS, MUI 푸터 등)가 보이면 **구현 전에** 사용자에게 질문한다.  
「전역 `kl-*`로 올릴지 / 이번 메뉴만 둘지」를 정한 뒤 진행한다. 보이는 대로만 수정하면 이후 수정 범위가 커진다.  
→ `.cursor/rules/handoff-modal-ui-rollout.mdc` §4.1

### `ReportGenerationModal` 이란?

| 항목 | 내용 |
|------|------|
| **화면** | 노트북 상세(`NotebookDetail`)에서 여는 **「페르소나 관리」** 팝업 |
| **파일** | `src/components/ReportGenerationModal.jsx` (+ `.css`) |
| **타입** | `BaseModal` **Form** — 목록 뷰 / 편집 뷰 전환, `kl-modal-form` · `kl-modal-actions-split` · `kl-btn` |
| **역할** | 공통 팝업 **마크업·푸터·폼 UX의 단일 참조 예시** (이름은 레거시이나 모달 가이드상 **유일한 복사 기준**) |

고객센터·어드민 등 **다른 모달을 “참조 파일”로 나열하지 않는다.** 이관이 끝나면 모두 위 패턴과 **동일**해야 하고, 어긋나면 **대상 모달이 잘못된 것**이다.

**예외(숫자만):** 페르소나 편집은 Paper **`maxWidth="md"`** (550 Form 기본과 다름) — 폭은 `klModalPaper.js`·§9.2 표를 따르고, **DOM·클래스·푸터 구조**는 여전히 `ReportGenerationModal`과 같다.

### 9.1 진입·범위

- [ ] **껍데기**는 `BaseModal` (앱 전역·**`NotebookDetail` 포함**, MUI `Dialog` 직접 사용 금지)
- [ ] 단순 alert/confirm/prompt → **`useDialog()`** (Form·상세 팝업과 혼용하지 않음)
- [ ] 전역 스타일은 `main.jsx` → **`kl-global.css` 한 줄**만 (모달 토큰·폼·`kl-layout-modal.css` 포함)
- [ ] **기능·API·라우트** 변경 없이 마크업·className·스타일만 손댄 경우에 한해 본 체크리스트 적용

### 9.2 Paper (카드 크기·클래스)

**SSOT:** `src/components/common/modal/klModalPaper.js`

| 용도 | `paperSx` | `paperClassName` |
|------|-----------|------------------|
| **Form 작성·수정** (기본) | **`klFormModalPaperSx`** (`width: 550`, `maxWidth: calc(100vw - 48px)`) | **불필요** (`BaseModal`이 `kl-base-modal-paper`만 부여) |
| **고객센터 상세** (공지·FAQ) | `supportDetailModalPaperSx` (670) | `supportDetailModalPaperClassName` (`cs-detail-modal-paper`) — **본문 레이아웃 CSS hook** |
| **1:1 상세** | `qnaDetailModalPaperSx` (670) | `qnaDetailModalPaperClassName` |
| **홈 프롬프트 등 예외 폭** | 해당 상수·`paperSx.width` | 필요 시만 페이지 hook |

- [ ] Form 팝업에 **`notice-form-modal-paper`**, **`kl-modal-paper-form-default`** 등 **화면 전용 Paper class / CSS 폭** 없음
- [ ] Form 550은 **`paperSx`만** — `paperSx`에 `width` 없이 `maxWidth`만 두지 않음 (뷰포트 축소 시 폭 깨짐 방지)
- [ ] 커스텀 폭 사용 시 **`maxWidth={false}`** · **`fullWidth={false}`** 와 `paperSx` 세트
- [ ] 페이지 CSS에 **모달 Paper `width` / `max-width` 하드코딩 없음**
- [ ] DevTools Paper: `kl-base-modal-paper` + MUI·CSS Module 클래스만 (동일 토큰 **중복 문자열**이 `class`에 두 번 들어가 있지 않은지)

### 9.3 헤더·본문

- [ ] `contentClassName` — Form 작성·수정: **`klModalFormContentClassName`** (`kl-modal-form kl-scrollbar-thin`)
- [ ] `<form>` — **`id={KL_MODAL_FORM_ELEMENT_ID}`** · **`className={KL_MODAL_FORM_STACK_CLASS}`** (페이지별 `*-create-form` 없음)
- [ ] 푸터 submit — **`form={KL_MODAL_FORM_ELEMENT_ID}`**
- [ ] 상세·도메인 본문: 페이지 hook만 (예: `cs-detail-modal-body`) — `*-create-modal-content` 금지
- [ ] 세로 필드 묶음: **`kl-modal-form-stack`** (상수 사용)
- [ ] 한 줄 라벨·입력: **`kl-modal-form-row`** · `__label` · `__control` (높은 컨트롤은 `kl-vert-start`)
- [ ] 제목+이미지 툴바+textarea: **`kl-modal-form-content-field`** · `kl-modal-form-toolbar`
- [ ] 긴 지시문·큰 textarea만 라벨 위: **`kl-modal-form-field-stack`**
- [ ] helper는 **컨트롤 열 안·입력 아래** (`kl-modal-form-helper`) — 라벨 열 아래 금지
- [ ] 조회 전용 값: **`kl-form-readonly kl-form-readonly--control`** + `readOnly` (`disabled`로 조회 UI 내지 않음)
- [ ] 모달 안 셀렉트: **`KlModalSelect`** (네이티브 `<select>` 지양)

### 9.4 하단 버튼 (푸터)

**규칙:** 버튼이 **한쪽에만** 있어도 마크업은 항상 **`kl-modal-actions-split`** 이다.

```jsx
<div className="kl-modal-actions-split">
  <div className="kl-modal-actions-split__left">{/* 없으면 aria-hidden 빈 div */}</div>
  <div className="kl-modal-actions-split__right">{/* 취소·저장·닫기 등 */}</div>
</div>
```

| 시나리오 | `__left` | `__right` |
|----------|----------|-----------|
| Form 등록·수정 | 빈 div (`aria-hidden`) | 취소 `gray-outline md` + 등록/저장 `primary-full md` |
| 상세 (공지·FAQ) | 이전글·다음글 `gray-outline md` | 닫기 `primary-full md` |
| 상세 (1:1, 좌측 없음) | 빈 div (`aria-hidden`) | 닫기 `primary-full md` |
| 상세 + 삭제 | 삭제 `danger-outline md` | 취소 + 저장 |
| 페르소나 편집 | 목록이동 `primary-outline md` (+ 삭제) | 저장 |

- [ ] **`actions` 안에 MUI `Button` 없음** — **`kl-btn`** variant만
- [ ] **`actionsAlign`만으로 오른쪽 정렬** (`flex-end` 페이지 CSS) **대체하지 않음**
- [ ] 고객센터 상세 푸터 보조 class: **`cs-detail-modal-actions`** (간격·이전/다음 버튼 톤, `CsDetailModal.css`)
- [ ] `kl-base-modal-actions:has(.kl-modal-actions-split)` 로 푸터 전체 너비 분할 적용되는지 (Elements에서 `kl-modal-actions-split` 존재)

### 9.5 스타일·토큰 금지

- [ ] Tailwind · MUI `sx`로 폼 테두리·Paper 폭 덮어쓰기 없음
- [ ] `:root` / `index.css`에 토큰 **무단 추가 없음** (필요 시 제안 → 컨펌)
- [ ] 공통 CSS에 **페이지별 고정 너비** (예: `width: 160px`) 추가 없음

### 9.6 완료 전 확인

- [ ] `cd react && npm run build` 통과
- [ ] 육안: Form **550px** · 상세 **670px** · 푸터 **좌/우 split** (1:1 상세 닫기만 있어도 split DOM)
- [ ] 타입별 헤더·본문 패딩·버튼 hover/disabled가 다른 Form·상세와 동일

### 9.7 참조 — 역할별 한 줄 (예시는 하나)

| 역할 | 어디만 보나 | 비고 |
|------|-------------|------|
| **마크업·푸터·폼 UX (단일 예시)** | **`ReportGenerationModal.jsx`** | 복사·diff 기준은 **이 파일만** |
| **Form `<form>` id·content class** | **`klModalForm.js`** | `kl-modal-form` / `kl-modal-form-stack` |
| **Paper 가로·세로 숫자** | `klModalPaper.js` | Form 550 · 상세 670 등 — JSX에 폭 하드코딩 금지 |
| **껍데기 prop** | `BaseModal.jsx` | API 확인용, 화면별 “참조 구현” 아님 |
| **공통 CSS** | `kl-layout-modal.css` · `kl-modal-form.css` · `kl-buttons.css` | 클래스 이름·규칙 정의 |
| **이관 절차** | `.cursor/rules/handoff-modal-ui-rollout.mdc` | |

`NoticeCreateModal` · `FaqDetailModal` 등은 **작업 대상**이지 참조 목록이 아니다. `BaseModal` grep으로 미이관 팝업만 찾는다.

---

## 변경 이력 (문서)

| 날짜 | 내용 |
|------|------|
| 2026-05-25 | §9 체크리스트 · `klModalForm.js` Form id/class 통일 · `klModalPaper` / `kl-modal-actions-split` |
| 2026-05-23 | `modal-spec`… 통합 · 인수인계 → `.cursor/rules/handoff-modal-ui-rollout.mdc` |

작업 일기는 [`ui-history2.md`](./ui-history2.md) (요청 시 갱신).

# Modal Guide (모달 가이드)

팝업·다이얼로그 작업용 **단일 문서**.  
전체 UI 가이드는 [`kl-ui-guide.md`](./kl-ui-guide.md) — 모달만 볼 때는 **본 파일**만 읽으면 됩니다.

**기준 코드**

- `src/components/common/modal/BaseModal.{jsx,module.scss}`
- `src/context/DialogContext.{jsx,module.scss}` · `src/hooks/useDialog.js`
- `src/components/common/modal/ModalFormField.jsx` · `KlModalSelect.jsx`
- 스타일: `src/assets/styles/kit/kl-modal-form.css` · `src/assets/styles/layout/kl-layout-modal.css` (`global.css` 로드)

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
- 카드 크기 → `paperSx` + 필요 시 `maxWidth={false}` · `fullWidth={false}`.

### 2.2 Decision (`alert` / `confirm` / `prompt`)

| 종류 | 버튼 | 비고 |
|:--|:--|:--|
| **alert** | 확인만 | |
| **confirm** | 취소 + 확인 | `tone: 'danger'` (삭제 등) |
| **prompt** | 취소 + 확인 | 본문 입력 · `contentClassName`에 `kl-modal-form` |

- 취소 Outlined(회색) · 확인 Contained · **취소에 파란 Contained 금지**.
- Decision 버튼 **`min-width: 100px`** (Form contained **150px**와 구분).

---

## 3. 레이아웃 규격 (고정)

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
| **하단 버튼** | **`actions`** `actionsAlign` | **`.actions`** `.actionsLeft` / `Center` / `Right` |

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
<BaseModal
  contentClassName="some-modal-content kl-modal-form"
  ...
>
```

필드 블록:

- **`ModalFormField`** 권장 — `label`, `children`, `helperText`, `required`, `error`
- 수동 — `kl-modal-form-field` 등, **반드시 `.kl-modal-form` 조상 안**

### 5.2 클래스

| 클래스 | 역할 |
|--------|------|
| `kl-modal-form` | 콘텐츠 루트 — 여기서만 폼 컨트롤 규격 활성 |
| `kl-modal-form-field` | 라벨·컨트롤·보조문 세로 스택 |
| `kl-modal-form-label` | 필드 라벨 |
| `kl-modal-form-control` | 컨트롤 래퍼 `width: 100%` |
| `kl-modal-form-helper` | 보조 문구 |
| `kl-modal-form-control--warning` | 경고 테두리·배경 |

### 5.3 토큰·리듬

| 항목 | 값 |
|------|-----|
| 모서리 | `--radius-sm` (4px) |
| 테두리 | `1px solid var(--color-border)` |
| 포커스 | `var(--color-accent)` + `var(--shadow-focus-input)` |
| input/textarea 패딩 | `calc(var(--spacing-sm) + var(--spacing-xs))` `14px` |
| 필드 블록 간격 | `--spacing-md` |
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
| 레거시 `.modal-overlay` 등 | `styles/legacy/kl-legacy-modal.css` |

**신규 모달 체크리스트**

1. 타입 선택 (Form / No-Footer / Decision)
2. Form이면 `contentClassName`에 **`kl-modal-form`**
3. 필드는 **`ModalFormField`** 또는 `kl-modal-form-*`
4. 셀렉트는 **`KlModalSelect`**
5. 도메인 전용 레이아웃만 해당 모달 `.css` / `.module.scss`에

---

## 변경 이력 (문서)

| 날짜 | 내용 |
|------|------|
| 2026-05-23 | `modal-spec`, `modal-form-spec`, `modal-architecture`, `modal-migration-plan` → 본 파일로 통합 |

작업 일기는 [`ui-history2.md`](./ui-history2.md) (요청 시 갱신).

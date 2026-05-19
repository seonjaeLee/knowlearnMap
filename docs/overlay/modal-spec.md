# Modal Spec

<div style="font-size:12px;line-height:1.45">

**기준 코드** · `src/components/common/modal/BaseModal.{jsx,module.scss}` · Decision은 `src/context/DialogContext.{jsx,module.scss}` 가 `BaseModal`에 클래스를 추가.

---

## I. 운영 (기능·타입)

### 1. 두 가지 모달

| | **① 일반 팝업** | **② Decision** |
|:--|:--|:--|
| **용도** | 생성·수정·조회·대형 폼 | 안내·확인·짧은 입력 |
| **호출** | JSX `<BaseModal …>` | `useDialog()` → `alert` / `confirm` / `prompt` |
| **닫기 X** | 기본 표시 | `alert`·`confirm` 숨김 · `prompt`는 표시 |
| **하단 버튼** | `actions` prop으로 전달 | `DialogContext`가 버튼 조립 |
| **일괄 UI 정리** | Form / No-Footer 대상 | 범위 밖(별도 규칙) |

### 2. ① 일반 팝업 (`BaseModal`)

| 타입 | 레이아웃 | 하단 버튼 |
|:--|:--|:--|
| **Form** | Header · Content · **하단 버튼영역** | 취소 Outlined + 저장/확인 Contained (삭제는 필요 시 좌측) |
| **No-Footer** | Header · Content | 없음 (`actions` 미전달) |

- 업로드·부가 행동 → **본문 우상단** / 하단에는 취소·저장만.
- 카드 크기 → `paperSx` + 필요 시 `maxWidth={false}`.
- 입력 폼 상세 → [`modal-form-spec.md`](./modal-form-spec.md) (`contentClassName`에 `kl-modal-form`).

### 3. ② Decision (`alert` / `confirm` / `prompt`)

| 종류 | 버튼 | 비고 |
|:--|:--|:--|
| **alert** | 확인만 | 취소 없음 |
| **confirm** | 취소 + 확인 | `tone: 'danger'`(삭제 등) |
| **prompt** | 취소 + 확인 | 본문에 입력 필드 · `kl-modal-form` |

- 제목·본문·하단 버튼 **가운데 정렬** (`headerAlign` / `actionsAlign` center).
- 취소는 Outlined(회색 톤) · 확인은 Contained · 취소에 파란 Contained 금지.
- 버튼 `min-width: 100px` (일반 Form contained 150px와 구분).

---

## II. 구조·클래스 (수정할 때)

> DevTools `_header_xxxx` = CSS Modules 해시 → **아래 SCSS 이름**으로 검색.  
> `kl-base-modal-*` = JSX 전용 문자열(**SCSS 파일에 없음**). 검사기·타 CSS 덮기용.

**MUI 이름 ↔ 화면** · `DialogTitle` 헤더 · `DialogContent` 본문 · **`DialogActions` = 하단 버튼영역** (prop `actions`, SCSS `.actions` — `footer` 클래스 없음)

### 4. ① `BaseModal` — 영역 · prop · 클래스

| # | 화면 영역 | MUI | prop | SCSS | 전역(검사기) |
|:--|:--|:--|:--|:--|:--|
| 1 | 배경 딤 | Backdrop | — | `.backdrop` | `kl-base-modal-backdrop` |
| 2 | 카드 | Paper | `paperClassName` `paperSx` | `.dialogPaper` | `kl-base-modal-paper` |
| 3 | 헤더(타이틀바) | DialogTitle | `title` `subtitle` `headerAlign` `headerVariant` `headerClassName` | `.header` `.headerCenter` `.headerFilled` | `kl-base-modal-header` |
| 4 | 제목 줄 | div | — | `.titleRow` `.titleRowCenter` | `kl-base-modal-title-row` |
| 5 | 제목 글자 | Typography h2 | `titleClassName` | `.title` | — |
| 6 | 부제 | Typography p | `subtitle` | `.subtitle` | — |
| 7 | 닫기 X | IconButton | `showCloseButton` | `.closeButton` | — |
| 8 | 본문 | DialogContent | `contentClassName` | `.content` | `kl-base-modal-content` |
| 9 | 본문 안 | Box | `children` | `.contentInner` | `kl-base-modal-content-inner` |
| 10 | **하단 버튼영역** | **DialogActions** | **`actions`** `actionsAlign` `actionsClassName` | **`.actions`** `.actionsLeft` `.actionsCenter` `.actionsRight` | **`kl-base-modal-actions`** |

`actionsAlign` · `right`→`.actionsRight` · `center`→`.actionsCenter` · `left`→`.actionsLeft`

**패딩·버튼 색** · `BaseModal.module.scss` — `.header` `.content` `.actions` 및 `.actions :global(.MuiButton`  
**스크롤바** · `src/styles/kl-scrollbar-thin.css` → `.kl-base-modal-content`

### 5. ② Decision — `BaseModal` 위 추가 클래스

`DialogContext.jsx`가 prop으로 넘김 · 스타일 `DialogContext.module.scss`

| # | 화면 영역 | prop | SCSS | 비고 |
|:--|:--|:--|:--|:--|
| 1 | 카드 | `paperClassName` | `.decisionPaper` | min-width 350px 등 |
| 2 | 헤더 | `headerClassName` | `.decisionHeader` | 하단 선 없음 |
| 3 | 본문 | `contentClassName` | `.decisionContent` | 중앙 정렬 · prompt 시 +`kl-modal-form` |
| 4 | 하단 버튼 | `actionsClassName` | `.decisionActions` | Base `.actions` + min-width 100px |
| 5 | 메시지 | (children) | `.message` `.decisionMessage` | |
| 6 | prompt 입력 | — | `.promptInput` | |
| 7 | confirm 취소색 | Button className | `.decisionCancelButton` | |

**검색** · 일반 하단 패딩 → `BaseModal` **`.actions`** · Decision 전용 → **`.decisionActions`** · alert/confirm 헤더 → **`.decisionHeader`**

### 6. 빠른 검색

| 바꿀 것 | 파일 | 검색어 |
|:--|:--|:--|
| 타이틀바 패딩·선 | `BaseModal.module.scss` | `.header` |
| 제목 타이포 | ↑ | `.title` |
| 본문 패딩 | ↑ | `.content` |
| 하단 버튼영역 | ↑ | `.actions` |
| Decision 레이아웃 | `DialogContext.module.scss` | `.decision` |

---

<details>
<summary style="font-size:12px">부록 — 예외 · DoD · 관리 목록</summary>

**예외** · `headerClassName` / `contentClassName` / `actionsClassName` → 간격 보정만 · 색·버튼 상태 공통 규칙 깨기 금지 · 예외는 여기에 기록 후 적용.

**DoD** · 동일 타입끼리 헤더·본문·하단 간격 동일 · 버튼 상태 동일.

**우선 관리 팝업** · 워크스페이스 삭제→Decision · 페르소나 목록→No-Footer · 페르소나 편집→Form · 소스 추가→No-Footer · 용어사전→Form.

**폼 컨트롤** · [`modal-form-spec.md`](./modal-form-spec.md)

</details>

</div>

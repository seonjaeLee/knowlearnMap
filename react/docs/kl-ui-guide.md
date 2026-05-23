# KnowLearn UI 설계·사용 가이드 (`kl-ui-guide`)

**단일 설계·사용 가이드.** 파일 안내는 **README**만 본다. 작업 일기는 [ui-history2.md](./ui-history2.md)(요청 시 갱신) · [ui-history.md](./ui-history.md)(아카이브, remote 배포 제외 권장).

**코드 변경:** 규칙에 맞게 **이관**한다. 레거시를 유지하려 새 클래스·문서를 병렬로 만들지 않는다. **구현·대규모 수정 전 사용자 논의·컨펌** (`.cursor/rules/workflow-confirm-before-implement.mdc`).

**통합:** 2026-05-23 — 기존 `design-tokens`, `list-page-spec`, `modal-spec`, `dev-guide-table-ui` 등 분산 spec을 본 파일로 합침. 삭제된 개별 `.md` 링크는 **Part 번호** 또는 본 파일 내 검색으로 대체.

---

## 목차

- [Part 0 · 읽는 법·원칙](#part-0--읽는-법원칙)
- [Part 1 · CSS 구조 (목표·현행)](#part-1--css-구조-목표현행)
- [Part 2 · Variables · 토큰](#part-2--variables--토큰)
- [Part 3 · Layout · 앱·페이지](#part-3--layout--앱페이지)
- [Part 4 · Forms · 폼 요소](#part-4--forms--폼-요소)
- [Part 5 · Buttons · 버튼](#part-5--buttons--버튼)
- [Part 6 · Modal · 모달 레이아웃](#part-6--modal--모달-레이아웃)
- [Part 7 · 목록·툴바](#part-7--목록툴바)
- [Part 8 · Table · 데이터 표](#part-8--table--데이터-표)
- [Part 9 · Tooltip · Popover](#part-9--tooltip--popover)
- [Part 10 · 이관·표준 레지스트리](#part-10--이관표준-레지스트리)
- [Part 11 · 파일럿·백로그](#part-11--파일럿백로그)
- [부록 A · Split pane](#부록-a--split-pane)
- [부록 B · 목업](#부록-b--목업)

---

## Part 0 · 읽는 법·원칙

| 원칙 | 설명 |
|------|------|
| **카테고리별 CSS** | variables, reset-common, layout, **forms**, **buttons** — 부트스트랩처럼 역할로 나눈다. |
| **모달 = 레이아웃** | `kl-modal` / `BaseModal`은 껍데기. 안의 input·button·select는 **본문과 동일** `kl-input` / `kl-btn` 조합. |
| **조합만 다름** | `<form>`, `.table-toolbar`, 모달 본문은 **같은 컨트롤 클래스**, 부모 레이아웃만 다름. |
| **클래스 조합** | `kl-btn` + `primary-full` + `md` + `icon-only` — `kl-btn--outline-primary`, `kl-toolbar-icon-toggle` 등 **장소별·긴 BEM 신규 금지**. |
| **이관 후 삭제** | 별칭은 이관 기간만. 사용처 0이면 클래스·중복 문서 삭제. |
| **논의 후 구현** | 규칙에 어긋나면 **규칙에 맞게 수정**(아이덴티티는 variant·토큰으로 유지). |

**문서 우선순위:** 본 가이드 > `ui-history` 과거 문구. spec 충돌 시 **본 파일 Part 0~11** 기준.

### Map 마더 · 멀티 사이트 (확장)

| 항목 | Map (지금) | 다른 사이트 (나중) |
|------|------------|-------------------|
| UI 키트 | `styles/` 에서 정의·수정 | Map과 동일 파일 공유 (vendor/패키지) |
| 구조 토큰 | `kl-tokens-core.css` | 동일 |
| 브랜드 색 | `kl-tokens-theme-map.css` | `kl-tokens-theme-*.css` 또는 `exp-style.css` 등 **한 파일** |
| 전역 진입 | **`styles/global.css`** | 동일 키트 + 자기 theme/overlay만 추가 |
| `index.css` | 토큰·kl 본문 **금지** | 동일 |

에이전트 규칙: `.cursor/rules/kl-css-architecture.mdc`

---

## Part 1 · CSS 구조 (목표·현행)

### 1.1 목표 (`src/assets/styles/`)

| 파일 (목표) | 담는 것 |
|-------------|---------|
| **variables** | `:root` 색·간격·`--kl-control-*` |
| **reset-common** | 리셋·box-sizing·공통 typography |
| **layout** | `kl-page`, `kl-modal` shell, `table-toolbar` **레이아웃만** |
| **forms** | `kl-input`, `kl-select`, textarea, check, radio, label, field row |
| **buttons** | **전부** `kl-btn` (+ variant, size, icon-only) |

import 순서 권장: variables → reset-common → layout → forms → buttons.

### 1.2 현행 (`main.jsx` → `styles/global.css` 한 줄)

진입 파일 이름은 **`global.css`** (역할: 예전 제안의 `main.css`와 동일). `main.jsx`는 이 파일만 import.

| 순서 | 파일 | 역할 |
|------|------|------|
| 1 | `kl-tokens-core.css` | spacing, radius, typography, transition, 컨트롤 치수 |
| 1 | `kl-tokens-theme-map.css` | Map 브랜드 semantic 색·그림자 |
| 1 | `kl-variables.css` | `--kl-control-*` |
| 2 | `kl-reset-common.css` | 리셋·`body`·말줄임 |
| 3 | `kl-layout-page.css` | → `KlPage.css`, `TableArea.css` |
| 3 | `kl-layout-toolbar.css` | `table-toolbar`, `toolbar-bundle` 레이아웃 |
| 3 | `kl-layout-modal.css` | `kl-modal-form` 필드 행·라벨 |
| 4 | `kl-forms.css` | `kl-input` / select |
| 4 | `kl-form-readonly.css` | 읽기 전용 |
| 4 | `kl-modal-form.css` | 모달 MUI·네이티브 오버라이드 |
| 5 | `kl-buttons.css` | `kl-btn` variant·size |
| 6 | `kl-scrollbar-thin.css` 등 | 패턴 4종 |
| 7 | `BasicTable.global.css` | 행 hover·`.basic-table-footer-summary`·레거시 `basic-table-page-*` |
| 8 | `kl-legacy-modal.css` | 레거시 네이티브 모달 |

`PageHeader.css` — `PageHeader.jsx`만. `App.css`, `admin-common.css`, 페이지·모달 CSS — 각 jsx.

스텁: `kl-form-control.css`, `kl-input.css` → `kl-forms.css` · `TableToolbar.css` → `kl-layout-toolbar.css` · `kl-ui.css` / `index.css` → `global.css` 위임.

### 1.3 전역 CSS 인벤토리 (2026-05-23 확정)

| 구분 | 파일 | 로드 |
|------|------|------|
| **전역** | 위 §1.2 표 전체 | `global.css` |
| **컴포넌트** | `PageHeader.css` | `PageHeader.jsx` |
| **페이지·영역** | `App.css`, `admin-common.css`, `*Page.css` | 해당 jsx |

**목록 하단(푸터·페이지네이션) 규칙**

- **스타일:** `BasicTableFooter` + `BasicTablePaginationNav` — 스타일 본문은 `BasicTable.module.scss` (`.pageBtn` 등). `BasicTable.global.css`는 행·요약 문자열·레거시 문자열 클래스용.
- **마크업:** `table-area` > `table-toolbar` + `basic-table-shell` + `BasicTableFooter`(직계 `div`). `TableArea.css`가 shell·푸터를 한 카드로 연결.
- **데이터 0건:** 푸터·페이지네이션 **렌더 생략** 권장(회원 관리 `SHOW_MEMBER_TABLE_FOOTER` 패턴). 빈 표만 두고 하단에 「이전 1 다음」만 두지 않음.
- **페이지네이션:** 신규는 **`BasicTablePaginationNav`만** — `basic-table-page-btn` 문자열 마크업 신규 금지.

### 1.4 스텁·deprecated 파일 (2026-05-23)

| 파일 | 상태 | 직접 `import` |
|------|------|---------------|
| `kl-form-control.css`, `kl-input.css` | `@import './kl-forms.css'` 스텁 | **없음** |
| `TableToolbar.css` | `@import kl-layout-toolbar.css` 스텁 | **jsx 없음** — 툴바는 `global.css` → `kl-layout-toolbar.css` |
| `kl-ui.css`, `index.css` | `global.css` 위임만 | Vite·레거시 경로 |

### 1.5 레거시 모달·폼 이관 메모 (jsx className 변경 **전**)

| 항목 | 현황 | 다음 단계 |
|------|------|-----------|
| `.modal-native-field` | `kl-legacy-modal.css`만 정의, **jsx 사용처 0** | 삭제는 별도 합의 |
| `.modal-overlay` | `LoginModal`, `SlideCreationModal` | BaseModal·`kl-layout-modal` 이관은 **Part 11 · B** |
| `.modal-input` | `kl-modal-form.css`·`DomainManagement` 일부 | 손댈 화면만 `kl-input` / `kl-modal-form` 통일 |
| `kl-modal-form` vs `kl-input` | 모달=`.kl-modal-form` 후손, 툴바=`kl-input` | 의도적 분기; `--kl-control-*` 공유 |
| `kl-form-control` 클래스 | `EditPromptDialog` 등 잔존 | 손댈 때 `kl-input gray-outline md` (**Part 11 · B**) |

---




## Part 2 · Variables · 토큰

프로젝트에서 **색·간격·비활성 상태** 등을 맞추기 위한 규칙입니다.  
실제 값의 **단일 소스**는 `src/assets/styles/kl-tokens-core.css` · `kl-tokens-theme-map.css` · `kl-variables.css` 입니다. 이 문서는 **이름 규칙·언제 쓸지·예시**만 정리합니다.

---

## 1. 원칙

| 원칙 | 설명 |
|------|------|
| **SSOT** | 새로 쓰는 색/간격은 가급적 `:root` 변수로만 정의하고, 컴포넌트 CSS에서는 `var(--이름)`으로 참조한다. |
| **하드코딩 `#hex`는 예외** | 일회성·장식이 아니라면 **같은 의미**(테두리, 본문 텍스트, 비활성 배경 등)는 변수로 통일한다. |
| **전역 셀렉터는 신중히** | `input:disabled { ... }`처럼 **모든** 입력에 한꺼번에 스타일을 주면, 관리자·모달·서드파티 UI와 충돌할 수 있다. **필요한 컴포넌트에 클래스 + `var()`**를 권장한다. |
| **MUI와 공존** | MUI 컴포넌트는 `theme`/`sx`가 우선될 수 있다. **순수 HTML + CSS 모듈** 화면부터 토큰 적용을 늘려간다. |

---

## 2. 네이밍 규칙 (`:root`)

접두사로 **용도**를 구분한다.

| 접두사 / 패턴 | 용도 | 예시 |
|----------------|------|------|
| `--color-*` | 배경·텍스트·강조·경계 등 **일반 색** | `--color-text-primary`, `--color-border` |
| `--form-control-disabled-*` | `input` / `textarea` / `select` **비활성** (배경·테두리·글자·placeholder) | `--form-control-disabled-bg` |
| `--btn-disabled-*` | **버튼** 비활성(회색 주 버튼 등) | `--btn-disabled-bg`, `--btn-disabled-text` |
| `--control-pill-*` | **채우기형** 토글·세그먼트(active 시 배경 채움) | `--control-pill-active-bg`, `--control-pill-active-text`, `--control-pill-active-hover-bg` |
| `--spacing-*` | 여백·간격 | `--spacing-sm` |
| `--radius-*` | 모서리 반경 | `--radius-sm` |
| `--font-*` | 글꼴·크기·굵기 | `--font-size-xs`, `--font-weight-medium` |
| `--shadow-*` | 그림자 | `--shadow-small` |
| `--transition-*` | 전환 | `--transition-fast` |

새 변수 추가 시:

1. **의미**가 겹치면 기존 이름 재사용, 아니면 위 패턴으로 이름을 짓는다.  
2. 해당 토큰 파일(`kl-tokens-core.css` / `kl-tokens-theme-map.css`)에 주석 한 줄(한국어 가능).  
3. 이 파일 표에 한 줄 추가(선택, 큰 변경만).

---

## 3. 비활성(disabled) 토큰 (현재 정의)

`kl-tokens-theme-map.css`에 다음이 있다. **폼 컨트롤**과 **주요 액션 버튼**을 구분한다.

| 변수 | 용도 |
|------|------|
| `--form-control-disabled-bg` | 비활성 입력 칸 배경 |
| `--form-control-disabled-border` | 비활성 입력 테두리 |
| `--form-control-disabled-text` | 비활성 입력에 입력된 글자 색 |
| `--form-control-disabled-placeholder` | placeholder 색 |
| `--btn-disabled-bg` | 비활성 버튼 배경(예: 전송·저장) |
| `--btn-disabled-text` | 비활성 버튼 글자색 |

### 컴포넌트 CSS 예시

```css
.my-input:disabled,
.my-input.is-disabled {
  background-color: var(--form-control-disabled-bg);
  border-color: var(--form-control-disabled-border);
  color: var(--form-control-disabled-text);
  cursor: not-allowed;
}

.my-input:disabled::placeholder {
  color: var(--form-control-disabled-placeholder);
}

.my-btn:disabled {
  background-color: var(--btn-disabled-bg);
  color: var(--btn-disabled-text);
  cursor: not-allowed;
  opacity: 1; /* 회색이면 opacity 중복 저하 방지 */
}
```

### 채우기형 토글·세그먼트(배경이 primary색인 active)

- **일반** `:hover { color: 링크색 }` 를 두면, **`.active` 상태에서도** 동일 규칙이 겹쳐 **파란 글자 + 파란 배경**이 될 수 있음.
- **반드시** `.active:hover:not(:disabled)`에서 `color: var(--control-pill-active-text)` 등으로 **글자색을 다시 지정**.
- 토큰: `--control-pill-active-bg`, `--control-pill-active-text`, `--control-pill-active-hover-bg` (`kl-tokens-theme-map.css`)

### 영역 전체를 비활성 톤으로 쓸 때

입력줄 **바깥 래퍼**(예: `.message-input-area.is-disabled`)는 배경만 살짝 다르게 할 수 있다. 이때도 `#eceff1` 등을 새로 쓰기보다 **`--form-control-disabled-bg`와 동일**하거나, 필요하면 **한 변수만** 추가해 구역 배경용으로 쓴다.

---

## 4. 기존 일반 색상 토큰 (참고)

이미 `:root`에 있는 것들 — 비활성과 무관한 **활성 UI**에 사용한다.

- 텍스트: `--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary`
- 배경: `--color-bg-primary`, `--color-bg-secondary`, `--color-bg-hover`
- 강조: `--color-accent`, `--color-accent-hover`
- 테두리: `--color-border`, `--color-border-hover`

---

## 5. 마이그레이션 순서 (권장)

1. **새 화면 / 새 블록** — 처음부터 `var()`만 사용.  
2. **수정하는 파일** — 손대는 김에 인접한 `#hex`를 같은 의미의 토큰으로 치환.  
3. **대규모 일괄 치환** — 디자인 검수 후 배치 작업.



## Part 3 · Layout · 앱·페이지

MAP은 콘텐츠형 랜딩 페이지가 아니라 작업형 앱이므로, 콘텐츠를 화면에 넓게 활용하는 것을 기본으로 합니다.

## 1. 레이아웃 기본 원칙

- 본문은 `width: 100%` 기준으로 사용
- 큰 화면에서도 과도한 중앙 고정폭(`max-width` 고정) 사용 지양
- 여백은 `padding`으로만 제어해 밀도와 가독성 균형 유지
- 헤더/사이드/LNB는 고정, 본문만 스크롤되도록 구성

## 2. 콘텐츠 영역 폭 정책

- 기본: `max-width: 100%`
- 페이지 성격에 따라 선택:
  - 작업형(노트북/그래프/관리): 전체폭 우선
  - 문서형(공지/도움말): 제한폭 사용 가능(선택)

## 3. 브레이크포인트 (앱형 기준)

- Ultra wide: `>= 1920`
- Desktop large: `1600 ~ 1919`
- Desktop base: `1280 ~ 1599`
- Small desktop / tablet: `1024 ~ 1279`
- Tablet/mobile: `< 1024`

## 4. 여백 기준

- `>= 1920`: `padding-inline 18px`
- `1600 ~ 1919`: `padding-inline 16px`
- `1280 ~ 1599`: `padding-inline 14px`
- `1024 ~ 1279`: `padding-inline 12px`
- `< 1024`: `padding-inline 10px`

## 5. 타이틀 / 네비 표시

- 페이지 헤더는 3단을 기본으로 사용
  - Breadcrumb (선택)
  - Title row (제목 + 우측 액션)
  - Description (선택)
- 타이틀 위계:
  - 페이지 타이틀: `20px / 600`
  - 섹션 타이틀: `15~16px / 600`
  - 본문: `12~13px / 400~500`

## 6. 적용 우선순위

1. `MainLayout` 본문 폭/여백/브레이크포인트
2. 주요 화면 공통 헤더 구조(`DomainSelection`, `Home`, `NotebookDetail`)
3. 화면별 미세 스타일 정리

## 7. 피해야 할 패턴

- 페이지마다 다른 임의 `max-width`
- 불필요한 이중 박스(그룹 박스 + 선택 박스 중복)
- 의미 없는 과도한 그림자/장식

## 8. CSS 변수(디자인 토큰)

색·간격·폼/버튼 비활성 등은 **`kl-tokens-core.css` · `kl-tokens-theme-map.css` · `kl-variables.css`**를 기준으로 하고, 네이밍·사용 원칙은 ****Part 2****를 따른다.

## Part 4 · Forms · 폼 요소

**상태:** 설계 확정본 (1차 파일럿 전) · **1차 적용:** **Part 11** (코드는 사용자 컨펌 후)

본 문서는 **본문(Surface)·목록 툴바**에서 쓰는 **HTML 네이티브 버튼·input·select**의 **클래스 조합 규칙**을 정의합니다.  
React 컴포넌트의 `variant` / `size` / `disabled` prop 조합과 같은 역할을 **CSS 멀티 클래스**로 표현합니다.

**왜 정리하는가:** 초기에 패턴별·화면별 전용 클래스(예: `.toolbar-bundle__submit`, `kl-btn--outline-primary`처럼 타입명 반복)가 늘면서 유지보수·remote 병합이 어려워졌기 때문입니다. **신규·수정 Surface UI는 본 문서를 따릅니다.**

**관련:** **Part 2** · **Part 10** · **Part 5** · **Part 4**

---

## 1. 핵심 원칙

| # | 원칙 |
|---|------|
| 1 | **요소 타입은 첫 클래스 하나**로 고정한다. (`kl-btn`, `kl-input`) |
| 2 | **스타일·크기·상태**는 **짧은 추가 클래스**로 조합한다. (`primary-full`, `gray-outline`, `md`) |
| 3 | `kl-btn--outline-primary`처럼 **타입명을 modifier에 반복하지 않는다.** 적용 대상이 이미 `<button class="kl-btn …">`이면 뒤에는 `primary-outline`만 쓴다. |
| 4 | **색·간격 숫자**는 토큰 파일(`kl-tokens-*`, `kl-variables.css`) 및 `kl-forms.css` **토큰**을 쓰고, 본 체계는 **클래스 이름·조합**만 정의한다. |
| 5 | **너비**는 공통 컨트롤에 `width: 100%`(또는 `min-width: 0` + flex)만 두고, **실제 폭은 페이지·툴바 부모**에서 정한다. |
| 6 | **코드 적용 전** 본 문서·파일럿 범위를 사용자와 **논의·컨펌**한다. (`.cursor/rules/workflow-confirm-before-implement.mdc`) |
| 7 | **전면 일괄 rename 금지.** 레거시 클래스는 **별칭(alias)** 으로 당분간 유지하고, 손대는 화면만 이관한다. |

---

## 2. React prop ↔ 클래스 (개념)

| React (개념) | 클래스 조합 예 |
|--------------|----------------|
| `type="button"` + base | `kl-btn` |
| `variant="primary-full"` | `primary-full` |
| `variant="gray-outline"` | `gray-outline` |
| `size="md"` | `md` |
| `disabled` | HTML `disabled` + 토큰 기반 `:disabled` 스타일 |
| input base | `kl-input` |
| `readOnly` | HTML `readOnly` + `.is-readonly` 또는 `[readonly]` 스타일 |

향후 `KlButton`, `KlInput` 래퍼를 두면 **내부에서 아래 클래스 문자열만 조립**하면 된다. **1차 파일럿은 순수 HTML + 클래스**로 진행한다.

---



### 4.8 Select · field 레이아웃 (form-spec 통합)

## 2. 표준 (2026-05-22~)

**마크업:** `<input class="kl-input {variant} {size}" />` (textarea·select 동일)

| variant | 용도 |
|---------|------|
| `gray-outline` | 기본 필드 (툴바·검색) |
| `md` | **기본** 높이 — `--kl-control-height` |

**너비:** 공통 CSS는 `width: 100%`. **페이지·툴바 부모**에서 `flex` / `min-width`로 조절.  
상세 → ****Part 4·5**** · 파일럿 **Part 11**

---

## 3. 토큰·레거시 클래스

- **공통 토큰:** `--kl-control-*` (`kl-variables.css`, theme 참조)
- **레거시 (신규 금지):** `kl-form-control`, `.toolbar-field-input`, `.toolbar-select` — 손댈 때 `kl-input gray-outline md` 등으로 이관
- **상태:** `:hover`, `:focus`, `:disabled`, `[readonly]` — 토큰으로 통일

숫자(px)만 주어져도 토큰 파일 / `--kl-control-*`에 대응 값이 있으면 **`var(--…)`** 사용 (`.cursor/rules/ui-ux-design-tokens.mdc`).

---

## 4. Select

| 상태 | 사용 |
|------|------|
| **목표 표준** | `KlSelect` (본문용, `KlModalSelect`와 시각·동작 정렬) |
| **레거시** | `.toolbar-select`, 네이티브 `<select>` — **신규 추가 금지** |

네이티브 select는 OS/브라우저가 스크롤·방향을 제어합니다. 통일된 패널·`max-height`는 `KlModalSelect` / 향후 `KlSelect` 참고.

---

## 5. 레이아웃

- 목록 상단 검색: **Part 7**의 `search-area`, `toolbar-bundle`
- 단독 설정 폼: 라벨·필드 배치는 화면별 CSS Module; 간격은 `--spacing-*` 토큰

---

## 6. 이관

**Part 10** — **컨펌 후** 해당 파일을 수정할 때만 본문 select/input을 표준으로 맞춘다.
## Part 5 · Buttons · 버튼

## 5.1 버튼 (`kl-btn`)

### 3.1 마크업 패턴

```html
<button type="button" class="kl-btn {variant} {size}">라벨</button>
<button type="button" class="kl-btn gray-outline md" disabled>초기화</button>
```

- **variant:** 필수 (아래 표 중 하나).
- **size:** 필수. 목록 툴바·폼 옆 액션은 기본 **`md`**.
- **아이콘+라벨:** variant·size 뒤에 `<svg>` 등 자식 허용. 간격은 `kl-btn` 기본 `gap` 따름.

### 3.2 Variant (색·채움 스타일)

| 클래스 | 용도 | 레거시 대응 (참고) |
|--------|------|-------------------|
| `primary-full` | 주색 **면** 채움 (CTA) | `kl-btn--primary`, `kl-btn-primary-sm`(크기 별도) |
| `primary-outline` | 주색 **테두리**·주색 글자·흰/밝은 배경 | `kl-btn--outline-primary` |
| `gray-outline` | 회색 테두리·흰 배경·본문색 글자 (보조) | `kl-btn`, `kl-btn--secondary` |
| `gray-fill` | **테두리색(`--color-border`)과 동일한 회색 면 채움** · 본문색 글자 (툴바「검색」등) | *(전용)* `.toolbar-bundle__submit` → **폐지 예정** |
| `danger-full` | 위험 면 채움 | `kl-btn--danger` |
| `outline-success` | 성공 톤 아웃라인 (드묾) | `kl-btn--outline-success` |

**신규 variant 추가:** 본 표 + CSS에 정의 추가 → registry·본 문서 갱신 → 사용자 컨펌.

### 3.3 Size (크기)

| 클래스 | 높이·용도 |
|--------|-----------|
| `xs` | 컴팩트 (표 안·칩 인접) |
| `sm` | 폼 옆·보조 (패딩·`font-size-xs`, `md`보다 작음) |
| `md` | **기본.** `var(--kl-control-height)` (32px) 에 맞춤. **툴바·목록 필터 기본값.** |
| `lg` | 강조 CTA (드묾) |

**규칙:** `md`는 **높이·패딩·font-size를 한 세트**로 정의한다. `kl-btn--sm`처럼 **글자만 줄이고 높이는 그대로**인 패턴은 **신규 금지**.

### 3.4 상태

| 상태 | 구현 |
|------|------|
| 비활성 | `disabled` 속성 + `:disabled` / `--btn-disabled-*` 토큰 |
| 포커스 | `:focus-visible` — 접근성 링 (`--shadow-focus-input` 등) |

---

## 4. 폼 필드 (`kl-input`)

`input`(text, password, …), `textarea`, 본문·툴바의 `select`에 공통 적용.

### 4.1 마크업 패턴

```html
<label class="toolbar-field-group__label" for="id">Entity</label>
<input id="id" type="text" class="kl-input gray-outline md" />
```

```html
<div class="toolbar-field-group">
  <label class="toolbar-field-group__label" for="id">Entity</label>
  <input id="id" class="kl-input gray-outline md" />
</div>
```

### 4.2 Variant

| 클래스 | 용도 | 레거시 대응 |
|--------|------|-------------|
| `gray-outline` | 기본 필드 — `--kl-control-border` / `--kl-control-bg` | `.toolbar-field-input`, `kl-form-control`, `.toolbar-select` 톤 |
| `gray-fill` | (예약) 읽기 전용·강조 배경 필드 | — |

### 4.3 Size

버튼과 **동일한 `xs` | `sm` | `md` | `lg` 표**를 쓰며, **`md` = `--kl-control-height`**.

### 4.4 상태

| 상태 | 구현 |
|------|------|
| 비활성 | `disabled` + `--form-control-disabled-*` |
| 읽기 전용 | `readonly` + `--form-control-readonly-*` (토큰 정의 시) |
| 포커스 | `:focus` + `--color-accent` / `--shadow-focus-input` |

### 4.5 너비

| 레벨 | 규칙 |
|------|------|
| **공통 CSS** | `.kl-input { width: 100%; min-width: 0; box-sizing: border-box; }` |
| **페이지·툴바** | 부모(`.toolbar-field-group`, `.toolbar-bundle__field`, 페이지 SCSS)에서 `flex`, `min-width`, `max-width` 지정 |

**금지:** `TableToolbar.css` 등 공통 파일에 `width: 160px` 같은 **페이지별 고정값**.

---

## 5. 목록 툴바 — 필터 묶음 (`toolbar-bundle`)

여러 필드 + **적용(검색)** 버튼을 **한 덩어리**로 묶을 때 쓴다. (Audit Log 필터 등)

### 5.1 DOM

```
.table-toolbar
├─ .toolbar-left          ← 총 N건 (묶음 밖)
└─ .toolbar-right
   ├─ .toolbar-bundle
   │    ├─ .toolbar-bundle__fields
   │    │    └─ .toolbar-field-group × N  →  .kl-input.gray-outline.md
   │    └─ button.kl-btn.gray-fill.md    ← 「검색」(묶음 안)
   └─ button.kl-btn.gray-outline.md      ← 「초기화」(묶음 밖)
```

### 5.2 레이아웃·스타일 (공통)

| 클래스 | 역할 |
|--------|------|
| `.toolbar-bundle` | 묶음 래퍼. **좌·우 패딩만** (`padding: 0 var(--spacing-sm)`). 배경색 없음(필요 시 페이지에서만). |
| `.toolbar-bundle__fields` | 필드 가로 배치, `gap: var(--spacing-sm)` |
| `.toolbar-field-group` | 라벨 + control (기존 `TableToolbar.css`) |

**검색 버튼 활성 조건(로직):** 입력값(trim) ≠ 적용값일 때만 `disabled` 해제. (페이지 state — 본 문서는 UI만.)

### 5.3 문서

툴바 DOM 골격: **Part 7**  
파일럿 상세: **Part 11**

---

## 6. CSS 파일 배치 (계획)

| 구분 | 파일 | 비고 |
|------|------|------|
| 토큰 | `kl-tokens-core.css`, `kl-tokens-theme-map.css`, `kl-variables.css` | SSOT · 컨펌 후 추가 |
| 버튼 variant·size | `src/assets/styles/kl-buttons.css` | **신규 조합 클래스 추가.** 기존 `kl-btn--*`는 **deprecated 별칭** |
| 인풋 variant·size | `src/assets/styles/kl-forms.css` (`kl-input` 등) | `kl-input.css`·`kl-form-control.css`는 re-export 스텁만 |
| 툴바 레이아웃 | `src/assets/styles/kl-layout-toolbar.css` (`global.css`) | `TableToolbar.css`는 경로·주석 스텁 |
| 페이지 너비 | 예: `AdminAuditLog.css` | 파일럿 |

**모달(Overlay)** 은 본 체계 **1차 범위 밖.** MUI `Button` / `kl-modal-form` 유지.

---

## 7. 레거시 별칭·이관 (remote 병합)

### 7.1 전략

| 구분 | 담당 |
|------|------|
| `react/docs/**`, `*.css`, `*.scss` | **로컬** — 설계·스타일 |
| remote **`.jsx`만** 수신 | 기능·마크업 — **className은 가이드에 맞춰 정리** |
| remote와 **같은 jsx** 충돌 | 기능은 remote 우선, className은 본 문서 기준으로 수동 정리 |

**26일 등 remote 반영 후:** 화면을 **하나씩** 열어 `kl-btn` / `kl-input` 조합으로 이관. CSS는 이미 별칭이 있으면 **당장 깨지지 않게** 할 수 있음.

### 7.2 매핑표 (요약)

| 레거시 (신규 금지) | 신규 조합 |
|-------------------|-----------|
| `kl-btn kl-btn--primary` | `kl-btn primary-full md` |
| `kl-btn` (단독, 보조) | `kl-btn gray-outline md` |
| `kl-btn kl-btn--outline-primary` | `kl-btn primary-outline md` |
| `.toolbar-field-input` | `kl-input gray-outline md` |
| `.toolbar-bundle__submit` | `kl-btn gray-fill md` |

---

## 8. 작업 순서 (팀 합의)

1. **본 문서 + 파일럿 spec** 확정 (오늘)  
2. CSS: variant·size 클래스 **추가** + 레거시 **별칭**  
3. **Audit Log** 마크업·className 적용 (컨펌 후)  
4. `button-spec.md` / `form-spec.md` 예시를 **신규 클래스**로 갱신 (파일럿 후 확정본)  
5. remote jsx 병합 → **페이지별** className 이관  
6. 별칭 제거는 **충분히 이관된 뒤** 별도 합의  

---

## 9. 에이전트·개발자 체크리스트

- [ ] 신규 Surface 버튼에 `kl-btn--*` 단독 modifier만 쓰지 않았는가?  
- [ ] `kl-btn` + variant + size 세 클래스가 있는가?  
- [ ] 인풋에 `kl-input` + variant + size 인가?  
- [ ] 공통 CSS에 페이지별 `width: 160px` 고정을 넣지 않았는가?  
- [ ] 구현 전 사용자 **컨펌** 받았는가?  
- [ ] 토큰 파일(`kl-tokens-*`, `kl-variables`) **추가·변경**은 컨펌 후인가?  

---

## 10. 변경 이력 (문서)

| 날짜 | 내용 |
|------|------|
| 2026-05-22 | 초안 — 클래스 체계·Audit Log 파일럿·remote jsx 병합 전략 |

## Part 6 · Modal · 모달 레이아웃

> **모달 상세 SSOT:** [`modal-guide.md`](./modal-guide.md) — 아래는 목차·교차 참조용 요약.  
> 모달 안 input/button/select 스타일은 Part 4·5와 동일. 껍데기·Decision·`kl-modal-form`은 **modal-guide**를 본다.

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
- 입력 폼 상세 → **Part 4** (`contentClassName`에 `kl-modal-form`).

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
**스크롤바** · `src/assets/styles/kl-scrollbar-thin.css` → `.kl-base-modal-content`

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

**폼 컨트롤** · **Part 4**

</details>

</div>


### 6.x 모달 본문 필드 **행·라벨 배치** (구 modal-form-spec)

**적용 범위:** `BaseModal` **콘텐츠 영역**에 한함. 페이지 본문·테이블 셀 등 **밀집(dense) 레이아웃**은 별도 규격으로 두며 이번 문서 범위에서 제외한다.

**관련:** **Part 6** — I 운영 · II §4 `BaseModal` 클래스. Decision(`alert`/`confirm`/`prompt`)는 §3·§5와 같이 폼 일괄 규격에서 제외 가능(본문은 메시지·prompt 입력 위주).

---

## 1) 목표

- 팝업 안의 **select / input / textarea / checkbox / radio**(MUI 포함) 시각·포커스·비활성·에러 톤을 **한 규격**으로 맞춘다.
- 스타일 수정 시 ****forms CSS + layout** (`kl-modal-form`은 **레이아웃 클래스명**만)로 유지보수한다.
- 마크업 반복은 **`ModalFormField`**(라벨·컨트롤 슬롯·보조문)로 줄인다.

---

## 2) 적용 방법 (필수)

1. 해당 모달의 `BaseModal`에 **`contentClassName`**으로 기존 클래스와 함께 **`kl-modal-form`** 을 붙인다.

   ```jsx
   <BaseModal
     contentClassName="some-modal-content kl-modal-form"
     ...
   >
   ```

2. 필드 한 블록은 다음 중 하나로 구성한다.

   - **`ModalFormField`** 사용(권장): `label`, `children`(실제 컨트롤), `helperText`, `required`, `error`.
   - 수동: 동일한 의미의 클래스명(`kl-modal-form-field` 등)을 쓰되, **반드시 `.kl-modal-form` 조상** 안에 둔다.

---

## 3) 클래스 요약

| 클래스 | 역할 |
|--------|------|
| **`kl-modal-form`** | 콘텐츠 루트. 이 안에서만 네이티브/MUI 폼 컨트롤 규격이 활성화된다. |
| **`kl-modal-form-field`** | 라벨·컨트롤·보조문 세로 스택(필드 간 여백 포함). `ModalFormField`와 동일 리듬. |
| **`kl-modal-form-label`** | 필드 라벨(상단). 필수 시 자식으로 `.required-asterisk` 사용. |
| **`kl-modal-form-control`** | 컨트롤 래퍼(`width: 100%`, `min-width: 0`). |
| **`kl-modal-form-helper`** | 보조 설명(`--font-size-sm`, 보조 색). |
| **`kl-modal-form-control--warning`** | 네이티브 `select`/`input` 등에 붙이면 경고 테두리·배경(청킹 NONE 등 특수 상태용). |

---

## 4) 토큰·리듬 (팝업 폼 필드 — `modal-native-field`·`kl-modal-form` 공통)

한 번 고치면 두 경로가 같아 보이도록 **모서리·패딩·테두리·포커스**를 아래에 맞춘다.

| 항목 | 토큰 / 값 |
|------|-----------|
| **모서리** | **`--radius-sm`(4px)** — 모달 하단 버튼(`BaseModal` `.actions`)과 동일. |
| **테두리** | `1px solid var(--color-border)` |
| **포커스** | `border-color: var(--color-accent)` + `box-shadow: var(--shadow-focus-input)` (`kl-tokens-theme-map.css`). 네이티브는 `kl-modal-form.css`에서 **`!important`** 및 **`:invalid:focus`** 보강(브라우저·MUI 간섭, `type=email` 등) |
| **한 줄 `input` / `textarea`** | 패딩 **`calc(var(--spacing-sm) + var(--spacing-xs))` `14px`** (`kl-modal-form.css` · 레거시 `kl-legacy-modal.css` `.modal-native-field` 동일) |
| **`select`(네이티브)** | 세로·**좌** 패딩은 한 줄 입력과 동일; **우**만 화살표 여유 **`calc(var(--spacing-xl) + var(--spacing-md))`** |
| **필드 블록 간격** | 세로 **`--spacing-md`(16px)** (`ModalFormField` / `.kl-modal-form-field`) |
| **라벨↔컨트롤↔보조문** | **`--spacing-sm`(8px)** 단계 |

**유지보수:** 팝업 내 네이티브 필드 스타일 변경 시 **`kl-modal-form.css`** 와 **`kl-legacy-modal.css`**(`.modal-native-field`, `.modal-input`)를 **함께** 본다. 도메인 추가·FAQ 등 동일 패턴 폼은 같은 토큰으로 맞춘다.

---

## 5) MUI 컴포넌트

- **`TextField`** · **`Select`** · **`Checkbox`/`Radio` + `FormControlLabel`**: `.kl-modal-form` 안에서 **Outlined 계열**을 기준으로 후손 선택자로 통일한다.
- 페이지별 `sx`로 테두리색을 덮어쓰지 않는 것을 원칙으로 한다. 예외는 본 문서에 항목 추가 후 적용.

---

## 6) 네이티브 요소

- `input`(한 줄), `textarea`: §4 표와 동일.
- **`<select>`(네이티브)**: OS마다 펼침 목록 UI가 달라 **프로덕션 팝업에서는 사용하지 않는 것을 권장**한다. 동일 디자인이 필요하면 **`KlModalSelect`** (`src/components/common/modal/KlModalSelect.jsx`, MUI `Select`)를 쓴다. 목록 패널에는 전역 클래스 **`kl-modal-select-menu-paper`** 로 `radius-sm`·테두리·호버·선택 배경을 통일한다(`kl-modal-form.css`).
- 기존 전역 **`.modal-input`** 은 `.kl-modal-form` 안에서 §4에 맞게 재정의된다.

---

## 7) 유지보수 노트

- 팝업이 아닌 **테이블/노트북 상세** 등 더 작은 컨트롤이 필요하면 **`kl-table-form`** 같은 별도 접두사·별 문서**로 분리하는 것을 권장한다.
- 신규 모달 추가 시: 타입은 **`modal-guide.md`** §2·§6을 따르고, 폼이 있으면 **`kl-modal-form` + `ModalFormField`** 로 시작한다.



## Part 7 · 목록·툴바

인수인계·비대면 작업용 문서입니다. **목록형 페이지**의 상단 구조(제목·툴바·표)를 한곳에 정리합니다.  
변경 **이력**은 [ui-history2.md](ui-history2.md)(요청 시 갱신). 규칙은 이 문서·연관 spec을 보세요.


## 1. 이 문서의 범위

**포함**

- `kl-main-sticky-head` 안의 `PageHeader` (제목·breadcrumb·헤더 액션)
- **`table-area` 안의** `table-toolbar` (검색·필터·보기 전환) + 표
- 공통 클래스: `table-toolbar`, `toolbar-left`, `toolbar-right`, `search-area`
- CSS **어디를 고치면 여러 화면에 반영되는지**

**포함하지 않음**

- 표 셀·헤더·행 호버 → **Part 8**
- 노트북 상세·지식 그래프 등 **목록이 아닌** 화면

---

## 2. DOM 구조 (고정 패턴)

대부분의 관리·고객센터 목록은 아래 골격을 따릅니다.

```
.kl-page                         ← outlet 직계 공통 셸 (KlPage.css · MainLayout.css)
├─ .kl-main-sticky-head          ← 스크롤 시 상단 고정 (PageHeader.css)
│    └─ PageHeader / AdminPageHeader
│         └─ .page-header        ← 제목·breadcrumb·우측 액션 버튼 (PageHeader.css)
└─ .table-area                   ← 목록 카드 영역 (SupportCenter.css · TableCard.css 등)
   ├─ .table-toolbar             ← 검색·필터 (TableToolbar.css) — **표준: table-area 안**
   │    ├─ .toolbar-left         ← 보통 `kl-table-toolbar-summary`(총 N건)
   │    └─ .toolbar-right        ← 필터·정렬 (있을 때)
   └─ .basic-table-shell → BasicTable   ← 표 본문 (TableCard.css)
```

**규칙:** `table-toolbar`는 **`table-area`의 첫 자식**으로 둔다. FAQ·회원 관리·프롬프트 목록과 동일. (`kl-main-sticky-head` 안에 툴바만 두면 카드 밖으로 빠져 레이아웃이 어긋난다.)

### 2.1 `kl-page--fill` (선택 수정자)

- **기본:** 루트는 `kl-page`만 — 표·카드 높이는 **행 수만큼**. 길면 `main-content`가 스크롤한다.
- **추가:** 같은 루트에 `kl-page--fill`을 **함께** 붙이면 남은 세로를 채우고, `basic-table-shell` **안에서** 목록이 스크롤한다 (`kl-basic-table.css` · [KlPage.css](../src/components/common/KlPage.css)).
- **붙이는 곳:** 해당 **화면 페이지 루트** 한 곳. `Admin.jsx` 같은 **라우트 호스트**·탭 래퍼에는 붙이지 않는다.
- **쓰는 경우:** 행이 많은 관리·고객센터 **목록** (워크스페이스·회원·프롬프트·공지 등).
- **쓰지 않는 경우:** 행이 적거나 펼침·카드형 UI ([AdminArangoManagement.jsx](../src/pages/admin/AdminArangoManagement.jsx), [DomainSelection.jsx](../src/pages/DomainSelection.jsx)).
- **노트북:** [NotebookDetail.jsx](../src/components/NotebookDetail.jsx) — 패널 레이아웃용으로 `--fill` 유지 (표 목록과 목적이 다름).

```jsx
<div className="kl-page kl-page--fill">
```

**예외**

| 화면 | 툴바 차이 |
|------|-----------|
| [DomainSelection.jsx](../src/pages/DomainSelection.jsx) | 검색 없음 — 좌 `kl-table-toolbar-summary`(총 N건) · 우 `.domain-toolbar-user`(관리자 로그인) |
| [Home.jsx](../src/pages/Home.jsx) | `kl-main-sticky-head` 밖 `table-area` — `.table-toolbar--end` + `.toolbar-view-toggle` · `.toolbar-select` (헤더는 `admin-btn-primary`만) |
| [AdminConfigManagement.jsx](../src/pages/admin/AdminConfigManagement.jsx) | 좌 `kl-table-toolbar-summary` · 우 `toolbar-select`(카테고리) — 검색 없음 |
| [AdminUpgradeRequests.jsx](../src/pages/admin/AdminUpgradeRequests.jsx) | 좌 `kl-table-toolbar-summary`만 — 검색·필터 없음 |
| [AdminArangoManagement.jsx](../src/pages/admin/AdminArangoManagement.jsx) | 좌 `kl-table-toolbar-summary`만 — 검색·필터 없음 · **`kl-page`만** (`--fill` 없음) |
| [PromptList.jsx](../../src/prompt/components/prompts/PromptList.jsx) | `table-area` 안 툴바 — 좌 `kl-table-toolbar-summary`(총 N건) · 우 `search-area` + `toolbar-select` |

---

## 3. 공통 클래스 치트시트

| 수정 목적 | className | CSS 파일 |
|-----------|-----------|----------|
| 툴바 한 줄 레이아웃·간격 | `table-toolbar` | [TableToolbar.css](../src/components/common/TableToolbar.css) |
| 툴바 내용만 우측 정렬 | `table-toolbar--end` | 동일 |
| 툴바 좌측 묶음 | `toolbar-left` | 동일 |
| 툴바 좌측 건수 요약 | `kl-table-toolbar-summary` | 동일 (`총 **N**건` — 마크업 `총 <strong>N</strong>건`, 스타일은 상위 span) · 컨트롤과 **하단 정렬** |
| 툴바 우측 묶음 | `toolbar-right` | 동일 |
| 툴바 네이티브 select(32px) | `toolbar-select` | 동일 |
| 툴바 그리드·리스트 전환 | `toolbar-view-toggle` / `toolbar-view-btn` / `is-active` | 동일 |
| 검색 입력 박스(높이 38px 등) | `search-area` / `search-area-icon` / `search-area-input` | 동일 |
| 페이지 루트 셸 | `kl-page` · 선택 `kl-page--fill` ([§2.1](#21-kl-page--fill-선택-수정자)) | [KlPage.css](../src/components/common/KlPage.css) |
| 헤더·툴바 새로고침(아이콘만) | `kl-btn gray-outline md icon-only` + `KlIconButton` | [kl-buttons.css](../src/assets/styles/kit/kl-buttons.css) |
| 헤더 작성·추가 CTA | `kl-btn primary-full md` (+ 아이콘 14px) | 동일 |
| 로딩·오류·빈 목록(표 thead 유지) | `listTableEmptyState()` → `BasicTable` `emptyState` | [supportMock.js](../src/config/supportMock.js) |
| 표 바깥 카드 | `table-card` | [TableCard.css](../src/components/common/TableCard.css) |
| 페이지 제목·breadcrumb·sticky·헤더 버튼 | `page-header` · `kl-main-sticky-head` … | **[PageHeader.css](../src/components/common/PageHeader.css)만** |
| 어드민 헤더 래퍼 | `AdminPageHeader` → 내부 `PageHeader` | [AdminPageHeader.jsx](../src/components/admin/AdminPageHeader.jsx) (스타일 없음) |
| 표 본체 | `BasicTable` | [BasicTable.module.scss](../src/components/common/BasicTable.module.scss) |

**규칙**

- **콘텐츠 타이틀**(상단 여백·sticky·제목·우측 `admin-btn` 규격) → **`PageHeader.css`만** 수정. `MainLayout.css`에 `.page-header` / `.kl-main-sticky-head` 규칙을 두지 않음.
- 여러 목록에 공통인 툴바·검색 스타일 → **`TableToolbar.css`만** 수정.
- **한 메뉴 전용** 필터·버튼 → 해당 페이지 CSS (예: `.support-filter` in [SupportCenter.css](../src/pages/SupportCenter.css)). **헤더 패딩·타이틀 정렬은 페이지 CSS에 넣지 않음.**
- 새 목록 페이지 추가 시 `member-mgmt-*` / `workspace-mgmt-*` 같은 **메뉴명 접두 클래스는 만들지 않음** — 위 공통 클래스 사용.

---

## 4. 검색 영역 마크업 (복사용)

```jsx
<div className="toolbar-left">
  <div className="search-area">
    <Search size={16} className="search-area-icon" aria-hidden />
    <input
      type="text"
      className="search-area-input"
      placeholder="검색어…"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      aria-label="…"
    />
  </div>
</div>
```

검색 + 필터가 둘 다 있을 때 (FAQ·QnA·프롬프트 목록):

```jsx
<div className="table-area">
  <div className="table-toolbar">
    <div className="toolbar-left">{/* search-area */}</div>
    <div className="toolbar-right">{/* support-filter · toolbar-select */}</div>
  </div>
  <div className="basic-table-shell">
    <BasicTable
      columns={columns}
      data={rows}
      emptyState={{ variant: hasFilters ? 'search' : 'default' }}
    />
  </div>
</div>
```

참고: [Faq.jsx](../../src/pages/Faq.jsx), [PromptList.jsx](../../src/prompt/components/prompts/PromptList.jsx).
```

---

## 5. CSS 로드 지도 (전역 vs 페이지)

후임자가 **“스타일이 안 먹는다”** 할 때, import 위치를 먼저 확인합니다.

### 5.1 `main.jsx` → `styles/global.css` (앱 전체)

`main.jsx`는 **`import './assets/styles/global.css'` 한 줄**만 쓴다. 번들 순서·파일 목록은 **Part 1.2** · [global.css](../src/assets/styles/global.css) `@import` 를 본다.

| 구분 | 대표 파일 | 내용 |
|------|-----------|------|
| 토큰 | `kl-tokens-core.css`, `kl-tokens-theme-map.css`, `kl-variables.css` | spacing·색·`--kl-control-*` |
| UI 키트 | `kl-forms.css`, `kl-buttons.css`, `kl-layout-toolbar.css`, `kl-modal-form.css` … | Surface·툴바·모달 |
| 레거시 | `kl-legacy-modal.css` | `.modal-overlay`, `.modal-input` 등 |
| 레이아웃 보조 | `KlPage.css`, `TableArea.css` | `kl-page`, `table-area` |

**스텁(직접 import 금지):** `index.css`, `kl-ui.css`, `kl-form-control.css`, `kl-input.css`, [TableToolbar.css](../src/components/common/TableToolbar.css) — 모두 `global.css` 또는 `kl-forms` / `kl-layout-toolbar`로 위임.

### 5.2 컴포넌트에서 로드 (해당 컴포넌트 쓸 때)

| 파일 | import 위치 | `global.css` 포함 |
|------|-------------|:-----------------:|
| [PageHeader.css](../src/components/common/PageHeader.css) | `PageHeader.jsx` | ❌ |
| [BasicTable.global.css](../src/components/common/BasicTable.global.css) | `BasicTable.jsx`, `BasicTableFooter.jsx` | ❌ |

→ **Part 1.3** 인벤토리 표 참고.

### 5.3 페이지·기능별 CSS (그 화면만)

예: [AdminMemberManagement.css](../src/pages/admin/AdminMemberManagement.css), [SupportCenter.css](../src/pages/SupportCenter.css), [Home.css](../src/pages/Home.css) — 각 `jsx` 상단 `import './…css'`.

**운영 팁:** 전역 KL 번들은 **`global.css`만** 보면 됩니다. 페이지 CSS는 **그 메뉴 전용**으로 둡니다.

---

## 6. 대표 구현 예시 (정답 샘플)

새 목록 화면·리팩터 시 **아래 파일 구조를 참고**합니다.

| 용도 | 파일 |
|------|------|
| **표준** (검색 + BasicTable) | [AdminMemberManagement.jsx](../src/pages/admin/AdminMemberManagement.jsx) |
| 검색 + 필터 | [Faq.jsx](../src/pages/Faq.jsx) |
| 툴바 우측 정렬(보기·정렬) | [Home.jsx](../src/pages/Home.jsx) |
| 총 N건 + 관리자 로그인(검색 없음) | [DomainSelection.jsx](../src/pages/DomainSelection.jsx) |

스티키 헤더와 표 `z-index` 겹침: **Part 8** · [PageHeader.css](../../src/components/common/PageHeader.css) `.kl-main-sticky-head`.

---

## 7. 적용 화면 목록 (2025년 기준)

| 1depth | 화면 | `table-toolbar` | `search-area` |
|--------|------|-----------------|---------------|
| 워크스페이스 | Home | ○ (`--end`, 보기·정렬) | — |
| 어드민 | DomainSelection | ○ | — |
| 어드민 | DomainManagement | ○ | ○ |
| 어드민 | AdminWorkspaceManagement | ○ | ○ |
| 어드민 | AdminMemberManagement | ○ | ○ |
| 어드민 | PromptList | ○ | ○ |
| 어드민 | AdminUpgradeRequests | ○ | — |
| 어드민 | AdminArangoManagement | ○ | — |
| 어드민 | AdminConfigManagement | ○ | — (우측 카테고리 `toolbar-select`) |
| 고객센터 | NoticeList | ○ | ○ |
| 고객센터 | Faq | ○ | ○ |
| 고객센터 | QnaBoard | ○ | ○ |

표가 없거나 툴바가 없는 화면은 이 표에 **추가하지 않고**, 별도 섹션을 만들지 않습니다.

---

## 8. 자주 하는 수정 (FAQ)

1. **모든 목록의 검색창 높이·테두리를 바꾼다**  
   → `TableToolbar.css` → `.search-area`

2. **한 메뉴의 카테고리 필터만 바꾼다**  
   → 해당 페이지 CSS (예: `.support-filter`, `.support-filter-select`)

3. **페이지 제목과 본문 사이 간격**  
   → `PageHeader.css` → `.page-header` `margin-bottom`

4. **툴바가 표 카드 밖(헤더 아래)에 떠 보인다**  
   → `table-toolbar`를 `kl-main-sticky-head`가 아니라 **`table-area` 첫 자식**으로 옮긴다. ([§2 DOM 구조](#2-dom-구조-고정-패턴))

5. **한글이 `????`로 보인다**  
   → 해당 `.jsx` 파일이 UTF-8이 아닌 상태로 저장된 경우. Git에서 복구하거나 UTF-8로 다시 저장한다. (에디터 기본 인코딩 UTF-8 권장)

6. **표 헤더 배경·행 높이**  
   → **Part 8** · `BasicTable.module.scss`

7. **새 목록 메뉴 추가**  
   → §2 DOM + §4 마크업 + §6 `AdminMemberManagement.jsx` 복제 → 공통 클래스만 사용

8. **색·간격 숫자를 전역으로 바꾼다**  
   → **Part 2** · `kl-tokens-core.css` / `kl-tokens-theme-map.css` (신규 토큰은 팀 합의 후)

9. **「총 N건」과 검색·버튼 세로 위치가 어긋난다**  
   → `kl-table-toolbar-summary` + `toolbar-right` 조합은 `TableToolbar.css` 공통 규칙(하단 정렬·좌 요약 고정). 페이지별 `align-items: center` 오버라이드 금지.

10. **빈 목록에서 thead 없이 문구만 보인다**  
   → `TableEmptyState solo` 대신 `BasicTable`의 `emptyState={{ variant: 'default' }}`(필터 적용 시 `'search'`) 사용. 문구·스타일은 `TableEmptyState` 컴포넌트에서 일괄 관리. (**Part 8**)

---

## 9. 문서·코드 유지 규칙 (인수인계)

- 공통 클래스를 **새로 추가**하면 → 이 문서 §3 표에 **한 줄 추가**.
- `main.jsx`에 전역 CSS를 추가하면 → §5.1 표에 **한 줄 추가**.
- 화면별 일회성 스타일은 **이 문서에 넣지 않음** — 페이지 CSS 주석으로만 설명.
- 변경 이력은 **요청 시에만** [ui-history2.md](ui-history2.md) (에이전트·자동 기록 금지 규칙 참고).

---

## 10. 향후 개선 (선택)

팀 합의 시 `src/assets/styles/app-global.css`를 만들고 `main.jsx`의 §5.1 파일들을 `@import`로 묶을 수 있습니다.  
**소스 파일은 분리·로드 지점만 한곳**으로 모으는 방식이며, 동작은 현재와 동일합니다.



## Part 8 · Table · 데이터 표

관리 화면·히스토리 등 **목록 밀도**를 통일하고, 그리드형 카드와 나란히 두었을 때 **정보 위계**가 어색하지 않도록 하는 기준입니다.  
실제 색·숫자의 단일 소스는 `kl-tokens-core.css` · `kl-tokens-theme-map.css` · `kl-variables.css`이며, 이름 규칙은 **Part 2**를 따릅니다.

---

## 1. 목적

- 한 화면에 **더 많은 행**을 노출할 수 있도록 **행 높이·본문 글자 크기**를 단계화한다.
- 헤더·구분선·호버·액션 열을 **화면마다 제각각** 두지 않도록 최소 규격을 고정한다.

---

## 2. 참고 레퍼런스 (분위기·밀도)

밀집형 테이블·툴바·페이지네이션의 **전체적인 밀도**를 맞출 때 참고합니다.

| 구분 | 링크·비고 |
|------|-----------|
| Wireframe (User Management 느낌) | [Figma 사이트](https://emote-many-44283224.figma.site/) |
| 정적 이미지 | 협업 채널·에셋 폴더의 캡처(픽셀 기준 보조) |

레퍼런스 요약: **좁은 행**, **작지만 읽히는 본문 글자**, **연한 헤더 행**, **얇은 가로 구분선**, 줄무늬 없이 정리, 역할 **pill**, 상태 **토글+라벨**, 우측 **아이콘 액션**.

---

## 3. 밀도 단계

화면 성격에 따라 하나를 선택합니다. 카드형·설명이 많은 목록은 **기본**, 데이터 위주 어드민은 **밀집**을 권장합니다.

| 단계 | 용도 | 셀 세로 패딩(가이드) | 본문 글자 크기 |
|------|------|----------------------|----------------|
| **기본** | 온보딩·카드형 목록 | `padding-block: var(--spacing-sm)` (8px) | `var(--font-size-base)` (14px) |
| **밀집** | 어드민 표·실행 이력 등 | `padding-block: var(--spacing-xs)` (4px) 상하, 필요 시 행 최소 높이만 추가 | `var(--font-size-sm)` (13px) 또는 `var(--font-size-xs)` (12px) |

**참고(행 전체 높이):** 외부 레퍼런스처럼 본문 한 줄 기준 약 **40~44px**을 맞출 때는 `padding-block: calc(var(--spacing-sm) + 2px)`(상하 각 10px)와 `tbody td { min-height: 44px; }` 조합을 사용할 수 있다(도메인 선택 테이블 적용 예).

보조·메타 열(날짜, 건수)은 본문보다 한 단계 작게 가져가도 됩니다: `--font-size-xs`, `--color-text-secondary`.

---

## 4. 헤더 행

| 항목 | 권장 토큰 |
|------|-----------|
| 배경 | `var(--color-bg-dark)` 또는 `var(--color-bg-hover)` |
| 글자색 | `var(--color-text-secondary)` |
| 굵기 | `var(--font-weight-semibold)` |
| 크기 | `var(--font-size-sm)` |
| 하단 경계 | `1px solid var(--color-border-subtle)` |

**텍스트 정렬(관례):** 기본 **`th`는 좌측**. 예외만 명시한다 — **선택(체크/라디오) 열은 가운데**, **맨 오른쪽 액션 열(관리 등)은 우측**. 중간 텍스트 열을 가운데 정렬하지 않는다(어드민 `.admin-table thead tr`는 `text-align: left`).

---

## 5. 본문 행

| 항목 | 권장 토큰 |
|------|-----------|
| 배경 | `var(--color-bg-secondary)` |
| 본문 텍스트 | `var(--color-text-primary)` |
| 행 구분 | `border-bottom: 1px solid var(--color-border-subtle)` |
| 줄무늬(zebra) | **기본 없음**. 필요 시에만 교차 행에 `var(--color-bg-subtle)` |
| 호버 | `background: var(--color-bg-hover)` + `transition: var(--transition-fast)` |

### 5.1 텍스트 말줄임(선택, 화면마다 옵인)

긴 문자열이 셀 밖으로 넘칠 때 **한 줄 + 말줄임(`…`)**을 주고 싶으면, 말줄임을 줄 **`th` / `td`에만** 아래 클래스를 붙인다. 전역으로 모든 셀에 걸지 않는다.

| 클래스 | 정의 위치 | 조건 |
|--------|------------|------|
| **`_ellipsis`** | `src/pages/admin/admin-common.css` (`.admin-table` 하위) | `overflow: hidden` + `text-overflow: ellipsis` + `white-space: nowrap` |

CSS에서는 선택자로 **`._ellipsis`**처럼 앞에 점(`.`)을 붙이고, 마크업에는 **`class="_ellipsis"`**만 적으면 됩니다(점은 HTML에 넣지 않음).

**동작을 안정적으로 하려면:** 같은 테이블에 **`table-layout: fixed`**와 **열 폭**(width / min-width 등)을 잡아 두는 것이 좋다. 배지·아이콘만 있는 열에는 보통 붙이지 않는다.

**예시**

```html
<td class="_ellipsis">매우 긴 이메일 또는 도메인 문자열…</td>
```

`admin-table`을 쓰지 않는 목록(예: 도메인 선택 `/` 전용 테이블)에는 동일 규칙을 **해당 화면 CSS**에 복사하거나, `th`/`td`에 맞게 한정한 선택자로 맞춘다.

---

## 6. 선택·액션 열

- **체크박스/라디오** 열: 너비는 최소한으로, 헤더 정렬은 보통 가운데.
- **선택 열은 화면마다 옵션**: 어드민 공통 CSS에 `.admin-th-select` / `.admin-td-select`가 있으면, 해당 테이블의 **첫 열**에만 `<th class="admin-th-select">` / `<td class="admin-td-select">`와 `input type="checkbox"`를 조건부로 넣는다. 페이지 상단에 `SHOW_ROW_CHECKBOX_COLUMN` 같은 상수로 켜고 끄는 패턴을 쓸 수 있다(예: `AdminMemberManagement.jsx`).
- **아이콘만 액션**(수정·삭제): 버튼형일 경우 **터치/클릭 영역** 최소 약 32~36px 유지(가독성·접근성).
- **행 내 아이콘 버튼 통일 (`src/assets/styles/kl-buttons.css` — `.kl-table-icon-btn` 등, `global.css`에서 전역 로드)**  
  - **크기·간격**: `kl-buttons.css`의 `.kl-table-icon-btn` 및 관련 규칙(히트 영역·SVG 크기). 행 내 액션 SVG는 Lucide 기본 24px에 의존하지 않도록 통일한다.  
  - 기본 베이스: `.kl-table-icon-btn` (히트 영역·라운드·포커스 링). 행 내 `svg` 크기는 `--kl-table-action-icon-size`로 통일.  
  - **편집·일반**: `.kl-table-icon-btn--neutral` — 기본 `var(--color-text-secondary)`, 호버 시 삭제와 같은 방식의 연한 채움 + `var(--color-text-primary)`.  
  - **삭제·위험**: `.kl-table-icon-btn--danger` — 기본 레드 **`var(--color-icon-danger)` (#dc2626) 고정 계열**; 호버만 `color-mix` + `--color-icon-danger-emphasis`.  
  - **승인·긍정**: `.kl-table-icon-btn--success` — `var(--color-icon-success)` / `var(--color-icon-success-emphasis)`(`kl-tokens-theme-map.css`); 호버는 danger와 동일하게 `color-mix` 연한 톤.  
  - **어드민** 테이블(`.admin-table` 하위)에서는 `admin-common.css`가 위 색을 `--admin-text-*` / `--admin-color-danger*` 로 덮어씀(성공은 `--admin-color-success*`).
  - 로딩 스피너: `.kl-table-icon-btn__spin` 부착.
- **삭제 등 위험 동작**: 위 danger 변형 클래스 사용. 하드코딩 대신 토큰 우선.

---

## 7. 배지·필(pill)·토글

- **필**: `border-radius: var(--radius-sm)`; 가로 패딩은 `var(--spacing-xs)` ~ `var(--spacing-sm)`, 세로는 밀도에 맞게 조정.
- **채우기형 강조(예: Admin 역할)** 색: 가능하면 `--control-pill-active-*` 패턴과 **Part 2**의 pill 안내를 참고.
- **토글 + 텍스트**: 스위치는 MUI 또는 기존 공통 컴포넌트와 통일.

---

## 8. 툴바(검색·필터·정렬)

- 한 줄 배치를 기본으로 하고, 요소 간 `gap`은 `var(--spacing-sm)` ~ `var(--spacing-md)`.
- 페이지 상단 여백·폭은 **Part 3**의 본문 패딩과 맞춘다.

---

## 9. 하단(건수·페이지네이션)

- 요약 문구: `var(--font-size-xs)`, `var(--color-text-secondary)` (어드민은 `admin-common.css`의 `--admin-font-sm` 등).
- **3열 그리드 권장**: `admin-table-footer` — 좌측 요약(`admin-table-footer__start`), **가운데** 페이지네이션(`admin-table-footer__center`), 우측은 이후 옵션(필터·뷰 전환 등)용으로 **비워 둘 수 있는 슬롯**(`admin-table-footer__end`, `1fr / auto / 1fr` 그리드로 가운데 정렬이 흐트러지지 않게 함). 컴포넌트: `AdminTableFooter.jsx`.
- 테이블과 같은 시각적 카드로 묶을 때: `admin-table-card`로 감싼 뒤 안에 `admin-table-wrap` + `AdminTableFooter` 순서(카드는 **border** 위주, 그림자 없음).

### 9.1 페이지당 행 수(클라이언트 페이지네이션)

- **화면마다 원하는 노출 수를 다르게 둘 수 있다.** 전역 CSS나 단일 설정이 아니라, **목록 화면 JSX마다** 상수로 두는 방식이 일반적이다.
- **관례**: 해당 파일 상단에 `PAGE_SIZE` 또는 `ROWS_PER_PAGE` 등 이름을 정해 두고, `slice`로 현재 페이지 데이터를 만들 때와 **총 페이지 수·「전체 N명 중 a–b명 표시」** 문구를 계산할 때 **같은 상수**를 사용한다.
- **예시**: `src/pages/admin/AdminMemberManagement.jsx` — `const PAGE_SIZE = 15`.
- **확장**: 여러 메뉴가 동일한 숫자만 공유하면 `src/pages/admin/` 아래 `constants.js`(또는 유사 모듈)에 한 번만 정의해 각 페이지에서 import 해도 된다. 메뉴별로 다르면 **파일별 상수**만 유지하면 된다.

---

## 10. 구현 시 주의

- `table td` 전역 한 번에 스타일 지정은 피하고, **화면 루트 클래스** 또는 **CSS Modules** 범위 안에서 적용한다 (`css-design-tokens.md` 전역 셀렉터 주의와 동일).
- **MUI Table** 사용 시 `size="small"` 등으로 위 표의 **밀집** 단계에 가깝게 맞추고, theme에서 셀 패딩·폰트를 토큰과 연결할 수 있다.

---

## 11. 목업·요청 시

열 목록·밀도 단계·레퍼런스 링크는 **부록 B** §5와 함께 적어 두면 구현 협의가 빨라진다.


---

팀 내 실수 방지용 요약입니다. 상세 규격은 **Part 8**, 토큰은 **Part 2**를 따른다.

---

## 1. 왜 이 문서가 필요한가

표·액션 버튼은 **페이지마다 조금씩만 달라도** 유지보수 비용과 접근성 결함이 누적된다. 아래는 **피해야 할 패턴**과 **대안**이다.

---

## 2. 피해야 할 것 (자주 나는 실수)

### 2.1 표 마크업을 페이지마다 복사만 하고 클래스만 살짝 바꾸기

- **문제**: `data-table-spec`·공통 클래스와 어긋나고, 패딩·열 폭·헤더 정렬이 화면마다 달라진다.
- **대안**:
  - 동일 패턴이면 **같은 루트 클래스**(`admin-table-card`, `domain-mgmt-table-card` 등)와 **문서화된 열 클래스**를 재사용한다.
  - 새 화면이면 규격 문서에 **열 목록·밀도**를 한 줄이라도 추가한 뒤 구현한다.

### 2.2 클릭 가능한 영역을 `<div onClick>` 로만 처리하기

- **문제**: 키보드 포커스·Enter 동작·스크린 리더 **버튼 역할**이 빠지기 쉽다.
- **대안**: 실제 버튼은 **`<button type="button">`** + 필요 시 `aria-label`. 링크 이동만 `<a href>`.

### 2.3 아이콘만 있는 버튼에 이름 없음

- **문제**: 보조 기술 사용자에게 동작이 전달되지 않는다.
- **대안**: `aria-label` 또는 시각적으로 숨긴 텍스트. 프로젝트 공통은 [kl-buttons.css](../src/assets/styles/kl-buttons.css)의 `.kl-table-icon-btn` 패턴 참고.

### 2.4 표를 `div` + CSS 그리드로만 흉내 내기 (데이터 표인 경우)

- **문제**: 표 의미·열 헤더 관계가 DOM에 없어 진입이 어렵다.
- **대안**: **데이터 표**는 `<table>`, `<thead>`, `<tbody>`, `<th scope="col">` 등 시맨틱 마크업 사용.

---

## 3. 작업 전 체크리스트 (짧게)

- [ ] 새 목록 화면이면 `data-table-spec.md` 밀도·열 정의 확인
- [ ] 셀 간격은 **`th` / `td`의 `padding`**·토큰으로 조정 (열 너비만 `colgroup` 등으로 조정하는 경우가 많음)
- [ ] 긴 목록 + `kl-main-sticky-head` 가 있는 페이지에서 **열 제목을 스크롤에 고정**할 경우: 메인 표 **`thead th`** 에 `position: sticky`·`top: var(--kl-list-sticky-thead-top)` 등(상단 블록 높이와 맞게 페이지 CSS에서 변수 조정). 고정이 필요 없으면 적용하지 않아도 됨.
- [ ] 헤더 정렬: **`admin-common.css`** 에서 **마지막 `th`만 우측**, **그 외 `th`는 좌측**(`thead tr > th:not(:last-child)` / `th:last-child`). 비마지막 열을 가운데로 둘 때만 해당 `th`에 **`admin-col-center`**. 본문 숫자·뱃지 중앙은 `td`에 **`admin-col-center`** (인라인 `style` 금지 권장).
- [ ] 클릭 요소는 `button` / `a`, 아이콘 전용은 `aria-label`
- [ ] 포커스 링은 `:focus-visible`, 색만으로 상태 구분하지 않기
- [ ] 긴 텍스트 열 말줄임: `data-table-spec.md` §5.1 — `.admin-table` 안에서는 **`_ellipsis`** 클래스를 **해당 `th`/`td`에만** 옵인(전역 일괄 적용 금지)
- [ ] 한 페이지 행 수: 클라이언트 페이지네이션은 **해당 페이지의 `PAGE_SIZE`(등) 상수**로 조절 — **메뉴(화면)마다 값이 달라도 됨** (`data-table-spec.md` §9.1)
- [ ] 콘텐츠 내부 스크롤을 얇게: **`textarea`는 전역** 동일 규칙(`kl-scrollbar-thin.css`) — 그 외 래퍼는 클래스 **`kl-scrollbar-thin`** · 토큰은 `kl-tokens-core.css`의 `--kl-scrollbar-*` · BaseModal Paper 최소 높이는 `--base-modal-paper-min-height`(기본 340px, alert/confirm 제외)

---

## 4. Cursor / 코드 리뷰와 같이 쓰기

- 저장소 **`.cursor/rules/table-ui-pitfalls.mdc`** — JSX 작업 시 에이전트가 같은 원칙을 참고하도록 함.
- PR 시 이 문서 **§2·§3** 을 리뷰 체크리스트로 붙여도 된다.

---

## 5. 열 너비 리사이즈 훅 (`useResizableColumns`)

`<table>`에서 **헤더 열 경계를 드래그해 인접 두 열의 너비를 조절**할 때 사용한다. 가로(열 너비)만 해당하며, **본문(`td`)에는 핸들을 두지 않고 `thead`의 `th`에만 둔다**는 팀 관례를 따른다.

### 5.1 위치·역할

| 항목 | 내용 |
|------|------|
| 파일 | `src/hooks/useResizableColumns.jsx` |
| On / Off | 옵션 **`enabled`** (기본 `true`). `false`이면 `colgroup`을 렌더하지 않고, 리사이즈 동작은 모두 무시된다. |
| 저장 | **`storageKey`**를 넘기면 드래그 종료 후 열 너비 배열(JSON)을 `localStorage`에 저장한다. 화면·표마다 **키를 다르게** 부여한다. |
| 성능 | 드래그 중에는 `<col>` DOM만 갱신하고, **`mouseup` 시 한 번만** React state와 저장소를 갱신한다. |

### 5.2 옵션 요약

| 옵션 | 타입 | 설명 |
|------|------|------|
| `defaultWidthsPx` | `number[]` | 열별 초기 너비(px). 열 개수 = 표의 `<col>` 개수와 동일해야 한다. |
| `minWidthsPx` | `number[]` | 열별 최소 너비(px). **`defaultWidthsPx`와 같은 길이** 필수. |
| `storageKey` | `string` (선택) | 없으면 새로고침 후에도 너비 유지 안 함. |
| `enabled` | `boolean` (선택, 기본 `true`) | **`false`**: 리사이즈 비활성. 표의 너비는 페이지 기존 CSS(% 등)에 맡긴다. |

### 5.3 반환값

| 이름 | 설명 |
|------|------|
| `colGroup` | `<colgroup>` 노드. **`enabled === false`이면 `null`**. `<table>`의 자식 중 맨 앞에 둔다. |
| `startResize(boundaryIndex, event)` | **경계 인덱스** `boundaryIndex`는 “왼쪽 열 인덱스”(`i`와 `i+1` 사이). 마지막 열 오른쪽에는 핸들을 두지 않는다. `mousedown` 핸들러에 연결. |
| `widths` | 현재 열 너비 배열(px). 디버깅·테스트용으로 노출. |
| `enabled` | 전달한 옵션과 동일. |

드래그 시 **인접 두 열의 너비 합은 유지**된다(한쪽을 늘리면 다른 쪽이 줄어든다). 최소값은 `minWidthsPx`로 제한된다.

### 5.4 마크업·스타일 (필수 패턴)

1. **`table-layout: fixed`** 인 표에 사용한다.
2. `<table>` 직후 **`{colGroup}`** 삽입.
3. 헤더: 리사이즈할 열마다 **`kl-th-col-resizable`** 클래스를 `th`에 추가하고, 열과 열 사이마다 **`kl-col-resize-handle`** 요소를 둔다.  
   - **열이 `n`개이면 핸들은 최대 `n - 1`개**(마지막 열 오른쪽 제외).  
   - `boundaryIndex`는 `0 … n-2` (왼쪽부터 경계 번호).
4. 핸들 예시 (실제 인덱스는 표마다 다름):

```jsx
<th className="… kl-th-col-resizable">
  열 제목
  <span
    className="kl-col-resize-handle"
    onMouseDown={(e) => columnResize.startResize(0, e)}
    onClick={(e) => e.stopPropagation()}
    aria-hidden
  />
</th>
```

5. **행 클릭으로 상세/모달이 열리는 표**에서는 핸들에서 **`click` 버블을 막지 않으면** 클릭이 행으로 전달될 수 있으므로, 위처럼 **`onClick={(e) => e.stopPropagation()}`** 를 핸들에 둔다.

6. 공통 스타일은 **`admin-common.css`**에 정의되어 있다: `.kl-th-col-resizable`, `.kl-col-resize-handle`. 어드민 페이지는 보통 이미 `admin-common.css`를 import 한다.

7. 페이지 전용 표에서 원래 **`th`/`td`에 `%`·`min-width`·`max-width`**를 쓰고 있다면, 리사이즈 모드일 때만 충돌을 피하기 위해 **모디파이어 클래스**(예: `foo-table--resizable`)로 해당 셀 규칙을 완화한다(`width`/`min-width`/`max-width`를 `auto`/`0`/`none` 등으로 조정). 도메인 관리(`DomainManagement.css`), 워크스페이스 관리(`AdminWorkspaceManagement.css`) 참고.

### 5.5 참고 구현

- `src/components/DomainManagement.jsx` — `enabled: true`, 저장 키 `kl-domain-mgmt-columns-v1`
- `src/pages/admin/AdminWorkspaceManagement.jsx` — `enabled: true`, 저장 키 `kl-admin-workspace-mgmt-columns-v1`

새 화면에 적용할 때는 위 파일의 **`colgroup` 배치·헤더 핸들·`--resizable` CSS** 패턴을 복제하는 것이 안전하다.

### 5.6 헤더 드래그가 동작하지 않을 때

- **증상**: 경계를 드래그해도 열 너비가 바뀌지 않거나, 핸들이 반응하지 않는다.
- **흔한 원인**: `.kl-col-resize-handle`이 `th` 오른쪽 밖으로 나가는데, **오른쪽 인접 `th`가 위에 그려져** 마우스 이벤트를 가로챈다.
- **프로젝트 내 조치**: `admin-common.css`에서 `.admin-table:has(.kl-col-resize-handle)` 인 표의 **`thead tr > th`에 좌측 열부터 더 높은 `z-index`**·`overflow: visible`을 적용해 두었다. 새 표에서도 같은 전역 규칙이 적용된다.

---

## 6. BasicTable 공통 스택 (MUI Table, 푸터, 페이지네이션)

**원시 `<table>` + `useResizableColumns`**(위 §5)와 별개로, **MUI `Table`** 기반의 공통 목록 컴포넌트가 있다. 새 어드민 목록을 이 패턴으로 맞출 때 아래를 따른다.

### 6.1 구성 파일

| 역할 | 경로 |
|------|------|
| 테이블 본체 | `src/components/common/BasicTable.jsx` |
| 테이블 스코프 SCSS | `src/components/common/BasicTable.module.scss` |
| 푸터·페이지네이션 전역 클래스 | `src/components/common/BasicTable.global.css` |
| 하단 바(3열 그리드) | `src/components/common/BasicTableFooter.jsx` |
| 이전·번호·다음 UI | `src/components/common/BasicTablePaginationNav.jsx` |
| 열 너비 드래그(MUI 표용) | `src/hooks/useBasicTableColumnResize.js` |

`BasicTable.jsx`는 `BasicTable.global.css`를 import 하므로, **`BasicTable` 또는 `BasicTablePaginationNav`를 쓰는 화면**에서는 별도로 전역 CSS를 붙이지 않아도 페이지네이션·푸터 요약 클래스가 적용된다.

### 6.2 레이아웃(가로 스크롤)

- 바깥 래퍼에 **`basic-table-shell`** + 가로 스크롤(`overflow-x: auto` 등, 페이지 CSS에서 `member-mgmt-table-shell`처럼 조합).
- **권장**: 셸은 **테이블(`BasicTable`)만** 감싼다. `BasicTableFooter`는 셸 **밖**(카드 안 형제)에 두면, 푸터는 고정 폭으로 두고 표만 가로 스크롤할 수 있다.
- `BasicTable`의 **`tableFooter` 내장 옵션**을 켜면 테이블과 푸터가 `Fragment`로 형제가 된다. 이 경우에도 **셸이 푸터까지 감싸지 않도록** 페이지 구조를 맞춘다.

### 6.3 `BasicTable` props 요약

| props | 설명 |
|--------|------|
| `columns` | `{ id, label, width?, align?, ellipsis?, resizeBoundaryAfter? }[]`. `resizeBoundaryAfter`가 숫자이고 `onColumnResizeMouseDown`이 있으면 해당 열 오른쪽에 리사이즈 핸들. |
| `data` | 행 객체 배열. `id`가 있으면 행 key로 사용. |
| `renderCell` | `( { column, row, rowIndex } ) => ReactNode` — `undefined`/`null`이면 `row[column.id]` 문자열·숫자 표시. |
| `onColumnResizeMouseDown` | `useBasicTableColumnResize`의 `startResize` 연결. |
| `className` | 루트 `TableContainer`에 추가 클래스(페이지별 밀도·카드 연동). |
| `emptyState` | 기본 `false`. `{ variant?: 'default' \| 'search', message?, hint? }` — `data.length === 0`일 때 **thead는 유지**하고 본문 한 행에 `TableEmptyState`(문구 기본: 「등록된 데이터가 없습니다」)를 가로·세로 중앙에 렌더. |
| `tableFooter` | 기본 `false`. 내장 푸터를 쓸 때만 객체(아래 6.4). |

**빈 목록(권장):** `TableEmptyState solo`로 표 전체를 갈아끼우지 말고, `BasicTable`에 `data={rows}`와 함께 `emptyState={{ variant: hasFilters ? 'search' : 'default' }}`만 넘긴다. 참고: [PromptList.jsx](../../src/prompt/components/prompts/PromptList.jsx).

### 6.4 내장 푸터 `tableFooter` (선택)

- **표시 조건**: `tableFooter`가 객체이고 **`enabled === true`** 이며, `pagination`에 `page`, `totalPages`, `onPageChange`가 모두 있을 때만 렌더된다.
- **역할**: 테이블 아래에 `BasicTableFooter`를 붙이고, 가운데는 항상 `BasicTablePaginationNav`. `summary` → 좌측(`start`), `end` → 우측.
- **선택 props**: `pagination.prevLabel`, `pagination.nextLabel` (기본 이전/다음).

```jsx
<BasicTable
  columns={columns}
  data={rows}
  tableFooter={{
    enabled: true,
    summary: <span className="basic-table-footer-summary">…</span>,
    end: null,
    pagination: {
      page,
      totalPages,
      onPageChange: setPage,
    },
  }}
/>
```

내장 푸터를 쓰지 않을 때는 `tableFooter={false}` 로 두고, 페이지에서 `BasicTableFooter` + `BasicTablePaginationNav`를 **직접** 배치한다.

```jsx
import BasicTable, { BasicTableFooter, BasicTablePaginationNav } from '…/common/BasicTable';
```

### 6.5 `BasicTableFooter` · `BasicTablePaginationNav`

- **`BasicTableFooter`**: `start` | `center` | `end` 슬롯. 비워도 3열 그리드 유지(레이아웃 흔들림 방지).
- **`BasicTablePaginationNav`**: **UI 전용 컴포넌트**(훅 아님). `page` / `totalPages` / `onPageChange`는 **부모 state**에서 넘긴다. 번호 묶음·말줄임 로직은 컴포넌트 내부.
- **전역 클래스**(마크업 규약은 `BasicTable.global.css` 주석 참고): `basic-table-pagination`, `basic-table-page-cluster`, `basic-table-page-btn`, `basic-table-page-ellipsis`, 요약용 `basic-table-footer-summary`. 간격·타이포는 **토큰 파일**(`--spacing-*`, `--radius-*`, `--font-size-*` 등)을 쓴다.

### 6.6 열 리사이즈 `useBasicTableColumnResize`

- **원시 표용** `useResizableColumns`(§5)와 API가 다르다. MUI `BasicTable`에는 **`useBasicTableColumnResize`**만 연결한다.
- `definitions`에 열별 `defaultWidthPx`, `minWidthPx` 등을 두고, 반환된 `columns`를 `BasicTable`에 넘기고, `startResize`를 `onColumnResizeMouseDown`에 연결한다.
- 참고: `src/pages/admin/AdminMemberManagement.jsx`, `src/components/DomainManagement.jsx`(원시 표는 §5.5와 동일 파일명이나 패턴 구분).

### 6.7 사용자 관리 화면: 푸터 표시 플래그

`src/pages/admin/AdminMemberManagement.jsx` 상단 **`SHOW_MEMBER_TABLE_FOOTER`**:

- **`false`(현재 기본)**: `BasicTableFooter` 전체를 **렌더하지 않음**. 요약 문구·`BasicTablePaginationNav` JSX는 **소스에 유지**되어 있어, 나중에 상단으로 옮기거나 플래그만 `true`로 바꿔 다시 노출하기 쉽다.
- **`true`**: 푸터를 그리며, 좌측 요약 + 가운데 페이지네이션. 테이블 `data`는 **`PAGE_SIZE` 단위 슬라이스**(`paginatedMembers`), 푸터 숨김 시에는 **검색 결과 전체**(`filteredMembers`)를 넘기도록 `tableMemberRows`로 분기한다.

### 6.8 새 화면 작업 순서(체크리스트)

1. `data-table-spec.md`에서 밀도·열 정의 확인.
2. `useBasicTableColumnResize`로 열 정의·저장 키(`storageKey`) 결정.
3. 카드 + **`basic-table-shell`** 안에 `BasicTable` 배치; 푸터는 셸 밖 또는 `tableFooter` 사용 시 형제 관계 유지.
4. 클라이언트 페이지네이션 시 **`PAGE_SIZE` 상수**·`page` state·`totalPages`·`useMemo` 슬라이스 패턴을 사용자 관리와 동일하게 맞춘다.
5. 페이지네이션 UI는 **`BasicTablePaginationNav`** 재사용, 요약은 `basic-table-footer-summary` + `BasicTableFooter`의 `start`.
6. 토큰·스크롤바는 **Part 2**, `kl-scrollbar-thin` 규칙을 따른다.

### 6.9 `kl-main-sticky-head`와 `BasicTable` 헤더 셀의 `z-index` (본문이 스티키 제목 위로 비치지 않게)

- `BasicTable`에서 열 리사이즈가 켜진 열의 `th`에는 `z-index: 40 - colIndex` 식으로 **최대 40 근처**까지 올라갈 수 있다.
- 페이지 상단 블록 **`.kl-main-sticky-head`**(제목·툴바)가 `position: sticky`일 때는 이 값보다 **확실히 큰 `z-index`**(프로젝트에서는 **50**)를 두어, 스크롤 시 표 헤더·본문 텍스트가 스티키 블록 **위로 겹쳐 보이지 않게** 한다.
- 구현 참고: `src/components/common/PageHeader.css`

### 6.10 참고 화면: 시스템 설정 관리(`/admin/config`)

- **메뉴**: 어드민센터 → **시스템 설정 관리**
- **표**: 카테고리별로 `BasicTable`을 나누어 배치; 카테고리명은 표 **밖** 소제목(`section` + 제목 행), 표는 `basic-table-shell` + 카드형 래퍼로만 감쌈.
- **값 열**: 한 줄 + `text-overflow: ellipsis`; 실제로 잘린 경우에만 승인 관리와 동일한 **`Info`** 아이콘으로 `KlPopover`에 전문 표시(편집은 모달).
- **관리 열**: 수정은 도메인 관리와 동일 **`FilePen`** + `kl-table-icon-btn--neutral`; `kl-table-actions`의 간격은 `:root`의 `--kl-table-action-icon-gap`(기본 0)을 따른다.
- **툴바 필터**: MUI `Select`의 `sx`는 **`src/pages/admin/promptToolbarSelectSx.js`**의 `promptToolbarSelectSx`를 프롬프트 관리와 공유한다.



## Part 9 · Tooltip · Popover

<div style="font-size:12px;line-height:1.45">

**기준 코드** · `KlTooltip` — `src/components/common/KlTooltip.{jsx,module.scss}` · `KlPopover` — `src/components/common/KlPopover.{jsx,module.scss}` · 트리거 버튼 — `src/assets/styles/kl-buttons.css` (`kl-popover-icon-btn`, `kl-table-icon-btn`)

**상태** · 2026-05-20 — 표 관리 열·GNB·툴바·헤더 아이콘: `KlTableRowActions` / `KlIconButton` / `KlTooltip`. 표 셀 잘림 `title=`·NotebookDetail 등은 별도.

---

## I. 역할 구분 (먼저 읽기)

| 구분 | 트리거 | 닫기 | 내용 | 컴포넌트 |
|:--|:--|:--|:--|:--|
| **Tooltip** | 마우스 **호버**·키보드 **포커스** | 없음 (벗어나면 사라짐) | 1줄~짧은 라벨 (「수정」「삭제」「알림」) | **`KlTooltip`** |
| **Popover** | **`?` / `i` 클릭** | 바깥 클릭·`Esc`·**X**(선택) | 여러 줄·불릿·긴 설명 | **`KlPopover`** |

> **HTML `title="..."`** 은 브라우저 기본 툴팁(느리고, 위치·스타일 제어 불가, 화면 밖으로 잘림) → **`KlTooltip`으로 치환** 대상.  
> **`KlTooltip`과 `title`을 같이 쓰지 않는다** (이중 표시).

---

## II. Tooltip — `KlTooltip`

### 1. 용도

- 아이콘만 있는 버튼·접힌 LNB 메뉴·툴바 버튼·GNB 알림/로그아웃 등 **짧은 안내**
- 표 **셀**의 긴 텍스트 전체 보기는 Popover(`?`) 또는 별도 패턴 — `title`만 전체 문자열 넣는 방식은 선택(잘림 없으면 생략 가능)

### 2. 스타일 (한 곳에서 통일)

| 항목 | 위치 |
|:--|:--|
| 패널·화살표 | `KlTooltip.module.scss` (`--color-bg-secondary`, `--color-border-subtle`, `--color-text-primary`) |
| z-index | `.popper` — `1200` |

**스타일만 바꿀 때** → `KlTooltip.module.scss`(또는 공유 토큰 `kl-tokens-*`)만 수정하면, **`KlTooltip`을 쓰는 모든 화면에 반영**.

### 3. 주요 props

| prop | 기본 | 설명 |
|:--|:--|:--|
| `title` | (필수) | 툴팁 문구 |
| `children` | (필수) | 트리거 요소 1개 (`button`, `NavLink` 등) |
| `placement` | `'top'` | MUI placement — 위치별 표 아래 표 참고 |
| `enterDelay` | `200` | ms — LNB·표 액션은 `0` 권장 |
| `leaveDelay` | `0` | ms |
| `variant` | `'block'` | `'block'` LNB NavLink · `'icon'` 28px `kl-table-icon-btn` |
| `triggerClassName` | `''` | 페이지별 추가 클래스 (예: `lnb-tooltip-trigger`) |

### 4. 배치 가이드

| 위치 | `placement` | `enterDelay` | 비고 |
|:--|:--|:--|:--|
| LNB **접힘** (아이콘만) | `right` | `0` | 본문 쪽으로 열림 |
| 표 **관리 열** (우측) | `left` | `0` | 화면 밖으로 나가지 않게 |
| GNB·툴바 (상단) | `bottom` | `0`~`200` | |
| 기본 | `top` | `200` | |

LNB와 표 우측은 **같은 컴포넌트, placement만 다름** — LNB 설정을 표에 그대로 복사하면 안 됨.

### 5. 사용 예

```jsx
import KlTooltip from '../components/common/KlTooltip';

// 표 28px 아이콘 버튼
<KlTooltip title="삭제" placement="left" enterDelay={0} variant="icon">
  <button type="button" className="kl-table-icon-btn kl-table-icon-btn--danger" aria-label={`${label} 삭제`} …>
    <Trash2 … />
  </button>
</KlTooltip>
```

- 트리거에 **`title` 속성 금지**
- **`aria-label`** 은 접근성용으로 유지

### 6. 적용 현황 (코드)

| 영역 | 방식 |
|:--|:--|
| LNB 접힘 메뉴 | `MainLayout.jsx` — `wrapLnbTooltip` + `KlTooltip` |
| LNB 접기 버튼 | `KlTooltip` |
| 고객센터 표 관리 열 | `SupportTableAdminActions.jsx` (1:1 문의·FAQ·공지) |
| 그 외 표·GNB·툴바 | 대부분 아직 HTML `title=` (이관 예정) |

---

## III. Popover — `KlPopover`

### 1. 용도

- **클릭**으로 여는 설명 패널
- 카테고리 설명(`?`), 거절 사유, 워크스페이스 프롬프트 8종, 값 열 전문 보기 등

### 2. 스타일

| 항목 | 위치 |
|:--|:--|
| 패널 | `KlPopover.module.scss` — `--color-bg-secondary` 등 (밝은 카드 톤) |
| 닫기 X | `showCloseButton` — 우상단, `--color-text-secondary` |
| 닫힘 애니메이션 | MUI `Fade` — 닫을 때 앵커·내용 유지 후 `onExited`에서 정리 |

**스타일만 바꿀 때** → `KlPopover.module.scss` (+ 필요 시 페이지 `panelClassName`은 **레이아웃만**).

### 3. 주요 props

| prop | 기본 | 설명 |
|:--|:--|:--|
| `open` | — | 표시 여부 |
| `anchorEl` | — | 클릭한 요소 |
| `onClose` | — | 닫기 핸들러 |
| `anchorReference` | `'anchorEl'` | `'anchorPosition'` — 앵커 DOM이 바뀌는 테이블 행 등 |
| `anchorPosition` | — | `{ top, left }` (뷰포트 기준) |
| `showCloseButton` | `false` | 긴 설명·워크스페이스 프롬프트 등 `true` |
| `panelClassName` | `''` | **내용·너비**만 (색은 `.panel` 토큰) |

### 4. 트리거

| 트리거 | 클래스·아이콘 |
|:--|:--|
| 설명 `?` / `i` | `kl-popover-icon-btn` + Lucide `HelpCircle` 16px — `src/assets/styles/kl-buttons.css` |

Popover는 **호버 Tooltip이 아님** — `KlTooltip`으로 바꾸지 않음.

### 5. 적용 현황 (코드)

| 화면 | 비고 |
|:--|:--|
| 시스템 설정 | 카테고리 `?` + `KlPopover` |
| 승인 관리 | 거절 사유 `?` |
| 워크스페이스 관리 | 프롬프트 8종 — `showCloseButton`, `panelClassName`으로 너비 조절 |
| 프롬프트 목록 등 | 일부 MUI `Popover` 직접 사용 — 추후 `KlPopover` 통일 검토 |

---

## IV. 표 관리 열 구조 (`KlTableRowActions`)

```
KlTooltip
    ↑
KlIconButton       ← 28px 버튼 1개 + 툴팁
    ↑
KlTableRowActions  ← `.kl-table-actions` + kind 프리셋 배열
```

### kind 프리셋 (`tableActionKinds.js`)

| kind | 기본 툴팁 | 톤 |
|:--|:--|:--|
| `mailResend` | 인증 메일 재발송 | neutral |
| `unlock` / `lock` | 잠금 해제 / 잠금 | neutral |
| `approve` | 승인 | success |
| `reject` | 거절 | danger |
| `share` | 공유 설정 | neutral (`accent: true` 가능) |
| `edit` | 수정 | neutral |
| `delete` | 삭제 | danger |
| `rename` | 제목 수정 | neutral |
| `custom` | (직접 지정) | (직접 지정) |

```jsx
<KlTableRowActions
  actions={[
    { kind: 'edit', onClick, ariaLabel: `${name} 수정` },
    { kind: 'delete', onClick, ariaLabel: `${name} 삭제` },
  ]}
/>
```

- `tooltip`·`tone`·`icon`·`accent`·`loading`으로 프리셋 덮어쓰기.
- 조건부 액션: `[ cond && { kind: 'unlock', ... }, ... ].filter(Boolean)`.
- 고객센터: `SupportTableAdminActions` = edit+delete 래퍼.

| 컴포넌트 | 쓰는 곳 |
|:--|:--|
| `KlTableRowActions` | 표 **관리** 열 |
| `KlIconButton` | GNB·툴바·헤더 (`buttonClassName` 지정) |
| `KlTooltip` 직접 | LNB `NavLink` 등 |

---

## V. 이관 순서 (권장)

| 단계 | 작업 |
|:--|:--|
| 1 | `KlIconButton` · `KlTableRowActions` 정의 |
| 2 | 표 관리 열 페이지 → `KlTableRowActions` |
| 3 | GNB·툴바 → `KlIconButton` |
| 4 | **Part 10** · 본 문서 갱신 |
| 5 | (선택) 셀 `title=` — 잘릴 때만 툴팁 vs 제거 정책 결정 |

**Part 10** — **손대는 화면만** 이관.

---

## VI. 하지 말 것

- Popover에 필요한 **긴 설명**을 Tooltip 호버에 넣기
- Tooltip에 **닫기(X)** (호버 UI와 맞지 않음)
- `title=` + `KlTooltip` **동시** 사용
- 페이지마다 Popover **배경색 `#hex` 하드코딩** — SCSS 토큰·`KlPopover` / `KlTooltip` 사용
- 표 우측 버튼에 LNB와 동일하게 `placement="right"` 만 사용 (화면 밖 이탈)

---

## VII. 체크리스트

- [ ] 짧은 아이콘 안내는 `KlTooltip` (또는 예정 `KlIconButton`)이고 `title=` 없음
- [ ] `?` 클릭 설명은 `KlPopover` + `kl-popover-icon-btn`
- [ ] 우측 표 액션 툴팁은 `placement="left"` (또는 `KlTableRowActions` 사용)
- [ ] 스타일 변경은 `KlTooltip.module.scss` / `KlPopover.module.scss`만 수정
- [ ] registry·본 문서가 단계 완료 후 갱신됨

---

## VIII. 연관 문서

| 문서 | 관계 |
|:--|:--|
| **Part 6** | 전면 차단 모달 — 본 spec과 별 레이어 |
| **Part 5** | `kl-btn`, `kl-table-icon-btn` |
| **Part 8** | 표·관리 열 |
| **Part 10** | 표준/레거시 표 |
| **Part 2** | `:root` 토큰 |

</div>



## Part 10 · 이관·표준 레지스트리

전체 코드를 한 번에 바꾸지 않고, **규칙을 정한 뒤 손대는 화면만** 표준으로 맞춥니다.

**관련:** **Part 10** · **README**

---

## 1. 기본 원칙

| # | 규칙 |
|---|------|
| 1 | **신규·수정 화면**은 **Part 10**의 **표준**만 사용한다. 레거시 패턴을 새로 추가하지 않는다. |
| 2 | **기존 화면**은 버그 수정·기능 추가 등으로 **해당 파일을 열었을 때만** 그 파일 범위에서 표준으로 이관한다. |
| 3 | **전면 일괄 리팩터**는 하지 않는다. (별도 프로젝트로 합의한 경우만 예외) |
| 4 | **토큰 추가·변경**(`kl-tokens-*`, `kl-variables.css`)은 제안 → 사용자 컨펌 → 적용 (`.cursor/rules/ui-ux-design-tokens.mdc`) |
| 5 | spec 충돌 시 우선순위: **본 가이드(Part 0~11)** > `ui-history` 과거 문구 |

---

## 2. 본문·모달 (구 Surface/Overlay 구분 폐지)

| 구분 | 의미 | 가이드 |
|------|------|--------|
| **본문·툴바** | `kl-page`, 목록, 필터 | Part 4·5·7 |
| **모달** | `BaseModal`, `useDialog` — **레이아웃만** Part 6 | 안의 컨트롤은 Part 4·5와 **동일 클래스** |

같은 `--kl-control-*` 토큰·`kl-input` / `kl-btn` 조합을 쓰고, **부모 레이아웃**만 다르다.

---

## 3. 이관 트리거 (언제 맞출까)

다음 중 하나에 해당하면 **그 PR/작업 안에서** registry 표준으로 맞춘다.

- 해당 화면 UI를 사용자가 명시적으로 정리 요청한 경우  
- 같은 파일에서 폼·표·모달·툴바를 이미 수정하는 경우  
- 버그가 레거시 마크업/스타일에서 발생해 표준으로 고치는 것이 더 안전한 경우  

**이관하지 않아도 되는 경우**

- 한 줄 주석·문구만 변경  
- 로직만 변경하고 UI 마크업·클래스를 건드리지 않음  
- registry에 **예외 등록**된 전용 UI (모달 내 미리보기 표, `KlCategorySelectInput` 등)

---

## 4. 문서·코드 작업 순서

1. **README** — 카테고리 확인  
2. **Part 10** — 표준·레거시 확인  
3. Surface 또는 Overlay spec  
4. 코드 수정 + 화면 QA  
5. (선택) 사용자 요청 시 [ui-history2.md](ui-history2.md) 기록  

---

## 5. Surface 컨트롤 클래스 (2026-05-22~)

**설계:** Part 4·5 (본 가이드)  
**1차 파일럿:** Part 11 (Audit Log)

| 규칙 | 내용 |
|------|------|
| 신규 Surface | `kl-btn` / `kl-input` + **variant + size** (긴 `kl-btn--*` 단독 modifier 금지) |
| CSS | docs·스타일은 **로컬**; remote는 **jsx** 위주 반영 시 className은 가이드에 맞춰 정리 |
| 레거시 | `kl-btn--*`, `.toolbar-bundle__submit` 등 **별칭 유지** 가능 — 일괄 삭제 금지 |
| 토큰 | 토큰 파일 변경은 기존과 동일 — 컨펌 후 |

---

## 6. 백로그 (문서화만, 코드는 별도 착수)

공통 레이아웃 정리 후 **한 화면씩** 진행 예정.

| 순서 | 항목 | 비고 |
|:---:|------|------|
| 0 | ~~`BasicTable` 빈 목록(thead 유지 + 본문 중앙)~~ | ✅ `emptyState` prop · `dev-guide-table-ui.md` §6.3 |
| 0b | **Audit Log** → `kl-btn` / `kl-input` 체계 | 파일럿 — **Part 11** |
| 1 | ~~`PromptList` → `BasicTable`~~ | ✅ 구분 A (2026-05-19) |
| 2 | `HistoryTab`, `VersionHistoryPanel` | 프롬프트 상세 |
| 3 | `KlSelect` 일반화 + 모달/본문 select 통일 | `KlModalSelect` 확장 |
| 4 | `SemanticOptionsEditor` | 라우트 없음 — 삭제·통합 검토 |

---

## 7. 폐지·통합된 문서

| 문서 | 처리 |
|------|------|
| [../overlay/migration-plan-legacy.md](../overlay/migration-plan-legacy.md) | 1차 모달 인프라 계획 — **아카이브**, 신규 이관은 본 문서 + registry |
| [system-outline-legacy.md](./system-outline-legacy.md) | 구 체크리스트 — **README + governance**로 대체 |

---

## 8. 작업 이력

- **현행 기록:** [ui-history2.md](ui-history2.md)  
- **아카이브:** [ui-history.md](ui-history.md)  
- **갱신:** 사용자 **명시적 요청 시만** (`.cursor/rules/ui-history-on-request.mdc`)


---

**무엇을 써야 하는지**, **레거시는 어디까지 허용하는지**의 단일 표입니다.  
신규·수정 시 **표준**만 추가하고, 레거시는 **해당 파일을 열 때만** **Part 10**에 따라 이관합니다.

**관련:** **Part 10** · **README**

---

## 범례

| 상태 | 의미 |
|------|------|
| **표준** | 신규·수정 시 사용 |
| **레거시** | 기존 유지 가능, 신규 추가 금지, 손댈 때 이관 |
| **예외** | 특수 UI — registry에 사유 명시, 무리한 통일 금지 |

---

## Surface (본문·Page)

| UI | 표준 | 레거시 | 문서 |
|----|------|--------|------|
| 페이지 래퍼 | `kl-page`, `kl-page-header`, `kl-page-title` | — | **Part 7** |
| 목록 툴바 | `table-toolbar`, `search-area` | — | **Part 7** |
| 본문 input/textarea | **`kl-input` + variant + size** (`gray-outline`, `md` 등) | `kl-form-control`, `.toolbar-field-input`, 인라인 스타일 | **Part 4·5** · **Part 4** |
| 본문 select | `KlSelect` (도입 예정) | `.toolbar-select`, 네이티브 `<select>` | **Part 4** |
| 본문 버튼 | **`kl-btn` + variant + size** (`primary-full`, `gray-outline`, `gray-fill`, `md` 등) | `kl-btn--*`, `.toolbar-bundle__submit`, MUI `Button` on page | **Part 4·5** · **Part 5** |
| 툴바 필터 묶음 | `.toolbar-bundle` + `kl-input` / `kl-btn` | `.toolbar-bundle__submit` | **Part 4·5** · **Part 11** |
| 데이터 표 | `BasicTable` + `basic-table-shell` | MUI `Table` 직접, `admin-table` | **Part 8** |
| 빈 목록 | `TableEmptyState` (thead 유지 개선 예정) | `solo`로 thead 사라짐 | **Part 8** |

---

## Overlay (모달)

| UI | 표준 | 레거시 | 문서 |
|----|------|--------|------|
| 모달 껍데기 | `BaseModal` | MUI `Dialog` 직접 | **Part 6** |
| alert/confirm/prompt | `useDialog` | `window.alert` 등 | **Part 6** |
| 모달 폼 레이아웃 | `kl-modal-form`, `*-form-row` | — | **Part 4** |
| 모달 select | `KlModalSelect` | 네이티브 `<select>` in modal | **Part 4** |
| 모달 버튼 | MUI `Button` in `actions` | — | **Part 6** |
| 모달 paper 520px | `supportFormModalPaperSx` 등 | — | `src/components/common/modal/supportCsModalPaper.js` |
| 호버 툴팁 (짧은 안내) | **`KlTooltip`** | HTML `title=`, MUI `Tooltip` 직접 | **Part 9** |
| 클릭 설명 (`?` / `i`) | **`KlPopover`** + `kl-popover-icon-btn` | MUI `Popover` 직접, 페이지별 panel 색 하드코딩 | **Part 9** |
| 표 관리 열 (아이콘 액션) | **`KlTableRowActions`** + **`KlIconButton`** | 페이지별 `kl-table-actions` 복붙, HTML `title=` | **Part 9** |
| 고객센터 표 (수정·삭제) | **`SupportTableAdminActions`** (`KlTableRowActions` 래퍼) | — | 동일 |

---

## 공통·기반

| 항목 | 위치 | 문서 |
|------|------|------|
| 디자인 토큰 | `kl-tokens-core.css`, `kl-tokens-theme-map.css` | **Part 2** |
| 컨트롤 토큰 | `kl-variables.css` | **Part 4** |
| Surface 버튼·인풋 클래스 | `kl-buttons.css`, `kl-forms.css` (`kl-input` 등) | **Part 4·5** |
| 앱 레이아웃 | Admin shell, sidebar | **Part 3** |
| 분할 패널 | `SplitPane` 패턴 | **부록 A** |

---

## 코드 위치 (빠른 참조)

| 컴포넌트 | 경로 |
|----------|------|
| `BasicTable` | `src/components/common/BasicTable.jsx` |
| `TableEmptyState` | `src/components/common/TableEmptyState/` |
| `BaseModal` | `src/components/common/modal/BaseModal.jsx` |
| `KlModalSelect` | `src/components/common/modal/KlModalSelect.jsx` |
| `useDialog` | `src/hooks/useDialog.js` (또는 프로젝트 내 동일 역할) |
| `KlTooltip` | `src/components/common/KlTooltip.jsx` |
| `KlIconButton` | `src/components/common/KlIconButton.jsx` |
| `KlTableRowActions` | `src/components/common/table/KlTableRowActions.jsx` |
| `tableActionKinds` | `src/components/common/table/tableActionKinds.js` |
| `KlPopover` | `src/components/common/KlPopover.jsx` |
| `SupportTableAdminActions` | `src/components/support/SupportTableAdminActions.jsx` |

---

## 백로그 (구분 A — 표 이관)

공통 레이아웃 이후 **한 화면씩**. 상세는 **Part 10**.

| 우선순위 | 파일 | 현재 | 목표 |
|:---:|------|------|------|
| 1 | ~~`src/prompt/components/prompts/PromptList.jsx`~~ | ~~MUI `Table`~~ | ✅ `BasicTable` (2026-05-19) |
| 2 | `src/prompt/components/history/HistoryTab.jsx` | MUI `Table` | `BasicTable` |
| 3 | `src/prompt/components/common/VersionHistoryPanel.jsx` | MUI `Table` | `BasicTable` |
| 4 | `src/pages/admin/SemanticOptionsEditor.jsx` | `admin-table` | 통합·삭제 검토 |
| 5 | `src/components/PromptManagement.jsx` | 미사용 | 삭제 검토 |

**이미 `BasicTable`:** 회원·워크스페이스·시맨틱 split·FAQ·QnA·공지·도메인 등 (목록은 `dev-guide-table-ui.md` 참고).

---

## 예외 등록

| UI | 사유 |
|----|------|
| 모달 내 미리보기·에디터 전용 표 | 읽기 전용·레이아웃 고정 — `BasicTable` 강제하지 않음 |
| `KlCategorySelectInput` 등 복합 필드 | 카테고리 트리·검색 — 단순 `KlModalSelect` 대체 불가 |
| 프롬프트 에디터 영역 | 전용 UX — 별도 spec 없으면 터치 시만 정리 |

---

## 갱신 규칙

- 표준 추가·레거시 승격 시 **본 파일 + 해당 spec**을 함께 수정한다.  
- 대규모 이관 완료 시 [ui-history2.md](ui-history2.md)에 사용자 요청으로 기록할 수 있다.



## Part 11 · 파일럿·백로그

**상태:** 1차 파일럿 적용 완료 (2026-05-22)  
**기준 문서:** Part 4·5 (본 가이드)

어드민 **Audit Log** (`AdminAuditLog.jsx`)를 **새 버튼·인풋 클래스 체계**의 첫 적용 화면으로 삼습니다.  
다른 목록 화면으로 퍼뜨기 **전에** 여기서 DOM·톤·remote 병합 리스크를 검증합니다.

---

## 1. 범위

| 포함 | 제외 |
|------|------|
| 페이지 헤더 제목 `Audit Log`, 새로고침 `kl-btn gray-outline md icon-only` | API·페이지네이션 state·필터 로직 변경 |
| `table-toolbar` 필터 묶음 + 초기화 | `BasicTable` 열 정의·셀 렌더 |
| `BasicTableFooter` + `BasicTablePaginationNav` | MUI 모달 |
| 페이지 SCSS에서 **필드별 너비** (부모) | SYSOP·다른 어드민 목록 일괄 적용 |

---

## 2. 목표 마크업 (툴바)

```html
<div class="table-toolbar">
  <div class="toolbar-left">
    <span class="kl-table-toolbar-summary">총 <strong>N</strong>건</span>
  </div>
  <div class="toolbar-right">
    <div class="toolbar-bundle">
      <div class="toolbar-bundle__fields">
        <div class="toolbar-bundle__field"><!-- 또는 toolbar-field-group --></div>
          <label class="toolbar-field-group__label" for="audit-filter-entity">Entity</label>
          <input id="audit-filter-entity" type="text" class="kl-input gray-outline md" … />
        </div>
        <!-- Action, Actor 동일 -->
      </div>
      <button type="button" class="kl-btn gray-fill md" disabled>검색</button>
    </div>
    <button type="button" class="kl-btn gray-outline md">초기화</button>
  </div>
</div>
```

### className 매핑 (현재 → 목표)

| 요소 | 현재(레거시) | 목표 |
|------|-------------|------|
| Entity/Action/Actor input | `toolbar-field-input` | `kl-input gray-outline md` |
| 검색 | `toolbar-bundle__submit` | `kl-btn gray-fill md` |
| 초기화 | `kl-btn` | `kl-btn gray-outline md` |

---

## 3. 너비 (페이지 SCSS)

공통: `kl-input { width: 100%; }`  
페이지 예 (`AdminAuditLog.css`):

```css
/* 예시 — 값은 QA 후 조정 */
.audit-log-toolbar__field--entity { flex: 0 1 200px; min-width: 120px; }
.audit-log-toolbar__field--action { flex: 0 1 120px; min-width: 96px; }
.audit-log-toolbar__field--actor { flex: 0 1 200px; min-width: 120px; }
```

부모에 클래스를 두고 내부는 `toolbar-field-group` + `kl-input`만 쓴다.

---

## 4. 검색 버튼 (로직 — 참고)

- `disabled`: `filters`(trim) ≠ `appliedFilters`(trim) 일 때만 해제.  
- Enter: 동일 조건에서만 적용.  
- **UI만 본 파일럿;** 로직 변경은 기존 동작 유지.

---

## 5. CSS 작업 체크리스트 (컨펌 후)

- [x] `kl-buttons.css` — `primary-full`, `gray-outline`, `gray-fill`, `md` 등 정의 + `toolbar-bundle__submit` 별칭  
- [x] `kl-forms.css` — `kl-input`, `gray-outline`, `md` + `.toolbar-field-input` 별칭 (`kl-input.css`는 스텁)  
- [x] `kl-layout-toolbar.css` — 툴바·검색 레이아웃 (`TableToolbar.css`는 스텁)  
- [x] `AdminAuditLog.jsx` — className 교체  
- [x] `AdminAuditLog.css` — 필드 부모 너비  
- [ ] 화면 QA: 검색·초기화·input **높이 `md` 정렬** (브라우저 확인)

---

## 6. 완료 기준

- [ ] 설계 문서와 실제 className **일치**  
- [ ] 레거시 클래스 없이도 동작 (별칭 제거 시뮬레이션 optional)  
- [ ] LNB·페이지 제목 `Audit Log` 유지  
- [ ] remote jsx 병합 시 **충돌 최소화** (jsx만 오면 CSS 충돌 없음)

---

## 7. 변경 이력 (문서)

| 날짜 | 내용 |
|------|------|
| 2026-05-22 | 파일럿 spec 초안 |



## 부록 A · Split pane

## 1. 개요

**좌측 패널 + 세로 리사이저 + 우측 패널** 구조에서, 사용자가 가운데 선을 드래그해 좌측 너비(%)를 조절할 때 사용한다.

| 구분 | 표 열 리사이즈 | 패널 리사이즈 (본 문서) |
|------|----------------|-------------------------|
| 훅 | `useResizableColumns` | `useSplitPaneResize` |
| UI | `BasicTable` 헤더 핸들 | `SplitPane` 세로 separator |
| 단위 | px (열 너비 배열) | % (좌측 비율) |

---

## 2. 공통 파일

| 경로 | 역할 |
|------|------|
| `src/hooks/useSplitPaneResize.js` | 드래그·% clamp·`localStorage` 저장 (`loadSplitPanePercent`, `saveSplitPanePercent` export) |
| `src/components/common/SplitPane/SplitPane.jsx` | 좌·우 슬롯 + 리사이저 DOM |
| `src/components/common/SplitPane/SplitPane.module.scss` | flex 레이아웃·구분선·패널 간 `gap`(12px) |
| `src/components/common/SplitPane/SplitPane.global.css` | 드래그 중 `body.kl-split-pane-resizing` 커서·선택 방지 |

**import**

```jsx
import SplitPane from '../../components/common/SplitPane';
// 또는
import SplitPane from '../../components/common/SplitPane/SplitPane';
```

`SplitPane.jsx`를 import하면 `SplitPane.global.css`가 함께 로드된다.

---

## 3. 기본 사용법

### 3.1 최소 예시

```jsx
function MyTwoPanelPage() {
  return (
    <div className="my-page-root">
      <SplitPane
        left={<aside>좌측 콘텐츠</aside>}
        right={<main>우측 콘텐츠</main>}
        defaultLeftPercent={40}
        minLeftPercent={20}
        maxLeftPercent={70}
        percentStorageKey="my_page_split_percent"
      />
    </div>
  );
}
```

### 3.2 `SplitPane` props

| prop | 기본값 | 설명 |
|------|--------|------|
| `left` | (필수) | 좌측 React 노드 |
| `right` | (필수) | 우측 React 노드 |
| `leftCollapsed` | `false` | `true`면 좌측을 `collapsedLeftWidthPx` 고정, **리사이저 숨김** |
| `defaultLeftPercent` | `45` | 최초·저장값 없을 때 좌측 % |
| `minLeftPercent` | `20` | 드래그 하한 % |
| `maxLeftPercent` | `60` | 드래그 상한 % |
| `collapsedLeftWidthPx` | `300` | 접힘 시 좌측 px |
| `minCollapsedLeftWidthPx` | `250` | 접힘 시 좌측 최소 px |
| `percentStorageKey` | — | 있으면 드래그 종료 후 %를 `localStorage`에 저장 |
| `onResizeStart` | — | 드래그 시작 직전 콜백 (접힘 해제 등) |
| `className` | `''` | 루트 추가 클래스 (높이·flex용) |
| `leftPaneClassName` | `''` | 좌측 패널 추가 클래스 |
| `rightPaneClassName` | `''` | 우측 패널 추가 클래스 |
| `resizerAriaLabel` | `패널 너비 조절` | separator 접근성 라벨 |

---

## 4. 페이지에 붙일 때 체크리스트

### 4.1 높이·flex 체인

`SplitPane` 루트는 `flex: 1; min-height: 0` 이다. **부모가 세로 공간을 넘겨줘야** 내부 스크롤이 동작한다.

```css
/* 페이지 루트 예시 */
.my-page-root {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* SplitPane에 줄 클래스 예시 */
.my-split-layout {
  flex: 1;
  min-height: 0;
}
```

```jsx
<SplitPane className="my-split-layout" left={...} right={...} />
```

### 4.2 좌·우 패널 내부

각 패널 콘텐츠도 `min-height: 0` + 필요 시 `overflow: auto` 를 갖도록 한다. 표·트리는 패널 **안쪽** 래퍼에서 스크롤한다.

### 4.3 `localStorage` 키

- 화면·탭마다 **서로 다른** `percentStorageKey` 를 쓴다.
- 예: `admin_semantic_object_split_percent`

### 4.4 접기·펼치기가 있는 화면

`SplitPane`은 **접힘 상태만** 받는다. `>` 버튼·카테고리 선택 시 접기 등 **업무 로직은 페이지**에서 처리한다.

```jsx
const [leftExpanded, setLeftExpanded] = useState(true);

<SplitPane
  leftCollapsed={!leftExpanded}
  left={leftPanel}
  right={rightPanel}
  percentStorageKey="my_page_split_percent"
/>
```

- **펼침:** 드래그로 저장된 % (또는 `defaultLeftPercent`) + 리사이저 표시
- **접힘:** `collapsedLeftWidthPx` 고정 + 리사이저 숨김

---

## 5. 접기·필터 등 페이지 전용 동작 (시멘틱 참고)

온톨로지 옵션(`SemanticEntitySplitPage`) 패턴:

| 동작 | 구현 위치 |
|------|-----------|
| `>` 펼치기 / `<` 접기 | `useSemanticEntityAdmin` → `leftExpanded` + `localStorage` (`leftExpandedKey`) |
| 카테고리 클릭 시 좌측 접기 | `onSelectCategory` → `setLeftExpandedPersist(false)` |
| 「전체」+ 펼침 | 필터 해제 후 `setLeftExpandedPersist(true)` |
| 드래그 % 저장 | `config.splitPanePercentKey` → `SplitPane` `percentStorageKey` |

**원칙:** 드래그·%·구분선은 공통 `SplitPane`, 버튼·필터·데이터는 페이지 훅/컴포넌트.

---

## 6. 훅만 직접 쓰는 경우

커스텀 마크업이 필요하면 `useSplitPaneResize`를 직접 사용할 수 있다. (`SplitPane`과 동일 로직)

```jsx
import { useRef } from 'react';
import { useSplitPaneResize } from '../../hooks/useSplitPaneResize';

function CustomSplit() {
  const containerRef = useRef(null);
  const { leftPaneStyle, handleResizerPointerDown, isResizerEnabled } = useSplitPaneResize({
    containerRef,
    leftCollapsed: false,
    percentStorageKey: 'custom_split',
  });

  return (
    <div ref={containerRef} style={{ display: 'flex' }}>
      <div style={leftPaneStyle}>...</div>
      {isResizerEnabled && (
        <div role="separator" onPointerDown={handleResizerPointerDown} />
      )}
      <div style={{ flex: 1 }}>...</div>
    </div>
  );
}
```

일반적으로는 **`SplitPane` 사용을 권장**한다 (gap·구분선·드래그 중 body 클래스 일원화).

---

## 7. 스타일·여백

- 패널 사이 **12px gap**은 `SplitPane.module.scss`의 `:root` `gap: calc(var(--spacing-sm) + var(--spacing-xs))` 로 고정한다.
- 구분선은 리사이저 `::after` 1px (`--color-border-subtle`), hover 시 accent.
- 페이지별로 좌·우 **추가 여백**이 필요하면 `leftPaneClassName` / `rightPaneClassName` 에 페이지 CSS를 붙인다. **음수 마진으로 gap을 상쇄하지 않는다.**

---

## 8. 피해야 할 것

| 하지 말 것 | 이유 |
|------------|------|
| `SplitPane` 없이 flex만 두고 드래그 로직 복사 | gap·저장·드래그 중 커서 불일치 |
| `percentStorageKey` 를 여러 화면이 공유 | 한 화면에서 조절한 %가 다른 화면에 적용됨 |
| 부모 높이 없이 `SplitPane`만 배치 | 패널이 0 높이·스크롤 깨짐 |
| 접힌 상태에서 리사이저만 노출 | 현재는 `leftCollapsed` 시 리사이저 비표시 — 접기는 토글로 |
| 표 열 리사이즈 훅과 혼동 | `useResizableColumns` ≠ `useSplitPaneResize` |

---

## 9. 신규 화면 적용 순서 (요약)

1. 좌·우 콘텐츠를 컴포넌트/JSX로 분리
2. 페이지 루트에 **flex + `min-height: 0`** 적용
3. `SplitPane`으로 감싸고 `percentStorageKey` 지정
4. (선택) 접기 버튼이 있으면 `leftCollapsed` 상태를 페이지에서 관리
5. 좌·우 패널 내부 스크롤·표 영역 QA
6. 새로고침 후 `localStorage` % 유지 확인

---

## 10. 체크항목

**Q. 상하(행) 분할도 되나요?**  
A. 현재 훅·컴포넌트는 **세로(좌·우) 전용**이다. 상하 분할이 필요하면 별도 옵션·훅 확장이 필요하다.

**Q. MUI `Drawer`와 함께 써도 되나요?**  
A. 가능하다. `SplitPane`은 MUI 비의존 div flex이므로, Drawer **밖** 본문 영역에 두면 된다.

**Q. 모바일에서는?**  
A. 좁은 뷰포트에서는 접기만 쓰거나, `maxLeftPercent`·`collapsedLeftWidthPx`를 페이지 CSS 미디어쿼리와 함께 조정하는 방안을 검토한다. (공통 컴포넌트 기본값은 데스크톱 어드민 기준)



## 부록 B · 목업

디자인·개발 전문가가 아니어도, **같은 형식으로 자료만 정리해 주시면** 구현 단계에서 해석 비용이 크게 줄어듭니다. 이 문서는 그 **최소 규칙**만 담았습니다.

---

## 1. 이 문서를 쓰는 이유

| 목표 | 설명 |
|------|------|
| 부담 줄이기 | 완벽한 디자인 파일이 아니어도 됩니다. **표 + 스크린샷 + 짧은 메모**면 충분한 경우가 많습니다. |
| 삽질 줄이기 | “느낌만” 전달하면 구현자마다 다르게 만듭니다. **열 이름·행 상태·버튼 이름**만 정해져도 통일이 쉬워집니다. |

---

## 2. 작업 전에 한 번만 보면 좋은 문서 (프로젝트 규칙)

구현 시 맞춰야 할 **간격·폰트·색의 기준**이 정해져 있습니다. 목업에서 숫자를 적을 때 아래를 참고하면 나중에 수정이 적습니다.

| 문서 | 내용 |
|------|------|
| **Part 3** | 화면 여백, 브레이크포인트, 제목 단계 느낌 |
| **Part 2** | 색·간격 이름 규칙 (`--spacing-*`, `--radius-*` 등) |
| **README** | 폼·버튼·모달을 정리할 때 큰 그림 |

**목업 작업자 필수 역량은 아닙니다.** 시간이 없으면 §5 체크리스트만 채워 주셔도 됩니다.

---

## 3. 산출물 형식 (택 1 이상)

### A. 피그마가 있는 경우 (가장 좋음)

- 한 프레임에 **데스크톱 기준** 화면 1개 이상.
- 가능하면 **컴포넌트 이름**을 한국어로 간단히 (예: `테이블_헤더`, `행_호버`).
- **링크만** 넘겨도 되지만, 비밀 파일이면 PNG 내보내기 + §5 표를 함께 주세요.

### B. 피그마가 없는 경우

다음 세 가지를 세트로 주시면 됩니다.

1. **스크린샷** — 현재 화면 또는 참고 서비스 캡처 (가능하면 전체 페이지).
2. **간단 표** — §5의 “테이블 정리표” 또는 “화면 구역 표”.
3. **메모 5줄 이내** — 예: “왼쪽은 버전 목록, 오른쪽은 편집”, “모바일에서는 표 가로 스크롤 허용” 등.

---

## 4. 화면 한 장당 최소 체크리스트

복사해서 빈칸만 채워 주세요.

```
[ 화면 이름 ] ___________________________
[ 목적 한 줄 ] ___________________________
[ 참고 링크·이미지 파일명 ] _______________

□ 상단: 뒤로가기 / 제목 / 부가 정보(코드·카테고리 등) 중 무엇이 필요한지
□ 탭·단계: 있다면 이름 순서 (예: EDITOR → TEST → HISTORY)
□ 본문: 좌우 분할인지, 한 열인지
□ 표(목록): 열 이름·대표 데이터 타입 (글자/숫자/날짜/버튼)
□ 하단: 저장·실행 등 버튼 이름과 순서 (왼쪽→오른쪽)
□ 빈 데이터일 때: 문구 또는 일러스트 필요 여부
```

---

## 5. 테이블(목록) 목업 — 정리표 (복사용)

열이 많을수록 이 표를 채우면 도움이 됩니다.

| 열 이름(한글) | 내용 예시 | 정렬(좌/중/우) | 너비 느낌(좁음·보통·넓음) | 비고 |
|----------------|-----------|----------------|---------------------------|------|
| | | | | |

추가로 적어 주시면 좋은 것:

- **헤더 행**: 배경색 있음/없음, 글자 굵게 여부.
- **본문 행**: 줄무늬(zebra) 필요 여부, **호버** 시 배경 살짝 바뀌는지.
- **선택 행**: 라디오/체크로 한 줄만 고를지.
- **액션 열**: 아이콘만인지, 글자 버튼인지 (보기·삭제 등).

숫자를 모르겠으면 “**카드 목록과 비슷한 여백**”처럼 **비교 대상만** 적어 주셔도 됩니다.

행 높이·글자 크기·헤더 스타일을 프로젝트 토큰과 맞추려면 **Part 8**를 함께 참고합니다.

---

## 6. 자주 나오는 화면 유형 — 메모 예시

### 6.1 상세 화면 + 왼쪽 목록 + 오른쪽 편집

- **왼쪽 최소 너비**가 너무 좁으면 표가 깨집니다. “표는 최소 ○○px”처럼 느낌만 적어 주세요.
- **어느 쪽이 세로 스크롤**인지 (보통: 왼쪽 목록만 / 오른쪽만 / 둘 다).

### 6.2 필터 + 표 + 건수

- 필터는 **한 줄**에 둘지, **두 줄**까지 허용할지.
- “총 N건” 위치: 표 위 오른쪽 vs 왼쪽.

### 6.3 탭(EDITOR / TEST / HISTORY)

- 탭을 바꿔도 **상단 메타(코드·이름)** 는 같은지.
- 각 탭마다 **주 버튼**이 다른지 (저장 vs API 테스트 등).

---

## 7. 피하면 좋은 것

- **같은 의미인데 화면마다 다른 단어** (예: “삭제” vs “제거”) — 하나로 통일해 주시면 감사합니다.
- **아무 설명 없는 캡처 한 장만** — 가능하면 §4 체크리스트 또는 §5 표를 함께 부탁드립니다.
- **특수한 애니메이션**를 기본으로 요구하지 않기 — 필요하면 “있으면 좋음” 정도로 분리해 적어 주세요.

---

## 8. 전달할 때 함께 넘기면 좋은 것

- 작업 **범위** (이번에 목업만 할 페이지 목록).
- **우선순위** (1순위 화면부터 번호).
- **참고 URL** 또는 **이전에 합의한 스샷** 파일 이름.

---

## 9. 문의

규칙이 애매하면 **표는 비워 두고 스크린샷 + 질문 목록**만 주셔도 됩니다. 구현 담당자가 이 가이드와 맞춰 질문을 드릴 수 있습니다.


---

### B.2 체크리스트 (prompt management)

`docs/mockup/guide.md` §4 화면 한 장당 최소 체크리스트 복사본을 채운 예시입니다.

---

## 작업 의도

> A 화면을 리디자인하려고 하는데, 다음을 반영해줄 수 있을까?

---

## 체크리스트 (§4 복사본 완성)

| 항목 | 내용 |
|------|------|
| **화면 이름** | 어드민센터 > 프롬프트 관리 |
| **목적 한 줄** | 조직 내 사용자 계정과 권한을 중앙에서 관리 |
| **참고 링크** | 기존 스크린샷 or 피그마 링크 |

---

## 문서 구성

- [ ] **상단**: 페이지 제목 / 조회 결과 건수 / 우측 "사용자 추가" 버튼
- [ ] **탭/단계**: 없음
- [ ] **본문**: 좌우 분할 아님, 한 열 테이블
- [ ] **표(목록)**: 이메일 / 이름 / 권한 / 가입일 / 액션(수정·삭제)
- [ ] **하단**: 저장·초기화 버튼 없음 (행별 즉시 반영)
- [ ] **빈 데이터일 때**: "등록된 사용자가 없습니다" 문구 표시

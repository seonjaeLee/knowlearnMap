# 목록 화면 UI 규격 (PageHeader + 툴바 + 표)

인수인계·비대면 작업용 문서입니다. **목록형 페이지**의 상단 구조(제목·툴바·표)를 한곳에 정리합니다.  
변경 **이력**은 `ui-history.md`가 아니라, 규칙은 이 문서·연관 spec을 보세요.

## 연관 문서

| 문서 | 언제 보나 |
|------|-----------|
| [ui-system-outline.md](./ui-system-outline.md) | UI 작업 **출발점** (전체 목차) |
| [dev-guide-table-ui.md](./dev-guide-table-ui.md) | **표 본문** (`BasicTable`, 푸터, 페이지네이션, 열 리사이즈) |
| [data-table-spec.md](./data-table-spec.md) | 표 **밀도·행 높이** 등 시각 규격(초안) |
| [css-design-tokens.md](./css-design-tokens.md) | `index.css` `:root` 변수 |
| [layout-guideline.md](./layout-guideline.md) | 본문 폭·브레이크포인트 |
| [modal-spec.md](./modal-spec.md) | 등록·수정 **모달** |

---

## 1. 이 문서의 범위

**포함**

- `kl-main-sticky-head` 안의 `PageHeader` + `table-toolbar` (검색·필터·보기 전환)
- 공통 클래스: `table-toolbar`, `toolbar-left`, `toolbar-right`, `search-area`
- CSS **어디를 고치면 여러 화면에 반영되는지**

**포함하지 않음**

- 표 셀·헤더·행 호버 → [dev-guide-table-ui.md](./dev-guide-table-ui.md)
- 노트북 상세·지식 그래프 등 **목록이 아닌** 화면

---

## 2. DOM 구조 (고정 패턴)

대부분의 관리·고객센터 목록은 아래 골격을 따릅니다.

```
.kl-page                         ← outlet 직계 공통 셸 (KlPage.css · MainLayout.css)
└─ .kl-main-sticky-head          ← 스크롤 시 상단 고정 (PageHeader.css)
   ├─ PageHeader / AdminPageHeader
   │    └─ .page-header           ← 제목·breadcrumb·우측 액션 버튼 (PageHeader.css)
   └─ .table-toolbar              ← 검색·필터·보기 전환 (TableToolbar.css)
        ├─ .toolbar-left         ← 보통 검색(search-area) 또는 안내 문구
        └─ .toolbar-right        ← 필터·정렬 등 (있을 때만)
└─ (본문)
   └─ .table-card → .basic-table-shell → BasicTable   ← 표는 sticky 영역 밖 (TableCard.css)
```

**예외**

| 화면 | 툴바 차이 |
|------|-----------|
| [DomainSelection.jsx](../src/pages/DomainSelection.jsx) | 검색 없음 — `.table-toolbar` 안에 `.infotxt`만 |
| [Home.jsx](../src/pages/Home.jsx) | `kl-main-sticky-head` 밖 `table-area` — `.table-toolbar--end` + `.toolbar-view-toggle` · `.toolbar-select` (헤더는 `admin-btn-primary`만) |
| [AdminConfigManagement.jsx](../src/pages/admin/AdminConfigManagement.jsx) | `table-toolbar` 없음 — 헤더 액션만 |
| [PromptList.jsx](../src/prompt/components/prompts/PromptList.jsx) | `.toolbar-left` 안에 `search-area` + MUI `Select` 필터 |

---

## 3. 공통 클래스 치트시트

| 수정 목적 | className | CSS 파일 |
|-----------|-----------|----------|
| 툴바 한 줄 레이아웃·간격 | `table-toolbar` | [TableToolbar.css](../src/components/common/TableToolbar.css) |
| 툴바 내용만 우측 정렬 | `table-toolbar--end` | 동일 |
| 툴바 좌측 묶음 | `toolbar-left` | 동일 |
| 툴바 우측 묶음 | `toolbar-right` | 동일 |
| 툴바 네이티브 select(32px) | `toolbar-select` | 동일 |
| 툴바 그리드·리스트 전환 | `toolbar-view-toggle` / `toolbar-view-btn` / `is-active` | 동일 |
| 검색 입력 박스(높이 38px 등) | `search-area` / `search-area-icon` / `search-area-input` | 동일 |
| 페이지 루트 셸 | `kl-page` · `kl-page--fill`(노트북) | [KlPage.css](../src/components/common/KlPage.css) |
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

검색 + 필터가 둘 다 있을 때 (FAQ·QnA):

```jsx
<div className="table-toolbar">
  <div className="toolbar-left">{/* search-area */}</div>
  <div className="toolbar-right">{/* support-filter 등 */}</div>
</div>
```

---

## 5. CSS 로드 지도 (전역 vs 페이지)

후임자가 **“스타일이 안 먹는다”** 할 때, import 위치를 먼저 확인합니다.

### 5.1 `main.jsx`에서 한 번 로드 (앱 전체)

| 파일 | 내용 |
|------|------|
| [index.css](../src/index.css) | `:root` 디자인 토큰·전역 리셋 |
| [styles/kl-scrollbar-thin.css](../src/styles/kl-scrollbar-thin.css) | 얇은 스크롤바 |
| [styles/kl-table-icon-actions.css](../src/styles/kl-table-icon-actions.css) | 표 행 아이콘 버튼 |
| [styles/kl-popover-icon-btn.css](../src/styles/kl-popover-icon-btn.css) | 팝오버 아이콘 버튼 |
| [styles/kl-modal-form.css](../src/styles/kl-modal-form.css) | 모달·KlModalSelect 폼 |
| **[TableToolbar.css](../src/components/common/TableToolbar.css)** | **`table-toolbar`, `search-area` 등** |

### 5.2 컴포넌트에서 로드 (해당 컴포넌트 쓸 때)

| 파일 | import 위치 |
|------|-------------|
| [PageHeader.css](../src/components/common/PageHeader.css) | `PageHeader.jsx` |
| [BasicTable.global.css](../src/components/common/BasicTable.global.css) | `BasicTable.jsx` |

### 5.3 페이지·기능별 CSS (그 화면만)

예: [AdminMemberManagement.css](../src/pages/admin/AdminMemberManagement.css), [SupportCenter.css](../src/pages/SupportCenter.css), [Home.css](../src/pages/Home.css) — 각 `jsx` 상단 `import './…css'`.

**운영 팁:** 예전 `app.css`에서 `@import` 하던 것과 같이, **전역 목록 chrome**은 `main.jsx` + 이 문서 §5.1만 보면 됩니다. 페이지 CSS는 **그 메뉴 전용**으로 두는 것이 맞습니다.

---

## 6. 대표 구현 예시 (정답 샘플)

새 목록 화면·리팩터 시 **아래 파일 구조를 참고**합니다.

| 용도 | 파일 |
|------|------|
| **표준** (검색 + BasicTable) | [AdminMemberManagement.jsx](../src/pages/admin/AdminMemberManagement.jsx) |
| 검색 + 필터 | [Faq.jsx](../src/pages/Faq.jsx) |
| 툴바 우측 정렬(보기·정렬) | [Home.jsx](../src/pages/Home.jsx) |
| 안내 문구만 | [DomainSelection.jsx](../src/pages/DomainSelection.jsx) |

스티키 헤더와 표 `z-index` 겹침: [dev-guide-table-ui.md §6.9](./dev-guide-table-ui.md) · [PageHeader.css](../src/components/common/PageHeader.css) `.kl-main-sticky-head`.

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
| 어드민 | AdminConfigManagement | — | — |
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

4. **표 헤더 배경·행 높이**  
   → [dev-guide-table-ui.md](./dev-guide-table-ui.md) · `BasicTable.module.scss`

5. **새 목록 메뉴 추가**  
   → §2 DOM + §4 마크업 + §6 `AdminMemberManagement.jsx` 복제 → 공통 클래스만 사용

6. **색·간격 숫자를 전역으로 바꾼다**  
   → [css-design-tokens.md](./css-design-tokens.md) · `src/index.css` `:root` (신규 토큰은 팀 합의 후)

---

## 9. 문서·코드 유지 규칙 (인수인계)

- 공통 클래스를 **새로 추가**하면 → 이 문서 §3 표에 **한 줄 추가**.
- `main.jsx`에 전역 CSS를 추가하면 → §5.1 표에 **한 줄 추가**.
- 화면별 일회성 스타일은 **이 문서에 넣지 않음** — 페이지 CSS 주석으로만 설명.
- 변경 이력은 **요청 시에만** [ui-history.md](./ui-history.md) (에이전트·자동 기록 금지 규칙 참고).

---

## 10. 향후 개선 (선택)

팀 합의 시 `src/styles/app-global.css`를 만들고 `main.jsx`의 §5.1 파일들을 `@import`로 묶을 수 있습니다.  
**소스 파일은 분리·로드 지점만 한곳**으로 모으는 방식이며, 동작은 현재와 동일합니다.

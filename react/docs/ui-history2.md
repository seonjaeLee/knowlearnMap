# UI 작업 히스토리 (2)

> **구조 안내:** `### N)` 번호는 **본 파일 안에서** 날짜별로 1부터 부여합니다. 최신 날짜는 **파일 하단**에 추가합니다.  
> **범위:** 2026-05-16부터 목록 화면 공통 chrome·관련 문서 정리를 기록합니다. 이전 이력은 [ui-history.md](./ui-history.md)를 참고합니다.  
> **문서 위치:** `docs/ui-history2.md` (2026-05-19 `docs/` 카테고리 재구성). 인덱스: [README.md](README.md).

## 2026-05-16

### 1) 목록 화면 툴바 래퍼 클래스 통일 (`table-toolbar`)

- **목적:** 메뉴별 `*-mgmt-toolbar`, `home-toolbar`, `support-toolbar`, `admin-toolbar` 등 분산된 툴바 래퍼를 하나의 공통 클래스로 맞춰, 레이아웃 변경 시 수정 지점을 단일화
- **영향:** `kl-main-sticky-head` 내 PageHeader 아래 검색·필터·보기 전환 영역; 워크스페이스·어드민·고객센터 목록 화면

#### JSX 변경
- `src/pages/Home.jsx` — `home-toolbar` → `table-toolbar table-toolbar--end`
- `src/pages/DomainSelection.jsx` — `domain-mgmt-toolbar` → `table-toolbar`
- `src/components/DomainManagement.jsx` — `domain-mgmt-toolbar` → `table-toolbar`
- `src/pages/admin/AdminWorkspaceManagement.jsx` — `workspace-mgmt-toolbar` → `table-toolbar`
- `src/pages/admin/AdminMemberManagement.jsx` — `member-mgmt-toolbar` → `table-toolbar`
- `src/prompt/components/prompts/PromptList.jsx` — `admin-toolbar` → `table-toolbar`
- `src/pages/NoticeList.jsx`, `Faq.jsx`, `QnaBoard.jsx` — `support-toolbar` → `table-toolbar`

#### CSS 변경
- `src/components/common/TableToolbar.css` — `.table-toolbar`, `.table-toolbar--end` 정의(신규)
- `src/pages/Home.css` — `.home-toolbar` 레이아웃 블록 제거
- `src/components/DomainManagement.css` — `.domain-mgmt-toolbar` 레이아웃 블록 제거
- `src/pages/admin/AdminWorkspaceManagement.css` — `.workspace-mgmt-toolbar` 레이아웃 블록 제거
- `src/pages/admin/AdminMemberManagement.css` — `.member-mgmt-toolbar` 레이아웃 블록 제거
- `src/pages/SupportCenter.css` — `.support-toolbar` 레이아웃 블록 제거
- `src/pages/admin/admin-common.css` — `.admin-toolbar` 레이아웃 블록 제거

#### 기타
- `src/main.jsx` — `TableToolbar.css` 전역 import 추가

---

### 2) 툴바 좌·우 영역 클래스 통일 (`toolbar-left`, `toolbar-right`)

- **목적:** `member-mgmt-toolbar-left`, `workspace-mgmt-toolbar-left`, `home-toolbar-right`, `admin-toolbar-left` 등 메뉴 전용 래퍼를 공통 좌·우 슬롯으로 통일
- **영향:** 툴바 내부 검색·필터·보기 전환 묶음; 고객센터 FAQ·QnA는 검색(`toolbar-left`) + 필터(`toolbar-right`) 구조로 정리

#### JSX 변경
- `src/pages/admin/AdminMemberManagement.jsx`, `AdminWorkspaceManagement.jsx` — `*-toolbar-left` → `toolbar-left`
- `src/components/DomainManagement.jsx` — `domain-mgmt-toolbar-left` → `toolbar-left`
- `src/prompt/components/prompts/PromptList.jsx` — `admin-toolbar-left` → `toolbar-left`
- `src/pages/Home.jsx` — `home-toolbar-right` → `toolbar-right`
- `src/pages/NoticeList.jsx` — `toolbar-left` + `search-area` 래핑
- `src/pages/Faq.jsx`, `QnaBoard.jsx` — `toolbar-left` / `toolbar-right` + 기존 `support-filter` 유지

#### CSS 변경
- `src/components/common/TableToolbar.css` — `.toolbar-left`, `.toolbar-right` 정의
- `src/pages/Home.css`, `DomainManagement.css`, `AdminWorkspaceManagement.css`, `AdminMemberManagement.css` — 메뉴별 `*-toolbar-left` 레이아웃 제거
- `src/pages/admin/admin-common.css` — `.admin-toolbar-left`, `.admin-toolbar-right` 레이아웃 제거
- `src/pages/Faq.css` — `.faq-page .admin-toolbar-right` → `.faq-page .toolbar-right`

---

### 3) 툴바 검색 영역 클래스 통일 (`search-area`)

- **목적:** `member-mgmt-search`, `workspace-mgmt-search`, `domain-mgmt-search`, `support-search`, `admin-search` 등 메뉴별 검색 박스 스타일을 `search-area` / `search-area-icon` / `search-area-input`으로 통일(searchArea)
- **영향:** 목록 툴바 검색창 높이(38px)·테두리·포커스 링; 검색 아이콘 크기 16px 기준 정렬

#### JSX 변경
- `src/pages/admin/AdminMemberManagement.jsx`, `AdminWorkspaceManagement.jsx`
- `src/components/DomainManagement.jsx`
- `src/prompt/components/prompts/PromptList.jsx` — 검색 마크업을 flex 인라인 패턴으로 통일(기존 absolute 아이콘 방식 제거)
- `src/pages/NoticeList.jsx`, `Faq.jsx`, `QnaBoard.jsx`

#### CSS 변경
- `src/components/common/TableToolbar.css` — `.search-area`, `.search-area-icon`, `.search-area-input`, 모바일 `max-width` 해제
- `src/pages/admin/AdminMemberManagement.css`, `AdminWorkspaceManagement.css`, `DomainManagement.css` — 메뉴별 `*-search*` 블록 제거
- `src/pages/SupportCenter.css` — `.support-search*` 블록 제거(필터 `.support-filter`는 유지)
- `src/pages/admin/admin-common.css` — `.admin-search*` 블록 제거

---

### 4) PageHeader 액션 영역 세로 정렬 보정

- **목적:** `.page-header`의 `align-items: flex-end`만 적용될 때 우측 액션 버튼 묶음이 제목 행 대비 아래로 처져 보이던 현상 완화
- **영향:** `PageHeader`를 쓰는 목록·설정 화면 헤더 우측 버튼

#### CSS 변경
- `src/components/common/PageHeader.css` — `.page-header-actions`에 `align-self: center` 추가

---

### 5) 시스템 설정 관리 — PageHeader 우측 액션 버튼 규격

- **목적:** 시스템 설정 헤더의 「캐시 갱신」「목록 새로고침」을 워크스페이스 관리와 동일 32px 높이로 맞추되, 캐시 갱신은 기존 `admin-btn-outline-success` 색 유지
- **영향:** `/admin/config` PageHeader `actions` 슬롯

#### JSX 변경
- `src/pages/admin/AdminConfigManagement.jsx` — `workspace-mgmt-header-actions` 래퍼 + `admin-btn` / `admin-btn-outline-success` / `admin-btn-icon`; `AdminWorkspaceManagement.css` import

#### CSS 변경
- `src/pages/admin/AdminWorkspaceManagement.css` — `.workspace-mgmt-header-actions`, `.workspace-mgmt-page` `--kl-table-action-hit-size: 32px` (헤더·툴바 공용)

---

### 6) 목록 화면 UI 규격 문서 추가 (`list-page-spec.md`)

- **목적:** PageHeader + `table-toolbar` + `search-area` + `BasicTable` 조합, CSS 로드 지도, 수정 FAQ를 한 문서에 정리
- **영향:** UI 수정 시 참조 문서; 코드 주석에서 문서 경로 링크

#### 문서 변경
- `docs/list-page-spec.md` — 신규(DOM 트리, 클래스 치트시트, `main.jsx` import 표, 적용 화면 목록, FAQ)
- `docs/ui-system-outline.md` — 「시작하기」표·연관 문서·작업 순서 §0에 `list-page-spec` 반영
- `docs/data-table-spec.md`, `docs/dev-guide-table-ui.md` — `list-page-spec` 링크 추가

#### CSS 변경 (주석)
- `src/components/common/TableToolbar.css`, `PageHeader.css` — 상단에 `docs/list-page-spec.md` 안내 주석

---

### 7) 워크스페이스 관리 — PageHeader 액션 래퍼 통일

- **목적:** 새로고침 아이콘 버튼에 `workspace-mgmt-header-actions` 래퍼 적용(시스템 설정·기타 헤더 액션과 동일 패턴)
- **영향:** `/admin/workspaces` PageHeader `actions`

#### JSX 변경
- `src/pages/admin/AdminWorkspaceManagement.jsx` — 헤더 새로고침을 `workspace-mgmt-header-actions`로 감쌈

---

## 2026-05-17

### 8) 팝업 구조 — `BaseModal` + paper·`kl-modal-form` 통합(고객센터·도메인·어드민 폼)

- **목적:** 메뉴별로 흩어진 오버레이·`paperSx`·폭 정의를 공통 모듈로 모으고, 콘텐츠는 `kl-modal-form` + 도메인 CSS로만 차이를 두어 팝업 골격·폼 컨트롤 규격을 한 줄로 맞춤
- **영향:** 고객센터 상세·작성, 도메인 관리 수정, 사용자·설정·공유 등 `BaseModal` 기반 폼 팝업; `modal-form-spec.md` / `modal-spec.md`와 동일 높이·테두리·포커스 토큰

#### 공통 모듈
- `src/components/common/modal/supportCsModalPaper.js` — **신규** · 고객센터·도메인·멤버·설정·Action 워크스페이스 등 **paper 폭·`paperClassName`·`paperSx`** 단일 정의(`SUPPORT_CS_MODAL_WIDTH`, `QNA_FORM_MODAL_WIDTH` 등)
- `src/components/common/modal/supportFormModalPaperSx.js` — 위 모듈 **re-export** 허브(작성·수정 모달 import 경로 통일)
- `src/components/common/modal/supportDetailModalPaperSx.js` — **신규** · 공지·FAQ·QnA **상세** 팝업 paper 공통

#### JSX 변경 (대표)
- `src/components/NoticeDetailModal.jsx`, `FaqDetailModal.jsx`, `QnaDetailModal.jsx` — `supportDetailModalPaperSx` + `contentClassName`에 `kl-modal-form` · head/body 분리(`CsDetailModal.css` 등)
- `src/components/NoticeCreateModal.jsx`, `FaqCreateModal.jsx`, `QnaCreateModal.jsx` — `noticeFormModalPaperSx` / `faqFormModalPaperSx` / `qnaFormModalPaperSx`
- `src/components/DomainManagement.jsx` — `domainFormModalPaperSx`
- 기타 어드민·공유·설정 폼 모달 — 동일 paper 모듈에서 폭·클래스 import

#### CSS 변경
- `src/components/CsDetailModal.css`, `QnaDetailModal.css` — 상세 head(메타)·body(본문)·footer 액션
- `src/assets/styles/kl-form-control.css`, `kl-form-readonly.css` — 모달·툴바 공용 input/select 규격(`--kl-control-*`)
- `src/assets/styles/kl-outlined-primary-btn.css` — 팝업·목록 하단 아웃라인 primary 버튼(공지 상세 「목록이동」 등)

#### 기타
- `docs/modal-form-spec.md`, `docs/modal-spec.md` — `kl-modal-form` 적용·Decision 제외 안내와 정합

---

### 9) 툴바·서브탭 공통 UI 재정의 (`kl-form-control` · `toolbar-input-composer` · 서브탭)

- **목적:** 목록 툴바의 검색·select와 **동일 32px·테두리·포커스**를 모달 밖 툴바에도 적용하고, **input+버튼 밀착** 패턴(노트북 채팅 composer 유사)을 재사용 가능한 클래스로 고정; 어드민 서브탭은 **아이콘+라벨 가로 정렬**·활성 시 **굵기 변경 없음**(탭 전환 시 흔들림 제거)
- **영향:** `TableToolbar.css` 전역; Action 관리 실행 이력 툴바; `admin-semantic-subtab` 사용 화면(온톨로지 옵션·Action 관리)

#### CSS 변경
- `src/assets/styles/kl-form-control.css` — `--kl-control-height` 등 토큰·네이티브 input hover/focus 배경 정리
- `src/components/common/TableToolbar.css`
  - `.toolbar-field-group`, `.toolbar-field-group__label` — 라벨 + 컨트롤 묶음
  - `.toolbar-input-composer` — 외곽 테두리 1개, 내부 input·버튼 **무간격 밀착**
  - **호버:** composer 테두리 `--kl-control-border-hover` ↔ 버튼 배경 동일색
  - **포커스(`:focus-within`):** 테두리 `--color-accent` ↔ 버튼 배경·글자 흰색
  - 기본 버튼: 연한 회색 배경 + 「조회」 텍스트(블루 솔리드 제거)
- `src/pages/admin/admin-common.css` — `.admin-semantic-subtab` `inline-flex` + `gap`; `.active` **font-weight 변경 제거**; `transition`을 color·border-color만

#### JSX 변경
- `src/pages/admin/AdminActionPage.jsx` — 실행 이력: `table-toolbar--end` 우측 · `Action ID` + `toolbar-input-composer`(input + **조회**)

---

### 10) Action 관리(`/admin/action`) — 목록·실행 이력·워크스페이스 모달

- **목적:** `window.prompt` 제거, **목록 화면 공통 chrome**(`table-area` · `BasicTable` · `kl-icon-label-btn` 새로고침) 적용, API 미연결 시 **로컬 더미**로 UI 검수; 실행 이력은 **Action ID 기준 조회** UX 명확화
- **영향:** Action 관리 메뉴(목록 탭 읽기 전용 · 실행 이력 탭); `VITE_ENABLE_ACTION_MOCK` · dev 시 이력 탭 ID `1` 자동 로드

#### JSX/JS
- `src/pages/admin/AdminActionPage.jsx`
  - 워크스페이스 ID — `BaseModal` 520px(`actionWsModalPaperSx`) · localStorage 유지
  - 서브탭 — `List` / `Clock` 아이콘 + 라벨
  - 목록 — `BasicTable` + `renderCell({ column, row })` · 툴바 요약(상단 `ws #` 제거) · footnote
  - 실행 이력 — `toolbar-input-composer` · `actionApi.logs(id)` / 더미 fallback
- `src/data/actionAdminMockData.js` — ws #71 Action 6건 · 이력 ID 1~6

#### CSS
- `src/pages/admin/AdminActionPage.css`
  - `table-area` flex·footnote는 표 카드 **밖**( `TableArea.css` 푸터 `+ div` 규칙 **예외** — 표 하단 보더 유지)
  - 페이지·로그 툴바 보조 스타일

#### 환경·문서
- `.env.local.example` — `VITE_ENABLE_ACTION_MOCK` · dev 이력 샘플 안내

---

## 2026-05-18

### 11) 좌·우 패널 드래그 리사이즈 공통화 (`SplitPane` · `useSplitPaneResize`)

- **목적:** 2패널 화면에서 세로 구분선 드래그로 좌측 너비(%) 조절을 재사용 가능하게 하고, 드래그 %·구분선·패널 간격을 한곳에서 유지
- **영향:** 신규·기존 좌·우 분할 레이아웃 전반(첫 적용: 온톨로지 옵션 시멘틱 탭)

#### 공통 모듈
- `src/hooks/useSplitPaneResize.js` — **신규** · 드래그·% clamp · `loadSplitPanePercent` / `saveSplitPanePercent`
- `src/components/common/SplitPane/SplitPane.jsx` — **신규** · `left` / `right` 슬롯 + `role="separator"` 리사이저
- `src/components/common/SplitPane/SplitPane.module.scss` — flex·`gap` 12px(`sm+xs`)·구분선 hover
- `src/components/common/SplitPane/SplitPane.global.css` — 드래그 중 `body.kl-split-pane-resizing`
- `src/components/common/SplitPane/index.js` — re-export

#### 문서
- `docs/dev-guide-split-pane.md` — **신규** · 적용 가이드·props·flex 높이 체인·접기 연동·체크항목(§10)

---

### 12) 온톨로지 옵션 — 시멘틱 split에 `SplitPane` 적용

- **목적:** 객체·관계·액션 탭의 카테고리(좌)·목록(우) 분할에 드래그 리사이즈 적용; `>` 펼침 기본 45%·접힘 300px·탭별 % 저장 유지
- **영향:** `/admin/semantic` 객체 & 카테고리 / 관계 & 카테고리 / 액션 & 카테고리

#### JSX/JS
- `src/pages/admin/semantic/SemanticEntitySplitPage.jsx` — `SplitPane` 사용 · 인라인 flex % 제거
- `src/pages/admin/semantic/useSemanticEntityAdmin.js` — `splitPanePercentKey` (object/relation/action 각각)
- `src/pages/admin/semantic/semanticEntityPageLabels.js` — 페이지 라벨 UTF-16 이스케이프(인코딩 안정)
- `AdminSemanticObjectPage.jsx` 등 래퍼 — `entityKey` + `headerIcon`만 전달

#### CSS
- `src/pages/admin/admin-common.css` — `.admin-semantic-split-layout` flex 높이만 · 좌측 `border-right` 제거(구분선은 `SplitPane`)
- `src/pages/admin/AdminSemanticPage.css` — `.admin-semantic-tab-panel` flex 체인

---

### 13) 시멘틱 split — 좌·우 패널·구분선 여백 보정

- **목적:** 리사이저 도입 후 패널이 구분선에 붙어 보이던 현상 완화 — 기존 split과 동일하게 구분선 좌우 12px 간격
- **영향:** `SplitPane` 사용 모든 화면(공통 `gap`)

#### CSS
- `SplitPane.module.scss` — 루트 `gap: calc(var(--spacing-sm) + var(--spacing-xs))` · 리사이저 음수 마진 제거

---

## 2026-05-19

### 14) UI 문서 카테고리 재구성 (`docs/`)

- **목적:** 토큰·Surface·Overlay·테이블·이력 등 역할별로 문서를 나누고, 신규 작업의 진입점을 `docs/README.md`로 통일
- **영향:** 기존 `docs/*.md` 경로는 **리다이렉트 스텁** 유지 · 현행 이력은 `docs/ui-history2.md`

#### 문서
- `docs/README.md` — 카테고리 인덱스·Surface/Overlay 이원 구조·빠른 찾기
- `foundation/`, `governance/`, `surface/`, `table/`, `overlay/`, `components/`, `mockup/`, `history/` — 본문 이동
- `migration-policy.md`, `component-registry.md` — 이관 백로그·표준 컴포넌트 표 갱신
- 구 `ui-system-outline` · 모달 마이그레이션 계획 → `*-legacy.md` 보존

---

### 15) 프롬프트 관리 목록 — `BasicTable` 이관

- **목적:** MUI `Table` 제거, 목록 화면 공통 chrome(`table-area` · `table-toolbar` · `BasicTable`) 적용
- **영향:** `/admin/prompts` 목록 · registry/migration-policy 백로그 #1 완료(구분 A)

#### JSX/JS
- `src/prompt/components/prompts/PromptList.jsx` — `BasicTable` + `renderCell` · `kl-table-toolbar-summary` · 설명 Popover 유지
- `src/prompt/constants/securityLevels.js` — 등급 라벨 상수
- `src/components/common/tableCellDisplay.jsx` — 빈 셀 `—` · `formatTableCellText` 공통화

#### CSS
- `src/prompt/components/prompts/PromptList.css` — **신규** · 검색 폭·표 `min-width`·설명 셀 말줄임

---

### 16) 목록 툴바 요약·정렬 공통화

- **목적:** 좌측 `총 N개` 요약 + 우측 검색·필터·버튼이 한 줄에서 **하단 정렬**되도록 툴바 규칙 보강
- **영향:** 시멘틱 split·프롬프트 목록·도메인 선택·어드민·고객센터 목록 등 `kl-table-toolbar-summary` 사용 화면

#### CSS
- `src/components/common/TableToolbar.css` — `:has(.kl-table-toolbar-summary)` flex·gap·`toolbar-right` 줄바꿈 억제
- `src/assets/styles/kl-split-panel.css` — **신규** · `kl-split-panel-head` / `kl-split-panel-title` (split 상단 중제목)

#### JSX (대표)
- `DomainSelection.jsx`, `DomainManagement.jsx`, `AdminMemberManagement.jsx` 등 — `table-toolbar` + 요약 문구 정리
- `scripts/patch-list-toolbar-summary.mjs` 등 — 동일 패턴 일괄 패치용 스크립트 추가

---

### 17) `BasicTable`·모달 paper 소폭 보강

- **목적:** 표 셀 밀도·빈 값 표시·고객센터 모달 폭 정의 정리
- **영향:** `BasicTable` 사용 목록 전반 · CS 상세/폼 모달

#### 코드
- `BasicTable.jsx` / `BasicTable.global.css` / `BasicTable.module.scss` — 셀·빈 목록 표시 보강
- `supportCsModalPaper.js` — CS·도메인·멤버 등 paper 폭·클래스 단일 모듈 확장
- `QnaDetailModal.jsx` · `QnaDetailModal.css` — 상세 레이아웃·스타일 미세 조정

---

## 2026-05-20

### 18) Tooltip·Popover 스펙·레지스트리

- **목적:** 호버 안내(Tooltip)와 클릭 설명(Popover) 역할·props·배치·스타일 수정 지점을 한 문서로 통일
- **문서:** [tooltip-popover-spec.md](tooltip-popover-spec.md) **신규** · [README.md](README.md) 「툴팁 · 팝오버」 빠른 찾기 · [component-registry.md](component-registry.md) — `KlTooltip`, `KlIconButton`, `KlTableRowActions`, `KlPopover`, `SupportTableAdminActions` 등록
- **규칙 요약:** HTML `title=` + `KlTooltip` 이중 사용 금지 · Popover는 `?`/`i` **클릭**(`kl-popover-icon-btn`) — Tooltip으로 대체하지 않음 · 스타일은 `KlTooltip.module.scss` / `KlPopover.module.scss` 한곳 수정으로 전파

---

### 19) `KlTooltip`·`KlIconButton`·표 관리 열 이관

- **공통:** `KlIconButton` — 28px 표 버튼·GNB·툴바용(`buttonClassName`) + `KlTooltip` · `KlTableRowActions` + `tableActionKinds.js`(mailResend, unlock/unlocked, lock, approve, reject, share, edit, delete 등) · `SupportTableAdminActions` → 내부 `KlTableRowActions`
- **`KlTooltip` 보강:** `open` 제어 · 메뉴·드롭다운 열림 시 호버 툴팁 숨김(Home `more-btn`, `ToolbarMoreMenu`, `NotificationBell` 등)
- **이관(대표):** LNB·GNB(`MainLayout`, 로그아웃·접기) · Home 보기 전환·메뉴 · 어드민 헤더·툴바 새로고침 · 회원·워크스페이스·업그레이드·설정·승인·도메인·프롬프트 목록·시멘틱 필터 등 — 브라우저 `title=` 제거
- **미이관:** 표 **셀** 긴 텍스트 `title=`(열 너비로 해결) · NotebookDetail·일부 Popover 직접 사용 화면은 기존 패턴 유지·추후 검토
- **Popover:** 기존 `KlPopover` 적용 화면(시스템 설정·승인·워크스페이스 프롬프트 등) 유지 — 스펙만 정리, 대량 치환 없음

---

### 20) NotebookDetail 패널 토글 툴팁

- **목적:** 좌·우 패널 접기 버튼을 `KlIconButton` + `kl-toolbar-icon-toggle` + `ChevronsLeft`로 통일(시멘틱 split과 동일 아이콘)
- **문구:** 툴팁·`aria-label` — **「접기」** / **「펼치기」** (패널 열림 여부)
- **CSS:** 접힘(40px) 시 `.panel-header` `justify-content: center`, `padding: 0` — 토글 아이콘 가운데 정렬
- **파일:** `NotebookDetail.jsx`, `NotebookDetail.css`

---

## 2026-05-22

### 21) 노트북 상세 — 채팅 영역 내부 스크롤·PageHeader 고정

- **목적:** 채팅 메시지가 길어질 때 `main-content` 전체가 스크롤되며 PageHeader·3열 레이아웃이 함께 밀리던 현상 수정 — 채팅은 `.chat-messages`만 스크롤, 상단 타이틀·breadcrumb은 고정
- **원인:** flex 행 자식(`.panel`) 기본 `min-height: auto`로 패널이 콘텐츠 높이만큼 커짐 · 바깥 스크롤 컨테이너가 `main-content`(`overflow-y: auto`) · `page-header` `sticky`만으로는 바깥 스크롤 시 고정 효과 부족
- **영향:** `/notebook/*` 노트북 상세(채팅 탭) · GNB·LNB·PageHeader·탭·페르소나·입력창은 고정 · 좌·우 `panel-body`는 기존처럼 각 패널 내부 스크롤

#### JSX
- `src/components/common/MainLayout.jsx` — 노트북 라우트 시 `main-content--notebook` 클래스 부여

#### CSS
- `src/components/common/MainLayout.css` — `main-content--notebook`: `main-content`·`main-content-scroll-inner` 세로 스크롤 차단 · `kl-page--fill`·outlet `overflow: hidden` · 노트북에서 `site-footer` 숨김
- `src/components/common/PageHeader.css` — `main-content-outlet-wrap--notebook > .kl-page--fill > .page-header`: `position: static`, `flex-shrink: 0`(sticky 해제·레이아웃 상단 고정)
- `src/components/NotebookDetail.css` — `.notebook-layout > .panel` `min-height: 0` · `.panel-center`·`.tab-content`·`.chat-container` flex 체인 · 탭·페르소나·입력 `flex-shrink: 0` · `.chat-messages`만 `overflow-y: auto`

---

### 22) 시멘틱 split — 좌측 패널 접힘 시 트리·툴바 확장 버튼 유지

- **목적:** 온톨로지(객체·관계·액션) 좌측 카테고리 패널을 접었을 때(약 300px) 행 트리 펼침/접힘(▸)과 툴바「모두 펼침/접음」아이콘이 사라지던 현상 수정
- **원인:** `collapsed={!leftExpanded}`일 때 툴바 버튼을 `!collapsed` 조건으로 숨김 · 이름 셀 `maxWidth`·`overflow: hidden`으로 토글 영역 클리핑 · 좁은 툴바 `flex-wrap: nowrap`으로 우측 버튼이 패널 밖으로 잘림
- **영향:** `AdminSemanticCategoryPage`(split 좌측 카테고리) · 패널 접힘·드래그 리사이즈·펼침 모두에서 트리·툴바 조작 가능

#### JSX
- `react/src/pages/admin/AdminSemanticCategoryPage.jsx` — 접힘 여부와 무관하게「모두 펼침/접음」표시 · 이름 셀 `admin-semantic-name-text` 래퍼 · 접힘 시 `maxWidth` 인라인 제거

#### CSS
- `react/src/pages/admin/admin-common.css` — `.admin-semantic-name-cell-inner` flex · `.admin-semantic-tree-toggle` `flex-shrink: 0` · `.admin-semantic-name-text` 말줄임
- `react/src/pages/admin/AdminSemanticPage.css` — `--collapsed` 툴바 wrap·`toolbar-right` shrink 방지 · 접힘 시 이름 셀 `overflow: visible`

---

### 23) SYSOP센터 — 사용자 관리 UI·권한 LNB·추가 팝업

- **목적:** SYSOP 전용 사용자 관리를 어드민 목록·공지 작성과 동일 chrome으로 맞추고, 도메인 운영자(SYSOP)가 어드민센터 LNB에 노출되지 않도록 권한 플래그 정리 · 사용자 추가·중복확인·등록 UX를 도메인 추가와 동일 패턴으로 통일
- **영향:** `/sysop/member` · 로그인 role `SYSOP`(예: igloo) — LNB는 워크스페이스·SYSOP센터·고객센터만 · `ADMIN`만 어드민센터

#### 권한·라우팅
- `react/src/context/AuthContext.jsx` — `isAdmin`: `role === 'ADMIN'`만(SYSOP 제외) · 로그인 후 `ADMIN`→`/`, 그 외→`/workspaces` · `memberApi.checkLoginId` / `memberApi.create` 복구
- `react/src/data/memberMockData.js` — 로컬 테스트용 `igloo`·`local` 도메인 더미 멤버

#### JSX
- `react/src/pages/sysop/SysopMemberManagement.jsx` — `kl-page` + `table-area`·`search-area` · `PageHeader` breadcrumb `SYSOP센터` · 우측 액션: `KlIconButton` 새로고침 + `kl-btn--primary`「사용자 추가」(공지「공지 작성」과 동일, 툴바 검색 옆 버튼 제거) · 행 액션 `KlTableRowActions` · 추가/수정 모달 `member-form-row`(520px `member-form-modal-paper`) · 로그인 ID `domain-input-group` + `admin-btn`「중복확인」+ `domain-validation-msg`(도메인 추가와 동일) · 등록은 중복확인 통과·비밀번호 일치 후 활성(SYSOP 로직: USER/VIEWER만·본인 도메인 고정 유지)

#### CSS
- `react/src/pages/admin/AdminMemberManagement.css` — `.member-form-required` · `.domain-input-group`·`.domain-validation-msg` (멤버 모달·SYSOP 추가 팝업 공유)
- `react/src/pages/sysop/SysopMemberManagement.jsx` — `components/admin/DomainManagement.css` import(중복확인 스타일)

---

## 2026-05-23

### 24) Map 마더 CSS 구조 — 토큰 분리·`global.css` 진입·에이전트 규칙

- **목적:** UI/UX 고도화를 Map에서 **마더 사이트**로 정리. `index.css`에 섞여 있던 토큰·전역 규칙을 **역할별 파일**로 이관하고, 나중에 knowlearnExp 등 다른 사이트는 **동일 키트 + 테마/overlay 한 파일**로 확장할 수 있게 기반 마련. (Exp 파일·jsx className 대량 이관은 **이번에 하지 않음**)
- **원칙:** 논의 → 사용자 컨펌 → 구현 · 기능 로직 변경 없음 · 파일명은 **역할** 기준(예시 `main.css` 그대로 따르지 않음)
- **영향:** `main.jsx` 전역 CSS 로드 방식 · 디자인 토큰 SSOT · 신규 채팅/에이전트 작업 시 `.cursor/rules/kl-css-architecture.mdc` 참조

#### 에이전트·문서 규칙
- `.cursor/rules/kl-css-architecture.mdc` **신규** (alwaysApply) — Map 마더, `global.css` 진입, 토큰 위치, 작업 순서, Exp 확장 시 fork 금지
- `.cursor/rules/ui-ux-design-tokens.mdc` — SSOT `index.css` → `kl-tokens-core` / `kl-tokens-theme-map` / `kl-variables`
- `.cursor/rules/workflow-confirm-before-implement.mdc` — 토큰 수정 경로 갱신
- `react/docs/README.md` — CSS 구조 규칙 링크
- `react/docs/kl-ui-guide.md` — Part 0 「Map 마더·멀티 사이트」·Part 1.2 현행 import 표 갱신

#### CSS · 진입점 (`react/src/assets/styles/`)
- **`global.css`** — 전역 진입(한 파일). `main.jsx`에서만 `import './assets/styles/global.css'`
- **`kl-tokens-core.css`** — spacing, radius, typography, transition, `--kl-control-height` 등 구조 토큰
- **`kl-tokens-theme-map.css`** — Map 브랜드 semantic 색·그림자·비활성·accent
- **`kl-variables.css`** — `--kl-control-*` (theme 참조)
- **`kl-legacy-modal.css`** — `index.css`에서 이관: `.modal-native-field`, `.modal-overlay`·`.modal-input` 등 레거시 네이티브 모달
- **`kl-ui.css`** — `@import './global.css'` 스텁(deprecated)
- **`index.css`** — `@import './assets/styles/global.css'` 위임만 (토큰·번들 본문 없음)
- 기존 번들 유지: `kl-reset-common`, `kl-forms`, `kl-buttons`, `kl-layout-toolbar`, `kl-layout-modal`, `kl-modal-form`, `kl-scrollbar-thin`, `kl-infotxt-note`, `kl-subtabs`, `kl-split-panel` + `KlPage.css` · `TableArea.css`를 `global.css`에서 순서대로 로드
- `kl-reset-common.css` — 전역 `@keyframes spin` 추가(일부 컴포넌트 `animation: spin`용)
- 미사용 **`km-*.css` 4개 삭제** (이전 턴)

#### 기타
- `react/src/main.jsx` — CSS import 8줄 → **`global.css` 1줄**
- `npm run build` 통과

---

### 25) (이전 턴) CSS 1단계 중간 작업 — UI 키트 파일 분리 (2026-05-22~23)

- **참고:** 항목 24와 같은 흐름의 선행·병행 작업. Audit Log 파일럿·버튼 variant(`kl-btn` + `gray-fill` / `gray-outline` + `md`) 등은 **jsx·기능 유지**, 스타일만 정리.
- **파일:** `kl-layout-toolbar.css`, `kl-layout-modal.css`, `kl-forms.css`, `kl-buttons.css`(`icon-only`, `ghost`), `TableToolbar.css` 스텁, `AdminAuditLog` 툴바 `kl-input` / `kl-btn` 조합
- **문서:** `kl-ui-guide.md` 통합본 유지 · 분산 spec 삭제

---

## 2026-05-23

### 1) 페르소나 관리 모달 — 공지·시멘틱·1:1 문의 UI 패턴 정렬

- **목적:** `ReportGenerationModal` 편집·기초값(읽기전용)을 프로젝트 공통 모달 폼 규격에 맞춤 (mapdev 기준 화면과 동기)
- **영향:** 노트북 상세 → 페르소나 관리 팝업

#### 레이아웃·마크업
- **이름** — `kl-modal-form-row` (라벨 좌 · 필드 우, 라벨 `align-items: start`)
- **지시문** — `kl-modal-form-field-stack` (라벨 위 · textarea 아래, 첨부 프롬프트 「내용」형)
- **사용안함** — `persona-disable-consent` (1:1 문의 개인정보 동의 체크박스 리듬)
- **푸터** — 목록이동 좌(`kl-btn primary-outline`); 기초값은 **닫기·안내 문구 제거** (헤더 X만)

#### 읽기전용(기초값)
- 지시문 본문: API 또는 fallback 상수 (`PERSONA_DEFAULT_PROMPT_TEXT`)
- `kl-form-readonly--control` — 이름·지시문 textarea 동일 **흰 배경 박스**
- 안내 `kl-modal-form-helper` 「기초값 지시문은…」 삭제

#### 공통 CSS (`kl-layout-modal.css`, `kl-form-readonly.css`)
- `kl-modal-form-row` / `kl-modal-form-field-stack` 신규
- 읽기전용 textarea `--control` variant (input과 동일 흰 박스)
- `admin-semantic-form-row` 기본 정렬 `start`

#### 파일
- `src/components/ReportGenerationModal.jsx`, `.css`
- `src/assets/styles/layout/kl-layout-modal.css`, `kit/kl-form-readonly.css`
- `src/pages/admin/AdminSemanticPage.css`

#### 다음 작업(예정) — **인수인계 (Cursor 규칙)**

→ **`.cursor/rules/handoff-modal-ui-rollout.mdc`** · 루트 **`AGENTS.md`**  
**`NotebookDetail` 제외**, 전 메뉴 `BaseModal` 팝업을 가이드·`ReportGenerationModal` 패턴으로 마크업·클래스 통일.

---

## 2026-05-24

### 1) 전역 CSS 진입점 `kl-global.css` 정리 · 루트 스텁 제거 · `utilities/`

- **목적:** `kl-ui.css` → `global.scss` → `global.css` 체인·루트 `kl-*.css` 스텁 중복을 없애고, 진입점 이름을 KL 규칙(`kl-*`)에 맞춤. 원자 유틸(세로 정렬 등)은 한 파일에 단계적으로 추가.
- **영향:** `main.jsx` 전역 CSS 로드 · 에이전트 규칙 · SSOT 문서 경로

#### 진입·폴더
- **`react/src/assets/styles/kl-global.css`** — `main.jsx`에서 **이 파일만** import (`tokens/` · `foundation/` · `layout/` · `utilities/` · `kit/` · `patterns/` · `legacy/`)
- **`styles/` 루트** — `kl-global.css` + `README.md`만 유지 (본문은 하위 폴더만)

#### 삭제(호환 스텁·미사용)
- `global.css`, `global.scss`, `kl-ui.css`, `src/index.css`
- 루트 `kl-*.css` 스텁 18개 (`@import`만 있던 파일)
- `src/components/common/TableToolbar.css` (jsx import 없음 — 툴바는 `kl-global` → `layout/kl-layout-toolbar.css`)

#### 신규
- **`utilities/kl-util.css`** — 1차: `kl-vert-start` / `kl-vert-cnt` / `kl-vert-end` (flex·grid 컨테이너 opt-in)
- `kl-global.css`에서 `layout/kl-layout-modal.css` **뒤**에 로드 (row 기본값 override)

#### 규칙·문서
- `.cursor/rules/kl-css-architecture.mdc` — 진입 `kl-global.css`, 루트 스텁 금지
- `docs/kl-ui-guide.md`, `modal-guide.md`, `docs/README.md` 등 — `global.css` → `kl-global.css` · `tokens/` 경로 정리(일부)

#### 검증
- `npm run build` 통과

---

### 2) `kl-layout-modal` — 본문 스택·내용 필드(공통)

- **목적:** 팝업 본문에서 textarea와 `kl-infotxt-note` 등 블록 간격을 **부모 `gap`만**으로 맞추기 (`kl-infotxt-note`에 margin 추가하지 않음).
- **영향:** 노트북 용어 팝업 등 `kl-modal-form-stack` 사용 화면

#### `layout/kl-layout-modal.css` 추가
- `.kl-modal-form-stack` — `gap: var(--spacing-md)`
- `.kl-modal-form-content-field` — 라벨(좌)·툴바(우)·textarea 전체 너비
- `.kl-modal-form-toolbar`, `.kl-modal-form-hidden-input`

---

### 3) 노트북 상세 — 비즈·IT 용어사전 팝업 UI

- **목적:** 상단 설명+ MUI CSV 버튼 구조를 공통 폼 패턴으로 정리하고, 안내 문구를 하단 `kl-infotxt-note`로 이동. textarea와 안내 박스 간격 분리.
- **영향:** `NotebookDetail` → 비즈니스 용어사전 · IT 용어사전(컬럼 정보) `BaseModal`
- **유지:** `maxWidth="md"` (가로 변경 없음)

#### 마크업
- 본문: `kl-modal-form-stack` → `kl-modal-form-content-field`(라벨 「내용」·`kl-icon-label-btn` CSV) → textarea
- 하단: `kl-infotxt-note` + `Info` (기존 `meta-modal-description` 문구)
- 푸터: MUI `Button` → `kl-btn gray-outline md` / `kl-btn primary-full md`
- `NotebookDetail.jsx` — `@mui/material` `Button` import 제거(용어 팝업 구간)

#### CSS
- `NotebookDetail.css` — `.notebook-meta-textarea` (JSON monospace·최소 높이 등, `meta-modal-textarea` 대체)

---

### 4) 모달 UI 일괄 이관 — **중단·되돌림** (고객센터 작성 팝업)

- **배경:** 공지·FAQ·1:1 **작성** 팝업에 `kl-modal-form-stack` 이관 시도 중, CSS 진입점 불일치·범위 과다로 dev/build·화면 꼬임. **컨펌 없이 진행** 지적 후 정리.
- **현재(세션 종료 시점):**
  - **공지·FAQ·1:1 작성** — 페이지 전용 클래스 유지 (`notice-modal-form`, `faq-modal-form`, `qna-create-modal-form` 등). `kl-modal-form-stack` **미적용**.
  - **고객센터 상세(행 클릭)** — 이번 범위 제외 유지.
  - **모달 일괄 이관** — `handoff-modal-ui-rollout.mdc` · `ReportGenerationModal` 기준, **1~2개씩** 재개 예정.

#### 작업 방식 합의(재발 방지)
- 논의 → **명시적 컨펌 후** 구현 (`workflow-confirm-before-implement.mdc`)
- 한 세션에 CSS 구조 변경 + 팝업 마크업 **섞지 않음** · 단위별 **사용자 커밋**
- `ui-history2` — **사용자 지시 시만** 기록

#### 다음(예정) 우선순위
1. 화면 확인 후 사용자 커밋(기준선 고정)
2. **공지 작성 팝업 1개** — `kl-modal-form-stack` + `kl-infotxt-note` 간격(gap만)
3. 이후 FAQ·1:1 작성 → 그다음 `NotebookDetail` 제외 전 메뉴 모달 이관

---

## 2026-05-25

### 1) 고객센터 Form — 페이지별 `*-create-form` 제거 · 전역 class 통일

- **목적:** 공지·FAQ·1:1 **작성/수정** 팝업 `<form>`·`contentClassName` 이 메뉴마다 달라 DevTools·유지보수 혼선 — 동일 레이아웃은 **전역 상수만** 사용
- **SSOT:** `src/components/common/modal/klModalForm.js` — `KL_MODAL_FORM_STACK_CLASS`, `KL_MODAL_FORM_ELEMENT_ID` (`kl-modal-form`), `klModalFormContentClassName`
- **적용:** `NoticeCreateModal.jsx`, `FaqCreateModal.jsx`, `QnaCreateModal.jsx` — `notice-create-form` / `faq-create-form` / `qna-create-form` 및 `*-create-modal-content` 제거
- **인라인·체크박스:** `faq-order-*` · `faq-active-*` · `qna-privacy-consent` 제거 → `kl-layout-modal.css`의 `kl-modal-form-inline-controls` · `kl-modal-form-check` · `kl-modal-form-helper--legal` (상수 `klModalForm.js`)
- **삭제:** `FaqCreateModal.css`, `QnaCreateModal.css` (전역으로 이관)
- **문서:** `docs/modal-guide.md` §5 · §9 반영

---

### 2) 어드민·워크스페이스 Form 팝업 — `modal-guide` / `ReportGenerationModal` 패턴 이관

- **목적:** 고객센터 Form SSOT 이후, 어드민·홈·도메인 팝업을 `kl-modal-form` · `kl-btn` · `kl-modal-actions-split` · `KL_MODAL_FORM_*` 상수로 통일. 페이지 전용 모달 CSS·MUI `Button` 제거.
- **Paper:** `klModalPaper.js` — Form 550(`klFormModalPaperSx`), 긴 Form 670(`klTallFormModalPaperSx`), 짧은 Form 440(`homeRenameModalPaperSx`)
- **전역:** `kl-layout-modal.css` — `kl-modal-form-stack` gap `--spacing-sm`(8px), `kl-modal-form-control-row`·toggle·feedback·error banner, `kl-modal-form-helper` `margin-bottom: var(--spacing-sm)`
- **적용(jsx):** `Home.jsx`·`ShareSettingsModal.jsx`(프롬프트 670·이름 440), `DomainManagement.jsx`(670), `AdminMemberManagement.jsx`, `AdminConfigManagement.jsx`, `AdminSemanticCategoryPage.jsx`, `semantic/SemanticEntitySplitPage.jsx`, `AdminActionPage.jsx`(워크스페이스 선택 440)
- **노트북 상세:** 비즈·IT 용어 팝업 — 푸터 `kl-btn`·split만 정리(크기 유지)
- **문서:** `docs/modal-guide.md` — stack gap 8px 문구 일부 반영

---

### 3) Action · 시멘틱 팝업 보정

- **Action — 워크스페이스 선택:** `kl-infotxt-note` 시도 후 제거. 안내는 기존 문구 한 줄(`Action 관리 대상 workspaceId …`)·입력 **위** `kl-modal-form-helper` 유지.
- **시멘틱 — select:** `KlModalSelect`(MUI) 제거 → 사용자 관리와 동일 **네이티브 `<select>`** + `.kl-modal-form select` (카테고리 상위·엔티티 카테고리). 펼침 UI는 OS·브라우저 의존(합의).

---

### 4) 홈 프롬프트 변경 · 청킹 NONE — 공통 select/버튼·경고 class 정리

- **목적:** `프롬프트 변경` 팝업 select가 MUI(`KlModalSelect`)로 남아 공통 UI와 불일치. 청킹 NONE 시 select·버튼 스타일을 `modal-guide`·도메인 관리와 맞춤. 레거시 `modal-input--chunk-none` 제거.
- **select:** `Home.jsx` — 9개 프롬프트 필드 네이티브 `<select>` (`renderPromptCodeSelect`). NONE 시 `KL_MODAL_FORM_CONTROL_WARNING_CLASS` (`kl-modal-form-control--warning`) — 빨간 테두리·글자, 배경 `var(--kl-control-bg)`.
- **NONE 버튼:** `kl-modal-form-toggle-btn--active`(채움 빨강) 제거 → `kl-btn md` + `danger-outline` / `gray-outline` (거절 팝업·삭제와 동일). `DomainManagement.jsx` 청킹 행 동일.
- **CSS:** `kit/kl-modal-form.css` — `--warning`에 hover/focus 규칙 통합, `modal-input--chunk-none` 삭제.
- **상수:** `klModalForm.js` — `KL_MODAL_FORM_CONTROL_WARNING_CLASS` export.
- **문서:** `modal-guide.md` §5.2 · `kl-ui-guide.md` Part 6 — `--warning` 스펙·레거시 class 사용 금지.
- **Paper(짧은 Form):** `klModalPaper.js` — `KL_MODAL_PAPER_WIDTH_HOME_RENAME` 440→460 (`homeRenameModalPaperSx` 사용 팝업). FAQ 작성은 `klFormModalPaperSx`(550) 유지.
- **참고:** 모달 진입 시 NONE on/off는 API `chunkPrompt` 값 그대로(`'NONE'`일 때만 활성). 로컬·개발기 차이는 데이터 이슈 가능.

---

### 5) `?` Popover — 호버 툴팁 제거

- **목적:** 시스템 설정 카테고리·승인 관리 사유 등 `kl-popover-icon-btn` — 호버 시 「설명 보기」「사유 보기」 툴팁 제거, **클릭 시 Popover만**
- **`KlIconButton.jsx`:** `buttonClassName`에 `kl-popover-icon-btn`이면 `KlTooltip` 미감쌈
- **적용:** `AdminConfigManagement.jsx`, `AdminUpgradeRequests.jsx` — `tooltip` prop 제거

---

### 6) 시스템 설정 — 목록·수정 팝업 설명 UI

- **목록:** `.config-mgmt-desc` — 말줄임(`text-overflow: ellipsis`)
- **수정 팝업:** 설명 `input` → 읽기전용 `textarea` `rows={3}` · `kl-form-readonly--control` (`AdminConfigManagement.jsx` / `.css`)

---

### 7) 홈 워크스페이스 — 공유 배지 (그리드·목록)

- **스타일:** `.notebook-share-badge` — pill(`border-radius: 999px`). `ALL` → `var(--color-accent)`, `INDIVIDUAL` → `#059669`. `NONE`은 미표시
- **문구:** 「조직 공유」→「개별 공유」(공유 설정 모달과 동일)
- **DEV:** `import.meta.env.DEV` 시 `INDIVIDUAL` 뱃지 UI 미리보기(shareType·API 무변경)

---

### 8) 노트북 상세 — 비즈·IT 용어사전 팝업

- **목적:** `ReportGenerationModal`(페르소나 관리)과 동일 모달 셸·폼 리듬
- **`NotebookDetail.jsx`:** `maxWidth="md"` · `report-generation-modal-header` / `-content` / `-actions` · `form` submit · `rows={8}` · `kl-infotxt-note` 유지
- **`NotebookDetail.css`:** `.notebook-meta-textarea` — monospace·min-height만, 테두리·배경은 `kl-modal-form` textarea

---

### 9) 페르소나 관리 — 추가 카드 `add-set-card`

- **목적:** 기초값(`default-persona-card`)과 구분되는 **추가 페르소나 목록 카드** 정적 스타일. hover/active는 기존 `.format-card` 유지
- **마크업:** `format-card add-set-card` · 연필 ✏️ · `add-set-card__edit`
- **CSS (`ReportGenerationModal.css`):** 흰 배경·테두리 `#c8d6e5` · 헤더 `align-items: center` · 연필 `scaleX(-1)` · 목록만 **사용안함** `justify-content: flex-end`
- **편집 화면** `persona-disable-consent` — 변경 없음
- **참고:** 목록 「사용안함」 체크 저장은 `workspaceApi.updateRole` — 로컬은 백엔드·로컬 mock 미완 시 UI만 확인

---

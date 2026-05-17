# UI 작업 히스토리 (2)

> **구조 안내:** `### N)` 번호는 **본 파일 안에서** 날짜별로 1부터 부여합니다. 최신 날짜는 **파일 하단**에 추가합니다.  
> **범위:** 2026-05-16부터 목록 화면 공통 chrome·관련 문서 정리를 기록합니다. 이전 이력은 `ui-history.md`를 참고합니다.

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
- `src/styles/kl-form-control.css`, `kl-form-readonly.css` — 모달·툴바 공용 input/select 규격(`--kl-control-*`)
- `src/styles/kl-outlined-primary-btn.css` — 팝업·목록 하단 아웃라인 primary 버튼(공지 상세 「목록이동」 등)

#### 기타
- `docs/modal-form-spec.md`, `docs/modal-spec.md` — `kl-modal-form` 적용·Decision 제외 안내와 정합

---

### 9) 툴바·서브탭 공통 UI 재정의 (`kl-form-control` · `toolbar-input-composer` · 서브탭)

- **목적:** 목록 툴바의 검색·select와 **동일 32px·테두리·포커스**를 모달 밖 툴바에도 적용하고, **input+버튼 밀착** 패턴(노트북 채팅 composer 유사)을 재사용 가능한 클래스로 고정; 어드민 서브탭은 **아이콘+라벨 가로 정렬**·활성 시 **굵기 변경 없음**(탭 전환 시 흔들림 제거)
- **영향:** `TableToolbar.css` 전역; Action 관리 실행 이력 툴바; `admin-semantic-subtab` 사용 화면(온톨로지 옵션·Action 관리)

#### CSS 변경
- `src/styles/kl-form-control.css` — `--kl-control-height` 등 토큰·네이티브 input hover/focus 배경 정리
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

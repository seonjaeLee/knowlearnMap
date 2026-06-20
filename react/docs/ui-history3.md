# UI 작업 히스토리 (3)

> **구조 안내:** `### N)` 번호는 **본 파일 안에서** 날짜별로 1부터 부여합니다. 최신 날짜는 **파일 하단**에 추가합니다.  
> **범위:** 2026-06-12부터 테마·인증 화면 오로라·브랜드 색 보정 등을 기록합니다. 이전 이력은 [ui-history2.md](./ui-history2.md) · [ui-history.md](./ui-history.md)를 참고합니다.  
> **문서 위치:** `docs/ui-history3.md`. 인덱스: [README.md](README.md).

## 2026-06-12

### 1) 라이트·다크·시스템 테마 — Context·토큰·FOUC 방지

- **목적:** 본문 콘텐츠 영역에 light / dark / system 3-way 테마 지원. LNB는 다크 chrome 고정, 키트·페이지는 `data-theme` 토큰 전환.
- **저장:** `localStorage` 키 `kl-theme-mode` (`react/src/constants/theme.js`)
- **FOUC:** `index.html` 인라인 스크립트 — 앱 마운트 전 `document.documentElement[data-theme]`·`colorScheme` 설정
- **인증 라우트:** `/login`, `/signup`, `/verify-email`, `/set-password`, `/reset-password` — **항상 라이트** (스크립트·`ThemeContext` 동일)
- **토큰:** `kl-tokens-theme-map.css` — `[data-theme="light"]` / `[data-theme="dark"]` semantic 색·그림자·폼 비활성·오로라 blob 변수 분리
- **MUI:** `main.jsx` MUI `ThemeProvider` → `ThemeContext` + `MuiThemeBridge` (resolved 테마에 맞춰 MUI palette 동기화)

#### 파일
- `react/index.html`, `react/src/constants/theme.js`(신규), `react/src/context/ThemeContext.jsx`(신규)
- `react/src/components/common/MuiThemeBridge.jsx`(신규), `react/src/main.jsx`
- `react/src/assets/styles/tokens/kl-tokens-theme-map.css`

---

### 2) LNB 테마 토글 — 푸터 3-way (라이트·다크·시스템)

- **목적:** 시스템 설정 메뉴 없이 LNB 하단에서 표시 테마 전환
- **위치:** 로그아웃 버튼 **위** — `lnb-footer-theme-row`
- **UI:** 라벨 **「테마」** + Sun / Moon / Monitor 아이콘 버튼 · 접힘 시 아이콘만 + `KlTooltip`
- **스타일:** `LnbThemeToggle.css` — LNB 다크 톤에 맞춘 pill 토글

#### 파일
- `react/src/components/common/LnbThemeToggle.jsx`(신규), `LnbThemeToggle.css`(신규)
- `react/src/components/common/MainLayout.jsx`, `MainLayout.css`

---

### 3) 인증 화면 — 라이트 카드·오로라 mesh·ambient drift

- **목적:** 로그인·회원가입 등 인증 UX를 라이트 톤 + 브랜드 오로라 배경으로 통일
- **배경:** `kl-aurora-bg kl-aurora-bg--ambient` — 정적 mesh + 약 120s 초저속 drift (`prefers-reduced-motion` 시 정적)
- **카드:** 다크 그라데이션 제거 → `--color-bg-secondary` solid 카드·토큰 기반 입력·버튼
- **적용 jsx:** `Login`, `Signup`, `EmailVerification`, `SetPassword`, `ResetPassword`

#### 파일
- `react/src/assets/styles/patterns/kl-aurora-background.css`(신규), `kl-global.css` import
- `react/src/pages/Login.css`, `Login.jsx` 및 위 인증 jsx

---

### 4) 로그인 후 본문 — 오로라 미적용·단색 배경 복원

- **목적:** 로그인 후 메인 콘텐츠는 기존처럼 단색 배경 유지 (오로라는 인증 전용)
- **변경:** `MainLayout` `main-content`에서 `kl-aurora-bg` 제거
- **배경:** `.main-layout` → `var(--color-bg-primary)` (테마 연동)
- **푸터:** `site-footer` 색·배경을 테마 토큰으로 정리

#### 파일
- `react/src/components/common/MainLayout.jsx`, `MainLayout.css`

---

### 5) 브랜드 Map 워드마크 색 — `#5eb8ff` 통일

- **목적:** LNB·로그인 공통 Map 텍스트 색을 스카이 블루 `#5eb8ff`로 맞춤 (이전 `#11e2dc`에서 변경)
- **로그인:** `knowlearn`은 `var(--color-text-primary)` (라이트 카드 가독성)

#### 파일
- `react/src/components/common/KlBrandLogo.css`

---

### 6) 로그인 스크롤바 제거

- **원인:** ambient `::after` (`inset: -25%` + transform)가 `.login-container` 밖으로 overflow · `overflow-y: auto`가 가로·세로 스크롤 유발
- **해결:**
  - `.kl-aurora-bg--ambient { overflow: hidden; }`
  - `.login-container { overflow: hidden; min-width: 0 }`
  - `.app-route-outlet { overflow: hidden }`
  - `max-height: 520px` 이하에서만 세로 스크롤 허용

#### 파일
- `react/src/assets/styles/patterns/kl-aurora-background.css`
- `react/src/pages/Login.css`, `react/src/App.css`

---

### 7) 문서 — ui-history3 신설

- **목적:** 2026-06-12 작업분을 `ui-history3.md`로 분리 기록 (`ui-history2` 이후 현행 일기)
- **인덱스:** `react/docs/README.md` 갱신

#### 파일
- `react/docs/ui-history3.md`(신규), `react/docs/README.md`

---

### 8) 테마 — 라이트만 선택 가능 (임시)

- **목적:** 다크·시스템 UI 준비 전까지 라이트 고정
- **플래그:** `THEME_LIGHT_ONLY = true` (`constants/theme.js`)
- **UI:** LNB 테마 토글 — 달·모니터 비활성(준비 중 툴팁), 태양만 활성
- **FOUC:** `index.html` 항상 `light`

#### 파일
- `react/src/constants/theme.js`, `LnbThemeToggle.jsx`, `LnbThemeToggle.css`, `index.html`

---

### 9) react-dev → 프롬프트 관리 개발분 이관

- **범위:** `react/src/prompt` diff 3파일만 (나머지 동일)
- **내용:** `EditorTab` 변수 `editable`·`label` 저장 · `PromptEditTabs` 탭 라벨 `표시명 (key)` · `PromptList` (당시 헤더 actions 배치 — 이후 §11에서 툴바로 재정렬)

#### 파일
- `PromptEditTabs.jsx`, `EditorTab.jsx`, `PromptList.jsx`

---

### 10) 프롬프트 목록·상세 — CHUNK 더미·mock·버전 mock

- **목록:** `promptMockData.js` CHUNK 행 추가 · `config/promptMock.js` — dev 기본 mock
- **상세:** `promptVersionMockData.js` + `versionService.js` mock (CHUNK 시맨틱 등 Editor·버전 패널 확인용)
- **도메인 mock:** `domainMockData.js` CHUNK 코드 목록 동기화

#### 파일
- `promptMockData.js`, `promptMock.js`, `promptVersionMockData.js`, `versionService.js`, `promptService.js`, `domainMockData.js`

---

### 11) 프롬프트 관리 목록 — 공통 목록 chrome 정리

- **툴바:** 새로고침·생성 → `table-toolbar` 우측 (도메인·사용자 관리와 동일) · 헤더는 제목만
- **표:** `useBasicTableColumnResize` (`km-prompt-list-columns-v2`) · 카테고리 축소·코드·설명 확대
- **정렬:** 등급·버전 수 좌측 · `수` → **버전 수** (전체 버전 개수; **버전** 열은 활성 배포 버전)

#### 파일
- `PromptList.jsx`, `PromptList.css`

---

### 12) 브랜드 주색 `#5a57e6` · 고객사별 교체 구조

- **SSOT:** `tokens/kl-tokens-brand-map.css` — `--kl-brand-primary` 등
- **파생:** `kl-tokens-theme-map.css`의 `--color-accent*` · 어드민 `--admin-color-primary*` · LNB 활성·테마 토글·로고 워드마크
- **MUI:** `brandTheme.js` + `MuiThemeBridge` — document CSS 변수 읽기
- **가이드:** `kl-ui-guide.md` Part 2 §2.5 브랜드 주색 일괄 변경

#### 파일
- `kl-tokens-brand-map.css`(신규), `kl-global.css`, `kl-tokens-theme-map.css`, `admin-common.css`, `KlBrandLogo.css`, `MainLayout.css`, `LnbThemeToggle.css`, `MuiThemeBridge.jsx`, `brandTheme.js`, `kl-ui-guide.md`

---

## 2026-06-14

### 13) MAKER센터 LNB 이관 · MakerRoute · isMaker 권한

- **목적:** 프롬프트 관리(`/prompts`)를 어드민센터에서 **메이커센터**로 분리. MAKER 역할 전용 라우트 가드 추가.
- **isMaker:** `AuthContext`에 `user?.role === 'MAKER'` 플래그 추가
- **MakerRoute:** `(isMaker || isAdmin)` 통과 → 그 외 `/workspaces` 리다이렉트. [임시/유보 2026-06-12] 안정화까지 ADMIN도 한시 허용.
- **App.jsx:** `/prompts`, `/prompts/:code` → `<MakerRoute>` 래핑
- **LNB:** 메이커센터 그룹(신규, 어드민센터 앞) — `isMaker || isAdmin` 조건부 노출. 어드민센터에서 프롬프트 관리 NavLink 제거.
- **표기:** LNB 그룹명 `MAKER센터` → **메이커센터** (한글)

#### 파일
- `react/src/context/AuthContext.jsx`
- `react/src/components/MakerRoute.jsx`(신규)
- `react/src/App.jsx`
- `react/src/components/common/MainLayout.jsx`

---

### 14) 도메인 관리 팝업 단순화

- **목적:** 어드민센터 > 도메인 관리 > 새 도메인 팝업을 react-dev 최종본 기준으로 교체
- **변경:** 기존 CHUNK·ONTOLOGY·CHAT 프롬프트 코드 셀렉트 전부 제거 → **LLM 청킹 체크박스 1개**로 단순화
- **값:** `CHUNK_PROMPT_ON_VALUE = 'DEFAULT_CHUNK_PROMPT'` / `CHUNK_PROMPT_OFF_VALUE = 'NONE'`
- **필드:** 도메인명, 설명, ArangoDB명, LLM 청킹(체크박스) 4개만 유지
- **Info 아이콘:** 편집 모드에 시맨틱 카테고리 안내 메모 추가

#### 파일
- `react/src/components/DomainManagement.jsx`

---

### 15) LNB 컬러 토큰 시스템 (`--sb-*`) · 3-way 스킴

- **목적:** LNB 색상을 `data-lnb` attribute 기반 CSS 변수로 전환 (하드코딩 제거)
- **변수:** `--sb-bg`, `--sb-bg-2`, `--sb-border`, `--sb-text`, `--sb-text-strong`, `--sb-muted`, `--sb-hover`, `--sb-active`, `--sb-active-text`, `--sb-active-weight` (10개)
- **스킴:**
  - `기본(dark)` — 기존 슬레이트 다크 (`:root`)
  - `[data-lnb="indigo"]` — 라벤더 인디고 라이트
  - `[data-lnb="light"][data-theme="light"]` — 순백 라이트
- **활성 아이템:** `color-mix(in srgb, #5a57e6 26%, #171b23)` 베이스, indigo는 흰 bg + 브랜드 컬러 텍스트·볼드

#### 파일
- `react/src/components/common/MainLayout.css`

---

### 16) LNB 너비 232 · 접힘 테마 아이콘 단일 표시

- **너비:** 기본 `212px → 232px` / 1920px+ `248px` / 1599px- `212px` (기존 196)
- **접힘 테마 토글:** 비활성 버튼(`.is-disabled`) 래퍼를 `:has(.is-disabled) { display: none }`으로 숨김 → 활성 테마 아이콘 1개만 표시, `34×34px`로 다른 LNB 아이템과 세로 정렬 통일

#### 파일
- `react/src/components/common/MainLayout.css`
- `react/src/components/common/LnbThemeToggle.css`

---

### 17) 프롬프트 상세·목록 헤더 공통화 · MakerPageHeader

- **MakerPageHeader:** `AdminPageHeader` 구조 그대로, `breadcrumbs={['메이커센터']}` 로 신규 컴포넌트 분리
- **PromptList:** `AdminPageHeader` → `MakerPageHeader` 교체 (브레드크럼 "어드민센터" → "메이커센터")
- **PromptDetail:** 인라인 `<div className="page-header">` 제거 → `MakerPageHeader` 적용. 두 페이지가 동일 컴포넌트로 헤더 통일.
- **PromptDetail.css:** `page-header-title` 25px/800 폰트 오버라이드 제거 → `PageHeader.css` 기본값(`clamp(18px, 1.2vw, 22px)`, 700) 적용
- **뒤로가기 버튼:** 페이지 타이틀 행에서 제거 → `item-info` 카드 왼쪽(`prompt-detail-info-wrap` flex 래퍼)으로 이동. 카드 높이 기준 세로 정렬.

#### 파일
- `react/src/components/admin/MakerPageHeader.jsx`(신규)
- `react/src/prompt/components/prompts/PromptList.jsx`
- `react/src/prompt/components/prompts/PromptDetail.jsx`
- `react/src/prompt/components/prompts/PromptDetail.css`

---

### 18) 프롬프트 테스트 팝업 — MUI 제거 · CSS 리디자인

- **목적:** TestTab MUI 의존성 완전 제거, 디자인 최종본(react-dev) 반영
- **제거:** `Box`, `Paper`, `Typography`, `Select`, `TextField`, `Button`, `Tabs`, `Tab`, `IconButton`, `Tooltip`, `Rating` + `@mui/material`, `@mui/icons-material`
- **레이아웃:**
  - **환경 설정 카드** — 흰 카드, 라벨 위·인풋 아래 수평 flex, "환경 저장" 버튼 우상단
  - **프롬프트 패널 2분할** — 원본(회색 bg) / 변수 치환 후(파란 tint bg), 각 복사 버튼
  - **응답 결과 카드** — API 호출 후 노출, JSON/텍스트 탭 전환
  - **실행 버튼** — 콘텐츠 하단 우측 정렬, 표준 `kl-btn kl-btn--primary` 크기
- **만족도(Rating) 제거** — 최종 디자인에 없음

#### 파일
- `react/src/prompt/components/test/TestTab.jsx`
- `react/src/prompt/components/test/TestTab.css`(신규)

---

### 19) 복사 피드백 공통 훅 — `useCopyFeedback`

- **목적:** 클립보드 복사 + 시각 피드백(Check 아이콘·초록 색상·1.5초 복귀)을 재사용 훅으로 분리
- **API:** `copy(text, key?)` · `isCopied(key?)` — 단일 버튼은 key 생략, 여러 버튼은 key로 구분
- **적용:**
  - `TestTab` — 원본/Resolved/결과 3개 버튼 (`'original'` · `'resolved'` · `'result'` key)
  - `PromptEditTabs` — 에디터 툴바 복사 버튼 (detail variant · default variant 모두)
- **CSS:** `is-copied` 클래스 — `kl-buttons.css`(kl-toolbar-btn), `PromptEditor.css`(prompt-panel-tool-btn), `TestTab.css`(pt-copy-btn) 각각 적용

#### 파일
- `react/src/hooks/useCopyFeedback.js`(신규)
- `react/src/prompt/components/test/TestTab.jsx`
- `react/src/prompt/components/common/PromptEditTabs.jsx`
- `react/src/prompt/components/editor/PromptEditor.css`
- `react/src/assets/styles/kit/kl-buttons.css`

---

## 2026-06-15

### 20) TestTab — 응답 결과 자동 스크롤 · API 버튼 sticky

- **스크롤:** `useRef` + `useEffect` — `result` 상태 변경 시 `.pt-result-card`로 `scrollIntoView({ behavior: 'smooth', block: 'start' })` 자동 이동
- **Sticky 버튼:** `.pt-run-wrap`에 `position: sticky; bottom: 0; background: var(--color-bg-primary)` 적용. BaseModal `.contentScroll`이 `overflow-y: auto`이므로 sticky 동작 정상.

#### 파일
- `react/src/prompt/components/test/TestTab.jsx`, `TestTab.css`

---

### 21) VersionHistoryPanel — 활성 행 스타일 제거 · '활성중' → '활성'

- **스타일 제거:** `.vh-active-row` 3개 규칙(배경색, 좌측 세로선, hover 배경) 전부 삭제
- **라벨:** `promptVersionStatus.js` `getPromptVersionStatus` 반환값 `'활성중'` → `'활성'`

#### 파일
- `react/src/prompt/components/common/VersionHistoryPanel.css`
- `react/src/prompt/utils/promptVersionStatus.js`

---

### 22) PromptList — 배지 말줄임 · '중복확인' 버튼 · 버전 셀 통합

- **배지 말줄임:** `admin-badge`의 `display: inline-flex`는 `text-overflow: ellipsis` 미지원 → `.prompt-list-page .admin-badge { display: inline-block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }` 스코프 오버라이드
- **중복확인:** `PromptFormDialog` codeCheckStatus 분기 내 `'확인'` → `'중복확인'`
- **버전 셀 통합:** `activeVersion` + `versionCount` 두 컬럼 제거 → `versionSummary` 단일 컬럼(`100px/80px`). 셀 표시: `v7 · 9개` 형식 (`activeVersion`은 이미 "v" 포함 문자열)

#### 파일
- `react/src/prompt/components/prompts/PromptList.jsx`, `PromptList.css`
- `react/src/prompt/components/prompts/PromptFormDialog.jsx`

---

### 23) PromptList — 테이블 높이·컬럼 너비 보정

- **높이 수정:** 루트에서 `kl-page--fill` 제거. 해당 클래스가 `:has()` CSS 셀렉터로 `table-area` `flex: 1`을 강제해 row 수에 무관하게 전체 페이지를 채우던 문제 해결.
- **가로 스크롤:** `basic-table-shell`에 `overflow-x: auto` 적용 (`kl-page--fill` 제거 후 직접 관리)
- **컬럼 너비:** `용도` 108→148px(min 88→110px), `수정일` 108→84px(min 96→74px)
- **storageKey:** `km-prompt-list-columns-v4`

#### 파일
- `react/src/prompt/components/prompts/PromptList.jsx`, `PromptList.css`

---

### 24) HistoryTab — 공통 table-area 구조 · 스냅샷 더미 데이터

- **구조:** `table-area` > `table-toolbar`(toolbar-left: 총 N개 / toolbar-right: 버전·모델 select) > `basic-table-shell prompt-history-table-shell` > table. FAQ·프롬프트 목록과 동일 패턴.
- **필터 셀렉트:** 기존 커스텀 클래스 → `toolbar-select` 통일
- **로딩 스피너:** `admin-spinner` div → `<span className="prompt-history-spinner">` + `@keyframes ph-spin` (MUI 미사용)
- **더미 데이터:** `react/src/data/snapshotMockData.js`(신규) — `DEFAULT_CHUNK_SEMANTIC` 5건, `DEFAULT_SCHEMA_ANALYSIS` 2건. API 실패 시 `useSnapshots` fallback으로 사용.

#### 파일
- `react/src/prompt/components/history/HistoryTab.jsx`, `HistoryTab.css`
- `react/src/prompt/hooks/useSnapshots.js`
- `react/src/data/snapshotMockData.js`(신규)

---

### 25) HistoryTab — 외부 카드 제거 · 만족도 컬럼 삭제

- **외부 카드 제거:** `PromptDetail.css` `.prompt-detail-history-panel`에서 `background`, `border`, `border-radius`, `box-shadow`, `padding` 제거 → `overflow: auto`만 유지. 기존 흰 카드가 toolbar + table 전체를 감싸 §24 구조가 보이지 않던 문제 해결.
- **만족도 컬럼 삭제:** `<th>만족도</th>`, `renderStars()` `<td>`, `renderStars` 함수, `Star` lucide import 전부 제거. `colSpan` 10→9. `HistoryTab.css` `.prompt-history-stars` 규칙 삭제.

#### 파일
- `react/src/prompt/components/prompts/PromptDetail.css`
- `react/src/prompt/components/history/HistoryTab.jsx`, `HistoryTab.css`

---

## 2026-06-17

### 1) KlTabBar — 1·2단계 이관 (프롬프트·어드민)

- **목적:** 레거시 탭 마크업을 `KlTabBar` SSOT로 통일. **3단계**(Notebook·모달 등)는 범위 제외.
- **KlTabBar:** `variant` — `page` / `compact` / `panel` / `subtle` · `scrollTail`(mask 페이드 + 좌우 ◀▶) · `useKlTabIndicator` 슬라이딩 indicator
- **1단계:** `PromptDetail.jsx`(Editor|History) · `PromptEditTabs.jsx`(프롬프트 편집|변수, `variant="panel"`)
- **2단계:** `AdminSemanticPage.jsx` · `AdminActionPage.jsx` (`variant="subtle"`)
- **에디터 헤더 정렬:** `PromptEditor.css` — `min-height: 48px` · ①프롬프트 편집 / ②변수 pill / ③우측 아이콘 center-line 통일 · tools 구분선 제거

#### 파일
- `react/src/components/common/KlTabBar.jsx`, `useKlTabIndicator.js`, `useKlHorizontalScroll.js`
- `react/src/assets/styles/kit/kl-tab-bar.css`
- `react/src/prompt/components/prompts/PromptDetail.jsx`, `PromptEditTabs.jsx`, `PromptEditor.css`
- `react/src/pages/admin/AdminSemanticPage.jsx`, `AdminActionPage.jsx`

---

### 2) KlBadge · admin-badge 이관 · 뱃지 토큰

- **토큰:** `kl-tokens-theme-map.css` — `--color-badge-bg` `#f7f6fa` · `--color-badge-border` `#e3e3e3`
- **키트:** `kl-badge.css` · `KlBadge.jsx` · `klBadgeToneMaps.js` / `klMemberBadgeTones.js`
- **이관:** `OrgMembers.jsx` · `AdminAuditLog.jsx` — `admin-badge` → `KlBadge` · `admin-common.css` 레거시 `.admin-badge` 삭제
- **규칙:** 프롬프트 목록 등 말줄임은 `.kl-badge` 스코프 오버라이드 유지 (`PromptList.css`)

#### 파일
- `react/src/assets/styles/kit/kl-badge.css`, `tokens/kl-tokens-theme-map.css`, `kl-global.css`
- `react/src/components/common/KlBadge.jsx`, `MemberTableCells.jsx`

---

### 3) 프롬프트 상세 Editor — SplitPane 좌측(버전 히스토리) 너비·접기 **재발 방지**

- **목적:** 로딩 직후 좌측이 화면 **반쪽(50%)처럼** 넓어 테이블 오른쪽에 빈 공간이 생기던 문제 수정. 접기(`<<`) UX는 **기존 Skin 동작 유지**.

#### 펼침(기본) — 콘텐츠 너비에 맞춤
- **반반 split 아님.** 좌측은 버전 테이블 정보만 보일 정도로 좁게.
- **`SplitPane` + `useSplitPaneResize`:** `minLeftWidthPx={480}` · `maxLeftWidthPx={500}` → `clamp(480px, leftPercent%, 500px)`
- **`defaultLeftPercent={28}`** · `minLeftPercent={24}` · `maxLeftPercent={38}`
- **`percentStorageKey`:** `km-prompt-detail-split-v2` (v1에 저장된 넓은 % 초기화)
- **신규 hook props:** `minLeftWidthPx` / `maxLeftWidthPx` (펼침 clamp) · `collapsedFitContent` (옵션 — **본 화면 미사용**, 아래 참고)

#### 접기(`<<`) — **테이블 유지 (필수)**
- **의미:** `VersionHistoryPanel` `collapsed` + `SplitPane` `leftCollapsed` = 좌측 **패널 너비만** 줄임. **테이블을 숨기는 것이 아님.**
- **`collapsedLeftWidthPx={300}`** · `minCollapsedLeftWidthPx={260}` (기존값 유지)
- **CSS (`VersionHistoryPanel.css`):** 접힘 시 `.vh-table { min-width: 340px }` + `.vh-scroll { overflow-x: auto }` → **좁은 패널 안에서 테이블 가로 스크롤**
- **펼침 시 테이블:** `min-width: 440px` 유지

#### ⛔ 잘못했던 시도 (재발 금지)
| 요청 | 잘못한 구현 | 올바른 방향 |
|------|-------------|-------------|
| 「접었을 때 제목이 가려지지 않게」 | `.vh-col.is-collapsed .vh-panel { display: none }` 로 **테이블 전체 제거** | 테이블 **유지**. 제목 가림은 `vh-head` overflow·`collapsedLeftWidthPx`·SplitPane `overflow` 등으로만 조정 |
| 「제목만 남기고 접기」 | `collapsedFitContent` + 좌측 `width: auto` | **`collapsedFitContent` 프롬프트 버전 패널에 적용 금지** — 테이블 접힘 UX와 충돌 |

- **제목 가림 이슈:** 아직 별도 미세조정 여지 있음. **테이블 숨김으로 해결하지 않는다.**

#### 파일
- `react/src/prompt/components/editor/EditorTab.jsx`
- `react/src/prompt/components/common/VersionHistoryPanel.jsx`, `VersionHistoryPanel.css`
- `react/src/prompt/components/prompts/PromptDetail.css`
- `react/src/hooks/useSplitPaneResize.js`
- `react/src/components/common/SplitPane/SplitPane.jsx`, `SplitPane.module.scss`

---

### 4) EditorTab — 흰 화면·테스트 모달

- **흰 화면:** `EditorTab.jsx:264` `useImperativeHandle is not defined` — `forwardRef` 테스트 모달 연동 시 **`useImperativeHandle` React import 필수**. 누락 시 `<EditorTab>` 전체 크래시.
- **테스트 팝업:** `BaseModal` **`actions`** prop으로 「실행 TEST RUN」·「닫기」 푸터 이동 (`modal-guide` 패턴). `TestTab` `hideRunButton` · `testOpen`일 때만 마운트.
- **회색 라인:** `.pt-run-wrap` **`border-top` 제거** — 푸터와 본문 사이 얇은 구분선 원인.

#### 파일
- `react/src/prompt/components/editor/EditorTab.jsx`
- `react/src/prompt/components/test/TestTab.jsx`, `TestTab.css`

---

## 2026-06-19

### 1) 테마 — 라이트·다크 2-way 재개 · 인증 화면 포함

- **목적:** `THEME_LIGHT_ONLY` 임시 고정 해제. 본문·인증 화면 모두 `data-theme` 토큰 전환.
- **LNB 토글:** Sun / Moon 2버튼 (시스템·Monitor UI 제거). 접힘 시 현재 모드 아이콘 단일 버튼으로 토글.
- **FOUC:** `index.html` — `localStorage kl-theme-mode` 읽어 `light` | `dark` 적용.
- **토큰:** `kl-tokens-theme-map.css` · `MuiThemeBridge` — 다크 semantic 보강.

#### 파일
- `react/src/constants/theme.js`, `react/src/context/ThemeContext.jsx`, `react/index.html`
- `react/src/components/common/LnbThemeToggle.jsx`, `LnbThemeToggle.css`
- `react/src/assets/styles/tokens/kl-tokens-theme-map.css`, `MuiThemeBridge.jsx`

---

### 2) 브랜드 심볼 — knowlearnMap SVG · LNB·로그인 통일

- **자산:** `knowlearnMap.svg` · `knowlearnMap-dark.svg` (인라인 `KlBrandMark` SVG 제거)
- **KlBrandLogo:** 라이트/다크 `<img>` 전환 · LNB·로그인 동일 SSOT
- **정리:** `public/knowlearn_logo*.png` · `react.svg` 삭제 · `LoginModal` · `Login_.jsx` 제거

#### 파일
- `react/src/assets/knowlearnMap.svg`, `knowlearnMap-dark.svg`
- `react/src/components/common/KlBrandLogo.jsx`, `KlBrandLogo.css`
- `react/src/pages/Login.jsx`, `Login.css` 및 인증 jsx

---

### 3) BasicTable — MUI 제거 · 스크롤 페이드 · 관리열·컨트롤열

- **마크업:** MUI `Table*` → 네이티브 `<table>` + `BasicTable.module.scss`
- **가로 스크롤:** `useBasicTableScrollFade` · `kl-basic-table.css` mask 페이드(`fade-l`/`fade-r`) · 셸 `padding: 12px` · 테두리 `#c6ccd7`
- **관리열:** `basicTableActionsColumn.js` — 버튼 수 기준 최소 너비 · `KlTableRowActions` 정렬
- **컨트롤열:** `KlTableCellControl` · checkbox/radio 열 정의 헬퍼
- **행 상세:** `BasicTableRowDetail` + `kl-table-row-detail.css` (↳ recessed 트레이)

#### 파일
- `react/src/components/common/BasicTable.jsx`, `BasicTable.module.scss`
- `react/src/hooks/useBasicTableScrollFade.js`
- `react/src/assets/styles/kit/kl-basic-table.css`, `patterns/kl-table-row-detail.css`
- `react/src/components/common/table/*`, `BasicTableRowDetail.jsx`

---

### 4) KlModalClose · Promo shell — UpgradeModal · modal-guide

- **KlModalClose:** lucide `X` 18px · `kl-modal-close.css` SSOT
- **UpgradeModal:** Promo shell — `KlModalClose` · step 슬라이드(plans ↔ form) · `ChevronLeft` 뒤로
- **문서:** `modal-guide.md` §2.3 Work vs Promo shell · 닫기 affordance 표

#### 파일
- `react/src/components/common/KlModalClose.jsx`
- `react/src/assets/styles/patterns/kl-modal-close.css`
- `react/src/components/UpgradeModal.jsx`, `UpgradeModal.css`
- `react/docs/modal-guide.md`

---

### 5) KlBadge · 날짜 포맷 · 멤버·어드민 테이블 이관

- **KlBadge 확장:** `OrgMembers` · `AdminMemberManagement` · `SysopMemberManagement` · `AdminUpgradeRequests` · `AdminWorkspaceManagement` · `AdminArangoManagement` 등 — `admin-badge` → `KlBadge` + `MemberTableCells` / `klMemberBadgeTones`
- **날짜 SSOT:** `formatKlDate.js` — FAQ·공지·QnA 모달 · 목록 · 멤버 테이블 일괄 적용

#### 파일
- `react/src/utils/formatKlDate.js`
- `react/src/components/common/MemberTableCells.jsx`, `klMemberBadgeTones.js`
- `react/src/pages/OrgMembers.jsx`, `react/src/pages/admin/AdminMemberManagement.jsx` 등

---

### 6) Home · DomainSelection · 다크 토큰 정리

- **워크스페이스 아이콘:** `workspaceIconKeywords.js` — 이름 키워드 → lucide 아이콘 자동 매칭 (그리드 보기). 문서 `workspace-icon-keywords.md`
- **DomainSelection:** 카드 헤드·본문 분리 · 비현재 도메인 `ArrowRight` · 메타 `Layers` 아이콘
- **다크 대응:** KnowledgeMapView·모달·어드민·서포트 페이지 CSS — 하드코드 `#fafafa` 등 → `var(--color-*)` 치환

#### 파일
- `react/src/config/workspaceIconKeywords.js`, `react/src/pages/Home.jsx`, `Home.css`
- `react/src/pages/DomainSelection.jsx`, `DomainSelection.css`
- `react/docs/workspace-icon-keywords.md`

---

## 2026-06-20

### 1) 다크모드 색상·접근성 점검 — 버튼/뱃지·모달·고객센터 전반

- **버튼/뱃지 WCAG 대비:** 다크모드 브랜드 그라디언트(흰 텍스트 대비 ~3.5:1, AA 미달) → 라이트·다크 공통 고정값 `--kl-btn-fill-grad`/`-solid`/`-shadow` 신규 토큰으로 분리, primary 버튼·FREE 뱃지 등 전체 교체
- **모달:** BaseModal Form 헤더 흰색 하드코딩 제거(토큰화), MUI dark Paper의 흰 elevation 오버레이 제거
- **고객센터(공지·FAQ·QnA):** 고정행·분류뱃지·중요뱃지·답변뱃지 하드코딩 라이트 색 다크 대응 + 죽은 레거시 CSS(`NoticeDetailModal.css` 등) 삭제
- **사용자 지정 색 반영:** 안내 박스(`#223046`/`#63D5B9`), 고정 공지 제목(`#ffbe00`, 다크 전용), 분류 뱃지 라이트(`#f0edf4`/`#e5dfec`) 등
- **그 외:** PageHeader 타이틀·breadcrumb, BasicTable 외곽 테두리, admin-common 색 토큰, 행 선택 표시(테두리→배경 틴트) 다크 대응

#### 파일
- `kl-tokens-brand-map.css`, `kl-buttons.css`, `kl-basic-table.css`, `kl-infotxt-note.css`, `kl-table-row-detail.css`
- `BaseModal.module.scss`, `PageHeader.css`, `admin-common.css`
- `SupportCenter.css`, `CsDetailModal.css`, `NoticePopupModal.css`, `QnaDetailModal.css`

---

### 2) 공용 체크박스 컴포넌트 `KlCheckbox` 신설

- **목적:** 로그인 화면 체크박스 스타일·모션을 업무 화면에도 통일 적용
- **신규:** `KlCheckbox.jsx` + `kl-checkbox.css` — 모달 폼 체크박스(도메인·FAQ·QnA·Home) 우선 교체
- **MUI 정리:** 미사용 `PromptManagement.jsx`(MUI Checkbox 포함) 삭제
- **버그 수정:** 체크/해제 시 라벨이 1~2px 흔들리던 문제 — `.kl-modal-form-check { vertical-align: top }`

#### 파일
- `react/src/components/common/KlCheckbox.jsx`(신규), `kl-checkbox.css`(신규), `kl-layout-modal.css`
- `DomainManagement.jsx`, `Home.jsx`, `FaqCreateModal.jsx`, `QnaCreateModal.jsx`, `DictionaryView.jsx`
- `PromptManagement.jsx`(삭제)

---

### 3) SplitPane 리사이즈 버그 수정 — 프롬프트 상세

- 접힌 상태에서 드래그 시작 시 폭이 순간 점프하던 버그 수정
- 프롬프트 상세 좌측 패널 너비 범위를 시맨틱 옵션 화면과 동일하게(20~60%) 통일

#### 파일
- `react/src/hooks/useSplitPaneResize.js`
- `react/src/prompt/components/editor/EditorTab.jsx`

---

### 4) 다크모드 — 노트북 상세·지식그래프·사전·리포트 모달 (Map 메뉴 적용 완료)

- **범위:** LNB 이후 업무 화면 중 **노트북 상세(`NotebookDetail`)까지** `data-theme` 토큰 전환 완료. (프롬프트 관리 등 이후 메뉴는 별도)
- **NotebookDetail:** 패널·탭·브레드크럼·채팅·동기화 경고·버튼·뱃지 등 하드코드 `#fff`/`#e0e0e0`/`#333` 등 → `var(--color-*)` 일괄 치환. 동기화 상태 배너는 라이트 기존 톤 유지 + `[data-theme='dark']` 전용 `color-mix` 배경
- **지식그래프(canvas):** `useGraphPalette.js` 신설 — `react-force-graph-2d`는 CSS 토큰이 안 닿으므로 라이트/다크 노드·엣지·레전드 색을 한 곳에서 관리. `KnowledgeGraphModal`·`MiniKnowledgeGraph`·`KnowledgeMapView` 연동
- **KnowledgeGraphModal UI:** 툴바·문서 필터·닫기 버튼 하드코드 다크 톤 제거 → 토큰·`kl-btn gray-outline`. 중복 `admin/KnowledgeGraphModal.css` 삭제
- **DictionaryView:** 헤더·모드탭·테이블·상세 패널 배경·테두리·텍스트 토큰화
- **ReportGenerationModal:** 포맷 카드·페르소나·로딩 문구 토큰화, 기본 페르소나 카드 `color-mix` 톤
- **공통·레이아웃:** `NotificationBell` 드롭다운, `KlPopover`/`KlTooltip` 화살·배경, `MainLayout` 노트북 `padding-bottom`(푸터 숨김 시 하단 여백), LNB `grade-tag` → `--kl-btn-fill-solid`
- **고객센터 페이지 CSS 정리:** `Faq.css`·`NoticeList.css`·`QnaBoard.css` 내 미사용 레거시 스타일 블록 삭제(실제 UI는 `SupportCenter`·키트 SSOT)

#### 파일
- `react/src/components/NotebookDetail.css`
- `react/src/hooks/useGraphPalette.js`(신규)
- `KnowledgeGraphModal.jsx`, `KnowledgeGraphModal.css`, `MiniKnowledgeGraph.jsx`, `MiniKnowledgeGraph.css`, `KnowledgeMapView.jsx`
- `DictionaryView.jsx`, `DictionaryView.css`, `DictionaryModal.jsx`
- `ReportGenerationModal.jsx`, `ReportGenerationModal.css`, `RenameDialog.css`
- `NotificationBell.css`, `KlPopover.module.scss`, `KlTooltip.module.scss`, `MainLayout.css`
- `kl-tokens-theme-map.css`, `kl-legacy-modal.css`
- `Faq.css`, `NoticeList.css`, `QnaBoard.css`, `admin/KnowledgeGraphModal.css`(삭제)

---


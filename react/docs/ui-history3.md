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

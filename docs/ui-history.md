# UI 작업 히스토리

> **구조 안내:** `### N)` 번호는 **파일 전역에서 한 줄로만** 이어집니다. 상단은 과거 날짜부터 시간순이며, **가장 최근 날짜 섹션은 파일 하단**에 추가되는 형태입니다. **`## 2026-05-09`** 작업은 **맨 아래** 해당 헤더 아래에서 확인하세요.

> **갱신 정책(현행):** 이 파일은 **사용자가 명시적으로 요청할 때만** 수정합니다(예: 「히스토리에 적어줘」「ui-history에 남겨줘」). UI 작업만으로 에이전트가 임의로 항목을 추가하지 않습니다. 규칙 원문: `.cursor/rules/ui-history-on-request.mdc`. 본문의 과거 항목(예: ### 93)에 적힌 **「항상 기록」** 안내는 당시 기준이며 **폐지**되었습니다. 해석이 겹치면 **본 블록과 위 규칙 파일**을 우선합니다.

## 2026-04-30

### 1) 앱형 레이아웃 기준 재정의
- 목적: 고객 요구(화면 꽉 차는 사용성)에 맞춰 본문 폭/브레이크포인트 기준 재설정
- 영향: 대화면(1920 포함)에서 콘텐츠 사용폭 확대, 해상도별 간격 체계 일관화

#### CSS 변경
- `src/components/common/MainLayout.css`
  - `main-content` 기본 패딩 도입 (`12px 14px 14px`)
  - 브레이크포인트 체계를 `1920 / 1600 / 1280 / 1024` 기준으로 재구성
  - 해상도 구간별 본문 패딩과 LNB 폭을 단계적으로 보정

#### JSX/JS 변경 (예외 기록)
- 없음

### 2) 레이아웃 가이드 문서 갱신
- 목적: max-width 고정 중심 기준에서 앱형 풀폭 기준으로 문서화
- 영향: 이후 화면 정리 시 일관된 기준으로 적용 가능

#### 문서 변경
- `docs/layout-guideline.md` 신규 작성
  - 앱형 폭 정책(`max-width: 100%`)
  - 브레이크포인트(1920/1600/1280/1024)
  - 여백 기준 및 적용 우선순위 정의

### 3) 임시 로컬 로그인(admin/adminPw!) 복구
- 목적: 백엔드/DB 연결 없이 UI 작업을 계속할 수 있도록 로그인 우회 복원
- 영향: `VITE_ENABLE_LOCAL_AUTH=true` 환경에서 `admin/adminPw!` 로그인 가능

#### CSS 변경
- 없음

#### JSX/JS 변경 (예외 기록)
- `src/context/AuthContext.jsx`
  - 로컬 인증 모드 플래그(`VITE_ENABLE_LOCAL_AUTH`) 처리 복구
  - 로컬 사용자 저장/복원/로그아웃 처리 복구
  - `admin/adminPw!` 고정 계정 로그인 분기 복구

#### 환경 파일 변경
- `.env`
  - `VITE_ENABLE_LOCAL_AUTH=true` 추가

### 4) 로컬 임시 로그인 비밀번호 변경
- 목적: 로컬 UI 작업 환경에서 임시 로그인 비밀번호 교체
- 영향: 로컬 우회 로그인 계정(`admin`)의 비밀번호가 `joy`로 변경됨

#### CSS 변경
- 없음

#### JSX/JS 변경 (예외 기록)
- `src/context/AuthContext.jsx`
  - 로컬 인증 분기의 비밀번호 조건 변경: `adminPw!` → `joy`

### 5) 로컬 로그인 시 도메인 목록 fallback 복구
- 목적: mock 서버 파일 누락 상태에서도 로컬 임시 로그인 환경에서 도메인 선택 화면이 동작하도록 복구
- 영향: `VITE_ENABLE_LOCAL_AUTH=true`일 때 도메인 목록 표시 및 선택/추가/삭제 로컬 동작 가능

#### CSS 변경
- 없음

#### JSX/JS 변경 (예외 기록)
- `src/pages/DomainSelection.jsx`
  - 로컬 모드 도메인 기본 목록 상수 추가
  - 도메인 조회 실패를 피하기 위한 로컬 분기 추가
  - 로컬 모드에서 도메인 추가/삭제를 상태 기반으로 처리하도록 분기 추가

### 6) 로그인 후 LNB 미노출 문제 복구
- 목적: 로그인 후 레이아웃이 GNB 구조로 보이던 문제를 LNB 구조로 정상 복구
- 영향: 로그인 직후 좌측 LNB 노출, `/` 경로에서 `어드민센터 > 도메인 선택` 활성 상태 정상 표시

#### CSS 변경
- 없음

#### JSX/JS 변경 (예외 기록)
- `src/components/common/MainLayout.jsx`
  - 기존 GNB 메뉴 구조를 LNB 구조로 재전환
  - LNB 그룹(워크스페이스/어드민센터/고객센터) 렌더링 및 토글 복구
  - 관리자 경로(`/`)의 도메인 선택 메뉴가 활성화되도록 NavLink 구조 복구

### 7) 로컬 모드 워크스페이스 로딩 fallback 복구
- 목적: 로컬 로그인 후 워크스페이스 목록이 비어 보이는 문제 해결
- 영향: `VITE_ENABLE_LOCAL_AUTH=true`일 때 워크스페이스 조회/생성/수정/삭제를 로컬 저장소 기반으로 동작

#### CSS 변경
- 없음

#### JSX/JS 변경 (예외 기록)
- `src/services/api.js`
  - 로컬 모드 플래그(`VITE_ENABLE_LOCAL_AUTH`) 기반 분기 추가
  - `workspaceApi.getAll/getById/create/update/delete`에 localStorage fallback 추가

### 8) 워크스페이스 1뎁스 활성 표시 중복 보정
- 목적: `전체`와 `내 워크스페이스`가 동시에 활성처럼 보이던 문제 해결
- 영향: `filter` 값 기준으로 워크스페이스 1뎁스 메뉴 active가 정확히 하나만 표시됨

#### CSS 변경
- 없음

#### JSX/JS 변경 (예외 기록)
- `src/components/common/MainLayout.jsx`
  - 워크스페이스 2개 메뉴(`ALL`, `MY`)의 className 계산을 명시 함수형으로 변경

### 9) 노트북 상세 문서목록 로컬 fallback 복구
- 목적: 로컬 모드에서 워크스페이스 진입 후 문서가 비어 보이던 문제 해결
- 영향: `admin 워크스페이스` 진입 시 더미 문서/페이지/청크가 표시되어 그래프 탭 접근 가능

#### CSS 변경
- 없음

#### JSX/JS 변경 (예외 기록)
- `src/services/documentApi.js`
  - 로컬 모드(`VITE_ENABLE_LOCAL_AUTH`) 분기 추가
  - `getByWorkspace/getById/getPages/getChunks/getPipelineStatus` fallback 추가
  - `delete/rename/startPipeline` 로컬 상태 처리 분기 추가

### 10) 노트북 상세 채팅/그래프 로컬 fallback 복구
- 목적: `admin 워크스페이스` 진입 후 채팅/지식그래프가 빈 상태로 보이는 문제 해결
- 영향: 로컬 모드에서 질문 시 답변 + 온톨로지 결과가 생성되고, 그래프 탭에서 더미 노드/링크 확인 가능

#### CSS 변경
- 없음

#### JSX/JS 변경 (예외 기록)
- `src/services/chatApi.js`
  - 로컬 모드 분기 및 로컬스토리지 키(`localMockChatHistoryByWorkspace`, `localMockSavedChatsByWorkspace`) 추가
  - `send/getHistory/clearHistory` fallback 추가
  - `savedChat.save/getList/delete` fallback 추가
- `src/components/KnowledgeGraphModal.jsx`
  - 로컬 모드 분기 및 기본 그래프 더미(`localMockGraphByWorkspace`) 추가
  - 초기 로드/검색 시 로컬 데이터 사용, 확장 API는 안내 메시지로 처리

### 11) 워크스페이스 상세 콘텐츠 타이틀 + LNB 활성 표시 보정
- 목적: 워크스페이스 상세 진입 시 콘텐츠 헤더 부재와 LNB 비활성처럼 보이는 문제 해결
- 영향: 상세 화면 상단에 타이틀/경로가 표시되고, `/notebook/:id` 경로에서도 워크스페이스 메뉴 활성 유지

#### CSS 변경
- `src/components/NotebookDetail.css`
  - `.notebook-page-header`, `.notebook-page-breadcrumb`, `.notebook-page-title` 스타일 추가

#### JSX/JS 변경 (예외 기록)
- `src/components/NotebookDetail.jsx`
  - 상세 페이지 상단 헤더(브레드크럼 + 콘텐츠 타이틀) 추가
- `src/components/common/MainLayout.jsx`
  - `isMyWorkspace()` 조건에 `/notebook/:id` 경로 포함

### 12) 상세 상단 헤더 1줄 고밀도 레이아웃 전환
- 목적: 세로 공간 절약을 위해 상세 화면 헤더를 2줄(타이틀+경로)에서 1줄(좌측 타이틀 + 우측 소형 nav) 구조로 전환
- 영향: 콘텐츠 영역 시작점이 위로 올라가고, 경로 인지성은 우측 소형 nav로 유지

#### CSS 변경
- `src/components/NotebookDetail.css`
  - `.notebook-page-header`를 가로 정렬(좌우 배치)로 변경
  - `.notebook-page-breadcrumb-separator`, `.is-current` 스타일 추가
  - `1023px` 이하에서 우측 nav 숨김 처리(모바일/좁은 폭 대응)

#### JSX/JS 변경 (예외 기록)
- `src/components/NotebookDetail.jsx`
  - 상단 헤더를 `h1` + 우측 breadcrumb(nav) 1줄 구조로 변경
  - breadcrumb 데이터: `admin_selected_domain_name > 내 워크스페이스 > 현재 워크스페이스명`

### 13) 상세 헤더 nav 위치/반응형 보정 + main-content 최소너비 명시
- 목적: 좁은 폭에서 nav 소실 방지 및 실제 데이터 증가 시 헤더 안정성 확보
- 영향: nav를 화면 우측 끝이 아닌 타이틀 오른쪽 인접 배치로 변경, 좁은 화면에서도 축약 표시 유지

#### CSS 변경
- `src/components/NotebookDetail.css`
  - `.notebook-page-heading-inline` 추가 (타이틀 + nav 인접 배치)
  - breadcrumb에 `overflow/text-overflow/min-width` 적용
  - `1023px` 이하에서 nav 숨김 대신 축약(`max-width`) 처리
- `src/components/common/MainLayout.css`
  - `.main-layout .main-content`로 스코프 강화
  - `min-width: 0` 명시 추가

#### JSX/JS 변경 (예외 기록)
- `src/components/NotebookDetail.jsx`
  - 타이틀/브레드크럼 DOM 구조를 인접 배치용 래퍼(`notebook-page-heading-inline`)로 변경

### 14) 상세 헤더 세로 정렬 하단 기준으로 보정
- 목적: 타이틀/경로가 공중에 떠 보이는 인상을 줄이고 시각적 기준선을 안정화
- 영향: 상단 헤더의 타이틀과 nav가 중앙 정렬에서 하단 정렬로 변경됨

#### CSS 변경
- `src/components/NotebookDetail.css`
  - `.notebook-page-header`의 `align-items`를 `flex-end`로 변경
  - `.notebook-page-heading-inline`의 `align-items`를 `flex-end`로 변경

#### JSX/JS 변경 (예외 기록)
- 없음

### 15) 페이지 헤더 공통 규격 1안 적용(어드민 1차)
- 목적: 페이지별 제각각이던 제목/카운트/우측 액션 영역을 공통 헤더 컴포넌트 기준으로 통일
- 영향: 어드민 주요 관리 화면의 헤더 높이/정렬/여백 일관성 개선, 좁은 화면에서도 제목/액션의 밀도 유지

#### CSS 변경
- `src/pages/admin/admin-common.css`
  - `admin-btn-icon admin-btn-success-soft` 변형 추가 (캐시 갱신 아이콘 버튼 톤 통일)

#### JSX/JS 변경 (예외 기록)
- `src/pages/admin/AdminWorkspaceManagement.jsx`
  - 상단 영역을 `AdminPageHeader` + `admin-toolbar/admin-search` 구조로 전환
- `src/pages/admin/AdminConfigManagement.jsx`
  - 상단 영역을 `AdminPageHeader` 구조로 전환
  - 카테고리 필터 영역을 `admin-toolbar` 구조로 정리
- `src/pages/admin/AdminArangoManagement.jsx`
  - 상단 영역을 `AdminPageHeader` 구조로 전환

### 16) 스타일 충돌 정리(규칙 적용 1차)
- 목적: 적용되지 않는 것처럼 보이던 UI를 우선순위 충돌 기준으로 정리
- 영향: 어드민 워크스페이스 페이지의 레거시 CSS 의존 제거, 메인 콘텐츠 영역 스타일 충돌 감소

#### CSS 변경
- `src/pages/admin/admin-common.css`
  - 워크스페이스 프롬프트 태그 스타일(`prompt-tag-*`)을 공통 어드민 CSS로 이관
- `src/App.css`
  - 레거시 `.main-content` 선택자를 `.app > .main-content`로 범위 축소
  - 동일 변경을 반응형(`max-width: 768px`) 구간에도 반영

#### JSX/JS 변경 (예외 기록)
- `src/pages/admin/AdminWorkspaceManagement.jsx`
  - `DomainManagement.css` import 제거 (레거시 스타일 의존 제거)

### 17) NotebookDetail 헤더 인라인 스타일 클래스화(규칙 적용 2차)
- 목적: 상세 화면 상단 영역의 CSS 우선순위 충돌을 줄여 적용 안정성 확보
- 영향: 좌측 패널 제목/동기화 배너/소스 액션 래퍼가 인라인 style 대신 클래스 기반으로 동작

#### CSS 변경
- `src/components/NotebookDetail.css`
  - `.notebook-panel-title*` 계열 스타일 추가
  - `.sync-status-warning*`, `.sync-progress-*` 스타일 추가
  - `.source-actions-stack` 스타일 추가

#### JSX/JS 변경 (예외 기록)
- `src/components/NotebookDetail.jsx`
  - 좌측 패널 제목 영역(아이콘/이름/편집 input) 인라인 스타일 제거 및 클래스 적용
  - 동기화 경고/진행 배너 인라인 스타일 제거 및 클래스 적용
  - 소스 액션 래퍼 인라인 스타일 제거 및 클래스 적용

### 18) NotebookDetail 소스 검색/선택 바 클래스화(규칙 적용 3차)
- 목적: 좌측 패널 상단 툴바(검색/전체선택/동기화)의 인라인 스타일 충돌 제거
- 영향: 좁은 화면 및 스타일 재정의 시 우선순위 충돌 감소, 상단 툴바 수정 난이도 개선

#### CSS 변경
- `src/components/NotebookDetail.css`
  - `.source-search-*`, `.source-toolbar-row`, `.source-select-all-*`, `.source-sync-*` 클래스 추가

#### JSX/JS 변경 (예외 기록)
- `src/components/NotebookDetail.jsx`
  - 검색 입력 래퍼/아이콘/인풋 인라인 스타일 제거 및 클래스 적용
  - 전체 선택 라벨/체크박스 인라인 스타일 제거 및 클래스 적용
  - 동기화 버튼/텍스트 인라인 스타일 제거 및 상태 클래스(`is-synced/is-needed`) 적용

### 19) NotebookDetail empty/studio 영역 클래스화(규칙 적용 4차)
- 목적: 좌측 empty 상태와 우측 스튜디오 블록의 인라인 스타일 충돌 제거
- 영향: 문서 없음 상태, 스튜디오 상단 버튼, 최근 생성물 카드가 클래스 기반으로 동작하며 hover/disabled 일관성 개선

#### CSS 변경
- `src/components/NotebookDetail.css`
  - `.source-empty-*` 클래스 추가
  - `.panel-toggle-btn-right`, `.panel-title-right` 클래스 추가
  - `.studio-*` 클래스(버튼/최근생성물/저장대화 리스트/복사/삭제) 추가

#### JSX/JS 변경 (예외 기록)
- `src/components/NotebookDetail.jsx`
  - 문서 없음 영역 인라인 스타일 제거 및 `.source-empty-*` 적용
  - 우측 스튜디오 헤더/버튼/최근 생성물 리스트 인라인 스타일 제거 및 `.studio-*` 적용
  - 삭제/복사 버튼의 인라인 `onMouseOver/onMouseOut` 제거, CSS `:hover`로 전환

### 20) NotebookDetail 채팅 입력/페르소나 바 클래스화(규칙 적용 5차)
- 목적: 채팅 하단 입력부와 페르소나 안내 바의 인라인 스타일 충돌 제거
- 영향: 입력 비활성/전송 버튼/페르소나 표시 영역이 클래스 기반으로 동작해 화면별 스타일 일관성 향상

#### CSS 변경
- `src/components/NotebookDetail.css`
  - `.message-input-area-inline`, `.message-input-textarea`, `.message-send-btn` 추가
  - `.active-persona-*` 클래스 추가

#### JSX/JS 변경 (예외 기록)
- `src/components/NotebookDetail.jsx`
  - 하단 채팅 입력 영역 인라인 스타일 제거 및 클래스 적용
  - 페르소나 안내 바/닫기 버튼 인라인 스타일 제거 및 클래스 적용

### 21) NotebookDetail 채팅 메시지 본문 클래스화(규칙 적용 6차)
- 목적: 메시지 버블/디버그/후속질문/저장복사 버튼의 인라인 스타일 및 hover 이벤트 제거
- 영향: 채팅 본문 스타일 우선순위 안정화, 상태(hover/disabled) 일관성 개선

#### CSS 변경
- `src/components/NotebookDetail.css`
  - `.notebook-chat-*`, `.notebook-debug-*`, `.notebook-action-*`, `.notebook-followup-*` 클래스 추가
  - 저장/복사/액션 버튼 hover 스타일을 CSS `:hover`로 처리

#### JSX/JS 변경 (예외 기록)
- `src/components/NotebookDetail.jsx`
  - 메시지 래퍼/버블 스타일을 인라인에서 클래스 기반으로 전환
  - 디버그 박스/액션 버튼/후속질문/저장복사 버튼 인라인 스타일 제거
  - 인라인 `onMouseOver/onMouseOut` 제거

### 22) NotebookDetail 탭/메타 모달 클래스화(규칙 적용 7차)
- 목적: 상단 탭과 비즈/IT 메타 모달의 인라인 스타일 충돌 제거
- 영향: 탭 disabled 상태와 메타 모달 UI가 클래스 기반으로 동작하며 유지보수 일관성 향상

#### CSS 변경
- `src/components/NotebookDetail.css`
  - `.tab-btn-content`, `.tab-btn:disabled` 추가
  - `.meta-modal-*` 계열 클래스 추가(overlay/content/header/actions/textarea/button)

#### JSX/JS 변경 (예외 기록)
- `src/components/NotebookDetail.jsx`
  - 상단 탭 내부 아이콘/텍스트 래퍼 인라인 스타일 제거 및 `.tab-btn-content` 적용
  - 비즈/IT 용어사전 모달 인라인 스타일 제거 및 `.meta-modal-*` 클래스 적용

### 23) 로고 파일명 배경 기준 정리
- 목적: 페이지 배경 밝기 기준에 따라 로고 파일(`기본`/`_w`) 사용 규칙 통일
- 영향: 다크 배경 화면은 `_w`, 라이트 배경 화면은 기본 로고 사용으로 가독성/일관성 향상

#### CSS 변경
- 없음

#### JSX/JS 변경 (예외 기록)
- `src/components/common/MainLayout.jsx`
  - 로그인 후 헤더 로고를 `knowlearn_logo_w.png`로 설정 (다크 헤더)
- `src/pages/Login.jsx`
  - 다크 배경 로그인 화면 로고를 `knowlearn_logo_w.png`로 설정
- `src/pages/ResetPassword.jsx`
  - 라이트 배경 기준으로 `knowlearn_logo.png` 유지
- `src/components/LoginModal.jsx`
  - 라이트 모달 배경 기준으로 `knowlearn_logo.png` 사용

### 24) LNB 접기/펼치기 모션 부드럽게 개선
- 목적: LNB 토글 시 시각적 끊김을 줄이고, 토스증권 PC 느낌의 자연스러운 펼침/접힘 동작 반영
- 영향: 사이드바 너비 전환과 버튼 아이콘 회전이 부드럽게 동작

#### CSS 변경
- `src/components/common/MainLayout.css`
  - `.lnb-sidebar`에 width/min-width/padding transition 추가
  - `.lnb-collapse-icon` 회전 transition 추가
  - 접힘 상태(`.is-collapsed`)에서 아이콘 180도 회전 적용

#### JSX/JS 변경 (예외 기록)
- `src/components/common/MainLayout.jsx`
  - 토글 버튼에 상태 클래스(`is-collapsed`) 추가
  - 아이콘 조건부 교체 방식 제거, 단일 아이콘 회전 방식으로 전환

### 25) LNB 토글 아이콘/버튼 모션 끊김 보정
- 목적: 접기/펼치기 시 아이콘만 회전하고 버튼 박스가 순간 변경되어 생기던 체감 끊김 완화
- 영향: 아이콘 회전과 버튼 크기/위치 변화가 동일 타이밍으로 전환되어 모션이 더 자연스러워짐

#### CSS 변경
- `src/components/common/MainLayout.css`
  - `.lnb-collapse-icon` transition을 `transform 0.3s ease-out`으로 명시
  - 아이콘에 `backface-visibility: hidden` 추가
  - `.lnb-collapse-toggle`에 width/height/margin/border-radius transition 추가

#### JSX/JS 변경 (예외 기록)
- 없음

### 26) LNB 1뎁스 그룹 토글 아이콘 회전 모션 적용
- 목적: 워크스페이스/어드민센터/고객센터 1뎁스 접기/펼치기 버튼의 전환 모션을 LNB 메인 토글과 동일 톤으로 통일
- 영향: 그룹 토글 시 아이콘 전환이 교체 렌더링에서 회전 애니메이션으로 변경되어 시각적 일관성 향상

#### CSS 변경
- `src/components/common/MainLayout.css`
  - `.lnb-group-chevron` 회전 transition 추가
  - 열린 상태(`.is-open`) 회전값 정의

#### JSX/JS 변경 (예외 기록)
- `src/components/common/MainLayout.jsx`
  - 그룹 토글 아이콘을 조건부 `ChevronDown/ChevronRight` 교체 방식에서 단일 `ChevronDown` + 상태 클래스 회전 방식으로 변경

### 27) LNB 2뎁스 펼침/접힘 모션 적용
- 목적: 2뎁스 메뉴도 즉시 렌더링 전환이 아닌 부드러운 펼침/접힘 모션으로 톤앤매너 통일
- 영향: 워크스페이스/어드민센터/고객센터 하위 메뉴가 부드럽게 열리고 닫힘

#### CSS 변경
- `src/components/common/MainLayout.css`
  - `.lnb-group-highlight`에 `max-height + opacity + translateY` 전환 추가
  - 열림 상태(`.is-open`) 클래스 기반 표시 전환 추가

#### JSX/JS 변경 (예외 기록)
- `src/components/common/MainLayout.jsx`
  - 2뎁스 영역의 조건부 렌더링 제거
  - 그룹별로 `is-open` 상태 클래스를 적용해 애니메이션 기반 전환으로 변경

### 28) 공통 PageHeader 컴포넌트 도입(1차 적용)
- 목적: 페이지별 타이틀/nav 표시를 공통 컴포넌트로 통일해 확장성과 유지보수성 확보
- 영향: 도메인 선택/워크스페이스 상세 화면이 동일한 헤더 패턴(title + breadcrumb + actions)을 사용

#### CSS 변경
- `src/components/common/PageHeader.css` (신규)
  - 공통 헤더 레이아웃/브레드크럼/액션 스타일 정의
- `src/pages/DomainSelection.css`
  - 도메인 추가 버튼 클래스(`.domain-add-btn`) 추가

#### JSX/JS 변경 (예외 기록)
- `src/components/common/PageHeader.jsx` (신규)
  - `title`, `breadcrumbs`, `description`, `actions` props를 받는 공통 헤더 컴포넌트 추가
- `src/components/NotebookDetail.jsx`
  - 기존 상세 헤더 마크업을 `PageHeader` 호출로 교체
- `src/pages/DomainSelection.jsx`
  - 상단 제목 영역을 `PageHeader` 호출로 교체
  - 도메인 추가 버튼을 공통 헤더 actions 슬롯으로 이동

### 29) 도메인선택 페이지 콘텐츠 여백 정렬 보정
- 목적: 공통 `main-content` 여백과 중복되던 도메인 선택 페이지 내부 패딩 제거
- 영향: 도메인 선택 페이지가 다른 콘텐츠 화면과 동일한 시작 여백/정렬 톤으로 표시

#### CSS 변경
- `src/pages/DomainSelection.css`
  - `.domain-selection-container`의 자체 패딩/배경/고정 높이 제거
  - `.domain-selection-content` 정렬을 `left` 기준으로 변경하고 최대 폭을 공통 톤에 맞게 보정
  - 사용하지 않는 `.domain-header` 스타일 제거

#### JSX/JS 변경 (예외 기록)
- 없음

### 30) 도메인선택 헤더 breadcrumb 계층 표시 보정
- 목적: `도메인 선택`이 2뎁스 메뉴임에도 상위 1뎁스(`어드민센터`)가 헤더에 표시되지 않던 문제 해결
- 영향: 도메인 선택 화면에서 `어드민센터 / 도메인 선택` breadcrumb가 표시되어 계층 인지가 개선됨

#### CSS 변경
- 없음

#### JSX/JS 변경 (예외 기록)
- `src/pages/DomainSelection.jsx`
  - `PageHeader`에 `breadcrumbs={['어드민센터', '도메인 선택']}` 추가

### 31) 도메인선택 breadcrumb 표기 간소화
- 목적: 타이틀이 이미 2뎁스(`도메인 선택`)를 표현하므로 breadcrumb 중복 표기를 제거
- 영향: 도메인 선택 화면에서 breadcrumb는 1뎁스(`어드민센터`)만 표시

#### CSS 변경
- 없음

#### JSX/JS 변경 (예외 기록)
- `src/pages/DomainSelection.jsx`
  - `PageHeader` breadcrumb를 `['어드민센터', '도메인 선택']` → `['어드민센터']`로 변경

### 32) 도메인선택 보조문구 위치 조정(헤더 → 콘텐츠)
- 목적: 보조문구를 타이틀 헤더가 아닌 콘텐츠 영역 안내 문구로 배치
- 영향: 상단 헤더는 타이틀/네비 중심으로 유지되고, 안내 문구는 테이블 진입 영역에서 확인 가능

#### CSS 변경
- `src/pages/DomainSelection.css`
  - `.domain-content-help` 스타일 추가(우측 정렬 안내문구)

#### JSX/JS 변경 (예외 기록)
- `src/pages/DomainSelection.jsx`
  - `PageHeader`의 `description` 제거
  - 콘텐츠 영역에 `domain-content-help` 문구 추가

### 33) 도메인선택 보조문구 1줄 정렬(좌: 사용자, 우: 안내문구)
- 목적: `관리자 로그인(admin)`과 보조문구를 한 줄에 배치해 정보 밀도와 정렬 일관성 개선
- 영향: 상단 보조 정보가 2줄에서 1줄로 통합되어 세로 공간 절약

#### CSS 변경
- `src/pages/DomainSelection.css`
  - `.domain-content-help`의 margin 제거
  - `.domain-content-help`에 `white-space: nowrap` 적용

#### JSX/JS 변경 (예외 기록)
- `src/pages/DomainSelection.jsx`
  - `domain-content-help` 문구를 `user-info-bar` 내부 우측 영역으로 이동
  - 기존 별도 문단(`<p>`) 구조 제거

### 34) 도메인선택 테이블 헤더(th) 간격 정리
- 목적: 테이블 헤더 항목명이 줄바꿈 없이 읽히도록 간격만 보정
- 영향: 정렬 방식은 유지하고, 헤더 셀 내부 여백/표기 안정성 개선

#### CSS 변경
- `src/pages/DomainSelection.css`
  - `.domain-list-table th` 패딩 조정(`14px 16px` → `12px 18px`)
  - `white-space: nowrap`, `line-height: 1.25` 추가

#### JSX/JS 변경 (예외 기록)
- `src/pages/DomainSelection.jsx`
  - 헤더 폭 미세 조정: `선택` 컬럼 `64`, `관리` 컬럼 `92`

### 35) PageHeader breadcrumb 규칙 정리(타이틀 중복 제거)
- 목적: 콘텐츠 타이틀 문구가 nav breadcrumb에 중복 표기되지 않도록 공통 규칙화
- 영향: nav는 항상 콘텐츠 타이틀의 바로 상위 메뉴까지만 노출

#### CSS 변경
- 없음

#### JSX/JS 변경 (예외 기록)
- `src/components/common/PageHeader.jsx`
  - breadcrumb 배열 정규화(빈 값 제거/trim)
  - breadcrumb 마지막 항목이 `title`과 같으면 자동 제외
  - 렌더링 기준을 `displayBreadcrumbs`로 통일

### 36) PageHeader 예외 옵션 추가(NotebookDetail 분기)
- 목적: 공통 헤더 규칙을 유지하면서 페이지별 breadcrumb 예외를 선택적으로 허용
- 영향: 기본 페이지는 기존 규칙 유지, NotebookDetail은 타이틀 breadcrumb 유지 가능

#### CSS 변경
- 없음

#### JSX/JS 변경 (예외 기록)
- `src/components/common/PageHeader.jsx`
  - `autoTrimTitleFromBreadcrumb` 옵션 추가(기본값 `true`)
  - 옵션이 `false`이면 breadcrumb 마지막 타이틀 자동 제거를 비활성화
- `src/components/NotebookDetail.jsx`
  - `PageHeader` 호출에 `autoTrimTitleFromBreadcrumb={false}` 적용

### 37) NotebookDetail 헤더 노출 토글 + breadcrumb 상위만 표시 복원
- 목적: NotebookDetail에서 헤더 노출을 페이지 단위로 쉽게 제어하고, nav 중복 표기를 제거
- 영향: 콘텐츠 타이틀 옆 nav는 상위 메뉴까지만 표시되며, 필요 시 헤더를 즉시 숨길 수 있음

#### CSS 변경
- 없음

#### JSX/JS 변경 (예외 기록)
- `src/components/NotebookDetail.jsx`
  - `showNotebookPageHeader` 플래그 추가(`true` 기본)
  - `PageHeader` 렌더를 플래그 조건으로 감싸 노출/숨김 제어 가능하게 변경
  - `autoTrimTitleFromBreadcrumb={false}` 제거(공통 기본 규칙으로 복귀)

### 38) 헤더 이용서비스 문구 상시 노출(반응형 구간 보정)
- 목적: 상단 우측 `이용 서비스` 문구가 반응형 구간에서 사라지지 않도록 유지
- 영향: 1023px 이하에서도 `이용 서비스` 텍스트가 계속 표시됨

#### CSS 변경
- `src/components/common/MainLayout.css`
  - `@media (max-width: 1023px)`의 `.service-label`을 숨김 제거(`display: inline`)로 변경
  - 동일 구간의 `.service-label` 글자 크기 `11px`로 보정
  - 동일 구간의 `.service-info-btn` 패딩 `6px 10px`로 보정

#### JSX/JS 변경 (예외 기록)
- 없음

## 2026-05-01

### 39) 고객센터 3개 메뉴 공통 PageHeader 적용
- 목적: 콘텐츠 타이틀/상위 nav 표기를 공통 규격으로 통일하여 페이지 간 헤더 일관성 확보
- 영향: 공지사항, FAQ, 1:1 문의 페이지가 동일한 `PageHeader` 구조로 동작

#### CSS 변경
- 없음

#### JSX/JS 변경 (예외 기록)
- `src/pages/NoticeList.jsx`
  - 기존 `notice-header` 마크업을 `PageHeader`로 교체
  - breadcrumb를 `['고객센터', '공지사항']`로 연결
- `src/pages/Faq.jsx`
  - 기존 `faq-header` 마크업을 `PageHeader`로 교체
  - breadcrumb를 `['고객센터', '자주 묻는 질문']`로 연결
- `src/pages/QnaBoard.jsx`
  - 기존 `qna-header` 마크업을 `PageHeader`로 교체
  - breadcrumb를 `['고객센터', '1:1 문의']`로 연결

### 40) 고객센터 페이지 콘텐츠 여백 기준 통일
- 목적: 고객센터 페이지의 콘텐츠 시작 위치/폭을 도메인선택·워크스페이스와 동일 기준으로 정렬
- 영향: 공지사항/FAQ/1:1 문의 페이지의 좌우 여백 및 상단 시작선이 공통 콘텐츠 영역과 일치

#### CSS 변경
- `src/pages/NoticeList.css`
  - `.notice-page` 배경/마진/min-height를 공통 레이아웃 기준으로 조정
  - `.notice-container`를 `max-width: 1100px`, `width: 100%`, `padding: 0`으로 변경
  - 모바일 구간 `.notice-container` 패딩 `0`으로 통일
- `src/pages/Faq.css`
  - `.faq-page` 배경/마진/min-height를 공통 레이아웃 기준으로 조정
  - `.faq-container`를 `max-width: 1100px`, `width: 100%`, `padding: 0`으로 변경
  - 모바일 구간 `.faq-container` 패딩 `0`으로 통일
- `src/pages/QnaBoard.css`
  - `.qna-page` 배경/마진/min-height를 공통 레이아웃 기준으로 조정
  - `.qna-container`를 `max-width: 1100px`, `width: 100%`, `padding: 0`으로 변경
  - 모바일 구간 `.qna-container` 패딩 `0`으로 통일

#### JSX/JS 변경 (예외 기록)
- 없음

### 41) 어드민센터(도메인 관리~Action) 공통 PageHeader/여백 기준 정렬
- 목적: 어드민센터 메뉴(도메인 관리~Action)의 타이틀 헤더를 공통 규격으로 통일하고 콘텐츠 폭/시작 여백을 도메인선택 기준과 정렬
- 영향: 어드민센터 페이지 전반에서 상단 타이틀/브레드크럼 표시와 콘텐츠 정렬 일관성 향상

#### CSS 변경
- `src/pages/admin/admin-common.css`
  - `.admin-page`에 `max-width: 1100px`, `width: 100%`, `margin: 0` 적용
- `src/components/DomainManagement.css`
  - `.domain-management-container`를 `max-width: 1100px`, `width: 100%`, `padding: 0`, `margin: 0`으로 조정

#### JSX/JS 변경 (예외 기록)
- `src/components/admin/AdminPageHeader.jsx`
  - 내부 렌더를 `PageHeader` 기반으로 변경
  - breadcrumb를 `['어드민센터']`로 통일
  - 카운트는 타이틀 문자열에 병기(`제목 (count)`)하도록 변환
- `src/components/DomainManagement.jsx`
  - 기존 `domain-header` 마크업을 `PageHeader`로 교체
  - `도메인 관리` 페이지 설명/액션(검색/새 도메인 버튼)을 `PageHeader` 슬롯으로 이관
- `src/pages/admin/AdminUpgradeRequests.jsx`
  - 페이지 제목 영역을 `PageHeader`로 교체(`승인 관리`)
  - 루트 컨테이너를 `admin-page` + `max-width: 1100px` 기준으로 조정
- `src/prompt/components/prompts/PromptList.jsx`
  - 루트 `admin-page` 인라인 패딩(`24px 32px`) 제거

### 42) 어드민센터 타이틀 상단 간격 기준 통일(도메인선택 기준)
- 목적: 어드민센터 페이지의 콘텐츠 타이틀 시작선이 페이지별로 달라 보이는 문제를 해소
- 영향: 도메인선택과 동일한 컴팩트 헤더 높이로 어드민 페이지 타이틀 시작 위치 일관화

#### CSS 변경
- 없음

#### JSX/JS 변경 (예외 기록)
- `src/components/admin/AdminPageHeader.jsx`
  - `showDescription` 옵션 추가(기본 `false`)
  - 기본 렌더에서 보조 설명문을 표시하지 않도록 변경
- `src/components/DomainManagement.jsx`
  - `PageHeader`의 `description` 제거
- `src/pages/admin/AdminUpgradeRequests.jsx`
  - `PageHeader`의 `description` 제거

### 43) 콘텐츠 영역 가로 폭·최소 뷰포트 대응
- 목적: 메인 레이아웃 콘텐츠 패널 안에서 도메인선택·고객센터·어드민 페이지가 뷰포트 너비를 활용하고, 좁은 창에서도 요소가 잘리지 않거나 가로 스크롤로 정상 탐색되도록 정리
- 영향: `max-width: 1100px` 등으로 콘텐츠가 중앙에 좁게 고정되던 현상 제거, 플렉스 자식 `min-width: 0`으로 가로 오버플로 방지

#### CSS 변경
- `src/pages/DomainSelection.css`
  - `.domain-selection-container`·`.domain-selection-content`에 `min-width: 0`, 콘텐츠 `max-width: 100%`
  - `.domain-list-container`를 `overflow-x: auto`(+ touch 스크롤)로 변경해 표 너비 초과 시 스크롤
- `src/pages/admin/admin-common.css`
  - `.admin-page`·`.admin-page-body`를 `max-width: 100%`, `min-width: 0`으로 조정
  - `.admin-table-wrap`에 `min-width: 0`, `-webkit-overflow-scrolling: touch` 추가
- `src/pages/NoticeList.css`, `src/pages/Faq.css`, `src/pages/QnaBoard.css`
  - 각 `*-container`를 `max-width: 100%`, `min-width: 0`으로 조정
- `src/components/DomainManagement.css`
  - `.domain-management-container`를 `max-width: 100%`, `min-width: 0`
  - `.domain-toolbar`에 `flex-wrap`, `min-width: 0`; `.search-wrapper`를 유연 폭(`flex`/`max-width: 300px`)으로 조정
- `src/pages/Admin.css`, `src/App.css`
  - 레거시 `.admin-content`, `.app > .main-content`를 `max-width: 100%`, `min-width: 0`으로 조정

#### JSX/JS 변경 (예외 기록)
- `src/pages/admin/AdminUpgradeRequests.jsx`
  - 루트 `admin-page`의 인라인 `maxWidth: 1100px` 제거(CSS 클래스와 동일 정책)
  - 목록 래퍼에 `overflowX: 'auto'` 적용(넓은 표 가로 스크롤)

### 44) 노트북 상세 > 사전 탭 가독성 개선 및 우측 필터 잘림 대응
- 목적: 노트북 상세의 사전 탭 내부(개념/관계/액션) 식별성을 높이고, 필터/정렬/검색 컨트롤이 좁은 폭에서 잘려 보이는 문제를 해소
- 영향: 탭은 카드형 스타일로 시각 구분이 강화되고, 우측 컨트롤은 마우스 휠/터치 스와이프 및 좌우 버튼으로 항상 접근 가능

#### CSS 변경
- `src/components/DictionaryView.css`
  - `.view-header`/`.tab-group`에 `min-width: 0`, `gap` 추가로 헤더 레이아웃 안정화
  - 기존 범용 `.tab-btn` 스타일을 사전 전용 `.dictionary-mode-tab*` 계열로 치환
  - 사전 내부 탭을 카드형(라벨+서브타이틀) 스타일로 재구성해 강조도 및 가독성 개선
  - `filter-search-scroll-wrap`, `filter-search-scroll`, `scroll-nav-btn` 추가로 우측 컨트롤 가로 스크롤/버튼 내비게이션 지원

#### JSX/JS 변경 (예외 기록)
- `src/components/DictionaryView.jsx`
  - 사전 탭 버튼 클래스/마크업을 `dictionary-mode-tab` 구조로 변경
  - 우측 필터 영역을 스크롤 래퍼(`filter-search-scroll`)로 감싸고 좌우 이동 버튼 추가
  - 스크롤 가능 여부 상태(`canScrollControlsLeft/Right`) 및 휠 수평 스크롤 핸들러 도입

### 45) 사전 내부 탭 컴팩트화(공간 활용 개선)
- 목적: 노트북 상세의 사전 화면에서 개념/관계/액션 탭이 차지하는 높이와 폭을 줄여 실제 데이터 영역 가시성 확보
- 영향: 상단 헤더 높이 감소, 탭/필터 컨트롤 밀도 향상으로 좁은 폭에서도 정보 노출량 증가

#### CSS 변경
- `src/components/DictionaryView.css`
  - `.view-header` 패딩/간격 축소(`16x24` -> `10x16`)
  - `.dictionary-mode-tab*`의 최소폭·패딩·폰트 크기 축소(카드형은 유지하되 컴팩트화)
  - `.item-count-info`, `.filter-search-group`, `.category-filter-inline`, `.search-bar` 관련 폰트/간격/입력폭 축소
  - 스크롤 버튼(`.scroll-nav-btn`) 크기 축소

#### JSX/JS 변경 (예외 기록)
- 없음

### 46) 노트북 상세 900px 대응 자동 접힘 + 사전 필터 단순화
- 목적: 콘텐츠 영역이 좁아질 때(<=900px) 좌우 패널을 자동으로 접어 중앙 콘텐츠(채팅/지식그래프/사전)가 깨지지 않도록 보장하고, 사전 탭 필터 영역의 조작 복잡도 감소
- 영향: 좁은 폭에서 중앙 패널 우선 노출, 사전 탭 헤더의 시각 노이즈 감소 및 입력 컨트롤 밀도 개선

#### CSS 변경
- `src/components/DictionaryView.css`
  - 필터 그룹 간격 추가 축소(`gap: 10px` -> `8px`)
  - 카테고리/정렬 `select` 텍스트 크기 축소(`13px` -> `12px`) 및 `min-height: 26px` 보장
  - 검색 입력 텍스트 크기 축소(`13px` -> `12px`), placeholder 축소(`11px`), 입력/컨테이너 `min-height: 26px` 보장
  - 시각적 라벨 숨김용 `.visually-hidden` 유틸리티 클래스 추가
  - 좌우 스크롤 버튼 스타일 제거(버튼 UI 제거에 맞춤)

#### JSX/JS 변경 (예외 기록)
- `src/components/NotebookDetail.jsx`
  - `notebook-layout`에 `ResizeObserver` 기반 폭 감지 추가
  - 레이아웃 폭이 `900px 이하`이면 좌/우 패널 자동 접힘, 폭 복구 시 이전 사용자 상태 복원
  - 좌/우 토글 핸들러를 분리해 자동 접힘 상태와 사용자 선호 상태를 함께 관리
- `src/components/DictionaryView.jsx`
  - 필터 영역 좌/우 스크롤 버튼 제거
  - 카테고리/정렬 라벨을 시각적으로 숨기고(`visually-hidden`) `aria-label`로 접근성 유지
  - 검색 placeholder 문구 단축(`검색어 입력 후 Enter...` -> `검색어 입력...`)

### 47) 노트북 상세 상단 탭 크기 정렬 + 외부 이동 버튼 차별화
- 목적: 채팅/지식그래프/사전 탭의 너비 불균형을 해소하고, 외부 이동(온톨로지 관리) 액션을 내부 탭과 명확히 구분
- 영향: 내부 탭 3개는 동일 폭으로 안정적 정렬, 온톨로지 관리는 보조 CTA 형태로 시각 분리

#### CSS 변경
- `src/components/NotebookDetail.css`
  - `.tabs-header`를 `tabs-primary + tab-btn-exp` 구조에 맞춰 간격/패딩 재정의
  - `.tabs-primary`를 그리드로 분리하고 관리자(`3열`)·일반사용자(`2열`) 케이스별 동일 폭 정렬 적용
  - `.tab-btn-exp`를 고정형 보조 버튼 스타일(테두리/패딩 보정)로 조정
  - 좁은 폭 구간에서 탭 영역 `overflow-x: auto` 복귀 및 최소폭 기준(`540px`) 설정

#### JSX/JS 변경 (예외 기록)
- `src/components/NotebookDetail.jsx`
  - 상단 내부 탭을 `.tabs-primary` 래퍼로 묶고, 사용자 권한에 따라 `is-admin`/`is-user` 클래스 분기
  - 외부 이동 버튼(온톨로지 관리)에서 앞쪽 아이콘(`BookOpen`) 제거, 외부 이동 아이콘만 유지

### 48) 로컬 확인용 더미 데이터 보강(배포 분리)
- 목적: 백엔드 미기동 상태에서도 노트북 상세 화면 확인이 가능하도록 로컬 모드 더미 응답 범위를 확장
- 영향: `VITE_ENABLE_LOCAL_AUTH=true`일 때만 워크스페이스 역할/사전 API가 localStorage 더미로 동작, 배포 환경에는 영향 없음

#### CSS 변경
- 없음

#### JSX/JS 변경 (예외 기록)
- `src/services/api.js`
  - 로컬 전용 key 추가: `localMockWorkspaceRolesByWorkspace`, `localMockDictionaryByWorkspace`
  - `workspaceApi.getRoles`에 로컬 fallback 추가(기초값 역할 기본 제공)
  - `dictionaryApi.getConcepts/getRelations/getActions/getCategories`에 로컬 fallback 추가
  - 로컬 사전 데이터 보관/초기화/페이지네이션 유틸리티 추가(검색/카테고리 필터 포함)

### 49) 좁은 폭에서 중앙 패널 우선 보장 + 온톨로지 버튼 라인 정리
- 목적: 화면이 줄어들 때 좌/우 패널을 자동 접어 중앙(채팅/지식그래프/사전/온톨로지) 영역이 깨지지 않도록 보장하고, 온톨로지 버튼 우측 라인 중복을 제거
- 영향: 중앙 탭 가시성 향상, 온톨로지 버튼 주변 경계선 시각 정렬 개선

#### CSS 변경
- `src/components/NotebookDetail.css`
  - `.tabs-header` 좌우 패딩 제거로 탭 헤더 경계선 정렬
  - `.tab-btn-exp`를 흰 배경+좌측 구분선 스타일로 변경(외곽 테두리 제거)
  - 좁은 폭에서 `.tab-btn-exp` 최소폭 지정으로 텍스트 잘림 방지

#### JSX/JS 변경 (예외 기록)
- `src/components/NotebookDetail.jsx`
  - 자동 접힘 기준을 단순 `900px`에서 `중앙 추정 폭 < 680px` 조건까지 확장
  - `viewerOpen` 상태를 자동 접힘 계산 의존성에 포함해 문서 뷰어 확장 시에도 중앙 영역 보호

### 50) 사전 탭 필터/검색 우측 정렬 및 컨트롤 폭 정규화
- 목적: 사전 탭의 카테고리/정렬/select + 검색 입력을 우측 정렬로 통일하고, 컨트롤 크기를 맞춰 시각적 정렬감 개선
- 영향: 필터 영역이 헤더 우측에 정렬되고, select/input 높이(26px)와 폭이 균형 있게 정리됨

#### CSS 변경
- `src/components/DictionaryView.css`
  - `.filter-search-group`에 `margin-left: auto` 적용
  - `.filter-search-scroll`에 `display: flex`, `justify-content: flex-end` 적용
  - `select`를 `height: 26px`, `width/min-width: 112px`로 축소 및 박스 모델 정규화
  - 검색 박스를 `height: 26px`, 입력 폭 `118px`으로 고정(`width/min/max`)해 포커스 시 크기 변동 없이 유지

#### JSX/JS 변경 (예외 기록)
- `src/components/DictionaryView.jsx`
  - 검색 placeholder 문구를 기존 `"검색어 입력 후 Enter..."`로 복원

### 51) 자동 접힘 상태에서 사용자 수동 펼침 우선권 보장
- 목적: 좁은 화면에서 자동 접힘이 발동한 뒤에도 사용자가 좌/우 토글 버튼으로 다시 펼칠 수 있도록 제어 우선권 보장
- 영향: 자동 접힘 조건이 유지되어도 수동으로 연 패널이 즉시 재접히지 않음, 탭 전환/폭 복구 시 정책은 정상 재적용

#### CSS 변경
- 없음

#### JSX/JS 변경 (예외 기록)
- `src/components/NotebookDetail.jsx`
  - `autoCollapseSuppressedRef` 추가
  - 자동 접힘 상태에서 사용자가 좌/우 토글 시 자동 재접힘을 일시 억제
  - `graph`/`dictionary`/`chat` 탭 전환 시 억제 상태 초기화(메뉴 정책 우선)
  - 폭이 다시 넓어질 때 억제 상태 초기화

### 52) 좁은 화면 대응: 상단 탭 축소, 하단 필터 영역만 스크롤
- 목적: 화면 축소 시 상단 탭 줄은 가로 스크롤 대신 탭 자체를 축소하고, 하단 필터/검색 줄에만 얇은 가로 스크롤을 허용
- 영향: 상단 탭의 시각 안정성 향상, 필터 컨트롤은 필요한 구간에서만 스크롤 가능

#### CSS 변경
- `src/components/NotebookDetail.css`
  - `@media (max-width: 1180px)`에서 `.tabs-header`의 가로 스크롤 제거(`overflow-x: hidden`)
  - 상단 탭(`.tab-btn`, `.tab-btn-content`, 아이콘, `.tab-btn-exp`) 패딩/폰트/아이콘 크기 축소
  - `.tabs-primary` 최소폭 강제값 제거
- `src/components/DictionaryView.css`
  - `@media (max-width: 1180px)`에서 필터 스크롤 영역 정렬을 시작점(`justify-content: flex-start`)으로 전환
  - 동일 구간에서 `.filter-search-group`의 좌측 자동 여백 해제해 스크롤 영역 자연화

#### JSX/JS 변경 (예외 기록)
- 없음

### 53) 노트북 상세 자동 접힘 제거 + 본문 가로 스크롤 전환
- 목적: 자동 접힘/펼침 경계에서 발생하던 깜빡임을 제거하고, 사용자가 직접 좌/우 패널을 제어하도록 단순화
- 영향: 탭 전환/리사이즈 시 자동 접힘 없음, 콘텐츠 영역은 가로 스크롤로 전체 기능 유지

#### CSS 변경
- `src/components/NotebookDetail.css`
  - `.notebook-layout`를 `overflow-x: auto`/`overflow-y: hidden`으로 변경
  - `.panel-center` 최소폭을 `620px`로 지정해 중앙 콘텐츠 찌그러짐 방지

#### JSX/JS 변경 (예외 기록)
- `src/components/NotebookDetail.jsx`
  - `ResizeObserver` 기반 자동 접힘 로직 제거
  - 자동 접힘 상태 추적 refs(`notebookLayoutRef`, `autoCollapsedByWidthRef`, `autoCollapseSuppressedRef`, 선호 상태 refs) 제거
  - `handleTabChange`의 자동 접힘/자동 펼침 제거(탭 전환은 탭 상태만 변경)
  - 좌/우 토글은 사용자 클릭으로만 동작하도록 단순화

### 54) 사전 필터 우측 정렬 회귀 수정
- 목적: 사전 탭 필터 컨트롤이 특정 폭에서 좌측 정렬로 되돌아가던 회귀 현상 해소
- 영향: 카테고리/정렬/검색 컨트롤이 화면 폭과 무관하게 우측 정렬 유지

#### CSS 변경
- `src/components/DictionaryView.css`
  - `@media (max-width: 1180px)`의 필터 정렬 예외(`justify-content: flex-start`, `margin-left: 0`) 제거

#### JSX/JS 변경 (예외 기록)
- 없음

### 55) 공통 레이아웃 이중 스크롤 제거(헤더 고정 유지)
- 목적: 페이지/컴포넌트 스크롤이 중첩되어 발생하는 이중 스크롤을 줄이고, 헤더는 고정된 상태로 본문에서만 스크롤되도록 공통화
- 영향: 브라우저(body) 스크롤 비활성화, 메인 콘텐츠 영역이 단일 세로 스크롤 컨테이너로 동작

#### CSS 변경
- `src/index.css`
  - `html, body, #root` 높이를 `100%`로 고정
  - `body`에 `overflow: hidden` 적용해 루트 페이지 스크롤 방지
- `src/components/common/MainLayout.css`
  - `.main-layout .main-content`의 `overflow: auto`를 `overflow-y: auto; overflow-x: hidden;`으로 변경
  - 가로 스크롤은 페이지별 내부 컨테이너에서만 처리하도록 분리

#### JSX/JS 변경 (예외 기록)
- 없음

### 56) 사전 탭 최소 가로폭 740px 적용
- 목적: 사전 탭의 필터/테이블 헤더가 좁은 폭에서 잘리거나 겹치지 않도록 최소 표시 폭 보장
- 영향: 사전 화면은 `740px` 이하에서 가로 스크롤로 전체 요소를 온전히 확인 가능

#### CSS 변경
- `src/components/DictionaryView.css`
  - `.dictionary-view`에 `min-width: 740px` 추가

#### JSX/JS 변경 (예외 기록)
- 없음

### 57) 노트북 상세에서 사전 탭 선택 시 중앙 패널 최소폭 연동
- 목적: 기본 탭(채팅) 기준 최소폭(620px) 때문에 사전 탭 전환 시에도 중앙 영역이 740px로 늘어나지 않던 문제 해결
- 영향: 사전 탭 활성화 시 중앙 패널이 `min-width: 740px`을 적용받아 잘림 없이 가로 스크롤로 자연 확장

#### CSS 변경
- `src/components/NotebookDetail.css`
  - `.panel-center.is-dictionary { min-width: 740px; }` 추가

#### JSX/JS 변경 (예외 기록)
- `src/components/NotebookDetail.jsx`
  - 중앙 패널에 `activeTab === 'dictionary'`일 때 `is-dictionary` 클래스 조건부 부여

### 58) 공통 스크롤 감지 여백 방식 롤백 + 노트북 스크롤 여백 직접 적용
- 목적: 공통 동적 감지 방식으로 인한 스크롤 동작 회귀 가능성을 제거하고, 요청 의도(콘텐츠와 가로 스크롤 간 10px 간격)를 노트북 상세 스크롤 컨테이너에서 직접 보장
- 영향: 공통 레이아웃은 단순 상태로 복귀, 노트북 상세 가로 스크롤은 콘텐츠와 10px 이격 유지

#### CSS 변경
- `src/components/common/MainLayout.css`
  - `.main-layout .main-content.has-horizontal-scroll` 규칙 제거(공통 감지 방식 롤백)
- `src/components/NotebookDetail.css`
  - `.notebook-layout`에 `padding-bottom: 10px`, `box-sizing: border-box` 추가

#### JSX/JS 변경 (예외 기록)
- `src/components/common/MainLayout.jsx`
  - `hasHorizontalScroll`/`mainContentRef` 및 `ResizeObserver`/`MutationObserver` 기반 감지 로직 제거
  - `main-content` 클래스 바인딩을 단순 클래스 형태로 복구

## 2026-05-02

### 59) 노트북 상세 중앙 패널 min-width 제거 및 사전 탭 내부 가로 스크롤
- 목적: 뷰포트가 좁을 때도 좌·우 패널이 잘리지 않게 하고, 사전 영역만 필요 시 가로 스크롤로 전체를 보도록 분리
- 영향: 중앙 패널은 `min-width: 0`으로 유연하게 수축, 사전 탭은 `.tab-content` 안에서만 가로 스크롤(레이아웃 전체에는 가로 스크롤 없음)

#### CSS 변경
- `src/components/NotebookDetail.css`
  - `.panel-center`를 `flex: 1`, `min-width: 0`으로 정리(고정 최소폭 제거)
  - `.panel-center.is-dictionary > .tab-content`에 `overflow-x: auto`, `overflow-y: auto`
  - `.panel-center.is-dictionary > .tab-content > .dictionary-view`에 `min-width: 740px`
  - 패널 토글용 `.notebook-layout.toggling`·중앙 고정 min-width 연동 룰 등 불필요 규칙 정리

#### JSX/JS 변경 (예외 기록)
- `src/components/NotebookDetail.jsx`
  - 좌·우 패널 토글 후 가로 스크롤 끝 정렬용 보정 로직 제거(`adjustNotebookScrollToEdge`, 관련 `useEffect`/refs)

### 60) 문서 뷰어(소스 문서 클릭) 활성 시 좌측 패널 폭 축소
- 목적: 뷰어가 넓게 열릴 때 중앙 탭(채팅~사전)·우측 스튜디오가 과도하게 찌그러지는 현상 완화
- 영향: `viewer-active` 시 좌측 패널 폭 `700px` → `400px`

#### CSS 변경
- `src/components/NotebookDetail.css`
  - `.panel-left.viewer-active { width: 400px; }`로 조정

#### JSX/JS 변경 (예외 기록)
- 없음

### 61) 공통 가로 스크롤 자동 페이드(AutoScrollFade) 제거
- 목적: 스크롤 시 성능 저하(버벅임) 및 페이드 배경색과 영역 불일치로 인한 시각적 불만 해소
- 영향: 가로 스크롤이 있는 영역에 좌·우 그라데이션 페이드가 자동 부착되지 않음(순수 스크롤만 유지)

#### CSS 변경
- `src/index.css`
  - `.has-h-scroll-fade` 및 `::before`/`::after` 관련 전역 스타일 블록 삭제

#### JSX/JS 변경 (예외 기록)
- `src/components/common/MainLayout.jsx`
  - `installAutoScrollFade` import 및 `.main-content`에 대한 설치 `useEffect` 제거

#### 파일 삭제
- `src/utils/autoScrollFade.js`

### 62) 작업 기록 방식
- 목적: UI 변경 이력을 날짜별로 추적 가능하게 유지
- 영향: 이후 UI 관련 작업 시 `docs/ui-history.md`에 **작업일 기준**으로 항목 추가
- **(참고·현행)** 갱신은 파일 상단 **갱신 정책(현행)** — **사용자 요청 시에만** 항목을 추가한다(`.cursor/rules/ui-history-on-request.mdc`).

### 63) 노트북 상세 가운데 패널 폭 330px 미만 시 탭 아이콘·라벨 세로 정렬
- 목적: 좌측 문서 뷰어·우측 스튜디오 등으로 중앙 패널이 매우 좁아질 때 탭 라벨이 가로 한 줄에 꾸겨 넣어지며 깨져 보이는 현상 완화
- 영향: 가운데 패널 **실제 폭**이 330px 미만이면 채팅/지식그래프/사전 탭과 온톨로지 관리 버튼에서 아이콘 위·텍스트 아래 스택 배치

#### CSS 변경
- `src/components/NotebookDetail.css`
  - `.panel-center`에 `container: notebook-center / inline-size` (컨테이너 쿼리 기준 축)
  - `@container notebook-center (max-width: 330px)` 블록에서 `.tab-btn-content` 등 세로 정렬·폰트·패딩 조정

#### JSX/JS 변경 (예외 기록)
- 없음

### 64) 노트북 상세 채팅·지식그래프 타이포·폼 요소를 사전 탭 기준으로 정렬
- 목적: 지식 그래프 툴바가 사전 필터 대비 크고 투박하게 느껴지는 문제를 줄이고, 채팅 입력·메시지 말풍선도 동일 톤의 글자 크기·색역으로 통일
- 영향: 지식 그래프는 검색/Depth/버튼을 높이 26px·12px 글꼴 계열로 축소, 채팅은 입력행 36px·12px·테두리 `#dadce0`, 말풍선 13px·`#3c4043`

#### CSS 변경
- `src/components/KnowledgeGraphModal.css`
  - `.kg-search-input`·`.kg-depth-input`·`.kg-btn`·`.kg-suggestions li`·`.kg-loading-overlay`를 사전 필터·검색창과 유사한 패딩·높이·글자 크기로 조정
  - `.kg-search-controls` 배경 `#f8f9fa`로 정돈
- `src/components/NotebookDetail.css`
  - `.message-input-textarea`·`.message-send-btn`·`.chat-messages`/`.message-input-area` 여백, `.notebook-chat-bubble` 말풍선 크기·색상 조정

#### JSX/JS 변경 (예외 기록)
- `src/components/KnowledgeMapView.jsx`
  - 상단 툴바 인라인 스타일(배경·글자 크기·구분선·로딩/빈 상태 문구)을 동일 톤으로 축소

### 65) 지식 그래프 툴바 한 줄·가로 스크롤 + 폼 높이 26px 정합
- 목적: 사전과 동일하게 컨트롤 행을 한 줄로 유지하고, 좁을 때는 줄바꿈 대신 가로 스크롤로 넘침 처리. 버튼·입력의 시각 높이를 26px로 통일
- 영향: `.kg-toolbar` / `.kg-toolbar-scroll` 도입, `.kg-btn` 높이·`inline-flex` 정렬, 구분선 `.kg-toolbar-divider` 26px

#### CSS 변경
- `src/components/KnowledgeGraphModal.css`
  - `.kg-toolbar`, `.kg-toolbar-scroll`, `.kg-toolbar-stats`, `.kg-toolbar-divider` 추가
  - `.kg-toolbar-scroll`에 `flex-wrap: nowrap`, `overflow-x: auto`, 자식 `flex-shrink: 0`
  - `.kg-btn`에 `height: 26px`, `display: inline-flex`, `padding: 0 12px`로 사전 필터와 동일 행 높이

#### JSX/JS 변경 (예외 기록)
- `src/components/KnowledgeMapView.jsx`
  - 툴바 래퍼를 `kg-toolbar` / `kg-toolbar-scroll`로 감쌈, 기존 `flexWrap: wrap` 제거
  - 노드 요약에 `kg-toolbar-stats`, 구분선에 `kg-toolbar-divider` 적용

### 67) 지식 그래프 가로 스크롤바 위치(툴바 하단 → 콘텐츠 영역 하단)
- 목적: `.kg-toolbar-scroll`에 `overflow-x: auto`를 두면 스크롤바가 툴바와 그래프 **사이**에 붙어 사전 탭(표 하단 스크롤)과 달라 거슬리는 문제
- 영향: `.kg-body-hscroll`이 툴바+허브·그래프 전체를 감싸 가로 스크롤만 담당, `.kg-toolbar-scroll`에서는 가로 오버플로 제거

#### CSS 변경
- `src/components/KnowledgeGraphModal.css`
  - `.kg-body-hscroll`, `.kg-body-inner` 추가
  - `.kg-toolbar-scroll`에서 `overflow-x`/`scrollbar-width` 제거

#### JSX/JS 변경 (예외 기록)
- `src/components/KnowledgeMapView.jsx`
  - 루트 하위에 `kg-body-hscroll` / `kg-body-inner` 래핑

### 66) 노트북 상세 탭별 LNB·좌우 패널 자동 정렬
- 목적: 채팅/지식그래프/사전 탭 전환 시 논의된 레이아웃 정책을 실제로 적용 (이전에는 논의만 되고 코드 미반영)
- 영향: **채팅** — LNB 접기 + 소스·스튜디오 **펼침** / **지식그래프·사전** — LNB 접기 + 좌우 **접음**. 노트북 상세 진입 시에도 LNB 접기 1회 시도

#### JSX/JS 변경 (예외 기록)
- `src/components/common/MainLayout.jsx`
  - `<Outlet context={mainOutletContext} />`로 `setLnbCollapsed` 하달 (`useMemo`로 참조 안정화)
- `src/components/NotebookDetail.jsx`
  - `useOutletContext`로 `setLnbCollapsed` 수신
  - `handleTabChange` 내 탭별 `setLeftSidebarOpen` / `setRightSidebarOpen` / `setLnbCollapsed(true)`
  - 마운트 시 `setLnbCollapsed?.(true)` 한 번 호출

## 2026-05-02

### 68) 지식 그래프·사전 검색 스타일 통일 및 툴바 보완
- 목적: 동일 노트북 상세 맥락에서 **지식 그래프**와 **사전**의 검색·툴바가 한 세트처럼 보이도록 정리. `DictionaryView.css`에 남아 있던 구형 `.kg-*` 중복이 번들 순서로 **14px·8px 16px**를 덮어쓰던 문제 제거
- 영향: KG 버튼·placeholder·경로찾기 아이콘·좌측 Hub/노드 요약·빈 그래프 영역·사전 검색창이 한 기준으로 맞춰짐

#### CSS 변경
- `src/components/KnowledgeGraphModal.css`
  - `.kg-btn` **12px** / `font-weight: 500`, `.kg-search-input::placeholder` **11px**·`#8a9099`
  - `.kg-btn-with-icon` / `.kg-btn-icon`(경로찾기) 간격·패딩
  - 툴바 좌측: `.kg-toolbar-stats`, `.kg-toolbar-hub-badge`, `.kg-toolbar-stats-muted`, `.kg-toolbar-stats-hint`, `.kg-depth-row`, `.kg-depth-label`(사전 `item-count-info` 톤 정렬)
  - 빈 데이터: `.kg-graph-layout-row`, `.kg-graph-pane`, `.kg-empty-graph*`(아이콘·문구 **flex 중앙**)
- `src/components/DictionaryView.css`
  - **삭제**: 공유 지식 그래프용 중복 `.kg-btn`·`.kg-search-controls`·`.kg-search-input`·`.kg-dropdown-menu` 블록(단일 소스는 `KnowledgeGraphModal.css`)
  - `.search-bar`: **돋보기/클리어 제거**에 맞춰 **220×26** 고정(지식 그래프 `.kg-search-input`과 동일 너비), `input`은 `flex:1; min-width:0`으로 **입력 시 가로 팽창 방지**, `:focus-within` 테두리

#### JSX/JS 변경 (예외 기록)
- `src/components/KnowledgeMapView.jsx`
  - 경로찾기: 이모지 → `lucide-react` `Link2` + `kg-btn-with-icon`
  - 툴바 통계/Depth 마크업을 위 클래스로 정리
  - 그래프 컨테이너: `ResizeObserver`+`useLayoutEffect`로 패널 크기 갱신, 빈 상태 마크업을 `.kg-empty-graph*`로 변경
- `src/components/DictionaryView.jsx`
  - 사전 검색: **Search 아이콘·X 클리어 버튼** 제거, `handleClearSearch` 제거

### 69) 노트북 상세 사전 탭 건수·셀렉트 표시 깨짐(폭 부족)
- 목적: 검색 입력을 **220px**로 넓힌 뒤에도 뷰헤더 최소 폭이 **740px**로 남아, 좌측(모드 탭+건수)과 우측(카테고리·정렬·검색)이 한 줄에서 압축되며 **건수(`1건`) 줄바꿈·셀렉트 라벨 깨짐** 발생
- 영향: 사전 영역 최소 가로를 **880px**로 상향, 건수는 `nowrap`+`flex-shrink:0`, 탭 그룹 축소 방지. 카테고리/정렬 `select` 최소 폭 **120px**. 아래 가로 스크롤로 전체 확인

#### CSS 변경
- `src/components/DictionaryView.css`
  - `.dictionary-view` `min-width: 880px`
  - `.view-header` `flex-wrap: nowrap`
  - `.tab-group` `flex-shrink: 0`(기존 `min-width:0`·가변 축소 제거)
  - `.item-count-info` `white-space: nowrap`, `flex-shrink: 0`
  - `.category-filter-inline select` `112px` → `120px`
- `src/components/NotebookDetail.css`
  - `.panel-center.is-dictionary > .tab-content > .dictionary-view` `min-width: 880px`(주석 동일 반영)

### 70) 사전 카테고리 select에 행 카테고리 병합(API 빈 목록·캐시 불일치)
- 목적: `/dictionary/categories`가 빈 배열이거나, 캐시에 `categories`만 `['All']`로 저장된 경우에도 **현재 페이지 데이터에 있는 `category`**(예: 뷰티:제품)가 드롭다운에 나타나도록 보강
- 영향: 레이아웃(CSS) 변경과 무관한 **데이터 병합 로직**만 추가

#### JSX/JS 변경 (예외 기록)
- `src/components/DictionaryView.jsx`
  - `mergeDictionaryCategories` 헬퍼
  - `fetchData` 성공 시 `categoriesRef` + `result.content`로 병합 후 `setCategories` 및 `onDataLoaded` 캐시에 동일 목록 저장
  - 캐시 히트 시 `cachedData.categories`와 `cachedData.data` 병합
  - `fetchCategories`: API가 **빈 배열**이면 기존 `categories`를 덮어쓰지 않음(오류 시에도 동일)

### 71) 사전 개념/관계/액션 탭별 카테고리 드롭다운 분리
- 목적: **한 탭에서 쓰인 카테고리 옵션이 다른 탭에서도 남는 문제** — `fetchCategories` 빈 응답 시 `prev` 유지(이전 70) + `fetchData`가 `categoriesRef`를 병합하며 **다른 모드의 목록이 ref에 남음**
- 영향: `handleTabChange`에서 `setCategories(['All'])` 및 `categoryOptionsFromApiRef` 리셋, 병합 기준을 **현재 탭의 API 목록 ref + 현재 `result.content`만** 사용. `getCategories` 빈 배열이면 `setState`로 `fetchData` 결과를 덮어쓰지 않음

#### JSX/JS 변경 (예외 기록)
- `src/components/DictionaryView.jsx`
  - `categoryOptionsFromApiRef` 도입, 탭 전환·캐시·`fetchCategories`·`fetchData`와 동기화

### 72) 사전 빈 화면을 지식 그래프 빈 상태와 동일 톤으로 정렬
- 목적: 데이터 없음·검색 무결과 문구를 **테이블 본문 영역 세로·가로 중앙**에 두고, 지식 그래프 `kg-empty-graph*`와 같은 글자 크기·색·여백 적용
- 영향: `lucide-react` **BookOpen** 아이콘(회색 톤), `.dict-empty-*` 클래스

#### CSS 변경
- `src/components/DictionaryView.css`
  - `.data-table` / `.term-list`에 `min-height: 0`, 빈 상태 오버레이용 `.term-list` `position: relative`
  - `.dict-empty-state`, `.dict-empty-inner`, `.dict-empty-icon`, `.dict-empty-title`, `.dict-empty-desc` 추가

#### JSX/JS 변경 (예외 기록)
- `src/components/DictionaryView.jsx`
  - 빈 상태 마크업을 위 클래스로 교체, `BookOpen` import

### 73) 노트북 상세 채팅 탭 빈 화면 안내 세로 중앙
- 목적: 대화가 없을 때 **무엇이든 질문해보세요** 블록이 상단에 몰리지 않고, 페르소나 영역·입력창 **사이**에 세로 중앙 정렬. 사전/지식 그래프 빈 화면과 타이포·아이콘 톤 정렬
- 영향: `.chat-messages`에 `min-height: 0`·flex 컬럼, `.chat-empty-state`가 `flex:1`로 남는 높이 채움

#### CSS 변경
- `src/components/NotebookDetail.css`
  - `.chat-messages`, `.chat-empty-state`, `.chat-empty-inner`, `.chat-empty-icon`, `.chat-empty-title`, `.chat-empty-desc`, `.chat-empty-hint`

#### JSX/JS 변경 (예외 기록)
- `src/components/NotebookDetail.jsx`
  - 채팅 빈 상태 인라인 스타일 제거 → 위 클래스 + `MessageSquare` 48px

### 74) 채팅 입력 줄 비활성 회색 처리 + 폼 비활성 CSS 변수
- 목적: 문서 미선택·처리 중일 때 하단 입력 영역을 **회색 톤**으로 통일. 프로젝트 전반에 재사용 가능한 **비활성 색 토큰** 정의
- 영향: `index.css` `--form-control-disabled-*`, `--btn-disabled-*` — Notebook 채팅만 우선 적용, 다른 폼은 점진적으로 `var()` 참조 가능

#### CSS 변경
- `src/index.css`
  - `:root`에 폼/버튼 비활성용 변수 추가
- `src/components/NotebookDetail.css`
  - `.message-input-area.is-disabled`, `.message-input-textarea:disabled`/`.is-disabled`, placeholder, `.message-send-btn:disabled`(불투명 회색 버튼)

#### JSX/JS 변경 (예외 기록)
- `src/components/NotebookDetail.jsx`
  - `message-input-area`에 문서 없음 또는 `isProcessing` 시 `is-disabled` 클래스

### 75) CSS 디자인 토큰 기준 문서 추가
- 목적: `index.css` `:root` 변수의 **네이밍·사용 원칙·비활성 토큰 표**를 문서화해 팀 공유 및 이후 `var()` 확대 시 기준으로 사용
- 영향: 코드 동작 변경 없음

#### 문서 변경
- `docs/css-design-tokens.md` 신규
- `docs/layout-guideline.md`에 섹션 8(토큰 문서 링크) 추가

### 76) UI 체계 정리용 작업 가이드 목차 (`ui-system-outline.md`)
- 목적: 레이아웃→토큰→폼상태→모달→버튼→MUI경계 순으로 정리할 때 **한 파일에서 목차·표 템플릿**을 보게 함
- 영향: 코드 변경 없음

#### 문서 변경
- `docs/ui-system-outline.md` 신규 (체크리스트·폼 매트릭스 표·연관 문서 링크)

### 77) 페르소나 pill 활성 + hover 시 글자색 사라짐 수정 및 토큰
- 목적: `.persona-selector-btn:hover`의 링크색이 `.active`보다 뒤에서 적용되어 **활성+호버 시 글자=배경색**으로 보이던 문제 수정
- 영향: 동일 패턴의 다른 UI는 `--control-pill-*` 토큰과 `.active:hover` 규칙을 참고해 확장 가능

#### CSS 변경
- `src/index.css`
  - `--control-pill-active-bg`, `--control-pill-active-text`, `--control-pill-active-hover-bg` 추가
- `src/components/NotebookDetail.css`
  - `.persona-selector-btn.active:hover:not(:disabled)` 추가, `.active`/일반 `:hover`가 위 토큰 사용

#### 문서 변경
- `docs/css-design-tokens.md` — 채우기형 토글·`:hover` 충돌 주의 한 절 추가

---

## 되돌림·실험 참고 번호 (노트북 가운데 탭줄, 2026-05-02)

아래 번호는 **동일 주제에 대한 시도 순서**를 적어 두었습니다. 되돌려 달라고 할 때 **「NB-TAB-A 상태로」**처럼 지칭할 수 있습니다.  
**(탭줄: 초기 원복은 NB-TAB-RESTORE; 현재 적용은 NB-TAB-E / ### 79.)**

| 번호 | 내용 |
|------|------|
| **NB-TAB-A** | 좌측(채팅·그래프·사전)과 우측(온톨로지) 사이 **`gap: 0`** — 세로선까지 배경 맞춤 |
| **NB-TAB-B** | 우측 온톨로지 버튼 **`flex: 1`** 로 넓은 화면에서 우측 영역 확장 → 사용자 피드백으로 의도와 다름 |
| **NB-TAB-B2** | NB-TAB-B 롤백 후 **`flex: 0 0 auto`** 유지, **`gap: 0`** 유지 |
| **NB-TAB-C** | 탭 소실 방지 **`min-width: 200px`** + **`overflow-x: auto`** → 탭 행에 **가로 스크롤바** 노출 |
| **NB-TAB-D** | **`overflow-x: hidden`**, **`flex: 1 1 0%`**, **`overflow: hidden`** on `.tabs-primary` 등으로 스크롤 제거·폭 분배 재조정 |
| **NB-TAB-RESTORE** | **탭 크기·간격 관련 수정 전으로 복원**: `.tabs-header` **`gap: 8px`** (뷰포트 좁을 때 **`6px`**), `.tabs-primary` **`flex: 1; min-width: 0`**, `.tab-btn`에서 **`width: 100%` 제거**, 탭행 **`flex-shrink`/`overflow` 실험 제거**, `.tab-btn-exp`에 **`display:flex` 보조 제거** (원래 스타일) |
| **NB-TAB-E** | `gap:0`, 좌측 `minmax(0,1fr)`, 온톨로지 **`notebook-center` ≥700px** 일 때만 **`min-width:140px`** (그 미만은 내용 폭) → **### 79** |

### 78) 가운데 패널 탭줄 CSS 기준 복원 (NB-TAB-RESTORE)

- 목적: 위 실험(NB-TAB-A~D)으로 바뀐 **NotebookDetail 탭 행**을 **레이아웃 실험 이전** 동작·스타일로 되돌림  
- 영향: 채팅/지식 그래프/사전과 온톨로지 관리 사이에 다시 **`gap`** 이 보일 수 있음(원래 상태)

#### CSS 변경
- `src/components/NotebookDetail.css`
  - `.tabs-header`, `.tabs-primary`, `.tab-btn`, `.tab-btn-exp`, `@media (max-width: 1180px)` 내 탭 관련 규칙을 NB-TAB-RESTORE 기준으로 교체

#### JSX/JS 변경 (예외 기록)
- 없음

#### 히스토리 작성 원칙 (참고)
- **현행 갱신:** `.cursor/rules/ui-history-on-request.mdc` — **사용자가 명시적으로 요청할 때만** `docs/ui-history.md`에 항목을 추가한다.
- **형식:** 요청으로 기록할 때는 항목 번호(`### N)`)를 이어 가고, 필요 시 표(NB- 접두 반복 가능)를 쓴다.
- **되돌림:** 요청 시 **항목 번호 또는 표 번호**로 지정할 수 있도록 위 형식을 유지한다.

### 79) 가운데 패널 탭줄: 세로선까지 맞춤 + 탭 최소 폭 + 좁은 패널 시 온톨로지 폭

- 목적: 좌측 탭 호버·활성 배경이 **온톨로지 구분 세로선까지** 끊기지 않도록 **`gap` 제거**  
- 좌측 3탭: **`minmax(0, 1fr)`** 열 최소폭 없음. 온톨로지: 기본 **`min-width: 0`**, 가운데 패널이 **충분히 넓을 때만** (`@container notebook-center` **`min-width: 700px`**) **`min-width: 140px`**.

#### CSS 변경
- `src/components/NotebookDetail.css`
  - `.tabs-header` `gap: 0` (뷰포트 1180 이하에서도 `0`)
  - `.tabs-primary.is-admin` / `.is-user` — `repeat(n, minmax(0, 1fr))`
  - `.tabs-primary .tab-btn { width: 100% }`
  - `.tab-btn-exp` 기본 `min-width: 0`; `@container notebook-center (min-width: 700px)` 에서 `min-width: 140px`

#### JSX/JS 변경 (예외 기록)
- 없음

### 80) 노트북 좌측 소스 목록·문서 행 — 확정 규칙

- **연회색**: `source-list` / `source-list-section`에는 배경 **없음** → **`.document-source-item`만** `background: var(--color-bg-primary)`.
- **구조**: `모두 선택`·동기화 줄 + `source-list`는 `source-list-section`으로 묶되, **툴줄은 패널 흰 배경** 위, 회색은 **문서 행에만**.
- **전체를 감싸는** 둥근 회색 박스·**목록 전용** 큰 회색 strip **사용하지 않음**.
- **아이템 간격**: 행 `margin-bottom: 4px`(마지막 행 0).
- **스크롤**: 좌측은 **`panel-body` 한 번만** 세로 스크롤(목록만 고정 높이 스크롤 영역으로 두지 않음).
- **메뉴 트리거**: **24×24**, 세로 점 아이콘 **16×16**; 행은 **`align-items: flex-start`** 유지, 트리거만 체크박스( **13px** ) 높이에 맞춰 **`margin-top: calc((var(--document-checkbox-size) - var(--document-menu-trigger-size)) / 2)`**.
- **호버**: `.document-source-item` 기존(연한 accent·테두리·그림자) 유지.

#### CSS / JSX (참고 경로)
- `src/components/NotebookDetail.css`, `NotebookDetail.jsx` — `source-list-section`
- `src/components/DocumentSourceItem.css`, `DocumentSourceItem.jsx`

### 81) 노트북 좌측 UI 마무리(2026-05-02 작업분) + 향후 팝업

- **메뉴(⋯)**: `NotebookDetail.css`에서만 `.panel-left .document-source-item .document-menu` — `align-self: center`, `margin-right: -10px`(행 우측 맞춤, `DocumentSourceItem` 본문은 유지).
- **포커스**: 좌측·행 체크/동기/패널 토글 등 `outline` 2px → 이후 **소스 검색(`.source-search-input`)** 은 **아웃라인 제거**, 기본 `1px solid transparent` + 포커스 시 **`1px` 프라이머리·흰 배경** → 크기 변화 없음. 행 **체크·menu-trigger**는 `DocumentSourceItem.css`에 `:focus-visible` 링(프라이머리) 유지.
- **소스 검색창**: 회색 무테 기본, 포커스만 테두리·흰 배경, `border-radius: 4px`, 패딩 축소, 아이콘 `left` 보정.
- **placeholder 통일**: 사전·KG 모달과 동일 — **본문 12px**, **placeholder 11px·`#8a9099`** (`source-search`, 뷰어 `.search-input`, 채팅 textarea, 페르소나/메타 textarea 등 `NotebookDetail.css` 일괄).

#### CSS 변경 (요약)
- `src/components/NotebookDetail.css` — 위 전부
- `src/components/DocumentSourceItem.css` — 체크·`menu-trigger` 포커스, 메뉴 트리거 크기(이전 ### 80과 연계)

#### 다음 예정(참고)
- **팝업 전체 분석** 후 **공통 설정**(토큰·레이어·포커스 트랩·패딩 등) 일괄 적용 예정 — 구현 시 **`### 83)`** 등으로 이어서 기록.

### 82) 좌측 문서 뷰어: 스크롤을 `viewer-content`에만

- **원인**: `.panel-body`에 `overflow-y: auto`가 있어 **제목·탭·검색·페이지네이션**까지 전부 스크롤됨. **`source-list-section--viewer` 래퍼 자체는 결함이 아님** — dev와 DOM이 달라도, 스크롤이 풀린 직접 이유는 **바깥 컨테이너가 내용 높이만큼 늘어나며 스크롤**한 것.
- **조치**: `viewer-active`일 때 `.panel-body`는 **`overflow: hidden`** + **flex column·`min-height: 0`**. `source-list-section--viewer` → `.source-list.viewer-mode` → `.document-viewer-panel`까지 **`flex: 1` / `min-height: 0` / `overflow: hidden`** 체인. **`.viewer-content`만** `overflow-y: auto` + **`min-height: 0`**(flex 자식 스크롤 필수).
- **파일**: `src/components/NotebookDetail.css` (JSX 변경 없음)

## 2026-05-04

### 83) 워크스페이스(Home) 목록 레이아웃·인라인 제거

- **목적**: 콘텐츠 타이틀~카드 영역 간격·카드 그리드 간격·그리드 more(⋯) 위치를 UI 기준에 맞추고, `Home.jsx`의 인라인 스타일을 CSS 클래스로 이전
- **영향**: 상단 타이틀↔그리드 간 `16px` 톤(`--spacing-md`), 그리드 `gap` 토큰 사용, 홈·프롬프트 모달 관련 스타일은 `Home.css`로 응집

#### CSS 변경
- `src/App.css` — `.home-page-header` / `.notebooks-container` 그리드 간격·more 버튼 정렬(그리드 전용 음수 마진), `.more-btn` 호버(원형 배경 제거·액센트 색)
- `src/pages/Home.css` — 로딩/에러/삭제 오버레이/공유 배지/프롬프트 변경 모달 블록

#### JSX/JS 변경
- `src/pages/Home.jsx` — `import './Home.css'`, 위 영역 `className` 전환, 프롬프트 모달 정적 인라인 제거, `기본값 초기화`에 `aggregationStrategyPrompt` 복원 포함

### 84) 전역 콘텐츠 타이틀~본문 여백 16px 통일 (`PageHeader` + 노트북 상세)

- **목적**: 워크스페이스만이 아니라 `PageHeader`를 쓰는 화면·노트북 상세 `.notebook-page-header`까지 **타이틀 아래 16px**을 동일 기준으로 맞춤
- **영향**: 도메인 선택·고객센터·어드민(도메인 관리 등)·노트북 상세가 동일 리듬으로 본문과 이어짐

#### CSS 변경
- `src/components/common/PageHeader.css` — `.page-header` `margin-bottom: var(--spacing-md)` (반응형에서도 동일 토큰)
- `src/components/NotebookDetail.css` — `.notebook-page-header` `margin-bottom: var(--spacing-md)`
- `src/App.css` — `.home-page-header .page-header`에서 하단 여백 중복 제거(전역 `PageHeader`에 일원화), `margin-top: 0`만 유지

### 85) `page-header` 클래스 전역 충돌 제거(노트북 문서·문서 뷰어)

- **원인**: `NotebookDetail.css`의 **전역** `.page-header { margin-bottom: 12px; … }`가 청크 로딩 후 번들에 남으면, `PageHeader`의 `.page-header`를 덮어써 **도메인 관리** 등에서 `12px`가 `var(--spacing-md)`를 이김
- **1차**: 문서/청크 목록 스타일을 `.notebook-layout .viewer-content`로 스코프
- **2차(확정)**: 공용 이름 제거 — 노트북 좌측 청크·페이지 행을 `nb-doc-section` / `nb-doc-block-head` / `nb-doc-block-body` 등 **전용 클래스**로 재명명, `DocumentViewer`는 `dv-doc-section` / `dv-doc-head` / `dv-doc-body` / `dv-doc-page-num` / `dv-doc-word-count`로 분리, `.document-viewer` 루트로 스타일 스코프

#### CSS / JSX
- `src/components/NotebookDetail.css`, `NotebookDetail.jsx` — `nb-doc-*`
- `src/components/DocumentViewer.css`, `DocumentViewer.jsx` — `dv-doc-*` + 내부 `.viewer-content` 반응형도 `.document-viewer` 하위로 한정

### 86) 간격·타이포 토큰 정리(홈·헤더·앱 팝업) + AI 규칙

- **목적**: UI/UX 정리 시 **숫자로만 지시해도** `src/index.css`에 대응 변수가 있으면 `var(--spacing-*)`, `var(--radius-*)`, `var(--font-size-*)` 등을 사용
- **영향**: `Home.css` / `PageHeader.css` / `App.css` 일부 리터럴을 토큰으로 치환(예: `gap`·패딩·폰트·아이콘 박스 `32px`→`--spacing-xl`, `translateY(-8px)`→`calc(-1 * var(--spacing-sm))` 등). **12px 전용 spacing 변수 없음**은 규칙 문서에 명시

#### 규칙·문서
- `.cursor/rules/ui-ux-design-tokens.mdc` — `alwaysApply: true`, `**/*.{css,scss,module.scss}`에 spacing/radius/typography 매핑 표

#### CSS 변경 (요약)
- `src/pages/Home.css`, `src/components/common/PageHeader.css`, `src/App.css` — 토큰 치환

### 87) 워크스페이스 그리드 `gap` 하드코딩 제거

- **목적**: `.notebooks-container`의 `gap`을 리터럴 `16px`가 아닌 **`var(--spacing-md)`** 로 유지(값은 동일, 토큰 단일 소스)
- **영향**: `App.css` 한 줄; 향후 `--spacing-md` 정의만 바꾸면 카드 간격 일괄 조정 가능

### 88) 워크스페이스 `.more-btn` 호버 복원 — `.menu-trigger`(노트북 소스 행)와 분리

- **목적**: 카드/리스트의 `more-btn`(⋮)은 **이전 톤**으로 — 호버 시 `rgba(0,0,0,0.05)` 배경 + `var(--color-text-primary)`. 노트북 상세 문서 목록의 `.menu-trigger`는 **현행 유지**(배경 투명·액센트 글자색만)
- **영향**: `src/App.css`의 `.more-btn` / `.more-btn:hover`만 조정. `src/components/DocumentSourceItem.css`의 `.menu-trigger`는 변경 없음

### 89) 워크스페이스 그리드 카드 `more-btn` 우측 정렬 보강

- **목적**: 그리드 카드에서 ⋮ 버튼이 우측 여백만큼 더 안쪽으로 보이던 간격을 줄여, 카드 패딩 기준으로 우측에 더 붙임
- **영향**: `.notebooks-container.grid .more-btn-container`의 `margin-right`를 `-10px` → **`calc(-1 * var(--spacing-md))` (-16px)** 로 조정. 리스트 뷰·`menu-trigger`는 변경 없음

### 90) 워크스페이스 `popup-menu` 하단 가림 시 위쪽으로 열기

- **목적**: 스크롤로 리스트 하단에 있는 카드에서 ⋮ 메뉴가 `main-content` 아래로 잘리지 않도록, 트리거 아래 공간이 부족하면 메뉴를 **버튼 위**에 붙임
- **영향**: `Home.jsx` — `useLayoutEffect`로 `.main-content`의 가시 하단·트리거 기준으로 여유 공간 계산, `popup-menu--open-up` 클래스. `App.css` — `top:100%` 대신 `bottom:100%` + `popupFadeInUp` 애니메이션. 그리드·리스트 공통

### 91) 워크스페이스 그리드 카드 ⋮ 메뉴가 카드 박스에 잘리지 않게

- **원인**: `.notebook-card`에 `overflow: hidden`(호버·높이 톤)이 있어, 그리드 뷰에서 `position:absolute`인 `.popup-menu`가 카드 경계로 클리핑됨
- **해결**: `openMenuId === notebook.id`일 때 카드에 `notebook-card--menu-open` — 해당 상태에서만 `overflow: visible` + `z-index: 5`로 이웃 카드 위에 겹쳐 표시. 리스트 뷰는 기존에 `.notebooks-container.list .notebook-card { overflow: visible }`로 동일 목적이 이미 충족
- **영향**: `Home.jsx` — 워크스페이스 카드 `className`에 조건부 클래스. `App.css` — `.notebook-card.notebook-card--menu-open`

## 2026-05-02

### 92) 워크스페이스 ⋮(more) 메뉴 항목 순서 변경

- **목적**: 편집·설정 항목을 먼저 두고, 위험한 **삭제**를 맨 아래로 내려 실수 클릭을 줄임. 관리자 전용 항목의 읽기 순서를 **프롬프트 → 공유**로 정리
- **순서(관리자·Owner)**: 제목 수정 → 프롬프트 변경 → 공유 설정 → 삭제. **비관리자 Owner**는 기존과 같이 제목 수정·삭제만(중간 항목 없음)
- **영향**: `src/pages/Home.jsx` — 그리드·리스트 뷰 `popup-menu` 내부 버튼 JSX 순서 동일 반영

### 93) UI 히스토리 필수 기록 — Cursor 규칙(`ui-history-always`) 보강

- **목적**: 별도로 “히스토리에 적어줘”라고 하지 않아도, UI·화면 관련 변경 후 **`docs/ui-history.md` 갱신을 작업의 일부로 고정**해 나중에 검색·확인 가능하게 함
- **영향**: `.cursor/rules/ui-history-always.mdc` — 무조건 수행·같은 세션 내 완료·검색 목적 명시
- **(정책 변경 2026-05-12)** 위 “필수·자동 기록”은 **폐지**됨. 현행은 `.cursor/rules/ui-history-on-request.mdc`(요청 시에만 갱신). 파일 상단 **갱신 정책(현행)** 블록과 동일.

### 94) 워크스페이스 그리드 카드 - 공유 배지 디자인 경량화 + 배지·more-btn 우측 그룹

- **목적**: 공유 배지가 버튼처럼 주목도가 높아 카드 내 정보 위계를 흐리던 문제를 해소. 배지를 조용한 레이블 톤으로 낮추고, more-btn과 한 그룹으로 묶어 카드 우상단에 정렬
- **변경 내용**
  - 그림자 제거 (box-shadow 삭제)
  - border-radius: var(--radius-lg) -> 2px
  - 그라디언트 배경 -> 단색(#1a73e8 / #059669)
  - 패딩·gap·font-weight 소폭 축소(조용한 레이블 톤)
  - card-header-right 래퍼 신설 - 배지 + .more-btn-container를 flex 행으로 묶어 margin-left: auto로 우측 정렬
  - card-header에서 justify-content: space-between 제거 (right 그룹이 스스로 우측 정렬)
  - 그리드 .more-btn-container에서 불필요해진 margin-top 음수값 제거
- **영향 파일**
  - src/pages/Home.jsx - .card-header-right 래퍼로 배지·more-btn 감싸기
  - src/pages/Home.css - .card-header-right, .notebook-share-badge 스타일
  - src/App.css - .card-header / 그리드 .more-btn-container 조정

## 2026-05-04

### 95) 노트북 상세 제목 인라인 편집 input 공통 스타일 맞춤

- **원인**: `.notebook-panel-title-input`의 `border`가 기본 상태부터 `#1a73e8`(액센트 파랑)로 고정되어, 포커스 전부터 파란 테두리가 표시되고 `:focus-visible`의 outline이 이중으로 올라오는 문제
- **기준**: 프로젝트 공통 input 톤 - 기본 `--color-border`(회색) / 포커스 `--color-accent`(파랑) / `outline: none`
- **변경 내용**
  - `border`: `1px solid #1a73e8` → `1px solid var(--color-border)`
  - `border-radius`: 리터럴 `4px` → `var(--radius-sm)`
  - `background-color: var(--color-bg-secondary)`, `color: var(--color-text-primary)` 명시
  - `transition: border-color var(--transition-fast)` 추가
  - `:focus-visible` outline 이중 효과 제거 → `:focus { border-color: var(--color-accent) }` 로 통일
- **영향**: `src/components/NotebookDetail.css` — `.notebook-panel-title-input` / `:focus`

### 96) 노트북 상세 제목 input - 언더라인 스타일 + 클릭 시 텍스트 흔들림 제거

- **원인**: input의 font-size(15px)/font-weight(600)가 표시 span(16px/700)과 달랐고, padding:2px 6px와 border가 레이아웃 공간을 추가로 차지해 클릭 순간 글자가 밀려 보임
- **변경 내용**
  - font-size/weight: 표시 상태와 완전 일치 (16px / 700)
  - border: 전체 테두리 제거, border-bottom만 유지(기본: --color-border / 포커스: --color-accent)
  - border-radius: 0 (언더라인 스타일에 불필요)
  - padding/margin: 0 (좌우 공간 제거로 텍스트 위치 고정)
  - background: transparent (표시 상태와 배경 동일)
- **영향**: src/components/NotebookDetail.css - .notebook-panel-title-input / :focus

### 97) 노트북 상세 패널 제목 아이콘-텍스트 간격 축소

- **목적**: 말머리 아이콘과 제목 텍스트 사이 간격이 넓어 보여 조밀하게 조정
- **변경**: `.panel-title` gap `8px` → `var(--spacing-xs)` (4px)
- **영향**: `src/components/NotebookDetail.css` — `.panel-title`

### 98) 노트북 상세 패널 헤더 - 제목 영역과 토글 버튼 사이 최소 간격 추가

- **목적**: 제목 input이 flex:1로 늘어나 토글 버튼에 바짝 붙어 보이는 문제 해소
- **변경**: `.panel-toggle-btn`에 `margin-left: var(--spacing-xs)` (4px) + `flex-shrink: 0` 추가
- **영향**: `src/components/NotebookDetail.css` — `.panel-toggle-btn`

### 99) 노트북 상세 좌측 소스 패널 - 문서 없을 때 컨트롤 비활성 처리

- **목적**: 등록된 문서가 없을 때 검색·모두선택·동기화가 활성 상태로 보여 혼란을 주던 문제 해소. 소스가 없으면 해당 컨트롤은 비활성(disabled) 처리
- **기준 토큰**: index.css에 정의된 --form-control-disabled-*, --btn-disabled-* 토큰 활용
- **변경 내용**
  - 검색 input: disabled={documents.length === 0} + :disabled CSS (배경·텍스트·placeholder 비활성 톤)
  - 모두 선택 label/checkbox: disabled 속성 + is-disabled 클래스 (cursor: not-allowed, 텍스트 회색)
  - 동기화 버튼: disabled 조건에 documents.length === 0 추가 + is-disabled 클래스
  - 동기화 텍스트: is-disabled 클래스 (텍스트 회색)
- **영향 파일**
  - src/components/NotebookDetail.jsx - 세 컨트롤에 disabled 조건/클래스 추가
  - src/components/NotebookDetail.css - :disabled / .is-disabled 비활성 스타일 추가

### 100) 워크스페이스 카드 제목 1줄 말줄임 처리

- **목적**: 제목이 길 경우 카드 내에서 2줄로 넘치던 것을 1줄로 제한하고 말줄임(...) 처리
- **변경**: `.notebook-title` — `-webkit-line-clamp: 2` 방식 제거, `white-space: nowrap` + `overflow: hidden` + `text-overflow: ellipsis` 1줄 말줄임으로 전환
- **영향**: `src/App.css` — `.notebook-title`

## 2026-05-08

### 101) 공통 모달 1차 인프라 및 인수인계 문서 초안

- **목적**: 제각각 구성된 팝업/다이얼로그를 공통 규격으로 정리하기 위한 1차 기반(`BaseModal`, `DialogProvider/useDialog`)과 인수인계 문서 확립
- **영향**: 공통 모달 컴포넌트 및 전역 다이얼로그 API가 준비되어, 이후 팝업을 단계적으로 통일 가능

#### CSS 변경
- `src/components/common/modal/BaseModal.module.scss` (신규)
  - 공통 모달 `Dialog`의 헤더/본문/푸터 간격, 라운드, 타이포를 토큰 기반으로 정의
- `src/context/DialogContext.module.scss` (신규)
  - 전역 다이얼로그 본문 문구/입력 스타일의 폰트 및 간격 기준 정의

#### JSX/JS 변경 (예외 기록)
- `src/components/common/modal/BaseModal.jsx` (신규)
  - MUI `Dialog` 기반 공통 모달 컴포넌트 추가
  - `disableBackdropClose`, `disableEscapeKeyDown`, `actions` 등 공통 옵션 제공
- `src/context/DialogContext.jsx` (신규)
  - 전역 `alert`, `confirm`, `prompt` Promise API 제공
  - prompt 검증(`validator`) 및 danger tone 지원
- `src/hooks/useDialog.js` (신규)
  - `useDialog` 훅 export 추가
- `src/main.jsx`
  - 앱 루트에 `DialogProvider` 연결

#### 문서 변경
- `docs/modal-architecture.md` (신규)
  - 1차 아키텍처, 구성 요소, 설계 원칙 정의
- `docs/modal-spec.md` (신규)
  - 모달 규격 초안 및 1차 전환 대상 정리
- `docs/modal-migration-plan.md` (신규)
  - 단계별 전환 계획, 리스크, 인수인계 체크리스트 정리

### 102) Home 워크스페이스 이름 변경/삭제 다이얼로그 공통화 1차

- **목적**: 워크스페이스 카드 메뉴의 핵심 액션(이름 변경, 삭제 확인)을 신규 공통 모달 인프라(`BaseModal`, `useDialog`)로 먼저 이관
- **영향**: 이름 변경은 커스텀 오버레이에서 `BaseModal` 기반으로 전환, 삭제 확인은 전역 `confirm` 다이얼로그로 통일

#### CSS 변경
- `src/pages/Home.css`
  - 이름 변경 모달 전용 클래스(`.home-rename-modal-body`, `.home-rename-modal-icon`) 추가
  - 아이콘 크기/간격/타이포를 토큰(`--spacing-*`, `--font-*`) 기반으로 구성

#### JSX/JS 변경 (예외 기록)
- `src/pages/Home.jsx`
  - `useDialog`(`confirm`, `alert`) 및 `BaseModal` 도입
  - `handleDelete`를 `showConfirm` → `confirm({ tone: 'danger' })`로 전환
  - 삭제 실패 안내를 공통 `alert`로 전환
  - 이름 변경 UI를 기존 `.modal-overlay/.modal-content` 마크업에서 `BaseModal + TextField + MUI Button` 구조로 교체
  - 이름 검증/실패 메시지를 공통 `alert` 흐름으로 전환

### 103) BaseModal 정렬 옵션 추가 + Home 프롬프트 변경 모달 공통화

- **목적**: 모달별로 달랐던 헤더/푸터 정렬을 공통 컴포넌트 옵션으로 통일하고, Home의 `프롬프트 변경` 모달도 `BaseModal` 패턴으로 이관
- **영향**: 제목은 좌측, 닫기 버튼은 우측으로 일관화되고, 하단 버튼 정렬은 `actionsAlign`으로 화면별 선택 가능

#### CSS 변경
- `src/components/common/modal/BaseModal.module.scss`
  - 푸터 정렬 변형 클래스(`.actionsLeft`, `.actionsCenter`, `.actionsRight`) 추가
- `src/pages/Home.css`
  - 프롬프트 모달용 `BaseModal` 연동 클래스(`.home-prompt-modal-content`, `.home-prompt-modal-shell`, `.home-prompt-modal-actions`) 추가

#### JSX/JS 변경 (예외 기록)
- `src/components/common/modal/BaseModal.jsx`
  - `actionsAlign` prop 추가(`left`/`center`/`right`, 기본 `right`)
  - `DialogActions` 정렬 클래스를 옵션 기반으로 바인딩
- `src/pages/Home.jsx`
  - 프롬프트 변경 모달을 기존 커스텀 오버레이 구조에서 `BaseModal` 구조로 전환
  - 푸터 버튼을 `MUI Button` 기반으로 통일(취소/기본값 초기화/저장)
  - 기본값 초기화 로직을 `handleResetPromptToDefault` 함수로 분리

#### 문서 변경
- `docs/modal-spec.md`
  - 헤더 정렬 규칙(제목 좌측, 닫기 우측) 추가
  - `actionsAlign` 옵션 표준 추가
- `docs/modal-architecture.md`
  - `BaseModal` 기능 및 props에 정렬 옵션 설명 보강

### 104) 프롬프트 변경 모달 샘플 디자인 1안(컨펌용) 적용

- **목적**: 전체 전환 전 샘플 1개(`프롬프트 변경`)에서 레이아웃/정렬 규칙을 먼저 확정해 중복 수정 방지
- **영향**: 헤더는 `제목 좌측 + X 우측`, 푸터 버튼은 `우측 정렬` 기준으로 시각 톤을 정돈하고 입력 필드 그룹화 적용

#### CSS 변경
- `src/pages/Home.css`
  - `home-prompt-modal-content` 배경을 공통 라이트 톤으로 정리
  - `home-prompt-modal-intro`를 좌측 정렬로 변경
  - `home-prompt-field`를 박스 그룹(테두리/라운드/패딩)으로 변경
  - 힌트/푸터 노트 색상 및 경계선(`dashed`) 정리
  - NONE 버튼/필드의 보더·라운드·텍스트 톤을 토큰 기준으로 조정

#### JSX/JS 변경 (예외 기록)
- `src/pages/Home.jsx`
  - `BaseModal`의 `actionsAlign`을 `center` → `right`로 변경해 샘플 기준 정렬 확정

#### 문서 변경
- `docs/modal-spec.md`
  - Footer 정렬 규칙을 `기본 우측, 예외만 가운데`로 명시 강화

### 105) 프롬프트 변경 샘플 2차 보정(버튼 그룹/라인 제거/가로 활용)

- **목적**: 샘플 모달에서 실제 피드백(버튼 그룹 분리, 파란 버튼 확장, 라인 제거, 본문 가로 활용)을 즉시 반영해 최종 공통 규격 후보로 고정
- **영향**: `기본값 초기화`는 좌측, `취소/저장`은 우측으로 분리되고, 저장 버튼은 모달 내 최소 폭 150px을 확보

#### CSS 변경
- `src/components/common/modal/BaseModal.module.scss`
  - 공통 본문 상/하 경계선 제거
  - 공통 `contained` 버튼 최소 폭 `150px` 적용
- `src/pages/Home.css`
  - 프롬프트 모달 푸터 경계선 제거
  - 액션 영역을 좌/우 그룹(`home-prompt-modal-action-*`)으로 재구성
  - 콘텐츠 내부 패딩/그리드 폭(`minmax(0, 1fr)`) 조정으로 가로 활용 개선
  - 인트로/푸터 노트의 좌우 여백 및 경계선 제거

#### JSX/JS 변경 (예외 기록)
- `src/components/common/modal/BaseModal.jsx`
  - `DialogContent dividers` 제거로 타이틀/푸터 라인 없는 레이아웃 기본화
- `src/pages/Home.jsx`
  - 프롬프트 모달 액션 JSX를 좌/우 그룹 구조로 변경
  - `actionsAlign`을 `left`로 두고 내부 `space-between` 레이아웃 적용

#### 문서 변경
- `docs/modal-spec.md`
  - 버튼 그룹 규칙(좌측 단독 액션 / 우측 주 흐름 액션) 추가
  - contained 버튼 최소 폭(150px) 규칙 추가

### 106) 프롬프트 모달 푸터 상단 여백 보정(라인 제거 유지)

- **목적**: 푸터 구분선을 제거한 상태에서도 버튼 상단 여백이 하단 여백과 균형을 이루도록 시각 리듬 보정
- **영향**: 버튼 줄이 콘텐츠에 붙어 보이지 않고, 상하 여백 균형이 맞는 푸터 레이아웃으로 정리

#### CSS 변경
- `src/pages/Home.css`
  - `.home-prompt-modal-actions`의 `padding-top`을 `var(--spacing-md)`로 조정

#### JSX/JS 변경 (예외 기록)
- 없음

### 107) Home 공유 설정 모달 공통 `BaseModal` 전환

- **목적**: Home 팝업(이름 변경/프롬프트 변경/공유 설정)을 같은 공통 모달 규칙(헤더 좌측 타이틀 + 우측 닫기, 라인 제거, 우측 액션 그룹)으로 통일
- **영향**: 공유 설정 팝업이 커스텀 오버레이 구조에서 `BaseModal` 구조로 전환되어 버튼 크기/정렬/여백 정책을 공통으로 상속

#### CSS 변경
- `src/components/ShareSettingsModal.css`
  - 오버레이/커스텀 헤더/푸터 스타일 제거 및 `BaseModal` 연동 클래스(`share-modal-content`, `share-modal-actions`) 추가
  - 워크스페이스명 보조 텍스트, 멤버 영역 구분선(`dashed`) 등 본문 스타일만 유지/정리
  - 인라인 스타일 대체용 `.share-member-date` 클래스 추가

#### JSX/JS 변경 (예외 기록)
- `src/components/ShareSettingsModal.jsx`
  - 루트 마크업을 `BaseModal`로 전환
  - 푸터 액션을 `MUI Button`(`취소`/`저장`)으로 교체
  - 기존 커스텀 footer 버튼 제거
  - 워크스페이스명 문구를 본문 상단 보조 텍스트로 이동

### 108) 작성형 팝업(공지/QnA/FAQ) 공통 모달 패턴 전환

- **목적**: 홈 외 주요 작성형 팝업들도 동일한 모달 규칙(헤더 좌측 타이틀/우측 닫기, 라인 없는 구조, 우측 액션 버튼, 파란 버튼 최소폭)을 적용해 일관성 확보
- **영향**: Notice/QnA/FAQ 작성 모달이 커스텀 오버레이에서 `BaseModal` 기반 구조로 전환되고, 액션 버튼은 MUI 기반으로 통일

#### CSS 변경
- `src/components/NoticeCreateModal.css`
  - 오버레이/컨테이너/헤더/개별 버튼 스타일 제거
  - `BaseModal` 연동 클래스(`notice-create-modal-content`, `notice-create-modal-actions`) 추가
  - 폼 내부 패딩을 `0`으로 조정(공통 콘텐츠 패딩 사용)
- `src/components/QnaCreateModal.css`
  - 오버레이/컨테이너/헤더/개별 버튼 스타일 제거
  - `qna-create-modal-content`, `qna-create-modal-actions` 추가
  - 폼 내부 패딩 `0`으로 조정
- `src/components/FaqCreateModal.css`
  - 오버레이/컨테이너/헤더/개별 버튼 스타일 제거
  - `faq-modal-content`, `faq-modal-actions` 추가
  - 폼 내부 패딩 `0`으로 조정

#### JSX/JS 변경 (예외 기록)
- `src/components/NoticeCreateModal.jsx`
  - 모달 루트를 `BaseModal`로 변경
  - 푸터 액션을 `MUI Button` + `form` submit 연결 방식으로 변경
  - 기존 바깥 클릭/ESC 직접 처리 로직 및 커스텀 헤더 제거
- `src/components/QnaCreateModal.jsx`
  - `BaseModal` 기반으로 전환
  - 액션 버튼을 `MUI Button`으로 교체 및 `form` submit 연결
  - 기존 오버레이 이벤트/헤더 제거
- `src/components/FaqCreateModal.jsx`
  - `BaseModal` 기반으로 전환
  - 액션 버튼을 `MUI Button`으로 교체 및 `form` submit 연결
  - 기존 오버레이 이벤트/헤더 제거

### 109) 이름 변경 모달 본문 `+` 아이콘 제거

- **목적**: 워크스페이스 이름 변경은 입력 중심 동작이므로 본문 `+` 아이콘을 제거해 의미 없는 시각 요소 축소
- **영향**: 이름 변경 모달 본문이 입력 필드 중심으로 단순화되어 의도 전달이 명확해짐

#### CSS 변경
- `src/pages/Home.css`
  - `.home-rename-modal-icon` 스타일 블록 제거
  - `.home-rename-modal-body` 간격을 입력 중심 레이아웃에 맞게 조정

#### JSX/JS 변경 (예외 기록)
- `src/pages/Home.jsx`
  - 이름 변경 모달 본문의 `+` 아이콘 마크업 제거

### 110) 공통 모달 콘텐츠 최소 높이 + 팝업 인라인 스타일 클래스화

- **목적**: 모달 본문 최소 높이를 공통으로 보장하고, 유지보수성을 위해 팝업 영역 인라인 스타일을 클래스 기반으로 정리
- **영향**: 모든 `BaseModal` 기반 팝업의 콘텐츠 최소 높이가 `150px`로 통일되며, 파일 입력/아이콘/입력행 위치 스타일이 CSS로 이관됨

#### CSS 변경
- `src/components/common/modal/BaseModal.module.scss`
  - `.content`에 `min-height: 150px` 추가
- `src/components/ShareSettingsModal.css`
  - 라디오 라벨 아이콘 정렬 클래스(`.share-label-icon`) 추가
  - 멤버 입력행의 `position: relative`를 클래스화
- `src/components/NoticeCreateModal.css`
  - 숨김 파일 입력 클래스(`.notice-hidden-file-input`) 추가
- `src/components/QnaCreateModal.css`
  - 숨김 파일 입력 클래스(`.qna-hidden-file-input`) 추가
- `src/components/FaqCreateModal.css`
  - 숨김 파일 입력 클래스(`.faq-hidden-file-input`) 추가

#### JSX/JS 변경 (예외 기록)
- `src/components/ShareSettingsModal.jsx`
  - 라디오 아이콘의 인라인 style 제거, 클래스 적용
  - 멤버 입력행 인라인 style 제거
- `src/components/NoticeCreateModal.jsx`
  - 파일 input 인라인 `display:none` 제거, 클래스 적용
- `src/components/QnaCreateModal.jsx`
  - 파일 input 인라인 `display:none` 제거, 클래스 적용
- `src/components/FaqCreateModal.jsx`
  - 파일 input 인라인 `display:none` 제거, 클래스 적용

### 111) 헤더/푸터 완전 공통화 + 헤더 인라인 보조타이틀 도입

- **목적**: 인수인계 시 예외를 줄이기 위해 헤더/푸터 스타일을 모달별 커스터마이징 없이 공통 `BaseModal` 규칙으로 통일
- **영향**: `공유 설정`, `프롬프트 변경` 모두 동일한 헤더/푸터 톤으로 맞춰지고, 워크스페이스 정보는 헤더 보조타이틀로 이동해 본문 높이를 확보

#### CSS 변경
- `src/components/common/modal/BaseModal.module.scss`
  - 헤더 패딩/푸터 패딩을 공통값으로 통일
  - 헤더 타이틀 행(`.titleRow`)과 보조타이틀(`.subtitle`) 스타일 추가
  - 보조타이틀 앞 구분자(`.titleDivider`) 스타일 추가
- `src/pages/Home.css`
  - 프롬프트 모달의 헤더/푸터 배경 오버라이드 제거
  - 본문 상단 인트로 스타일 블록 제거(헤더 보조타이틀로 대체)
- `src/components/ShareSettingsModal.css`
  - 본문 워크스페이스명 스타일 제거(헤더 보조타이틀로 대체)
  - 푸터 상단 패딩 오버라이드 완화(공통 규칙 우선)

#### JSX/JS 변경 (예외 기록)
- `src/components/common/modal/BaseModal.jsx`
  - `subtitle` prop 추가
  - 헤더 렌더를 `title | subtitle` 인라인 구조로 확장
- `src/pages/Home.jsx`
  - `프롬프트 변경` 모달에 `subtitle="워크스페이스 - ..."` 적용
  - 본문 상단 워크스페이스 텍스트 제거
- `src/components/ShareSettingsModal.jsx`
  - `공유 설정` 모달에 `subtitle="워크스페이스 - ..."` 적용
  - 본문 상단 워크스페이스 텍스트 제거

### 112) Confirm 다이얼로그 전용 정렬 규칙 적용

- **목적**: 확인창은 일반 모달과 구분해 중앙 집중형 레이아웃(타이틀/본문/버튼 중앙)으로 통일하고, 닫기(X) 제거 및 버튼 색상은 일반 모달과 동일(primary)로 정렬
- **영향**: 삭제 확인 포함 `confirm` 계열 다이얼로그가 공통적으로 `센터 타이틀 + 센터 버튼 + 본문 중앙 정렬` 구조로 동작

#### CSS 변경
- `src/components/common/modal/BaseModal.module.scss`
  - `header` 중앙 정렬 변형(`.headerCenter`) 추가
  - 타이틀 행 중앙 정렬 변형(`.titleRowCenter`) 추가
- `src/context/DialogContext.module.scss`
  - confirm 본문 중앙 정렬 클래스(`.confirmContent`) 추가
  - confirm 메시지 정렬 클래스(`.confirmMessage`) 추가

#### JSX/JS 변경 (예외 기록)
- `src/context/DialogContext.jsx`
  - confirm 타입일 때 `showCloseButton=false`, `headerAlign='center'`, `actionsAlign='center'` 적용
  - confirm 본문에 중앙 정렬 클래스 주입
  - confirm 버튼 컬러를 danger 분기 없이 `primary`로 통일

### 113) 일반 모달 푸터 상단 여백 재보정

- **목적**: 일부 모달에서 푸터 상단 여백 오버라이드(`0`)로 인해 콘텐츠와 버튼이 붙어 보이던 시각 문제 해소
- **영향**: 일반 모달의 푸터가 공통 여백 규칙(`var(--spacing-md)`)을 유지해 콘텐츠와 버튼 간 시각적 간격이 안정화

#### CSS 변경
- `src/pages/Home.css`
  - `.home-prompt-modal-actions` `padding-top`을 `var(--spacing-md)`로 복구
- `src/components/ShareSettingsModal.css`
  - `.share-modal-actions` `padding-top`을 `var(--spacing-md)`로 복구

#### JSX/JS 변경 (예외 기록)
- 없음

### 114) 워크스페이스 상세 팝업 3종 `BaseModal` 공통 프레임 전환

- **목적**: `NoticeDetail`, `QnaDetail`, `FaqDetail` 팝업의 헤더/닫기/오버레이 구현을 개별 커스텀에서 제거하고 `BaseModal` 공통 프레임으로 통일
- **영향**: 상세 팝업들도 일반 모달 규칙(좌측 타이틀/우측 X, 공통 헤더·푸터 스타일)을 동일하게 적용하며, confirm 동작은 `useDialog` 기반으로 일관화

#### CSS 변경
- `src/components/NoticeDetailModal.css`
  - 커스텀 오버레이/컨테이너/헤더 스타일 제거
  - `BaseModal` 콘텐츠 래퍼 클래스(`.notice-detail-modal-content`) 추가
  - 본문 높이/스크롤을 공통 프레임 기준으로 재설정
- `src/components/QnaDetailModal.css`
  - 커스텀 오버레이/컨테이너/헤더 스타일 제거
  - `BaseModal` 콘텐츠 래퍼 클래스(`.qna-detail-modal-content`) 추가
  - 숨김 파일 인풋 인라인 스타일을 클래스(`.qna-detail-hidden-file-input`)로 전환
- `src/components/FaqDetailModal.css`
  - 커스텀 오버레이/컨테이너/헤더 스타일 제거
  - `BaseModal` 콘텐츠 래퍼 클래스(`.faq-detail-modal-content`) 추가
  - 본문 높이/스크롤을 공통 프레임 기준으로 재설정

#### JSX/JS 변경 (예외 기록)
- `src/components/NoticeDetailModal.jsx`
  - 루트 구조를 커스텀 마크업에서 `BaseModal`로 전환
  - 삭제 confirm 호출을 `useAlert.showConfirm`에서 `useDialog.confirm`으로 전환
  - 바깥클릭/ESC/`body overflow` 수동 제어 로직 제거
- `src/components/QnaDetailModal.jsx`
  - 루트 구조를 `BaseModal`로 전환
  - 답변/질문 삭제 confirm 호출을 `useDialog.confirm`으로 전환
  - 파일 인풋 인라인 `style` 제거 및 클래스 연결
  - 바깥클릭/ESC/`body overflow` 수동 제어 로직 제거
- `src/components/FaqDetailModal.jsx`
  - 루트 구조를 `BaseModal`로 전환
  - 삭제 confirm 호출을 `useDialog.confirm`으로 전환
  - 바깥클릭/ESC/`body overflow` 수동 제어 로직 제거

### 115) 워크스페이스 Report 팝업 3종 공통 모달 규격 정렬

- **목적**: `ReportResult`, `ReportCreation`, `ReportGeneration`의 레거시 오버레이/헤더 구조를 `BaseModal` 공통 프레임으로 통일해 예외 케이스 축소
- **영향**: 보고서/페르소나 관련 팝업도 일반 모달 공통 규칙(헤더/푸터/닫기 동작, 버튼 규칙)을 동일하게 상속

#### CSS 변경
- `src/components/ReportResultModal.css`
  - 커스텀 컨테이너/푸터 스타일 제거
  - `BaseModal` 콘텐츠 래퍼(`.report-result-modal-content`) 및 바디(`.report-result-modal-body`) 클래스 추가
- `src/components/ReportCreationModal.css`
  - `BaseModal` 콘텐츠/바디 래퍼(`.report-creation-modal-content`, `.report-creation-modal-body`) 추가
  - 생성 버튼 레거시 스타일 제거 후 MUI 버튼 기준으로 정리
- `src/components/ReportGenerationModal.css`
  - 커스텀 오버레이/컨테이너/헤더 공통 스타일 제거
  - 리스트/편집 뷰 전용 바디 클래스 및 스크롤 스타일로 재구성
  - 기존 인라인 스타일 대체 클래스(`.persona-default-name`, `.persona-readonly-textarea`, `.persona-delete-btn` 등) 추가

#### JSX/JS 변경 (예외 기록)
- `src/components/ReportResultModal.jsx`
  - 루트 구조를 `BaseModal`로 전환
  - 상태별 닫기 허용(`COMPLETED`/`FAILED`)에 맞춰 `showCloseButton`, backdrop/ESC 제어를 공통 prop으로 이관
  - 푸터 버튼을 MUI `Button` 기반 액션 슬롯으로 전환
- `src/components/ReportCreationModal.jsx`
  - 루트 구조를 `BaseModal`로 전환
  - 바깥클릭/ESC/`body overflow` 수동 처리 제거
  - 생성 액션을 MUI `Button`으로 전환
- `src/components/ReportGenerationModal.jsx`
  - 리스트/편집 뷰 모두 `BaseModal` 구조로 전환
  - 바깥클릭/ESC/`body overflow` 수동 처리 제거
  - `window.confirm` 삭제 확인을 `useDialog.confirm`으로 전환
  - 인라인 스타일 구간을 CSS 클래스 기반으로 치환

### 116) 어드민 관리형 팝업(`DB/스케줄/업그레이드`) 공통 프레임 정렬

- **목적**: 어드민 영역의 레거시 팝업(커스텀 오버레이/헤더/푸터)을 `BaseModal` 기준으로 통일해 공통 규칙 예외를 축소
- **영향**: `DbConnection`, `ScheduledImport`, `Upgrade` 팝업이 공통 헤더/푸터/닫기 정책과 MUI 버튼 규칙을 동일하게 상속

#### CSS 변경
- `src/components/DbConnectionModal.css`
  - 커스텀 오버레이/헤더/푸터 스타일 제거 후 `BaseModal` 콘텐츠 클래스(`.db-modal-content`)로 전환
  - Step2 레이아웃/선택 상태/노트 등 인라인 대체 클래스(`.db-step2-layout`, `.db-selected-count`, `.db-import-result-note`) 추가
- `src/components/ScheduledImportModal.css`
  - 커스텀 오버레이/헤더/푸터 스타일 제거 후 `BaseModal` 연동 클래스(`.sched-modal-content`, `.sched-modal-actions`)로 전환
  - 카드 헤더/메타/오류/폼 영역의 인라인 대체 클래스(`.sched-config-header-right`, `.sched-config-meta`, `.sched-form-panel` 등) 추가
- `src/components/UpgradeModal.css`
  - `BaseModal` 기준 콘텐츠 폭/높이/스크롤로 재정렬
  - 폼/파일 업로드/동의 영역 인라인 대체 클래스(`.upgrade-form`, `.upgrade-file-dropzone`, `.upgrade-consent-label` 등) 추가

#### JSX/JS 변경 (예외 기록)
- `src/components/DbConnectionModal.jsx`
  - 루트 구조를 `BaseModal`로 전환
  - 바깥클릭/ESC/`body overflow` 수동 처리 제거
  - 삭제 확인을 `useAlert.showConfirm`에서 `useDialog.confirm`으로 전환
  - 하단 액션을 MUI `Button` 기반으로 전환
- `src/components/ScheduledImportModal.jsx`
  - 루트 구조를 `BaseModal`로 전환
  - 삭제 확인을 `useDialog.confirm`으로 전환
  - 푸터 액션을 `BaseModal actions` + MUI `Button`으로 정리
  - 다수 인라인 스타일을 클래스 기반으로 치환
- `src/components/UpgradeModal.jsx`
  - 루트 구조를 `BaseModal`로 전환
  - 플랜/신청 폼 영역 인라인 스타일 다수를 클래스 기반으로 치환
  - 폼 하단 액션을 MUI `Button`으로 정리

### 117) 공통 dim 블러 통일 + confirm 시각 톤 보정

- **목적**: 팝업 배경 dim의 블러 강도를 공통으로 고정하고, confirm 다이얼로그의 텍스트/버튼 스타일을 공지 알림 톤에 맞춰 일관성 강화
- **영향**: 모든 `BaseModal` 기반 팝업에서 dim 아래 본문이 동일한 블러로 표시되며, confirm은 더 명확한 메시지 타이포와 라운드 버튼 형태로 통일

#### CSS 변경
- `src/components/common/modal/BaseModal.module.scss`
  - MUI Dialog 백드롭 클래스(`.backdrop`) 추가
  - `background-color: rgba(0, 0, 0, 0.5)` + `backdrop-filter: blur(2px)` 공통 적용
- `src/context/DialogContext.module.scss`
  - confirm 메시지 타이포 상향(`font-size: var(--font-size-md)`, `font-weight: var(--font-weight-medium)`)
  - confirm 액션 버튼 라운드/크기/패딩 전용 스타일(`.confirmActions`) 추가

#### JSX/JS 변경 (예외 기록)
- `src/components/common/modal/BaseModal.jsx`
  - `Dialog`에 `BackdropProps` 연결하여 공통 백드롭 스타일 적용
- `src/context/DialogContext.jsx`
  - confirm 타입일 때 `actionsClassName`으로 전용 버튼 스타일 클래스 주입

### 118) 승인 관리(AdminUpgradeRequests) 확인/거절 흐름 공통화

- **목적**: 승인 관리 화면의 인라인 스타일과 커스텀 거절 팝업을 정리하고, 승인/알림 흐름을 공통 다이얼로그(`useDialog`, `BaseModal`) 기준으로 통일
- **영향**: 승인/거절 UX가 다른 모달과 동일한 dim/블러/버튼 규칙을 따르며, 유지보수 시 화면별 예외가 감소

#### CSS 변경
- `src/pages/admin/AdminUpgradeRequests.css` (신규)
  - 테이블/상태배지/액션 버튼/거절 모달 본문 설명 스타일 분리
  - 기존 JSX 인라인 스타일 대체 클래스 정의

#### JSX/JS 변경 (예외 기록)
- `src/pages/admin/AdminUpgradeRequests.jsx`
  - `useAlert` 기반 승인 확인/알림을 `useDialog`(`confirm`, `alert`)로 전환
  - 거절 사유 입력 팝업을 커스텀 오버레이에서 `BaseModal` + MUI(`Button`, `TextField`, `Typography`) 구조로 변경
  - 승인 관리 테이블의 인라인 스타일 제거 및 클래스 기반 렌더링으로 정리

### 119) 사용자/워크스페이스 관리 화면 알림 흐름 및 인라인 스타일 정리

- **목적**: 어드민 주요 목록 화면(`AdminMemberManagement`, `AdminWorkspaceManagement`)의 확인/알림 흐름을 공통 `useDialog`로 맞추고, 남아있던 인라인 스타일을 클래스 기반으로 치환
- **영향**: 삭제/잠금해제/인증재발송/워크스페이스 삭제 등의 confirm/alert 동작이 공통 다이얼로그 규칙을 따르며, 화면별 스타일 유지보수성이 향상

#### CSS 변경
- `src/pages/admin/AdminMemberManagement.css` (신규)
  - 이메일 강조/도메인 ellipsis/잠금 상태 강조/액션 간격/빈 상태 여백 스타일 분리
- `src/pages/admin/AdminWorkspaceManagement.css` (신규)
  - 테이블 래퍼/헤더/행/공유 배지/아이콘 버튼/빈 상태 스타일 분리
  - 프롬프트 태그 활성색을 `data-tone` 기반 클래스로 매핑해 인라인 색상 스타일 제거

#### JSX/JS 변경 (예외 기록)
- `src/pages/admin/AdminMemberManagement.jsx`
  - `useAlert` -> `useDialog`(`alert`, `confirm`) 전환
  - 액션/상태 셀의 인라인 스타일을 클래스 기반으로 정리
- `src/pages/admin/AdminWorkspaceManagement.jsx`
  - `useAlert` -> `useDialog`(`alert`, `confirm`) 전환
  - 로딩/테이블/배지/버튼/빈 상태 인라인 스타일 제거
  - 프롬프트 태그 색상 표현을 `data-tone` 속성 기반으로 변경

### 120) 시멘틱 관리 페이지 confirm/alert 공통 다이얼로그 통일

- **목적**: 어드민 시멘틱 관리군(`Category/Object/Relation/Action/Options`)의 확인/알림 흐름을 `useAlert`에서 `useDialog`로 일원화
- **영향**: 삭제/저장/가져오기/오류 알림이 모두 동일한 공통 confirm/alert UX를 사용해 화면 간 체감 일관성이 향상

#### CSS 변경
- 없음

#### JSX/JS 변경 (예외 기록)
- `src/pages/admin/AdminSemanticCategoryPage.jsx`
  - `useAlert` -> `useDialog` 전환 및 `showAlert/showConfirm` 호출을 `alert/confirm`으로 변경
- `src/pages/admin/AdminSemanticObjectPage.jsx`
  - `useAlert` -> `useDialog` 전환 및 관련 알림/확인 호출 변경
- `src/pages/admin/AdminSemanticRelationPage.jsx`
  - `useAlert` -> `useDialog` 전환 및 관련 알림/확인 호출 변경
- `src/pages/admin/AdminSemanticActionPage.jsx`
  - `useAlert` -> `useDialog` 전환 및 관련 알림/확인 호출 변경
- `src/pages/admin/SemanticOptionsEditor.jsx`
  - `useAlert` -> `useDialog` 전환
  - 불러오기/저장/리셋 확인 흐름을 `alert/confirm` 호출로 통일

### 121) 일반 컴포넌트 잔여 confirm/alert 통일 (Domain/Dictionary/ColumnMapping)

- **목적**: 어드민 외 주요 작업 화면에서 남아 있던 `useAlert` 및 `window.confirm` 호출을 공통 `useDialog` 기반으로 정리
- **영향**: 도메인 삭제, 사전 항목 편집/이동/삭제, 컬럼 매핑 재처리/템플릿 덮어쓰기/삭제 확인까지 동일 confirm/alert UI를 사용

#### CSS 변경
- 없음

#### JSX/JS 변경 (예외 기록)
- `src/components/DomainManagement.jsx`
  - `useAlert` -> `useDialog` 전환
  - 도메인 삭제 확인/실패 알림을 `confirm/alert`로 통일
- `src/components/DictionaryView.jsx`
  - `useAlert` -> `useDialog` 전환
  - 유의어 추가/삭제 실패, 사전 저장/삭제/이동 실패 알림 및 삭제 확인을 `alert/confirm`으로 통일
- `src/components/ColumnMappingModal.jsx`
  - `window.confirm` 4개 지점을 `useDialog.confirm`으로 전환
  - 재처리, 템플릿 덮어쓰기 확인, 템플릿 삭제 확인 흐름을 공통 다이얼로그로 통일

### 122) 그래프/노트북 영역 공통 다이얼로그 전환 (KnowledgeMap/Graph/Notebook)

- **목적**: 사용 빈도가 높은 그래프/노트북 화면의 알림·확인 UX를 공통 `useDialog` 체계로 맞춰 모달 일관성 강화
- **영향**: 그래프 검색/확장/경로찾기 및 노트북 상세 작업에서 표시되는 알림·확인창이 동일한 공통 스타일/동작을 사용

#### CSS 변경
- 없음

#### JSX/JS 변경 (예외 기록)
- `src/components/KnowledgeMapView.jsx`
  - `useAlert` -> `useDialog` 전환
  - 그래프 로딩/검색/경로찾기 관련 알림 호출을 `alert`로 통일
- `src/components/KnowledgeGraphModal.jsx`
  - `useAlert` -> `useDialog` 전환
  - 그래프 로딩/확장/검색 관련 알림 호출을 `alert`로 통일
- `src/components/NotebookDetail.jsx`
  - `useAlert` -> `useDialog` 전환
  - 기존 `showAlert/showConfirm` 호출부는 유지하고, `useDialog` 기반 어댑터(`showAlert`, `showConfirm`)를 주입해 안전하게 호환 전환

### 123) 일반 컴포넌트 추가 전환 (AddSource/Prompt/InterTable/Aggregation)

- **목적**: 잔여 `useAlert` 의존 컴포넌트를 단계적으로 `useDialog`로 전환해 공통 모달/알림 체계 일원화
- **영향**: 소스 업로드/프롬프트 관리/테이블 관계 분석/집계 전략 화면의 알림이 공통 다이얼로그 스타일로 일치

#### CSS 변경
- 없음

#### JSX/JS 변경 (예외 기록)
- `src/components/AddSourceModal.jsx`
  - `useAlert` -> `useDialog` 전환, 기존 `showAlert` 호출은 어댑터로 호환 유지
- `src/components/PromptManagement.jsx`
  - `useAlert` -> `useDialog` 전환, `showAlert` 호출부 호환 유지
- `src/components/InterTableAnalysisModal.jsx`
  - `useAlert` -> `useDialog` 전환, `showAlert` 호출부 호환 유지
- `src/components/AggregationStrategyModal.jsx`
  - `useAlert` -> `useDialog` 전환, `showAlert` 호출부 호환 유지

### 124) AlertContext 브릿지화로 잔여 `useAlert` 전역 공통화

- **목적**: 아직 `useAlert` API를 사용하는 화면까지 한 번에 공통 모달 체계를 적용하기 위해 `AlertContext`를 `useDialog` 브릿지로 전환
- **영향**: `useAlert.showAlert/showConfirm` 호출 화면도 내부적으로 `DialogProvider`의 공통 `alert/confirm` UI를 사용

#### CSS 변경
- 없음

#### JSX/JS 변경 (예외 기록)
- `src/context/AlertContext.jsx`
  - `showAlert`를 `useDialog.alert` 위임 방식으로 변경
  - `showConfirm`를 `useDialog.confirm` 위임 방식으로 변경
  - 기존 `onConfirm` 콜백 옵션(예: 세션 만료 후 라우팅) 호환 유지
- 전역 확인 결과
  - `src/` 내 `window.confirm` 사용 0건으로 정리

### 125) 알림(alert) 디자인을 confirm 구도로 통일

- **목적**: 알림 팝업을 confirm과 동일한 중심 정렬 구조(타이틀/본문/버튼)로 맞추고, 닫기(X) 제거 및 라운드 버튼 규칙을 전 팝업 액션 영역에 일괄 적용
- **영향**: alert/confirm 모두 `custom-alert-container` 톤에 가까운 동일 시각 구조를 사용하며, 팝업 하단 버튼이 전부 pill 형태로 일관

#### CSS 변경
- `src/context/DialogContext.module.scss`
  - decision(alert/confirm) 메시지 타이포를 상향(`font-size: var(--font-size-lg)`)
  - decision 액션 버튼 최소폭/패딩/폰트 크기 보정으로 커스텀 알림 버튼 비율에 맞춤
- `src/components/common/modal/BaseModal.module.scss`
  - 팝업 액션 영역의 모든 MUI 버튼(`.MuiButton-root`)에 `border-radius: 999px` 공통 적용

#### JSX/JS 변경 (예외 기록)
- `src/context/DialogContext.jsx`
  - alert를 confirm과 같은 decision 그룹으로 취급
  - alert/confirm 공통으로 `showCloseButton=false`, `headerAlign='center'`, `actionsAlign='center'` 적용
  - alert/confirm 공통 콘텐츠/액션 클래스 적용으로 동일 레이아웃 보장

### 126) 클래스 네이밍 단순화 및 DevTools 식별성 개선

- **목적**: 보이는 영역 기준의 빠른 유지보수를 위해 클래스 의미를 단순화하고, 브라우저 DevTools에서 공통 모달 구조를 즉시 식별할 수 있도록 고정 클래스명 추가
- **영향**: alert/confirm 관련 스타일 클래스가 역할 중심 이름으로 통일되고, MUI 해시 클래스와 별개로 `km-*` 고정 클래스 기준 디버깅 가능

#### CSS 변경
- `src/context/DialogContext.module.scss`
  - `confirmContent`/`confirmMessage`/`confirmActions`를 `decisionContent`/`decisionMessage`/`decisionActions`로 리네이밍

#### JSX/JS 변경 (예외 기록)
- `src/context/DialogContext.jsx`
  - 리네이밍된 decision 클래스 참조로 교체
- `src/components/common/modal/BaseModal.jsx`
  - 주요 슬롯에 DevTools 식별용 고정 클래스 추가
    - `km-base-modal-paper`
    - `km-base-modal-backdrop`
    - `km-base-modal-header`
    - `km-base-modal-title-row`
    - `km-base-modal-content`
    - `km-base-modal-content-inner`
    - `km-base-modal-actions`

### 127) 로그인 영역 비밀번호 찾기 팝업 공통 모달로 정리

- **목적**: 인라인 스타일/개별 오버레이 방식으로 남아 있던 비밀번호 찾기 팝업을 공통 `BaseModal` 체계로 통일해 유지보수성과 일관성을 확보
- **영향**: 로그인 화면의 비밀번호 찾기 팝업도 전역 모달 규칙(헤더/콘텐츠/푸터 구조, 공통 dim/backdrop, 버튼 라운드)과 동일하게 동작

#### CSS 변경
- `src/components/ForgotPasswordModal.module.scss` (신규)
  - 설명 문구/폼 영역 스타일을 모듈로 분리
  - `content` 최소높이를 `auto`로 조정해 단순 입력 팝업 밀도 최적화

#### JSX/JS 변경 (예외 기록)
- `src/components/ForgotPasswordModal.jsx`
  - 커스텀 오버레이 DOM을 제거하고 `BaseModal`로 교체
  - 인라인 스타일 제거 후 MUI `Typography`, `TextField`, `Button`, `Stack` 기반으로 구성
  - 액션 버튼을 `form` submit 연결 방식으로 정리하여 푸터 공통 버튼 레이아웃 유지

### 128) 로그인 페이지 인라인 스타일 제거 및 클래스 정리

- **목적**: 로그인 화면의 보이는 영역 유지보수를 쉽게 하기 위해 남아 있던 인라인 스타일을 클래스 기반으로 치환
- **영향**: 로고 영역/숨김 타이틀/에러 박스 내 비밀번호 찾기 버튼/회원가입 링크 스타일을 CSS 파일에서 일괄 관리 가능

#### CSS 변경
- `src/pages/Login.css`
  - `login-logo-wrap`, `login-logo-img`, `login-hidden-title`, `error-reset-btn`, `login-signup-link` 클래스 추가
  - 간격/라운드는 토큰(`var(--spacing-lg)`, `var(--spacing-sm)`, `var(--radius-sm)`) 기반으로 정리

#### JSX/JS 변경 (예외 기록)
- `src/pages/Login.jsx`
  - 로고 래퍼/이미지, 숨김 제목, 잠금 에러 버튼, 회원가입 링크의 인라인 스타일을 클래스 참조로 교체

### 129) 로그인 CSS 토큰화 및 불필요 모달 스타일 제거

- **목적**: 로그인 화면의 유지보수성을 높이기 위해 간격·타이포·라운드 값을 디자인 토큰으로 통일하고, 이미 `BaseModal`로 대체된 레거시 모달 스타일을 정리
- **영향**: 로그인 화면 스타일 변경 시 토큰 기준으로 일괄 조정이 가능해졌고, 미사용 `.modal-*` 규칙 제거로 CSS 혼선 감소

#### CSS 변경
- `src/pages/Login.css`
  - `h1`, 폼 라벨/입력, 버튼, 푸터, 체크박스 라벨 영역의 rem/px 값을 `--spacing-*`, `--font-size-*`, `--font-weight-*`, `--radius-*` 토큰으로 치환
  - `options-group` 간격을 12px로 정리
  - `ForgotPasswordModal` 레거시 `.modal-overlay`, `.modal-content` 계열 스타일 블록 제거

#### JSX/JS 변경 (예외 기록)
- 없음

### 130) 어드민 도메인 선택의 "도메인 추가" 팝업 공통 모달 전환

- **목적**: `어드민센터 > 도메인 선택 > 도메인 추가` 팝업에 남아 있던 대량 인라인 스타일을 제거하고 공통 `BaseModal` 구조로 통일
- **영향**: 도메인 추가 팝업이 전역 모달 룰(백드롭/헤더/푸터/버튼 라운드/액션 정렬)을 그대로 사용해 다른 팝업과 일관된 UX 제공

#### CSS 변경
- `src/pages/DomainSelection.css`
  - `domain-redirecting`, `domain-radio-cell`, `domain-radio-input` 추가로 인라인 스타일 제거
  - 도메인 추가 모달용 `domain-add-modal-content`, `domain-add-form`, `domain-add-help`, `domain-add-error` 클래스 추가

#### JSX/JS 변경 (예외 기록)
- `src/pages/DomainSelection.jsx`
  - 커스텀 오버레이 div 기반 모달을 제거하고 `BaseModal`로 교체
  - 모달 입력 UI를 MUI `TextField`, `Typography`, `Button`, `Stack`으로 구성
  - 닫기 동작을 `closeAddModal`로 통일해 에러 상태 초기화까지 함께 처리

### 131) 시스템 설정 관리 도움말 팝업 공통 모달 전환

- **목적**: `어드민센터 > 시스템 설정 관리`의 도움말 팝업(카테고리/항목 설명)에 남아 있던 인라인 오버레이 모달을 공통 `BaseModal` 체계로 통일
- **영향**: 도움말 팝업도 전역 모달 규칙(백드롭/헤더/콘텐츠/푸터 버튼)을 따르게 되어 모달 UX와 유지보수 포인트가 일관화됨

#### CSS 변경
- `src/pages/admin/admin-common.css`
  - 도움말 팝업 콘텐츠 전용 클래스(`admin-config-help-*`) 추가
  - 본문 요약/리스트/코드 블록/설명 박스 레이아웃을 인라인 스타일 없이 클래스 기반으로 정리

#### JSX/JS 변경 (예외 기록)
- `src/pages/admin/AdminConfigManagement.jsx`
  - 커스텀 `position: fixed` 오버레이 마크업을 제거하고 `BaseModal`로 교체
  - 타이틀 아이콘/본문/닫기 액션을 공통 모달 props + 클래스 조합으로 재구성

### 132) 사용자 관리 "사용자 수정" 팝업 공통 모달 전환

- **목적**: `어드민센터 > 사용자 관리`의 사용자 수정 팝업을 레거시 `admin-modal-*` 오버레이 구조에서 공통 `BaseModal` 구조로 통일
- **영향**: 사용자 수정 팝업도 전역 모달 헤더/콘텐츠/푸터 규칙 및 공통 버튼 스타일을 사용해 팝업 UX가 일관화됨

#### CSS 변경
- `src/pages/admin/AdminMemberManagement.css`
  - `admin-member-edit-content` 클래스 추가로 수정 팝업 콘텐츠 최소 높이 최적화

#### JSX/JS 변경 (예외 기록)
- `src/pages/admin/AdminMemberManagement.jsx`
  - `editMember` 조건 렌더링 블록을 `BaseModal` 기반으로 교체
  - 액션 버튼을 MUI `Button` + `Stack`으로 구성(취소/저장)

### 133) 시멘틱 관리 4종 편집 팝업 공통 모달 전환

- **목적**: `어드민센터 > 시멘틱(카테고리/객체/관계/액션)` 화면의 편집/추가 팝업을 레거시 `admin-modal-*` 오버레이 구조에서 공통 `BaseModal` 구조로 일괄 통일
- **영향**: 시멘틱 관리 전 구간에서 팝업 레이아웃/백드롭/버튼 스타일이 동일한 공통 규칙으로 동작

#### CSS 변경
- `src/pages/admin/admin-common.css`
  - `admin-semantic-edit-content` 클래스 추가(시멘틱 편집 모달 콘텐츠 최소 높이 최적화)

#### JSX/JS 변경 (예외 기록)
- `src/pages/admin/AdminSemanticCategoryPage.jsx`
  - 카테고리 추가/수정 팝업을 `BaseModal` + MUI `Button/Stack`으로 교체
- `src/pages/admin/AdminSemanticObjectPage.jsx`
  - Object 추가/수정 팝업을 `BaseModal` + MUI `Button/Stack`으로 교체
- `src/pages/admin/AdminSemanticRelationPage.jsx`
  - 관계 추가/수정 팝업을 `BaseModal` + MUI `Button/Stack`으로 교체
- `src/pages/admin/AdminSemanticActionPage.jsx`
  - Action 추가/수정 팝업을 `BaseModal` + MUI `Button/Stack`으로 교체

### 134) DictionaryView 편집/이동 팝업 공통 모달 전환

- **목적**: 사전 화면(`DictionaryView`)의 편집/이동 팝업에서 레거시 오버레이 마크업을 제거하고 공통 `BaseModal`로 통일
- **영향**: 사전 화면 팝업도 전역 모달 백드롭/헤더/푸터 규칙을 사용하게 되어 다른 화면과 동작/디자인 일관성 확보

#### CSS 변경
- `src/components/DictionaryView.css`
  - `dictionary-modal-content` 클래스 추가(사전 팝업 콘텐츠 최소 높이 최적화)
  - 편집 폼 하단 여백을 공통 모달 푸터 간격과 맞도록 정리

#### JSX/JS 변경 (예외 기록)
- `src/components/DictionaryView.jsx`
  - `isEditModalOpen` 편집 팝업을 `BaseModal` + MUI `Button/Stack`으로 교체
  - `isMoveModalOpen` 이동(병합) 팝업을 `BaseModal` + MUI `Button/Stack`으로 교체

### 135) NotebookDetail chunk/meta 팝업 공통 모달 전환

- **목적**: `NotebookDetail`의 chunk 전체보기 및 용어사전(meta) 팝업에서 레거시 오버레이 마크업을 제거하고 공통 `BaseModal` 구조로 통일
- **영향**: 노트북 상세 화면의 주요 팝업도 전역 모달 백드롭/헤더/푸터 규칙을 사용해 다른 화면과 동일한 팝업 UX를 제공

#### CSS 변경
- `src/components/NotebookDetail.css`
  - `meta-modal-content`를 공통 모달 콘텐츠 컨테이너 기준으로 정리(레이아웃/간격 중심)

#### JSX/JS 변경 (예외 기록)
- `src/components/NotebookDetail.jsx`
  - chunk(Page) 전체 내용 팝업을 `BaseModal`로 교체
  - 비즈니스 용어사전(BizMeta) 팝업을 `BaseModal` + MUI `Button/Stack`으로 교체
  - IT 용어사전(ItMeta) 팝업을 `BaseModal` + MUI `Button/Stack`으로 교체

### 136) 시멘틱 관리 4개 페이지 인라인 스타일 공통 클래스화(1차)

- **목적**: 시멘틱 관리 화면(`Category/Object/Relation/Action`)에 남아 있던 반복 인라인 스타일을 공통 CSS 클래스로 치환해 유지보수 난이도를 낮춤
- **영향**: 액션 버튼 그룹, 숨김 파일 input, sticky 헤더, 빈 상태, 보조 텍스트, 삭제 버튼 간격 등 공통 UI 패턴을 `admin-common.css` 한 곳에서 제어 가능

#### CSS 변경
- `src/pages/admin/admin-common.css`
  - 공통 유틸 클래스 추가
    - `admin-inline-actions`, `admin-hidden-file-input`
    - `admin-sticky-head`, `admin-col-id-narrow`
    - `admin-empty-state-compact`, `admin-empty-state-default`
    - `admin-col-strong`, `admin-text-secondary`, `admin-text-tertiary`
    - `admin-action-gap-left`
    - `admin-semantic-search-row`, `admin-semantic-search-icon`, `admin-semantic-search-input`, `admin-semantic-table-wrap`

#### JSX/JS 변경 (예외 기록)
- `src/pages/admin/AdminSemanticCategoryPage.jsx`
  - 검색행/테이블/업로드 input/빈상태/삭제버튼 간격 인라인 스타일을 공통 클래스로 치환
- `src/pages/admin/AdminSemanticObjectPage.jsx`
  - 액션 그룹/업로드 input/테이블 헤더/빈상태/열 텍스트/삭제버튼 간격 인라인 스타일 치환
- `src/pages/admin/AdminSemanticRelationPage.jsx`
  - Object 페이지와 동일 패턴 인라인 스타일 치환
- `src/pages/admin/AdminSemanticActionPage.jsx`
  - Object 페이지와 동일 패턴 인라인 스타일 치환

### 137) 시멘틱 관리 인라인 스타일 공통 클래스화(2차)

- **목적**: 1차 이후 남아 있던 시멘틱 페이지 레이아웃/테이블 인라인 스타일을 추가로 정리하여, 동적 계산값을 제외한 정적 스타일을 최대한 CSS로 이관
- **영향**: 좌우 분할 레이아웃/패널 헤더/테이블 래퍼/트리 셀 표현의 공통 규칙이 `admin-common.css`로 모여 화면별 수정 편차 감소

#### CSS 변경
- `src/pages/admin/admin-common.css`
  - 시멘틱 분할 레이아웃 관련 클래스 추가
    - `admin-semantic-split-layout`, `admin-semantic-left-panel`, `admin-semantic-right-panel`
    - `admin-semantic-panel-head`, `admin-semantic-panel-title`, `admin-semantic-panel-head-actions`
  - 트리/텍스트 셀 클래스 추가
    - `admin-row-clickable`, `admin-semantic-name-cell`, `admin-semantic-name-ko-cell`
    - `admin-semantic-tree-toggle`, `admin-semantic-tree-toggle--active`, `admin-semantic-tree-toggle--inactive`
    - `admin-code-mono`

#### JSX/JS 변경 (예외 기록)
- `src/pages/admin/AdminSemanticObjectPage.jsx`
  - 좌우 분할/패널 헤더/우측 테이블 래퍼 인라인 스타일을 공통 클래스 참조로 치환
- `src/pages/admin/AdminSemanticRelationPage.jsx`
  - Object 페이지와 동일 패턴으로 인라인 스타일 치환
- `src/pages/admin/AdminSemanticActionPage.jsx`
  - Object 페이지와 동일 패턴으로 인라인 스타일 치환
- `src/pages/admin/AdminSemanticCategoryPage.jsx`
  - 행 cursor, 트리 토글 스타일, 이름/한글명/코드/설명 셀의 정적 인라인 스타일을 공통 클래스로 치환
  - depth 및 collapsed 상태에 따른 계산값(`paddingLeft`, `maxWidth`, `whiteSpace`)만 인라인으로 유지

### 138) Dictionary/Notebook 본문 인라인 스타일 공통 클래스화

- **목적**: 팝업 전환 이후 남아 있던 `DictionaryView`, `NotebookDetail` 본문 영역의 인라인 스타일을 CSS 클래스로 이전해 유지보수성 개선
- **영향**: 검색 자동완성, 테이블 컬럼 폭/텍스트 표현, 유의어 편집 UI, 채팅 출처 칩/초기화 버튼, 문서 뱃지 표현을 CSS 기준으로 일관 관리 가능

#### CSS 변경
- `src/components/DictionaryView.css`
  - 자동완성 드롭다운/항목/카테고리 배지 클래스 추가
  - 테이블 컬럼 폭/텍스트 스타일 클래스(`dict-col-*`, `dict-text-*`) 추가
  - 유의어 편집/이동 모달 내부 UI 클래스(`dict-synonym-*`, `dict-move-*`, `dict-candidate-*`) 추가
  - 로딩 스피너를 스타일 태그 인라인 방식에서 클래스(`dict-loading-spinner`)로 치환
- `src/components/NotebookDetail.css`
  - 문서 뷰어 뱃지 클래스(`nb-badge*`) 추가
  - 채팅 초기화/출처 영역 클래스(`chat-clear-*`, `chat-sources-*`, `chat-source-chip`) 추가

#### JSX/JS 변경 (예외 기록)
- `src/components/DictionaryView.jsx`
  - 자동완성 드롭다운, 테이블 헤더/본문 셀, 유의어 편집/이동 블록의 인라인 스타일을 클래스 참조로 치환
- `src/components/NotebookDetail.jsx`
  - chunk/page 상태 뱃지, 채팅 초기화 행, 출처 표시 칩의 인라인 스타일을 클래스 참조로 치환

### 139) NotebookDetail JSX 문법 오류(Unexpected token) 긴급 수정

- **목적**: `NotebookDetail.jsx` 빌드 시 발생한 `Unexpected token` 오류를 즉시 복구해 화면 진입/개발 서버 실행이 가능하도록 수정
- **영향**: 채팅 출처 칩 렌더링 구간에서 JSX 파서 오류가 해소되어 런타임 컴파일 실패가 제거됨

#### CSS 변경
- 없음

#### JSX/JS 변경 (예외 기록)
- `src/components/NotebookDetail.jsx`
  - 출처 칩 `<span>`의 `onClick` 핸들러 종료 구문 누락(`}}`)을 보완하여 JSX 태그 문법 정상화

### 140) DictionaryView 잔여 인라인 스타일 0건 정리

- **목적**: `DictionaryView`에 마지막으로 남아 있던 단일 인라인 스타일(`카테고리 ':' 구분자`)을 클래스 기반으로 치환해 파일 내 인라인 스타일 0건 달성
- **영향**: 사전 화면 카테고리 구분자 스타일도 CSS에서 일괄 관리 가능해져 유지보수 포인트 단순화

#### CSS 변경
- `src/components/DictionaryView.css`
  - `dictionary-category-separator` 클래스 추가

#### JSX/JS 변경 (예외 기록)
- `src/components/DictionaryView.jsx`
  - `renderCategory()` 내부 `:` 구분자 인라인 스타일을 `dictionary-category-separator` 클래스로 교체

### 141) NotebookDetail 잔여 인라인 스타일 0건 정리

- **목적**: `NotebookDetail.jsx`에 마지막으로 남아 있던 동기화 진행바 width 인라인 스타일을 제거해 파일 내 인라인 스타일 0건 달성
- **영향**: 동기화 진행 UI가 인라인 스타일 없이도 동일하게 동작하며, 스타일 정의가 CSS로 일원화됨

#### CSS 변경
- `src/components/NotebookDetail.css`
  - `sync-progress-fill`을 `progress` 요소 기준으로 스타일링
  - WebKit/Firefox progress value 스타일(`::-webkit-progress-value`, `::-moz-progress-bar`) 추가

#### JSX/JS 변경 (예외 기록)
- `src/components/NotebookDetail.jsx`
  - 동기화 진행바를 `div` width 인라인 방식에서 `<progress value={syncProgress} max="100" />` 방식으로 전환

### 142) 프롬프트 생성/수정 다이얼로그 공통 BaseModal 전환

- **목적**: `새 프롬프트 생성`, `프롬프트 정보 수정` 팝업이 개별 MUI `Dialog` 스타일로 표시되던 문제를 해결하고 공통 모달 규칙(백드롭/헤더/푸터/버튼)으로 통일
- **영향**: 프롬프트 관리 화면 팝업도 기존 공통 팝업 디자인 기준(dim/blur, 헤더 구조, 버튼 라운드)을 동일하게 적용

#### CSS 변경
- `src/prompt/components/prompts/PromptDialogs.css` (신규)
  - `prompt-form-modal-content` 클래스 추가(프롬프트 팝업 콘텐츠 최소 높이 최적화)

#### JSX/JS 변경 (예외 기록)
- `src/prompt/components/prompts/PromptFormDialog.jsx`
  - MUI `Dialog`/`DialogTitle`/`DialogContent`/`DialogActions` 구조를 `BaseModal` 구조로 교체
  - 외부 클릭/ESC 닫기 방지 옵션을 `BaseModal` props로 이관
- `src/prompt/components/prompts/EditPromptDialog.jsx`
  - MUI `Dialog` 기반 구조를 `BaseModal` 구조로 교체
  - 기존 저장/취소 액션을 공통 모달 액션 영역으로 이관

### 143) 프롬프트 팝업 취소 버튼 스타일 회귀 수정

- **목적**: `BaseModal` 전환 후 프롬프트 팝업 취소 버튼이 텍스트형으로 보여 기존 공통 취소 버튼 톤(외곽선형)과 달라진 회귀를 수정
- **영향**: 프롬프트 생성/수정 팝업의 `취소` 버튼이 공통 모달 버튼 룰(outlined + 라운드)로 다시 일치

#### CSS 변경
- 없음

#### JSX/JS 변경 (예외 기록)
- `src/prompt/components/prompts/PromptFormDialog.jsx`
  - 하단 `취소` 버튼을 `variant="outlined"`로 변경
- `src/prompt/components/prompts/EditPromptDialog.jsx`
  - 하단 `취소` 버튼을 `variant="outlined"`로 변경

### 144) 공통 모달 여백 확대(타이틀/본문/푸터 2배)

- **목적**: 공통 팝업의 타이틀/본문/푸터 여백이 촘촘해 답답해 보이던 이슈를 해소하기 위해, 공통 모달 내부 패딩을 기존 대비 2배로 확대
- **영향**: `BaseModal`을 사용하는 전체 팝업에서 헤더/콘텐츠/푸터 여백이 더 넓어져 시각적 밀도가 완화되고 읽기성이 개선

#### CSS 변경
- `src/components/common/modal/BaseModal.module.scss`
  - `header` 패딩: `var(--spacing-md)` → `var(--spacing-xl)`
  - `content` 패딩: `var(--spacing-md)` → `var(--spacing-xl)`
  - `actions` 패딩: `var(--spacing-md)` → `var(--spacing-xl)`

#### JSX/JS 변경 (예외 기록)
- 없음

### 145) 공통 모달 여백 24px로 재조정 + 스크롤 트랙 라인 정리

- **목적**: 공통 모달 여백 32px가 과하다는 피드백을 반영해 24px로 완화하고, 콘텐츠 스크롤 주변에 보이던 세로 라인 노이즈를 제거
- **영향**: 팝업 밀도는 이전보다 여유를 유지하면서도 과도한 여백이 줄어들고, 스크롤 영역 시각 노이즈가 감소

#### CSS 변경
- `src/components/common/modal/BaseModal.module.scss`
  - `header/content/actions` 패딩: `var(--spacing-xl)` → `var(--spacing-lg)`
  - `.content` 스크롤바 트랙 배경을 투명 처리하고, thumb 스타일을 별도로 지정해 스크롤 좌측 라인 노출 최소화

#### JSX/JS 변경 (예외 기록)
- 없음

### 146) `AddSourceModal` 공통 팝업 룰 시각 정렬(여백/딤/스크롤 라인)

- **목적**: `새 워크스페이스 추가/노트북 상세 > 소스 추가` 팝업이 공통 팝업 룰과 다르게 보이던 문제(여백, dim, 스크롤 라인 노이즈)를 빠르게 정렬
- **영향**: 소스 추가 팝업도 공통 팝업과 유사한 밀도(24px)·딤/블러·스크롤 트랙 표현을 사용해 이질감 감소

#### CSS 변경
- `src/components/AddSourceModal.css`
  - 오버레이 dim을 `rgba(0,0,0,0.5)`로 조정하고 `backdrop-filter: blur(2px)` 추가
  - 모달 컨테이너 라운드/그림자/보더를 공통 토큰 톤에 맞게 보정
  - `modal-header`/`modal-body` 패딩을 `var(--spacing-lg)`(24px)로 통일
  - `modal-body` 스크롤 트랙을 투명화하고 thumb 스타일을 별도 지정해 좌측 라인 노이즈 완화

#### JSX/JS 변경 (예외 기록)
- 없음

### 147) `AddSourceModal` 하단 액션 영역(취소/저장) 추가

- **목적**: 공통 팝업 포맷에 맞춰 `소스 추가` 메인 팝업에도 하단 버튼 영역을 명시적으로 제공
- **영향**: `소스 추가` 팝업이 다른 폼형 모달과 동일하게 `취소/저장` 액션 행을 가지며 시각적 일관성 강화

#### CSS 변경
- `src/components/AddSourceModal.css`
  - `modal-footer`, `modal-footer-actions`, `modal-footer-btn*` 클래스 추가
  - 버튼을 pill 라운드/최소폭 150px 규칙으로 구성

#### JSX/JS 변경 (예외 기록)
- `src/components/AddSourceModal.jsx`
  - 메인 뷰(`renderMainView`) 하단에 `취소`/`저장` 버튼 영역 추가

### 148) `AddSourceModal` 공통 `BaseModal` 완전 전환(기능 유지)

- **목적**: `소스 추가` 팝업의 임시 개별 CSS 보정 방식에서 벗어나 공통 `BaseModal` 규칙을 직접 상속하도록 구조를 일원화
- **영향**: 헤더/푸터/딤/블러/버튼 스타일이 공통 모달과 동일한 기준으로 렌더링되어 유지보수성이 향상되고, 서브뷰 전환/ESC 처리 동작은 기존 흐름을 유지

#### CSS 변경
- `src/components/AddSourceModal.css`
  - 기존 오버레이/컨테이너 카드 스타일 의존을 제거하고 `BaseModal` 콘텐츠 영역 기준으로 정리
  - `add-source-modal-content`, `subview-title-row`, `subview-title` 클래스 추가
  - 더 이상 사용하지 않는 `modal-footer*` 커스텀 버튼 스타일 제거(공통 액션 버튼 규칙 사용)

#### JSX/JS 변경 (예외 기록)
- `src/components/AddSourceModal.jsx`
  - 루트 렌더를 커스텀 오버레이 구조에서 `BaseModal` 컴포넌트 기반으로 교체
  - 메인 뷰 하단 액션을 `BaseModal`의 `actions` 슬롯(`취소` outlined, `저장` contained)으로 이관
  - ESC/서브뷰 뒤로가기 동작을 유지하기 위해 `disableEscapeKeyDown` + 기존 키 핸들러 조합 유지
  - 서브뷰(`website/text/csv`) 상단 뒤로가기 행을 콘텐츠 내부 공통 구조로 정리

### 149) `소스 추가` 메인 뷰 중복 패딩 제거

- **목적**: `BaseModal` 공통 본문 패딩(24px)과 `AddSourceModal` 내부 본문 패딩이 중복되어 빈 공간이 과도하게 보이던 이슈를 해소
- **영향**: 메인 뷰 카드 영역이 컨테이너를 더 넓게 사용하고, 상하/좌우 여백이 공통 모달 기준으로 자연스럽게 정리

#### CSS 변경
- `src/components/AddSourceModal.css`
  - `.modal-body.main-view`에 `padding: 0` 적용으로 메인 뷰 내부 중복 패딩 제거

#### JSX/JS 변경 (예외 기록)
- 없음

### 150) 전역 폰트 기준 정합화(`Pretendard` 우선, MUI 포함)

- **목적**: 전역 CSS는 `Pretendard`를 사용하지만 MUI 기본 타이포그래피가 별도 테마 없이 동작해 일부 화면에서 `Roboto`가 노출될 수 있는 상태를 해소
- **영향**: MUI `Typography`/`Button`/`TextField` 등 컴포넌트 기본 폰트가 앱 전반에서 `Pretendard` 우선 스택으로 일관 적용

#### CSS 변경
- `src/components/UpgradeModal.css`
  - `font-family` 스택에서 `Roboto`를 제거하고 공통 `Pretendard` 우선 스택으로 정리

#### JSX/JS 변경 (예외 기록)
- `src/main.jsx`
  - 전역 `ThemeProvider(createTheme)` 도입 및 `typography.fontFamily`를 `Pretendard` 우선 스택으로 지정
  - `CssBaseline` 적용으로 MUI 컴포넌트 기본 타이포그래피를 전역 기준과 정합

### 151) 알림 계열(`alert/confirm`) 헤더·푸터 세로 여백 축소

- **목적**: 알림 팝업에서 헤더/푸터 세로 여백이 과하다는 피드백을 반영해, 본문 24px은 유지하고 헤더·푸터는 한쪽 방향만 24px로 조정
- **영향**: `alert/confirm` 팝업에서 상단·하단 공백이 줄어들고 본문 가용 높이가 늘어나며, 일반 모달 레이아웃은 기존과 동일하게 유지

#### CSS 변경
- `src/context/DialogContext.module.scss`
  - `decisionHeader` 추가: `padding-top: var(--spacing-lg)`, `padding-bottom: 0`
  - `decisionActions` 조정: `padding-top: 0`, `padding-bottom: var(--spacing-lg)`

#### JSX/JS 변경 (예외 기록)
- `src/components/common/modal/BaseModal.jsx`
  - `headerClassName` prop 추가(모달별 헤더 패딩 커스터마이징 지원)
- `src/context/DialogContext.jsx`
  - `alert/confirm` 렌더 시 `headerClassName={styles.decisionHeader}` 적용

### 152) `confirm` 취소 버튼 회색 pill 스타일 정합

- **목적**: 알림/컨펌 계열에서 `취소` 버튼이 파란 외곽선으로 보이던 이질감을 제거하고, 요구된 회색 pill 버튼 톤으로 통일
- **영향**: `confirm` 다이얼로그의 `취소` 버튼이 회색 채움형으로 렌더링되어 `확인` 버튼과 짝을 이루는 시각 규칙이 안정화

#### CSS 변경
- `src/context/DialogContext.module.scss`
  - `decisionCancelButton` 및 hover 상태 색상 추가(회색 채움형)

#### JSX/JS 변경 (예외 기록)
- `src/context/DialogContext.jsx`
  - 결정형 다이얼로그에서 `취소` 버튼 variant를 `contained`로 전환하고 `decisionCancelButton` 클래스를 조건부 적용

### 153) 알림/컨펌 액션 버튼 가로폭 100px 고정

- **목적**: 알림/컨펌 하단 버튼 폭을 균일하게 맞춰 시각 리듬을 단순화
- **영향**: `alert/confirm`의 `취소/확인` 버튼이 동일한 100px 고정 폭으로 표시되어 정렬감이 향상

#### CSS 변경
- `src/context/DialogContext.module.scss`
  - `decisionActions .MuiButton-root`를 `min-width/width/max-width: 100px`으로 고정

#### JSX/JS 변경 (예외 기록)
- 없음

### 154) 알림/컨펌 팝업 폭 488px + 타이틀 `xl` 상향

- **목적**: 결정형 팝업(`alert/confirm`)의 시각 밀도를 맞추기 위해 최대폭을 축소하고 제목 위계를 한 단계 강화
- **영향**: `alert/confirm`은 `max-width: 488px`로 표시되고, 타이틀은 `lg`에서 `xl`로 커져 가독성이 개선

#### CSS 변경
- `src/context/DialogContext.module.scss`
  - `decisionPaper` 추가(`max-width: 488px`)
  - `decisionTitle` 추가(`font-size: var(--font-size-xl)`)

#### JSX/JS 변경 (예외 기록)
- `src/components/common/modal/BaseModal.jsx`
  - 모달별 paper/title 커스터마이징을 위한 `paperClassName`, `titleClassName` prop 추가
- `src/context/DialogContext.jsx`
  - `alert/confirm` 렌더 시 `paperClassName={styles.decisionPaper}`, `titleClassName={styles.decisionTitle}` 적용

### 155) 이용서비스 팝업 분리(요금제 정보 보존 + 신청 폼 분리)

- **목적**: `이용서비스`에서 보이는 요금제 카드 디자인/정보를 dev 기준 그대로 유지하면서, 신청 폼 전환으로 인한 정보 유실 인상을 없애기 위해 별도 팝업으로 분리
- **영향**: 상단 `이용 서비스` 클릭 시 요금제 전용 팝업이 먼저 열리고, Pro/Max 신청 버튼 클릭 시 신청 폼 팝업이 별도로 열려 콘텐츠 가시성과 흐름이 안정화

#### CSS 변경
- 없음(기존 `src/components/UpgradeModal.css` 스타일 재사용)

#### JSX/JS 변경 (예외 기록)
- `src/components/ServicePlanModal.jsx` (신규)
  - 요금제 카드 전용 팝업 컴포넌트 분리
  - 기존 `UpgradeModal`의 계획(Free/Pro/Max) 렌더 구조와 상태 표시/문구/제약 로직(`hasPendingRequest`, `gradeLimits`) 유지
- `src/components/UpgradeModal.jsx`
  - `view` 기반 다중 화면 구조를 제거하고 신청 폼 전용 팝업으로 역할 분리
  - `targetType` prop(`PRO_UPGRADE`/`MAX_CONSULTATION`) 기반 제목/설명/업로드 필드 조건 렌더 유지
- `src/components/common/MainLayout.jsx`
  - `이용 서비스` 버튼을 요금제 전용 팝업 오픈으로 변경
  - 요금제 팝업에서 업그레이드 요청 타입을 전달받아 신청 폼 팝업을 후속 오픈하도록 연결

### 156) 요금제 팝업(dev 디자인 정합) 헤더/폭/호버 보정

- **목적**: 분리 후 요금제 팝업이 dev 화면과 다르게 보이던 간격·헤더 톤·호버 체감 차이를 줄이고, 카드 호버 효과를 명시적으로 보장
- **영향**: 요금제 팝업은 dev와 유사한 헤더 밀도/폭으로 표시되며 Pro/Max 카드에서 마우스 호버 시 보더/버튼 톤 변화가 안정적으로 반영

#### CSS 변경
- `src/components/UpgradeModal.css`
  - 요금제 팝업 전용 클래스(`service-plan-modal-paper`, `service-plan-modal-header`, `service-plan-modal-title`, `service-plan-modal-content`) 추가
  - `:has()` 의존 보더 호버 규칙을 제거하고 `.plan-card.interactive:hover`로 대체해 호버 동작 안정화

#### JSX/JS 변경 (예외 기록)
- `src/components/ServicePlanModal.jsx`
  - `BaseModal`에 요금제 전용 `paper/header/title/content` 클래스 연결
  - Pro/Max 카드에 `interactive` 클래스 부여(hover 대상 명시)

### 157) 이용서비스 모달 연결 dev 단일 구조로 복귀

- **목적**: `UpgradeModal` 원본(dev) 덮어쓰기 이후 `MainLayout`이 분리형 모달 연결을 유지해 동작/디자인이 어긋나는 문제를 해소
- **영향**: 우측 상단 `이용 서비스` 클릭 시 dev 원본 단일 `UpgradeModal`이 직접 열리며, 요금제→신청 전환/호버 동작이 한 컴포넌트 안에서 원래 흐름대로 동작

#### CSS 변경
- 없음

#### JSX/JS 변경 (예외 기록)
- `src/components/common/MainLayout.jsx`
  - `ServicePlanModal` import/상태/렌더 제거
  - `이용 서비스` 클릭 핸들러를 `setUpgradeModalOpen(true)`로 복귀
  - `UpgradeModal`에 전달하던 분리형 props(`targetType`) 제거
- `src/components/ServicePlanModal.jsx`
  - 분리형 요금제 전용 모달 파일 제거(미사용 정리)

### 158) 요금제 `Free` 카드 녹색 하이라이트 제거 + `_old` 임시 파일 정리

- **목적**: 원본 스타일 대비 `Free` 카드 hover/기본 상태에서 연녹색이 보이던 이질감을 제거하고, 작업 완료된 임시 백업 파일을 정리
- **영향**: `Free` 카드는 기본/hover 모두 중립 톤(화이트/그레이 보더)으로 표시되며, 프로젝트 내 혼동 가능한 `_old` 레이아웃 파일이 제거됨

#### CSS 변경
- `src/components/UpgradeModal.css`
  - `.plan-card.current-plan`을 녹색 스타일에서 중립 스타일로 변경
  - `.plan-card.current-plan:hover`를 추가해 hover 시에도 녹색이 재노출되지 않도록 고정

#### JSX/JS 변경 (예외 기록)
- 없음

#### 기타 파일 정리
- `src/components/common/MainLayout_old.jsx` 삭제
- `src/components/common/MainLayout_old.css` 삭제

### 159) ReportGenerationModal textarea 중복 `className` 제거(esbuild 경고 해소)

- **목적**: 동일 JSX 요소에 `className`이 두 번 선언되어 Vite/esbuild가 `Duplicate "className" attribute in JSX element` 경고를 내는 문제를 제거
- **영향**: 로컬·원격 동일 코드에서는 빌드/개발 로그 경고가 사라지며, 스타일 적용은 기존과 동일(`기초값`일 때 `persona-readonly-textarea` 유지)

#### CSS 변경
- 없음

#### JSX/JS 변경 (예외 기록)
- `src/components/ReportGenerationModal.jsx`
  - 페르소나 지시문 `textarea`의 상충 속성 제거 — 조건부 `className` 하나로 통합

## 2026-05-09

### 160) 일반 BaseModal 본문 min-height 120px·도메인 추가·워크스페이스 이름 변경 폼 정렬

- **목적**: 짧은 폼 팝업의 불필요한 세로 여백을 줄이고, 도메인 추가·이름 변경 입력 정렬을 통일
- **영향**: `BaseModal` 기본 본문 최소 높이가 200px → 120px; 공지/QnA/보고서 생성 모달 내 오버라이드 `min-height`도 120px로 통일; 워크스페이스 이름 변경 모달에 안내 문구·라벨 적용

#### CSS 변경
- `src/components/common/modal/BaseModal.module.scss` — `.content` fallback `min-height` 120px
- `src/pages/Home.css` — `.home-rename-modal-hint` 추가
- `src/components/NoticeCreateModal.css`, `src/components/QnaCreateModal.css`, `src/components/ReportCreationModal.css` — 본문 `min-height` 120px

#### JSX/JS 변경 (예외 기록)
- `src/pages/Home.jsx` — 이름 변경 모달에 안내 `Typography`, 입력 라벨·Outlined 적용

### 161) 도메인 추가 모달 본문만 FAQ형 레이아웃(라벨 상단·네이티브 입력)

- **목적**: 공통 `BaseModal` 헤더·푸터·버튼 레이아웃은 유지한 채, 본문 입력만 라벨 위·입력 아래·기존 플레이스홀더 문구로 정리
- **영향**: 어드민 도메인 선택 「새 도메인 추가」는 FAQ 작성과 동일한 마크업(`label` + `input`)·포커스 링·도움말 위치로 표시

#### CSS 변경
- `src/pages/DomainSelection.css` — `.domain-add-form`, `.domain-add-form-group` 입력 스타일 추가, `.domain-add-help`·`.domain-add-error` 간격 보정

#### JSX/JS 변경 (예외 기록)
- `src/pages/DomainSelection.jsx` — 도메인 추가 본문을 네이티브 폼 필드로 전환

### 162) 공통 BaseModal Dialog 페이드·Y축 간섭 억제

- **목적**: 팝업 전환 시 아래에서 위로 슬라이드되는 것처럼 보이는 현상 완화(`Fade`는 opacity만 사용하되 DOM에서 `transform` 간섭 방지)
- **영향**: `BaseModal` 기반 모달

#### CSS/JSX 변경
- `src/components/common/modal/BaseModal.jsx` — `TransitionProps.style.transform: 'none'`

### 163) 시맨틱 관리 모달 저장 버튼 아이콘 제거

- **목적**: 하단 주행동은 텍스트만 유지
- **영향**: AdminSemantic Category/Object/Relation/Action 편집 모달

#### JSX/JS 변경 (예외 기록)
- 위 4개 페이지에서 Lucide `Save` 아이콘 및 import 제거

### 164) 도메인 관리 페이지 진입 애니메이션(전역 `fadeIn` 이름 충돌)

- **목적**: 미정의 `animation: fadeIn`이 `CustomAlert`의 scale 키프레임을 물려 팝업처럼 커지던 현상 제거
- **영향**: `DomainManagement.css` 페이지 컨테이너 진입 애니메이션 제거, 모달은 로컬 키프레임만 사용

### 165) 전역 `@keyframes fadeIn` 충돌 제거

- **목적**: `App.css` / `CustomAlert.css` 동명 키프레임이 번들 순서로 덮어씌워 본문·어드민 탭까지 스케일 페이드되는 문제 제거
- **영향**: `CustomAlert.css` → `custom-alert-panel-in`, `App.css` → `app-main-fade-in`(opacity 전용), `Admin.css` 참조 갱신

### 166) 공유 설정 모달 라디오 정렬·간격

- **목적**: 라디오 세로 중앙·라벨과 간격 정리
- **영향**: `ShareSettingsModal.css`

### 167) 공유 설정 모달 콘텐츠 레이아웃 추가 조정

- **목적**: 옵션 카드 패딩·라벨 가로 배치 등 사용자 시안 반영
- **영향**: `ShareSettingsModal.css`

### 168) Decision(alert/confirm/prompt) 하단 버튼 패딩을 일반 모달과 통일

- **목적**: Decision 전용 8px 세로 패딩 제거, `4px 16px` 공통화·가로 `min-width: 100px` 유지
- **영향**: `DialogContext.module.scss`

#### 문서 변경
- `docs/modal-spec.md` §4 — 일반·Decision 공통 버튼 패딩·Decision `min-width`/정렬 명시

### 169) Decision 타이틀·본문 타이포를 공통 BaseModal과 통일

- **목적**: `decisionTitle`/`decisionMessage` 확대 제거 — 제목 `lg`, 본문 `sm` (`BaseModal`·`.message`와 동일 계층)
- **영향**: `DialogContext.jsx` / `DialogContext.module.scss`

#### 문서 변경
- `docs/modal-spec.md` §3 A — Decision 타이틀·본문 글자 크기 공통 기준 추가

### 170) Decision 버튼 글자 크기 `font-size-base`(높이 정렬)

- **목적**: `font-size-sm`만 강제되어 일반 모달 버튼(~14px)보다 높이가 낮게 보이던 문제 제거
- **영향**: `DialogContext.module.scss` `.decisionActions`

#### 문서 변경
- `docs/modal-spec.md` §4 — 버튼 글자 크기 `--font-size-base`(14px) 통일 문구

### 171) 필수 항목 별표 색상 전역 통일(`#ff0000`)

- **목적**: MUI `required` 별표·수동 라벨 `*` 동색 처리
- **영향**: `src/index.css` 토큰 `--color-required-asterisk`, `.MuiFormLabel-asterisk` / `.MuiInputLabel-asterisk` / `.required-asterisk`

#### JSX/JS 변경 (예외 기록)
- `AdminSemanticCategoryPage.jsx`, `AdminSemanticObjectPage.jsx`, `AdminSemanticRelationPage.jsx`, `AdminSemanticActionPage.jsx`, `FaqCreateModal.jsx`, `NoticeCreateModal.jsx`, `PromptFormDialog.jsx`, `EditPromptDialog.jsx` — 라벨 내 `*`를 `<span className="required-asterisk">`로 분리

### 172) 워크스페이스 이름 변경 모달 — 네이티브 입력 공통 스타일

- **목적**: MUI `TextField`(Outlined 플로팅 라벨) 대신 도메인 추가·FAQ 폼과 같은 라벨 상단 + 네이티브 입력 리듬으로 통일
- **영향**: 홈 워크스페이스 이름 변경만 변경

#### CSS 변경
- `src/index.css` — 공통 `.modal-native-field`(라벨·`input[type=text/password/email]` 포커스 링)

#### JSX/JS 변경 (예외 기록)
- `src/pages/Home.jsx` — `TextField` 제거, `modal-native-field` + `label`/`input`

### 173) 워크스페이스 이름 변경 모달 — 안내 문구 제거

- **목적**: 본문 상단 힌트(「변경하고자 하는 이름을 입력해주세요」) 제거로 레이아웃 단순화
- **영향**: 홈 워크스페이스 이름 변경 모달만 변경

#### CSS 변경
- `src/pages/Home.css` — `.home-rename-modal-hint` 제거

#### JSX/JS 변경 (예외 기록)
- `src/pages/Home.jsx` — 해당 `Typography` 블록 제거, 미사용 `Typography` import 정리

### 174) Decision(alert/confirm) 팝업 가로 — `min-width: 350px`만

- **목적**: MUI `Dialog` 기본 `width` / `max-width` 제거 후 최소 가로 350px만 적용(본문 너비에 맞게 확장)
- **영향**: `alert`·`confirm`만(`prompt`·일반 `BaseModal`은 변경 없음)

#### CSS 변경
- `src/context/DialogContext.module.scss` — `.decisionPaper`: 기존 `max-width: 488px` 제거, `width: auto`·`max-width: none`·`min-width: 350px`

#### JSX/JS 변경 (예외 기록)
- `src/context/DialogContext.jsx` — Decision일 때만 `maxWidth={false}`·`fullWidth={false}`로 MUI 용지 크기 규칙 비활성화

### 175) Decision(alert/confirm) `.decisionPaper` 최소 가로 390px

- **목적**: ### 174에서 정한 최소 가로 `350px`를 **`390px`**로 조정
- **영향**: `alert`·`confirm` 용지 최소 너비만 변경

#### CSS 변경
- `src/context/DialogContext.module.scss` — `.decisionPaper` `min-width: 390px`

### 176) 팝업 본문 폼 컨트롤 규격(`km-modal-form`)·`ModalFormField` 도입

- **목적**: 팝업에만 공통 입력·선택·MUI Outlined·체크/라디오 톤을 한 파일에서 유지보수하고, 필드 마크업은 `ModalFormField`로 통일할 수 있게 함
- **영향**: 전역 스타일 로드·홈 이름 변경·프롬프트 모달에 `km-modal-form` 적용(파일럿)

#### 문서
- `docs/modal-form-spec.md` — 신규
- `docs/modal-spec.md` — §9에서 `modal-form-spec` 링크

#### CSS 변경
- `src/styles/km-modal-form.css` — `.km-modal-form` 및 하위 규칙(네이티브·MUI·`.modal-input` 팝업 내 보정)
- `src/pages/Home.css` — `.modal-input--chunk-none` 제거(동일 규칙을 `km-modal-form`으로 이전)

#### JSX/JS 변경 (예외 기록)
- `src/main.jsx` — `km-modal-form.css` import
- `src/components/common/modal/ModalFormField.jsx`, `ModalFormField.module.scss` — 신규
- `src/pages/Home.jsx` — 워크스페이스 이름 변경·프롬프트 변경 모달 `contentClassName`에 `km-modal-form`

### 177) 홈「프롬프트 변경」모달 — 필드 카드 테두리 제거·그리드 간격 확대

- **목적**: `.home-prompt-field` 박스 테두리를 없애고 그리드 갭을 넓혀 블록 간 여백으로 가독성 확보; 네이티브 `select`는 포인터 커서로 조작감 명확화
- **영향**: 워크스페이스 프롬프트 변경 모달 레이아웃만 변경

#### CSS 변경
- `src/pages/Home.css` — `.home-prompt-modal-grid` `gap`을 `var(--spacing-lg)` × `var(--spacing-xl)`, 하단 여백 `var(--spacing-md)`; `.home-prompt-field` 테두리·배경·패딩 제거(플랫 스택)
- `src/styles/km-modal-form.css` — `.km-modal-form select:not(:disabled)` `cursor: pointer`

### 178) 홈「프롬프트 변경」— 라벨 스크린리더 전용·optgroup·select 크기

- **목적**: 상단 라벨을 시각적으로 숨기고 드롭다운 내 `optgroup`으로 필드명 노출; 네이티브 select 여백·최소 높이·NONE 버튼 높이 정렬
- **영향**: 워크스페이스 프롬프트 변경 모달만 변경

#### CSS 변경
- `src/pages/Home.css` — `.home-prompt-label` 시각 숨김; `.km-modal-form .home-prompt-modal-shell select.modal-input` 패딩·min-height; `.home-prompt-none-btn` min-height; 힌트 `font-size-xs`·상단 여백

#### JSX/JS 변경 (예외 기록)
- `src/pages/Home.jsx` — 각 `label`에 `htmlFor`, `select`에 `id`; 옵션을 `<optgroup label="…">`로 감쌈

### 179) 홈「프롬프트 변경」— ### 178 원복(라벨·옵션 구조)

- **목적**: 라벨 숨김 시 선택값만으로 항목 구분이 어렵다는 피드백 반영 — 상단 라벨 재표시, `optgroup` 제거, 프롬프트 전용 select 높이·패딩 오버라이드 및 NONE 버튼 min-height 제거
- **영향**: 워크스페이스 프롬프트 변경 모달만 변경

#### CSS 변경
- `src/pages/Home.css` — ### 178에서 바꾼 `.home-prompt-label`/셀렉트/NONE/힌트 규격을 ### 177 직후 상태로 되돌림

#### JSX/JS 변경 (예외 기록)
- `src/pages/Home.jsx` — `htmlFor`/`id`/`optgroup` 제거, 평탄한 `<option>` 목록으로 복구

### 180) 홈「프롬프트 변경」힌트 왼쪽 여백

- **목적**: `.home-prompt-hint` 본문 들여쓰기
- **영향**: 프롬프트 변경 모달 힌트만

#### CSS 변경
- `src/pages/Home.css` — `.home-prompt-hint` `margin-left: var(--spacing-sm)`(8px)

### 181) 팝업 네이티브 `select` 규격 적용(`km-modal-form`)

- **목적**: `modal-form-spec`대로 `select`를 input·textarea와 분리해 최소 높이·비대칭 우패딩·라인 높이 통일; 프롬프트 변경의 NONE 버튼 높이 정렬
- **영향**: `contentClassName`에 `km-modal-form`이 있는 모든 팝업의 네이티브 `select`; 홈 프롬프트 변경 NONE 버튼

#### CSS 변경
- `src/styles/km-modal-form.css` — `.km-modal-form select` 전용 블록; `select.modal-input` 오버라이드
- `src/pages/Home.css` — `.home-prompt-none-btn` `min-height`·`align-self`·`box-sizing`

#### 문서 변경
- `docs/modal-form-spec.md` — §6 네이티브 `select` 규격 문구 보강

### 182) 프롬프트 변경 셀렉트 — 컴팩트 높이·화살표 여백·목록 샘플 보강

- **목적**: 네이티브 select 세로 여백을 하단 버튼에 가깝게 줄이고, 우측 화살표 들러붙음 완화; API 목록이 짧을 때 UI용 샘플 코드로 드롭다운 항목 수 확보
- **영향**: `km-modal-form` 내 모든 네이티브 select; 홈 프롬프트 코드 fetch·청킹 NONE 버튼

#### CSS 변경
- `src/styles/km-modal-form.css` — `.km-modal-form select`·`select.modal-input` 패딩·line-height·min-height 조정
- `src/pages/Home.css` — `.home-prompt-none-btn` 높이를 셀렉트와 맞추도록 `min-height` 제거·세로 패딩 `spacing-xs`

#### JSX/JS 변경 (예외 기록)
- `src/pages/Home.jsx` — `mergePromptCodesForSelectUi`·`PROMPT_SELECT_UI_SAMPLES`, fetch 후 코드 배열 보강

#### 문서 변경
- `docs/modal-form-spec.md` — §6 select 세로·우패딩 설명 갱신

### 183) 팝업 폼 필드 UI 통일 — `radius-sm`·패딩·가이드 보강

- **목적**: 가이드(`modal-form-spec`)대로 `modal-native-field`·`km-modal-form`·동일 패턴 폼의 모서리·패딩·테두리를 한 계열로 맞춤; 과도한 라운드(`radius-md`) 완화
- **영향**: 팝업·전역 네이티브 한 줄 입력·도메인 추가·FAQ 생성 폼

#### CSS 변경
- `src/index.css` — `.modal-native-field` 입력 `border-radius` → `var(--radius-sm)`
- `src/styles/km-modal-form.css` — 네이티브 input·textarea·select·MUI Outlined·`.modal-input` 모두 `--radius-sm`; `select` 패딩을 한 줄 입력과 세로·좌 동일·우만 화살표 여유
- `src/pages/DomainSelection.css` — 도메인 추가 입력·에러 박스 `radius-sm`
- `src/components/FaqCreateModal.css` — `.faq-form-group` 필드 토큰화·`radius-sm`·패딩 정렬

#### 문서 변경
- `docs/modal-form-spec.md` — §4 토큰 표로 통일 기준 명시, §6 요약 정리

### 184) 전역 `.modal-input` 모서리 4px(`--radius-sm`) 통일

- **목적**: 프롬프트 변경 등 `class="modal-input"` 사용처가 레거시 `8px` 모서리를 쓰지 않도록, 한 줄 input(`.modal-native-field`)과 동일하게 **4px**
- **영향**: `.modal-input` 클래스를 쓰는 모든 select·입력(팝업 외 포함)

#### CSS 변경
- `src/index.css` — `.modal-input` `border-radius: var(--radius-sm)`, 테두리색 `var(--color-border)`

#### 문서 변경
- `docs/modal-form-spec.md` — 유지보수 문구에 `.modal-input` 명시

### 185) 프롬프트 변경 — 네이티브 select 제거·`KmModalSelect`(MUI)로 OS 무관 통일

- **목적**: 맥/윈도 등 OS별 펼침 UI 차이 제거; 트리거·화살표 여백·열린 목록을 토큰 기준으로 통일
- **영향**: 홈 워크스페이스 프롬프트 변경 모달 전 필드; 메뉴 패널 전역 클래스는 다른 화면 재사용 가능

#### CSS 변경
- `src/styles/km-modal-form.css` — `.km-modal-select-menu-paper` 및 메뉴 아이템 토큰 스타일

#### JSX/JS 변경 (예외 기록)
- `src/components/common/modal/KmModalSelect.jsx`, `KmModalSelect.module.scss` — 신규
- `src/pages/Home.jsx` — `<select>` → `KmModalSelect`

#### 문서 변경
- `docs/modal-form-spec.md` — §6 네이티브 select 지양·`KmModalSelect` 안내

### 186) 홈「프롬프트 변경」— 액션 영역 세로 여백·그리드 gap(32/48)

- **목적**: `DialogActions` 세로 패딩이 커서 하단 밴드가 ~100px에 가깝게 보이는 문제 완화; 2열 그리드는 열 32px·행 48px 토큰으로 정리
- **영향**: 프롬프트 변경 모달만

#### CSS 변경
- `src/pages/Home.css` — `.home-prompt-modal-actions` 세로 `var(--spacing-md)`(16px), 가로 `var(--spacing-lg)`(24px), `min-height: 0`; `.home-prompt-modal-grid` `gap: var(--spacing-xl) var(--spacing-2xl)`(행 32px · 열 48px)

### 187) 홈「프롬프트 변경」그리드 gap 행·열 수정

- **목적**: ### 186에서 `gap` 두 값이 행·열 의도와 반대로 적용된 것 수정(CSS `gap` 앞=행, 뒤=열)
- **영향**: `.home-prompt-modal-grid`만

#### CSS 변경
- `src/pages/Home.css` — `gap: var(--spacing-xl) var(--spacing-2xl)`(행 32px · 열 48px)

### 188) 홈「프롬프트 변경」— 그리드 gap 주석·액션 패딩 선택자 보강

- **목적**: `gap` 행·열 의미 주석으로 재오류 방지; `.km-base-modal-actions.home-prompt-modal-actions`로 하단 패딩 덮어쓰기 확실화
- **영향**: 프롬프트 변경 모달만

#### CSS 변경
- `src/pages/Home.css` — 위 선택자·그리드 주석

### 189) `KmModalSelect` 높이 38px·프롬프트 모달 `paperSx`(900×850)·`BaseModal` 확장

- **목적**: 셀렉트 트리거 높이 38px 고정; 프롬프트 변경 모달 가로 900·세로 상한 850px를 `Home.jsx` 상수로 조절 가능하게 함; `BaseModal`에 `paperSx` 지원
- **영향**: 모든 `BaseModal` 호출(선택 prop); 프롬프트 변경·`KmModalSelect`·청킹 NONE 버튼 높이

#### CSS 변경
- `src/components/common/modal/KmModalSelect.module.scss` — 트리거 38px
- `src/pages/Home.css` — `.home-prompt-modal-content` flex 스크롤; 미사용 `.home-prompt-modal` 블록 제거; NONE 버튼 `min-height: 38px`

#### JSX/JS 변경 (예외 기록)
- `src/components/common/modal/BaseModal.jsx` — `paperSx` → `PaperProps.sx`
- `src/pages/Home.jsx` — `PROMPT_MODAL_PAPER_SX`, 프롬프트 `BaseModal`에 `maxWidth={false}` `fullWidth={false}` `paperSx`

#### 문서 변경
- `docs/modal-spec.md` — §7 `paperSx` 안내

### 190) BaseModal 폼 공통 — `km-modal-form` 전반 적용·`<select>` → `KmModalSelect`

- **목적**: 프롬프트 변경 모달과 동일하게 팝업 본문에 `km-modal-form`을 두어 입력·셀렉트 규격 통일; OS별 네이티브 `<select>` 제거
- **영향**: `BaseModal`을 쓰는 편집·설정류 모달·글로벌 `DialogContext` 프롬프트; 목록/필터 바의 네이티브 `<select>`는 범위 제외

#### CSS 변경
- 없음(기존 `src/styles/km-modal-form.css` 활용)

#### JSX/JS 변경
- `src/components/common/modal/KmModalSelect.jsx` — `optionItems` `{ value, label, disabled? }`, `includeEmptyOption`, 선택적 `id`(라벨 연결), `inputProps.id`
- `src/context/DialogContext.jsx` — `type === 'prompt'`일 때만 콘텐츠에 `km-modal-form`
- `<select>` → `KmModalSelect`: `DbConnectionModal`, `ScheduledImportModal`, `FaqCreateModal`, `ReportCreationModal`, `AdminSemanticObjectPage`, `AdminSemanticCategoryPage`, `AdminSemanticActionPage`, `AdminSemanticRelationPage`, `AdminMemberManagement`
- `contentClassName`에 `km-modal-form` 병합: `ForgotPasswordModal`, `DomainSelection`, 프롬프트 `PromptFormDialog`·`EditPromptDialog`, `NoticeCreateModal`, `NoticeDetailModal`, `DictionaryView`(편집·이동 모달), `ReportResultModal`, `AddSourceModal`, `ReportGenerationModal`, `ShareSettingsModal`, `QnaCreateModal`, `QnaDetailModal`, `FaqDetailModal`, `AdminConfigManagement`(도움말), `AdminUpgradeRequests`, `NotebookDetail`(청킹·메타 모달) 등

### 191) 비밀번호 찾기 모달 — `ModalFormField`·네이티브 이메일 입력

- **목적**: `km-modal-form` + `modal-form-spec`에 맞춰 MUI `TextField` 제거, 라벨 상단·토큰 기반 한 줄 입력으로 다른 팝업 폼과 통일
- **영향**: 로그인 플로우「비밀번호 찾기」모달만

#### CSS 변경
- `src/components/ForgotPasswordModal.module.scss` — 안내 문단 `margin`·`font-family`를 토큰(`--font-family`)으로 정리

#### JSX/JS 변경 (예외 기록)
- `src/components/ForgotPasswordModal.jsx` — `ModalFormField` + `input type="email"`; 라벨「이메일」·필수 별표

### 192) 포커스 링·MUI primary를 `--color-accent`와 통일

- **목적**: 네이티브 입력 포커스(테두리·외곽 glow)와「메일 전송」등 primary 버튼 색이 서로 다르게 보이던 문제 완화 — MUI 기본 primary(#1976d2)와 `:root --color-accent`(#1a73e8) 불일치 제거, 포커스 링은 accent 기반 단일 토큰으로 유지보수
- **영향**: 전역 MUI `color="primary"` 컴포넌트; `.km-modal-form`·`.modal-native-field` 포커스

#### CSS 변경
- `src/index.css` — `--shadow-focus-input`(accent `color-mix`); `.modal-native-field` 포커스 `box-shadow`가 해당 변수 참조
- `src/styles/km-modal-form.css` — 네이티브·MUI Outlined 포커스 `box-shadow` → `var(--shadow-focus-input)`

#### JSX/JS 변경 (예외 기록)
- `src/main.jsx` — `palette.primary.main` `#1a73e8`, `dark` `#1557b0`

#### 문서 변경
- `docs/modal-form-spec.md` — 포커스 행에 `--shadow-focus-input` 안내

### 193) 비밀번호 찾기 — 필수 표시 제거·이메일 검증·포커스 토큰·전송 버튼 비활성

- **목적**: 단일 입력이라 필수 별표 제거; 형식 오류 시「메일 전송」비활성; 포커스 테두리·링은 `--color-accent`·`--shadow-focus-input`과 동일하게 보이도록 모듈에서 보강
- **영향**: `ForgotPasswordModal`만

#### CSS 변경
- `src/components/ForgotPasswordModal.module.scss` — `.emailInput` 기본 필드 토큰; `:global(.km-modal-form)` 하위 `:focus` / `:focus-visible`

#### JSX/JS 변경 (예외 기록)
- `src/components/ForgotPasswordModal.jsx` — `isValidEmail`; `ModalFormField` `required` 제거; 전송 버튼 `disabled={loading || !emailOk}`; API 요청 본문 `email.trim()`

### 194) `km-modal-form` 네이티브 포커스 — `!important`·`:invalid:focus` 보강

- **목적**: `type=email` 등으로 `:invalid`일 때 브라우저·다른 스타일이 `border-color`를 덮어 포커스 액센트가 취소선되어 보이던 문제 제거; MUI Dialog 하위에서도 공통 토큰 유지
- **영향**: `.km-modal-form` 안 모든 네이티브 `input`/`select`/`textarea` 포커스; MUI Outlined 포커스 `box-shadow`

#### CSS 변경
- `src/styles/km-modal-form.css` — `:focus`·`:focus-visible`에 `!important`; `:invalid:focus` 보강; `.MuiOutlinedInput-root.Mui-focused` `box-shadow`에 `!important`
- `src/components/ForgotPasswordModal.module.scss` — 동일 포커스 규칙에 `!important`, `:invalid:focus` 포함

#### 문서 변경
- `docs/modal-form-spec.md` — 포커스 행에 `!important`·`:invalid` 보강 설명

### 195) 도메인 관리 — 헤더와 검색 분리·`AdminPageHeader`·클라이언트 검색

- **목적**: 프롬프트 관리 등 다른 어드민 페이지와 동일하게 타이틀 행에는 액션 버튼만 두고, 검색은 헤더 아래 `admin-toolbar`로 옮겨 좁은 뷰포트에서 타이틀·우측 버튼 정렬이 흐트러지지 않게 함
- **영향**: `/admin/domains` 도메인 관리 목록 UI; 도메인명·설명·ArangoDB명 기준 클라이언트 필터; 목록 건수는 헤더 제목 옆 `(N)` 표시

#### CSS 변경
- `src/components/DomainManagement.css` — 미사용 `.domain-header`·`.domain-toolbar`·검색·`new-domain-btn` 블록 제거

#### JSX/JS 변경
- `src/components/DomainManagement.jsx` — `PageHeader` → `AdminPageHeader`; `admin-common.css` import; `admin-toolbar` + `admin-search` 행; `domainSearch`/`filteredDomains`; 빈 필터 시「검색 결과가 없습니다.」; 루트에 `admin-page` 클래스 병합

### 196) 도메인 추가/수정 팝업 — `BaseModal`·`km-modal-form`·`KmModalSelect` 공통화

- **목적**: 도메인 추가/수정 팝업이 기존 커스텀 오버레이/폼 스타일로 남아 있던 부분을 공통 모달 규격으로 통일해 페이지 간 모달 UI/폼 경험을 일관화
- **영향**: `/admin/domains`의 도메인 생성·수정 팝업 헤더/본문/푸터; 프롬프트 선택 셀렉트 UI; 중복확인/경고/오류 메시지 블록

#### CSS 변경
- `src/components/DomainManagement.css` — 구형 `.modal-*`/`.form-*`/`.btn-*` 스타일 제거, `domain-modal-content`·`domain-input-group`·`domain-prompt-grid`·`domain-info-note`·`domain-error-note` 등 `BaseModal` 기반 클래스 추가

#### JSX/JS 변경
- `src/components/DomainManagement.jsx` — 커스텀 모달 마크업 제거 후 `BaseModal` 적용(`contentClassName="km-modal-form"`), 필드 블록을 `ModalFormField`로 전환, 프롬프트 셀렉트를 네이티브 `<select>`에서 `KmModalSelect`로 교체, `handleSelectFieldChange`·`promptSelectConfigs`로 선택 필드 로직 공통화

### 197) 도메인 팝업 입력 필드 배경 통일(2열 가독성 개선)

- **목적**: 2열 프롬프트 영역이 복잡해 보이는 인상을 줄이기 위해 도메인 팝업 내부의 `input`/셀렉트(`KmModalSelect`) 배경을 동일한 흰색으로 통일
- **영향**: `/admin/domains` 도메인 생성·수정 팝업의 필드 시각 밀도 완화, 입력/선택 컨트롤 일관성 향상

#### CSS 변경
- `src/components/DomainManagement.css` — `.domain-modal-content` 범위에서 텍스트 입력과 `.MuiOutlinedInput-root` 배경을 `var(--color-bg-secondary)`로 강제 적용

### 198) 도메인 관리 로컬 더미 데이터 모드 추가

- **목적**: 테이블 디자인 작업 중 백엔드 연결 여부와 무관하게 도메인 관리 화면을 바로 확인할 수 있도록 로컬 더미 데이터 표시/편집 흐름 제공
- **영향**: `/admin/domains` 목록·도메인 생성/수정/삭제 흐름; 프롬프트 코드/기본값 조회 실패 시 폼 선택값 보장

#### CSS 변경
- 없음

#### JSX/JS 변경
- `src/components/DomainManagement.jsx` — `VITE_ENABLE_DOMAIN_MOCK` 플래그 도입, `/domains` 조회 실패 시 더미 도메인 fallback, 프롬프트 기본값/코드 fallback, mock 모드에서 생성·수정·삭제를 로컬 state로 처리
- `src/data/domainMockData.js` — 도메인 관리용 샘플 도메인/프롬프트 기본값/용도별 프롬프트 코드 더미 데이터 추가

## 2026-05-12

### 199) 도메인 선택 테이블 — `data-table-spec` 밀집·토큰 정렬

- **목적**: `docs/data-table-spec.md`의 밀집형 목록 규격에 맞춰 행·헤더 패딩과 타이포를 줄이고, 색·테두리·호버를 `:root` 토큰으로 통일
- **영향**: 어드민센터 도메인 선택(`/`) 목록 테이블·상단 안내 바·도메인 추가 버튼·삭제 버튼; 로딩 완료 후 목록이 비었을 때 안내 행 표시

#### CSS 변경
- `src/pages/DomainSelection.css` — `.domain-list-container`·`.domain-list-table` th/td를 토큰 기반 밀집 스타일로 변경; 선택 행 강조·호버·빈 목록 셀(`.domain-list-empty`); `.domain-add-btn`·`.user-info-bar`·`.delete-btn-small` 토큰화

#### JSX/JS 변경 (예외 기록)
- `src/pages/DomainSelection.jsx` — 테이블 래퍼에 `km-data-table-dense` 클래스; 선택/관리 열 `th` 정렬용 클래스; 빈 목록 시 `colSpan` 안내 행; 삭제 버튼 `type="button"`

### 200) 도메인 선택 테이블 — 행 높이(참고 레이아웃)·삭제 아이콘

- **목적**: 사용자 관리형 테이블과 유사하게 본문 행 높이를 약 40~44px대로 맞추고, 삭제는 빨간 stroke 휴지통 아이콘만 표시
- **영향**: 도메인 선택(`/`) 목록 행·헤더 세로 패딩·관리 열 폭; 삭제 중에는 `Loader2` 스피너

#### CSS 변경
- `src/pages/DomainSelection.css` — `th`/`td`에 `padding-block: calc(var(--spacing-sm) + 2px)`, `tbody td` `min-height: 44px`, `thead th` `min-height: 40px`; `.delete-btn-small` 제거 후 `.domain-delete-icon-btn`(36×36, 빨간 `currentColor`, 호버 배경)

#### JSX/JS 변경 (예외 기록)
- `src/pages/DomainSelection.jsx` — `lucide-react`의 `Trash2`·`Loader2`; 삭제 버튼 `title`/`aria-label`; 관리 열 `width` 52px

#### 문서 변경
- `docs/data-table-spec.md` — §3 밀집 행에 참고 행 높이(40~44px) 패턴 한 줄 추가

### 201) 도메인 선택 테이블 — 행·헤더 고정 높이, 이름 열 가로선 정렬, 관리 열 아이콘 정렬

- **목적**: `이름` 열이 인접 열과 가로 경계선이 어긋져 끊겨 보이던 현상 제거; 헤더·본문 행 높이를 요청값(35px / 43px)으로 통일; `관리` 헤더와 삭제 아이콘의 우측 정렬·세로 기준을 맞춤
- **영향**: 어드민센터 도메인 선택(`/`) 목록 테이블 레이아웃; 긴 이름·설명은 한 줄 말줄임

#### CSS 변경
- `src/pages/DomainSelection.css` — `table-layout: fixed`; `thead tr`/`th` 높이 35px, `tbody tr`/`td` 높이 43px·세로 패딩 0; `이름` 셀은 table-cell 유지·`.domain-list-name-inner`에 flex; 선택·관리 열 폭 56px / 68px로 `th`·`td` 일치; `.domain-list-desc` 말줄임; 빈 목록 행은 `tr:has(.domain-list-empty)`로 높이 자동, 셀은 높이 제한 해제

#### JSX/JS 변경 (예외 기록)
- `src/pages/DomainSelection.jsx` — 이름 셀 내용을 `.domain-list-name-inner`로 감쌈; 관리 열 `th`의 고정 `width` 속성 제거(CSS에서 통일)

### 202) 도메인 선택 테이블 — 관리 열 헤더·아이콘 우측 정렬 통일, 다중 액션 대비

- **목적**: `관리` 헤더는 우측 정렬인데 본문 아이콘이 셀 중앙에 가깝게 보이던 수평 어긋남 제거; 이후 편집 아이콘을 삭제 왼쪽에 두는 레이아웃과 동일한 우측 정렬 패턴 확보
- **영향**: 도메인 선택(`/`) 테이블 관리 열 폭·마크업; 다른 화면에서도 동일 클래스 재사용 시 편집+삭제 배치 가능

#### CSS 변경
- `src/pages/DomainSelection.css` — 관리 열 폭 108px(36+간격+36+패딩 여유); `.domain-list-actions-head`(헤더 라벨)·`.domain-list-actions`(본문 버튼 그룹)에 `display: flex`, `justify-content: flex-end`, `gap: var(--spacing-xs)`; 삭제 버튼 전용 `vertical-align` 보조 규칙 제거

#### JSX/JS 변경 (예외 기록)
- `src/pages/DomainSelection.jsx` — `th` 내 라벨을 `.domain-list-actions-head`로 감쌈; 액션 `td` 안에 `.domain-list-actions` 래퍼 추가(편집 버튼 삽입 위치)

### 203) 데이터 테이블 — 선택 열 옵션·카드 border·푸터(페이지네이션 중앙·우측 예약)

- **목적**: 화면별로 좌측 체크박스 열을 켜거나 끌 수 있게 공통 클래스·예시 상수 제공; 목록 카드는 그림자 대신 border로 통일; 하단은 페이지네이션을 **가운데**, 우측은 **추가 옵션용 빈 슬롯**을 확보한 3열 레이아웃으로 맞춤
- **영향**: 어드민 `admin-common.css` 테이블 블록; 도메인 선택 테이블 래퍼 그림자 제거; 사용자 관리 목록에 카드+페이지네이션+푸터 컴포넌트

#### CSS 변경
- `src/pages/admin/admin-common.css` — `.admin-table-card`(테이블+푸터 한 카드); `.admin-table-footer` 및 `__start`/`__center`/`__end`, `.admin-table-pagination`, `.admin-table-page-btn`, `.admin-table-page-ellipsis`; `.admin-th-select`/`.admin-td-select`(체크박스 열)
- `src/pages/DomainSelection.css` — `.domain-list-container`에서 `box-shadow` 제거(테두리만 유지)

#### JSX/JS 변경 (예외 기록)
- `src/components/admin/AdminTableFooter.jsx` — 신규(좌·중·우 슬롯)
- `src/pages/admin/AdminMemberManagement.jsx` — `SHOW_ROW_CHECKBOX_COLUMN` 상수·선택 상태·페이지 크기·`AdminTableFooter`·`admin-table-card`; 목록은 `paginatedMembers`로 분할

#### 문서 변경
- `docs/data-table-spec.md` — §6 선택 열 옵션, §9 푸터 3열·`AdminTableFooter`·`admin-table-card` 안내

### 204) 도메인 선택 테이블 — 헤더 배경 밝게 조정

- **목적**: 헤더 회색이 과하게 진해 테두리 대비가 약한 느낌을 줄임(이후 205에서 하단 이중선 의미 정정)
- **영향**: 어드민 도메인 선택(`/`) 목록 테이블만(전역 `--color-bg-dark` 미변경)

#### CSS 변경
- `src/pages/DomainSelection.css` — `th` 배경 `var(--color-bg-subtle)` 유지

#### JSX/JS 변경 (예외 기록)
- 없음

### 205) 도메인 선택 테이블 — 카드 **하단** 이중선 제거(의도 정정)

- **목적**: 사용자 피드백 반영 — "하단"은 **테이블 카드 맨 아래**가 마치 그림자·두꺼운 선처럼 보이던 현상; 마지막 행 `td`의 `border-bottom`과 `.domain-list-container`의 `border` 하단이 겹침. 204에서 적용했던 헤더·첫 행 경계 변경은 요청과 달라 **되돌림**(`th`에 `border-bottom` 복구, `tbody tr:first-child td`의 `border-top` 제거)
- **영향**: 도메인 선택(`/`) 목록 테이블 외곽 하단만 시각적으로 한 줄로 정리

#### CSS 변경
- `src/pages/DomainSelection.css` — `tbody tr:last-child td { border-bottom: none }`; `th`의 `border-bottom: 1px solid var(--color-border-subtle)` 복구; `tbody tr:first-child td`의 `border-top` 규칙 삭제

#### JSX/JS 변경 (예외 기록)
- 없음

### 206) 도메인 선택 테이블 — 헤더 배경을 행 hover와 동일 토큰으로 통일

- **목적**: 헤더 영역 배경을 본문 행에 마우스를 올렸을 때와 같은 회색 톤(`--color-bg-hover`)으로 맞춤
- **영향**: 도메인 선택(`/`) 테이블 `th`만

#### CSS 변경
- `src/pages/DomainSelection.css` — `.domain-list-table th`의 `background`를 `var(--color-bg-hover)`로 변경

#### JSX/JS 변경 (예외 기록)
- 없음

### 207) 도메인 선택 테이블 — 선택 행 배경색 `#ebf2ff`

- **목적**: 현재 선택된 도메인 행 배경을 지정 색으로 통일
- **영향**: 도메인 선택(`/`) 목록에서 `tr.domain-selected` 본문 셀(호버 포함)

#### CSS 변경
- `src/pages/DomainSelection.css` — `.domain-selected td`, `.domain-list-row.domain-selected:hover td`의 `background`를 `#ebf2ff`로 변경

#### JSX/JS 변경 (예외 기록)
- 없음

### 208) 테이블 UI 개발 가이드 정의·`data-table-spec` 연동 및 목록 표 공통화 적용

- **목적**: 팀 공통 **테이블 마크업·밀도·헤더 정렬·액션 열·페이지네이션·열 리사이즈**를 문서와 코드로 고정하고, 어드민·도메인 선택 등 목록 화면에 동일 패턴 적용; 워크스페이스 표는 **헤더 `sticky` 미사용**(일반 `thead` 흐름); 상단 `km-main-sticky-head`는 **하단 margin/padding·하단 box-shadow 제거**로 본문과 간격 정리
- **영향**: `docs` 테이블 규격·가이드; `admin-common` 및 도메인/워크스페이스/사용자 관리·도메인 선택 등; 메인 레이아웃 sticky 헤더 블록; Cursor 규칙(`table-ui-pitfalls`, `km-table-actions-ui`, `ui-history-on-request`)

#### 문서 변경
- `docs/dev-guide-table-ui.md` — 신규(피해야 할 패턴, 체크리스트, `useResizableColumns` 안내, `dev-guide` ↔ `data-table-spec` 연계)
- `docs/data-table-spec.md` — 규격 보강(기존 199~207·203 등과 맞물림)
- `docs/css-design-tokens.md` — 테이블·스크롤 등 토큰 정리 보조
- `docs/ui-system-outline.md`, `docs/mockup-guide.md`, `docs/modal-migration-plan.md` — 개요·교차 참조 소폭
- `docs/ui-history_.md` — 삭제(중복·폐기)
- `.cursor/rules/ui-history-always.mdc` — 삭제(요청 시만 `ui-history` 갱신으로 전환)
- `.cursor/rules/ui-history-on-request.mdc`, `.cursor/rules/table-ui-pitfalls.mdc`, `.cursor/rules/km-table-actions-ui.mdc`, `.cursor/rules/workflow-confirm-before-implement.mdc` — 추가

#### CSS·전역 스타일
- `src/pages/admin/admin-common.css` — 테이블 카드·랩·푸터·페이지네이션·체크박스 열·프롬프트 태그·열 리사이즈 핸들 등 확장
- `src/styles/km-scrollbar-thin.css`, `src/styles/km-table-icon-actions.css` — 신규
- `src/index.css` — 스크롤·테이블 액션·sticky thead 오프셋 등 토큰
- `src/App.css`, `src/pages/Admin.css`, `src/main.jsx` — 전역 연동
- `src/components/common/MainLayout.css` — `km-main-sticky-head` 하단 여백·그림자 제거, 본문 스크롤·브레이크포인트 등 정리
- `src/pages/DomainSelection.css`, `src/components/DomainManagement.css`, `src/pages/admin/AdminWorkspaceManagement.css`, `src/pages/admin/AdminMemberManagement.css` — 밀집 표·카드·열·액션 정렬

#### JSX/JS 변경
- `src/hooks/useResizableColumns.jsx` — 신규
- `src/components/admin/AdminTableFooter.jsx` — 신규
- `src/data/workspaceMockData.js`, `src/data/memberMockData.js` — 신규(목업)
- `src/pages/admin/AdminWorkspaceManagement.jsx`, `AdminMemberManagement.jsx`, `src/components/DomainManagement.jsx`, `src/pages/DomainSelection.jsx` — 공통 테이블 패턴·목업·푸터·리사이즈 등
- `src/components/common/MainLayout.jsx`, `src/App.jsx` — 레이아웃·import 보조
- 기타 목록성 페이지(`NoticeList`, `QnaBoard`, `Faq`, 프롬프트 목록 등) — 상단 sticky 블록·표기 소폭

#### 기타
- `src/components/common/modal/BaseModal.module.scss`, `src/context/DialogContext.module.scss` — 모달과 병행된 UI 정리
- `NotebookDetail`, `KnowledgeGraphModal`, 어드민 설정 등 — 동일 브랜치 내 소폭 스타일/마크업 조정

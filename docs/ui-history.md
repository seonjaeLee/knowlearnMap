# UI 작업 히스토리

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

#### 히스토리 작성 원칙 (이후 작업)
- UI·CSS 튜닝 요청은 **`docs/ui-history.md`에 항목 번호(### N) + 필요 시 표(NB- 접두 반복 가능)** 로 남김  
- 되돌림 요청은 **항목 번호 또는 표 번호**로 지정 가능하도록 유지

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

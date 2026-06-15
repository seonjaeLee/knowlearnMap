# 프롬프트 관리 UI 리디자인 — 에이전트·구현 SSOT (2026-06~)

> **디자인 기준:** 사용자가 첨부한 **목업 PNG** (Figma/스크린샷). `react-dev/`·과거 MUI 화면은 **SSOT 아님**.  
> **기술 기준:** MUI 제거 → KL 패턴 (`.cursor/rules/handoff-prompt-no-mui.mdc`)  
> **진행 방식:** `.cursor/rules/workflow-confirm-before-implement.mdc` — **아래 §0을 반드시 따른다.**

---

## §0. 작업 전·후 필수 (반복 실수 방지)

> **원칙 (2026-06):** 디자인이 제공된 화면은 **디자인과 동일하게** 구현한다. **임의로 작업하지 않는다.**  
> 에이전트 규칙: `.cursor/rules/design-mockup-fidelity.mdc`

### 구현 전 — 코드 손대기 전에 할 일

1. **목업(또는 사용자 스크린샷)과 현재 화면을 항목별로 대조**한다.
2. **작업 계획을 텍스트로 공유**한다. 최소 포함:
   - 바꿀 **파일 경로**
   - **마크업·className** 변경 요약
   - **하지 않을 것** (목업에 없는 기능·스타일)
3. 사용자 **「진행해」「컨펌」「적용해」** 등 **명시적 확인 후에만** 패치한다.
4. 질문·방향 정리 턴에는 **코드 수정 금지**.

### 구현 중 — 금지

| 금지 | 이유 (실제로 잘못했던 것) |
|------|---------------------------|
| 목업에 **없는 UI·스타일** 추가 (배경, shadow, hover 배경, **코드 복사** 버튼 등) | 사용자가 디자인에 없다고 지적 (예: **툴바 배경 없는데 `background` 추가**) |
| **아이콘·순서·구분선** 임의 변경 | 목업과 다른 툴바 (Trash/Maximize2 등) |
| **기존 기능 제거** (붙여넣기·변수체크·탭 전환 등) | 스타일 작업 시 로직·핸들러 삭제 금지 |
| 뱃지 **텍스트에 시맨틱 색** 적용 | 목업은 **점만 색**, 텍스트는 동일 회색 |
| 「비슷하면 됨」으로 **임의 해석** | 픽셀·레이아웃 불일치 반복 |
| 컨펌 없이 **범위 확대** (토큰·다른 화면·로직) | `workflow-confirm-before-implement` 위반 |
| MUI `@mui/material` · `@mui/icons-material` **신규 import** | MUI 제거 합의 |
| 완료 전 **「맞췄다」** 단정 | 스크린샷 검증 없이 통과시킴 |

### 구현 후

- 사용자에게 **강력 새로고침** 후 확인 요청.
- 어긋난 항목은 **스크린샷 기준**으로만 수정. 추측으로 다시 바꾸지 않는다.

---

## §1. 화면 범위

| 화면 | 경로(대표) | 상태 |
|------|------------|------|
| 목록 | `prompt/components/prompts/PromptList.jsx` | 일부 이관 |
| **상세** | `prompt/components/prompts/PromptDetail.jsx` + `EditorTab` | **진행 중** — 목업 SSOT |
| History 탭 | `prompt/components/history/HistoryTab.jsx` | MUI 잔존 |
| 테스트 | `prompt/components/test/TestTab.jsx` | MUI 잔존 |

상세 mock 데이터: `react/src/data/promptVersionMockData.js` — `DEFAULT_SCHEMA_ANALYSIS`

---

## §2. 상세 페이지 — 목업 스펙 (확정·컨펌된 항목)

### 2.1 헤더 (콘텐츠 타이틀)

| 요소 | 목업 |
|------|------|
| 뒤로가기 | **28px** 흰 박스 + `1px` 테두리 + `radius-sm` + 안에 `<` chevron |
| 제목 | `프롬프트 관리` (PageHeader `.page-header-title`) |
| 부가 | `어드민센터` (breadcrumb, 작은 회색) |

CSS: `PromptDetail.css` — `.prompt-detail-back`

### 2.2 메타 카드 (상단 정보란)

**한 줄:** `이름` 값 `|` `코드` 박스 `뱃지들`  
**다음 줄:** 설명 문구

| 요소 | 목업 |
|------|------|
| 구분선 | `\|` 세로 구분 (`prompt-detail-meta-sep`) |
| 코드 | **테두리만** · 배경 **없음** · `코드` 라벨 + monospace 값 · 높이 **26px** |
| 코드 복사 | **없음** — 추가 금지 |
| 카드 | 흰 배경 · **테두리 없음** · shadow 없음 · padding **12px 16px** |
| 뱃지 | **테두리** `rounded-sm` · 높이 **26px** · **6px 점만** 색 · 텍스트 `--color-text-secondary` · weight **normal** |

클래스: `.prompt-detail-bordered-badge`, `.prompt-detail-meta-code-box`

### 2.3 탭 행

- `Editor` | `History` — 투명 배경, 활성 탭 밑줄
- 우측: `배포 (PUBLISH)` — `kl-btn primary-full md`

### 2.4 Editor 본문 (SplitPane)

- 좌: 버전 히스토리 카드 (`VersionHistoryPanel`)
- 우: 에디터 카드 (`PromptEditTabs` `variant="detail"`)

에디터·버전 패널 세부는 **별도 목업 스크린샷 컨펌 후** §3에 추가한다. (임의 구현 금지)

---

## §3. 에디터 카드 (우측 · 목업 확정)

### 3.1 헤더

| 요소 | 목업 |
|------|------|
| 제목 | `프롬프트 편집` — accent 색, 밑줄 없음 |
| 구분 | `\|` 후 변수 pill |
| 변수 pill | 테두리 pill · **점만 색**(! / ✓) · 텍스트 `--color-text-secondary` |
| rule / max_length | 빨간 점 + `!` |
| lang | 초록 점 + `✓` |
| 우측 아이콘 5개 | 포커스(Scan) · 복사 · 삭제 · 메뉴 · 확장 — ghost |

### 3.2 본문·푸터

| 요소 | 목업 |
|------|------|
| textarea | accent 틴트 얇은 테두리 · flex 높이 채움 |
| 배포내용 | 한 줄 input · placeholder `배포내용 설명(버전 : v2)` |
| 버튼 | `저장 (DRAFT)` outline · `테스트` solid — `kl-btn` |

변수 탭 placeholder: `{{varKey}} 변수 값을 입력하세요 (길어도 됩니다)`

### 3.3 버전 패널 (미완)

- [ ] 행색·라디오·`<<` 접기 — 목업 컨펌 후

---

## §4. 관련 파일

| 역할 | 경로 |
|------|------|
| 상세 페이지 | `react/src/prompt/components/prompts/PromptDetail.jsx` |
| 상세 CSS | `react/src/prompt/components/prompts/PromptDetail.css` |
| 에디터 탭 | `react/src/prompt/components/common/PromptEditTabs.jsx` |
| 에디터 CSS | `react/src/prompt/components/common/PromptEditTabs.css` |
| SplitPane 본문 | `react/src/prompt/components/editor/EditorTab.jsx` |
| 버전 패널 | `react/src/prompt/components/common/VersionHistoryPanel.jsx` |
| MUI 제거 규칙 | `.cursor/rules/handoff-prompt-no-mui.mdc` |
| 컨펌 후 구현 | `.cursor/rules/workflow-confirm-before-implement.mdc` |
| 전역 UI | `react/docs/kl-ui-guide.md` |

---

## §5. 에이전트 체크리스트 (PR·턴 종료 전)

- [ ] §0 — 구현 **전** 계획 공유·컨펌 받았는가?
- [ ] 목업에 **없는** 버튼·기능을 넣지 않았는가?
- [ ] MUI import를 **추가**하지 않았는가?
- [ ] 토큰 파일 수정은 **컨펌** 후인가?
- [ ] `ui-history*` 에 **임의 기록**하지 않았는가? (사용자 요청 시만)

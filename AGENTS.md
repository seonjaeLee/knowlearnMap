# Cursor / 에이전트 안내 (knowlearnMap)

## 진행 중 — 프롬프트 관리 MUI 제거 + 목업 SSOT (2026-06~)

프롬프트 UI(`react/src/prompt/**`)는 **MUI 없이** KL 패턴으로 통일하고, **첨부 목업 PNG**에 맞춘다.

**작업 순서 (필수):**

1. **`.cursor/rules/design-mockup-fidelity.mdc`** — 디자인 제공 화면 = **목업과 동일**, 임의 배경·아이콘·UI 추가 금지
2. **`react/docs/mockup-checklist-prompt-management-redesign.md` §0** — 계획 공유 → **사용자 컨펌** → 구현 (`.cursor/rules/workflow-confirm-before-implement.mdc`)
3. **`.cursor/rules/handoff-prompt-no-mui.mdc`** — MUI 금지·메타 카드 스펙
4. 목업에 **없는 기능·스타일 추가 금지** (코드 복사, 툴바 배경 등) · 뱃지는 **점만 색**

참조 코드: `PromptDetail.jsx`, `PromptEditTabs.jsx` (detail), `VersionHistoryPanel.jsx`, `EditorTab.jsx`

## 진행 중 — 모달 UI 일괄 이관 (2026-05-23~)

전체 메뉴(**`NotebookDetail` 포함**)의 **`BaseModal` 팝업** 마크업·클래스를 `modal-guide` · `ReportGenerationModal` 패턴으로 통일하는 작업이다.

새 채팅에서 팝업 UI를 다룰 때:

1. **`.cursor/rules/handoff-modal-ui-rollout.mdc`** 를 먼저 읽는다.
2. SSOT: `react/docs/modal-guide.md`, `react/docs/kl-ui-guide.md`
3. 참조 구현: `react/src/components/ReportGenerationModal.jsx`

`docs/` 일기: `react/docs/ui-history2.md` (사용자 요청 시만 갱신).

## 기타 규칙

- `.cursor/rules/` — 토큰, 컨펌 후 구현, CSS 아키텍처 등
- `react/docs/README.md` — UI 문서 인덱스

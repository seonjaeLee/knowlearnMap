# Cursor / 에이전트 안내 (knowlearnMap)

## 진행 중 — 모달 UI 일괄 이관 (2026-05-23~)

**`NotebookDetail` 제외**, 전체 메뉴의 **`BaseModal` 팝업** 마크업·클래스를 `modal-guide` · `ReportGenerationModal` 패턴으로 통일하는 작업이다.

새 채팅에서 팝업 UI를 다룰 때:

1. **`.cursor/rules/handoff-modal-ui-rollout.mdc`** 를 먼저 읽는다.
2. SSOT: `react/docs/modal-guide.md`, `react/docs/kl-ui-guide.md`
3. 참조 구현: `react/src/components/ReportGenerationModal.jsx`

`docs/` 일기: `react/docs/ui-history2.md` (사용자 요청 시만 갱신).

## 기타 규칙

- `.cursor/rules/` — 토큰, 컨펌 후 구현, CSS 아키텍처 등
- `react/docs/README.md` — UI 문서 인덱스

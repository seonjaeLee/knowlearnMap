# UI/UX 문서 (`react/docs`)

| 파일 | 용도 |
|------|------|
| **[kl-ui-guide.md](./kl-ui-guide.md)** | **UI 설계·사용 가이드 전체** — 토큰, 폼, 버튼, 목록, 표, 툴팁, 이관 규칙. 구현·리뷰 시 **먼저 읽기**. |
| **[modal-guide.md](./modal-guide.md)** | **모달 전용** — `BaseModal`, `useDialog`, `kl-modal-form`, **§9 공통 팝업 구성 체크리스트**, 마이그레이션. |
| **[mockup-checklist-prompt-management-redesign.md](./mockup-checklist-prompt-management-redesign.md)** | **프롬프트 관리 리디자인 SSOT** — §0 컨펌 후 구현 · 목업 스펙 · 금지 사항(복사 버튼·뱃지 색 등). **프롬프트 UI 작업 시 필수.** |
| **[mockup-guide.md](./mockup-guide.md)** | 목업 작성 가이드 · **§10 구현 담당(에이전트) 필수 순서** |
| **인수인계 (모달 UI 이관)** | **`.cursor/rules/handoff-modal-ui-rollout.mdc`** · [`AGENTS.md`](../../AGENTS.md) — 전 메뉴·NotebookDetail 포함 BaseModal |
| **인수인계 (프롬프트 MUI 제거)** | **`.cursor/rules/handoff-prompt-no-mui.mdc`** · 위 mockup-checklist §0 |
| **[ui-history3.md](./ui-history3.md)** | 작업 **일기**(현행). 사용자·에이전트 협업 기록. **요청 시만** 갱신. |
| **[ui-history2.md](./ui-history2.md)** | 작업 일기 (2026-05-16~). |
| **[ui-history.md](./ui-history.md)** | 작업 일기 **아카이브**. |

## 참고

- **에이전트·구현:** 가이드 본문은 `kl-ui-guide.md` 한 파일. 에디터 **찾기(Cmd+F)** 로 항목 검색.
- **일기(`ui-history*`):** remote 배포·공유 범위에서 **제외**하는 것을 권장 (로컬 협업용).
- **구현 전 컨펌 (필수):** `.cursor/rules/workflow-confirm-before-implement.mdc` — **계획 공유 → 사용자 컨펌 → 구현**. **디자인 제공 화면 = 목업 동일** (`.cursor/rules/design-mockup-fidelity.mdc`). 목업 임의 해석·기능·스타일 추가 금지.
- **CSS 구조(Map 마더):** `.cursor/rules/kl-css-architecture.mdc` · 전역 진입 `react/src/assets/styles/global.css` (`tokens/` · `kit/` …)
- **Cursor:** 토큰 `.cursor/rules/ui-ux-design-tokens.mdc` · 표 `.cursor/rules/table-ui-pitfalls.mdc` · 히스토리 `.cursor/rules/ui-history-on-request.mdc`

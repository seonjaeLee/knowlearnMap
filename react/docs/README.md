# UI/UX 문서 (`react/docs`)

| 파일 | 용도 |
|------|------|
| **[kl-ui-guide.md](./kl-ui-guide.md)** | **UI 설계·사용 가이드 전체** — 토큰, 폼, 버튼, 목록, 표, 툴팁, 이관 규칙. 구현·리뷰 시 **먼저 읽기**. |
| **[modal-guide.md](./modal-guide.md)** | **모달 전용** — `BaseModal`, `useDialog`, `kl-modal-form`, 레이아웃·마이그레이션. |
| **[ui-history2.md](./ui-history2.md)** | 작업 **일기**(현행). 사용자·에이전트 협업 기록. **요청 시만** 갱신. |
| **[ui-history.md](./ui-history.md)** | 작업 일기 **아카이브**. |

## 참고

- **에이전트·구현:** 가이드 본문은 `kl-ui-guide.md` 한 파일. 에디터 **찾기(Cmd+F)** 로 항목 검색.
- **일기(`ui-history*`):** remote 배포·공유 범위에서 **제외**하는 것을 권장 (로컬 협업용).
- **구현 전 컨펌:** `.cursor/rules/workflow-confirm-before-implement.mdc`
- **CSS 구조(Map 마더):** `.cursor/rules/kl-css-architecture.mdc` · 전역 진입 `react/src/assets/styles/global.css` (`tokens/` · `kit/` …)
- **Cursor:** 토큰 `.cursor/rules/ui-ux-design-tokens.mdc` · 표 `.cursor/rules/table-ui-pitfalls.mdc` · 히스토리 `.cursor/rules/ui-history-on-request.mdc`

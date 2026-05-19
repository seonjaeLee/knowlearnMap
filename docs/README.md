# UI/UX 문서 인덱스

프로젝트 UI 규격·가이드의 **진입점**입니다. 코드를 한꺼번에 갈아엎지 않고, [이관 정책](./governance/migration-policy.md)에 따라 **손대는 화면만** 표준으로 맞춥니다.

---

## 문서 카테고리

| 폴더 | 목적 | 대표 문서 |
|------|------|-----------|
| **[foundation/](./foundation/)** | 토큰·앱 레이아웃·전역 기준 | [design-tokens.md](./foundation/design-tokens.md), [layout-guideline.md](./foundation/layout-guideline.md) |
| **[governance/](./governance/)** | 무엇을 쓸지·언제 이관할지 | [migration-policy.md](./governance/migration-policy.md), [component-registry.md](./governance/component-registry.md) |
| **[surface/](./surface/)** | **본문(Page)** — 툴바·폼·버튼·목록 chrome | [list-page-spec.md](./surface/list-page-spec.md), [form-spec.md](./surface/form-spec.md), [button-spec.md](./surface/button-spec.md) |
| **[table/](./table/)** | 데이터 표 (`BasicTable`) | [data-table-spec.md](./table/data-table-spec.md), [dev-guide-table-ui.md](./table/dev-guide-table-ui.md) |
| **[overlay/](./overlay/)** | **모달(Overlay)** — `BaseModal`, Decision, 폼 | [modal-spec.md](./overlay/modal-spec.md), [modal-form-spec.md](./overlay/modal-form-spec.md) |
| **[components/](./components/)** | 복합 UI 패턴(분할 패널 등) | [split-pane.md](./components/split-pane.md) |
| **[mockup/](./mockup/)** | 목업·체크리스트 | [guide.md](./mockup/guide.md) |
| **[history/](./history/)** | 작업 이력 | [ui-history2.md](./history/ui-history2.md) (**현행 기록**), [ui-history.md](./history/ui-history.md) (아카이브) |

---

## 빠른 찾기 (하려는 일 → 문서)

| 하려는 일 | 문서 |
|-----------|------|
| 색·간격·`:root` 토큰 | [foundation/design-tokens.md](./foundation/design-tokens.md) → `src/index.css` |
| 목록 화면 (제목 + 툴바 + 표) | [surface/list-page-spec.md](./surface/list-page-spec.md) + [table/dev-guide-table-ui.md](./table/dev-guide-table-ui.md) |
| 본문 input / select / textarea | [surface/form-spec.md](./surface/form-spec.md) |
| 본문 버튼·툴바 버튼 | [surface/button-spec.md](./surface/button-spec.md) |
| 모달 껍데기·alert/confirm | [overlay/modal-spec.md](./overlay/modal-spec.md) |
| 모달 안 폼 필드 | [overlay/modal-form-spec.md](./overlay/modal-form-spec.md) |
| 지금 뭐 써도 되나 / 레거시 | [governance/component-registry.md](./governance/component-registry.md) |
| 이관 규칙 (전면 교체 금지) | [governance/migration-policy.md](./governance/migration-policy.md) |
| 작업 기록 남기기 | [history/ui-history2.md](./history/ui-history2.md) (**요청 시만**, [history/README.md](./history/README.md) 참고) |

---

## Surface vs Overlay (이원 구조)

같은 **디자인 토큰·상태**(기본/hover/focus/disabled/readonly)를 쓰고, **레이아웃 바구니·권장 컴포넌트**만 나눕니다.

```
foundation/design-tokens (:root)
         │
    ┌────┴────┐
    ▼         ▼
 Surface     Overlay
 (본문·툴바)   (BaseModal·Dialog)
 surface/*    overlay/*
```

- **Surface**: `kl-page`, `table-toolbar`, `search-area`, `basic-table-shell`, `kl-btn` …
- **Overlay**: `BaseModal`, `kl-modal-form`, `KlModalSelect`, MUI `Button` in `actions` …

---

## 권장 작업 순서 (코드)

1. [governance/component-registry.md](./governance/component-registry.md)에서 표준 확인  
2. 해당 **Surface** 또는 **Overlay** spec 읽기  
3. [governance/migration-policy.md](./governance/migration-policy.md) — **해당 파일만** 이관  
4. (선택) 사용자 요청 시 [history/ui-history2.md](./history/ui-history2.md)에 기록  

**예정 백로그(문서만, 코드는 별도):** BasicTable 미적용 목록(`PromptList` 등) → registry §백로그 참고.

---

## 레거시 경로

2026-05-19 문서 재구성 이전 경로(`docs/list-page-spec.md` 등)는 루트 **리다이렉트 스텁**을 두었습니다. 북마크·외부 링크는 [본 README](./README.md) 또는 해당 폴더 문서로 갱신하는 것을 권장합니다.

| 이전 | 현재 |
|------|------|
| `docs/ui-system-outline.md` | 본 README + [governance/](./governance/) |
| `docs/css-design-tokens.md` | [foundation/design-tokens.md](./foundation/design-tokens.md) |
| `docs/ui-history.md` | [history/ui-history.md](./history/ui-history.md) |
| `docs/ui-history2.md` | [history/ui-history2.md](./history/ui-history2.md) |

---

## Cursor 규칙

- 토큰: `.cursor/rules/ui-ux-design-tokens.mdc`
- 테이블: `.cursor/rules/table-ui-pitfalls.mdc`, `kl-table-actions-ui.mdc`
- 히스토리: `.cursor/rules/ui-history-on-request.mdc`
- 구현 컨펌: `.cursor/rules/workflow-confirm-before-implement.mdc`

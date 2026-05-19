# UI 컴포넌트·패턴 레지스트리

**무엇을 써야 하는지**, **레거시는 어디까지 허용하는지**의 단일 표입니다.  
신규·수정 시 **표준**만 추가하고, 레거시는 **해당 파일을 열 때만** [migration-policy.md](./migration-policy.md)에 따라 이관합니다.

**관련:** [migration-policy.md](./migration-policy.md) · [../README.md](../README.md)

---

## 범례

| 상태 | 의미 |
|------|------|
| **표준** | 신규·수정 시 사용 |
| **레거시** | 기존 유지 가능, 신규 추가 금지, 손댈 때 이관 |
| **예외** | 특수 UI — registry에 사유 명시, 무리한 통일 금지 |

---

## Surface (본문·Page)

| UI | 표준 | 레거시 | 문서 |
|----|------|--------|------|
| 페이지 래퍼 | `kl-page`, `kl-page-header`, `kl-page-title` | — | [../surface/list-page-spec.md](../surface/list-page-spec.md) |
| 목록 툴바 | `table-toolbar`, `search-area` | — | [../surface/list-page-spec.md](../surface/list-page-spec.md) |
| 본문 input/textarea | `kl-form-control` + `kl-form-control.css` | 인라인 스타일 | [../surface/form-spec.md](../surface/form-spec.md) |
| 본문 select | `KlSelect` (도입 예정) | `.toolbar-select`, 네이티브 `<select>` | [../surface/form-spec.md](../surface/form-spec.md) |
| 본문 버튼 | `kl-btn` 계열 | MUI `Button` on page (가급적 이관) | [../surface/button-spec.md](../surface/button-spec.md) |
| 데이터 표 | `BasicTable` + `basic-table-shell` | MUI `Table` 직접, `admin-table` | [../table/data-table-spec.md](../table/data-table-spec.md) |
| 빈 목록 | `TableEmptyState` (thead 유지 개선 예정) | `solo`로 thead 사라짐 | [../table/dev-guide-table-ui.md](../table/dev-guide-table-ui.md) |

---

## Overlay (모달)

| UI | 표준 | 레거시 | 문서 |
|----|------|--------|------|
| 모달 껍데기 | `BaseModal` | MUI `Dialog` 직접 | [../overlay/modal-spec.md](../overlay/modal-spec.md) |
| alert/confirm/prompt | `useDialog` | `window.alert` 등 | [../overlay/modal-spec.md](../overlay/modal-spec.md) |
| 모달 폼 레이아웃 | `kl-modal-form`, `*-form-row` | — | [../overlay/modal-form-spec.md](../overlay/modal-form-spec.md) |
| 모달 select | `KlModalSelect` | 네이티브 `<select>` in modal | [../overlay/modal-form-spec.md](../overlay/modal-form-spec.md) |
| 모달 버튼 | MUI `Button` in `actions` | — | [../overlay/modal-spec.md](../overlay/modal-spec.md) |
| 모달 paper 520px | `supportFormModalPaperSx` 등 | — | `src/components/common/modal/supportCsModalPaper.js` |

---

## 공통·기반

| 항목 | 위치 | 문서 |
|------|------|------|
| 디자인 토큰 | `src/index.css` `:root` | [../foundation/design-tokens.md](../foundation/design-tokens.md) |
| 컨트롤 토큰 | `src/styles/kl-form-control.css` | [../surface/form-spec.md](../surface/form-spec.md) |
| 앱 레이아웃 | Admin shell, sidebar | [../foundation/layout-guideline.md](../foundation/layout-guideline.md) |
| 분할 패널 | `SplitPane` 패턴 | [../components/split-pane.md](../components/split-pane.md) |

---

## 코드 위치 (빠른 참조)

| 컴포넌트 | 경로 |
|----------|------|
| `BasicTable` | `src/components/common/BasicTable.jsx` |
| `TableEmptyState` | `src/components/common/TableEmptyState/` |
| `BaseModal` | `src/components/common/modal/BaseModal.jsx` |
| `KlModalSelect` | `src/components/common/modal/KlModalSelect.jsx` |
| `useDialog` | `src/hooks/useDialog.js` (또는 프로젝트 내 동일 역할) |

---

## 백로그 (구분 A — 표 이관)

공통 레이아웃 이후 **한 화면씩**. 상세는 [migration-policy.md §5](./migration-policy.md).

| 우선순위 | 파일 | 현재 | 목표 |
|:---:|------|------|------|
| 1 | ~~`src/prompt/components/prompts/PromptList.jsx`~~ | ~~MUI `Table`~~ | ✅ `BasicTable` (2026-05-19) |
| 2 | `src/prompt/components/history/HistoryTab.jsx` | MUI `Table` | `BasicTable` |
| 3 | `src/prompt/components/common/VersionHistoryPanel.jsx` | MUI `Table` | `BasicTable` |
| 4 | `src/pages/admin/SemanticOptionsEditor.jsx` | `admin-table` | 통합·삭제 검토 |
| 5 | `src/components/PromptManagement.jsx` | 미사용 | 삭제 검토 |

**이미 `BasicTable`:** 회원·워크스페이스·시맨틱 split·FAQ·QnA·공지·도메인 등 (목록은 `dev-guide-table-ui.md` 참고).

---

## 예외 등록

| UI | 사유 |
|----|------|
| 모달 내 미리보기·에디터 전용 표 | 읽기 전용·레이아웃 고정 — `BasicTable` 강제하지 않음 |
| `KlCategorySelectInput` 등 복합 필드 | 카테고리 트리·검색 — 단순 `KlModalSelect` 대체 불가 |
| 프롬프트 에디터 영역 | 전용 UX — 별도 spec 없으면 터치 시만 정리 |

---

## 갱신 규칙

- 표준 추가·레거시 승격 시 **본 파일 + 해당 spec**을 함께 수정한다.  
- 대규모 이관 완료 시 [../history/ui-history2.md](../history/ui-history2.md)에 사용자 요청으로 기록할 수 있다.

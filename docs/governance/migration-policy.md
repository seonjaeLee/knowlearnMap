# UI 이관 정책 (점진 정리)

전체 코드를 한 번에 바꾸지 않고, **규칙을 정한 뒤 손대는 화면만** 표준으로 맞춥니다.

**관련:** [component-registry.md](./component-registry.md) · [../README.md](../README.md)

---

## 1. 기본 원칙

| # | 규칙 |
|---|------|
| 1 | **신규·수정 화면**은 [component-registry](./component-registry.md)의 **표준**만 사용한다. 레거시 패턴을 새로 추가하지 않는다. |
| 2 | **기존 화면**은 버그 수정·기능 추가 등으로 **해당 파일을 열었을 때만** 그 파일 범위에서 표준으로 이관한다. |
| 3 | **전면 일괄 리팩터**는 하지 않는다. (별도 프로젝트로 합의한 경우만 예외) |
| 4 | **토큰 추가·변경**(`src/index.css` `:root`)은 제안 → 사용자 컨펌 → 적용 (`.cursor/rules/ui-ux-design-tokens.mdc`) |
| 5 | spec 충돌 시 우선순위: **registry** > 영역 spec (`surface/*`, `overlay/*`, `table/*`) > `history` 과거 문구 |

---

## 2. Surface vs Overlay

| 표면 | 의미 | 문서 |
|------|------|------|
| **Surface (Page)** | `kl-page`, 목록, 툴바, 본문 폼 | [../surface/](../surface/) |
| **Overlay** | `BaseModal`, `useDialog` alert/confirm/prompt | [../overlay/](../overlay/) |

같은 `--kl-control-*` 토큰을 쓰되, **클래스 바구니**는 표면별 spec을 따른다.

---

## 3. 이관 트리거 (언제 맞출까)

다음 중 하나에 해당하면 **그 PR/작업 안에서** registry 표준으로 맞춘다.

- 해당 화면 UI를 사용자가 명시적으로 정리 요청한 경우  
- 같은 파일에서 폼·표·모달·툴바를 이미 수정하는 경우  
- 버그가 레거시 마크업/스타일에서 발생해 표준으로 고치는 것이 더 안전한 경우  

**이관하지 않아도 되는 경우**

- 한 줄 주석·문구만 변경  
- 로직만 변경하고 UI 마크업·클래스를 건드리지 않음  
- registry에 **예외 등록**된 전용 UI (모달 내 미리보기 표, `KlCategorySelectInput` 등)

---

## 4. 문서·코드 작업 순서

1. [../README.md](../README.md) — 카테고리 확인  
2. [component-registry.md](./component-registry.md) — 표준·레거시 확인  
3. Surface 또는 Overlay spec  
4. 코드 수정 + 화면 QA  
5. (선택) 사용자 요청 시 [../history/ui-history2.md](../history/ui-history2.md) 기록  

---

## 5. 백로그 (문서화만, 코드는 별도 착수)

공통 레이아웃 정리 후 **한 화면씩** 진행 예정.

| 순서 | 항목 | 비고 |
|:---:|------|------|
| 0 | ~~`BasicTable` 빈 목록(thead 유지 + 본문 중앙)~~ | ✅ `emptyState` prop · `dev-guide-table-ui.md` §6.3 |
| 1 | ~~`PromptList` → `BasicTable`~~ | ✅ 구분 A (2026-05-19) |
| 2 | `HistoryTab`, `VersionHistoryPanel` | 프롬프트 상세 |
| 3 | `KlSelect` 일반화 + 모달/본문 select 통일 | `KlModalSelect` 확장 |
| 4 | `SemanticOptionsEditor` | 라우트 없음 — 삭제·통합 검토 |

---

## 6. 폐지·통합된 문서

| 문서 | 처리 |
|------|------|
| [../overlay/migration-plan-legacy.md](../overlay/migration-plan-legacy.md) | 1차 모달 인프라 계획 — **아카이브**, 신규 이관은 본 문서 + registry |
| [system-outline-legacy.md](./system-outline-legacy.md) | 구 체크리스트 — **README + governance**로 대체 |

---

## 7. 작업 이력

- **현행 기록:** [../history/ui-history2.md](../history/ui-history2.md)  
- **아카이브:** [../history/ui-history.md](../history/ui-history.md)  
- **갱신:** 사용자 **명시적 요청 시만** (`.cursor/rules/ui-history-on-request.mdc`)

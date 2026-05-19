# Surface 폼 컨트롤 규격 (본문·Page)

**본문·툴바·검색 영역**의 input, textarea, select 규격입니다.  
**모달 안 폼**은 [../overlay/modal-form-spec.md](../overlay/modal-form-spec.md)를 따릅니다.

**관련:** [../foundation/design-tokens.md](../foundation/design-tokens.md) · `src/styles/kl-form-control.css` · [../governance/component-registry.md](../governance/component-registry.md)

---

## 1. 범위

| 포함 | 제외 |
|------|------|
| `kl-page` 본문, `search-area`, `table-toolbar` 필드 | `BaseModal` 내부 → overlay spec |
| 인라인 편집 셀 (표 안) | 전용 에디터·코드 블록 |

---

## 2. 토큰·클래스

- **공통 토큰:** `--kl-control-*` (`kl-form-control.css`)
- **기본 클래스:** `kl-form-control` (input, textarea)
- **상태:** `:hover`, `:focus`, `:disabled`, `[readonly]` — 토큰으로 통일

숫자(px)만 주어져도 `index.css` / `--kl-control-*`에 대응 토큰이 있으면 **`var(--…)`** 사용 (`.cursor/rules/ui-ux-design-tokens.mdc`).

---

## 3. Select

| 상태 | 사용 |
|------|------|
| **목표 표준** | `KlSelect` (본문용, `KlModalSelect`와 시각·동작 정렬) |
| **레거시** | `.toolbar-select`, 네이티브 `<select>` — **신규 추가 금지** |

네이티브 select는 OS/브라우저가 스크롤·방향을 제어합니다. 통일된 패널·`max-height`는 `KlModalSelect` / 향후 `KlSelect` 참고.

---

## 4. 레이아웃

- 목록 상단 검색: [list-page-spec.md](./list-page-spec.md)의 `search-area`
- 단독 설정 폼: 라벨·필드 배치는 화면별 CSS Module; 간격은 `--spacing-*` 토큰

---

## 5. 이관

[../governance/migration-policy.md](../governance/migration-policy.md) — 해당 파일을 수정할 때만 본문 select/input을 표준으로 맞춘다.

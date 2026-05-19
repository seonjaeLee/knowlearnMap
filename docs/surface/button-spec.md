# Surface 버튼 규격 (본문·Page)

**본문·툴바·목록 상단** 버튼 규격입니다.  
**모달 하단 actions**는 MUI `Button` + [../overlay/modal-spec.md](../overlay/modal-spec.md)를 따릅니다.

**관련:** [../foundation/design-tokens.md](../foundation/design-tokens.md) · [../governance/component-registry.md](../governance/component-registry.md)

---

## 1. 표준

| 용도 | 권장 |
|------|------|
| 목록 툴바·페이지 액션 | `kl-btn`, `kl-btn--primary`, `kl-btn--secondary` 등 프로젝트 정의 변형 |
| 아이콘만 (테이블 행 등) | [`.cursor/rules/kl-table-actions-ui.mdc`](../../.cursor/rules/kl-table-actions-ui.mdc) |
| 위험·삭제 | 시맨틱 색 토큰 유지, 크기·간격 규칙 준수 |

---

## 2. 레거시

| 패턴 | 처리 |
|------|------|
| 본문에 MUI `Button` 직접 사용 | 레거시 — 손댈 때 `kl-btn` 또는 spec 합의 패턴으로 이관 |
| `<button>` 인라인 스타일 | 신규 금지 |

---

## 3. 모달과 구분

| Surface | Overlay |
|---------|---------|
| `kl-btn` 계열 | MUI `Button` in `BaseModal` `actions` |
| 툴바·페이지 chrome | `actionsAlign="right"` 등 modal-spec |

---

## 4. 이관

[../governance/migration-policy.md](../governance/migration-policy.md) — 화면 수정 시 해당 툴바/액션만 맞춘다.

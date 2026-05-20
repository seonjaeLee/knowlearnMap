# Tooltip · Popover Spec

<div style="font-size:12px;line-height:1.45">

**기준 코드** · `KlTooltip` — `src/components/common/KlTooltip.{jsx,module.scss}` · `KlPopover` — `src/components/common/KlPopover.{jsx,module.scss}` · 트리거 버튼 — `src/styles/kl-buttons.css` (`kl-popover-icon-btn`, `kl-table-icon-btn`)

**상태** · 2026-05-20 — 표 관리 열·GNB·툴바·헤더 아이콘: `KlTableRowActions` / `KlIconButton` / `KlTooltip`. 표 셀 잘림 `title=`·NotebookDetail 등은 별도.

---

## I. 역할 구분 (먼저 읽기)

| 구분 | 트리거 | 닫기 | 내용 | 컴포넌트 |
|:--|:--|:--|:--|:--|
| **Tooltip** | 마우스 **호버**·키보드 **포커스** | 없음 (벗어나면 사라짐) | 1줄~짧은 라벨 (「수정」「삭제」「알림」) | **`KlTooltip`** |
| **Popover** | **`?` / `i` 클릭** | 바깥 클릭·`Esc`·**X**(선택) | 여러 줄·불릿·긴 설명 | **`KlPopover`** |

> **HTML `title="..."`** 은 브라우저 기본 툴팁(느리고, 위치·스타일 제어 불가, 화면 밖으로 잘림) → **`KlTooltip`으로 치환** 대상.  
> **`KlTooltip`과 `title`을 같이 쓰지 않는다** (이중 표시).

---

## II. Tooltip — `KlTooltip`

### 1. 용도

- 아이콘만 있는 버튼·접힌 LNB 메뉴·툴바 버튼·GNB 알림/로그아웃 등 **짧은 안내**
- 표 **셀**의 긴 텍스트 전체 보기는 Popover(`?`) 또는 별도 패턴 — `title`만 전체 문자열 넣는 방식은 선택(잘림 없으면 생략 가능)

### 2. 스타일 (한 곳에서 통일)

| 항목 | 위치 |
|:--|:--|
| 패널·화살표 | `KlTooltip.module.scss` (`--color-bg-secondary`, `--color-border-subtle`, `--color-text-primary`) |
| z-index | `.popper` — `1200` |

**스타일만 바꿀 때** → `KlTooltip.module.scss`(또는 공유 토큰 `src/index.css`)만 수정하면, **`KlTooltip`을 쓰는 모든 화면에 반영**.

### 3. 주요 props

| prop | 기본 | 설명 |
|:--|:--|:--|
| `title` | (필수) | 툴팁 문구 |
| `children` | (필수) | 트리거 요소 1개 (`button`, `NavLink` 등) |
| `placement` | `'top'` | MUI placement — 위치별 표 아래 표 참고 |
| `enterDelay` | `200` | ms — LNB·표 액션은 `0` 권장 |
| `leaveDelay` | `0` | ms |
| `variant` | `'block'` | `'block'` LNB NavLink · `'icon'` 28px `kl-table-icon-btn` |
| `triggerClassName` | `''` | 페이지별 추가 클래스 (예: `lnb-tooltip-trigger`) |

### 4. 배치 가이드

| 위치 | `placement` | `enterDelay` | 비고 |
|:--|:--|:--|:--|
| LNB **접힘** (아이콘만) | `right` | `0` | 본문 쪽으로 열림 |
| 표 **관리 열** (우측) | `left` | `0` | 화면 밖으로 나가지 않게 |
| GNB·툴바 (상단) | `bottom` | `0`~`200` | |
| 기본 | `top` | `200` | |

LNB와 표 우측은 **같은 컴포넌트, placement만 다름** — LNB 설정을 표에 그대로 복사하면 안 됨.

### 5. 사용 예

```jsx
import KlTooltip from '../components/common/KlTooltip';

// 표 28px 아이콘 버튼
<KlTooltip title="삭제" placement="left" enterDelay={0} variant="icon">
  <button type="button" className="kl-table-icon-btn kl-table-icon-btn--danger" aria-label={`${label} 삭제`} …>
    <Trash2 … />
  </button>
</KlTooltip>
```

- 트리거에 **`title` 속성 금지**
- **`aria-label`** 은 접근성용으로 유지

### 6. 적용 현황 (코드)

| 영역 | 방식 |
|:--|:--|
| LNB 접힘 메뉴 | `MainLayout.jsx` — `wrapLnbTooltip` + `KlTooltip` |
| LNB 접기 버튼 | `KlTooltip` |
| 고객센터 표 관리 열 | `SupportTableAdminActions.jsx` (1:1 문의·FAQ·공지) |
| 그 외 표·GNB·툴바 | 대부분 아직 HTML `title=` (이관 예정) |

---

## III. Popover — `KlPopover`

### 1. 용도

- **클릭**으로 여는 설명 패널
- 카테고리 설명(`?`), 거절 사유, 워크스페이스 프롬프트 8종, 값 열 전문 보기 등

### 2. 스타일

| 항목 | 위치 |
|:--|:--|
| 패널 | `KlPopover.module.scss` — `--color-bg-secondary` 등 (밝은 카드 톤) |
| 닫기 X | `showCloseButton` — 우상단, `--color-text-secondary` |
| 닫힘 애니메이션 | MUI `Fade` — 닫을 때 앵커·내용 유지 후 `onExited`에서 정리 |

**스타일만 바꿀 때** → `KlPopover.module.scss` (+ 필요 시 페이지 `panelClassName`은 **레이아웃만**).

### 3. 주요 props

| prop | 기본 | 설명 |
|:--|:--|:--|
| `open` | — | 표시 여부 |
| `anchorEl` | — | 클릭한 요소 |
| `onClose` | — | 닫기 핸들러 |
| `anchorReference` | `'anchorEl'` | `'anchorPosition'` — 앵커 DOM이 바뀌는 테이블 행 등 |
| `anchorPosition` | — | `{ top, left }` (뷰포트 기준) |
| `showCloseButton` | `false` | 긴 설명·워크스페이스 프롬프트 등 `true` |
| `panelClassName` | `''` | **내용·너비**만 (색은 `.panel` 토큰) |

### 4. 트리거

| 트리거 | 클래스·아이콘 |
|:--|:--|
| 설명 `?` / `i` | `kl-popover-icon-btn` + Lucide `HelpCircle` 16px — `src/styles/kl-buttons.css` |

Popover는 **호버 Tooltip이 아님** — `KlTooltip`으로 바꾸지 않음.

### 5. 적용 현황 (코드)

| 화면 | 비고 |
|:--|:--|
| 시스템 설정 | 카테고리 `?` + `KlPopover` |
| 승인 관리 | 거절 사유 `?` |
| 워크스페이스 관리 | 프롬프트 8종 — `showCloseButton`, `panelClassName`으로 너비 조절 |
| 프롬프트 목록 등 | 일부 MUI `Popover` 직접 사용 — 추후 `KlPopover` 통일 검토 |

---

## IV. 표 관리 열 구조 (`KlTableRowActions`)

```
KlTooltip
    ↑
KlIconButton       ← 28px 버튼 1개 + 툴팁
    ↑
KlTableRowActions  ← `.kl-table-actions` + kind 프리셋 배열
```

### kind 프리셋 (`tableActionKinds.js`)

| kind | 기본 툴팁 | 톤 |
|:--|:--|:--|
| `mailResend` | 인증 메일 재발송 | neutral |
| `unlock` / `lock` | 잠금 해제 / 잠금 | neutral |
| `approve` | 승인 | success |
| `reject` | 거절 | danger |
| `share` | 공유 설정 | neutral (`accent: true` 가능) |
| `edit` | 수정 | neutral |
| `delete` | 삭제 | danger |
| `rename` | 제목 수정 | neutral |
| `custom` | (직접 지정) | (직접 지정) |

```jsx
<KlTableRowActions
  actions={[
    { kind: 'edit', onClick, ariaLabel: `${name} 수정` },
    { kind: 'delete', onClick, ariaLabel: `${name} 삭제` },
  ]}
/>
```

- `tooltip`·`tone`·`icon`·`accent`·`loading`으로 프리셋 덮어쓰기.
- 조건부 액션: `[ cond && { kind: 'unlock', ... }, ... ].filter(Boolean)`.
- 고객센터: `SupportTableAdminActions` = edit+delete 래퍼.

| 컴포넌트 | 쓰는 곳 |
|:--|:--|
| `KlTableRowActions` | 표 **관리** 열 |
| `KlIconButton` | GNB·툴바·헤더 (`buttonClassName` 지정) |
| `KlTooltip` 직접 | LNB `NavLink` 등 |

---

## V. 이관 순서 (권장)

| 단계 | 작업 |
|:--|:--|
| 1 | `KlIconButton` · `KlTableRowActions` 정의 |
| 2 | 표 관리 열 페이지 → `KlTableRowActions` |
| 3 | GNB·툴바 → `KlIconButton` |
| 4 | [component-registry.md](../governance/component-registry.md) · 본 문서 갱신 |
| 5 | (선택) 셀 `title=` — 잘릴 때만 툴팁 vs 제거 정책 결정 |

[migration-policy.md](../governance/migration-policy.md) — **손대는 화면만** 이관.

---

## VI. 하지 말 것

- Popover에 필요한 **긴 설명**을 Tooltip 호버에 넣기
- Tooltip에 **닫기(X)** (호버 UI와 맞지 않음)
- `title=` + `KlTooltip` **동시** 사용
- 페이지마다 Popover **배경색 `#hex` 하드코딩** — SCSS 토큰·`KlPopover` / `KlTooltip` 사용
- 표 우측 버튼에 LNB와 동일하게 `placement="right"` 만 사용 (화면 밖 이탈)

---

## VII. 체크리스트

- [ ] 짧은 아이콘 안내는 `KlTooltip` (또는 예정 `KlIconButton`)이고 `title=` 없음
- [ ] `?` 클릭 설명은 `KlPopover` + `kl-popover-icon-btn`
- [ ] 우측 표 액션 툴팁은 `placement="left"` (또는 `KlTableRowActions` 사용)
- [ ] 스타일 변경은 `KlTooltip.module.scss` / `KlPopover.module.scss`만 수정
- [ ] registry·본 문서가 단계 완료 후 갱신됨

---

## VIII. 연관 문서

| 문서 | 관계 |
|:--|:--|
| [modal-spec.md](./modal-spec.md) | 전면 차단 모달 — 본 spec과 별 레이어 |
| [../surface/button-spec.md](../surface/button-spec.md) | `kl-btn`, `kl-table-icon-btn` |
| [../table/dev-guide-table-ui.md](../table/dev-guide-table-ui.md) | 표·관리 열 |
| [../governance/component-registry.md](../governance/component-registry.md) | 표준/레거시 표 |
| [../foundation/design-tokens.md](../foundation/design-tokens.md) | `:root` 토큰 |

</div>

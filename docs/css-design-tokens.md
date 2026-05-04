# CSS 디자인 토큰 기준

프로젝트에서 **색·간격·비활성 상태** 등을 맞추기 위한 규칙입니다.  
실제 값의 **단일 소스**는 `src/index.css`의 `:root` 블록입니다. 이 문서는 **이름 규칙·언제 쓸지·예시**만 정리합니다.

---

## 1. 원칙

| 원칙 | 설명 |
|------|------|
| **SSOT** | 새로 쓰는 색/간격은 가급적 `:root` 변수로만 정의하고, 컴포넌트 CSS에서는 `var(--이름)`으로 참조한다. |
| **하드코딩 `#hex`는 예외** | 일회성·장식이 아니라면 **같은 의미**(테두리, 본문 텍스트, 비활성 배경 등)는 변수로 통일한다. |
| **전역 셀렉터는 신중히** | `input:disabled { ... }`처럼 **모든** 입력에 한꺼번에 스타일을 주면, 관리자·모달·서드파티 UI와 충돌할 수 있다. **필요한 컴포넌트에 클래스 + `var()`**를 권장한다. |
| **MUI와 공존** | MUI 컴포넌트는 `theme`/`sx`가 우선될 수 있다. **순수 HTML + CSS 모듈** 화면부터 토큰 적용을 늘려간다. |

---

## 2. 네이밍 규칙 (`:root`)

접두사로 **용도**를 구분한다.

| 접두사 / 패턴 | 용도 | 예시 |
|----------------|------|------|
| `--color-*` | 배경·텍스트·강조·경계 등 **일반 색** | `--color-text-primary`, `--color-border` |
| `--form-control-disabled-*` | `input` / `textarea` / `select` **비활성** (배경·테두리·글자·placeholder) | `--form-control-disabled-bg` |
| `--btn-disabled-*` | **버튼** 비활성(회색 주 버튼 등) | `--btn-disabled-bg`, `--btn-disabled-text` |
| `--control-pill-*` | **채우기형** 토글·세그먼트(active 시 배경 채움) | `--control-pill-active-bg`, `--control-pill-active-text`, `--control-pill-active-hover-bg` |
| `--spacing-*` | 여백·간격 | `--spacing-sm` |
| `--radius-*` | 모서리 반경 | `--radius-sm` |
| `--font-*` | 글꼴·크기·굵기 | `--font-size-xs`, `--font-weight-medium` |
| `--shadow-*` | 그림자 | `--shadow-small` |
| `--transition-*` | 전환 | `--transition-fast` |

새 변수 추가 시:

1. **의미**가 겹치면 기존 이름 재사용, 아니면 위 패턴으로 이름을 짓는다.  
2. `index.css` `:root`에 주석 한 줄(한국어 가능).  
3. 이 파일 표에 한 줄 추가(선택, 큰 변경만).

---

## 3. 비활성(disabled) 토큰 (현재 정의)

`src/index.css`에 다음이 있다. **폼 컨트롤**과 **주요 액션 버튼**을 구분한다.

| 변수 | 용도 |
|------|------|
| `--form-control-disabled-bg` | 비활성 입력 칸 배경 |
| `--form-control-disabled-border` | 비활성 입력 테두리 |
| `--form-control-disabled-text` | 비활성 입력에 입력된 글자 색 |
| `--form-control-disabled-placeholder` | placeholder 색 |
| `--btn-disabled-bg` | 비활성 버튼 배경(예: 전송·저장) |
| `--btn-disabled-text` | 비활성 버튼 글자색 |

### 컴포넌트 CSS 예시

```css
.my-input:disabled,
.my-input.is-disabled {
  background-color: var(--form-control-disabled-bg);
  border-color: var(--form-control-disabled-border);
  color: var(--form-control-disabled-text);
  cursor: not-allowed;
}

.my-input:disabled::placeholder {
  color: var(--form-control-disabled-placeholder);
}

.my-btn:disabled {
  background-color: var(--btn-disabled-bg);
  color: var(--btn-disabled-text);
  cursor: not-allowed;
  opacity: 1; /* 회색이면 opacity 중복 저하 방지 */
}
```

### 채우기형 토글·세그먼트(배경이 primary색인 active)

- **일반** `:hover { color: 링크색 }` 를 두면, **`.active` 상태에서도** 동일 규칙이 겹쳐 **파란 글자 + 파란 배경**이 될 수 있음.
- **반드시** `.active:hover:not(:disabled)`에서 `color: var(--control-pill-active-text)` 등으로 **글자색을 다시 지정**.
- 토큰: `--control-pill-active-bg`, `--control-pill-active-text`, `--control-pill-active-hover-bg` (`src/index.css`)

### 영역 전체를 비활성 톤으로 쓸 때

입력줄 **바깥 래퍼**(예: `.message-input-area.is-disabled`)는 배경만 살짝 다르게 할 수 있다. 이때도 `#eceff1` 등을 새로 쓰기보다 **`--form-control-disabled-bg`와 동일**하거나, 필요하면 **한 변수만** 추가해 구역 배경용으로 쓴다.

---

## 4. 기존 일반 색상 토큰 (참고)

이미 `:root`에 있는 것들 — 비활성과 무관한 **활성 UI**에 사용한다.

- 텍스트: `--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary`
- 배경: `--color-bg-primary`, `--color-bg-secondary`, `--color-bg-hover`
- 강조: `--color-accent`, `--color-accent-hover`
- 테두리: `--color-border`, `--color-border-hover`

---

## 5. 마이그레이션 순서 (권장)

1. **새 화면 / 새 블록** — 처음부터 `var()`만 사용.  
2. **수정하는 파일** — 손대는 김에 인접한 `#hex`를 같은 의미의 토큰으로 치환.  
3. **대규모 일괄 치환** — 디자인 검수 후 배치 작업.

---

## 6. 관련 파일

| 파일 | 역할 |
|------|------|
| `src/index.css` | `:root` 변수 **정의** |
| `docs/css-design-tokens.md` | 본 문서 — **규칙·표** |
| `docs/ui-history.md` | UI 변경 이력(예: 토큰 도입 항목) |

레이아웃 폭·브레이크포인트는 `docs/layout-guideline.md`를 본다.

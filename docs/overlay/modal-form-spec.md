# Modal Form Controls Spec (팝업 본문 폼 — 확정 v1)

**적용 범위:** `BaseModal` **콘텐츠 영역**에 한함. 페이지 본문·테이블 셀 등 **밀집(dense) 레이아웃**은 별도 규격으로 두며 이번 문서 범위에서 제외한다.

**관련:** [`modal-spec.md`](./modal-spec.md) — I 운영 · II §4 `BaseModal` 클래스. Decision(`alert`/`confirm`/`prompt`)는 §3·§5와 같이 폼 일괄 규격에서 제외 가능(본문은 메시지·prompt 입력 위주).

---

## 1) 목표

- 팝업 안의 **select / input / textarea / checkbox / radio**(MUI 포함) 시각·포커스·비활성·에러 톤을 **한 규격**으로 맞춘다.
- 스타일 수정 시 **한 파일(`kl-modal-form.css`)** 위주로 유지보수한다.
- 마크업 반복은 **`ModalFormField`**(라벨·컨트롤 슬롯·보조문)로 줄인다.

---

## 2) 적용 방법 (필수)

1. 해당 모달의 `BaseModal`에 **`contentClassName`**으로 기존 클래스와 함께 **`kl-modal-form`** 을 붙인다.

   ```jsx
   <BaseModal
     contentClassName="some-modal-content kl-modal-form"
     ...
   >
   ```

2. 필드 한 블록은 다음 중 하나로 구성한다.

   - **`ModalFormField`** 사용(권장): `label`, `children`(실제 컨트롤), `helperText`, `required`, `error`.
   - 수동: 동일한 의미의 클래스명(`kl-modal-form-field` 등)을 쓰되, **반드시 `.kl-modal-form` 조상** 안에 둔다.

---

## 3) 클래스 요약

| 클래스 | 역할 |
|--------|------|
| **`kl-modal-form`** | 콘텐츠 루트. 이 안에서만 네이티브/MUI 폼 컨트롤 규격이 활성화된다. |
| **`kl-modal-form-field`** | 라벨·컨트롤·보조문 세로 스택(필드 간 여백 포함). `ModalFormField`와 동일 리듬. |
| **`kl-modal-form-label`** | 필드 라벨(상단). 필수 시 자식으로 `.required-asterisk` 사용. |
| **`kl-modal-form-control`** | 컨트롤 래퍼(`width: 100%`, `min-width: 0`). |
| **`kl-modal-form-helper`** | 보조 설명(`--font-size-sm`, 보조 색). |
| **`kl-modal-form-control--warning`** | 네이티브 `select`/`input` 등에 붙이면 경고 테두리·배경(청킹 NONE 등 특수 상태용). |

---

## 4) 토큰·리듬 (팝업 폼 필드 — `modal-native-field`·`kl-modal-form` 공통)

한 번 고치면 두 경로가 같아 보이도록 **모서리·패딩·테두리·포커스**를 아래에 맞춘다.

| 항목 | 토큰 / 값 |
|------|-----------|
| **모서리** | **`--radius-sm`(4px)** — 모달 하단 버튼(`modal-spec.md` §3·`BaseModal` `.actions`)과 동일. |
| **테두리** | `1px solid var(--color-border)` |
| **포커스** | `border-color: var(--color-accent)` + `box-shadow: var(--shadow-focus-input)` (`index.css`). 네이티브는 `kl-modal-form.css`에서 **`!important`** 및 **`:invalid:focus`** 보강(브라우저·MUI 간섭, `type=email` 등) |
| **한 줄 `input` / `textarea`** | 패딩 **`calc(var(--spacing-sm) + var(--spacing-xs))` `14px`** (`index.css` `.modal-native-field` 동일) |
| **`select`(네이티브)** | 세로·**좌** 패딩은 한 줄 입력과 동일; **우**만 화살표 여유 **`calc(var(--spacing-xl) + var(--spacing-md))`** |
| **필드 블록 간격** | 세로 **`--spacing-md`(16px)** (`ModalFormField` / `.kl-modal-form-field`) |
| **라벨↔컨트롤↔보조문** | **`--spacing-sm`(8px)** 단계 |

**유지보수:** 팝업 내 네이티브 필드 스타일 변경 시 **`src/styles/kl-modal-form.css`** 와 **`src/index.css`** 의 `.modal-native-field` 입력·전역 **`.modal-input`** 규칙을 **함께** 본다. 도메인 추가·FAQ 등 동일 패턴 폼은 같은 토큰으로 맞춘다.

---

## 5) MUI 컴포넌트

- **`TextField`** · **`Select`** · **`Checkbox`/`Radio` + `FormControlLabel`**: `.kl-modal-form` 안에서 **Outlined 계열**을 기준으로 후손 선택자로 통일한다.
- 페이지별 `sx`로 테두리색을 덮어쓰지 않는 것을 원칙으로 한다. 예외는 본 문서에 항목 추가 후 적용.

---

## 6) 네이티브 요소

- `input`(한 줄), `textarea`: §4 표와 동일.
- **`<select>`(네이티브)**: OS마다 펼침 목록 UI가 달라 **프로덕션 팝업에서는 사용하지 않는 것을 권장**한다. 동일 디자인이 필요하면 **`KlModalSelect`** (`src/components/common/modal/KlModalSelect.jsx`, MUI `Select`)를 쓴다. 목록 패널에는 전역 클래스 **`kl-modal-select-menu-paper`** 로 `radius-sm`·테두리·호버·선택 배경을 통일한다(`kl-modal-form.css`).
- 기존 전역 **`.modal-input`** 은 `.kl-modal-form` 안에서 §4에 맞게 재정의된다.

---

## 7) 유지보수 노트

- 팝업이 아닌 **테이블/노트북 상세** 등 더 작은 컨트롤이 필요하면 **`kl-table-form`** 같은 별도 접두사·별 문서**로 분리하는 것을 권장한다.
- 신규 모달 추가 시: 타입만 `modal-spec.md`에 맞추고, 폼이 있으면 **`kl-modal-form` + `ModalFormField`(또는 동일 클래스)** 로 시작한다.

# 데이터 테이블 UI 규격 (초안)

## 연관 문서

- [dev-guide-table-ui.md](./dev-guide-table-ui.md) — 개발자용: 표 복붙·div 클릭 등 실수 방지·체크리스트 · **섹션 6: `BasicTable` MUI 스택·푸터·페이지네이션**  
- [layout-guideline.md](./layout-guideline.md) — 본문 폭·패딩·브레이크포인트  
- [css-design-tokens.md](./css-design-tokens.md) — `:root` 변수 규칙  
- [mockup-guide.md](./mockup-guide.md) — 목업 산출물·체크리스트  
- [ui-system-outline.md](./ui-system-outline.md) — UI 정리 작업 순서

---

관리 화면·히스토리 등 **목록 밀도**를 통일하고, 그리드형 카드와 나란히 두었을 때 **정보 위계**가 어색하지 않도록 하는 기준입니다.  
실제 색·숫자의 단일 소스는 `src/index.css`의 `:root`이며, 이름 규칙은 [css-design-tokens.md](./css-design-tokens.md)를 따릅니다.

---

## 1. 목적

- 한 화면에 **더 많은 행**을 노출할 수 있도록 **행 높이·본문 글자 크기**를 단계화한다.
- 헤더·구분선·호버·액션 열을 **화면마다 제각각** 두지 않도록 최소 규격을 고정한다.

---

## 2. 참고 레퍼런스 (분위기·밀도)

밀집형 테이블·툴바·페이지네이션의 **전체적인 밀도**를 맞출 때 참고합니다.

| 구분 | 링크·비고 |
|------|-----------|
| Wireframe (User Management 느낌) | [Figma 사이트](https://emote-many-44283224.figma.site/) |
| 정적 이미지 | 협업 채널·에셋 폴더의 캡처(픽셀 기준 보조) |

레퍼런스 요약: **좁은 행**, **작지만 읽히는 본문 글자**, **연한 헤더 행**, **얇은 가로 구분선**, 줄무늬 없이 정리, 역할 **pill**, 상태 **토글+라벨**, 우측 **아이콘 액션**.

---

## 3. 밀도 단계

화면 성격에 따라 하나를 선택합니다. 카드형·설명이 많은 목록은 **기본**, 데이터 위주 어드민은 **밀집**을 권장합니다.

| 단계 | 용도 | 셀 세로 패딩(가이드) | 본문 글자 크기 |
|------|------|----------------------|----------------|
| **기본** | 온보딩·카드형 목록 | `padding-block: var(--spacing-sm)` (8px) | `var(--font-size-base)` (14px) |
| **밀집** | 어드민 표·실행 이력 등 | `padding-block: var(--spacing-xs)` (4px) 상하, 필요 시 행 최소 높이만 추가 | `var(--font-size-sm)` (13px) 또는 `var(--font-size-xs)` (12px) |

**참고(행 전체 높이):** 외부 레퍼런스처럼 본문 한 줄 기준 약 **40~44px**을 맞출 때는 `padding-block: calc(var(--spacing-sm) + 2px)`(상하 각 10px)와 `tbody td { min-height: 44px; }` 조합을 사용할 수 있다(도메인 선택 테이블 적용 예).

보조·메타 열(날짜, 건수)은 본문보다 한 단계 작게 가져가도 됩니다: `--font-size-xs`, `--color-text-secondary`.

---

## 4. 헤더 행

| 항목 | 권장 토큰 |
|------|-----------|
| 배경 | `var(--color-bg-dark)` 또는 `var(--color-bg-hover)` |
| 글자색 | `var(--color-text-secondary)` |
| 굵기 | `var(--font-weight-semibold)` |
| 크기 | `var(--font-size-sm)` |
| 하단 경계 | `1px solid var(--color-border-subtle)` |

**텍스트 정렬(관례):** 기본 **`th`는 좌측**. 예외만 명시한다 — **선택(체크/라디오) 열은 가운데**, **맨 오른쪽 액션 열(관리 등)은 우측**. 중간 텍스트 열을 가운데 정렬하지 않는다(어드민 `.admin-table thead tr`는 `text-align: left`).

---

## 5. 본문 행

| 항목 | 권장 토큰 |
|------|-----------|
| 배경 | `var(--color-bg-secondary)` |
| 본문 텍스트 | `var(--color-text-primary)` |
| 행 구분 | `border-bottom: 1px solid var(--color-border-subtle)` |
| 줄무늬(zebra) | **기본 없음**. 필요 시에만 교차 행에 `var(--color-bg-subtle)` |
| 호버 | `background: var(--color-bg-hover)` + `transition: var(--transition-fast)` |

### 5.1 텍스트 말줄임(선택, 화면마다 옵인)

긴 문자열이 셀 밖으로 넘칠 때 **한 줄 + 말줄임(`…`)**을 주고 싶으면, 말줄임을 줄 **`th` / `td`에만** 아래 클래스를 붙인다. 전역으로 모든 셀에 걸지 않는다.

| 클래스 | 정의 위치 | 조건 |
|--------|------------|------|
| **`_ellipsis`** | `src/pages/admin/admin-common.css` (`.admin-table` 하위) | `overflow: hidden` + `text-overflow: ellipsis` + `white-space: nowrap` |

CSS에서는 선택자로 **`._ellipsis`**처럼 앞에 점(`.`)을 붙이고, 마크업에는 **`class="_ellipsis"`**만 적으면 됩니다(점은 HTML에 넣지 않음).

**동작을 안정적으로 하려면:** 같은 테이블에 **`table-layout: fixed`**와 **열 폭**(width / min-width 등)을 잡아 두는 것이 좋다. 배지·아이콘만 있는 열에는 보통 붙이지 않는다.

**예시**

```html
<td class="_ellipsis">매우 긴 이메일 또는 도메인 문자열…</td>
```

`admin-table`을 쓰지 않는 목록(예: 도메인 선택 `/` 전용 테이블)에는 동일 규칙을 **해당 화면 CSS**에 복사하거나, `th`/`td`에 맞게 한정한 선택자로 맞춘다.

---

## 6. 선택·액션 열

- **체크박스/라디오** 열: 너비는 최소한으로, 헤더 정렬은 보통 가운데.
- **선택 열은 화면마다 옵션**: 어드민 공통 CSS에 `.admin-th-select` / `.admin-td-select`가 있으면, 해당 테이블의 **첫 열**에만 `<th class="admin-th-select">` / `<td class="admin-td-select">`와 `input type="checkbox"`를 조건부로 넣는다. 페이지 상단에 `SHOW_ROW_CHECKBOX_COLUMN` 같은 상수로 켜고 끄는 패턴을 쓸 수 있다(예: `AdminMemberManagement.jsx`).
- **아이콘만 액션**(수정·삭제): 버튼형일 경우 **터치/클릭 영역** 최소 약 32~36px 유지(가독성·접근성).
- **행 내 아이콘 버튼 통일 (`src/styles/km-table-icon-actions.css`, `main.jsx`에서 전역 로드)**  
  - **크기·간격(`index.css`)**: `--km-table-action-icon-size`(아이콘 실크기, 기본 **16px**), `--km-table-action-icon-gap`(편집·삭제 사이, 기본 **0**), `--km-table-action-hit-size`(클릭 영역), `--km-table-actions-col-min`(액션 열 최소 폭). 행 내 액션 SVG는 이 토큰으로 통일하고, Lucide 기본 24px에 의존하지 않는다.  
  - 기본 베이스: `.km-table-icon-btn` (히트 영역·라운드·포커스 링). 행 내 `svg` 크기는 `--km-table-action-icon-size`로 통일.  
  - **편집·일반**: `.km-table-icon-btn--neutral` — 기본 `var(--color-text-secondary)`, 호버 시 삭제와 같은 방식의 연한 채움 + `var(--color-text-primary)`.  
  - **삭제·위험**: `.km-table-icon-btn--danger` — 기본 레드 **`var(--color-icon-danger)` (#dc2626) 고정 계열**; 호버만 `color-mix` + `--color-icon-danger-emphasis`.  
  - **승인·긍정**: `.km-table-icon-btn--success` — `var(--color-icon-success)` / `var(--color-icon-success-emphasis)`(`index.css`); 호버는 danger와 동일하게 `color-mix` 연한 톤.  
  - **어드민** 테이블(`.admin-table` 하위)에서는 `admin-common.css`가 위 색을 `--admin-text-*` / `--admin-color-danger*` 로 덮어씀(성공은 `--admin-color-success*`).
  - 로딩 스피너: `.km-table-icon-btn__spin` 부착.
- **삭제 등 위험 동작**: 위 danger 변형 클래스 사용. 하드코딩 대신 토큰 우선.

---

## 7. 배지·필(pill)·토글

- **필**: `border-radius: var(--radius-sm)`; 가로 패딩은 `var(--spacing-xs)` ~ `var(--spacing-sm)`, 세로는 밀도에 맞게 조정.
- **채우기형 강조(예: Admin 역할)** 색: 가능하면 `--control-pill-active-*` 패턴과 [css-design-tokens.md](./css-design-tokens.md)의 pill 안내를 참고.
- **토글 + 텍스트**: 스위치는 MUI 또는 기존 공통 컴포넌트와 통일.

---

## 8. 툴바(검색·필터·정렬)

- 한 줄 배치를 기본으로 하고, 요소 간 `gap`은 `var(--spacing-sm)` ~ `var(--spacing-md)`.
- 페이지 상단 여백·폭은 [layout-guideline.md](./layout-guideline.md)의 본문 패딩과 맞춘다.

---

## 9. 하단(건수·페이지네이션)

- 요약 문구: `var(--font-size-xs)`, `var(--color-text-secondary)` (어드민은 `admin-common.css`의 `--admin-font-sm` 등).
- **3열 그리드 권장**: `admin-table-footer` — 좌측 요약(`admin-table-footer__start`), **가운데** 페이지네이션(`admin-table-footer__center`), 우측은 이후 옵션(필터·뷰 전환 등)용으로 **비워 둘 수 있는 슬롯**(`admin-table-footer__end`, `1fr / auto / 1fr` 그리드로 가운데 정렬이 흐트러지지 않게 함). 컴포넌트: `AdminTableFooter.jsx`.
- 테이블과 같은 시각적 카드로 묶을 때: `admin-table-card`로 감싼 뒤 안에 `admin-table-wrap` + `AdminTableFooter` 순서(카드는 **border** 위주, 그림자 없음).

### 9.1 페이지당 행 수(클라이언트 페이지네이션)

- **화면마다 원하는 노출 수를 다르게 둘 수 있다.** 전역 CSS나 단일 설정이 아니라, **목록 화면 JSX마다** 상수로 두는 방식이 일반적이다.
- **관례**: 해당 파일 상단에 `PAGE_SIZE` 또는 `ROWS_PER_PAGE` 등 이름을 정해 두고, `slice`로 현재 페이지 데이터를 만들 때와 **총 페이지 수·「전체 N명 중 a–b명 표시」** 문구를 계산할 때 **같은 상수**를 사용한다.
- **예시**: `src/pages/admin/AdminMemberManagement.jsx` — `const PAGE_SIZE = 15`.
- **확장**: 여러 메뉴가 동일한 숫자만 공유하면 `src/pages/admin/` 아래 `constants.js`(또는 유사 모듈)에 한 번만 정의해 각 페이지에서 import 해도 된다. 메뉴별로 다르면 **파일별 상수**만 유지하면 된다.

---

## 10. 구현 시 주의

- `table td` 전역 한 번에 스타일 지정은 피하고, **화면 루트 클래스** 또는 **CSS Modules** 범위 안에서 적용한다 (`css-design-tokens.md` 전역 셀렉터 주의와 동일).
- **MUI Table** 사용 시 `size="small"` 등으로 위 표의 **밀집** 단계에 가깝게 맞추고, theme에서 셀 패딩·폰트를 토큰과 연결할 수 있다.

---

## 11. 목업·요청 시

열 목록·밀도 단계·레퍼런스 링크는 [mockup-guide.md](./mockup-guide.md) §5와 함께 적어 두면 구현 협의가 빨라진다.

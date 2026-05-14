# 테이블 UI·시맨틱·접근성 — 개발 가이드

## 연관 문서

- [data-table-spec.md](./data-table-spec.md)
- [layout-guideline.md](./layout-guideline.md)
- **MUI 공통 표·푸터·페이지네이션**: 아래 **섹션 6** (`BasicTable` 스택)
- 열 너비 드래그(원시 `<table>`): 아래 **§5**, 구현체 `src/hooks/useResizableColumns.jsx`

---

팀 내 실수 방지용 요약입니다. 상세 규격은 [data-table-spec.md](./data-table-spec.md), 토큰은 [css-design-tokens.md](./css-design-tokens.md)를 따른다.

---

## 1. 왜 이 문서가 필요한가

표·액션 버튼은 **페이지마다 조금씩만 달라도** 유지보수 비용과 접근성 결함이 누적된다. 아래는 **피해야 할 패턴**과 **대안**이다.

---

## 2. 피해야 할 것 (자주 나는 실수)

### 2.1 표 마크업을 페이지마다 복사만 하고 클래스만 살짝 바꾸기

- **문제**: `data-table-spec`·공통 클래스와 어긋나고, 패딩·열 폭·헤더 정렬이 화면마다 달라진다.
- **대안**:
  - 동일 패턴이면 **같은 루트 클래스**(`admin-table-card`, `domain-mgmt-table-card` 등)와 **문서화된 열 클래스**를 재사용한다.
  - 새 화면이면 규격 문서에 **열 목록·밀도**를 한 줄이라도 추가한 뒤 구현한다.

### 2.2 클릭 가능한 영역을 `<div onClick>` 로만 처리하기

- **문제**: 키보드 포커스·Enter 동작·스크린 리더 **버튼 역할**이 빠지기 쉽다.
- **대안**: 실제 버튼은 **`<button type="button">`** + 필요 시 `aria-label`. 링크 이동만 `<a href>`.

### 2.3 아이콘만 있는 버튼에 이름 없음

- **문제**: 보조 기술 사용자에게 동작이 전달되지 않는다.
- **대안**: `aria-label` 또는 시각적으로 숨긴 텍스트. 프로젝트 공통은 [km-table-icon-actions.css](../src/styles/km-table-icon-actions.css) 패턴 참고.

### 2.4 표를 `div` + CSS 그리드로만 흉내 내기 (데이터 표인 경우)

- **문제**: 표 의미·열 헤더 관계가 DOM에 없어 진입이 어렵다.
- **대안**: **데이터 표**는 `<table>`, `<thead>`, `<tbody>`, `<th scope="col">` 등 시맨틱 마크업 사용.

---

## 3. 작업 전 체크리스트 (짧게)

- [ ] 새 목록 화면이면 `data-table-spec.md` 밀도·열 정의 확인
- [ ] 셀 간격은 **`th` / `td`의 `padding`**·토큰으로 조정 (열 너비만 `colgroup` 등으로 조정하는 경우가 많음)
- [ ] 긴 목록 + `km-main-sticky-head` 가 있는 페이지에서 **열 제목을 스크롤에 고정**할 경우: 메인 표 **`thead th`** 에 `position: sticky`·`top: var(--km-admin-sticky-thead-top)` 등(상단 블록 높이와 맞게 페이지 CSS에서 변수 조정). 고정이 필요 없으면 적용하지 않아도 됨.
- [ ] 헤더 정렬: **`admin-common.css`** 에서 **마지막 `th`만 우측**, **그 외 `th`는 좌측**(`thead tr > th:not(:last-child)` / `th:last-child`). 비마지막 열을 가운데로 둘 때만 해당 `th`에 **`admin-col-center`**. 본문 숫자·뱃지 중앙은 `td`에 **`admin-col-center`** (인라인 `style` 금지 권장).
- [ ] 클릭 요소는 `button` / `a`, 아이콘 전용은 `aria-label`
- [ ] 포커스 링은 `:focus-visible`, 색만으로 상태 구분하지 않기
- [ ] 긴 텍스트 열 말줄임: `data-table-spec.md` §5.1 — `.admin-table` 안에서는 **`_ellipsis`** 클래스를 **해당 `th`/`td`에만** 옵인(전역 일괄 적용 금지)
- [ ] 한 페이지 행 수: 클라이언트 페이지네이션은 **해당 페이지의 `PAGE_SIZE`(등) 상수**로 조절 — **메뉴(화면)마다 값이 달라도 됨** (`data-table-spec.md` §9.1)
- [ ] 콘텐츠 내부 스크롤을 얇게: **`textarea`는 전역** 동일 규칙(`km-scrollbar-thin.css`) — 그 외 래퍼는 클래스 **`km-scrollbar-thin`** · 토큰은 `index.css`의 `--km-scrollbar-*` · BaseModal Paper 최소 높이는 `--base-modal-paper-min-height`(기본 340px, alert/confirm 제외)

---

## 4. Cursor / 코드 리뷰와 같이 쓰기

- 저장소 **`.cursor/rules/table-ui-pitfalls.mdc`** — JSX 작업 시 에이전트가 같은 원칙을 참고하도록 함.
- PR 시 이 문서 **§2·§3** 을 리뷰 체크리스트로 붙여도 된다.

---

## 5. 열 너비 리사이즈 훅 (`useResizableColumns`)

`<table>`에서 **헤더 열 경계를 드래그해 인접 두 열의 너비를 조절**할 때 사용한다. 가로(열 너비)만 해당하며, **본문(`td`)에는 핸들을 두지 않고 `thead`의 `th`에만 둔다**는 팀 관례를 따른다.

### 5.1 위치·역할

| 항목 | 내용 |
|------|------|
| 파일 | `src/hooks/useResizableColumns.jsx` |
| On / Off | 옵션 **`enabled`** (기본 `true`). `false`이면 `colgroup`을 렌더하지 않고, 리사이즈 동작은 모두 무시된다. |
| 저장 | **`storageKey`**를 넘기면 드래그 종료 후 열 너비 배열(JSON)을 `localStorage`에 저장한다. 화면·표마다 **키를 다르게** 부여한다. |
| 성능 | 드래그 중에는 `<col>` DOM만 갱신하고, **`mouseup` 시 한 번만** React state와 저장소를 갱신한다. |

### 5.2 옵션 요약

| 옵션 | 타입 | 설명 |
|------|------|------|
| `defaultWidthsPx` | `number[]` | 열별 초기 너비(px). 열 개수 = 표의 `<col>` 개수와 동일해야 한다. |
| `minWidthsPx` | `number[]` | 열별 최소 너비(px). **`defaultWidthsPx`와 같은 길이** 필수. |
| `storageKey` | `string` (선택) | 없으면 새로고침 후에도 너비 유지 안 함. |
| `enabled` | `boolean` (선택, 기본 `true`) | **`false`**: 리사이즈 비활성. 표의 너비는 페이지 기존 CSS(% 등)에 맡긴다. |

### 5.3 반환값

| 이름 | 설명 |
|------|------|
| `colGroup` | `<colgroup>` 노드. **`enabled === false`이면 `null`**. `<table>`의 자식 중 맨 앞에 둔다. |
| `startResize(boundaryIndex, event)` | **경계 인덱스** `boundaryIndex`는 “왼쪽 열 인덱스”(`i`와 `i+1` 사이). 마지막 열 오른쪽에는 핸들을 두지 않는다. `mousedown` 핸들러에 연결. |
| `widths` | 현재 열 너비 배열(px). 디버깅·테스트용으로 노출. |
| `enabled` | 전달한 옵션과 동일. |

드래그 시 **인접 두 열의 너비 합은 유지**된다(한쪽을 늘리면 다른 쪽이 줄어든다). 최소값은 `minWidthsPx`로 제한된다.

### 5.4 마크업·스타일 (필수 패턴)

1. **`table-layout: fixed`** 인 표에 사용한다.
2. `<table>` 직후 **`{colGroup}`** 삽입.
3. 헤더: 리사이즈할 열마다 **`km-th-col-resizable`** 클래스를 `th`에 추가하고, 열과 열 사이마다 **`km-col-resize-handle`** 요소를 둔다.  
   - **열이 `n`개이면 핸들은 최대 `n - 1`개**(마지막 열 오른쪽 제외).  
   - `boundaryIndex`는 `0 … n-2` (왼쪽부터 경계 번호).
4. 핸들 예시 (실제 인덱스는 표마다 다름):

```jsx
<th className="… km-th-col-resizable">
  열 제목
  <span
    className="km-col-resize-handle"
    onMouseDown={(e) => columnResize.startResize(0, e)}
    onClick={(e) => e.stopPropagation()}
    aria-hidden
  />
</th>
```

5. **행 클릭으로 상세/모달이 열리는 표**에서는 핸들에서 **`click` 버블을 막지 않으면** 클릭이 행으로 전달될 수 있으므로, 위처럼 **`onClick={(e) => e.stopPropagation()}`** 를 핸들에 둔다.

6. 공통 스타일은 **`admin-common.css`**에 정의되어 있다: `.km-th-col-resizable`, `.km-col-resize-handle`. 어드민 페이지는 보통 이미 `admin-common.css`를 import 한다.

7. 페이지 전용 표에서 원래 **`th`/`td`에 `%`·`min-width`·`max-width`**를 쓰고 있다면, 리사이즈 모드일 때만 충돌을 피하기 위해 **모디파이어 클래스**(예: `foo-table--resizable`)로 해당 셀 규칙을 완화한다(`width`/`min-width`/`max-width`를 `auto`/`0`/`none` 등으로 조정). 도메인 관리(`DomainManagement.css`), 워크스페이스 관리(`AdminWorkspaceManagement.css`) 참고.

### 5.5 참고 구현

- `src/components/DomainManagement.jsx` — `enabled: true`, 저장 키 `km-domain-mgmt-columns-v1`
- `src/pages/admin/AdminWorkspaceManagement.jsx` — `enabled: true`, 저장 키 `km-admin-workspace-mgmt-columns-v1`

새 화면에 적용할 때는 위 파일의 **`colgroup` 배치·헤더 핸들·`--resizable` CSS** 패턴을 복제하는 것이 안전하다.

### 5.6 헤더 드래그가 동작하지 않을 때

- **증상**: 경계를 드래그해도 열 너비가 바뀌지 않거나, 핸들이 반응하지 않는다.
- **흔한 원인**: `.km-col-resize-handle`이 `th` 오른쪽 밖으로 나가는데, **오른쪽 인접 `th`가 위에 그려져** 마우스 이벤트를 가로챈다.
- **프로젝트 내 조치**: `admin-common.css`에서 `.admin-table:has(.km-col-resize-handle)` 인 표의 **`thead tr > th`에 좌측 열부터 더 높은 `z-index`**·`overflow: visible`을 적용해 두었다. 새 표에서도 같은 전역 규칙이 적용된다.

---

## 6. BasicTable 공통 스택 (MUI Table, 푸터, 페이지네이션)

**원시 `<table>` + `useResizableColumns`**(위 §5)와 별개로, **MUI `Table`** 기반의 공통 목록 컴포넌트가 있다. 새 어드민 목록을 이 패턴으로 맞출 때 아래를 따른다.

### 6.1 구성 파일

| 역할 | 경로 |
|------|------|
| 테이블 본체 | `src/components/common/BasicTable.jsx` |
| 테이블 스코프 SCSS | `src/components/common/BasicTable.module.scss` |
| 푸터·페이지네이션 전역 클래스 | `src/components/common/BasicTable.global.css` |
| 하단 바(3열 그리드) | `src/components/common/BasicTableFooter.jsx` |
| 이전·번호·다음 UI | `src/components/common/BasicTablePaginationNav.jsx` |
| 열 너비 드래그(MUI 표용) | `src/hooks/useBasicTableColumnResize.js` |

`BasicTable.jsx`는 `BasicTable.global.css`를 import 하므로, **`BasicTable` 또는 `BasicTablePaginationNav`를 쓰는 화면**에서는 별도로 전역 CSS를 붙이지 않아도 페이지네이션·푸터 요약 클래스가 적용된다.

### 6.2 레이아웃(가로 스크롤)

- 바깥 래퍼에 **`basic-table-shell`** + 가로 스크롤(`overflow-x: auto` 등, 페이지 CSS에서 `member-mgmt-table-shell`처럼 조합).
- **권장**: 셸은 **테이블(`BasicTable`)만** 감싼다. `BasicTableFooter`는 셸 **밖**(카드 안 형제)에 두면, 푸터는 고정 폭으로 두고 표만 가로 스크롤할 수 있다.
- `BasicTable`의 **`tableFooter` 내장 옵션**을 켜면 테이블과 푸터가 `Fragment`로 형제가 된다. 이 경우에도 **셸이 푸터까지 감싸지 않도록** 페이지 구조를 맞춘다.

### 6.3 `BasicTable` props 요약

| props | 설명 |
|--------|------|
| `columns` | `{ id, label, width?, align?, ellipsis?, resizeBoundaryAfter? }[]`. `resizeBoundaryAfter`가 숫자이고 `onColumnResizeMouseDown`이 있으면 해당 열 오른쪽에 리사이즈 핸들. |
| `data` | 행 객체 배열. `id`가 있으면 행 key로 사용. |
| `renderCell` | `( { column, row, rowIndex } ) => ReactNode` — `undefined`/`null`이면 `row[column.id]` 문자열·숫자 표시. |
| `onColumnResizeMouseDown` | `useBasicTableColumnResize`의 `startResize` 연결. |
| `className` | 루트 `TableContainer`에 추가 클래스(페이지별 밀도·카드 연동). |
| `tableFooter` | 기본 `false`. 내장 푸터를 쓸 때만 객체(아래 6.4). |

### 6.4 내장 푸터 `tableFooter` (선택)

- **표시 조건**: `tableFooter`가 객체이고 **`enabled === true`** 이며, `pagination`에 `page`, `totalPages`, `onPageChange`가 모두 있을 때만 렌더된다.
- **역할**: 테이블 아래에 `BasicTableFooter`를 붙이고, 가운데는 항상 `BasicTablePaginationNav`. `summary` → 좌측(`start`), `end` → 우측.
- **선택 props**: `pagination.prevLabel`, `pagination.nextLabel` (기본 이전/다음).

```jsx
<BasicTable
  columns={columns}
  data={rows}
  tableFooter={{
    enabled: true,
    summary: <span className="basic-table-footer-summary">…</span>,
    end: null,
    pagination: {
      page,
      totalPages,
      onPageChange: setPage,
    },
  }}
/>
```

내장 푸터를 쓰지 않을 때는 `tableFooter={false}` 로 두고, 페이지에서 `BasicTableFooter` + `BasicTablePaginationNav`를 **직접** 배치한다.

```jsx
import BasicTable, { BasicTableFooter, BasicTablePaginationNav } from '…/common/BasicTable';
```

### 6.5 `BasicTableFooter` · `BasicTablePaginationNav`

- **`BasicTableFooter`**: `start` | `center` | `end` 슬롯. 비워도 3열 그리드 유지(레이아웃 흔들림 방지).
- **`BasicTablePaginationNav`**: **UI 전용 컴포넌트**(훅 아님). `page` / `totalPages` / `onPageChange`는 **부모 state**에서 넘긴다. 번호 묶음·말줄임 로직은 컴포넌트 내부.
- **전역 클래스**(마크업 규약은 `BasicTable.global.css` 주석 참고): `basic-table-pagination`, `basic-table-page-cluster`, `basic-table-page-btn`, `basic-table-page-ellipsis`, 요약용 `basic-table-footer-summary`. 간격·타이포는 **`src/index.css` `:root` 토큰**(`--spacing-*`, `--radius-*`, `--font-size-*` 등)을 쓴다.

### 6.6 열 리사이즈 `useBasicTableColumnResize`

- **원시 표용** `useResizableColumns`(§5)와 API가 다르다. MUI `BasicTable`에는 **`useBasicTableColumnResize`**만 연결한다.
- `definitions`에 열별 `defaultWidthPx`, `minWidthPx` 등을 두고, 반환된 `columns`를 `BasicTable`에 넘기고, `startResize`를 `onColumnResizeMouseDown`에 연결한다.
- 참고: `src/pages/admin/AdminMemberManagement.jsx`, `src/components/DomainManagement.jsx`(원시 표는 §5.5와 동일 파일명이나 패턴 구분).

### 6.7 사용자 관리 화면: 푸터 표시 플래그

`src/pages/admin/AdminMemberManagement.jsx` 상단 **`SHOW_MEMBER_TABLE_FOOTER`**:

- **`false`(현재 기본)**: `BasicTableFooter` 전체를 **렌더하지 않음**. 요약 문구·`BasicTablePaginationNav` JSX는 **소스에 유지**되어 있어, 나중에 상단으로 옮기거나 플래그만 `true`로 바꿔 다시 노출하기 쉽다.
- **`true`**: 푸터를 그리며, 좌측 요약 + 가운데 페이지네이션. 테이블 `data`는 **`PAGE_SIZE` 단위 슬라이스**(`paginatedMembers`), 푸터 숨김 시에는 **검색 결과 전체**(`filteredMembers`)를 넘기도록 `tableMemberRows`로 분기한다.

### 6.8 새 화면 작업 순서(체크리스트)

1. `data-table-spec.md`에서 밀도·열 정의 확인.
2. `useBasicTableColumnResize`로 열 정의·저장 키(`storageKey`) 결정.
3. 카드 + **`basic-table-shell`** 안에 `BasicTable` 배치; 푸터는 셸 밖 또는 `tableFooter` 사용 시 형제 관계 유지.
4. 클라이언트 페이지네이션 시 **`PAGE_SIZE` 상수**·`page` state·`totalPages`·`useMemo` 슬라이스 패턴을 사용자 관리와 동일하게 맞춘다.
5. 페이지네이션 UI는 **`BasicTablePaginationNav`** 재사용, 요약은 `basic-table-footer-summary` + `BasicTableFooter`의 `start`.
6. 토큰·스크롤바는 [css-design-tokens.md](./css-design-tokens.md), `km-scrollbar-thin` 규칙을 따른다.

### 6.9 `km-main-sticky-head`와 `BasicTable` 헤더 셀의 `z-index` (본문이 스티키 제목 위로 비치지 않게)

- `BasicTable`에서 열 리사이즈가 켜진 열의 `th`에는 `z-index: 40 - colIndex` 식으로 **최대 40 근처**까지 올라갈 수 있다.
- 페이지 상단 블록 **`.km-main-sticky-head`**(제목·툴바)가 `position: sticky`일 때는 이 값보다 **확실히 큰 `z-index`**(프로젝트에서는 **50**)를 두어, 스크롤 시 표 헤더·본문 텍스트가 스티키 블록 **위로 겹쳐 보이지 않게** 한다.
- 구현 참고: `src/components/common/MainLayout.css`

### 6.10 참고 화면: 시스템 설정 관리(`/admin/config`)

- **메뉴**: 어드민센터 → **시스템 설정 관리**
- **표**: 카테고리별로 `BasicTable`을 나누어 배치; 카테고리명은 표 **밖** 소제목(`section` + 제목 행), 표는 `basic-table-shell` + 카드형 래퍼로만 감쌈.
- **값 열**: 한 줄 + `text-overflow: ellipsis`; 실제로 잘린 경우에만 승인 관리와 동일한 **`Info`** 아이콘으로 `KmPopover`에 전문 표시(편집은 모달).
- **관리 열**: 수정은 도메인 관리와 동일 **`FilePen`** + `km-table-icon-btn--neutral`; `km-table-actions`의 간격은 `:root`의 `--km-table-action-icon-gap`(기본 0)을 따른다.
- **툴바 필터**: MUI `Select`의 `sx`는 **`src/pages/admin/promptToolbarSelectSx.js`**의 `promptToolbarSelectSx`를 프롬프트 관리와 공유한다.

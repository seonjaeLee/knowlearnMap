# 좌·우 분할 패널 드래그 리사이즈 — 개발 가이드

## 연관 문서

- [../foundation/layout-guideline.md](../foundation/layout-guideline.md) — 페이지 본문 flex·높이 체인
- [../foundation/design-tokens.md](../foundation/design-tokens.md) — `--spacing-*`, `--color-accent` 등
- [../table/dev-guide-table-ui.md](../table/dev-guide-table-ui.md) — **표 열** 리사이즈(`useResizableColumns`) — 본 가이드와 축이 다름
- **참고 구현:** `src/pages/admin/semantic/SemanticEntitySplitPage.jsx` (접기·필터 연동 예시)

---

## 1. 개요

**좌측 패널 + 세로 리사이저 + 우측 패널** 구조에서, 사용자가 가운데 선을 드래그해 좌측 너비(%)를 조절할 때 사용한다.

| 구분 | 표 열 리사이즈 | 패널 리사이즈 (본 문서) |
|------|----------------|-------------------------|
| 훅 | `useResizableColumns` | `useSplitPaneResize` |
| UI | `BasicTable` 헤더 핸들 | `SplitPane` 세로 separator |
| 단위 | px (열 너비 배열) | % (좌측 비율) |

---

## 2. 공통 파일

| 경로 | 역할 |
|------|------|
| `src/hooks/useSplitPaneResize.js` | 드래그·% clamp·`localStorage` 저장 (`loadSplitPanePercent`, `saveSplitPanePercent` export) |
| `src/components/common/SplitPane/SplitPane.jsx` | 좌·우 슬롯 + 리사이저 DOM |
| `src/components/common/SplitPane/SplitPane.module.scss` | flex 레이아웃·구분선·패널 간 `gap`(12px) |
| `src/components/common/SplitPane/SplitPane.global.css` | 드래그 중 `body.kl-split-pane-resizing` 커서·선택 방지 |

**import**

```jsx
import SplitPane from '../../components/common/SplitPane';
// 또는
import SplitPane from '../../components/common/SplitPane/SplitPane';
```

`SplitPane.jsx`를 import하면 `SplitPane.global.css`가 함께 로드된다.

---

## 3. 기본 사용법

### 3.1 최소 예시

```jsx
function MyTwoPanelPage() {
  return (
    <div className="my-page-root">
      <SplitPane
        left={<aside>좌측 콘텐츠</aside>}
        right={<main>우측 콘텐츠</main>}
        defaultLeftPercent={40}
        minLeftPercent={20}
        maxLeftPercent={70}
        percentStorageKey="my_page_split_percent"
      />
    </div>
  );
}
```

### 3.2 `SplitPane` props

| prop | 기본값 | 설명 |
|------|--------|------|
| `left` | (필수) | 좌측 React 노드 |
| `right` | (필수) | 우측 React 노드 |
| `leftCollapsed` | `false` | `true`면 좌측을 `collapsedLeftWidthPx` 고정, **리사이저 숨김** |
| `defaultLeftPercent` | `45` | 최초·저장값 없을 때 좌측 % |
| `minLeftPercent` | `20` | 드래그 하한 % |
| `maxLeftPercent` | `60` | 드래그 상한 % |
| `collapsedLeftWidthPx` | `300` | 접힘 시 좌측 px |
| `minCollapsedLeftWidthPx` | `250` | 접힘 시 좌측 최소 px |
| `percentStorageKey` | — | 있으면 드래그 종료 후 %를 `localStorage`에 저장 |
| `onResizeStart` | — | 드래그 시작 직전 콜백 (접힘 해제 등) |
| `className` | `''` | 루트 추가 클래스 (높이·flex용) |
| `leftPaneClassName` | `''` | 좌측 패널 추가 클래스 |
| `rightPaneClassName` | `''` | 우측 패널 추가 클래스 |
| `resizerAriaLabel` | `패널 너비 조절` | separator 접근성 라벨 |

---

## 4. 페이지에 붙일 때 체크리스트

### 4.1 높이·flex 체인

`SplitPane` 루트는 `flex: 1; min-height: 0` 이다. **부모가 세로 공간을 넘겨줘야** 내부 스크롤이 동작한다.

```css
/* 페이지 루트 예시 */
.my-page-root {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* SplitPane에 줄 클래스 예시 */
.my-split-layout {
  flex: 1;
  min-height: 0;
}
```

```jsx
<SplitPane className="my-split-layout" left={...} right={...} />
```

### 4.2 좌·우 패널 내부

각 패널 콘텐츠도 `min-height: 0` + 필요 시 `overflow: auto` 를 갖도록 한다. 표·트리는 패널 **안쪽** 래퍼에서 스크롤한다.

### 4.3 `localStorage` 키

- 화면·탭마다 **서로 다른** `percentStorageKey` 를 쓴다.
- 예: `admin_semantic_object_split_percent`

### 4.4 접기·펼치기가 있는 화면

`SplitPane`은 **접힘 상태만** 받는다. `>` 버튼·카테고리 선택 시 접기 등 **업무 로직은 페이지**에서 처리한다.

```jsx
const [leftExpanded, setLeftExpanded] = useState(true);

<SplitPane
  leftCollapsed={!leftExpanded}
  left={leftPanel}
  right={rightPanel}
  percentStorageKey="my_page_split_percent"
/>
```

- **펼침:** 드래그로 저장된 % (또는 `defaultLeftPercent`) + 리사이저 표시
- **접힘:** `collapsedLeftWidthPx` 고정 + 리사이저 숨김

---

## 5. 접기·필터 등 페이지 전용 동작 (시멘틱 참고)

온톨로지 옵션(`SemanticEntitySplitPage`) 패턴:

| 동작 | 구현 위치 |
|------|-----------|
| `>` 펼치기 / `<` 접기 | `useSemanticEntityAdmin` → `leftExpanded` + `localStorage` (`leftExpandedKey`) |
| 카테고리 클릭 시 좌측 접기 | `onSelectCategory` → `setLeftExpandedPersist(false)` |
| 「전체」+ 펼침 | 필터 해제 후 `setLeftExpandedPersist(true)` |
| 드래그 % 저장 | `config.splitPanePercentKey` → `SplitPane` `percentStorageKey` |

**원칙:** 드래그·%·구분선은 공통 `SplitPane`, 버튼·필터·데이터는 페이지 훅/컴포넌트.

---

## 6. 훅만 직접 쓰는 경우

커스텀 마크업이 필요하면 `useSplitPaneResize`를 직접 사용할 수 있다. (`SplitPane`과 동일 로직)

```jsx
import { useRef } from 'react';
import { useSplitPaneResize } from '../../hooks/useSplitPaneResize';

function CustomSplit() {
  const containerRef = useRef(null);
  const { leftPaneStyle, handleResizerPointerDown, isResizerEnabled } = useSplitPaneResize({
    containerRef,
    leftCollapsed: false,
    percentStorageKey: 'custom_split',
  });

  return (
    <div ref={containerRef} style={{ display: 'flex' }}>
      <div style={leftPaneStyle}>...</div>
      {isResizerEnabled && (
        <div role="separator" onPointerDown={handleResizerPointerDown} />
      )}
      <div style={{ flex: 1 }}>...</div>
    </div>
  );
}
```

일반적으로는 **`SplitPane` 사용을 권장**한다 (gap·구분선·드래그 중 body 클래스 일원화).

---

## 7. 스타일·여백

- 패널 사이 **12px gap**은 `SplitPane.module.scss`의 `:root` `gap: calc(var(--spacing-sm) + var(--spacing-xs))` 로 고정한다.
- 구분선은 리사이저 `::after` 1px (`--color-border-subtle`), hover 시 accent.
- 페이지별로 좌·우 **추가 여백**이 필요하면 `leftPaneClassName` / `rightPaneClassName` 에 페이지 CSS를 붙인다. **음수 마진으로 gap을 상쇄하지 않는다.**

---

## 8. 피해야 할 것

| 하지 말 것 | 이유 |
|------------|------|
| `SplitPane` 없이 flex만 두고 드래그 로직 복사 | gap·저장·드래그 중 커서 불일치 |
| `percentStorageKey` 를 여러 화면이 공유 | 한 화면에서 조절한 %가 다른 화면에 적용됨 |
| 부모 높이 없이 `SplitPane`만 배치 | 패널이 0 높이·스크롤 깨짐 |
| 접힌 상태에서 리사이저만 노출 | 현재는 `leftCollapsed` 시 리사이저 비표시 — 접기는 토글로 |
| 표 열 리사이즈 훅과 혼동 | `useResizableColumns` ≠ `useSplitPaneResize` |

---

## 9. 신규 화면 적용 순서 (요약)

1. 좌·우 콘텐츠를 컴포넌트/JSX로 분리
2. 페이지 루트에 **flex + `min-height: 0`** 적용
3. `SplitPane`으로 감싸고 `percentStorageKey` 지정
4. (선택) 접기 버튼이 있으면 `leftCollapsed` 상태를 페이지에서 관리
5. 좌·우 패널 내부 스크롤·표 영역 QA
6. 새로고침 후 `localStorage` % 유지 확인

---

## 10. 체크항목

**Q. 상하(행) 분할도 되나요?**  
A. 현재 훅·컴포넌트는 **세로(좌·우) 전용**이다. 상하 분할이 필요하면 별도 옵션·훅 확장이 필요하다.

**Q. MUI `Drawer`와 함께 써도 되나요?**  
A. 가능하다. `SplitPane`은 MUI 비의존 div flex이므로, Drawer **밖** 본문 영역에 두면 된다.

**Q. 모바일에서는?**  
A. 좁은 뷰포트에서는 접기만 쓰거나, `maxLeftPercent`·`collapsedLeftWidthPx`를 페이지 CSS 미디어쿼리와 함께 조정하는 방안을 검토한다. (공통 컴포넌트 기본값은 데스크톱 어드민 기준)

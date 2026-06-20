# 워크스페이스 카드 아이콘 키워드 매칭

내 워크스페이스 그리드 카드(`Home.jsx`)의 아이콘은 워크스페이스 **이름에 포함된 키워드**로 자동 결정됩니다. 매칭되는 카테고리가 없으면 기본 아이콘(`Files`)이 표시됩니다.

- 매핑 정의: [react/src/config/workspaceIconKeywords.js](../src/config/workspaceIconKeywords.js)
- 적용 위치: [react/src/pages/Home.jsx](../src/pages/Home.jsx) — `getWorkspaceIcon(notebook.name || notebook.title)`
- 매칭 방식: 키워드 배열을 순서대로 검사해 **대소문자 무관 부분일치**(`name.toLowerCase().includes(keyword.toLowerCase())`)로 첫 매칭을 사용. 카테고리 순서가 우선순위이므로, 이름에 키워드가 여러 개 겹치면 배열에서 더 앞쪽에 있는 카테고리가 이김.

## 새 카테고리 추가하는 법

`WORKSPACE_ICON_CATEGORIES` 배열에 `{ icon, keywords }` 객체를 추가합니다.

```js
{ icon: FlaskConical, keywords: ['화장품', '뷰티', 'cosmetic', 'beauty'] },
```

1. [lucide.dev/icons](https://lucide.dev/icons)에서 원하는 아이콘을 검색하고 PascalCase 컴포넌트 이름을 확인 (예: `flask-conical` → `FlaskConical`).
2. 파일 상단 `lucide-react` import에 해당 컴포넌트를 추가.
3. `WORKSPACE_ICON_CATEGORIES` 배열에 한글/영문 키워드를 함께 등록 (대소문자는 신경 쓰지 않아도 됨 — 내부에서 자동으로 소문자 비교).
4. 기존 카테고리와 키워드가 겹치면 더 구체적인 카테고리를 배열 앞쪽에 둘 것.

## 기본 아이콘 변경

매칭 실패 시 쓰이는 기본 아이콘은 `WORKSPACE_ICON_DEFAULT` (현재 `Files`)에서 바꿀 수 있습니다.

## 주의사항

- 이 매칭은 **그리드 카드 표시용**일 뿐, 워크스페이스 생성 시 저장되는 `icon`(이모지) 필드와는 무관합니다. 백엔드 데이터를 바꾸는 게 아니라 프런트엔드에서 이름을 보고 그때그때 계산합니다.
- 리스트 보기(`BasicTable`)에는 아이콘이 표시되지 않으므로 이 매핑은 그리드 보기에만 영향을 줍니다.

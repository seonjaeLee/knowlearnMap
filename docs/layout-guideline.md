# MAP Layout Guideline

MAP은 콘텐츠형 랜딩 페이지가 아니라 작업형 앱이므로, 콘텐츠를 화면에 넓게 활용하는 것을 기본으로 합니다.

## 1. 레이아웃 기본 원칙

- 본문은 `width: 100%` 기준으로 사용
- 큰 화면에서도 과도한 중앙 고정폭(`max-width` 고정) 사용 지양
- 여백은 `padding`으로만 제어해 밀도와 가독성 균형 유지
- 헤더/사이드/LNB는 고정, 본문만 스크롤되도록 구성

## 2. 콘텐츠 영역 폭 정책

- 기본: `max-width: 100%`
- 페이지 성격에 따라 선택:
  - 작업형(노트북/그래프/관리): 전체폭 우선
  - 문서형(공지/도움말): 제한폭 사용 가능(선택)

## 3. 브레이크포인트 (앱형 기준)

- Ultra wide: `>= 1920`
- Desktop large: `1600 ~ 1919`
- Desktop base: `1280 ~ 1599`
- Small desktop / tablet: `1024 ~ 1279`
- Tablet/mobile: `< 1024`

## 4. 여백 기준

- `>= 1920`: `padding-inline 18px`
- `1600 ~ 1919`: `padding-inline 16px`
- `1280 ~ 1599`: `padding-inline 14px`
- `1024 ~ 1279`: `padding-inline 12px`
- `< 1024`: `padding-inline 10px`

## 5. 타이틀 / 네비 표시

- 페이지 헤더는 3단을 기본으로 사용
  - Breadcrumb (선택)
  - Title row (제목 + 우측 액션)
  - Description (선택)
- 타이틀 위계:
  - 페이지 타이틀: `20px / 600`
  - 섹션 타이틀: `15~16px / 600`
  - 본문: `12~13px / 400~500`

## 6. 적용 우선순위

1. `MainLayout` 본문 폭/여백/브레이크포인트
2. 주요 화면 공통 헤더 구조(`DomainSelection`, `Home`, `NotebookDetail`)
3. 화면별 미세 스타일 정리

## 7. 피해야 할 패턴

- 페이지마다 다른 임의 `max-width`
- 불필요한 이중 박스(그룹 박스 + 선택 박스 중복)
- 의미 없는 과도한 그림자/장식

## 8. CSS 변수(디자인 토큰)

색·간격·폼/버튼 비활성 등은 **`src/index.css`의 `:root`**를 기준으로 하고, 네이밍·사용 원칙은 **`docs/css-design-tokens.md`**를 따른다.

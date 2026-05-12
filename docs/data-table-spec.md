# 데이터 테이블 UI 규격 (초안)

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

---

## 5. 본문 행

| 항목 | 권장 토큰 |
|------|-----------|
| 배경 | `var(--color-bg-secondary)` |
| 본문 텍스트 | `var(--color-text-primary)` |
| 행 구분 | `border-bottom: 1px solid var(--color-border-subtle)` |
| 줄무늬(zebra) | **기본 없음**. 필요 시에만 교차 행에 `var(--color-bg-subtle)` |
| 호버 | `background: var(--color-bg-hover)` + `transition: var(--transition-fast)` |

---

## 6. 선택·액션 열

- **체크박스/라디오** 열: 너비는 최소한으로, 헤더 정렬은 보통 가운데.
- **아이콘만 액션**(수정·삭제): 버튼형일 경우 **터치/클릭 영역** 최소 약 32~36px 유지(가독성·접근성).
- **삭제 등 위험 동작**: 빨강 아이콘은 프로젝트에서 쓰는 danger 색이 정해지면 그에 맞춤. 미정이면 기존 화면과 동일한 클래스만 재사용.

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

- 요약 문구: `var(--font-size-xs)`, `var(--color-text-secondary)`.
- 예: 좌측 `Showing x–y of z`, 우측 이전/다음·페이지 번호(레퍼런스와 유사한 정보 구조).

---

## 10. 구현 시 주의

- `table td` 전역 한 번에 스타일 지정은 피하고, **화면 루트 클래스** 또는 **CSS Modules** 범위 안에서 적용한다 (`css-design-tokens.md` 전역 셀렉터 주의와 동일).
- **MUI Table** 사용 시 `size="small"` 등으로 위 표의 **밀집** 단계에 가깝게 맞추고, theme에서 셀 패딩·폰트를 토큰과 연결할 수 있다.

---

## 11. 목업·요청 시

열 목록·밀도 단계·레퍼런스 링크는 [mockup-guide.md](./mockup-guide.md) §5와 함께 적어 두면 구현 협의가 빨라진다.

---

## 연관 문서

- [layout-guideline.md](./layout-guideline.md) — 본문 폭·패딩·브레이크포인트  
- [css-design-tokens.md](./css-design-tokens.md) — `:root` 변수 규칙  
- [mockup-guide.md](./mockup-guide.md) — 목업 산출물·체크리스트  
- [ui-system-outline.md](./ui-system-outline.md) — UI 정리 작업 순서

# `src/assets/styles` — KnowLearn Map 전역 스타일

## 진입점

- **`global.css`** — `main.jsx`에서 **이 파일만** import 한다.

## 디렉터리

| 폴더 | 역할 |
|------|------|
| `tokens/` | spacing, radius, typography, Map 테마 색 |
| `foundation/` | reset, body |
| `layout/` | page, toolbar, modal shell, `KlPage.css` 연동 |
| `kit/` | `kl-btn`, `kl-input`, `kl-basic-table` 등 UI 키트 |
| `patterns/` | scrollbar, split, subtabs, infotxt |
| `legacy/` | 제거 예정 모달 등 |

## 스텁 (루트 `kl-*.css`)

이전 경로·`TableToolbar.css` 등 호환용. **신규 import 금지.**

## 페이지·컴포넌트 CSS

`pages/`, `components/` co-location CSS는 **2단계**에서 `assets/styles/pages/` 등으로 이관 예정.

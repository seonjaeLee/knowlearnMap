# `src/assets/styles` — KnowLearn Map 전역 스타일

## 진입점

- **`kl-global.css`** — `main.jsx`에서 **이 파일만** import 한다.

## 디렉터리

| 폴더 | 역할 |
|------|------|
| `tokens/` | spacing, radius, typography, Map 테마 색 |
| `foundation/` | reset, body |
| `layout/` | page, toolbar, modal shell |
| `utilities/` | 원자 클래스 (`kl-vert-*` 등) — `kl-util.css` |
| `kit/` | `kl-btn`, `kl-input`, `kl-basic-table` 등 UI 키트 |
| `patterns/` | scrollbar, split, subtabs, infotxt |
| `legacy/` | 제거 예정 모달 등 |

## 페이지·컴포넌트 CSS

`pages/`, `components/` co-location CSS — 해당 jsx만 import.

**`styles/` 루트에는 `kl-global.css`와 본 README만 둔다.** 예전 `kl-*.css` 스텁·`global.css` / `kl-ui.css` 체인은 제거됨.

# knowlearnMap — 로그인 페이지 핸드오프

라이트 + 다크 모드 포함. **화면 배경은 제외** — 로그인 카드와 내부 요소만.
다크모드는 `<html data-theme="dark">` 로 전환.

## 📁 에셋
| 파일 | 용도 |
|---|---|
| `knowlearnMap.svg` | 심볼 — 라이트모드 (로그인·LNB 등) |
| `knowlearnMap-dark.svg` | 심볼 — 다크모드 (한 톤 밝게) |

---

## 🎨 토큰

```css
/* 브랜드 (라이트·다크 공통) */
:root{
  --brand:      #5a57e6;   /* 인디고 — 링크·활성·체크박스 */
  --brand-2:    #7d4fe0;   /* 바이올렛 — 그라데이션 끝색 */
  --brand-grad: linear-gradient(135deg, #5b58e8 0%, #7d4fe0 100%);
  --radius:     10px;
}

/* 라이트모드 */
[data-theme="light"]{
  --surface:        #ffffff;   /* 카드 배경 */
  --surface-2:      #eef1f6;   /* 입력창 배경 */
  --border:         #e4e8ef;
  --border-strong:  #d4dae3;
  --text-1:         #161b24;   /* 본문/입력값 */
  --text-2:         #525c6b;   /* 라벨/체크 텍스트 */
  --text-3:         #8a93a3;   /* placeholder */
  --brand-soft:     #edecfd;   /* focus 링 */
}

/* 다크모드 */
[data-theme="dark"]{
  --surface:        #171a20;
  --surface-2:      #1c2028;
  --border:         #272c36;
  --border-strong:  #333a46;
  --text-1:         #e9ecf1;
  --text-2:         #a6adba;
  --text-3:         #6f7886;
  --brand-soft:     rgba(90,87,230,.22);
}
```

> 폰트: **Pretendard** (`https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css`)

---

## 🧩 마크업

```html
<div class="login-card">

  <!-- 로고 -->
  <div class="login-logo">
    <img class="symbol" src="knowlearnMap.svg" alt="">      <!-- 다크모드는 knowlearnMap-dark.svg -->
    <div class="wordmark">knowlearn<span class="map">Map</span></div>
  </div>

  <!-- 입력 -->
  <div class="field">
    <label>Email ID</label>
    <input class="inp" type="text" placeholder="admin@company.com">
  </div>
  <div class="field">
    <label>Password</label>
    <input class="inp" type="password" placeholder="••••••••">
  </div>

  <!-- 체크박스 -->
  <div class="checks">
    <label class="chk"><input type="checkbox" checked> Save ID</label>
    <label class="chk"><input type="checkbox" checked> Save PW</label>
  </div>

  <!-- 버튼 -->
  <button class="btn-login">LOGIN</button>

  <!-- 링크 -->
  <div class="login-links">
    <a href="#">Sign Up</a>
    <span class="sep">|</span>
    <a href="#">Forgot Password</a>
  </div>

</div>
```

---

## 💅 CSS

```css
/* 카드 */
.login-card{
  width:440px; padding:48px 44px;
  background:var(--surface); border:1px solid var(--border);
  border-radius:20px;
  box-shadow:0 1px 2px rgba(20,28,46,.05), 0 18px 50px rgba(20,28,46,.10);
}

/* 로고 */
.login-logo{ display:flex; flex-direction:column; align-items:center; gap:16px; margin-bottom:36px; }
.login-logo .symbol{ width:52px; height:52px; }
.wordmark{ font-family:"Pretendard",sans-serif; font-size:23px; font-weight:800; letter-spacing:-.02em; color:var(--text-1); }
.map{
  background:var(--brand-grad);
  -webkit-background-clip:text; background-clip:text;
  -webkit-text-fill-color:transparent; color:transparent;
}

/* 입력창 */
.field{ margin-bottom:18px; }
.field label{ display:block; font-size:13px; font-weight:600; color:var(--text-2); margin-bottom:8px; }
.inp{
  width:100%; height:48px; border-radius:var(--radius);
  background:var(--surface-2); border:1px solid var(--border);
  padding:0 15px; font-size:14.5px; color:var(--text-1); outline:none; transition:.15s;
}
.inp:focus{ border-color:var(--brand); background:var(--surface); box-shadow:0 0 0 3px var(--brand-soft); }
.inp::placeholder{ color:var(--text-3); }

/* 체크박스 — 커스텀 */
.checks{ display:flex; gap:22px; justify-content:flex-end; margin:18px 2px 24px; }
.chk{ display:flex; align-items:center; gap:8px; font-size:13.5px; color:var(--text-2); font-weight:500; cursor:pointer; }
.chk input{
  appearance:none; width:18px; height:18px; border-radius:5px;
  border:1.6px solid var(--border-strong); background:var(--surface);
  display:grid; place-items:center; transition:.12s; cursor:pointer;
}
.chk input:checked{ background:var(--brand); border-color:var(--brand); }   /* 체크 시 인디고 */
.chk input:checked::after{
  content:""; width:5px; height:9px;
  border:2px solid #fff; border-top:0; border-left:0;
  transform:rotate(42deg) translateY(-1px);                                 /* 흰 체크 */
}

/* LOGIN 버튼 */
.btn-login{
  width:100%; height:50px; border-radius:var(--radius);
  background:var(--brand-grad); color:#fff;
  font-size:15px; font-weight:700; letter-spacing:.04em;
  box-shadow:0 4px 16px rgba(98,80,230,.34); transition:.15s; cursor:pointer; border:0;
}
.btn-login:hover{ filter:brightness(1.07); }

/* 하단 링크 */
.login-links{ display:flex; align-items:center; justify-content:center; gap:18px; margin-top:24px; }
.login-links a{ font-size:13.5px; color:var(--text-2); text-decoration:none; }
.login-links a:hover{ color:var(--text-1); }
.login-links .sep{ color:var(--border-strong); }
```

---

## 🌙 다크모드 심볼 교체
```js
const symbol = document.querySelector('.login-logo .symbol');
symbol.src = isDark ? 'knowlearnMap-dark.svg' : 'knowlearnMap.svg';
```

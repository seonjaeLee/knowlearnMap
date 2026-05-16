import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CssBaseline } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import * as Sentry from '@sentry/react'
import { AuthProvider } from './context/AuthContext'
import { DialogProvider } from './context/DialogContext'
import axios from 'axios'
import './styles/kl-form-control.css'
import './index.css'
import './styles/kl-scrollbar-thin.css'
import './styles/kl-table-icon-actions.css'
import './styles/kl-popover-icon-btn.css'
import './styles/kl-modal-form.css'
import './components/common/KlPage.css'
import './components/common/TableArea.css'
import './components/common/TableToolbar.css'
import App from './App.jsx'

// Sentry 초기화 (VITE_SENTRY_DSN 환경변수가 있을 때만 활성화)
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 0.3,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    sendDefaultPii: false,
  })
}

// axios 전역 CSRF 인터셉터 - 모든 axios 호출에 CSRF 토큰 자동 추가
axios.interceptors.request.use((config) => {
  if (config.method !== 'get') {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
    if (match) {
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(match[1])
    }
  }
  return config
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

const theme = createTheme({
  typography: {
    fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif",
  },
  palette: {
    primary: {
      /* MUI 기본(#1976d2) 대신 `:root --color-accent`와 동일 — primary 버튼·네이티브 포커스 테두리 톤 통일 */
      main: '#1a73e8',
      dark: '#1557b0',
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <DialogProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </DialogProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)

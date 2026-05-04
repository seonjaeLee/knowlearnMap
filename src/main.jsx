import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as Sentry from '@sentry/react'
import { AuthProvider } from './context/AuthContext'
import axios from 'axios'
import './index.css'
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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)

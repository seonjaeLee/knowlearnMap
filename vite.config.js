import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// manualChunks 제거 — 아래 런타임 에러의 근본 원인이었음:
//   · vendor-graph 분리: d3/react-force-graph 순환참조 → TDZ "Cannot access X before initialization"
//   · 기타 분리: React 의존 라이브러리(CJS→ESM 변환된)가 별도 chunk 의 React 참조 실패
//     → "Cannot read properties of undefined (reading 'forwardRef')"
// Vite/Rollup 기본 code splitting 은 entry + dynamic import 기반으로 안정적이므로 그대로 사용.
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,  // 프로덕션 빌드 시 소스맵 제거 — 빌드 시간 단축
    chunkSizeWarningLimit: 800,
  },
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

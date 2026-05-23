/**
 * API URL Configuration
 *
 * 환경별 설정:
 * - 개발 (localhost): http://localhost:8080 (Vite proxy 또는 직접 연결)
 * - 운영 (mapdev.knowlearn.kr, map.knowlearn.kr): 상대 경로 (same origin)
 *
 * 빌드 시 import.meta.env.PROD가 true이면 상대 경로 사용
 */

const getApiUrl = () => {
    const hostname = window.location.hostname;

    // 1. 운영 환경 (프로덕션 빌드 또는 운영 도메인)
    //    - 상대 경로 사용 (same origin 또는 nginx proxy)
    if (import.meta.env.PROD ||
        hostname.includes('knowlearn.kr') ||
        hostname.includes('knowlearn.com')) {
        return '';
    }

    // 2. 개발 환경 - .env의 VITE_APP_API_URL 사용
    if (import.meta.env.VITE_APP_API_URL) {
        return import.meta.env.VITE_APP_API_URL;
    }

    // 3. 로컬 개발 폴백
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:8080';
    }

    // 4. 기타 환경 - 상대 경로
    return '';
};

export const API_URL = getApiUrl();
export const API_BASE_URL = `${API_URL}/api`;

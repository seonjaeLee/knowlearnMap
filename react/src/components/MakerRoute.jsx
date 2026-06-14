import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * 제조사 전용(MAKER) 라우트 가드.
 * PrivateRoute 내부에 중첩해 사용 — 인증은 보장된 상태에서 MAKER 등급만 통과시킨다.
 *
 * [임시/유보 2026-06-12] 프롬프트 관리 안정화까지만 ADMIN도 한시적으로 통과시킨다.
 * MAKER 전용 격리 설계(2026-06-04)는 유지 — 안정화 후 `isMaker` 단독 조건으로 원복할 것.
 */
const MakerRoute = () => {
    const { isMaker, isAdmin, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    return (isMaker || isAdmin) ? <Outlet /> : <Navigate to="/workspaces" replace />;
};

export default MakerRoute;

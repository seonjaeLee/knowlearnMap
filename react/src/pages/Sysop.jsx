import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SysopMemberManagement from './sysop/SysopMemberManagement';

/**
 * SYSOP 센터 컨테이너.
 * `/sysop/*` — role `SYSOP`(도메인 운영·일반 권한)만. `ADMIN`은 어드민센터만.
 */
function Sysop() {
    const { isSysop } = useAuth();
    const navigate = useNavigate();

    const canAccessSysopCenter = isSysop;

    useEffect(() => {
        if (!canAccessSysopCenter) {
            navigate('/workspaces', { replace: true });
        }
    }, [canAccessSysopCenter, navigate]);

    if (!canAccessSysopCenter) {
        return null;
    }

    return (
        <div className="admin-container">
            <Routes>
                <Route path="/member" element={<SysopMemberManagement />} />
            </Routes>
        </div>
    );
}

export default Sysop;

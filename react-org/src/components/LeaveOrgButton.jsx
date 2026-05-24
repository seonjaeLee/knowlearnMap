import { useState } from 'react';
import { orgApi } from '../services/orgApi';
import { useAuth } from '../context/AuthContext';

/**
 * "조직 탈퇴" 버튼 (V20260429).
 * USER / VIEWER 가 본인 조직에서 탈퇴 — 탈퇴 후 organization_id=NULL, role=USER (개인 모드).
 *
 * 사용 예:
 *   <LeaveOrgButton onLeft={() => navigate('/')} />
 *
 * SYSOP/ADMIN 에는 자동으로 표시 안 됨. organization_id 없으면 표시 안 됨.
 */
export default function LeaveOrgButton({ onLeft, className, style }) {
    const { user, organizationId } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    if (!user) return null;
    if (user.role === 'SYSOP' || user.role === 'ADMIN') return null;
    if (!organizationId) return null; // 이미 개인 모드

    const handleClick = async () => {
        const ok = window.confirm(
            '현재 조직에서 탈퇴합니다.\n\n' +
            '탈퇴 후:\n' +
            '  · 조직 워크스페이스 접근 불가\n' +
            '  · 역할이 USER 로 변경 (VIEWER 였다면)\n' +
            '  · 이후 SYSOP 권한 신청 가능\n' +
            '  · 계정 자체는 유지됨\n\n' +
            '계속하시겠습니까?'
        );
        if (!ok) return;
        setSubmitting(true);
        try {
            await orgApi.leaveOrganization();
            alert('조직에서 탈퇴되었습니다. 다시 로그인해 새 권한이 반영됩니다.');
            onLeft?.();
            // 페이지 새로고침으로 AuthContext 갱신
            window.location.href = '/login';
        } catch (e) {
            alert('탈퇴 실패: ' + e.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={submitting}
            className={className}
            style={{
                padding: '6px 12px',
                background: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #fca5a5',
                borderRadius: 4,
                fontSize: 12,
                cursor: submitting ? 'wait' : 'pointer',
                ...style,
            }}
            title="현재 조직 탈퇴"
        >
            {submitting ? '처리 중...' : '조직 탈퇴'}
        </button>
    );
}

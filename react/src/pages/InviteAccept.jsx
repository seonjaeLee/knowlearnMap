import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { orgApi } from '../services/orgApi';
import './Login.css';

/**
 * 조직 멤버 초대 수락 페이지 (V20260429).
 * URL: /invite/accept?token=XXX
 *
 * 1) /api/invite/check 로 토큰 검증
 * 2) 비밀번호 입력 → /api/invite/accept
 * 3) 성공 시 로그인 페이지로 이동
 */
export default function InviteAccept() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [checking, setChecking] = useState(true);
    const [tokenInfo, setTokenInfo] = useState(null);
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('토큰이 URL 에 없습니다. MAP 의 sysop 가 보낸 초대 링크를 다시 확인하세요.');
            setChecking(false);
            return;
        }
        orgApi.checkInviteToken(token)
            .then((res) => {
                setTokenInfo(res);
                if (!res.valid) {
                    const reason = res.reason === 'expired' ? '만료된 토큰입니다.'
                        : res.reason === 'used' ? '이미 사용된 토큰입니다.'
                        : '유효하지 않은 토큰입니다.';
                    setError(reason);
                }
            })
            .catch((e) => setError(e.message || '토큰 검증 실패'))
            .finally(() => setChecking(false));
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 8) {
            setError('비밀번호는 최소 8자 이상이어야 합니다.');
            return;
        }
        if (password !== confirm) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            await orgApi.acceptInvite(token, password);
            setDone(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (e) {
            setError(e.message || '수락 실패');
        } finally {
            setSubmitting(false);
        }
    };

    if (checking) {
        return (
            <div className="login-container">
                <div className="login-box">
                    <h2>초대 확인 중...</h2>
                </div>
            </div>
        );
    }

    if (done) {
        return (
            <div className="login-container">
                <div className="login-box">
                    <h2>가입 완료 ✓</h2>
                    <p style={{ color: '#16a34a' }}>비밀번호가 설정되었습니다. 잠시 후 로그인 페이지로 이동합니다.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>조직 가입</h2>
                {tokenInfo?.valid && (
                    <p style={{ color: '#475569', fontSize: 13, marginBottom: 16 }}>
                        역할: <strong>{tokenInfo.invitedRole}</strong>
                        <br />
                        만료: {tokenInfo.expiresAt ? new Date(tokenInfo.expiresAt).toLocaleString('ko-KR') : '-'}
                    </p>
                )}
                {error && (
                    <div style={{
                        padding: '8px 12px', background: '#fee2e2', color: '#b91c1c',
                        borderRadius: 6, fontSize: 13, marginBottom: 12,
                    }}>{error}</div>
                )}
                {tokenInfo?.valid && (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>비밀번호 (8자 이상)</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                disabled={submitting}
                            />
                        </div>
                        <div className="form-group">
                            <label>비밀번호 확인</label>
                            <input
                                type="password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                required
                                minLength={8}
                                disabled={submitting}
                            />
                        </div>
                        <button type="submit" className="login-button" disabled={submitting}>
                            {submitting ? '처리 중...' : '비밀번호 설정 + 가입 완료'}
                        </button>
                    </form>
                )}
                {!tokenInfo?.valid && (
                    <button onClick={() => navigate('/login')} className="login-button" style={{ marginTop: 16 }}>
                        로그인 페이지로
                    </button>
                )}
            </div>
        </div>
    );
}

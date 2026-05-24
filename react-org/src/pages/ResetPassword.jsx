import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import './Login.css';
import { API_URL } from '../config/api';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('');
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const { showAlert } = useAlert();
    const navigate = useNavigate();

    useEffect(() => {
        const t = searchParams.get('token');
        if (t) {
            setToken(t);
        } else {
            setStatus('유효하지 않은 링크입니다.');
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('');

        if (password.length < 6) {
            setStatus('비밀번호는 6자 이상이어야 합니다.');
            return;
        }

        if (password !== confirmPassword) {
            setStatus('비밀번호가 일치하지 않습니다.');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/auth/reset-password`, { token, password });
            showAlert('비밀번호가 성공적으로 변경되었습니다. 로그인해주세요.', {
                title: '성공',
                onConfirm: () => navigate('/login')
            });
        } catch (err) {
            const message = err.response?.data || '비밀번호 변경에 실패했습니다. 링크가 만료되었거나 유효하지 않습니다.';
            setStatus(message);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="login-container">
                <div className="login-card">
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <img src="/knowlearn_logo.png" alt="KNOWLEARN MAP" style={{ height: '48px' }} />
                    </div>
                    <div className="error-message">유효하지 않은 링크입니다. (토큰 없음)</div>
                    <button className="login-btn" onClick={() => navigate('/login')}>
                        로그인 페이지로 이동
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <img src="/knowlearn_logo.png" alt="KNOWLEARN MAP" style={{ height: '48px' }} />
                </div>
                <h1>비밀번호 재설정</h1>
                {status && <div className="error-message">{status}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>새 비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="6자 이상 입력"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label>비밀번호 확인</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="비밀번호 재입력"
                            required
                        />
                    </div>
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? '변경 중...' : '비밀번호 변경'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;

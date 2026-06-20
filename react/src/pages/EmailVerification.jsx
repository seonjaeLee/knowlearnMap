import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import knowlearnMapSymbol from '../assets/knowlearnMap.svg';
import knowlearnMapSymbolDark from '../assets/knowlearnMap-dark.svg';
import './Login.css';
import { API_URL } from '../config/api';

const EmailVerification = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('인증 확인 중...');
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('유효하지 않은 링크입니다.');
            setError(true);
            return;
        }

        const verify = async () => {
            try {
                await axios.get(`${API_URL}/api/auth/verify-email?token=${token}`);
                setStatus('이메일 인증이 완료되었습니다. 비밀번호 설정 화면으로 이동합니다...');
                setTimeout(() => {
                    navigate(`/set-password?token=${token}`);
                }, 1500);
            } catch (err) {
                const errorMessage = err.response?.data || err.message || '인증에 실패했습니다. 링크가 만료되었거나 유효하지 않습니다.';
                setStatus(`인증 실패: ${errorMessage}`);
                setError(true);
            }
        };

        verify();
    }, [searchParams]);

    return (
        <div className="login-page kl-aurora-bg kl-aurora-bg--ambient">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-logo login-logo--row">
                        <img
                            className="login-logo__symbol login-logo__symbol--light"
                            src={knowlearnMapSymbol}
                            alt=""
                            aria-hidden
                        />
                        <img
                            className="login-logo__symbol login-logo__symbol--dark"
                            src={knowlearnMapSymbolDark}
                            alt=""
                            aria-hidden
                        />
                        <div className="login-wordmark">
                            knowlearn
                            <span className="login-wordmark__map">Map</span>
                        </div>
                    </div>
                    <h1 className="login-title">이메일 인증</h1>
                    <div className={error ? 'error-message' : 'success-message'}>
                        {status}
                    </div>
                    <div className="login-links">
                        <button type="button" className="login-links__btn" onClick={() => navigate('/login')}>
                            로그인으로 돌아가기
                        </button>
                    </div>
                </div>
            </div>
            <p className="login-page-copyright">© 2025 KNOWLEARN MAP. All rights reserved.</p>
        </div>
    );
};

export default EmailVerification;

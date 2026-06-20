import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import knowlearnMapSymbol from '../assets/knowlearnMap.svg';
import knowlearnMapSymbolDark from '../assets/knowlearnMap-dark.svg';
import './Login.css';
import { API_URL } from '../config/api';

const SetPassword = () => {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('');
    const [token, setToken] = useState('');
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
        if (password !== confirmPassword) {
            setStatus('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            await axios.post(`${API_URL}/api/auth/set-password`, { token, password });
            showAlert('비밀번호가 성공적으로 설정되었습니다. 로그인해주세요.', { title: '성공', onConfirm: () => navigate('/login') });
        } catch {
            setStatus('비밀번호 설정에 실패했습니다. 링크가 만료되었거나 유효하지 않습니다.');
        }
    };

    const renderLogo = () => (
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
    );

    if (!token) {
        return (
            <div className="login-page kl-aurora-bg kl-aurora-bg--ambient">
                <div className="login-container">
                    <div className="login-card">
                        {renderLogo()}
                        <h1 className="login-title">비밀번호 설정</h1>
                        <div className="error-message">{status}</div>
                    </div>
                </div>
                <p className="login-page-copyright">© 2025 KNOWLEARN MAP. All rights reserved.</p>
            </div>
        );
    }

    return (
        <div className="login-page kl-aurora-bg kl-aurora-bg--ambient">
            <div className="login-container">
                <div className="login-card">
                    {renderLogo()}
                    <h1 className="login-title">비밀번호 설정</h1>
                    {status && <div className="error-message">{status}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="login-field">
                            <label htmlFor="set-password-new">새 비밀번호</label>
                            <input
                                id="set-password-new"
                                className="login-inp"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                required
                                autoFocus
                            />
                        </div>
                        <div className="login-field">
                            <label htmlFor="set-password-confirm">비밀번호 확인</label>
                            <input
                                id="set-password-confirm"
                                className="login-inp"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                required
                            />
                        </div>
                        <button type="submit" className="login-btn kl-btn primary-full lg">
                            비밀번호 설정
                        </button>
                    </form>
                </div>
            </div>
            <p className="login-page-copyright">© 2025 KNOWLEARN MAP. All rights reserved.</p>
        </div>
    );
};

export default SetPassword;

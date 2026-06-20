import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import knowlearnMapSymbol from '../assets/knowlearnMap.svg';
import knowlearnMapSymbolDark from '../assets/knowlearnMap-dark.svg';
import './Login.css';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [agreed, setAgreed] = useState(false);
    const { signup } = useAuth();
    const { showAlert } = useAlert();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!agreed) {
            showAlert('면책조항 동의 하세요', { title: '알림' });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('유효한 이메일 형식을 입력해주세요.');
            return;
        }

        setError('');

        try {
            await signup(email);
            showAlert('인증 이메일이 발송되었습니다. 이메일을 확인하여 인증을 완료해주세요.', {
                title: '가입 성공',
                onConfirm: () => navigate('/login'),
            });
        } catch (err) {
            setError(err.response?.data || '회원가입에 실패했습니다.');
        }
    };

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
                <h1 className="login-title">SIGN UP</h1>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="login-field">
                        <label htmlFor="signup-email">Email</label>
                        <input
                            id="signup-email"
                            className="login-inp"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="user@example.com"
                            autoComplete="email"
                        />
                    </div>

                    <div className="login-disclaimer">
                        <p className="login-disclaimer__title">[면책 조항]</p>
                        <p className="login-disclaimer__body">
                            본 서비스는 기술 데모용으로 제공되며 데이터 보존을 보장하지 않습니다.
                            시스템 최적화, 보안 업데이트 등 운영상 필요 시 고객의 사전 동의나 공지 없이
                            유지 기간 이전이라도 데이터를 즉시 삭제할 수 있습니다.
                            중요 자료는 반드시 별도 백업하시기 바랍니다.
                        </p>
                        <label className="login-chk login-disclaimer__agree" htmlFor="disclaimer-agree">
                            <input
                                type="checkbox"
                                id="disclaimer-agree"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                            />
                            <span className="login-disclaimer__agree-text">
                                위 내용을 확인하였으며 이에 동의합니다.
                            </span>
                        </label>
                    </div>

                    <button type="submit" className="login-btn kl-btn primary-full lg">
                        SIGN UP
                    </button>
                </form>
                <p className="login-footer-text">
                    Already have an account?{' '}
                    <Link to="/login">Sign In</Link>
                </p>
            </div>
            </div>
            <p className="login-page-copyright">© 2025 KNOWLEARN MAP. All rights reserved.</p>
        </div>
    );
};

export default Signup;

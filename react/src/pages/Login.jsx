import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import knowlearnMapSymbol from '../assets/knowlearnMap.svg';
import knowlearnMapSymbolDark from '../assets/knowlearnMap-dark.svg';
import './Login.css';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [saveId, setSaveId] = useState(false);
    const [savePw, setSavePw] = useState(false);
    const [error, setError] = useState('');
    const [isLocked, setIsLocked] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const [showForgotModal, setShowForgotModal] = useState(false);

    useEffect(() => {
        const savedEmail = localStorage.getItem('savedEmail');
        const savedPassword = localStorage.getItem('savedPassword');

        if (savedEmail) {
            setEmail(savedEmail);
            setSaveId(true);
        }
        if (savedPassword) {
            setPassword(savedPassword);
            setSavePw(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLocked(false);
        try {
            const result = await login(email, password);
            const role = result?.user?.role;

            if (saveId) {
                localStorage.setItem('savedEmail', email);
            } else {
                localStorage.removeItem('savedEmail');
            }

            if (savePw) {
                localStorage.setItem('savedPassword', password);
            } else {
                localStorage.removeItem('savedPassword');
            }

            if (role === 'ADMIN') {
                navigate('/');
            } else if (role === 'SYSOP') {
                navigate('/sysop/member');
            } else {
                navigate('/workspaces');
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
            setIsLocked(err.locked || false);
        }
    };

    return (
        <div className="login-page kl-aurora-bg kl-aurora-bg--ambient">
            <div className="login-container">
                <div className="login-card">
                <div className="login-logo">
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
                <h1 className="login-hidden-title">SIGN IN</h1>
                {error && (
                    <div className="error-message">
                        {error}
                        {isLocked && (
                            <button
                                type="button"
                                onClick={() => setShowForgotModal(true)}
                                className="error-reset-btn"
                            >
                                비밀번호 찾기
                            </button>
                        )}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="login-field">
                        <label htmlFor="login-email">Email ID</label>
                        <input
                            id="login-email"
                            className="login-inp"
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="admin@company.com"
                            autoComplete="username"
                        />
                    </div>
                    <div className="login-field">
                        <label htmlFor="login-password">Password</label>
                        <input
                            id="login-password"
                            className="login-inp"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />
                    </div>
                    <div className="login-checks">
                        <label className="login-chk">
                            <input
                                type="checkbox"
                                checked={saveId}
                                onChange={(e) => setSaveId(e.target.checked)}
                            />
                            Save ID
                        </label>
                        <label className="login-chk">
                            <input
                                type="checkbox"
                                checked={savePw}
                                onChange={(e) => setSavePw(e.target.checked)}
                            />
                            Save PW
                        </label>
                    </div>
                    <button type="submit" className="login-btn kl-btn primary-full lg" disabled={isLocked}>
                        {isLocked ? '계정 잠금됨' : 'LOGIN'}
                    </button>
                </form>
                <div className="login-links">
                    <Link to="/signup">Sign Up</Link>
                    <span className="login-links__sep" aria-hidden>|</span>
                    <button
                        type="button"
                        className="login-links__btn"
                        onClick={() => setShowForgotModal(true)}
                    >
                        Forgot Password
                    </button>
                </div>
            </div>
            </div>

            <p className="login-page-copyright">© 2025 KNOWLEARN MAP. All rights reserved.</p>

            <ForgotPasswordModal
                isOpen={showForgotModal}
                onClose={() => setShowForgotModal(false)}
                initialEmail={email}
            />
        </div>
    );
};

export default Login;

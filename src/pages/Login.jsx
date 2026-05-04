import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
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

    // Forgot Password Modal State
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
            await login(email, password);

            // Handle Save ID
            if (saveId) {
                localStorage.setItem('savedEmail', email);
            } else {
                localStorage.removeItem('savedEmail');
            }

            // Handle Save PW (Security warning: Storing plaintext password in localStorage is unsafe for production)
            if (savePw) {
                localStorage.setItem('savedPassword', password);
            } else {
                localStorage.removeItem('savedPassword');
            }

            navigate('/');
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
            setIsLocked(err.locked || false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <img src="/knowlearn_logo_w.png" alt="KNOWLEARN MAP" style={{ height: '52px' }} />
                </div>
                <h1 style={{ visibility: 'hidden', height: '64px', margin: 0 }}>SIGN IN</h1>
                {error && (
                    <div className="error-message">
                        {error}
                        {isLocked && (
                            <button
                                type="button"
                                onClick={() => setShowForgotModal(true)}
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    marginTop: '10px',
                                    padding: '8px',
                                    background: '#646cff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                비밀번호 찾기
                            </button>
                        )}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email ID</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="user"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="password"
                        />
                    </div>
                    <div className="options-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={saveId}
                                onChange={(e) => setSaveId(e.target.checked)}
                            />
                            Save ID
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={savePw}
                                onChange={(e) => setSavePw(e.target.checked)}
                            />
                            Save PW
                        </label>
                    </div>
                    <button type="submit" className="login-btn" disabled={isLocked}>
                        {isLocked ? '계정 잠금됨' : 'LOGIN'}
                    </button>
                </form>
                <div className="login-footer">
                    <Link to="/signup" style={{ color: '#646cff' }}>Sign Up</Link>
                    <span className="divider">|</span>
                    <button className="text-btn" onClick={() => setShowForgotModal(true)}>Forgot Password</button>
                </div>
            </div>

            {/* Forgot Password Modal */}
            <ForgotPasswordModal
                isOpen={showForgotModal}
                onClose={() => setShowForgotModal(false)}
                initialEmail={email}
            />
        </div>
    );
};

export default Login;

import { useState, useEffect, memo } from 'react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { API_URL } from '../config/api';

const ForgotPasswordModal = memo(({ isOpen, onClose, initialEmail = '' }) => {
    const [email, setEmail] = useState(initialEmail);
    const [loading, setLoading] = useState(false);
    const { showAlert } = useAlert();

    // 모달이 열릴 때 initialEmail로 동기화
    useEffect(() => {
        if (isOpen) {
            setEmail(initialEmail);
        }
    }, [isOpen, initialEmail]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            showAlert('이메일을 입력해 주세요.');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
            showAlert('비밀번호 재설정 메일이 발송되었습니다. 이메일을 확인해 주세요.', { title: '알림' });
            onClose();
        } catch (err) {
            showAlert('오류가 발생했습니다. 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                <h2 style={{ marginTop: 0, marginBottom: '16px' }}>비밀번호 찾기</h2>
                <p style={{ color: '#a0a0b0', marginBottom: '20px', fontSize: '14px' }}>
                    가입하신 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.
                </p>
                <form onSubmit={handleSubmit} autoComplete="off">
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@email.com"
                            required
                            autoFocus
                            autoComplete="off"
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button
                            type="button"
                            className="login-btn"
                            style={{ flex: 1, background: '#666' }}
                            onClick={onClose}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="login-btn"
                            style={{ flex: 1 }}
                            disabled={loading}
                        >
                            {loading ? '전송 중...' : '메일 전송'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

ForgotPasswordModal.displayName = 'ForgotPasswordModal';

export default ForgotPasswordModal;

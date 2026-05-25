import { useState, useEffect, memo } from 'react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { API_URL } from '../config/api';
import BaseModal from './common/modal/BaseModal';
import {
    KL_MODAL_FORM_ELEMENT_ID,
    KL_MODAL_FORM_STACK_CLASS,
    klModalFormContentClassName,
} from './common/modal/klModalForm';
import { homeRenameModalPaperSx } from './common/modal/klModalPaper';

function isValidEmail(value) {
    const s = String(value).trim();
    if (!s) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

const ForgotPasswordModal = memo(({ isOpen, onClose, initialEmail = '' }) => {
    const [email, setEmail] = useState(initialEmail);
    const [loading, setLoading] = useState(false);
    const { showAlert } = useAlert();

    useEffect(() => {
        if (isOpen) {
            setEmail(initialEmail);
        }
    }, [isOpen, initialEmail]);

    if (!isOpen) return null;

    const emailOk = isValidEmail(email);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!emailOk) {
            showAlert('올바른 이메일 형식으로 입력해 주세요.');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/auth/forgot-password`, { email: email.trim() });
            showAlert('비밀번호 재설정 메일이 발송되었습니다. 이메일을 확인해 주세요.', { title: '알림' });
            onClose();
        } catch (err) {
            showAlert('오류가 발생했습니다. 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseModal
            open={isOpen}
            title="비밀번호 찾기"
            onClose={onClose}
            maxWidth={false}
            fullWidth={false}
            paperSx={homeRenameModalPaperSx}
            contentClassName={klModalFormContentClassName}
            actions={(
                <div className="kl-modal-actions-split">
                    <div className="kl-modal-actions-split__left" aria-hidden="true" />
                    <div className="kl-modal-actions-split__right">
                        <button
                            type="button"
                            className="kl-btn gray-outline md"
                            onClick={onClose}
                            disabled={loading}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="kl-btn primary-full md"
                            form={KL_MODAL_FORM_ELEMENT_ID}
                            disabled={loading || !emailOk}
                        >
                            {loading ? '전송 중...' : '메일 전송'}
                        </button>
                    </div>
                </div>
            )}
        >
            <form
                id={KL_MODAL_FORM_ELEMENT_ID}
                className={KL_MODAL_FORM_STACK_CLASS}
                onSubmit={handleSubmit}
                autoComplete="off"
            >
                <p className="kl-modal-form-helper">
                    가입하신 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.
                </p>
                <div className="kl-modal-form-row">
                    <label className="kl-modal-form-row__label" htmlFor="forgot-password-email">
                        이메일
                    </label>
                    <div className="kl-modal-form-row__control">
                        <input
                            id="forgot-password-email"
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@email.com"
                            autoFocus
                            autoComplete="email"
                        />
                    </div>
                </div>
            </form>
        </BaseModal>
    );
});

ForgotPasswordModal.displayName = 'ForgotPasswordModal';

export default ForgotPasswordModal;

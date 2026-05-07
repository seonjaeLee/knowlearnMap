import { useState, useEffect, memo } from 'react';
import axios from 'axios';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { useAlert } from '../context/AlertContext';
import { API_URL } from '../config/api';
import BaseModal from './common/modal/BaseModal';
import styles from './ForgotPasswordModal.module.scss';

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
        <BaseModal
            open={isOpen}
            title="비밀번호 찾기"
            onClose={onClose}
            maxWidth="xs"
            contentClassName={styles.content}
            actions={(
                <Stack direction="row" spacing={1}>
                    <Button variant="outlined" onClick={onClose} disabled={loading}>
                        취소
                    </Button>
                    <Button type="submit" form="forgot-password-form" variant="contained" disabled={loading}>
                        {loading ? '전송 중...' : '메일 전송'}
                    </Button>
                </Stack>
            )}
        >
            <Typography className={styles.description}>
                가입하신 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.
            </Typography>
            <form id="forgot-password-form" onSubmit={handleSubmit} autoComplete="off" className={styles.form}>
                <TextField
                    label="Email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                    autoFocus
                    autoComplete="off"
                    fullWidth
                    size="small"
                />
            </form>
        </BaseModal>
    );
});

ForgotPasswordModal.displayName = 'ForgotPasswordModal';

export default ForgotPasswordModal;

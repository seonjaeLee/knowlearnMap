import { createContext, useContext, useState, useCallback } from 'react';
import { useDialog } from '../hooks/useDialog';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
    const { alert, confirm } = useDialog();
    const [alertState, setAlertState] = useState({
        isOpen: false,
        message: '',
        title: '알림',
        type: 'alert', // 'alert' or 'confirm'
        onConfirm: null,
        onCancel: null
    });

    const showAlert = useCallback((message, options = {}) => {
        (async () => {
            await alert({
                title: options.title || '알림',
                message,
            });
            if (typeof options.onConfirm === 'function') {
                options.onConfirm();
            }
        })();
    }, [alert]);

    const showConfirm = useCallback((message, options = {}) => {
        return confirm({
            title: options.title || '확인',
            message,
            confirmText: options.confirmText || '확인',
            cancelText: options.cancelText || '취소',
        });
    }, [confirm]);

    const closeAlert = useCallback(() => {
        if (alertState.onConfirm && alertState.type === 'alert') {
            alertState.onConfirm();
        }
        setAlertState(prev => ({ ...prev, isOpen: false }));
    }, [alertState]);

    const handleConfirm = useCallback(() => {
        if (alertState.onConfirm) {
            alertState.onConfirm();
        }
    }, [alertState]);

    const handleCancel = useCallback(() => {
        if (alertState.onCancel) {
            alertState.onCancel();
        }
    }, [alertState]);

    return (
        <AlertContext.Provider value={{ showAlert, showConfirm, closeAlert, handleConfirm, handleCancel, alertState }}>
            {children}
        </AlertContext.Provider>
    );
};

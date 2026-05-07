import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Stack, TextField, Typography } from '@mui/material';
import BaseModal from '../components/common/modal/BaseModal';
import styles from './DialogContext.module.scss';

const DialogContext = createContext(null);

const INITIAL_STATE = {
  open: false,
  type: 'alert',
  title: '',
  message: '',
  confirmText: '확인',
  cancelText: '취소',
  defaultValue: '',
  placeholder: '',
  validator: null,
  tone: 'primary',
  disableBackdropClose: false,
  disableEscapeKeyDown: false,
};

export function DialogProvider({ children }) {
  const [dialogState, setDialogState] = useState(INITIAL_STATE);
  const [promptValue, setPromptValue] = useState('');
  const [promptError, setPromptError] = useState('');
  const resolverRef = useRef(null);

  const resetDialog = useCallback(() => {
    setDialogState(INITIAL_STATE);
    setPromptValue('');
    setPromptError('');
    resolverRef.current = null;
  }, []);

  const openDialog = useCallback((nextState) => {
    setDialogState({
      ...INITIAL_STATE,
      ...nextState,
      open: true,
    });
  }, []);

  const alert = useCallback((options) => {
    const normalized = typeof options === 'string' ? { message: options } : options;
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      openDialog({
        type: 'alert',
        title: normalized.title || '알림',
        message: normalized.message || '',
        confirmText: normalized.confirmText || '확인',
        disableBackdropClose: normalized.disableBackdropClose ?? false,
        disableEscapeKeyDown: normalized.disableEscapeKeyDown ?? false,
      });
    });
  }, [openDialog]);

  const confirm = useCallback((options) => {
    const normalized = typeof options === 'string' ? { message: options } : options;
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      openDialog({
        type: 'confirm',
        title: normalized.title || '확인',
        message: normalized.message || '',
        confirmText: normalized.confirmText || '확인',
        cancelText: normalized.cancelText || '취소',
        tone: normalized.tone || 'primary',
        disableBackdropClose: normalized.disableBackdropClose ?? false,
        disableEscapeKeyDown: normalized.disableEscapeKeyDown ?? false,
      });
    });
  }, [openDialog]);

  const prompt = useCallback((options) => {
    const normalized = typeof options === 'string' ? { message: options } : options;
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setPromptValue(normalized.defaultValue || '');
      setPromptError('');
      openDialog({
        type: 'prompt',
        title: normalized.title || '입력',
        message: normalized.message || '',
        confirmText: normalized.confirmText || '확인',
        cancelText: normalized.cancelText || '취소',
        placeholder: normalized.placeholder || '',
        defaultValue: normalized.defaultValue || '',
        validator: normalized.validator || null,
        tone: normalized.tone || 'primary',
        disableBackdropClose: normalized.disableBackdropClose ?? true,
        disableEscapeKeyDown: normalized.disableEscapeKeyDown ?? false,
      });
    });
  }, [openDialog]);

  const resolveAndClose = useCallback((value) => {
    if (resolverRef.current) {
      resolverRef.current(value);
    }
    resetDialog();
  }, [resetDialog]);

  const handleCancel = useCallback(() => {
    if (dialogState.type === 'alert') {
      resolveAndClose(undefined);
      return;
    }

    if (dialogState.type === 'confirm') {
      resolveAndClose(false);
      return;
    }

    resolveAndClose(null);
  }, [dialogState.type, resolveAndClose]);

  const handleConfirm = useCallback(() => {
    if (dialogState.type === 'alert') {
      resolveAndClose(undefined);
      return;
    }

    if (dialogState.type === 'confirm') {
      resolveAndClose(true);
      return;
    }

    if (typeof dialogState.validator === 'function') {
      const nextError = dialogState.validator(promptValue);
      if (nextError) {
        setPromptError(nextError);
        return;
      }
    }

    resolveAndClose(promptValue);
  }, [dialogState, promptValue, resolveAndClose]);

  const contextValue = useMemo(() => ({ alert, confirm, prompt }), [alert, confirm, prompt]);

  const isAlert = dialogState.type === 'alert';
  const isConfirm = dialogState.type === 'confirm';
  const isPrompt = dialogState.type === 'prompt';
  const isDecisionDialog = isAlert || isConfirm;

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      <BaseModal
        open={dialogState.open}
        title={dialogState.title}
        onClose={handleCancel}
        disableBackdropClose={dialogState.disableBackdropClose}
        disableEscapeKeyDown={dialogState.disableEscapeKeyDown}
        showCloseButton={!isDecisionDialog}
        headerAlign={isDecisionDialog ? 'center' : 'left'}
        actionsAlign={isDecisionDialog ? 'center' : 'right'}
        paperClassName={isDecisionDialog ? styles.decisionPaper : ''}
        titleClassName={isDecisionDialog ? styles.decisionTitle : ''}
        headerClassName={isDecisionDialog ? styles.decisionHeader : ''}
        contentClassName={isDecisionDialog ? styles.decisionContent : ''}
        actionsClassName={isDecisionDialog ? styles.decisionActions : ''}
        actions={(
          <Stack direction="row" spacing={1}>
            {dialogState.type !== 'alert' && (
              <Button
                variant={isDecisionDialog ? 'contained' : 'outlined'}
                onClick={handleCancel}
                className={isDecisionDialog ? styles.decisionCancelButton : ''}
              >
                {dialogState.cancelText}
              </Button>
            )}
            <Button variant="contained" color="primary" onClick={handleConfirm}>
              {dialogState.confirmText}
            </Button>
          </Stack>
        )}
      >
        {dialogState.message ? (
          <Typography className={`${styles.message} ${isDecisionDialog ? styles.decisionMessage : ''}`.trim()}>
            {dialogState.message}
          </Typography>
        ) : null}
        {isPrompt ? (
          <TextField
            fullWidth
            value={promptValue}
            placeholder={dialogState.placeholder}
            onChange={(event) => {
              setPromptValue(event.target.value);
              setPromptError('');
            }}
            error={Boolean(promptError)}
            helperText={promptError || ' '}
            autoFocus
            size="small"
            className={styles.promptInput}
          />
        ) : null}
      </BaseModal>
    </DialogContext.Provider>
  );
}

DialogProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within DialogProvider');
  }
  return context;
}

import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, Box } from '@mui/material';
import Fade from '@mui/material/Fade';
import CloseIcon from '@mui/icons-material/Close';
import styles from './BaseModal.module.scss';

function BaseModal({
  open,
  title,
  subtitle,
  onClose,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  disableBackdropClose = false,
  disableEscapeKeyDown = false,
  showCloseButton = true,
  contentClassName = '',
  paperClassName = '',
  titleClassName = '',
  headerClassName = '',
  actionsClassName = '',
  actionsAlign = 'right',
  headerAlign = 'left',
  headerVariant = 'default',
  /** true: alert/confirm — 본문·Paper를 내용 높이에 맞춤 (flex 확장 없음) */
  compactBody = false,
  /** MUI Dialog Paper `sx` — 가로·세로 등 페이지별 크기 지정 시 사용 (`maxWidth={false}`·`fullWidth={false}` 와 함께 쓰는 경우 많음) */
  paperSx,
}) {
  const mergedPaperSx = useMemo(() => {
    if (compactBody) {
      return paperSx ?? {};
    }
    return {
      display: 'flex',
      flexDirection: 'column',
      maxHeight: 'calc(100vh - 48px)',
      ...paperSx,
    };
  }, [paperSx, compactBody]);

  const handleClose = (_, reason) => {
    if (disableBackdropClose && reason === 'backdropClick') {
      return;
    }
    onClose?.();
  };

  const headerVariantClass = headerVariant === 'filled' ? styles.headerFilled : '';
  const headerAlignClass = styles[`header${headerAlign[0].toUpperCase()}${headerAlign.slice(1)}`];
  const titleRowAlignClass = styles[`titleRow${headerAlign[0].toUpperCase()}${headerAlign.slice(1)}`];
  const actionsAlignClass = styles[`actions${actionsAlign[0].toUpperCase()}${actionsAlign.slice(1)}`];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      disableEscapeKeyDown={disableEscapeKeyDown}
      TransitionComponent={Fade}
      transitionDuration={{ enter: 200, exit: 175 }}
      TransitionProps={{
        style: { transform: 'none' },
      }}
      PaperProps={{
        className: [
          styles.dialogPaper,
          compactBody ? styles.dialogPaperFit : styles.dialogPaperForm,
          paperClassName,
          'kl-base-modal-paper',
        ].filter(Boolean).join(' '),
        sx: mergedPaperSx,
      }}
      BackdropProps={{ className: [styles.backdrop, 'kl-base-modal-backdrop'].join(' ') }}
    >
      <DialogTitle className={[styles.header, headerVariantClass, headerAlignClass, headerClassName, 'kl-base-modal-header'].filter(Boolean).join(' ')}>
        <div className={[styles.titleRow, titleRowAlignClass, 'kl-base-modal-title-row'].filter(Boolean).join(' ')}>
          <Typography component="h2" className={[styles.title, titleClassName].filter(Boolean).join(' ')}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography component="p" className={styles.subtitle}>
              {subtitle}
            </Typography>
          ) : null}
        </div>
        {showCloseButton && (
          <IconButton aria-label="닫기" onClick={onClose} className={styles.closeButton}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent
        className={[
          styles.contentShell,
          compactBody ? styles.contentShellFit : '',
          'kl-base-modal-content-shell',
        ].filter(Boolean).join(' ')}
      >
        <div
          className={[
            styles.contentScroll,
            compactBody ? styles.contentScrollFit : '',
            'kl-base-modal-content',
            contentClassName,
          ].filter(Boolean).join(' ')}
        >
          <Box className={`${styles.contentInner} kl-base-modal-content-inner`.trim()}>
            {children}
          </Box>
        </div>
      </DialogContent>

      {actions ? (
        <DialogActions className={[styles.actions, actionsAlignClass, actionsClassName, 'kl-base-modal-actions'].filter(Boolean).join(' ')}>
          {actions}
        </DialogActions>
      ) : null}
    </Dialog>
  );
}

BaseModal.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  onClose: PropTypes.func,
  children: PropTypes.node,
  actions: PropTypes.node,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', false]),
  fullWidth: PropTypes.bool,
  disableBackdropClose: PropTypes.bool,
  disableEscapeKeyDown: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  contentClassName: PropTypes.string,
  paperClassName: PropTypes.string,
  titleClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  actionsClassName: PropTypes.string,
  actionsAlign: PropTypes.oneOf(['left', 'center', 'right']),
  headerAlign: PropTypes.oneOf(['left', 'center']),
  headerVariant: PropTypes.oneOf(['default', 'filled']),
  compactBody: PropTypes.bool,
  paperSx: PropTypes.object,
};

BaseModal.defaultProps = {
  title: '',
  subtitle: null,
  onClose: undefined,
  children: null,
  actions: null,
  maxWidth: 'sm',
  fullWidth: true,
  disableBackdropClose: false,
  disableEscapeKeyDown: false,
  showCloseButton: true,
  contentClassName: '',
  paperClassName: '',
  titleClassName: '',
  headerClassName: '',
  actionsClassName: '',
  actionsAlign: 'right',
  headerAlign: 'left',
  headerVariant: 'default',
  compactBody: false,
  paperSx: undefined,
};

export default BaseModal;

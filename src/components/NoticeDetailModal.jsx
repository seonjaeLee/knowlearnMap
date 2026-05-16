import { useState, useEffect } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useDialog } from '../hooks/useDialog';
import { noticeApi } from '../services/api';
import ContentRenderer from './ContentRenderer';
import BaseModal from './common/modal/BaseModal';
import './NoticeDetailModal.css';

function NoticeDetailModal({
    isOpen,
    onClose,
    noticeId,
    noticeData,
    onUpdate,
    onBackToList,
    onPrevious,
    onNext,
    hasPrevious = false,
    hasNext = false,
}) {
    const { user, isAdmin } = useAuth();
    const { confirm } = useDialog();
    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchNotice = async () => {
        if (noticeData) {
            setNotice(noticeData);
            setLoading(false);
            return;
        }
        if (!noticeId) return;
        setLoading(true);
        try {
            const data = await noticeApi.getById(noticeId);
            setNotice(data);
        } catch (error) {
            console.error('공지사항 조회 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && (noticeId || noticeData)) {
            fetchNotice();
            setIsEditing(false);
        }
    }, [isOpen, noticeId, noticeData]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isOwner = notice && user?.email === notice.authorEmail;
    const canModify = !noticeData && (isOwner || isAdmin);

    const handleEditNotice = () => {
        setIsEditing(true);
        setEditTitle(notice.title);
        setEditContent(notice.content);
    };

    const handleUpdateNotice = async () => {
        if (!editTitle.trim() || !editContent.trim()) return;

        setIsSubmitting(true);
        try {
            await noticeApi.update(noticeId, {
                title: editTitle.trim(),
                content: editContent.trim(),
                category: notice.category,
            });
            setIsEditing(false);
            fetchNotice();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('공지사항 수정 실패:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteNotice = async () => {
        const confirmed = await confirm('이 공지사항을 삭제하시겠습니까?');
        if (!confirmed) return;

        try {
            await noticeApi.delete(noticeId);
            onClose();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('공지사항 삭제 실패:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <BaseModal
            open={isOpen}
            onClose={onClose}
            title="공지사항"
            maxWidth={false}
            fullWidth={false}
            paperSx={{ width: '920px', maxWidth: 'calc(100vw - 48px)', maxHeight: 'calc(100vh - 48px)' }}
            contentClassName="notice-detail-modal-content kl-modal-form"
            actionsClassName="notice-detail-modal-actions"
            actions={(
                <div className="notice-detail-actions-layout">
                    <div className="notice-detail-actions-left">
                        <Button
                            variant="outlined"
                            color="primary"
                            className="notice-list-move-btn"
                            onClick={onBackToList || onClose}
                        >
                            목록이동
                        </Button>
                        <Button variant="outlined" onClick={onPrevious} disabled={!hasPrevious}>
                            이전글
                        </Button>
                        <Button variant="outlined" onClick={onNext} disabled={!hasNext}>
                            다음글
                        </Button>
                    </div>
                    <Button variant="contained" onClick={onClose}>
                        확인
                    </Button>
                </div>
            )}
        >
                <div className="notice-detail-modal-body">
                    {loading ? (
                        <div className="notice-detail-loading">
                            <div className="loading-spinner" />
                            <p>로딩 중...</p>
                        </div>
                    ) : notice ? (
                        <div className="notice-detail-content-wrapper">
                            <section className="notice-detail-head" aria-label="공지 정보">
                                <div className="notice-detail-head-top">
                                    <div className="notice-title-block">
                                        {notice.category && (
                                            <span className="notice-detail-category">{notice.category}</span>
                                        )}
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                className="notice-detail-title-input"
                                                placeholder="제목"
                                                aria-label="제목"
                                            />
                                        ) : (
                                            <h3 className="notice-detail-title">{notice.title}</h3>
                                        )}
                                    </div>
                                    {canModify && !isEditing && (
                                        <div className="notice-actions">
                                            <button
                                                type="button"
                                                className="btn-edit-notice"
                                                onClick={handleEditNotice}
                                                title="수정"
                                            >
                                                <Edit2 size={16} aria-hidden />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-delete-notice"
                                                onClick={handleDeleteNotice}
                                                title="삭제"
                                            >
                                                <Trash2 size={16} aria-hidden />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="notice-detail-meta-row">
                                    <div className="notice-detail-inline-meta">
                                        <span>{notice.authorEmail?.split('@')[0] || '관리자'}</span>
                                        <span>{formatDate(notice.createdAt)}</span>
                                        <span>조회 {notice.viewCount ?? 0}</span>
                                    </div>
                                    <span className="notice-detail-updated">
                                        최종수정 : {formatDate(notice.updatedAt || notice.createdAt)}
                                    </span>
                                </div>
                            </section>

                            <section className="notice-detail-body-box" aria-label="공지 내용">
                                {isEditing ? (
                                    <div className="notice-edit-form">
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="edit-content-textarea"
                                            rows={12}
                                            placeholder="내용"
                                            aria-label="내용"
                                        />
                                        <div className="edit-actions">
                                            <button
                                                type="button"
                                                className="btn-cancel-edit"
                                                onClick={() => setIsEditing(false)}
                                            >
                                                취소
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-save-edit"
                                                onClick={handleUpdateNotice}
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? '저장 중...' : '저장'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="notice-body-content">
                                        <ContentRenderer content={notice.content || '등록된 내용이 없습니다.'} />
                                    </div>
                                )}
                            </section>
                        </div>
                    ) : (
                        <div className="notice-detail-error">
                            공지사항을 불러올 수 없습니다.
                        </div>
                    )}
                </div>
        </BaseModal>
    );
}

export default NoticeDetailModal;

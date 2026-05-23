import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useDialog } from '../hooks/useDialog';
import { noticeApi } from '../services/api';
import ContentRenderer from './ContentRenderer';
import BaseModal from './common/modal/BaseModal';
import {
    supportDetailModalPaperClassName,
    supportDetailModalPaperSx,
} from './common/modal/supportDetailModalPaperSx';
import './CsDetailModal.css';

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
            paperSx={supportDetailModalPaperSx}
            paperClassName={supportDetailModalPaperClassName}
            contentClassName="cs-detail-modal-content kl-modal-form"
            actionsClassName="cs-detail-modal-actions"
            actions={(
                <div className="cs-detail-actions-layout">
                    <div className="cs-detail-actions-left">
                        <Button
                            variant="outlined"
                            className="cs-detail-post-nav-btn"
                            onClick={onPrevious}
                            disabled={!hasPrevious}
                            startIcon={<ChevronLeft className="cs-detail-post-nav-icon" size={16} aria-hidden />}
                        >
                            이전글
                        </Button>
                        <Button
                            variant="outlined"
                            className="cs-detail-post-nav-btn"
                            onClick={onNext}
                            disabled={!hasNext}
                            endIcon={<ChevronRight className="cs-detail-post-nav-icon" size={16} aria-hidden />}
                        >
                            다음글
                        </Button>
                    </div>
                    <Button variant="contained" onClick={onClose}>
                        닫기
                    </Button>
                </div>
            )}
        >
                <div className="cs-detail-modal-body">
                    {loading ? (
                        <div className="cs-detail-loading">
                            <div className="loading-spinner" />
                            <p>로딩 중...</p>
                        </div>
                    ) : notice ? (
                        <div className="cs-detail-content-wrapper">
                            <section className="cs-detail-head" aria-label="공지 정보">
                                <div className="cs-detail-head-top">
                                    <div className="cs-detail-title-block">
                                        {notice.category && (
                                            <span className="cs-detail-category">{notice.category}</span>
                                        )}
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                className="cs-detail-title-input"
                                                placeholder="제목"
                                                aria-label="제목"
                                            />
                                        ) : (
                                            <h3 className="cs-detail-title">{notice.title}</h3>
                                        )}
                                    </div>
                                    {canModify && !isEditing && (
                                        <div className="cs-detail-actions">
                                            <button
                                                type="button"
                                                className="cs-detail-btn-edit"
                                                onClick={handleEditNotice}
                                                title="수정"
                                            >
                                                <Edit2 size={16} aria-hidden />
                                            </button>
                                            <button
                                                type="button"
                                                className="cs-detail-btn-delete"
                                                onClick={handleDeleteNotice}
                                                title="삭제"
                                            >
                                                <Trash2 size={16} aria-hidden />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="cs-detail-meta-row">
                                    <div className="cs-detail-inline-meta">
                                        <span>{notice.authorEmail?.split('@')[0] || '관리자'}</span>
                                        <span>{formatDate(notice.createdAt)}</span>
                                        <span>조회 {notice.viewCount ?? 0}</span>
                                    </div>
                                    <span className="cs-detail-updated">
                                        최종수정 : {formatDate(notice.updatedAt || notice.createdAt)}
                                    </span>
                                </div>
                            </section>

                            <section
                                className={`cs-detail-body-box${isEditing ? '' : ' cs-detail-body-box--view'}`}
                                aria-label="공지 내용"
                            >
                                {isEditing ? (
                                    <div className="cs-detail-edit-form">
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="cs-detail-edit-textarea"
                                            rows={12}
                                            placeholder="내용"
                                            aria-label="내용"
                                        />
                                        <div className="cs-detail-edit-actions">
                                            <button
                                                type="button"
                                                className="cs-detail-btn-cancel"
                                                onClick={() => setIsEditing(false)}
                                            >
                                                취소
                                            </button>
                                            <button
                                                type="button"
                                                className="cs-detail-btn-save"
                                                onClick={handleUpdateNotice}
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? '저장 중...' : '저장'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="cs-detail-body-content">
                                        <ContentRenderer content={notice.content || '등록된 내용이 없습니다.'} />
                                    </div>
                                )}
                            </section>
                        </div>
                    ) : (
                        <div className="cs-detail-error">
                            공지사항을 불러올 수 없습니다.
                        </div>
                    )}
                </div>
        </BaseModal>
    );
}

export default NoticeDetailModal;

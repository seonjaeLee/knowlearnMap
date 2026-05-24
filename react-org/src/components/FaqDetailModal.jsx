import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useDialog } from '../hooks/useDialog';
import { faqApi } from '../services/api';
import ContentRenderer from './ContentRenderer';
import BaseModal from './common/modal/BaseModal';
import {
    supportDetailModalPaperClassName,
    supportDetailModalPaperSx,
} from './common/modal/supportDetailModalPaperSx';
import './CsDetailModal.css';

function FaqDetailModal({
    isOpen,
    onClose,
    faqId,
    faqData,
    onUpdate,
    onBackToList,
    onPrevious,
    onNext,
    hasPrevious = false,
    hasNext = false,
}) {
    const { user, isAdmin } = useAuth();
    const { confirm } = useDialog();
    const [faq, setFaq] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchFaq = async () => {
        if (faqData) {
            setFaq(faqData);
            setLoading(false);
            return;
        }
        if (!faqId) return;
        setLoading(true);
        try {
            const data = await faqApi.getById(faqId);
            setFaq(data);
        } catch (error) {
            console.error('FAQ 조회 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && (faqId || faqData)) {
            fetchFaq();
            setIsEditing(false);
        }
    }, [isOpen, faqId, faqData]);

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

    const isOwner = faq && (user?.email === faq.authorEmail || user?.email === faq.createdBy);
    const canModify = !faqData && (isOwner || isAdmin);

    const handleEditFaq = () => {
        setIsEditing(true);
        setEditTitle(faq.title);
        setEditContent(faq.content);
    };

    const handleUpdateFaq = async () => {
        if (!editTitle.trim() || !editContent.trim()) return;

        setIsSubmitting(true);
        try {
            await faqApi.update(faqId, {
                title: editTitle.trim(),
                content: editContent.trim(),
                category: faq.category,
            });
            setIsEditing(false);
            fetchFaq();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('FAQ 수정 실패:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteFaq = async () => {
        const confirmed = await confirm('이 FAQ를 삭제하시겠습니까?');
        if (!confirmed) return;

        try {
            await faqApi.delete(faqId);
            onClose();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('FAQ 삭제 실패:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <BaseModal
            open={isOpen}
            onClose={onClose}
            title="자주 묻는 질문"
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
                ) : faq ? (
                    <div className="cs-detail-content-wrapper">
                        <section className="cs-detail-head" aria-label="FAQ 정보">
                            <div className="cs-detail-head-top">
                                <div className="cs-detail-title-block">
                                    {faq.category && (
                                        <span className="cs-detail-category">{faq.category}</span>
                                    )}
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="cs-detail-title-input"
                                            placeholder="질문"
                                            aria-label="질문"
                                        />
                                    ) : (
                                        <h3 className="cs-detail-title">{faq.title}</h3>
                                    )}
                                </div>
                                {canModify && !isEditing && (
                                    <div className="cs-detail-actions">
                                        <button
                                            type="button"
                                            className="cs-detail-btn-edit"
                                            onClick={handleEditFaq}
                                            title="수정"
                                        >
                                            <Edit2 size={16} aria-hidden />
                                        </button>
                                        <button
                                            type="button"
                                            className="cs-detail-btn-delete"
                                            onClick={handleDeleteFaq}
                                            title="삭제"
                                        >
                                            <Trash2 size={16} aria-hidden />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="cs-detail-meta-row">
                                <div className="cs-detail-inline-meta">
                                    <span>{faq.authorEmail?.split('@')[0] || faq.createdBy || '관리자'}</span>
                                    <span>{formatDate(faq.createdAt)}</span>
                                    <span>조회 {faq.viewCount ?? 0}</span>
                                </div>
                                <span className="cs-detail-updated">
                                    최종수정 : {formatDate(faq.updatedAt || faq.createdAt)}
                                </span>
                            </div>
                        </section>

                        <section
                            className={`cs-detail-body-box${isEditing ? '' : ' cs-detail-body-box--view'}`}
                            aria-label="답변 내용"
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
                                            onClick={handleUpdateFaq}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? '저장 중...' : '저장'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="cs-detail-body-content">
                                    <ContentRenderer content={faq.content || '등록된 내용이 없습니다.'} />
                                </div>
                            )}
                        </section>
                    </div>
                ) : (
                    <div className="cs-detail-error">
                        FAQ를 불러올 수 없습니다.
                    </div>
                )}
            </div>
        </BaseModal>
    );
}

export default FaqDetailModal;

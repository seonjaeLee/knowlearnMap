import { useState, useEffect, useRef } from 'react';
import { X, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { faqApi } from '../services/api';
import ContentRenderer from './ContentRenderer';
import './FaqDetailModal.css';

function FaqDetailModal({ isOpen, onClose, faqId, onUpdate }) {
    const { user, isAdmin } = useAuth();
    const { showConfirm } = useAlert();
    const [faq, setFaq] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const modalRef = useRef(null);

    const fetchFaq = async () => {
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
        if (isOpen && faqId) {
            fetchFaq();
            setIsEditing(false);
        }
    }, [isOpen, faqId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

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
    const canModify = isOwner || isAdmin;

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
        const confirmed = await showConfirm('이 FAQ를 삭제하시겠습니까?');
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
        <div className="faq-detail-modal-overlay">
            <div className="faq-detail-modal-container" ref={modalRef}>
                <div className="faq-detail-modal-header">
                    <h2>FAQ 상세</h2>
                    <button className="faq-detail-modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="faq-detail-modal-body">
                    {loading ? (
                        <div className="faq-detail-loading">
                            <div className="loading-spinner"></div>
                            <p>로딩 중...</p>
                        </div>
                    ) : faq ? (
                        <div className="faq-detail-content-wrapper">
                            <div className="faq-main-column">
                                <div className="faq-content-section">
                                    <div className="faq-content-header">
                                        <h3 className="faq-detail-title">{faq.title}</h3>
                                        {canModify && (
                                            <div className="faq-actions">
                                                <button
                                                    className="btn-edit-faq"
                                                    onClick={handleEditFaq}
                                                    title="수정"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className="btn-delete-faq"
                                                    onClick={handleDeleteFaq}
                                                    title="삭제"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {isEditing ? (
                                        <div className="faq-edit-form">
                                            <input
                                                type="text"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                className="edit-title-input"
                                                placeholder="제목"
                                            />
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="edit-content-textarea"
                                                rows={10}
                                                placeholder="내용"
                                            />
                                            <div className="edit-actions">
                                                <button
                                                    className="btn-cancel-edit"
                                                    onClick={() => setIsEditing(false)}
                                                >
                                                    취소
                                                </button>
                                                <button
                                                    className="btn-save-edit"
                                                    onClick={handleUpdateFaq}
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? '저장 중...' : '저장'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="faq-body-content">
                                            <ContentRenderer content={faq.content} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="faq-sidebar-column">
                                <div className="meta-info-box">
                                    <div className="meta-row">
                                        <span className="meta-label">작성자</span>
                                        <span className="meta-value">{faq.authorEmail?.split('@')[0] || faq.createdBy || '-'}</span>
                                    </div>
                                    <div className="meta-row">
                                        <span className="meta-label">작성일</span>
                                        <span className="meta-value">{formatDate(faq.createdAt)}</span>
                                    </div>
                                    <div className="meta-row">
                                        <span className="meta-label">최근 수정</span>
                                        <span className="meta-value">{formatDate(faq.updatedAt || faq.createdAt)}</span>
                                    </div>
                                    <div className="meta-divider"></div>
                                    <div className="meta-row">
                                        <span className="meta-label">조회수</span>
                                        <span className="meta-value">{faq.viewCount}</span>
                                    </div>
                                    {faq.category && (
                                        <div className="meta-row">
                                            <span className="meta-label">카테고리</span>
                                            <span className="meta-value">{faq.category}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="faq-detail-error">
                            FAQ를 불러올 수 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FaqDetailModal;

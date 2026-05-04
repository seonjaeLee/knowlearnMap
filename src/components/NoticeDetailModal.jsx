import { useState, useEffect, useRef } from 'react';
import { X, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { noticeApi } from '../services/api';
import ContentRenderer from './ContentRenderer';
import './NoticeDetailModal.css';

function NoticeDetailModal({ isOpen, onClose, noticeId, onUpdate }) {
    const { user, isAdmin } = useAuth();
    const { showConfirm } = useAlert();
    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const modalRef = useRef(null);

    const fetchNotice = async () => {
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
        if (isOpen && noticeId) {
            fetchNotice();
            setIsEditing(false);
        }
    }, [isOpen, noticeId]);

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

    const isOwner = notice && user?.email === notice.authorEmail;
    const canModify = isOwner || isAdmin;

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
        const confirmed = await showConfirm('이 공지사항을 삭제하시겠습니까?');
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
        <div className="notice-detail-modal-overlay">
            <div className="notice-detail-modal-container" ref={modalRef}>
                <div className="notice-detail-modal-header">
                    <h2>공지사항</h2>
                    <button className="notice-detail-modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="notice-detail-modal-body">
                    {loading ? (
                        <div className="notice-detail-loading">
                            <div className="loading-spinner"></div>
                            <p>로딩 중...</p>
                        </div>
                    ) : notice ? (
                        <div className="notice-detail-content-wrapper">
                            <div className="notice-main-column">
                                <div className="notice-content-section">
                                    <div className="notice-content-header">
                                        <h3 className="notice-detail-title">{notice.title}</h3>
                                        {canModify && (
                                            <div className="notice-actions">
                                                <button
                                                    className="btn-edit-notice"
                                                    onClick={handleEditNotice}
                                                    title="수정"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className="btn-delete-notice"
                                                    onClick={handleDeleteNotice}
                                                    title="삭제"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {isEditing ? (
                                        <div className="notice-edit-form">
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
                                                    onClick={handleUpdateNotice}
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? '저장 중...' : '저장'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="notice-body-content">
                                            <ContentRenderer content={notice.content} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="notice-sidebar-column">
                                <div className="meta-info-box">
                                    <div className="meta-row">
                                        <span className="meta-label">작성자</span>
                                        <span className="meta-value">{notice.authorEmail?.split('@')[0] || '관리자'}</span>
                                    </div>
                                    <div className="meta-row">
                                        <span className="meta-label">작성일</span>
                                        <span className="meta-value">{formatDate(notice.createdAt)}</span>
                                    </div>
                                    <div className="meta-row">
                                        <span className="meta-label">최근 수정</span>
                                        <span className="meta-value">{formatDate(notice.updatedAt || notice.createdAt)}</span>
                                    </div>
                                    <div className="meta-divider"></div>
                                    <div className="meta-row">
                                        <span className="meta-label">조회수</span>
                                        <span className="meta-value">{notice.viewCount}</span>
                                    </div>
                                    {notice.category && (
                                        <div className="meta-row">
                                            <span className="meta-label">카테고리</span>
                                            <span className="meta-value">{notice.category}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="notice-detail-error">
                            공지사항을 불러올 수 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NoticeDetailModal;

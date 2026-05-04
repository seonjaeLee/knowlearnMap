import { useState, useEffect, useRef } from 'react';
import { X, Bell } from 'lucide-react';
import { noticeApi } from '../services/api';
import './NoticePopupModal.css';

function NoticePopupModal({ isOpen, onClose }) {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const modalRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            fetchUnread();
        }
    }, [isOpen]);

    const fetchUnread = async () => {
        setLoading(true);
        try {
            const data = await noticeApi.getUnread();
            setNotices(Array.isArray(data) ? data : []);
        } catch (error) {
            setNotices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const handleMarkAllRead = async () => {
        try {
            await noticeApi.markAllAsRead();
            onClose();
        } catch (error) {
            console.error('모두 읽음 처리 실패:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="notice-popup-overlay">
            <div className="notice-popup-container" ref={modalRef}>
                <div className="notice-popup-header">
                    <div className="notice-popup-title">
                        <Bell size={20} />
                        <h3>읽지 않은 공지사항</h3>
                    </div>
                    <button className="notice-popup-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="notice-popup-body">
                    {loading ? (
                        <div className="notice-popup-loading">로딩 중...</div>
                    ) : notices.length === 0 ? (
                        <div className="notice-popup-empty">새로운 공지사항이 없습니다.</div>
                    ) : (
                        <div className="notice-popup-list">
                            {notices.map((notice) => (
                                <div key={notice.id} className="notice-popup-item">
                                    <div className="notice-popup-item-title">{notice.title}</div>
                                    <div className="notice-popup-item-date">
                                        {new Date(notice.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="notice-popup-footer">
                    {notices.length > 0 && (
                        <button className="btn-mark-all" onClick={handleMarkAllRead}>
                            모두 읽음 처리
                        </button>
                    )}
                    <button className="btn-close-popup" onClick={onClose}>
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NoticePopupModal;

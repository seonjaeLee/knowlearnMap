import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { noticeApi } from '../../services/api';
import './NotificationBell.css';

function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadNotices, setUnreadNotices] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchUnreadCount = async () => {
        try {
            const count = await noticeApi.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            // Silently ignore errors for notification count
        }
    };

    const fetchUnreadNotices = async () => {
        try {
            const notices = await noticeApi.getUnread();
            setUnreadNotices(Array.isArray(notices) ? notices.slice(0, 5) : []);
        } catch (error) {
            setUnreadNotices([]);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 60000); // Poll every 60s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen]);

    const handleBellClick = () => {
        if (!isDropdownOpen) {
            fetchUnreadNotices();
        }
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleNoticeClick = async (noticeId) => {
        try {
            await noticeApi.markAsRead(noticeId);
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            // ignore
        }
        setIsDropdownOpen(false);
        navigate('/notices');
    };

    const handleMarkAllRead = async () => {
        try {
            await noticeApi.markAllAsRead();
            setUnreadCount(0);
            setUnreadNotices([]);
        } catch (error) {
            console.error('모두 읽음 처리 실패:', error);
        }
    };

    const handleViewAll = () => {
        setIsDropdownOpen(false);
        navigate('/notices');
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <button className="notification-bell-btn" onClick={handleBellClick} title="알림">
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isDropdownOpen && (
                <div className="notification-dropdown">
                    <div className="notification-dropdown-header">
                        <span>공지사항</span>
                        {unreadCount > 0 && (
                            <button className="btn-mark-all-read" onClick={handleMarkAllRead}>
                                모두 읽음
                            </button>
                        )}
                    </div>
                    <div className="notification-dropdown-body">
                        {unreadNotices.length === 0 ? (
                            <div className="notification-empty">새로운 공지사항이 없습니다.</div>
                        ) : (
                            unreadNotices.map((notice) => (
                                <div
                                    key={notice.id}
                                    className="notification-item"
                                    onClick={() => handleNoticeClick(notice.id)}
                                >
                                    <div className="notification-item-title">{notice.title}</div>
                                    <div className="notification-item-date">
                                        {new Date(notice.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="notification-dropdown-footer">
                        <button className="btn-view-all" onClick={handleViewAll}>
                            전체 보기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationBell;

import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { noticeApi } from '../services/api';
import NoticeCreateModal from '../components/NoticeCreateModal';
import NoticeDetailModal from '../components/NoticeDetailModal';
import PageHeader from '../components/common/PageHeader';
import './NoticeList.css';

function NoticeList() {
    const { user } = useAuth();
    const { showAlert } = useAlert();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState(null);
    const [selectedNoticeId, setSelectedNoticeId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const fetchNotices = async () => {
        setLoading(true);
        try {
            const params = { page: currentPage, size: 10 };
            if (searchKeyword) params.keyword = searchKeyword;

            const response = await noticeApi.getAll(params);
            setNotices(response.data || []);
            setTotalElements(response.totalElements || 0);
            setTotalPages(response.totalPages || 0);
        } catch (error) {
            console.error('공지사항 목록 조회 실패:', error);
            showAlert('공지사항 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, [currentPage]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchNotices();
    };

    const handleCreateNotice = async (noticeData) => {
        try {
            if (editingNotice) {
                await noticeApi.update(editingNotice.id, noticeData);
                showAlert('공지사항이 수정되었습니다.');
            } else {
                await noticeApi.create(noticeData);
                showAlert('공지사항이 등록되었습니다.');
            }
            fetchNotices();
        } catch (error) {
            console.error('공지사항 저장 실패:', error);
            showAlert('공지사항 저장에 실패했습니다.');
            throw error;
        }
    };

    const handleNoticeClick = (noticeId) => {
        setSelectedNoticeId(noticeId);
        setIsDetailModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingNotice(null);
        setIsCreateModalOpen(true);
    };

    const isAdmin = user?.role === 'ADMIN' || user?.email === 'admin';

    return (
        <div className="notice-page">
            <div className="notice-container">
                <PageHeader
                    title="공지사항"
                    breadcrumbs={['고객센터', '공지사항']}
                    actions={isAdmin ? (
                        <button className="notice-create-btn" onClick={openCreateModal}>
                            <Plus size={18} />
                            공지사항 등록
                        </button>
                    ) : null}
                />

                <div className="notice-toolbar">
                    <div className="notice-search-wrapper">
                        <Search size={18} className="search-icon" />
                        <form onSubmit={handleSearch}>
                            <input
                                type="text"
                                placeholder="공지사항 검색"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                            />
                        </form>
                    </div>
                </div>

                <div className="notice-list-container">
                    <table className="notice-table">
                        <thead>
                            <tr>
                                <th className="th-title">제목</th>
                                <th className="th-author">작성자</th>
                                <th className="th-created">작성일</th>
                                <th className="th-views">조회수</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="td-loading">로딩 중...</td>
                                </tr>
                            ) : notices.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="td-empty">공지사항이 없습니다.</td>
                                </tr>
                            ) : (
                                notices.map((notice) => (
                                    <tr
                                        key={notice.id}
                                        onClick={() => handleNoticeClick(notice.id)}
                                        className={`notice-row ${!notice.isRead ? 'unread' : ''} ${notice.isPinned ? 'pinned' : ''}`}
                                    >
                                        <td className="td-title">
                                            {notice.isPinned && <span className="pin-badge">고정</span>}
                                            <span className="notice-title-text">{notice.title}</span>
                                            {!notice.isRead && <span className="new-badge">N</span>}
                                        </td>
                                        <td className="td-author">{notice.authorEmail?.split('@')[0] || '관리자'}</td>
                                        <td className="td-created">{new Date(notice.createdAt).toLocaleDateString()}</td>
                                        <td className="td-views">{notice.viewCount}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="notice-pagination">
                        <button
                            className="pagination-btn"
                            disabled={currentPage === 0}
                            onClick={() => setCurrentPage(currentPage - 1)}
                        >
                            이전
                        </button>
                        <span className="pagination-info">
                            {currentPage + 1} / {totalPages}
                        </span>
                        <button
                            className="pagination-btn"
                            disabled={currentPage >= totalPages - 1}
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                            다음
                        </button>
                    </div>
                )}
            </div>

            <NoticeCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditingNotice(null);
                }}
                onSubmit={handleCreateNotice}
                editingNotice={editingNotice}
            />

            <NoticeDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedNoticeId(null);
                }}
                noticeId={selectedNoticeId}
                onUpdate={fetchNotices}
            />
        </div>
    );
}

export default NoticeList;

import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NoticeCreateModal from '../components/NoticeCreateModal';
import NoticeDetailModal from '../components/NoticeDetailModal';
import PageHeader from '../components/common/PageHeader';
import BasicTable from '../components/common/BasicTable';
import { mockNotices } from '../data/supportMockData';
import './admin/admin-common.css';
import './NoticeList.css';
import './SupportCenter.css';

const noticeColumns = [
  { id: 'title', label: '제목', width: '46%', align: 'left' },
  { id: 'category', label: '분류', width: 112, align: 'left' },
  { id: 'author', label: '작성자', width: 120, align: 'left' },
  { id: 'createdAt', label: '작성일', width: 120, align: 'left' },
  { id: 'viewCount', label: '조회수', width: 88, align: 'center', ellipsis: false },
];

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('ko-KR');
}

function NoticeList() {
  const { user } = useAuth();
  const [notices, setNotices] = useState(mockNotices);
  const [noticeSearch, setNoticeSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedNoticeId, setSelectedNoticeId] = useState(null);

  const isAdmin = user?.role === 'ADMIN' || user?.email === 'admin';

  const filteredNotices = useMemo(() => {
    const q = noticeSearch.trim().toLowerCase();
    if (!q) return notices;
    return notices.filter((notice) => (
      `${notice.title} ${notice.category} ${notice.authorEmail}`.toLowerCase().includes(q)
    ));
  }, [notices, noticeSearch]);

  const selectedNotice = useMemo(
    () => notices.find((notice) => notice.id === selectedNoticeId) || null,
    [notices, selectedNoticeId]
  );
  const selectedNoticeIndex = useMemo(
    () => filteredNotices.findIndex((notice) => notice.id === selectedNoticeId),
    [filteredNotices, selectedNoticeId]
  );

  const handleCreateNotice = async (noticeData) => {
    const nextId = notices.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
    setNotices((prev) => [
      {
        id: nextId,
        ...noticeData,
        category: noticeData.category || '공지',
        authorEmail: user?.email || 'admin@knowlearn.co.kr',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        viewCount: 0,
        isPinned: false,
        isRead: false,
      },
      ...prev,
    ]);
  };

  const handleNoticeClick = (notice) => {
    setSelectedNoticeId(notice.id);
    setNotices((prev) => prev.map((item) => (
      item.id === notice.id ? { ...item, isRead: true, viewCount: (item.viewCount ?? 0) + 1 } : item
    )));
  };

  const handleMoveNotice = (direction) => {
    if (selectedNoticeIndex < 0) return;
    const nextIndex = selectedNoticeIndex + direction;
    const nextNotice = filteredNotices[nextIndex];
    if (nextNotice) handleNoticeClick(nextNotice);
  };

  const renderNoticeCell = ({ column, row }) => {
    switch (column.id) {
      case 'title':
        return (
          <div className="support-title-cell">
            {row.isPinned && <span className="support-badge support-badge--danger">고정</span>}
            <span className="support-title-text">{row.title}</span>
            {!row.isRead && <span className="support-badge support-badge--new">N</span>}
          </div>
        );
      case 'category':
        return <span className="support-badge support-badge--soft">{row.category || '-'}</span>;
      case 'author':
        return row.authorEmail?.split('@')[0] || '관리자';
      case 'createdAt':
        return formatDate(row.createdAt);
      case 'viewCount':
        return row.viewCount ?? 0;
      default:
        return undefined;
    }
  };

  return (
    <div className="notice-page support-page">
      <div className="km-main-sticky-head">
        <PageHeader
          title="공지사항"
          breadcrumbs={['고객센터', '공지사항']}
          actions={isAdmin ? (
            <button type="button" className="admin-btn admin-btn-primary" onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={14} aria-hidden />
              공지사항 등록
            </button>
          ) : null}
        />

        <div className="support-toolbar">
          <div className="support-search">
            <Search size={16} className="support-search-icon" aria-hidden />
            <input
              type="text"
              className="support-search-input"
              placeholder="공지사항 검색"
              value={noticeSearch}
              onChange={(e) => {
                setNoticeSearch(e.target.value);
              }}
              aria-label="공지사항 검색"
            />
          </div>
        </div>
      </div>

      <div className="support-table-card">
        <div className="support-table-shell basic-table-shell">
          {filteredNotices.length === 0 ? (
            <div className="support-empty" role="status">공지사항이 없습니다.</div>
          ) : (
            <BasicTable
              className="support-basic-table"
              columns={noticeColumns}
              data={filteredNotices}
              renderCell={renderNoticeCell}
              onRowClick={(e, { row }) => handleNoticeClick(row)}
              onRowKeyDown={(e, { row }) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleNoticeClick(row);
                }
              }}
              rowAriaLabel={(row) => `${row.title} 공지사항 상세 보기`}
              getRowClassName={(row) => [
                row.isPinned ? 'support-row-pinned' : '',
                !row.isRead ? 'support-row-unread' : '',
              ].filter(Boolean).join(' ')}
            />
          )}
        </div>
      </div>

      <NoticeCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateNotice}
        editingNotice={null}
      />

      <NoticeDetailModal
        isOpen={Boolean(selectedNotice)}
        onClose={() => setSelectedNoticeId(null)}
        noticeId={selectedNoticeId}
        noticeData={selectedNotice}
        onBackToList={() => setSelectedNoticeId(null)}
        onPrevious={() => handleMoveNotice(-1)}
        onNext={() => handleMoveNotice(1)}
        hasPrevious={selectedNoticeIndex > 0}
        hasNext={selectedNoticeIndex >= 0 && selectedNoticeIndex < filteredNotices.length - 1}
      />
    </div>
  );
}

export default NoticeList;

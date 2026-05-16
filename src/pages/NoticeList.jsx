import { useCallback, useMemo, useState } from 'react';
import { Pin, Plus, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDialog } from '../hooks/useDialog';
import NoticeCreateModal from '../components/NoticeCreateModal';
import NoticeDetailModal from '../components/NoticeDetailModal';
import PageHeader from '../components/common/PageHeader';
import BasicTable from '../components/common/BasicTable';
import SupportTableAdminActions from '../components/support/SupportTableAdminActions';
import { mockNotices } from '../data/supportMockData';
import { isSupportCenterAdmin } from '../utils/supportCenterAdmin';
import { SUPPORT_ADMIN_ACTIONS_COLUMN } from './supportCenterColumns';
import './admin/admin-common.css';
import './NoticeList.css';
import './SupportCenter.css';

const NOTICE_BASE_COLUMNS = [
  { id: 'category', label: '분류', width: 112, align: 'left' },
  { id: 'title', label: '제목', width: '46%', align: 'left' },
  { id: 'author', label: '작성자', width: 120, align: 'left' },
  { id: 'createdAt', label: '작성일', width: 120, align: 'left' },
  { id: 'viewCount', label: '조회수', width: 88, align: 'center', ellipsis: false },
];

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('ko-KR');
}

/** 고정 공지 우선, 동일 그룹 내 작성일 최신순 */
function sortNoticesForList(items) {
  return [...items].sort((a, b) => {
    const aPinned = Boolean(a.isPinned);
    const bPinned = Boolean(b.isPinned);
    if (aPinned !== bPinned) return aPinned ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function NoticeList() {
  const { user } = useAuth();
  const { confirm } = useDialog();
  const [notices, setNotices] = useState(mockNotices);
  const [noticeSearch, setNoticeSearch] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [selectedNoticeId, setSelectedNoticeId] = useState(null);

  const isAdmin = isSupportCenterAdmin(user);

  const noticeColumns = useMemo(
    () => (isAdmin ? [...NOTICE_BASE_COLUMNS, SUPPORT_ADMIN_ACTIONS_COLUMN] : NOTICE_BASE_COLUMNS),
    [isAdmin],
  );

  const filteredNotices = useMemo(() => {
    const q = noticeSearch.trim().toLowerCase();
    const matched = q
      ? notices.filter((notice) => (
        `${notice.title} ${notice.category} ${notice.authorEmail}`.toLowerCase().includes(q)
      ))
      : notices;
    return sortNoticesForList(matched);
  }, [notices, noticeSearch]);

  const selectedNotice = useMemo(
    () => notices.find((notice) => notice.id === selectedNoticeId) || null,
    [notices, selectedNoticeId]
  );
  const selectedNoticeIndex = useMemo(
    () => filteredNotices.findIndex((notice) => notice.id === selectedNoticeId),
    [filteredNotices, selectedNoticeId]
  );

  const handleSaveNotice = async (noticeData) => {
    if (editingNotice) {
      setNotices((prev) => prev.map((item) => (
        item.id === editingNotice.id
          ? {
            ...item,
            ...noticeData,
            category: noticeData.category || item.category || '공지',
            updatedAt: new Date().toISOString(),
          }
          : item
      )));
      return;
    }

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

  const handleOpenCreateModal = useCallback(() => {
    setEditingNotice(null);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((notice) => {
    setEditingNotice(notice);
    setIsFormModalOpen(true);
  }, []);

  const handleCloseFormModal = useCallback(() => {
    setIsFormModalOpen(false);
    setEditingNotice(null);
  }, []);

  const handleDeleteNotice = useCallback(async (notice) => {
    const confirmed = await confirm(`"${notice.title}" 공지사항을 삭제하시겠습니까?`);
    if (!confirmed) return;
    setNotices((prev) => prev.filter((item) => item.id !== notice.id));
    if (selectedNoticeId === notice.id) {
      setSelectedNoticeId(null);
    }
  }, [confirm, selectedNoticeId]);

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

  const renderNoticeCell = useCallback(({ column, row }) => {
    switch (column.id) {
      case 'title':
        return (
          <div className="support-title-cell">
            {row.isPinned && (
              <span className="badge-icon-pin" title="고정" aria-label="고정">
                <Pin size={14} strokeWidth={2} aria-hidden />
              </span>
            )}
            <span className="support-title-text">{row.title}</span>
            {!row.isRead && (
              <span className="badge-icon-new" aria-label="새 글">
                N
              </span>
            )}
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
      case '_actions':
        return (
          <SupportTableAdminActions
            label={row.title}
            onEdit={() => handleOpenEditModal(row)}
            onDelete={() => handleDeleteNotice(row)}
          />
        );
      default:
        return undefined;
    }
  }, [handleDeleteNotice, handleOpenEditModal]);

  return (
    <div className="kl-page notice-page">
      <div className="kl-main-sticky-head">
        <PageHeader
          title="공지사항"
          breadcrumbs={['고객센터', '공지사항']}
          actions={isAdmin ? (
            <button type="button" className="admin-btn admin-btn-primary" onClick={handleOpenCreateModal}>
              <Plus size={14} aria-hidden />
              공지사항 등록
            </button>
          ) : null}
        />

        
      </div>

      <div className="table-area">
                    <div className="table-toolbar">
                    <div className="toolbar-left">
                    <div className="search-area">
                    <Search size={16} className="search-area-icon" aria-hidden />
                    <input
                    type="text"
                    className="search-area-input"
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

        <div className="basic-table-shell">
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
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleSaveNotice}
        editingNotice={editingNotice}
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

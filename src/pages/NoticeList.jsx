import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pin, Plus, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDialog } from '../hooks/useDialog';
import NoticeCreateModal from '../components/NoticeCreateModal';
import NoticeDetailModal from '../components/NoticeDetailModal';
import PageHeader from '../components/common/PageHeader';
import BasicTable from '../components/common/BasicTable';
import SupportTableAdminActions from '../components/support/SupportTableAdminActions';
import { isSupportMockEnabled } from '../config/supportMock';
import { mockNotices } from '../data/supportMockData';
import { noticeApi } from '../services/api';
import { normalizeSupportListPayload } from '../utils/supportListResponse';
import { isSupportCenterAdmin } from '../utils/supportCenterAdmin';
import { SUPPORT_ADMIN_ACTIONS_COLUMN } from './supportCenterColumns';
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
  const { confirm, alert } = useDialog();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [noticeSearch, setNoticeSearch] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [selectedNoticeId, setSelectedNoticeId] = useState(null);

  const isAdmin = isSupportCenterAdmin(user);

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      if (isSupportMockEnabled) {
        setNotices(sortNoticesForList(mockNotices.map((item) => ({ ...item }))));
        return;
      }
      const data = await noticeApi.getAll();
      setNotices(sortNoticesForList(normalizeSupportListPayload(data)));
    } catch (error) {
      console.error('공지사항 목록 조회 실패:', error);
      setNotices([]);
      setLoadError(error.message || '공지사항을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

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
    if (isSupportMockEnabled) {
      if (editingNotice) {
        setNotices((prev) => prev.map((item) => (
          item.id === editingNotice.id
            ? {
              ...item,
              ...noticeData,
              category: noticeData.category || item.category || '일반',
              updatedAt: new Date().toISOString(),
            }
            : item
        )));
      } else {
        const nextId = notices.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
        setNotices((prev) => sortNoticesForList([{
          id: nextId,
          ...noticeData,
          category: noticeData.category || '일반',
          authorEmail: user?.email || 'admin@knowlearn.co.kr',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          viewCount: 0,
          isPinned: false,
          isRead: false,
        }, ...prev]));
      }
      return;
    }
    try {
      if (editingNotice) {
        await noticeApi.update(editingNotice.id, {
          title: noticeData.title,
          content: noticeData.content,
          category: noticeData.category || editingNotice.category,
        });
      } else {
        await noticeApi.create({
          title: noticeData.title,
          content: noticeData.content,
          category: noticeData.category,
        });
      }
      await fetchNotices();
    } catch (error) {
      console.error('공지사항 저장 실패:', error);
      await alert(error.message || '공지사항을 저장하지 못했습니다.');
      throw error;
    }
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
    const confirmed = await confirm(`"${notice.title}" 공지를 삭제하시겠습니까?`);
    if (!confirmed) return;
    if (isSupportMockEnabled) {
      setNotices((prev) => prev.filter((item) => item.id !== notice.id));
      if (selectedNoticeId === notice.id) setSelectedNoticeId(null);
      return;
    }
    try {
      await noticeApi.delete(notice.id);
      if (selectedNoticeId === notice.id) setSelectedNoticeId(null);
      await fetchNotices();
    } catch (error) {
      console.error('공지사항 삭제 실패:', error);
      await alert(error.message || '공지사항을 삭제하지 못했습니다.');
    }
  }, [confirm, alert, selectedNoticeId, fetchNotices]);

  const handleNoticeClick = useCallback(async (notice) => {
    setSelectedNoticeId(notice.id);
    if (isSupportMockEnabled) {
      setNotices((prev) => prev.map((item) => (
        item.id === notice.id ? { ...item, isRead: true, viewCount: (item.viewCount ?? 0) + 1 } : item
      )));
      return;
    }
    if (!notice.isRead) {
      try {
        await noticeApi.markAsRead(notice.id);
        setNotices((prev) => prev.map((item) => (item.id === notice.id ? { ...item, isRead: true } : item)));
      } catch (error) {
        console.error('읍음 처리 실패:', error);
      }
    }
  }, []);

  const handleDetailUpdate = useCallback(() => { fetchNotices(); }, [fetchNotices]);

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
            <button type="button" className="kl-btn kl-btn--primary" onClick={handleOpenCreateModal}>
              <Plus size={14} aria-hidden />
              공지 작성
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
          {loading ? (
            <div className="support-empty" role="status">공지사항을 불러오는 중입니다.</div>
          ) : loadError ? (
            <div className="support-empty" role="alert">{loadError}</div>
          ) : filteredNotices.length === 0 ? (
            <div className="support-empty" role="status">등록된 공지가 없습니다.</div>
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
        isOpen={Boolean(selectedNoticeId)}
        onClose={() => setSelectedNoticeId(null)}
        noticeId={selectedNoticeId}
        noticeData={isSupportMockEnabled ? selectedNotice : undefined}
        onUpdate={isSupportMockEnabled ? undefined : handleDetailUpdate}
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

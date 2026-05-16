import { useCallback, useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDialog } from '../hooks/useDialog';
import FaqCreateModal from '../components/FaqCreateModal';
import FaqDetailModal from '../components/FaqDetailModal';
import PageHeader from '../components/common/PageHeader';
import BasicTable from '../components/common/BasicTable';
import SupportTableAdminActions from '../components/support/SupportTableAdminActions';
import { mockFaqs } from '../data/supportMockData';
import { isSupportCenterAdmin } from '../utils/supportCenterAdmin';
import { SUPPORT_ADMIN_ACTIONS_COLUMN } from './supportCenterColumns';
import './admin/admin-common.css';
import './Faq.css';
import './SupportCenter.css';

const FAQ_BASE_COLUMNS = [
  { id: 'category', label: '카테고리', width: 132, align: 'left' },
  { id: 'title', label: '질문', width: '46%', align: 'left' },
  { id: 'author', label: '작성자', width: 120, align: 'left' },
  { id: 'createdAt', label: '작성일', width: 120, align: 'left' },
  { id: 'viewCount', label: '조회수', width: 88, align: 'center', ellipsis: false },
];

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('ko-KR');
}

function sortFaqsForList(items) {
  return [...items].sort((a, b) => {
    const orderA = Number(a.displayOrder) || 0;
    const orderB = Number(b.displayOrder) || 0;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function Faq() {
  const { user } = useAuth();
  const { confirm } = useDialog();
  const [faqs, setFaqs] = useState(mockFaqs);
  const [faqSearch, setFaqSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [selectedFaqId, setSelectedFaqId] = useState(null);

  const isAdmin = isSupportCenterAdmin(user);

  const faqColumns = useMemo(
    () => (isAdmin ? [...FAQ_BASE_COLUMNS, SUPPORT_ADMIN_ACTIONS_COLUMN] : FAQ_BASE_COLUMNS),
    [isAdmin],
  );

  const categories = useMemo(
    () => [...new Set(faqs.map((faq) => faq.category).filter(Boolean))],
    [faqs]
  );

  const filteredFaqs = useMemo(() => {
    const q = faqSearch.trim().toLowerCase();
    const matched = faqs.filter((faq) => {
      const matchesCategory = !selectedCategory || faq.category === selectedCategory;
      const matchesSearch = !q || `${faq.title} ${faq.category} ${faq.authorEmail}`.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
    return sortFaqsForList(matched);
  }, [faqs, faqSearch, selectedCategory]);

  const selectedFaq = useMemo(
    () => faqs.find((faq) => faq.id === selectedFaqId) || null,
    [faqs, selectedFaqId]
  );
  const selectedFaqIndex = useMemo(
    () => filteredFaqs.findIndex((faq) => faq.id === selectedFaqId),
    [filteredFaqs, selectedFaqId]
  );

  const handleSaveFaq = async (faqData) => {
    if (editingFaq) {
      setFaqs((prev) => prev.map((item) => (
        item.id === editingFaq.id
          ? {
            ...item,
            ...faqData,
            category: faqData.category || item.category || '일반',
            updatedAt: new Date().toISOString(),
          }
          : item
      )));
      return;
    }

    const nextId = faqs.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
    setFaqs((prev) => [
      {
        id: nextId,
        ...faqData,
        category: faqData.category || '일반',
        authorEmail: user?.email || 'admin@knowlearn.co.kr',
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        viewCount: 0,
        displayOrder: faqData.displayOrder ?? 0,
        isActive: faqData.isActive !== false,
      },
      ...prev,
    ]);
  };

  const handleOpenCreateModal = useCallback(() => {
    setEditingFaq(null);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((faq) => {
    setEditingFaq(faq);
    setIsFormModalOpen(true);
  }, []);

  const handleCloseFormModal = useCallback(() => {
    setIsFormModalOpen(false);
    setEditingFaq(null);
  }, []);

  const handleDeleteFaq = useCallback(async (faq) => {
    const confirmed = await confirm(`"${faq.title}" FAQ를 삭제하시겠습니까?`);
    if (!confirmed) return;
    setFaqs((prev) => prev.filter((item) => item.id !== faq.id));
    if (selectedFaqId === faq.id) {
      setSelectedFaqId(null);
    }
  }, [confirm, selectedFaqId]);

  const handleFaqClick = (faq) => {
    setSelectedFaqId(faq.id);
    setFaqs((prev) => prev.map((item) => (
      item.id === faq.id ? { ...item, viewCount: (item.viewCount ?? 0) + 1 } : item
    )));
  };

  const handleMoveFaq = (direction) => {
    if (selectedFaqIndex < 0) return;
    const nextIndex = selectedFaqIndex + direction;
    const nextFaq = filteredFaqs[nextIndex];
    if (nextFaq) handleFaqClick(nextFaq);
  };

  const renderFaqCell = useCallback(({ column, row }) => {
    switch (column.id) {
      case 'title':
        return (
          <div className="support-title-cell">
            <span className="support-title-text">{row.title}</span>
          </div>
        );
      case 'category':
        return <span className="support-badge support-badge--soft">{row.category || '-'}</span>;
      case 'author':
        return row.authorEmail?.split('@')[0] || row.createdBy || '-';
      case 'createdAt':
        return formatDate(row.createdAt);
      case 'viewCount':
        return row.viewCount ?? 0;
      case '_actions':
        return (
          <SupportTableAdminActions
            label={row.title}
            onEdit={() => handleOpenEditModal(row)}
            onDelete={() => handleDeleteFaq(row)}
          />
        );
      default:
        return undefined;
    }
  }, [handleDeleteFaq, handleOpenEditModal]);

  return (
    <div className="kl-page faq-page">
      <div className="kl-main-sticky-head">
        <PageHeader
          title="자주 묻는 질문"
          breadcrumbs={['고객센터', '자주 묻는 질문']}
          actions={isAdmin ? (
            <button type="button" className="admin-btn admin-btn-primary" onClick={handleOpenCreateModal}>
              <Plus size={14} aria-hidden />
              자주 묻는 질문 작성
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
                placeholder="FAQ 검색"
                value={faqSearch}
                onChange={(e) => {
                  setFaqSearch(e.target.value);
                }}
                aria-label="FAQ 검색"
              />
            </div>
          </div>
          <div className="toolbar-right">
            <div className="support-filter">
              <span className="filter-label">카테고리</span>
              <select
                id="faq-category-filter"
                className="toolbar-select"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                }}
                aria-label="카테고리"
              >
                <option value="">전체</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="basic-table-shell">
          {filteredFaqs.length === 0 ? (
            <div className="support-empty" role="status">등록된 FAQ가 없습니다.</div>
          ) : (
            <BasicTable
              className="support-basic-table"
              columns={faqColumns}
              data={filteredFaqs}
              renderCell={renderFaqCell}
              onRowClick={(e, { row }) => handleFaqClick(row)}
              onRowKeyDown={(e, { row }) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleFaqClick(row);
                }
              }}
              rowAriaLabel={(row) => `${row.title} FAQ 상세 보기`}
            />
          )}
        </div>
      </div>

      <FaqCreateModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleSaveFaq}
        editingFaq={editingFaq}
        categories={categories}
      />

      <FaqDetailModal
        isOpen={Boolean(selectedFaq)}
        onClose={() => setSelectedFaqId(null)}
        faqId={selectedFaqId}
        faqData={selectedFaq}
        onBackToList={() => setSelectedFaqId(null)}
        onPrevious={() => handleMoveFaq(-1)}
        onNext={() => handleMoveFaq(1)}
        hasPrevious={selectedFaqIndex > 0}
        hasNext={selectedFaqIndex >= 0 && selectedFaqIndex < filteredFaqs.length - 1}
      />
    </div>
  );
}

export default Faq;

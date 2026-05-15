import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import FaqCreateModal from '../components/FaqCreateModal';
import PageHeader from '../components/common/PageHeader';
import BasicTable from '../components/common/BasicTable';
import { mockFaqs } from '../data/supportMockData';
import './admin/admin-common.css';
import './Faq.css';
import './SupportCenter.css';

const faqColumns = [
  { id: 'title', label: '질문', width: '46%', align: 'left' },
  { id: 'category', label: '카테고리', width: 132, align: 'left' },
  { id: 'author', label: '작성자', width: 120, align: 'left' },
  { id: 'createdAt', label: '작성일', width: 120, align: 'left' },
  { id: 'viewCount', label: '조회수', width: 88, align: 'center', ellipsis: false },
];

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('ko-KR');
}

function Faq() {
  const [faqs, setFaqs] = useState(mockFaqs);
  const [faqSearch, setFaqSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = useMemo(
    () => [...new Set(faqs.map((faq) => faq.category).filter(Boolean))],
    [faqs]
  );

  const filteredFaqs = useMemo(() => {
    const q = faqSearch.trim().toLowerCase();
    return faqs.filter((faq) => {
      const matchesCategory = !selectedCategory || faq.category === selectedCategory;
      const matchesSearch = !q || `${faq.title} ${faq.category} ${faq.authorEmail}`.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [faqs, faqSearch, selectedCategory]);

  const handleCreateFaq = async (faqData) => {
    const nextId = faqs.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
    setFaqs((prev) => [
      {
        id: nextId,
        ...faqData,
        category: faqData.category || '일반',
        authorEmail: 'admin@knowlearn.co.kr',
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        viewCount: 0,
      },
      ...prev,
    ]);
  };

  const renderFaqCell = ({ column, row }) => {
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
      default:
        return undefined;
    }
  };

  return (
    <div className="faq-page support-page">
      <div className="km-main-sticky-head">
        <PageHeader
          title="자주 묻는 질문"
          breadcrumbs={['고객센터', '자주 묻는 질문']}
          actions={(
            <button type="button" className="admin-btn admin-btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={14} aria-hidden />
              FAQ 작성
            </button>
          )}
        />

        <div className="support-toolbar">
          <div className="support-search">
            <Search size={16} className="support-search-icon" aria-hidden />
            <input
              type="text"
              className="support-search-input"
              placeholder="FAQ 검색"
              value={faqSearch}
              onChange={(e) => {
                setFaqSearch(e.target.value);
              }}
              aria-label="FAQ 검색"
            />
          </div>
          <div className="support-filter">
            <span className="filter-label">카테고리</span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
              }}
              className="support-select"
            >
              <option value="">전체</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="support-table-card">
        <div className="support-table-shell basic-table-shell">
          {filteredFaqs.length === 0 ? (
            <div className="support-empty" role="status">등록된 FAQ가 없습니다.</div>
          ) : (
            <BasicTable
              className="support-basic-table"
              columns={faqColumns}
              data={filteredFaqs}
              renderCell={renderFaqCell}
            />
          )}
        </div>
      </div>

      <FaqCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateFaq}
        editingFaq={null}
        categories={categories}
      />
    </div>
  );
}

export default Faq;

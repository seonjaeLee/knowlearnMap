import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import QnaCreateModal from '../components/QnaCreateModal';
import PageHeader from '../components/common/PageHeader';
import BasicTable from '../components/common/BasicTable';
import { mockQuestions } from '../data/supportMockData';
import './admin/admin-common.css';
import './QnaBoard.css';
import './SupportCenter.css';

const qnaColumns = [
  { id: 'title', label: '제목', width: '40%', align: 'left' },
  { id: 'domainName', label: '도메인', width: 120, align: 'left' },
  { id: 'id', label: '문의번호', width: 96, align: 'left' },
  { id: 'createdAt', label: '등록일', width: 120, align: 'left' },
  { id: 'updatedAt', label: '최근 활동', width: 120, align: 'left' },
  { id: 'status', label: '상태', width: 112, align: 'center', ellipsis: false },
];

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('ko-KR');
}

function QnaBoard() {
  const [questions, setQuestions] = useState(mockQuestions);
  const [qnaSearch, setQnaSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredQuestions = useMemo(() => {
    const q = qnaSearch.trim().toLowerCase();
    return questions.filter((question) => {
      const matchesStatus = !statusFilter || question.status === statusFilter;
      const matchesSearch = !q || `${question.title} ${question.domainName} ${question.authorEmail}`.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [questions, qnaSearch, statusFilter]);

  const handleCreateQuestion = async (questionData) => {
    const nextId = questions.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
    setQuestions((prev) => [
      {
        id: nextId,
        ...questionData,
        authorEmail: 'user@knowlearn.co.kr',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'UNANSWERED',
        answerCount: 0,
        isPinned: false,
      },
      ...prev,
    ]);
  };

  const renderQnaCell = ({ column, row }) => {
    switch (column.id) {
      case 'title':
        return (
          <div className="support-title-cell">
            {row.isPinned && <span className="support-badge support-badge--danger">중요</span>}
            <span className="support-title-text">{row.title}</span>
            {row.answerCount > 0 && <span className="support-badge support-badge--soft">답변 {row.answerCount}</span>}
          </div>
        );
      case 'domainName':
        return row.domainName || '-';
      case 'id':
        return `#${row.id}`;
      case 'createdAt':
        return formatDate(row.createdAt);
      case 'updatedAt':
        return formatDate(row.updatedAt || row.createdAt);
      case 'status':
        return (
          <span className={`support-status ${row.status === 'ANSWERED' ? 'is-answered' : 'is-waiting'}`}>
            {row.status === 'ANSWERED' ? '답변완료' : '답변대기'}
          </span>
        );
      default:
        return undefined;
    }
  };

  return (
    <div className="qna-page support-page">
      <div className="km-main-sticky-head">
        <PageHeader
          title="1:1 문의"
          breadcrumbs={['고객센터', '1:1 문의']}
          actions={(
            <button type="button" className="admin-btn admin-btn-primary" onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={14} aria-hidden />
              문의 등록
            </button>
          )}
        />

        <div className="support-toolbar">
          <div className="support-search">
            <Search size={16} className="support-search-icon" aria-hidden />
            <input
              type="text"
              className="support-search-input"
              placeholder="문의 검색"
              value={qnaSearch}
              onChange={(e) => {
                setQnaSearch(e.target.value);
              }}
              aria-label="문의 검색"
            />
          </div>
          <div className="support-filter">
            <span className="filter-label">상태</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
              }}
              className="support-select"
            >
              <option value="">모든 상태</option>
              <option value="UNANSWERED">답변대기</option>
              <option value="ANSWERED">답변완료</option>
            </select>
          </div>
        </div>
      </div>

      <div className="support-table-card">
        <div className="support-table-shell basic-table-shell">
          {filteredQuestions.length === 0 ? (
            <div className="support-empty" role="status">문의 내역이 없습니다.</div>
          ) : (
            <BasicTable
              className="support-basic-table support-qna-table"
              columns={qnaColumns}
              data={filteredQuestions}
              renderCell={renderQnaCell}
            />
          )}
        </div>
      </div>

      <QnaCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateQuestion}
        editingQuestion={null}
      />
    </div>
  );
}

export default QnaBoard;

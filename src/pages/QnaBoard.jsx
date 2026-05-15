import { useCallback, useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDialog } from '../hooks/useDialog';
import QnaCreateModal from '../components/QnaCreateModal';
import QnaDetailModal from '../components/QnaDetailModal';
import PageHeader from '../components/common/PageHeader';
import BasicTable from '../components/common/BasicTable';
import KmModalSelect from '../components/common/modal/KmModalSelect';
import SupportTableAdminActions from '../components/support/SupportTableAdminActions';
import { mockQuestions } from '../data/supportMockData';
import { isSupportCenterAdmin } from '../utils/supportCenterAdmin';
import { SUPPORT_ADMIN_ACTIONS_COLUMN } from './supportCenterColumns';
import './admin/admin-common.css';
import './QnaBoard.css';
import './SupportCenter.css';

const QNA_BASE_COLUMNS = [
  { id: 'id', label: '문의번호', width: 96, align: 'left' },
  { id: 'domainName', label: '도메인', width: 120, align: 'left' },
  { id: 'title', label: '제목', width: '40%', align: 'left' },
  { id: 'createdAt', label: '등록일', width: 120, align: 'left' },
  { id: 'updatedAt', label: '최근 활동', width: 120, align: 'left' },
  { id: 'status', label: '상태', width: 112, align: 'left', ellipsis: false },
];

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('ko-KR');
}

function QnaBoard() {
  const { user } = useAuth();
  const { confirm } = useDialog();
  const [questions, setQuestions] = useState(mockQuestions);
  const [qnaSearch, setQnaSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);

  const isAdmin = isSupportCenterAdmin(user);

  const selectedQuestion = useMemo(
    () => questions.find((q) => q.id === selectedQuestionId) || null,
    [questions, selectedQuestionId],
  );

  const qnaColumns = useMemo(
    () => (isAdmin ? [...QNA_BASE_COLUMNS, SUPPORT_ADMIN_ACTIONS_COLUMN] : QNA_BASE_COLUMNS),
    [isAdmin],
  );

  const filteredQuestions = useMemo(() => {
    const q = qnaSearch.trim().toLowerCase();
    return questions.filter((question) => {
      const matchesStatus = !statusFilter || question.status === statusFilter;
      const matchesSearch = !q || `${question.title} ${question.domainName} ${question.authorEmail}`.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [questions, qnaSearch, statusFilter]);

  const handleSaveQuestion = async (questionData) => {
    if (editingQuestion) {
      setQuestions((prev) => prev.map((item) => (
        item.id === editingQuestion.id
          ? {
            ...item,
            ...questionData,
            updatedAt: new Date().toISOString(),
          }
          : item
      )));
      return;
    }

    const nextId = questions.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
    setQuestions((prev) => [
      {
        id: nextId,
        ...questionData,
        authorEmail: user?.email || 'user@knowlearn.co.kr',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'UNANSWERED',
        answerCount: 0,
        isPinned: false,
      },
      ...prev,
    ]);
  };

  const handleOpenCreateModal = useCallback(() => {
    setEditingQuestion(null);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((question) => {
    setEditingQuestion(question);
    setIsFormModalOpen(true);
  }, []);

  const handleCloseFormModal = useCallback(() => {
    setIsFormModalOpen(false);
    setEditingQuestion(null);
  }, []);

  const handleDeleteQuestion = useCallback(async (question) => {
    const confirmed = await confirm(`"${question.title}" 문의를 삭제하시겠습니까?`);
    if (!confirmed) return;
    setQuestions((prev) => prev.filter((item) => item.id !== question.id));
    if (selectedQuestionId === question.id) {
      setSelectedQuestionId(null);
    }
  }, [confirm, selectedQuestionId]);

  const handleQuestionClick = useCallback((question) => {
    setSelectedQuestionId(question.id);
  }, []);

  const handleQuestionDetailUpdate = useCallback((payload) => {
    if (payload?.deleted) {
      setQuestions((prev) => prev.filter((item) => item.id !== payload.id));
      setSelectedQuestionId(null);
      return;
    }
    if (payload?.id) {
      setQuestions((prev) => prev.map((item) => (item.id === payload.id ? { ...item, ...payload } : item)));
    }
  }, []);

  const isSelectedQuestionOwner = Boolean(
    selectedQuestion && user?.email === selectedQuestion.authorEmail,
  );

  const renderQnaCell = useCallback(({ column, row }) => {
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
      case '_actions':
        return (
          <SupportTableAdminActions
            label={row.title}
            onEdit={() => handleOpenEditModal(row)}
            onDelete={() => handleDeleteQuestion(row)}
          />
        );
      default:
        return undefined;
    }
  }, [handleDeleteQuestion, handleOpenEditModal]);

  return (
    <div className="qna-page support-page">
      <div className="km-main-sticky-head">
        <PageHeader
          title="1:1 문의"
          breadcrumbs={['고객센터', '1:1 문의']}
          actions={(
            <button type="button" className="admin-btn admin-btn-primary" onClick={handleOpenCreateModal}>
              <Plus size={14} aria-hidden />
              1:1 문의 등록
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
            <div className="support-filter-select km-modal-form">
              <KmModalSelect
                id="qna-status-filter"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                }}
                placeholder="모든 상태"
                optionItems={[
                  { value: 'UNANSWERED', label: '답변대기' },
                  { value: 'ANSWERED', label: '답변완료' },
                ]}
              />
            </div>
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
              onRowClick={(e, { row }) => handleQuestionClick(row)}
              onRowKeyDown={(e, { row }) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleQuestionClick(row);
                }
              }}
              rowAriaLabel={(row) => `${row.title} 문의 상세 보기`}
            />
          )}
        </div>
      </div>

      <QnaCreateModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleSaveQuestion}
        editingQuestion={editingQuestion}
      />

      <QnaDetailModal
        isOpen={Boolean(selectedQuestion)}
        onClose={() => setSelectedQuestionId(null)}
        questionId={selectedQuestionId}
        questionData={selectedQuestion}
        readOnly={!isSelectedQuestionOwner}
        onUpdate={handleQuestionDetailUpdate}
      />
    </div>
  );
}

export default QnaBoard;

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, RotateCcw, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDialog } from '../hooks/useDialog';
import QnaCreateModal from '../components/QnaCreateModal';
import QnaDetailModal from '../components/QnaDetailModal';
import PageHeader from '../components/common/PageHeader';
import KlIconButton from '../components/common/KlIconButton';
import BasicTable from '../components/common/BasicTable';
import { formatTableCellText, isTableCellBlank } from '../components/common/tableCellDisplay';
import SupportTableAdminActions from '../components/support/SupportTableAdminActions';
import { isSupportMockEnabled, listTableEmptyState } from '../config/supportMock';
import { mockQuestions } from '../data/supportMockData';
import { qnaApi } from '../services/api';
import { normalizeSupportListPayload } from '../utils/supportListResponse';
import { isSupportCenterAdmin } from '../utils/supportCenterAdmin';
import { SUPPORT_ADMIN_ACTIONS_COLUMN } from './supportCenterColumns';
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
  if (isTableCellBlank(value)) return formatTableCellText(value);
  return new Date(value).toLocaleDateString('ko-KR');
}

function QnaBoard() {
  const { user } = useAuth();
  const { confirm, alert } = useDialog();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [qnaSearch, setQnaSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);

  const isAdmin = isSupportCenterAdmin(user);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      if (isSupportMockEnabled) {
        let list = mockQuestions.map((item) => ({ ...item }));
        if (statusFilter) list = list.filter((q) => q.status === statusFilter);
        setQuestions(list);
        return;
      }
      const params = statusFilter ? { status: statusFilter } : {};
      const data = await qnaApi.getQuestions(params);
      setQuestions(normalizeSupportListPayload(data));
    } catch (error) {
      console.error('1:1 문의 목록 조회 실패:', error);
      if (import.meta.env.DEV) {
        console.warn('[QnaBoard] API 실패, 더미 목록으로 표시:', error?.message || error);
        let list = mockQuestions.map((item) => ({ ...item }));
        if (statusFilter) list = list.filter((q) => q.status === statusFilter);
        setQuestions(list);
        setLoadError(null);
      } else {
        setQuestions([]);
        setLoadError(error.message || '문의 내역을 불러오지 못했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

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

  const qnaTableEmptyVariant = useMemo(
    () => (questions.length === 0 ? 'default' : 'search'),
    [questions.length],
  );

  const handleSaveQuestion = async (questionData) => {
    if (isSupportMockEnabled) {
      if (editingQuestion) {
        setQuestions((prev) => prev.map((item) => (
          item.id === editingQuestion.id ? { ...item, ...questionData, updatedAt: new Date().toISOString() } : item
        )));
      } else {
        const nextId = questions.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
        setQuestions((prev) => [{ id: nextId, ...questionData, authorEmail: user?.email || 'user@knowlearn.co.kr',
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
          status: 'UNANSWERED', answerCount: 0, isPinned: false }, ...prev]);
      }
      return;
    }
    try {
      const payload = { title: questionData.title, content: questionData.content, contact: questionData.contact, domainName: questionData.domainName };
      if (editingQuestion) await qnaApi.updateQuestion(editingQuestion.id, payload);
      else await qnaApi.createQuestion(payload);
      await fetchQuestions();
    } catch (error) {
      console.error('1:1 문의 저장 실패:', error);
      await alert(error.message || '문의 저장에 실패했습니다.');
      throw error;
    }
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
    if (isSupportMockEnabled) {
      setQuestions((prev) => prev.filter((item) => item.id !== question.id));
      if (selectedQuestionId === question.id) setSelectedQuestionId(null);
      return;
    }
    try {
      await qnaApi.deleteQuestion(question.id);
      if (selectedQuestionId === question.id) setSelectedQuestionId(null);
      await fetchQuestions();
    } catch (error) {
      console.error('1:1 문의 삭제 실패:', error);
      await alert(error.message || '문의 삭제에 실패했습니다.');
    }
  }, [confirm, alert, selectedQuestionId, fetchQuestions]);

  const handleQuestionClick = useCallback((question) => {
    setSelectedQuestionId(question.id);
  }, []);

  const handleQuestionDetailUpdate = useCallback((payload) => {
    if (isSupportMockEnabled) {
      if (payload?.deleted) {
        setQuestions((prev) => prev.filter((item) => item.id !== payload.id));
        setSelectedQuestionId(null);
        return;
      }
      if (payload?.id) {
        setQuestions((prev) => prev.map((item) => (item.id === payload.id ? { ...item, ...payload } : item)));
      }
      return;
    }
    fetchQuestions();
  }, [fetchQuestions]);

  const isSelectedQuestionOwner = Boolean(selectedQuestion && user?.email === selectedQuestion.authorEmail);
  const isDetailReadOnly = !isAdmin && !isSelectedQuestionOwner;

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
      case 'domainName': {
        const domainName = row.domainName;
        return (
          <span
            className={isTableCellBlank(domainName) ? 'kl-table-cell-blank' : undefined}
            title={!isTableCellBlank(domainName) ? String(domainName) : undefined}
          >
            {formatTableCellText(domainName)}
          </span>
        );
      }
      case 'id':
        return `#${row.id}`;
      case 'createdAt':
        return (
          <span className={isTableCellBlank(row.createdAt) ? 'kl-table-cell-blank' : undefined}>
            {formatDate(row.createdAt)}
          </span>
        );
      case 'updatedAt': {
        const updatedAt = row.updatedAt || row.createdAt;
        return (
          <span className={isTableCellBlank(updatedAt) ? 'kl-table-cell-blank' : undefined}>
            {formatDate(updatedAt)}
          </span>
        );
      }
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
    <div className="kl-page kl-page--fill qna-page">
      <div className="kl-main-sticky-head">
        <PageHeader
          title="1:1 문의"
          breadcrumbs={['고객센터', '1:1 문의']}
        />

        
      </div>

      <div className="table-area">
                    <div className="table-toolbar">
                    <div className="toolbar-left">
                        <span className="kl-table-toolbar-summary">
                            총 <strong>{filteredQuestions.length}</strong>건
                        </span>
                    </div>
                    <div className="toolbar-right">
                    <div className="search-area">
                    <Search size={16} className="search-area-icon" aria-hidden />
                    <input
                    type="text"
                    className="search-area-input"
                    placeholder="문의 검색"
                    value={qnaSearch}
                    onChange={(e) => {
                    setQnaSearch(e.target.value);
                    }}
                    aria-label="문의 검색"
                    />
                    </div>
                    <div className="support-filter">
                    <select
                    id="qna-status-filter"
                    className="toolbar-select"
                    value={statusFilter}
                    onChange={(e) => {
                    setStatusFilter(e.target.value);
                    }}
                    aria-label="상태"
                    >
                    <option value="">전체 상태</option>
                    <option value="UNANSWERED">답변대기</option>
                    <option value="ANSWERED">답변완료</option>
                    </select>
                    </div>
                    <KlIconButton
                      tooltip="새로고침"
                      ariaLabel="1:1 문의 목록 새로고침"
                      onClick={fetchQuestions}
                      buttonClassName="kl-btn gray-outline md icon-only"
                      stopPropagation={false}
                    >
                      <RotateCcw size={16} aria-hidden />
                    </KlIconButton>
                    <button type="button" className="kl-btn primary-full md" onClick={handleOpenCreateModal}>
                      <Plus size={14} aria-hidden />
                      1:1 문의 등록
                    </button>
                    </div>
                    </div>

        <div className="basic-table-shell">
          <BasicTable
            className="support-basic-table support-qna-table"
            columns={qnaColumns}
            data={loading ? [] : filteredQuestions}
            renderCell={renderQnaCell}
            onRowClick={(e, { row }) => handleQuestionClick(row)}
            onRowKeyDown={(e, { row }) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleQuestionClick(row);
              }
            }}
            rowAriaLabel={(row) => `${row.title} 문의 상세 보기`}
            emptyState={listTableEmptyState({
              loading,
              loadError,
              loadingMessage: '문의 내역을 불러오는 중입니다.',
              emptyVariant: qnaTableEmptyVariant,
              emptyMessage: !loading && !loadError && questions.length === 0 ? '문의 내역이 없습니다.' : undefined,
            })}
          />
        </div>
      </div>

      <QnaCreateModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleSaveQuestion}
        editingQuestion={editingQuestion}
      />

      <QnaDetailModal
        isOpen={Boolean(selectedQuestionId)}
        onClose={() => setSelectedQuestionId(null)}
        questionId={selectedQuestionId}
        questionData={isSupportMockEnabled ? selectedQuestion : undefined}
        readOnly={isDetailReadOnly}
        onUpdate={handleQuestionDetailUpdate}
      />
    </div>
  );
}

export default QnaBoard;

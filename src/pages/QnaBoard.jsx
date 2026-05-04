import { useState, useEffect } from 'react';
import { Search, Plus, MessageSquareText, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { qnaApi } from '../services/api';
import QnaQuestionCard from '../components/QnaQuestionCard';
import QnaCreateModal from '../components/QnaCreateModal';
import QnaDetailModal from '../components/QnaDetailModal';
import PageHeader from '../components/common/PageHeader';
import './QnaBoard.css';

function QnaBoard() {
    const { isAdmin } = useAuth();
    const { showAlert } = useAlert();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [selectedQuestionId, setSelectedQuestionId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const params = { page: currentPage, size: 10 };
            if (searchKeyword) params.keyword = searchKeyword;
            if (statusFilter) params.status = statusFilter;

            const response = await qnaApi.getQuestions(params);
            setQuestions(response.data || []);
            setTotalElements(response.totalElements || 0);
            setTotalPages(response.totalPages || 0);
        } catch (error) {
            console.error('질문 목록 조회 실패:', error);
            showAlert('질문 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [currentPage, statusFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchQuestions();
    };

    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
        setCurrentPage(0);
    };

    const handleCreateQuestion = async (questionData) => {
        try {
            if (editingQuestion) {
                await qnaApi.updateQuestion(editingQuestion.id, questionData);
                showAlert('질문이 수정되었습니다.');
            } else {
                await qnaApi.createQuestion(questionData);
                showAlert('질문이 등록되었습니다.');
            }
            fetchQuestions();
        } catch (error) {
            console.error('질문 저장 실패:', error);
            showAlert('질문 저장에 실패했습니다.');
            throw error;
        }
    };

    const handleTogglePin = async (questionId) => {
        try {
            await qnaApi.togglePin(questionId);
            fetchQuestions();
        } catch (error) {
            console.error('고정 토글 실패:', error);
            showAlert('고정 상태 변경에 실패했습니다.');
        }
    };

    const handleQuestionClick = (questionId) => {
        setSelectedQuestionId(questionId);
        setIsDetailModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingQuestion(null);
        setIsCreateModalOpen(true);
    };

    return (
        <div className="qna-page">
            <div className="qna-container">
                <PageHeader
                    title="1:1 문의"
                    breadcrumbs={['고객센터', '1:1 문의']}
                    actions={(
                        <button className="qna-create-btn" onClick={openCreateModal}>
                            <Plus size={18} />
                            문의 등록
                        </button>
                    )}
                />

                <div className="qna-toolbar">
                    <div className="qna-search-wrapper">
                        <Search size={18} className="search-icon" />
                        <form onSubmit={handleSearch}>
                            <input
                                type="text"
                                placeholder="요청 검색"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                            />
                        </form>
                    </div>
                    <div className="qna-status-filter">
                        <span className="filter-label">상태:</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusFilterChange(e.target.value)}
                            className="status-select"
                        >
                            <option value="">모든 상태</option>
                            <option value="UNANSWERED">해결 대기 중 (답변대기)</option>
                            <option value="ANSWERED">해결됨 (답변완료)</option>
                        </select>
                    </div>
                </div>

                <div className="qna-list-container">
                    <table className="qna-table">
                        <thead>
                            <tr>
                                <th className="th-title">제목</th>
                                <th className="th-id">ID</th>
                                <th className="th-created">만듦</th>
                                <th className="th-activity">마지막 활동</th>
                                <th className="th-status">상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="td-loading">로딩 중...</td>
                                </tr>
                            ) : questions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="td-empty">문의 내역이 없습니다.</td>
                                </tr>
                            ) : (
                                questions.map((question) => (
                                    <tr key={question.id} onClick={() => handleQuestionClick(question.id)} className="qna-row">
                                        <td className="td-title">
                                            <span className="question-title-text">{question.title}</span>
                                        </td>
                                        <td className="td-id">#{question.id}</td>
                                        <td className="td-created">{new Date(question.createdAt).toLocaleDateString()}</td>
                                        <td className="td-activity">
                                            {question.updatedAt
                                                ? new Date(question.updatedAt).toLocaleDateString() // Simple relative date can be added later
                                                : new Date(question.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="td-status">
                                            <span className={`status-badge ${question.status === 'ANSWERED' ? 'solved' : 'open'}`}>
                                                {question.status === 'ANSWERED' ? '해결' : '대기'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div className="qna-footer-actions">
                        {/* Button removed from header, maybe place somewhere else or keep it independent? 
                             Screenshot shows "문의 등록" usually near tabs or separate. 
                             Ah, screenshot 1 doesn't show "Create" button explicitly in the list view, 
                             Wait, I missed it? 
                             Actually, "문의 등록" usually is a Floating Action Button or top right.
                             I'll keep the existing button but style it or place it appropriately.
                         */}
                    </div>
                </div>

                {/* Pagination (keep existing code) */}
                {totalPages > 1 && (
                    <div className="qna-pagination">
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

            <QnaCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditingQuestion(null);
                }}
                onSubmit={handleCreateQuestion}
                editingQuestion={editingQuestion}
            />

            <QnaDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedQuestionId(null);
                }}
                questionId={selectedQuestionId}
                onUpdate={fetchQuestions}
            />
        </div>
    );
}

export default QnaBoard;

import { Pin, MessageCircle, Eye, User, Clock } from 'lucide-react';
import './QnaQuestionCard.css';

function QnaQuestionCard({ question, onClick, isAdmin, onTogglePin }) {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    const getStatusBadge = () => {
        if (question.status === 'ANSWERED') {
            return <span className="status-badge answered">답변완료</span>;
        }
        return <span className="status-badge unanswered">답변대기</span>;
    };

    const handlePinClick = (e) => {
        e.stopPropagation();
        onTogglePin(question.id);
    };

    return (
        <div className={`qna-card ${question.isPinned ? 'pinned' : ''}`} onClick={onClick}>
            <div className="qna-card-header">
                <div className="qna-card-badges">
                    {question.isPinned && (
                        <span className="pin-badge">
                            <Pin size={14} />
                            고정됨
                        </span>
                    )}
                    {getStatusBadge()}
                </div>
                {isAdmin && (
                    <button
                        className={`pin-toggle-btn ${question.isPinned ? 'active' : ''}`}
                        onClick={handlePinClick}
                        title={question.isPinned ? '고정 해제' : '상단 고정'}
                    >
                        <Pin size={16} />
                    </button>
                )}
            </div>

            <h3 className="qna-card-title">{question.title}</h3>

            <p className="qna-card-content">
                {question.content.length > 150
                    ? question.content.substring(0, 150) + '...'
                    : question.content}
            </p>

            <div className="qna-card-footer">
                <div className="qna-card-author">
                    <User size={14} />
                    <span>{question.authorEmail?.split('@')[0] || '익명'}</span>
                </div>
                <div className="qna-card-stats">
                    <span className="stat-item">
                        <MessageCircle size={14} />
                        {question.answerCount || 0}
                    </span>
                    <span className="stat-item">
                        <Eye size={14} />
                        {question.viewCount || 0}
                    </span>
                    <span className="stat-item">
                        <Clock size={14} />
                        {formatDate(question.createdAt)}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default QnaQuestionCard;

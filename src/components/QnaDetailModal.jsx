import { useState, useEffect, useRef } from 'react';
import { X, Edit2, Trash2, User, Clock, Send, CheckCircle, ImagePlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { qnaApi, imageApi } from '../services/api';
import ContentRenderer from './ContentRenderer';
import './QnaDetailModal.css';

function QnaDetailModal({ isOpen, onClose, questionId, onUpdate }) {
    const { user, isAdmin } = useAuth();
    const { showAlert, showConfirm } = useAlert();
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answerContent, setAnswerContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingAnswerId, setEditingAnswerId] = useState(null);
    const [editingAnswerContent, setEditingAnswerContent] = useState('');
    const [isEditingQuestion, setIsEditingQuestion] = useState(false);
    const [editQuestionTitle, setEditQuestionTitle] = useState('');
    const [editQuestionContent, setEditQuestionContent] = useState('');
    const [isUploadingAnswer, setIsUploadingAnswer] = useState(false);
    const modalRef = useRef(null);
    const answerTextareaRef = useRef(null);
    const answerFileInputRef = useRef(null);

    const fetchQuestion = async () => {
        if (!questionId) return;
        setLoading(true);
        try {
            const data = await qnaApi.getQuestion(questionId);
            setQuestion(data);
        } catch (error) {
            console.error('질문 조회 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && questionId) {
            fetchQuestion();
        }
    }, [isOpen, questionId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isOwner = (authorEmail) => {
        return user?.email === authorEmail;
    };

    const canModify = (authorEmail) => {
        return isOwner(authorEmail) || isAdmin;
    };

    const handleSubmitAnswer = async (e) => {
        e.preventDefault();
        if (!answerContent.trim()) return;

        setIsSubmitting(true);
        try {
            await qnaApi.createAnswer(questionId, { content: answerContent.trim() });
            setAnswerContent('');
            fetchQuestion();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('답변 등록 실패:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditAnswer = (answer) => {
        setEditingAnswerId(answer.id);
        setEditingAnswerContent(answer.content);
    };

    const handleUpdateAnswer = async () => {
        if (!editingAnswerContent.trim()) return;

        setIsSubmitting(true);
        try {
            await qnaApi.updateAnswer(editingAnswerId, { content: editingAnswerContent.trim() });
            setEditingAnswerId(null);
            setEditingAnswerContent('');
            fetchQuestion();
        } catch (error) {
            console.error('답변 수정 실패:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAnswer = async (answerId) => {
        const confirmed = await showConfirm('이 답변을 삭제하시겠습니까?');
        if (!confirmed) return;

        try {
            await qnaApi.deleteAnswer(answerId);
            fetchQuestion();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('답변 삭제 실패:', error);
        }
    };

    const handleAnswerImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploadingAnswer(true);
        try {
            const result = await imageApi.upload(file);
            const imageTag = `[IMAGE:${result.url}]`;

            const textarea = answerTextareaRef.current;
            if (textarea) {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const newContent = answerContent.substring(0, start) + imageTag + answerContent.substring(end);
                setAnswerContent(newContent);
            } else {
                setAnswerContent(prev => prev + imageTag);
            }
        } catch (error) {
            console.error('이미지 업로드 실패:', error);
            showAlert('이미지 업로드에 실패했습니다: ' + error.message, 'error');
        } finally {
            setIsUploadingAnswer(false);
            if (answerFileInputRef.current) {
                answerFileInputRef.current.value = '';
            }
        }
    };

    const handleEditQuestion = () => {
        setIsEditingQuestion(true);
        setEditQuestionTitle(question.title);
        setEditQuestionContent(question.content);
    };

    const handleUpdateQuestion = async () => {
        if (!editQuestionTitle.trim() || !editQuestionContent.trim()) return;

        setIsSubmitting(true);
        try {
            await qnaApi.updateQuestion(questionId, {
                title: editQuestionTitle.trim(),
                content: editQuestionContent.trim(),
            });
            setIsEditingQuestion(false);
            fetchQuestion();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('질문 수정 실패:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteQuestion = async () => {
        const confirmed2 = await showConfirm('이 질문을 삭제하시겠습니까? 모든 답변도 함께 삭제됩니다.');
        if (!confirmed2) return;

        try {
            await qnaApi.deleteQuestion(questionId);
            onClose();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('질문 삭제 실패:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="qna-detail-modal-overlay">
            <div className="qna-detail-modal-container" ref={modalRef}>
                <div className="qna-detail-modal-header">
                    <h2>질문 상세</h2>
                    <button className="qna-detail-modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="qna-detail-modal-body">
                    {loading ? (
                        <div className="qna-detail-loading">
                            <div className="loading-spinner"></div>
                            <p>로딩 중...</p>
                        </div>
                    ) : question ? (
                        <div className="qna-detail-content-wrapper">
                            <div className="qna-main-column">
                                <div className="qna-question-section">
                                    <div className="question-header">
                                        <h3 className="question-title">{question.title}</h3>
                                        {isOwner(question.authorEmail) && (
                                            <div className="question-actions">
                                                <button
                                                    className="btn-edit-question"
                                                    onClick={handleEditQuestion}
                                                    title="수정"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className="btn-delete-question"
                                                    onClick={handleDeleteQuestion}
                                                    title="삭제"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                        {isAdmin && !isOwner(question.authorEmail) && (
                                            <div className="question-actions">
                                                <button
                                                    className="btn-delete-question"
                                                    onClick={handleDeleteQuestion}
                                                    title="삭제"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {isEditingQuestion ? (
                                        <div className="question-edit-form">
                                            <input
                                                type="text"
                                                value={editQuestionTitle}
                                                onChange={(e) => setEditQuestionTitle(e.target.value)}
                                                className="edit-title-input"
                                                placeholder="제목"
                                            />
                                            <textarea
                                                value={editQuestionContent}
                                                onChange={(e) => setEditQuestionContent(e.target.value)}
                                                className="edit-content-textarea"
                                                rows={6}
                                                placeholder="내용"
                                            />
                                            <div className="edit-actions">
                                                <button
                                                    className="btn-cancel-edit"
                                                    onClick={() => setIsEditingQuestion(false)}
                                                >
                                                    취소
                                                </button>
                                                <button
                                                    className="btn-save-edit"
                                                    onClick={handleUpdateQuestion}
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? '저장 중...' : '저장'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="question-content">
                                            <ContentRenderer content={question.content} />
                                        </div>
                                    )}
                                </div>

                                <div className="qna-answers-section">
                                    <h4 className="answers-title">
                                        답변
                                    </h4>

                                    {question.answers && question.answers.length > 0 ? (
                                        <div className="answers-list">
                                            {question.answers.map((answer) => (
                                                <div key={answer.id} className="answer-item">
                                                    <div className="answer-header">
                                                        <span className="answer-author-name answer-admin-badge">
                                                            관리자
                                                        </span>
                                                        <span className="answer-date">{formatDate(answer.createdAt)}</span>
                                                        {isAdmin && (
                                                            <button
                                                                className="btn-delete-answer"
                                                                onClick={() => handleDeleteAnswer(answer.id)}
                                                                title="삭제"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="answer-content">
                                                        <ContentRenderer content={answer.content} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="no-answers">
                                            <p>아직 답변이 없습니다.</p>
                                        </div>
                                    )}

                                    {isAdmin && (
                                        <div className="answer-form-container">
                                            <form className="answer-form" onSubmit={handleSubmitAnswer}>
                                                <div className="answer-toolbar">
                                                    <button
                                                        type="button"
                                                        className="btn-attach-image"
                                                        onClick={() => answerFileInputRef.current?.click()}
                                                        disabled={isUploadingAnswer}
                                                        title="이미지 첨부"
                                                    >
                                                        <ImagePlus size={16} />
                                                        {isUploadingAnswer ? '업로드 중...' : '이미지 첨부'}
                                                    </button>
                                                    <input
                                                        ref={answerFileInputRef}
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                                        onChange={handleAnswerImageUpload}
                                                        style={{ display: 'none' }}
                                                    />
                                                </div>
                                                <textarea
                                                    ref={answerTextareaRef}
                                                    value={answerContent}
                                                    onChange={(e) => setAnswerContent(e.target.value)}
                                                    placeholder="답변을 입력해주세요."
                                                    rows={4}
                                                />
                                                <div className="answer-form-actions">
                                                    <button
                                                        type="submit"
                                                        className="btn-submit-answer"
                                                        disabled={!answerContent.trim() || isSubmitting}
                                                    >
                                                        답변 등록
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="qna-sidebar-column">
                                <div className="meta-info-box">
                                    <div className="meta-row">
                                        <span className="meta-label">작성자</span>
                                        <span className="meta-value">{(question.authorEmail?.split('@')[0]) || '익명'}</span>
                                    </div>
                                    <div className="meta-row">
                                        <span className="meta-label">작성일</span>
                                        <span className="meta-value">{formatDate(question.createdAt)}</span>
                                    </div>
                                    <div className="meta-row">
                                        <span className="meta-label">최근 수정</span>
                                        <span className="meta-value">{formatDate(question.updatedAt || question.createdAt)}</span>
                                    </div>
                                    <div className="meta-divider"></div>
                                    <div className="meta-row">
                                        <span className="meta-label">문의 번호</span>
                                        <span className="meta-value">#{question.id}</span>
                                    </div>
                                    <div className="meta-row">
                                        <span className="meta-label">상태</span>
                                        <span className="meta-value">
                                            <span className={`status-tag ${question.status === 'ANSWERED' ? 'solved' : 'open'}`}>
                                                {question.status === 'ANSWERED' ? '답변완료' : '답변대기'}
                                            </span>
                                        </span>
                                    </div>
                                    {question.contact && (
                                        <div className="meta-row">
                                            <span className="meta-label">연락처</span>
                                            <span className="meta-value">{question.contact}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="qna-detail-error">
                            질문을 불러올 수 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default QnaDetailModal;

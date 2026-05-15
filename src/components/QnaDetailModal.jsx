import { useState, useEffect, useRef } from 'react';
import { Edit2, Trash2, ImagePlus } from 'lucide-react';
import { Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { useDialog } from '../hooks/useDialog';
import { qnaApi, imageApi } from '../services/api';
import ContentRenderer from './ContentRenderer';
import BaseModal from './common/modal/BaseModal';
import './QnaDetailModal.css';

function QnaDetailModal({
    isOpen,
    onClose,
    questionId,
    questionData = null,
    readOnly = false,
    onUpdate,
}) {
    const { user, isAdmin } = useAuth();
    const { showAlert } = useAlert();
    const { confirm } = useDialog();
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answerContent, setAnswerContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditingQuestion, setIsEditingQuestion] = useState(false);
    const [editQuestionTitle, setEditQuestionTitle] = useState('');
    const [editQuestionContent, setEditQuestionContent] = useState('');
    const [isUploadingAnswer, setIsUploadingAnswer] = useState(false);
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
        if (!isOpen) return;
        if (questionData) {
            setQuestion(questionData);
            setLoading(false);
            setIsEditingQuestion(false);
            return;
        }
        if (questionId) {
            fetchQuestion();
        }
    }, [isOpen, questionId, questionData]);

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

    const isOwner = question && user?.email === question.authorEmail;
    const canEditQuestion = Boolean(question) && isOwner && !readOnly;

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

    const handleDeleteAnswer = async (answerId) => {
        const confirmed = await confirm('이 답변을 삭제하시겠습니까?');
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
                setAnswerContent((prev) => prev + imageTag);
            }
        } catch (error) {
            console.error('이미지 업로드 실패:', error);
            showAlert(`이미지 업로드에 실패했습니다: ${error.message}`, 'error');
        } finally {
            setIsUploadingAnswer(false);
            if (answerFileInputRef.current) {
                answerFileInputRef.current.value = '';
            }
        }
    };

    const handleStartEditQuestion = () => {
        setIsEditingQuestion(true);
        setEditQuestionTitle(question.title);
        setEditQuestionContent(question.content || '');
    };

    const handleCancelEditQuestion = () => {
        setIsEditingQuestion(false);
        setEditQuestionTitle(question.title);
        setEditQuestionContent(question.content || '');
    };

    const handleUpdateQuestion = async () => {
        if (!editQuestionTitle.trim() || !editQuestionContent.trim()) return;

        setIsSubmitting(true);
        try {
            if (questionData) {
                const updated = {
                    ...question,
                    title: editQuestionTitle.trim(),
                    content: editQuestionContent.trim(),
                    updatedAt: new Date().toISOString(),
                };
                setQuestion(updated);
                setIsEditingQuestion(false);
                if (onUpdate) onUpdate(updated);
                return;
            }

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
        const confirmedDelete = await confirm('이 질문을 삭제하시겠습니까? 모든 답변도 함께 삭제됩니다.');
        if (!confirmedDelete) return;

        try {
            if (questionData) {
                if (onUpdate) onUpdate({ deleted: true, id: question.id });
                onClose();
                return;
            }
            await qnaApi.deleteQuestion(questionId);
            onClose();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('질문 삭제 실패:', error);
        }
    };

    const renderFooterActions = () => {
        if (canEditQuestion && isEditingQuestion) {
            return (
                <>
                    <Button variant="outlined" onClick={handleCancelEditQuestion} disabled={isSubmitting}>
                        취소
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleUpdateQuestion}
                        disabled={isSubmitting || !editQuestionTitle.trim() || !editQuestionContent.trim()}
                    >
                        {isSubmitting ? '저장 중...' : '저장'}
                    </Button>
                </>
            );
        }

        return (
            <Button variant="contained" onClick={onClose}>
                닫기
            </Button>
        );
    };

    if (!isOpen) return null;

    return (
        <BaseModal
            open={isOpen}
            onClose={onClose}
            title="1:1문의"
            maxWidth={false}
            fullWidth={false}
            paperSx={{ width: '920px', maxWidth: 'calc(100vw - 48px)', maxHeight: 'calc(100vh - 48px)' }}
            contentClassName="qna-detail-modal-content km-modal-form"
            actionsClassName="qna-detail-modal-actions"
            actions={renderFooterActions()}
        >
            <div className="qna-detail-modal-body">
                {loading ? (
                    <div className="qna-detail-loading">
                        <div className="loading-spinner" aria-hidden />
                        <p>로딩 중...</p>
                    </div>
                ) : question ? (
                    <div className="qna-detail-content-wrapper">
                        <section className="qna-detail-head" aria-label="문의 정보">
                            <div className="qna-detail-head-top">
                                <div className="qna-title-block">
                                    {question.domainName && (
                                        <span className="qna-detail-domain">{question.domainName}</span>
                                    )}
                                    {isEditingQuestion ? (
                                        <input
                                            type="text"
                                            value={editQuestionTitle}
                                            onChange={(e) => setEditQuestionTitle(e.target.value)}
                                            className="qna-detail-title-input"
                                            placeholder="제목"
                                            aria-label="제목"
                                        />
                                    ) : (
                                        <h3 className="qna-detail-title">{question.title}</h3>
                                    )}
                                </div>
                                {canEditQuestion && !isEditingQuestion && (
                                    <div className="qna-question-actions">
                                        <button
                                            type="button"
                                            className="btn-edit-question"
                                            onClick={handleStartEditQuestion}
                                            title="수정"
                                            aria-label="문의 수정"
                                        >
                                            <Edit2 size={16} aria-hidden />
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-delete-question"
                                            onClick={handleDeleteQuestion}
                                            title="삭제"
                                            aria-label="문의 삭제"
                                        >
                                            <Trash2 size={16} aria-hidden />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="qna-detail-meta-row">
                                <div className="qna-detail-inline-meta">
                                    <span>{question.authorEmail?.split('@')[0] || '익명'}</span>
                                    <span>{formatDate(question.createdAt)}</span>
                                    <span>#{question.id}</span>
                                    <span
                                        className={`qna-detail-status ${question.status === 'ANSWERED' ? 'is-answered' : 'is-waiting'}`}
                                    >
                                        {question.status === 'ANSWERED' ? '답변완료' : '답변대기'}
                                    </span>
                                    {question.contact ? <span>{question.contact}</span> : null}
                                </div>
                                <span className="qna-detail-updated">
                                    최종수정 : {formatDate(question.updatedAt || question.createdAt)}
                                </span>
                            </div>
                        </section>

                        <section className="qna-detail-body-box" aria-label="문의 내용">
                            {isEditingQuestion ? (
                                <textarea
                                    value={editQuestionContent}
                                    onChange={(e) => setEditQuestionContent(e.target.value)}
                                    className="qna-edit-content-textarea"
                                    rows={12}
                                    placeholder="내용"
                                    aria-label="내용"
                                />
                            ) : (
                                <div className="qna-body-content">
                                    <ContentRenderer content={question.content || '등록된 내용이 없습니다.'} />
                                </div>
                            )}
                        </section>

                        <section className="qna-detail-answers-section" aria-label="답변">
                            <h4 className="qna-answers-title">답변</h4>

                            {question.answers && question.answers.length > 0 ? (
                                <div className="qna-answers-list">
                                    {question.answers.map((answer) => (
                                        <article key={answer.id} className="qna-answer-item">
                                            <div className="qna-answer-header">
                                                <span className="qna-answer-badge">관리자</span>
                                                <span className="qna-answer-date">{formatDate(answer.createdAt)}</span>
                                                {!readOnly && isAdmin && (
                                                    <button
                                                        type="button"
                                                        className="btn-delete-answer"
                                                        onClick={() => handleDeleteAnswer(answer.id)}
                                                        title="삭제"
                                                        aria-label="답변 삭제"
                                                    >
                                                        <Trash2 size={14} aria-hidden />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="qna-answer-content">
                                                <ContentRenderer content={answer.content} />
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <div className="qna-no-answers">
                                    <p>아직 답변이 없습니다.</p>
                                </div>
                            )}

                            {!readOnly && isAdmin && (
                                <div className="qna-answer-form-container">
                                    <form className="qna-answer-form" onSubmit={handleSubmitAnswer}>
                                        <div className="qna-answer-toolbar">
                                            <button
                                                type="button"
                                                className="btn-attach-image"
                                                onClick={() => answerFileInputRef.current?.click()}
                                                disabled={isUploadingAnswer}
                                                title="이미지 첨부"
                                            >
                                                <ImagePlus size={16} aria-hidden />
                                                {isUploadingAnswer ? '업로드 중...' : '이미지 첨부'}
                                            </button>
                                            <input
                                                ref={answerFileInputRef}
                                                type="file"
                                                accept="image/jpeg,image/png,image/gif,image/webp"
                                                onChange={handleAnswerImageUpload}
                                                className="qna-detail-hidden-file-input"
                                            />
                                        </div>
                                        <textarea
                                            ref={answerTextareaRef}
                                            value={answerContent}
                                            onChange={(e) => setAnswerContent(e.target.value)}
                                            placeholder="답변을 입력해주세요."
                                            rows={4}
                                        />
                                        <div className="qna-answer-form-actions">
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
                        </section>
                    </div>
                ) : (
                    <div className="qna-detail-error">질문을 불러올 수 없습니다.</div>
                )}
            </div>
        </BaseModal>
    );
}

export default QnaDetailModal;

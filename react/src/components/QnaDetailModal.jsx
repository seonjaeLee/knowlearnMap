import { useState, useEffect, useRef } from 'react';
import { CornerDownRight, Edit2, Trash2, ImagePlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { useDialog } from '../hooks/useDialog';
import { qnaApi, imageApi } from '../services/api';
import ContentRenderer from './ContentRenderer';
import { formatKlDateTime } from '../utils/formatKlDate';
import BaseModal from './common/modal/BaseModal';
import {
    qnaDetailModalPaperClassName,
    qnaDetailModalPaperSx,
} from './common/modal/klModalPaper';
import './CsDetailModal.css';
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

    const formatDate = (dateString) => formatKlDateTime(dateString, { fallback: '' });

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

    const renderFooterActions = () => (
        <div className="kl-modal-actions-split">
            <div className="kl-modal-actions-split__left" aria-hidden="true" />
            <div className="kl-modal-actions-split__right">
                {canEditQuestion && isEditingQuestion ? (
                    <>
                        <button
                            type="button"
                            className="kl-btn gray-outline md"
                            onClick={handleCancelEditQuestion}
                            disabled={isSubmitting}
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            className="kl-btn primary-full md"
                            onClick={handleUpdateQuestion}
                            disabled={isSubmitting || !editQuestionTitle.trim() || !editQuestionContent.trim()}
                        >
                            {isSubmitting ? '저장 중...' : '저장'}
                        </button>
                    </>
                ) : (
                    <button type="button" className="kl-btn primary-full md" onClick={onClose}>
                        닫기
                    </button>
                )}
            </div>
        </div>
    );

    if (!isOpen) return null;

    return (
        <BaseModal
            open={isOpen}
            onClose={onClose}
            title="1:1문의"
            maxWidth={false}
            fullWidth={false}
            paperSx={qnaDetailModalPaperSx}
            paperClassName={qnaDetailModalPaperClassName}
            contentClassName="cs-detail-modal-content kl-modal-form"
            actionsClassName="cs-detail-modal-actions"
            actions={renderFooterActions()}
        >
            <div className="cs-detail-modal-body">
                {loading ? (
                    <div className="cs-detail-loading">
                        <div className="loading-spinner" aria-hidden />
                        <p>로딩 중...</p>
                    </div>
                ) : question ? (
                    <div className="cs-detail-content-wrapper">
                        <section className="cs-detail-head" aria-label="문의 정보">
                            <div className="cs-detail-head-top">
                                <div className="cs-detail-title-block">
                                    {question.domainName && (
                                        <span className="cs-detail-category">{question.domainName}</span>
                                    )}
                                    {isEditingQuestion ? (
                                        <input
                                            type="text"
                                            value={editQuestionTitle}
                                            onChange={(e) => setEditQuestionTitle(e.target.value)}
                                            className="cs-detail-title-input"
                                            placeholder="제목"
                                            aria-label="제목"
                                        />
                                    ) : (
                                        <h3 className="cs-detail-title">{question.title}</h3>
                                    )}
                                </div>
                                {canEditQuestion && !isEditingQuestion && (
                                    <div className="cs-detail-actions">
                                        <button
                                            type="button"
                                            className="cs-detail-btn-edit"
                                            onClick={handleStartEditQuestion}
                                            title="수정"
                                            aria-label="문의 수정"
                                        >
                                            <Edit2 size={16} aria-hidden />
                                        </button>
                                        <button
                                            type="button"
                                            className="cs-detail-btn-delete"
                                            onClick={handleDeleteQuestion}
                                            title="삭제"
                                            aria-label="문의 삭제"
                                        >
                                            <Trash2 size={16} aria-hidden />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="cs-detail-meta-row">
                                <div className="cs-detail-inline-meta">
                                    <span>{question.authorEmail?.split('@')[0] || '익명'}</span>
                                    <span>{formatDate(question.createdAt)}</span>
                                    <span>#{question.id}</span>
                                    <span
                                        className={`cs-detail-meta-status ${question.status === 'ANSWERED' ? 'is-answered' : 'is-waiting'}`}
                                    >
                                        {question.status === 'ANSWERED' ? '답변완료' : '답변대기'}
                                    </span>
                                    {question.contact ? <span>{question.contact}</span> : null}
                                </div>
                                <span className="cs-detail-updated">
                                    최종수정 : {formatDate(question.updatedAt || question.createdAt)}
                                </span>
                            </div>
                        </section>

                        <section
                            className={`cs-detail-body-box${isEditingQuestion ? '' : ' cs-detail-body-box--view'}`}
                            aria-label="문의 내용"
                        >
                            {isEditingQuestion ? (
                                <textarea
                                    value={editQuestionContent}
                                    onChange={(e) => setEditQuestionContent(e.target.value)}
                                    className="cs-detail-edit-textarea"
                                    rows={12}
                                    placeholder="내용"
                                    aria-label="내용"
                                />
                            ) : (
                                <div className="cs-detail-body-content">
                                    <ContentRenderer content={question.content || '등록된 내용이 없습니다.'} />
                                </div>
                            )}
                        </section>

                        <section className="qna-detail-answers-section" aria-label="답변">
                            <div className="qna-detail-answers-section__head">
                                <span className="kl-table-row-detail__arrow" aria-hidden>
                                    <CornerDownRight size={18} strokeWidth={1.75} />
                                </span>
                                <h4 className="qna-answers-title">답변</h4>
                            </div>
                            <div className="qna-detail-answers-section__body">
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
                                                            className="qna-answer-btn-delete"
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
                                                    className="kl-icon-label-btn"
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
                                                    className="kl-modal-form-hidden-input"
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
                                                    className="kl-btn primary-outline md"
                                                    disabled={!answerContent.trim() || isSubmitting}
                                                >
                                                    답변 등록
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                ) : (
                    <div className="cs-detail-error">질문을 불러올 수 없습니다.</div>
                )}
            </div>
        </BaseModal>
    );
}

export default QnaDetailModal;

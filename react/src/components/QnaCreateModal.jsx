import { useState, useEffect, useRef } from 'react';
import { ImagePlus } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { imageApi } from '../services/api';
import BaseModal from './common/modal/BaseModal';
import { getModalSubmitLabel } from './common/modal/modalSubmitLabel';
import {
    KL_MODAL_FORM_CHECK_CLASS,
    KL_MODAL_FORM_CHECK_EMPHASIS_CLASS,
    KL_MODAL_FORM_ELEMENT_ID,
    KL_MODAL_FORM_STACK_CLASS,
    klModalFormContentClassName,
} from './common/modal/klModalForm';
import { klFormModalPaperSx } from './common/modal/klModalPaper';

function QnaCreateModal({ isOpen, onClose, onSubmit, editingQuestion }) {
    const { showAlert } = useAlert();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [contact, setContact] = useState('');
    const [domainName, setDomainName] = useState('');
    const [privacyAgreement, setPrivacyAgreement] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            if (editingQuestion) {
                setTitle(editingQuestion.title || '');
                setContent(editingQuestion.content || '');
                setContact(editingQuestion.contact || '');
                setDomainName(editingQuestion.domainName || '');
                setPrivacyAgreement(true);
            } else {
                setTitle('');
                setContent('');
                setContact('');
                setDomainName('');
                setPrivacyAgreement(false);
            }
        }
    }, [isOpen, editingQuestion]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const result = await imageApi.upload(file);
            const imageTag = `[IMAGE:${result.url}]`;

            const textarea = textareaRef.current;
            if (textarea) {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const newContent = content.substring(0, start) + imageTag + content.substring(end);
                setContent(newContent);
            } else {
                setContent((prev) => prev + imageTag);
            }
        } catch (error) {
            console.error('이미지 업로드 실패:', error);
            showAlert('이미지 업로드에 실패했습니다: ' + error.message, 'error');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            return;
        }

        if (!privacyAgreement) {
            showAlert('개인정보 수집 및 이용에 동의해주세요.', 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                title: title.trim(),
                content: content.trim(),
                contact: contact.trim(),
                domainName: domainName.trim(),
            });
            onClose();
        } catch (error) {
            console.error('질문 저장 실패:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const submitDisabled = !title.trim() || !content.trim() || isSubmitting;

    return (
        <BaseModal
            open={isOpen}
            onClose={onClose}
            title={editingQuestion ? '1:1 문의 수정' : '1:1 문의 등록'}
            maxWidth={false}
            fullWidth={false}
            paperSx={klFormModalPaperSx}
            contentClassName={klModalFormContentClassName}
            actions={(
                <div className="kl-modal-actions-split">
                    <div className="kl-modal-actions-split__left" aria-hidden="true" />
                    <div className="kl-modal-actions-split__right">
                        <button type="button" className="kl-btn gray-outline md" onClick={onClose}>
                            취소
                        </button>
                        <button
                            type="submit"
                            className="kl-btn primary-full md"
                            form={KL_MODAL_FORM_ELEMENT_ID}
                            disabled={submitDisabled}
                        >
                            {getModalSubmitLabel(Boolean(editingQuestion), isSubmitting)}
                        </button>
                    </div>
                </div>
            )}
        >
            <form
                id={KL_MODAL_FORM_ELEMENT_ID}
                onSubmit={handleSubmit}
                className={KL_MODAL_FORM_STACK_CLASS}
            >
                <div className="kl-modal-form-row">
                    <label className="kl-modal-form-row__label" htmlFor="qna-contact">
                        연락처 (선택)
                    </label>
                    <div className="kl-modal-form-row__control">
                        <input
                            id="qna-contact"
                            type="text"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            placeholder="숫자만 입력"
                        />
                    </div>
                </div>

                <div className="kl-modal-form-row">
                    <label className="kl-modal-form-row__label" htmlFor="qna-domain">
                        도메인명 (선택)
                    </label>
                    <div className="kl-modal-form-row__control">
                        <input
                            id="qna-domain"
                            type="text"
                            value={domainName}
                            onChange={(e) => setDomainName(e.target.value)}
                        />
                    </div>
                </div>

                <div className="kl-modal-form-row">
                    <label className="kl-modal-form-row__label" htmlFor="qna-title">
                        제목
                    </label>
                    <div className="kl-modal-form-row__control">
                        <input
                            id="qna-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={200}
                            required
                        />
                    </div>
                </div>

                <div className="kl-modal-form-content-field">
                    <label
                        className="kl-modal-form-row__label kl-modal-form-content-field__label"
                        htmlFor="qna-content"
                    >
                        내용
                    </label>
                    <div className="kl-modal-form-toolbar">
                        <button
                            type="button"
                            className="kl-icon-label-btn"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            title="이미지 첨부"
                        >
                            <ImagePlus size={16} aria-hidden />
                            {isUploading ? '업로드 중...' : '이미지 첨부'}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleImageUpload}
                            className="kl-modal-form-hidden-input"
                        />
                    </div>
                    <textarea
                        id="qna-content"
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="내용을 입력해주세요."
                        rows={8}
                        required
                    />
                </div>

                <div>
                    <label className={`${KL_MODAL_FORM_CHECK_CLASS} ${KL_MODAL_FORM_CHECK_EMPHASIS_CLASS}`} htmlFor="qna-privacy-agree">
                        <input
                            id="qna-privacy-agree"
                            type="checkbox"
                            checked={privacyAgreement}
                            onChange={(e) => setPrivacyAgreement(e.target.checked)}
                        />
                        <span>개인정보 수집 및 이용 동의</span>
                    </label>
                    <p className="kl-modal-form-helper kl-modal-form-helper--legal">
                        * 수집항목: [필수]회원정보(이름, 이메일) / [선택] 참조이메일, 연락처 * 개인정보의 수집 및 이용목적: 문의 확인 및 처리 * 개인정보의 보유 및 이용기간: 3년 * 귀하는 동의를 거절할 수 있는 권리를 보유하며, 동의를 거절하는 경우 문의에 대한 처리에 제한이 있습니다.
                    </p>
                </div>
            </form>
        </BaseModal>
    );
}

export default QnaCreateModal;

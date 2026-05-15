import { useState, useEffect, useRef } from 'react';
import { ImagePlus } from 'lucide-react';
import { Button } from '@mui/material';
import { useAlert } from '../context/AlertContext';
import { imageApi } from '../services/api';
import BaseModal from './common/modal/BaseModal';
import './QnaCreateModal.css';

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
                setPrivacyAgreement(true); // Editing implies agreement
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
                setContent(prev => prev + imageTag);
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

    return (
        <BaseModal
            open={isOpen}
            onClose={onClose}
            title={editingQuestion ? '1:1 문의 수정' : '1:1 문의 등록'}
            maxWidth="md"
            fullWidth
            contentClassName="qna-create-modal-content km-modal-form"
            actionsClassName="qna-create-modal-actions"
            actions={(
                <>
                    <Button variant="outlined" onClick={onClose}>취소</Button>
                    <Button
                        variant="contained"
                        type="submit"
                        form="qna-create-form"
                        disabled={!title.trim() || !content.trim() || isSubmitting}
                    >
                        {isSubmitting ? '저장 중...' : (editingQuestion ? '수정' : '등록')}
                    </Button>
                </>
            )}
        >
                <form id="qna-create-form" onSubmit={handleSubmit} className="qna-create-modal-form">
                    <div className="qna-form-group">
                        <label htmlFor="qna-contact">연락처 (선택 사항)</label>
                        <input
                            id="qna-contact"
                            type="text"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            placeholder="연락가능하신 번호를 남겨주세요. (숫자로만 입력)"
                        />
                        <p className="form-help-text">연락가능하신 번호를 남겨주세요.(숫자로만 입력)</p>
                    </div>

                    <div className="qna-form-group">
                        <label htmlFor="qna-domain">도메인명 (선택 사항)</label>
                        <input
                            id="qna-domain"
                            type="text"
                            value={domainName}
                            onChange={(e) => setDomainName(e.target.value)}
                            placeholder="도메인명을 입력해주세요."
                        />
                        <p className="form-help-text">도메인명을 입력해주세요.</p>
                    </div>

                    <div className="qna-form-group">
                        <label htmlFor="qna-title">제목</label>
                        <input
                            id="qna-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="제목을 입력해 주세요"
                            maxLength={200}
                            required
                        />
                    </div>

                    <div className="qna-form-group">
                        <label htmlFor="qna-content">설명</label>
                        <div className="qna-content-toolbar">
                            <button
                                type="button"
                                className="btn-attach-image"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                title="이미지 첨부"
                            >
                                <ImagePlus size={16} />
                                {isUploading ? '업로드 중...' : '이미지 첨부'}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                onChange={handleImageUpload}
                                className="qna-hidden-file-input"
                            />
                        </div>
                        <textarea
                            id="qna-content"
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="내용을 입력해주세요."
                            rows={10}
                            required
                        />
                    </div>

                    <div className="qna-privacy-agreement">
                        <label className="qna-privacy-consent" htmlFor="qna-privacy-agree">
                            <input
                                id="qna-privacy-agree"
                                type="checkbox"
                                checked={privacyAgreement}
                                onChange={(e) => setPrivacyAgreement(e.target.checked)}
                            />
                            <span>개인정보 수집 및 이용 동의</span>
                        </label>
                        <p className="privacy-text">
                            * 수집항목: [필수]회원정보(이름, 이메일) / [선택] 참조이메일, 연락처 * 개인정보의 수집 및 이용목적: 문의 확인 및 처리 * 개인정보의 보유 및 이용기간: 3년 * 귀하는 동의를 거절할 수 있는 권리를 보유하며, 동의를 거절하는 경우 문의에 대한 처리에 제한이 있습니다.
                        </p>
                    </div>

                </form>
        </BaseModal>
    );
}

export default QnaCreateModal;

import { useState, useEffect, useRef } from 'react';

import { ImagePlus } from 'lucide-react';

import { Button } from '@mui/material';

import { useAlert } from '../context/AlertContext';

import { imageApi } from '../services/api';

import BaseModal from './common/modal/BaseModal';
import { getModalSubmitLabel } from './common/modal/modalSubmitLabel';

import {

    qnaFormModalPaperClassName,

    qnaFormModalPaperSx,

} from './common/modal/supportFormModalPaperSx';

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



    return (

        <BaseModal

            open={isOpen}

            onClose={onClose}

            title={editingQuestion ? '1:1 문의 수정' : '1:1 문의 등록'}

            maxWidth={false}

            fullWidth={false}

            paperSx={qnaFormModalPaperSx}

            paperClassName={qnaFormModalPaperClassName}

            contentClassName="qna-create-modal-content kl-modal-form"

            actionsClassName="qna-create-modal-actions"

            actionsAlign="right"

            actions={(

                <>

                    <Button variant="outlined" onClick={onClose}>취소</Button>

                    <Button

                        variant="contained"

                        type="submit"

                        form="qna-create-form"

                        disabled={!title.trim() || !content.trim() || isSubmitting}

                    >

                        {getModalSubmitLabel(Boolean(editingQuestion), isSubmitting)}

                    </Button>

                </>

            )}

        >

            <form id="qna-create-form" onSubmit={handleSubmit} className="qna-create-modal-form">

                <div className="qna-form-row">

                    <label className="qna-form-row__label" htmlFor="qna-contact">

                        연락처 (선택)

                    </label>

                    <div className="qna-form-row__control">

                        <input

                            id="qna-contact"

                            type="text"

                            value={contact}

                            onChange={(e) => setContact(e.target.value)}

                            placeholder="숫자만 입력"

                        />

                    </div>

                </div>



                <div className="qna-form-row">

                    <label className="qna-form-row__label" htmlFor="qna-domain">

                        도메인명 (선택)

                    </label>

                    <div className="qna-form-row__control">

                        <input

                            id="qna-domain"

                            type="text"

                            value={domainName}

                            onChange={(e) => setDomainName(e.target.value)}

                        />

                    </div>

                </div>



                <div className="qna-form-row">

                    <label className="qna-form-row__label" htmlFor="qna-title">

                        제목

                    </label>

                    <div className="qna-form-row__control">

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



                <div className="qna-form-content">
                    <label className="qna-form-content__label" htmlFor="qna-content">
                        내용
                    </label>
                    <div className="qna-content-toolbar">
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

                            className="qna-hidden-file-input"

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


import { useState, useEffect, useRef } from 'react';

import { ImagePlus } from 'lucide-react';

import { Button } from '@mui/material';

import { useAlert } from '../context/AlertContext';

import { imageApi } from '../services/api';

import BaseModal from './common/modal/BaseModal';

import { getModalSubmitLabel } from './common/modal/modalSubmitLabel';

import {

    faqFormModalPaperClassName,

    faqFormModalPaperSx,

} from './common/modal/supportFormModalPaperSx';

import KlCategorySelectInput from './common/form/KlCategorySelectInput';
import './FaqCreateModal.css';



function FaqCreateModal({ isOpen, onClose, onSubmit, editingFaq, categories }) {

    const { showAlert } = useAlert();

    const [title, setTitle] = useState('');

    const [content, setContent] = useState('');

    const [category, setCategory] = useState('');

    const [newCategory, setNewCategory] = useState('');

    const [displayOrder, setDisplayOrder] = useState(0);

    const [isActive, setIsActive] = useState(true);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isUploading, setIsUploading] = useState(false);

    const textareaRef = useRef(null);

    const fileInputRef = useRef(null);



    useEffect(() => {

        if (isOpen) {

            if (editingFaq) {

                setTitle(editingFaq.title || '');

                setContent(editingFaq.content || '');

                setCategory(editingFaq.category || '');

                setNewCategory('');

                setDisplayOrder(editingFaq.displayOrder || 0);

                setIsActive(editingFaq.isActive !== false);

            } else {

                setTitle('');

                setContent('');

                setCategory('');

                setNewCategory('');

                setDisplayOrder(0);

                setIsActive(true);

            }

        }

    }, [isOpen, editingFaq]);



    const handleCategoryChange = ({ mode, category: listCategory, directText }) => {
        if (mode === 'direct') {
            setCategory('');
            setNewCategory(directText);
            return;
        }
        setCategory(listCategory);
        setNewCategory('');
    };

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



        setIsSubmitting(true);

        try {

            const finalCategory = newCategory.trim() || category;

            await onSubmit({

                title: title.trim(),

                content: content.trim(),

                category: finalCategory || null,

                displayOrder,

                isActive,

            });

            onClose();

        } catch (error) {

            console.error('FAQ 저장 실패:', error);

        } finally {

            setIsSubmitting(false);

        }

    };



    if (!isOpen) return null;



    return (

        <BaseModal

            open={isOpen}

            onClose={onClose}

            title={editingFaq ? '자주 묻는 질문 수정' : '자주 묻는 질문 작성'}

            maxWidth={false}

            fullWidth={false}

            paperSx={faqFormModalPaperSx}

            paperClassName={faqFormModalPaperClassName}

            contentClassName="faq-create-modal-content kl-modal-form"

            actionsClassName="faq-modal-actions"

            actionsAlign="right"

            actions={(

                <>

                    <Button variant="outlined" onClick={onClose}>취소</Button>

                    <Button

                        variant="contained"

                        type="submit"

                        form="faq-create-form"

                        disabled={!title.trim() || !content.trim() || isSubmitting}

                    >

                        {getModalSubmitLabel(Boolean(editingFaq), isSubmitting)}

                    </Button>

                </>

            )}

        >

            <form id="faq-create-form" onSubmit={handleSubmit} className="faq-modal-form">

                <div className="faq-form-row">

                    <label className="faq-form-row__label" htmlFor="faq-title">

                        제목 <span className="faq-required" aria-hidden="true">*</span>

                    </label>

                    <div className="faq-form-row__control">

                        <input

                            id="faq-title"

                            type="text"

                            value={title}

                            onChange={(e) => setTitle(e.target.value)}

                            maxLength={200}

                            required

                        />

                    </div>

                </div>



                <div className="faq-form-row faq-form-row--start">

                    <label className="faq-form-row__label" htmlFor="faq-category">

                        카테고리

                    </label>

                    <div className="faq-form-row__control">

                        <KlCategorySelectInput
                            key={isOpen ? (editingFaq?.id ?? 'create') : 'closed'}
                            selectId="faq-category"
                            inputId="faq-new-category"
                            categories={categories || []}
                            initialCategory={editingFaq?.category ?? ''}
                            onChange={handleCategoryChange}
                        />

                    </div>

                </div>

                <div className="faq-form-row">
                    <label className="faq-form-row__label" htmlFor="faq-order">
                        표시 순서
                    </label>
                    <div className="faq-form-row__control faq-order-active-control">
                        <div className="faq-order-input-wrap">
                            <input
                                id="faq-order"
                                className="faq-order-input"
                                type="number"
                                value={displayOrder}
                                onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                                min={0}
                            />
                        </div>
                        <label className="faq-active-checkbox" htmlFor="faq-active">
                            <input
                                id="faq-active"
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                            />
                            <span>활성화</span>
                        </label>
                    </div>
                </div>

                <div className="faq-form-content">
                    <label className="faq-form-content__label" htmlFor="faq-content">
                        내용 <span className="faq-required" aria-hidden="true">*</span>
                    </label>

                    <div className="faq-content-toolbar">

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

                            className="faq-hidden-file-input"

                        />

                    </div>

                    <textarea

                        id="faq-content"

                        ref={textareaRef}

                        value={content}

                        onChange={(e) => setContent(e.target.value)}

                        placeholder="내용을 입력해주세요."

                        rows={8}

                        required

                    />

                </div>



            </form>

        </BaseModal>

    );

}



export default FaqCreateModal;


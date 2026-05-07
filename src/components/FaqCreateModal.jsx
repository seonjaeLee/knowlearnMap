import { useState, useEffect, useRef } from 'react';
import { ImagePlus } from 'lucide-react';
import { Button } from '@mui/material';
import { useAlert } from '../context/AlertContext';
import { imageApi } from '../services/api';
import BaseModal from './common/modal/BaseModal';
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
            title={editingFaq ? 'FAQ 수정' : 'FAQ 작성'}
            maxWidth="md"
            fullWidth
            contentClassName="faq-modal-content"
            actionsClassName="faq-modal-actions"
            actions={(
                <>
                    <Button variant="outlined" onClick={onClose}>취소</Button>
                    <Button
                        variant="contained"
                        type="submit"
                        form="faq-create-form"
                        disabled={!title.trim() || !content.trim() || isSubmitting}
                    >
                        {isSubmitting ? '저장 중...' : (editingFaq ? '수정' : '등록')}
                    </Button>
                </>
            )}
        >
                <form id="faq-create-form" onSubmit={handleSubmit} className="faq-modal-form">
                    <div className="faq-form-group">
                        <label htmlFor="faq-title">제목 *</label>
                        <input
                            id="faq-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="FAQ 제목을 입력하세요"
                            maxLength={200}
                            required
                        />
                    </div>

                    <div className="faq-form-group">
                        <label htmlFor="faq-category">카테고리</label>
                        <div className="faq-category-input">
                            <select
                                id="faq-category"
                                value={category}
                                onChange={(e) => {
                                    setCategory(e.target.value);
                                    if (e.target.value) setNewCategory('');
                                }}
                            >
                                <option value="">카테고리 선택</option>
                                {categories.map((cat, index) => (
                                    <option key={index} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <span className="or-divider">또는</span>
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => {
                                    setNewCategory(e.target.value);
                                    if (e.target.value) setCategory('');
                                }}
                                placeholder="새 카테고리 입력"
                                maxLength={50}
                            />
                        </div>
                    </div>

                    <div className="faq-form-group">
                        <label htmlFor="faq-content">내용 *</label>
                        <div className="faq-content-toolbar">
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
                                className="faq-hidden-file-input"
                            />
                        </div>
                        <textarea
                            id="faq-content"
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="FAQ 답변 내용을 입력하세요"
                            rows={8}
                            required
                        />
                    </div>

                    <div className="faq-form-row">
                        <div className="faq-form-group half">
                            <label htmlFor="faq-order">표시 순서</label>
                            <input
                                id="faq-order"
                                type="number"
                                value={displayOrder}
                                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                                min={0}
                            />
                        </div>
                        <div className="faq-form-group half">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                />
                                <span>활성화</span>
                            </label>
                        </div>
                    </div>

                </form>
        </BaseModal>
    );
}

export default FaqCreateModal;

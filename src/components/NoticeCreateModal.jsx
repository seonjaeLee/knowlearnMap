import { useState, useEffect, useRef } from 'react';
import { X, ImagePlus } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { imageApi } from '../services/api';
import './NoticeCreateModal.css';

function NoticeCreateModal({ isOpen, onClose, onSubmit, editingNotice }) {
    const { showAlert } = useAlert();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const modalRef = useRef(null);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            if (editingNotice) {
                setTitle(editingNotice.title || '');
                setContent(editingNotice.content || '');
                setCategory(editingNotice.category || '');
            } else {
                setTitle('');
                setContent('');
                setCategory('');
            }
        }
    }, [isOpen, editingNotice]);

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
            await onSubmit({
                title: title.trim(),
                content: content.trim(),
                category: category.trim() || null,
            });
            onClose();
        } catch (error) {
            console.error('공지사항 저장 실패:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="notice-create-modal-overlay">
            <div className="notice-create-modal-container" ref={modalRef}>
                <div className="notice-create-modal-header">
                    <h2>{editingNotice ? '공지사항 수정' : '공지사항 작성'}</h2>
                    <button className="notice-create-modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="notice-create-modal-form">
                    <div className="notice-form-group">
                        <label htmlFor="notice-title">제목 *</label>
                        <input
                            id="notice-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="공지사항 제목을 입력하세요"
                            maxLength={200}
                            required
                        />
                    </div>

                    <div className="notice-form-group">
                        <label htmlFor="notice-category">카테고리</label>
                        <input
                            id="notice-category"
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="카테고리 입력 (선택)"
                            maxLength={50}
                        />
                    </div>

                    <div className="notice-form-group">
                        <label htmlFor="notice-content">내용 *</label>
                        <div className="notice-content-toolbar">
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
                                style={{ display: 'none' }}
                            />
                        </div>
                        <textarea
                            id="notice-content"
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="내용을 입력하세요"
                            rows={10}
                            required
                        />
                    </div>

                    <div className="notice-create-modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            취소
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={!title.trim() || !content.trim() || isSubmitting}
                        >
                            {isSubmitting ? '저장 중...' : (editingNotice ? '수정' : '등록')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NoticeCreateModal;

import { useState, useEffect, useRef } from 'react';
import { ImagePlus } from 'lucide-react';
import { Button } from '@mui/material';
import { useAlert } from '../context/AlertContext';
import { imageApi } from '../services/api';
import BaseModal from './common/modal/BaseModal';
import { getModalSubmitLabel } from './common/modal/modalSubmitLabel';
import {
    noticeFormModalPaperClassName,
    noticeFormModalPaperSx,
} from './common/modal/supportFormModalPaperSx';
import './NoticeCreateModal.css';

function NoticeCreateModal({ isOpen, onClose, onSubmit, editingNotice }) {
    const { showAlert } = useAlert();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
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
        <BaseModal
            open={isOpen}
            onClose={onClose}
            title={editingNotice ? '공지사항 수정' : '공지사항 작성'}
            maxWidth={false}
            fullWidth={false}
            paperSx={noticeFormModalPaperSx}
            paperClassName={noticeFormModalPaperClassName}
            contentClassName="notice-create-modal-content kl-modal-form"
            actionsClassName="notice-modal-actions"
            actionsAlign="right"
            actions={(
                <>
                    <Button variant="outlined" onClick={onClose}>취소</Button>
                    <Button
                        variant="contained"
                        type="submit"
                        form="notice-create-form"
                        disabled={!title.trim() || !content.trim() || isSubmitting}
                    >
                        {getModalSubmitLabel(Boolean(editingNotice), isSubmitting)}
                    </Button>
                </>
            )}
        >
            <form id="notice-create-form" onSubmit={handleSubmit} className="notice-modal-form">
                <div className="notice-form-row">
                    <label className="notice-form-row__label" htmlFor="notice-title">
                        제목 <span className="notice-required" aria-hidden="true">*</span>
                    </label>
                    <div className="notice-form-row__control">
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
                </div>

                <div className="notice-form-row">
                    <label className="notice-form-row__label" htmlFor="notice-category">
                        카테고리
                    </label>
                    <div className="notice-form-row__control">
                        <input
                            id="notice-category"
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="카테고리 입력 (선택)"
                            maxLength={50}
                        />
                    </div>
                </div>

                <div className="notice-form-content">
                    <label className="notice-form-content__label" htmlFor="notice-content">
                        내용 <span className="notice-required" aria-hidden="true">*</span>
                    </label>
                    <div className="notice-content-toolbar">
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
                            className="notice-hidden-file-input"
                        />
                    </div>
                    <textarea
                        id="notice-content"
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

export default NoticeCreateModal;

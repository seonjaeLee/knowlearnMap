import React, { useState, useEffect } from 'react';
import BaseModal from '../../../components/common/modal/BaseModal';
import {
    KL_MODAL_FORM_ELEMENT_ID,
    KL_MODAL_FORM_STACK_CLASS,
    klModalFormContentClassName,
} from '../../../components/common/modal/klModalForm';
import { klFormModalPaperSx } from '../../../components/common/modal/klModalPaper';
import { PROMPT_SECURITY_SELECT_ITEMS } from '../../constants/securityLevels';

const EditPromptDialog = ({
    open,
    prompt,
    categories,
    purposes,
    onClose,
    onSave,
    isUpdating,
}) => {
    const [formData, setFormData] = useState({
        category: '',
        purpose: '',
        name: '',
        description: '',
        securityLevel: 'PUBLIC',
    });

    useEffect(() => {
        if (prompt) {
            setFormData({
                category: prompt.category || '',
                purpose: prompt.purpose || '',
                name: prompt.name || '',
                description: prompt.description || '',
                securityLevel: prompt.securityLevel || 'PUBLIC',
            });
        }
    }, [prompt]);

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <BaseModal
            open={open}
            title="프롬프트 정보 수정"
            onClose={onClose}
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
                            disabled={!formData.name?.trim() || isUpdating}
                        >
                            {isUpdating ? '저장 중...' : '저장'}
                        </button>
                    </div>
                </div>
            )}
        >
            <form
                id={KL_MODAL_FORM_ELEMENT_ID}
                className={KL_MODAL_FORM_STACK_CLASS}
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSave();
                }}
            >
                <div className="kl-modal-form-row">
                    <label className="kl-modal-form-row__label" htmlFor="prompt-edit-code">
                        코드
                    </label>
                    <div className="kl-modal-form-row__control">
                        <input
                            id="prompt-edit-code"
                            type="text"
                            className="kl-form-readonly kl-form-readonly--control"
                            value={prompt?.code || ''}
                            readOnly
                            aria-readonly="true"
                        />
                    </div>
                </div>

                <div className="kl-modal-form-row">
                    <label className="kl-modal-form-row__label" htmlFor="prompt-edit-category">
                        카테고리
                    </label>
                    <div className="kl-modal-form-row__control">
                        <select
                            id="prompt-edit-category"
                            value={formData.category}
                            onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                        >
                            <option value="" disabled>
                                선택
                            </option>
                            {(categories || []).map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="kl-modal-form-row">
                    <label className="kl-modal-form-row__label" htmlFor="prompt-edit-purpose">
                        용도
                    </label>
                    <div className="kl-modal-form-row__control">
                        <select
                            id="prompt-edit-purpose"
                            value={formData.purpose}
                            onChange={(e) => setFormData((prev) => ({ ...prev, purpose: e.target.value }))}
                        >
                            <option value="" disabled>
                                선택
                            </option>
                            {(purposes || []).map((p) => (
                                <option key={p} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="kl-modal-form-row">
                    <label className="kl-modal-form-row__label" htmlFor="prompt-edit-security">
                        보안 등급
                    </label>
                    <div className="kl-modal-form-row__control">
                        <select
                            id="prompt-edit-security"
                            value={formData.securityLevel}
                            onChange={(e) => setFormData((prev) => ({
                                ...prev,
                                securityLevel: e.target.value,
                            }))}
                        >
                            {PROMPT_SECURITY_SELECT_ITEMS.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="kl-modal-form-row">
                    <label className="kl-modal-form-row__label" htmlFor="prompt-edit-name">
                        이름
                        <span className="kl-modal-form-required" aria-hidden="true"> *</span>
                    </label>
                    <div className="kl-modal-form-row__control">
                        <input
                            id="prompt-edit-name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="이름 입력"
                            required
                        />
                    </div>
                </div>

                <div className="kl-modal-form-row kl-vert-start">
                    <label className="kl-modal-form-row__label" htmlFor="prompt-edit-description">
                        설명
                    </label>
                    <div className="kl-modal-form-row__control">
                        <textarea
                            id="prompt-edit-description"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData((prev) => ({
                                ...prev,
                                description: e.target.value,
                            }))}
                            placeholder="설명 입력"
                        />
                    </div>
                </div>
            </form>
        </BaseModal>
    );
};

export default EditPromptDialog;

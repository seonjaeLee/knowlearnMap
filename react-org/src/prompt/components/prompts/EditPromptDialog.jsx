import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import BaseModal from '../../../components/common/modal/BaseModal';
import KlModalSelect from '../../../components/common/modal/KlModalSelect';
import {
  klFormModalPaperSx,
} from '../../../components/common/modal/klModalPaper';
import { PROMPT_SECURITY_SELECT_ITEMS } from '../../constants/securityLevels';
import './PromptDialogs.css';

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

  const categoryOptions = (categories || []).map((cat) => ({ value: cat, label: cat }));
  const purposeOptions = (purposes || []).map((p) => ({ value: p, label: p }));

  return (
    <BaseModal
      open={open}
      title="프롬프트 정보 수정"
      onClose={onClose}
      maxWidth={false}
      fullWidth={false}
      paperSx={klFormModalPaperSx}
      contentClassName="prompt-edit-modal-content kl-modal-form"
      actionsClassName="prompt-modal-actions"
      actionsAlign="right"
      actions={(
        <>
          <Button variant="outlined" onClick={onClose}>
            취소
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!formData.name?.trim() || isUpdating}
          >
            {isUpdating ? '저장 중...' : '저장'}
          </Button>
        </>
      )}
    >
      <form className="prompt-modal-form" onSubmit={(e) => e.preventDefault()}>
        <div className="prompt-form-row">
          <label className="prompt-form-row__label" htmlFor="prompt-edit-code">
            코드
          </label>
          <div className="prompt-form-row__control">
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

        <div className="prompt-form-row">
          <label className="prompt-form-row__label" htmlFor="prompt-edit-category">
            카테고리
          </label>
          <div className="prompt-form-row__control">
            <KlModalSelect
              id="prompt-edit-category"
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              optionItems={categoryOptions}
              placeholder="선택"
              includeNoneOption={false}
            />
          </div>
        </div>

        <div className="prompt-form-row">
          <label className="prompt-form-row__label" htmlFor="prompt-edit-purpose">
            용도
          </label>
          <div className="prompt-form-row__control">
            <KlModalSelect
              id="prompt-edit-purpose"
              value={formData.purpose}
              onChange={(e) => setFormData((prev) => ({ ...prev, purpose: e.target.value }))}
              optionItems={purposeOptions}
              placeholder="선택"
              includeNoneOption={false}
            />
          </div>
        </div>

        <div className="prompt-form-row">
          <label className="prompt-form-row__label" htmlFor="prompt-edit-security">
            보안 등급
          </label>
          <div className="prompt-form-row__control">
            <KlModalSelect
              id="prompt-edit-security"
              value={formData.securityLevel}
              onChange={(e) => setFormData((prev) => ({ ...prev, securityLevel: e.target.value }))}
              optionItems={PROMPT_SECURITY_SELECT_ITEMS}
              includeEmptyOption={false}
              includeNoneOption={false}
            />
          </div>
        </div>

        <div className="prompt-form-row">
          <label className="prompt-form-row__label" htmlFor="prompt-edit-name">
            이름 <span className="required-asterisk" aria-hidden>*</span>
          </label>
          <div className="prompt-form-row__control">
            <input
              id="prompt-edit-name"
              type="text"
              className="kl-form-control"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="이름 입력"
              required
            />
          </div>
        </div>

        <div className="prompt-form-row prompt-form-row--start">
          <label className="prompt-form-row__label" htmlFor="prompt-edit-description">
            설명
          </label>
          <div className="prompt-form-row__control">
            <textarea
              id="prompt-edit-description"
              className="kl-form-control"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="설명 입력"
            />
          </div>
        </div>
      </form>
    </BaseModal>
  );
};

export default EditPromptDialog;

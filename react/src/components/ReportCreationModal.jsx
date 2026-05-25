import { useRef, useState } from 'react';
import BaseModal from './common/modal/BaseModal';
import { KL_MODAL_FORM_STACK_CLASS, klModalFormContentClassName } from './common/modal/klModalForm';
import { klTallFormModalPaperSx } from './common/modal/klModalPaper';
import './ReportCreationModal.css';

function ReportCreationModal({ isOpen, onClose, templateData, onGenerate }) {
    const textAreaRef = useRef(null);
    const [reportLang, setReportLang] = useState('ko');

    if (!isOpen) return null;

    const handleGenerate = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const prompt = textAreaRef.current ? textAreaRef.current.value : '';

        if (onGenerate) {
            onGenerate({
                template: templateData?.id || 'custom',
                customPrompt: prompt,
            });
        }
    };

    return (
        <BaseModal
            open={isOpen}
            onClose={onClose}
            title="보고서 생성"
            maxWidth={false}
            fullWidth={false}
            paperSx={klTallFormModalPaperSx}
            contentClassName={klModalFormContentClassName}
            actions={(
                <div className="kl-modal-actions-split">
                    <div className="kl-modal-actions-split__left" aria-hidden="true" />
                    <div className="kl-modal-actions-split__right">
                        <button type="button" className="kl-btn gray-outline md" onClick={onClose}>
                            취소
                        </button>
                        <button type="button" className="kl-btn primary-full md" onClick={handleGenerate}>
                            생성
                        </button>
                    </div>
                </div>
            )}
        >
            <div className={`report-creation-modal-body ${KL_MODAL_FORM_STACK_CLASS}`}>
                {templateData?.title ? (
                    <div className="template-info">
                        <h3 className="template-title">{templateData.title}</h3>
                        <p className="template-description">{templateData.description}</p>
                    </div>
                ) : null}

                <div className="kl-modal-form-row">
                    <label className="kl-modal-form-row__label" htmlFor="report-creation-lang">
                        언어
                    </label>
                    <div className="kl-modal-form-row__control">
                        <select
                            id="report-creation-lang"
                            value={reportLang}
                            onChange={(e) => setReportLang(e.target.value)}
                        >
                            <option value="ko">한국어 (기본)</option>
                            <option value="en">English</option>
                            <option value="ja">日本語</option>
                            <option value="zh">中文</option>
                        </select>
                    </div>
                </div>

                <div className="kl-modal-form-row kl-vert-start">
                    <label className="kl-modal-form-row__label" htmlFor="report-creation-prompt">
                        보고서 설명
                    </label>
                    <div className="kl-modal-form-row__control">
                        <textarea
                            id="report-creation-prompt"
                            ref={textAreaRef}
                            className="form-textarea"
                            placeholder={templateData?.placeholder || '예:\n\n새로운 웰니스 음료 출시를 위해 2026년 가능성 음료 시장에 관한 전문적인 경쟁 분석 리포트를 작성해 줘. 어조는 분석적이고 전문적이어야 하고, 주요 경쟁사와 유통 및 가격 책정에 중점을 두고 출시 전략을 수립해 줘.'}
                            rows={8}
                            defaultValue={templateData?.defaultPrompt || ''}
                        />
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}

export default ReportCreationModal;

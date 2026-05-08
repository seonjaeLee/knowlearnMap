import { useRef } from 'react';
import { Button } from '@mui/material';
import BaseModal from './common/modal/BaseModal';
import './ReportCreationModal.css';

function ReportCreationModal({ isOpen, onClose, templateData, onGenerate }) {
    const textAreaRef = useRef(null);

    if (!isOpen) return null;

    const handleGenerate = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        console.log("[DEBUG] ReportCreationModal: Generate button clicked (default prevented)");
        const prompt = textAreaRef.current ? textAreaRef.current.value : "";

        if (onGenerate) {
            console.log("ReportCreationModal: Calling onGenerate with", {
                template: templateData?.id || 'custom',
                customPrompt: prompt
            });
            onGenerate({
                template: templateData?.id || 'custom',
                customPrompt: prompt
            });
        } else {
            console.error("[DEBUG] ReportCreationModal: onGenerate prop is missing!");
        }
    };

    return (
        <BaseModal
            open={isOpen}
            onClose={onClose}
            title="보고서 생성"
            maxWidth="md"
            fullWidth
            contentClassName="report-creation-modal-content"
            actionsClassName="report-creation-modal-actions"
            actions={(
                <>
                    <Button type="button" variant="outlined" onClick={onClose}>
                        취소
                    </Button>
                    <Button type="button" variant="contained" onClick={handleGenerate}>
                        생성
                    </Button>
                </>
            )}
        >
                <div className="report-creation-modal-body">
                    {/* Template Info - only show if templateData has template info */}
                    {templateData?.title && (
                        <div className="template-info">
                            <h3 className="template-title">{templateData.title}</h3>
                            <p className="template-description">{templateData.description}</p>
                        </div>
                    )}

                    {/* Language Selection */}
                    <div className="form-section">
                        <label className="form-label">언어를 선택하세요</label>
                        <select className="form-select">
                            <option value="ko">한국어 (기본)</option>
                            <option value="en">English</option>
                            <option value="ja">日本語</option>
                            <option value="zh">中文</option>
                        </select>
                    </div>

                    {/* Custom Prompt */}
                    <div className="form-section">
                        <label className="form-label">만들려는 보고서를 설명하세요</label>
                        <textarea
                            ref={textAreaRef}
                            className="form-textarea"
                            placeholder={templateData?.placeholder || "예:\n\n새로운 웰니스 음료 출시를 위해 2026년 가능성 음료 시장에 관한 전문적인 경쟁 분석 리포트를 작성해 줘. 어조는 분석적이고 전문적이어야 하고, 주요 경쟁사와 유통 및 가격 책정에 중점을 두고 출시 전략을 수립해 줘."}
                            rows="8"
                            defaultValue={templateData?.defaultPrompt || ""}
                        ></textarea>
                    </div>

                </div>
        </BaseModal>
    );
}

export default ReportCreationModal;

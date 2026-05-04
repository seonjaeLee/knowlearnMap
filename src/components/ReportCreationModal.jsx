import { useEffect, useRef } from 'react';
import './ReportCreationModal.css';

function ReportCreationModal({ isOpen, onClose, templateData, onGenerate }) {
    const modalRef = useRef(null);
    const textAreaRef = useRef(null); // Added ref for textarea

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

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
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
            <div className="modal-container creation-modal" ref={modalRef}>
                <div className="modal-header">
                    <div className="modal-header-content">
                        <button className="back-btn" onClick={onClose}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                            </svg>
                        </button>
                        <span className="modal-icon">📄</span>
                        <h2 className="modal-title">보고서 생성</h2>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                    </button>
                </div>

                <div className="modal-body">
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

                    {/* Generate Button */}
                    <div className="form-actions">
                        <button type="button" className="btn-generate" onClick={handleGenerate}>
                            생성
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReportCreationModal;

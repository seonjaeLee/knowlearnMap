import React from 'react';
import { ChevronLeft } from 'lucide-react';
import KlModalClose from './common/KlModalClose';
import { upgradeApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import './UpgradeModal.css';

const UpgradeModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const { showAlert } = useAlert();
    const panelRef = React.useRef(null);
    const sliderRef = React.useRef(null);
    const [view, setView] = React.useState('plans');
    const [targetType, setTargetType] = React.useState('PRO_UPGRADE');
    const [loading, setLoading] = React.useState(false);
    const [consentChecked, setConsentChecked] = React.useState(false);
    const [hasPendingRequest, setHasPendingRequest] = React.useState(false);
    const [gradeLimits, setGradeLimits] = React.useState(null);
    const [formData, setFormData] = React.useState({
        company: '',
        name: '',
        phone: '',
        files: [],
    });

    React.useEffect(() => {
        if (isOpen) {
            upgradeApi.checkStatus()
                .then((data) => {
                    setHasPendingRequest(data.hasPending);
                })
                .catch((err) => console.error('Failed to check status', err));

            upgradeApi.getGradeLimits()
                .then((data) => {
                    setGradeLimits(data);
                })
                .catch((err) => console.error('Failed to fetch grade limits', err));
        }
    }, [isOpen]);

    const handleClose = React.useCallback(() => {
        if (loading) return;
        setView('plans');
        setFormData({ company: '', name: '', phone: '', files: [] });
        setConsentChecked(false);
        onClose();
    }, [loading, onClose]);

    React.useEffect(() => {
        if (!isOpen) return undefined;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [isOpen, handleClose]);

    React.useEffect(() => {
        if (sliderRef.current) {
            sliderRef.current.scrollTop = 0;
        }
    }, [view]);

    if (!isOpen) return null;

    const currentGrade = user?.grade || 'FREE';

    const openForm = (type) => {
        setTargetType(type);
        setConsentChecked(false);
        setView('form');
    };

    const goBackToPlans = () => {
        setView('plans');
        setConsentChecked(false);
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 2) {
            showAlert('최대 2개의 파일만 업로드 가능합니다.');
            return;
        }
        setFormData({ ...formData, files: selectedFiles });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('type', targetType);
            data.append('company', formData.company);
            data.append('name', formData.name);
            data.append('phone', formData.phone);

            if (formData.files && formData.files.length > 0) {
                formData.files.forEach((file) => {
                    data.append('files', file);
                });
            }

            await upgradeApi.request(data);

            const msg = targetType === 'PRO_UPGRADE'
                ? 'Pro 업그레이드 신청이 완료되었습니다.\n검토 후 승인 처리됩니다.'
                : 'Max 상담 신청이 완료되었습니다.\n담당자가 확인 후 연락드리겠습니다.';

            showAlert(msg);
            handleClose();
        } catch (error) {
            console.error('Request failed:', error);
            showAlert('오류가 발생했습니다: ' + (error.message || 'Unknown Error'));
        } finally {
            setLoading(false);
        }
    };

    const isProForm = targetType === 'PRO_UPGRADE';

    const renderCurrentStatus = (label) => (
        <div className="plan-current-status" aria-current="true">
            <span className="plan-current-dot" aria-hidden />
            {label}
        </div>
    );

    return (
        <div className="upgrade-modal-overlay" onClick={handleClose}>
            <div
                ref={panelRef}
                className={`upgrade-modal-content ${view === 'form' ? 'upgrade-modal-content--form' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="upgrade-modal-header">
                    <h2 className="upgrade-title">
                        {view === 'plans'
                            ? '함께 성장하는 요금제'
                            : isProForm
                              ? 'Pro 업그레이드 신청'
                              : 'Max 상담 신청'}
                    </h2>
                    <KlModalClose
                        className="upgrade-modal-header__close"
                        onClick={handleClose}
                        disabled={loading}
                    />
                </header>

                <div ref={sliderRef} className="upgrade-slider">
                    <div
                        className={`upgrade-slide upgrade-slide--plans ${view === 'plans' ? 'is-active' : ''}`}
                        aria-hidden={view !== 'plans'}
                    >
                            {hasPendingRequest && (
                                <div className="upgrade-pending-notice" role="status">
                                    현재 승인 대기 중인 업그레이드 요청이 있어, 추가 신청이 불가능합니다.
                                </div>
                            )}

                            <div className="plans-container">
                                <div className={`plan-card ${currentGrade === 'FREE' ? 'is-current' : ''}`}>
                                    <h3 className="plan-name">Free</h3>
                                    <p className="plan-desc">개인 학습 및 기초 체험</p>
                                    <div className="plan-highlight">모든 기능 무료 제공 (데모)</div>
                                    <div className="plan-price">
                                        0원 <span className="plan-period">/월</span>
                                    </div>
                                    {currentGrade === 'FREE'
                                        ? renderCurrentStatus('현재 이용 중')
                                        : (
                                            <button type="button" className="plan-btn plan-btn--muted" disabled>
                                                기본 포함
                                            </button>
                                        )}
                                    <ul className="plan-features-list">
                                        <li>
                                            <strong>워크스페이스 {gradeLimits?.FREE?.maxWorkspaces ?? 1}개</strong>
                                        </li>
                                        <li>
                                            데이터: {gradeLimits?.FREE?.maxSources ?? 3}개 (각{' '}
                                            {gradeLimits?.FREE?.maxPages ?? 5}장)
                                        </li>
                                        <li>Open LLM RAG</li>
                                    </ul>
                                </div>

                                <div
                                    className={`plan-card ${currentGrade === 'PRO' || currentGrade === 'MAX' ? 'is-current' : ''}`}
                                >
                                    <h3 className="plan-name">Pro</h3>
                                    <p className="plan-desc">팀 단위 지식 자산화</p>
                                    <div className="plan-highlight">하이브리드 라우팅 잠금 해제</div>
                                    <div className="plan-price">
                                        0원 <span className="plan-period">/월</span>
                                    </div>
                                    {currentGrade === 'PRO'
                                        ? renderCurrentStatus('현재 이용 중')
                                        : currentGrade === 'MAX'
                                          ? renderCurrentStatus('포함됨')
                                          : (
                                        <button
                                            type="button"
                                            className="plan-btn kl-btn primary-outline lg"
                                            onClick={() => openForm('PRO_UPGRADE')}
                                            disabled={hasPendingRequest}
                                        >
                                                {hasPendingRequest ? '승인 심사 중' : '무료로 Pro 업그레이드'}
                                            </button>
                                        )}
                                    <ul className="plan-features-list">
                                        <li>
                                            <strong>워크스페이스 {gradeLimits?.PRO?.maxWorkspaces ?? 3}개</strong>
                                        </li>
                                        <li>
                                            데이터: {gradeLimits?.PRO?.maxSources ?? 10}개 (각{' '}
                                            {gradeLimits?.PRO?.maxPages ?? 20}장)
                                        </li>
                                        <li>에이전트 라우팅</li>
                                    </ul>
                                </div>

                                <div className={`plan-card ${currentGrade === 'MAX' ? 'is-current' : ''}`}>
                                    <h3 className="plan-name">Max</h3>
                                    <p className="plan-desc">보안 특화 엔터프라이즈</p>
                                    <div className="plan-highlight">전용 sLLM 구축</div>
                                    <div className="plan-price">
                                        GPU 비용 협의 <span className="plan-period">/별도</span>
                                    </div>
                                    {currentGrade === 'MAX'
                                        ? renderCurrentStatus('현재 이용 중')
                                        : (
                                            <button
                                                type="button"
                                                className="plan-btn kl-btn primary-outline lg"
                                                onClick={() => openForm('MAX_CONSULTATION')}
                                                disabled={hasPendingRequest}
                                            >
                                                {hasPendingRequest ? '상담 접수 중' : 'Max 상담 신청하기'}
                                            </button>
                                        )}
                                    <ul className="plan-features-list">
                                        <li>
                                            <strong>워크스페이스 {gradeLimits?.MAX?.maxWorkspaces ?? 10}개</strong>
                                        </li>
                                        <li>
                                            데이터: {gradeLimits?.MAX?.maxSources ?? 20}개 (각{' '}
                                            {gradeLimits?.MAX?.maxPages ?? 500}장)
                                        </li>
                                        <li>전용 sLLM 추론 엔진</li>
                                        <li>독자적 보안 환경</li>
                                    </ul>
                                </div>
                            </div>
                            <p className="upgrade-disclaimer">* 본 요금제는 데모 기간 한정입니다.</p>
                        </div>

                        <div
                            className={`upgrade-slide upgrade-slide--form ${view === 'form' ? 'is-active' : ''}`}
                            aria-hidden={view !== 'form'}
                        >
                            <div className="upgrade-form-panel">
                                <form className="upgrade-request-form" onSubmit={handleSubmit}>
                                <div className="upgrade-form-group">
                                    <label className="upgrade-form-label" htmlFor="upgrade-company">
                                        회사명 (또는 소속)
                                    </label>
                                    <input
                                        id="upgrade-company"
                                        type="text"
                                        className="upgrade-form-input"
                                        required
                                        value={formData.company}
                                        onChange={(e) =>
                                            setFormData({ ...formData, company: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="upgrade-form-group">
                                    <label className="upgrade-form-label" htmlFor="upgrade-name">
                                        담당자명
                                    </label>
                                    <input
                                        id="upgrade-name"
                                        type="text"
                                        className="upgrade-form-input"
                                        required
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="upgrade-form-group">
                                    <label className="upgrade-form-label" htmlFor="upgrade-phone">
                                        핸드폰 번호
                                    </label>
                                    <input
                                        id="upgrade-phone"
                                        type="tel"
                                        className="upgrade-form-input"
                                        required
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phone: e.target.value })
                                        }
                                        placeholder="010-0000-0000"
                                    />
                                </div>

                                {isProForm && (
                                    <div className="upgrade-form-group">
                                        <label className="upgrade-form-label" htmlFor="file-upload">
                                            대표 문서 (선택, 최대 2개)
                                        </label>
                                        <div
                                            className="upgrade-file-drop"
                                            onClick={() => document.getElementById('file-upload').click()}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    document.getElementById('file-upload').click();
                                                }
                                            }}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <p className="upgrade-file-drop-text">
                                                클릭하여 파일 업로드
                                                <span>(PDF, DOCX 등 지원)</span>
                                            </p>
                                            <input
                                                id="file-upload"
                                                type="file"
                                                multiple
                                                accept=".pdf,.doc,.docx,.txt"
                                                onChange={handleFileChange}
                                                className="upgrade-file-input-hidden"
                                            />
                                            {formData.files.length > 0 && (
                                                <div className="upgrade-file-list">
                                                    {formData.files.map((f, i) => (
                                                        <div key={i} className="upgrade-file-item">
                                                            {f.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="upgrade-form-group upgrade-form-group--consent">
                                    <label className="upgrade-consent-box">
                                        <input
                                            type="checkbox"
                                            className="upgrade-consent-check"
                                            checked={consentChecked}
                                            onChange={(e) => setConsentChecked(e.target.checked)}
                                        />
                                        <span className="upgrade-consent-text">
                                            원활한 상담을 위해 <strong>전문가의 유선 연락</strong>을
                                            수신하는 것에 동의합니다.
                                        </span>
                                    </label>
                                </div>

                                <div className="upgrade-form-actions">
                                    <button
                                        type="button"
                                        className="upgrade-form-btn-back"
                                        onClick={goBackToPlans}
                                    >
                                        <ChevronLeft size={18} strokeWidth={2} aria-hidden />
                                        <span>뒤로</span>
                                    </button>
                                    <button
                                        type="submit"
                                        className="plan-btn kl-btn primary-full lg upgrade-form-btn-submit"
                                        disabled={loading || !consentChecked}
                                    >
                                        {loading ? '처리 중...' : '신청'}
                                    </button>
                                </div>
                                </form>
                            </div>
                        </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;

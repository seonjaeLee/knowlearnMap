import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/api';
import { Globe, Check, ArrowRight, Layers } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import './admin/admin-common.css';
import './DomainSelection.css';

const isLocalAuthEnabled = import.meta.env.VITE_ENABLE_LOCAL_AUTH === 'true';
const LOCAL_DOMAINS = [
    { id: 1, name: 'park', description: 'park 도메인', workspaceCount: 1 },
    { id: 2, name: 'design', description: 'design 도메인', workspaceCount: 1 },
    { id: 3, name: 'admin', description: '관리자 도메인', workspaceCount: 1 },
    { id: 4, name: 'aaura', description: 'aaura 도메인', workspaceCount: 1 },
];

/**
 * 도메인 선택 (어드민센터).
 * 이 화면은 "도메인 선택"만 한다 — 추가/수정/삭제 없음(도메인 관리 화면에서 처리).
 * 워크스페이스 목록처럼 카드형으로 표시하고, 카드 클릭 시 해당 도메인을 선택하고 워크스페이스로 이동한다.
 */
function DomainSelection() {
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchDomains = useCallback(async () => {
        setLoading(true);
        if (isLocalAuthEnabled) {
            setDomains(LOCAL_DOMAINS);
            setError(null);
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/api/domains`);
            setDomains(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch domains', err);
            setError('도메인 목록을 불러오는데 실패했습니다.');
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 모듈 빌드 플래그를 의존 배열에 명시(요청)
    }, [isLocalAuthEnabled]);

    useEffect(() => {
        if (user && !isAdmin) {
            // Normal users have 1:1 domain mapping, auto-select (skip selection)
            navigate('/workspaces');
            return;
        }

        if (isAdmin) {
            fetchDomains();
        }
    }, [user, isAdmin, navigate, fetchDomains]);

    const currentDomainId = localStorage.getItem('admin_selected_domain_id');

    const handleSelectDomain = useCallback((domainId) => {
        const selectedDomain = domains.find((d) => d.id === domainId);
        if (selectedDomain) {
            localStorage.setItem('admin_selected_domain_id', domainId);
            localStorage.setItem('admin_selected_domain_name', selectedDomain.name);
            navigate('/workspaces');
        }
    }, [domains, navigate]);

    if (!user) return null;

    if (!isAdmin) {
        return <div className="domain-redirecting">Redirecting...</div>;
    }

    return (
        <div className="kl-page domain-selection-page">
            <div className="kl-main-sticky-head">
                <PageHeader
                    title="도메인 선택"
                    breadcrumbs={['어드민센터']}
                />
            </div>

            <div className="domain-select-area">
                <div className="domain-select-toolbar">
                    <span className="kl-table-toolbar-summary">
                        총 <strong>{domains.length}</strong>건
                    </span>

                </div>

                {error ? (
                    <p className="domain-selection-error" role="alert">{error}</p>
                ) : null}

                {loading ? (
                    <div className="admin-loading-state">
                        <div className="admin-spinner" />
                        <span>도메인 목록을 불러오는 중...</span>
                    </div>
                ) : domains.length === 0 ? (
                    <div className="domain-empty">등록된 도메인이 없습니다.</div>
                ) : (
                    <div className="domain-card-grid">
                        {domains.map((domain) => {
                            const isCurrent = String(domain.id) === currentDomainId;
                            return (
                                <button
                                    type="button"
                                    key={domain.id}
                                    className={`domain-card${isCurrent ? ' domain-card--current' : ''}`}
                                    onClick={() => handleSelectDomain(domain.id)}
                                    aria-pressed={isCurrent}
                                >
                                    <div className="domain-card-head">
                                        <span className="domain-card-icon" aria-hidden>
                                            <Globe size={22} />
                                        </span>
                                        {isCurrent ? (
                                            <span className="domain-card-current-badge">
                                                <Check size={13} strokeWidth={2.6} aria-hidden /> 현재
                                            </span>
                                        ) : (
                                            <span className="domain-card-go" aria-hidden>
                                                <ArrowRight size={18} />
                                            </span>
                                        )}
                                    </div>
                                    <div className="domain-card-body">
                                        <div className="domain-card-name" title={domain.name}>
                                            {domain.name}
                                        </div>
                                        <div className="domain-card-desc" title={domain.description || ''}>
                                        {domain.description ? domain.description : ' '}
                                        </div>
                                    </div>
                                    {typeof domain.workspaceCount === 'number' ? (
                                        <div className="domain-card-meta">
                                            <Layers size={14} aria-hidden />
                                            <span>워크스페이스 {domain.workspaceCount}개</span>
                                        </div>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DomainSelection;

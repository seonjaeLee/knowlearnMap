import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import axios from 'axios';
import { API_URL } from '../config/api';
import { Loader2, Trash2 } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import BaseModal from '../components/common/modal/BaseModal';
import './DomainSelection.css';

const isLocalAuthEnabled = import.meta.env.VITE_ENABLE_LOCAL_AUTH === 'true';
const LOCAL_DOMAINS = [
    { id: 1, name: 'park', description: 'park 도메인', workspaceCount: 1 },
    { id: 2, name: 'design', description: 'design 도메인', workspaceCount: 1 },
    { id: 3, name: 'admin', description: '관리자 도메인', workspaceCount: 1 },
    { id: 4, name: 'aaura', description: 'aaura 도메인', workspaceCount: 1 },
];

function DomainSelection() {
    const navigate = useNavigate();
    const { user, isAdmin, logout } = useAuth();
    const { showAlert, showConfirm } = useAlert();
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({ name: '', description: '', arangoDbName: '' });
    const [addError, setAddError] = useState('');
    const [adding, setAdding] = useState(false);
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        if (user && !isAdmin) {
            // Normal users have 1:1 domain mapping, auto-select (skip selection)
            navigate('/workspaces');
            return;
        }

        if (isAdmin) {
            fetchDomains();
        }
    }, [user, isAdmin, navigate]);

    const fetchDomains = async () => {
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
    };

    if (!user) return null;

    if (!isAdmin) {
        return <div className="domain-redirecting">Redirecting...</div>;
    }

    const handleAddDomain = async () => {
        if (!addForm.name.trim()) { setAddError('도메인명을 입력해주세요.'); return; }
        if (!addForm.arangoDbName.trim()) { setAddError('ArangoDB명을 입력해주세요.'); return; }
        if (!/^[a-z][a-z0-9_-]*$/.test(addForm.arangoDbName)) { setAddError('ArangoDB명은 영문 소문자로 시작해야 하며, 소문자/숫자/하이픈/언더스코어만 가능합니다.'); return; }

        if (isLocalAuthEnabled) {
            const nextId = (Math.max(0, ...domains.map(d => Number(d.id) || 0)) + 1);
            const newDomain = {
                id: nextId,
                name: addForm.name,
                description: addForm.description,
                workspaceCount: 0,
            };
            setDomains(prev => [...prev, newDomain]);
            setShowAddModal(false);
            setAddForm({ name: '', description: '', arangoDbName: '' });
            return;
        }

        setAdding(true);
        setAddError('');
        try {
            await axios.post(`${API_URL}/api/domains`, addForm);
            setShowAddModal(false);
            setAddForm({ name: '', description: '', arangoDbName: '' });
            fetchDomains();
        } catch (err) {
            const msg = err.response?.data || '도메인 생성에 실패했습니다.';
            setAddError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteDomain = async (e, domain) => {
        e.stopPropagation();
        const wsCount = domain.workspaceCount || 0;
        const msg = wsCount > 0
            ? `'${domain.name}' 도메인을 삭제하시겠습니까?\n\n포함된 워크스페이스 ${wsCount}개와 모든 데이터가 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.`
            : `'${domain.name}' 도메인을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`;
        const ok = await showConfirm(msg, { title: '도메인 삭제' });
        if (!ok) return;

        if (isLocalAuthEnabled) {
            setDomains(prev => prev.filter(d => d.id !== domain.id));
            if (String(domain.id) === localStorage.getItem('admin_selected_domain_id')) {
                localStorage.removeItem('admin_selected_domain_id');
                localStorage.removeItem('admin_selected_domain_name');
            }
            return;
        }

        setDeleting(domain.id);
        try {
            await axios.delete(`${API_URL}/api/domains/${domain.id}`);
            fetchDomains();
        } catch (err) {
            const errMsg = err.response?.data || '도메인 삭제에 실패했습니다.';
            showAlert(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg), { title: '도메인 삭제 실패' });
        } finally {
            setDeleting(null);
        }
    };

    const closeAddModal = () => {
        setShowAddModal(false);
        setAddError('');
    };

    const currentDomainId = localStorage.getItem('admin_selected_domain_id');

    const handleSelectDomain = (domainId) => {
        const selectedDomain = domains.find(d => d.id === domainId);
        if (selectedDomain) {
            localStorage.setItem('admin_selected_domain_id', domainId);
            localStorage.setItem('admin_selected_domain_name', selectedDomain.name);
            navigate('/workspaces');
        }
    };

    return (
        <div className="domain-selection-container">
            <div className="domain-selection-content">
                <div className="km-main-sticky-head">
                <PageHeader
                    title="도메인 선택"
                    breadcrumbs={['어드민센터']}
                    actions={(
                        <button
                            onClick={() => { setShowAddModal(true); setAddError(''); }}
                            className="domain-add-btn"
                        >
                            + 도메인 추가
                        </button>
                    )}
                />

                <div className="user-info-bar">
                    <span>관리자 로그인 ({user.email})</span>
                    <span className="domain-content-help">작업할 도메인을 선택해주세요.</span>
                </div>
                </div>

                {loading && <p>Loading domains...</p>}
                {error && <p className="error-message">{error}</p>}

                <div className="domain-list-container km-data-table-dense">
                    <table className="domain-list-table">
                        <thead>
                            <tr>
                                <th className="domain-list-th-select" width="56">선택</th>
                                <th width="200">이름</th>
                                <th>설명</th>
                                <th className="domain-list-th-action">
                                    <span className="domain-list-actions-head">관리</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && domains.length === 0 ? (
                                <tr>
                                    <td className="domain-list-empty" colSpan={4}>
                                        등록된 도메인이 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                domains.map(domain => (
                                    <tr
                                        key={domain.id}
                                        onClick={() => handleSelectDomain(domain.id)}
                                        className={`domain-list-row ${String(domain.id) === currentDomainId ? 'domain-selected' : ''}`}
                                    >
                                        <td className="domain-radio-cell">
                                            <input
                                                type="radio"
                                                name="domain-select"
                                                checked={String(domain.id) === currentDomainId}
                                                onChange={() => handleSelectDomain(domain.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="domain-radio-input"
                                            />
                                        </td>
                                        <td className="domain-list-name">
                                            <span className="domain-list-name-inner">
                                                {domain.name}
                                                {String(domain.id) === currentDomainId && (
                                                    <span className="domain-current-badge">현재</span>
                                                )}
                                            </span>
                                        </td>
                                        <td className="domain-list-desc">{domain.description || '-'}</td>
                                        <td className="domain-list-action">
                                            <div className="domain-list-actions">
                                                <button
                                                    type="button"
                                                    className="km-table-icon-btn km-table-icon-btn--danger"
                                                    title="삭제"
                                                    aria-label={deleting === domain.id ? '삭제 중' : '삭제'}
                                                    onClick={(e) => handleDeleteDomain(e, domain)}
                                                    disabled={deleting === domain.id}
                                                >
                                                    {deleting === domain.id ? (
                                                        <Loader2 className="km-table-icon-btn__spin" aria-hidden />
                                                    ) : (
                                                        <Trash2 strokeWidth={1.75} aria-hidden />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <BaseModal
                open={showAddModal}
                title="새 도메인 추가"
                onClose={closeAddModal}
                maxWidth="xs"
                contentClassName="domain-add-modal-content km-modal-form"
                actions={(
                    <>
                        <Button variant="outlined" onClick={closeAddModal} disabled={adding}>
                            취소
                        </Button>
                        <Button variant="contained" onClick={handleAddDomain} disabled={adding}>
                            {adding ? '생성 중...' : '생성하기'}
                        </Button>
                    </>
                )}
            >
                <div className="domain-add-form">
                    <div className="domain-add-form-group">
                        <label htmlFor="domain-add-name">
                            도메인명 <span className="required-asterisk" aria-hidden="true">*</span>
                        </label>
                        <input
                            id="domain-add-name"
                            type="text"
                            value={addForm.name}
                            onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                            placeholder="도메인 이름"
                            autoFocus
                            autoComplete="off"
                        />
                    </div>

                    <div className="domain-add-form-group">
                        <label htmlFor="domain-add-desc">설명</label>
                        <input
                            id="domain-add-desc"
                            type="text"
                            value={addForm.description}
                            onChange={(e) => setAddForm((p) => ({ ...p, description: e.target.value }))}
                            placeholder="도메인 설명 (선택)"
                            autoComplete="off"
                        />
                    </div>

                    <div className="domain-add-form-group">
                        <label htmlFor="domain-add-arango">
                            ArangoDB 데이터베이스명 <span className="required-asterisk" aria-hidden="true">*</span>
                        </label>
                        <input
                            id="domain-add-arango"
                            type="text"
                            value={addForm.arangoDbName}
                            onChange={(e) => {
                                const v = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
                                setAddForm((p) => ({ ...p, arangoDbName: v }));
                            }}
                            placeholder="예: my_domain-01"
                            autoComplete="off"
                        />
                        <p className="domain-add-help">
                            사용 가능: 영문 소문자, 숫자, 하이픈(-), 언더스코어(_) · 생성 후 변경 불가
                        </p>
                    </div>

                    {addError && <div className="domain-add-error">{addError}</div>}
                </div>
            </BaseModal>
        </div>
    );
}

export default DomainSelection;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import axios from 'axios';
import { API_URL } from '../config/api';
import PageHeader from '../components/common/PageHeader';
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
        return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Redirecting...</div>;
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

                {loading && <p>Loading domains...</p>}
                {error && <p className="error-message">{error}</p>}

                <div className="domain-list-container">
                    <table className="domain-list-table">
                        <thead>
                            <tr>
                                <th width="64">선택</th>
                                <th width="200">이름</th>
                                <th>설명</th>
                                <th width="92">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {domains.map(domain => (
                                <tr
                                    key={domain.id}
                                    onClick={() => handleSelectDomain(domain.id)}
                                    className={`domain-list-row ${String(domain.id) === currentDomainId ? 'domain-selected' : ''}`}
                                >
                                    <td style={{ textAlign: 'center' }}>
                                        <input
                                            type="radio"
                                            name="domain-select"
                                            checked={String(domain.id) === currentDomainId}
                                            onChange={() => handleSelectDomain(domain.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563eb' }}
                                        />
                                    </td>
                                    <td className="domain-list-name">
                                        {domain.name}
                                        {String(domain.id) === currentDomainId && <span className="domain-current-badge">현재</span>}
                                    </td>
                                    <td className="domain-list-desc">{domain.description || '-'}</td>
                                    <td className="domain-list-action">
                                        <button
                                            className="delete-btn-small"
                                            onClick={(e) => handleDeleteDomain(e, domain)}
                                            disabled={deleting === domain.id}
                                        >
                                            {deleting === domain.id ? '삭제중...' : '삭제'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 도메인 추가 모달 */}
            {showAddModal && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}
                    onClick={() => setShowAddModal(false)}
                >
                    <div
                        style={{
                            background: 'white', borderRadius: '12px', padding: '28px', width: '420px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 style={{ margin: '0 0 20px', fontSize: '18px' }}>새 도메인 추가</h3>

                        <div style={{ marginBottom: '14px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '4px' }}>도메인명 *</label>
                            <input
                                type="text"
                                value={addForm.name}
                                onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))}
                                placeholder="도메인 이름"
                                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                                autoFocus
                            />
                        </div>
                        <div style={{ marginBottom: '14px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '4px' }}>설명</label>
                            <input
                                type="text"
                                value={addForm.description}
                                onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))}
                                placeholder="도메인 설명 (선택)"
                                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div style={{ marginBottom: '14px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '4px' }}>ArangoDB 데이터베이스명 *</label>
                            <input
                                type="text"
                                value={addForm.arangoDbName}
                                onChange={e => {
                                    const v = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
                                    setAddForm(p => ({ ...p, arangoDbName: v }));
                                }}
                                placeholder="예: my_domain-01"
                                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                            />
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                사용 가능: 영문 소문자, 숫자, 하이픈(-), 언더스코어(_) · 생성 후 변경 불가
                            </div>
                        </div>

                        {addError && (
                            <div style={{ padding: '8px 10px', background: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '13px', marginBottom: '14px' }}>
                                {addError}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowAddModal(false)}
                                style={{ padding: '8px 20px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', background: 'white', fontSize: '14px' }}
                            >
                                취소
                            </button>
                            <button
                                onClick={handleAddDomain}
                                disabled={adding}
                                style={{ padding: '8px 20px', border: 'none', borderRadius: '6px', cursor: adding ? 'not-allowed' : 'pointer', background: '#2563eb', color: 'white', fontSize: '14px', fontWeight: '500', opacity: adding ? 0.6 : 1 }}
                            >
                                {adding ? '생성 중...' : '생성하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DomainSelection;
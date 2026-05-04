import React, { useEffect, useState } from 'react';
import { upgradeApi } from '../../services/api'; // Use centralized api service
import { useAlert } from '../../context/AlertContext';
import PageHeader from '../../components/common/PageHeader';
import './admin-common.css';

const AdminUpgradeRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showAlert, showConfirm } = useAlert();

    // Reject Modal State
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const data = await upgradeApi.getAllRequests();
            setRequests(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        const confirmed = await showConfirm('승인하시겠습니까? 해당 회원의 등급이 변경되며 승인 메일이 발송됩니다.');
        if (!confirmed) return;

        try {
            await upgradeApi.approveRequest(id);
            showAlert('승인되었습니다.');
            fetchRequests(); // Refresh list
        } catch (err) {
            showAlert(err.message);
        }
    };

    const openRejectModal = (id) => {
        setSelectedRequestId(id);
        setRejectReason('');
        setRejectModalOpen(true);
    };

    const handleRejectSubmit = async () => {
        if (!rejectReason.trim()) {
            showAlert('거절 사유를 입력해주세요.');
            return;
        }

        try {
            await upgradeApi.rejectRequest(selectedRequestId, rejectReason);
            showAlert('거절 처리되었습니다. 메일이 발송되었습니다.');
            setRejectModalOpen(false);
            fetchRequests();
        } catch (err) {
            showAlert(err.message);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="admin-page">
            <PageHeader
                title="승인 관리"
                breadcrumbs={['어드민센터']}
            />

            <div className="table-responsive" style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                        <tr>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#495057' }}>신청일</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#495057' }}>이메일</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#495057' }}>회사/소속</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#495057' }}>담당자</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#495057' }}>전화번호</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#495057' }}>유형</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#495057' }}>상태</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#495057' }}>액션</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#868e96' }}>
                                    대기 중인 요청이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            requests.map(req => (
                                <tr key={req.id} style={{ borderBottom: '1px solid #f1f3f5' }}>
                                    <td style={{ padding: '12px' }}>{new Date(req.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '12px' }}>{req.email}</td>
                                    <td style={{ padding: '12px' }}>{req.company}</td>
                                    <td style={{ padding: '12px' }}>{req.name}</td>
                                    <td style={{ padding: '12px' }}>{req.phone}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: 'var(--admin-font-sm)',
                                            fontWeight: 600,
                                            background: req.type === 'MAX_CONSULTATION' ? '#e9ecef' : '#e7f5ff',
                                            color: req.type === 'MAX_CONSULTATION' ? '#495057' : '#228be6'
                                        }}>
                                            {req.type === 'PRO_UPGRADE' ? 'Pro 신청' : 'Max 상담'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            fontWeight: 600,
                                            color: req.status === 'APPROVED' ? '#2b8a3e' : req.status === 'REJECTED' ? '#e03131' : '#f08c00'
                                        }}>
                                            {req.status}
                                        </span>
                                        {req.status === 'REJECTED' && req.rejectReason && (
                                            <div style={{ fontSize: 'var(--admin-font-sm)', color: '#868e96', marginTop: '4px' }}>
                                                사유: {req.rejectReason}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        {req.status === 'PENDING' && (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleApprove(req.id)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: '#20c997',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: 'var(--admin-font-md)'
                                                    }}
                                                >
                                                    승인
                                                </button>
                                                <button
                                                    onClick={() => openRejectModal(req.id)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: '#fa5252',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: 'var(--admin-font-md)'
                                                    }}
                                                >
                                                    거절
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Reject Modal */}
            {rejectModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setRejectModalOpen(false)}>
                    <div style={{
                        background: 'white', padding: '24px', borderRadius: '8px', width: '400px', maxWidth: '90%'
                    }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>거절 사유 입력</h3>
                        <p style={{ fontSize: 'var(--admin-font-md)', color: '#666', marginBottom: '12px' }}>
                            거절 사유를 입력하시면 해당 내용이 메일로 발송됩니다.
                        </p>
                        <textarea
                            style={{ width: '100%', height: '100px', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', marginBottom: '16px', resize: 'vertical' }}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="거절 사유를 자세히 적어주세요."
                            autoFocus
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                                onClick={() => setRejectModalOpen(false)}
                                style={{
                                    padding: '8px 16px',
                                    background: '#f1f3f5',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    color: '#495057'
                                }}
                            >
                                취소
                            </button>
                            <button
                                onClick={handleRejectSubmit}
                                style={{
                                    padding: '8px 16px',
                                    background: '#fa5252',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    color: 'white'
                                }}
                            >
                                거절 처리
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUpgradeRequests;

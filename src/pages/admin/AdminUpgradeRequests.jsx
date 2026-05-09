import React, { useEffect, useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { upgradeApi } from '../../services/api'; // Use centralized api service
import { useDialog } from '../../hooks/useDialog';
import BaseModal from '../../components/common/modal/BaseModal';
import PageHeader from '../../components/common/PageHeader';
import './admin-common.css';
import './AdminUpgradeRequests.css';

const AdminUpgradeRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { alert, confirm } = useDialog();

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
        const confirmed = await confirm('승인하시겠습니까? 해당 회원의 등급이 변경되며 승인 메일이 발송됩니다.');
        if (!confirmed) return;

        try {
            await upgradeApi.approveRequest(id);
            await alert('승인되었습니다.');
            fetchRequests(); // Refresh list
        } catch (err) {
            await alert(err.message);
        }
    };

    const openRejectModal = (id) => {
        setSelectedRequestId(id);
        setRejectReason('');
        setRejectModalOpen(true);
    };

    const handleRejectSubmit = async () => {
        if (!rejectReason.trim()) {
            await alert('거절 사유를 입력해주세요.');
            return;
        }

        try {
            await upgradeApi.rejectRequest(selectedRequestId, rejectReason);
            await alert('거절 처리되었습니다. 메일이 발송되었습니다.');
            setRejectModalOpen(false);
            fetchRequests();
        } catch (err) {
            await alert(err.message);
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

            <div className="table-responsive admin-upgrade-table-wrap">
                <table className="admin-upgrade-table">
                    <thead className="admin-upgrade-thead">
                        <tr>
                            <th className="admin-upgrade-th">신청일</th>
                            <th className="admin-upgrade-th">이메일</th>
                            <th className="admin-upgrade-th">회사/소속</th>
                            <th className="admin-upgrade-th">담당자</th>
                            <th className="admin-upgrade-th">전화번호</th>
                            <th className="admin-upgrade-th">유형</th>
                            <th className="admin-upgrade-th">상태</th>
                            <th className="admin-upgrade-th">액션</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="admin-upgrade-empty">
                                    대기 중인 요청이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            requests.map(req => (
                                <tr key={req.id} className="admin-upgrade-row">
                                    <td className="admin-upgrade-td">{new Date(req.createdAt).toLocaleDateString()}</td>
                                    <td className="admin-upgrade-td">{req.email}</td>
                                    <td className="admin-upgrade-td">{req.company}</td>
                                    <td className="admin-upgrade-td">{req.name}</td>
                                    <td className="admin-upgrade-td">{req.phone}</td>
                                    <td className="admin-upgrade-td">
                                        <span className={`admin-upgrade-type-badge ${req.type === 'MAX_CONSULTATION' ? 'is-max' : 'is-pro'}`}>
                                            {req.type === 'PRO_UPGRADE' ? 'Pro 신청' : 'Max 상담'}
                                        </span>
                                    </td>
                                    <td className="admin-upgrade-td">
                                        <span className={`admin-upgrade-status status-${req.status?.toLowerCase()}`}>
                                            {req.status}
                                        </span>
                                        {req.status === 'REJECTED' && req.rejectReason && (
                                            <div className="admin-upgrade-reject-reason">
                                                사유: {req.rejectReason}
                                            </div>
                                        )}
                                    </td>
                                    <td className="admin-upgrade-td">
                                        {req.status === 'PENDING' && (
                                            <div className="admin-upgrade-actions">
                                                <Button size="small" variant="contained" color="success" onClick={() => handleApprove(req.id)}>
                                                    승인
                                                </Button>
                                                <Button size="small" variant="contained" color="error" onClick={() => openRejectModal(req.id)}>
                                                    거절
                                                </Button>
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
                <BaseModal
                    open={rejectModalOpen}
                    onClose={() => setRejectModalOpen(false)}
                    title="거절 사유 입력"
                    maxWidth="sm"
                    fullWidth
                    contentClassName="admin-upgrade-reject-content km-modal-form"
                    actions={(
                        <>
                            <Button variant="outlined" onClick={() => setRejectModalOpen(false)}>
                                취소
                            </Button>
                            <Button variant="contained" color="error" onClick={handleRejectSubmit}>
                                거절 처리
                            </Button>
                        </>
                    )}
                >
                        <Typography className="admin-upgrade-reject-desc">
                            거절 사유를 입력하시면 해당 내용이 메일로 발송됩니다.
                        </Typography>
                        <TextField
                            multiline
                            minRows={5}
                            fullWidth
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="거절 사유를 자세히 적어주세요."
                            autoFocus
                            size="small"
                        />
                </BaseModal>
            )}
        </div>
    );
};

export default AdminUpgradeRequests;

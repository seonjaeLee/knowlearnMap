import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orgApi } from '../services/orgApi';
import { useAuth } from '../context/AuthContext';
import './admin/admin-common.css';

/**
 * 조직 멤버 관리 페이지 (V20260429).
 * 권한: SYSOP 또는 ADMIN
 * 기능: 멤버 목록, 초대 (USER/VIEWER), 역할 변경, 강퇴, 미수락 초대 재발송
 */
export default function OrgMembers() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [me, setMe] = useState(null);
    const [members, setMembers] = useState([]);
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);

    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('USER');
    const [submitting, setSubmitting] = useState(false);
    const [lastInviteLink, setLastInviteLink] = useState(null);

    useEffect(() => {
        if (!user) return;
        if (user.role !== 'SYSOP' && user.role !== 'ADMIN') {
            navigate('/');
            return;
        }
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const load = async () => {
        setLoading(true);
        try {
            const [meData, memberData, pendingData] = await Promise.all([
                orgApi.me(),
                orgApi.listMembers(),
                orgApi.listPendingInvites(),
            ]);
            setMe(meData);
            setMembers(memberData || []);
            setPending(pendingData || []);
        } catch (e) {
            alert('조회 실패: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;
        setSubmitting(true);
        try {
            const res = await orgApi.inviteMember(inviteEmail.trim().toLowerCase(), inviteRole);
            const fullLink = window.location.origin + res.inviteLink;
            setLastInviteLink(fullLink);
            setInviteEmail('');
            await load();
        } catch (e) {
            alert('초대 실패: ' + e.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRoleChange = async (memberId, currentRole) => {
        const next = currentRole === 'USER' ? 'VIEWER' : 'USER';
        if (!confirm(`이 멤버의 역할을 ${currentRole} → ${next} 로 변경합니다. 계속?`)) return;
        try {
            await orgApi.changeRole(memberId, next);
            await load();
        } catch (e) {
            alert('역할 변경 실패: ' + e.message);
        }
    };

    const handleRemove = async (member) => {
        if (!confirm(`"${member.email}" 을(를) 조직에서 강퇴 (삭제) 합니다.\n복구 불가능합니다. 계속?`)) return;
        try {
            await orgApi.removeMember(member.id);
            await load();
        } catch (e) {
            alert('강퇴 실패: ' + e.message);
        }
    };

    const handleResend = async (memberId) => {
        try {
            const res = await orgApi.resendInvite(memberId);
            const fullLink = window.location.origin + res.inviteLink;
            setLastInviteLink(fullLink);
            await load();
            alert('새 초대 토큰이 발급되었습니다. 위에 표시된 링크를 복사해 사용하세요.');
        } catch (e) {
            alert('재발송 실패: ' + e.message);
        }
    };

    if (loading) {
        return <div style={{ padding: 40 }}>로딩 중...</div>;
    }

    return (
        <div className="admin-page" style={{ padding: 24 }}>
            <header className="admin-page-header">
                <div className="admin-page-header-left">
                    <div className="admin-page-header-text">
                        <h1 className="admin-page-header-title">
                            조직 멤버 관리
                            <span className="admin-page-header-count">({members.length})</span>
                        </h1>
                        <p className="admin-page-header-subtitle">
                            {me?.organizationName ? `조직: ${me.organizationName}` : '조직 정보 없음'}
                            {me?.isOwner && ' · 당신은 owner (sysop) 입니다'}
                        </p>
                    </div>
                </div>
                <div className="admin-page-header-actions">
                    <button className="admin-btn admin-btn-primary" onClick={() => setInviteOpen(true)}>
                        + 멤버 초대
                    </button>
                </div>
            </header>

            {lastInviteLink && (
                <div style={{
                    margin: '16px 0', padding: 12, background: '#dcfce7',
                    border: '1px solid #86efac', borderRadius: 8, fontSize: 13,
                }}>
                    <strong>최근 발급된 초대 링크 — 복사해서 초대 대상에게 전달하세요:</strong>
                    <div style={{
                        marginTop: 6, padding: 8, background: '#fff', border: '1px solid #cbd5e1',
                        borderRadius: 4, fontFamily: 'monospace', wordBreak: 'break-all',
                    }}>{lastInviteLink}</div>
                    <button
                        className="admin-btn admin-btn-sm"
                        style={{ marginTop: 6 }}
                        onClick={() => navigator.clipboard.writeText(lastInviteLink)}
                    >📋 클립보드 복사</button>
                </div>
            )}

            {/* 활성 멤버 */}
            <h3 style={{ marginTop: 24, fontSize: 15 }}>활성 멤버</h3>
            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead><tr>
                        <th style={{ width: 60 }}>ID</th>
                        <th>이메일</th>
                        <th>역할</th>
                        <th>상태</th>
                        <th>가입</th>
                        <th>마지막 로그인</th>
                        <th className="admin-col-actions">관리</th>
                    </tr></thead>
                    <tbody>
                        {members.length === 0 ? (
                            <tr><td colSpan={7}>
                                <div className="admin-empty-state" style={{ border: 'none', padding: 24 }}>
                                    <p className="admin-empty-state-title">조직 멤버가 없습니다. 위 "+ 멤버 초대" 버튼으로 추가하세요.</p>
                                </div>
                            </td></tr>
                        ) : members.map((m) => (
                            <tr key={m.id}>
                                <td className="admin-col-id">{m.id}</td>
                                <td style={{ fontWeight: 500 }}>{m.email}</td>
                                <td>
                                    <span className={`admin-badge ${m.role === 'SYSOP' ? 'admin-badge-warn' : m.role === 'VIEWER' ? 'admin-badge-neutral' : 'admin-badge-info'}`}>
                                        {m.role}
                                    </span>
                                </td>
                                <td>
                                    <span className={`admin-badge ${m.status === 'ACTIVE' ? 'admin-badge-success' : 'admin-badge-neutral'}`}>
                                        {m.status}
                                    </span>
                                </td>
                                <td className="admin-col-date">{m.createdAt ? new Date(m.createdAt).toLocaleDateString('ko-KR') : '-'}</td>
                                <td className="admin-col-date">{m.lastLoginAt ? new Date(m.lastLoginAt).toLocaleDateString('ko-KR') : '미접속'}</td>
                                <td className="admin-col-actions">
                                    {m.role === 'SYSOP' ? (
                                        <span style={{ color: '#94a3b8', fontSize: 11 }}>(owner)</span>
                                    ) : (
                                        <>
                                            <button className="admin-btn admin-btn-sm"
                                                onClick={() => handleRoleChange(m.id, m.role)}
                                                title={`${m.role} → ${m.role === 'USER' ? 'VIEWER' : 'USER'}`}>
                                                {m.role === 'USER' ? '↓ VIEWER' : '↑ USER'}
                                            </button>
                                            {m.status !== 'ACTIVE' && (
                                                <button className="admin-btn admin-btn-sm" style={{ marginLeft: 4 }}
                                                    onClick={() => handleResend(m.id)} title="초대 재발송">
                                                    재발송
                                                </button>
                                            )}
                                            <button className="admin-btn admin-btn-sm admin-btn-danger-soft"
                                                style={{ marginLeft: 4 }}
                                                onClick={() => handleRemove(m)} title="강퇴 (삭제)">
                                                강퇴
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 미수락 초대 */}
            {pending.length > 0 && (
                <>
                    <h3 style={{ marginTop: 32, fontSize: 15 }}>미수락 초대 ({pending.length})</h3>
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead><tr>
                                <th>이메일</th>
                                <th>초대 역할</th>
                                <th>만료</th>
                                <th>상태</th>
                            </tr></thead>
                            <tbody>
                                {pending.map((p) => (
                                    <tr key={p.tokenId}>
                                        <td style={{ fontWeight: 500 }}>{p.email}</td>
                                        <td><span className="admin-badge admin-badge-info">{p.invitedRole}</span></td>
                                        <td className="admin-col-date">
                                            {p.expiresAt ? new Date(p.expiresAt).toLocaleString('ko-KR') : '-'}
                                        </td>
                                        <td>
                                            <span className={`admin-badge ${p.expired ? 'admin-badge-danger' : 'admin-badge-warn'}`}>
                                                {p.expired ? '만료' : '대기'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* 초대 모달 */}
            {inviteOpen && (
                <div className="admin-modal-overlay" onClick={() => setInviteOpen(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">조직 멤버 초대</h3>
                            <button className="admin-modal-close" onClick={() => setInviteOpen(false)}>✕</button>
                        </div>
                        <form onSubmit={handleInvite}>
                            <div className="admin-modal-body">
                                <div className="admin-field">
                                    <label className="admin-field-label">이메일 *</label>
                                    <input className="admin-input" type="email" required
                                        value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="newmember@example.com" autoFocus disabled={submitting} />
                                </div>
                                <div className="admin-field">
                                    <label className="admin-field-label">역할 *</label>
                                    <select className="admin-input" value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value)} disabled={submitting}>
                                        <option value="USER">USER (CRUD 권한)</option>
                                        <option value="VIEWER">VIEWER (조회만)</option>
                                    </select>
                                </div>
                                <p style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
                                    초대 토큰이 발급되며 7일간 유효합니다. 발급 후 표시되는 링크를 본인에게 전달하세요.
                                </p>
                            </div>
                            <div className="admin-modal-footer">
                                <button type="button" className="admin-btn" onClick={() => setInviteOpen(false)}>취소</button>
                                <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>
                                    {submitting ? '초대 중...' : '초대'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

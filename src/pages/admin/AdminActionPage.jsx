import React, { useState, useEffect } from 'react';
import { actionApi } from '../../services/api';
import { useAlert } from '../../context/AlertContext';
import { Zap, RotateCcw, Clock } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import './admin-common.css';

function AdminActionPage() {
  const [subTab, setSubTab] = useState('list');
  const [workspaceId, setWorkspaceId] = useState(() => {
    const stored = localStorage.getItem('admin_selected_workspace_id');
    return stored ? Number(stored) : null;
  });

  useEffect(() => {
    if (!workspaceId) {
      const ws = localStorage.getItem('admin_selected_workspace_id')
          || prompt('Action 관리 대상 workspaceId 를 입력하세요 (예: 71)');
      if (ws) {
        setWorkspaceId(Number(ws));
        localStorage.setItem('admin_selected_workspace_id', ws);
      }
    }
  }, [workspaceId]);

  if (!workspaceId) return <div className="kl-page"><p>workspaceId 가 없습니다.</p></div>;

  return (
    <div className="kl-page">
      <div className="kl-main-sticky-head">
        <AdminPageHeader
          icon={Zap}
          title="Action 관리"
          subtitle="온톨로지 기반 실행 Action 을 정의하고, 개념·트리플에 바인딩합니다. Excel 일괄 업다운 지원."
        />
      </div>

      <div className="admin-semantic-subtabs">
        <button className={`admin-semantic-subtab ${subTab === 'list' ? 'active' : ''}`}
          onClick={() => setSubTab('list')}>
          Action 목록 (읽기 전용)
        </button>
        <button className={`admin-semantic-subtab ${subTab === 'logs' ? 'active' : ''}`}
          onClick={() => setSubTab('logs')}>
          <Clock size={13} style={{ marginRight: 4 }} /> 실행 이력
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {subTab === 'list' && <ActionListTab workspaceId={workspaceId} />}
        {subTab === 'logs' && <ActionLogTab />}
      </div>
      <div style={{ padding: '8px 16px', background: '#f0f9ff', borderTop: '1px solid #bae6fd', fontSize: 12, color: '#0369a1' }}>
        Action 추가/수정/바인딩은 <strong>EXP 액션사전</strong>에서 관리합니다. MAP 은 실행 + 이력 조회만.
      </div>
    </div>
  );
}

// ────────────────── Action 목록 탭 (읽기 전용) ──────────────────

function ActionListTab({ workspaceId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  const fetchData = async () => {
    setLoading(true);
    try { setItems(await actionApi.list(workspaceId) || []); }
    catch (e) { showAlert('조회 실패: ' + e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [workspaceId]);

  return (
    <>
      <div className="admin-semantic-actions-bar">
        <span className="admin-semantic-count">총 <strong>{items.length}</strong>개 Action (ws #{workspaceId}) — 읽기 전용</span>
        <button className="admin-btn admin-btn-sm" onClick={fetchData}><RotateCcw size={13} /> 새로고침</button>
      </div>

      {loading ? (
        <div className="admin-loading-state"><div className="admin-spinner" /><span>로딩...</span></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr>
              <th style={{ width: 50 }}>ID</th>
              <th>영문명</th><th>한글명</th>
              <th>타입</th><th>승인</th><th>카테고리</th><th>상태</th>
            </tr></thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={7}><div className="admin-empty-state" style={{ border: 'none', padding: 24 }}><p>등록된 Action 없음</p></div></td></tr>
              ) : items.map(a => (
                <tr key={a.id}>
                  <td className="admin-col-id">{a.id}</td>
                  <td style={{ fontWeight: 500 }}>{a.nameEn}</td>
                  <td>{a.nameKo}</td>
                  <td><span className="admin-badge admin-badge-info">{a.actionType}</span></td>
                  <td><span className="admin-badge admin-badge-neutral">{a.approvalMode}</span></td>
                  <td>{a.category || '-'}</td>
                  <td><span className={`admin-badge ${a.status === 'active' ? 'admin-badge-success' : 'admin-badge-neutral'}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ────────────────── 실행 이력 탭 ──────────────────

function ActionLogTab() {
  const { showAlert } = useAlert();
  const [actionId, setActionId] = useState('');
  const [logs, setLogs] = useState([]);

  const load = async () => {
    if (!actionId) return;
    try {
      const result = await actionApi.logs(actionId, 0, 50);
      setLogs(result?.content || (Array.isArray(result) ? result : []));
    } catch (e) { showAlert('이력 조회 실패: ' + e.message); }
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 600 }}>Action ID:</label>
        <input className="admin-input" style={{ width: 100 }} value={actionId}
          onChange={e => setActionId(e.target.value)} placeholder="예: 1" />
        <button className="admin-btn admin-btn-sm" onClick={load}>조회</button>
      </div>
      {logs.length === 0 ? (
        <p style={{ color: '#94a3b8', fontSize: 13 }}>실행 이력이 없습니다.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>시간</th><th>트리거</th><th>상태</th><th>소요(ms)</th><th>에러</th></tr></thead>
            <tbody>{logs.map(l => (
              <tr key={l.id}>
                <td className="admin-col-date">{l.executedAt ? new Date(l.executedAt).toLocaleString('ko-KR') : '-'}</td>
                <td>{l.triggerSource || '-'}</td>
                <td><span className={`admin-badge ${l.status === 'SUCCESS' ? 'admin-badge-success' : 'admin-badge-danger'}`}>{l.status}</span></td>
                <td>{l.durationMs ?? '-'}</td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.errorMessage || '-'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminActionPage;

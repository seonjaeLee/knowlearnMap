import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Eye,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useAlert } from '../../../context/AlertContext';
import BaseModal from '../../../components/common/modal/BaseModal';
import KlTooltip from '../../../components/common/KlTooltip';
import { useSnapshots, useDeleteSnapshot } from '../../hooks/useSnapshots';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import './HistoryTab.css';

const MODEL_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'AISTUDIO', label: 'AISTUDIO' },
  { value: 'OPENAI', label: 'OPENAI' },
  { value: 'ANTHROPIC', label: 'ANTHROPIC' },
];

const getModelBadgeClass = (model) => {
  switch (model) {
    case 'AISTUDIO':
      return 'prompt-history-model--aistudio';
    case 'OPENAI':
      return 'prompt-history-model--openai';
    case 'ANTHROPIC':
      return 'prompt-history-model--anthropic';
    default:
      return 'prompt-history-model--default';
  }
};

const HistoryTab = ({ promptCode, versions }) => {
  const [versionFilter, setVersionFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [responseViewMode, setResponseViewMode] = useState('text');
  const { showAlert, showConfirm } = useAlert();

  const { data: snapshotsData, isLoading } = useSnapshots(promptCode, {
    versionId: versionFilter || undefined,
    model: modelFilter || undefined,
  });

  const deleteSnapshot = useDeleteSnapshot();
  const snapshots = snapshotsData?.content || [];

  const handleDelete = async (snapshotId) => {
    const confirmed = await showConfirm('이 테스트 스냅샷을 삭제하시겠습니까?');
    if (confirmed) {
      try {
        await deleteSnapshot.mutateAsync(snapshotId);
      } catch (err) {
        console.error('Failed to delete snapshot:', err);
        showAlert('삭제에 실패했습니다.');
      }
    }
  };

  const handleViewDetail = (snapshot) => {
    setSelectedSnapshot(snapshot);
    setDetailDialogOpen(true);
  };

  const formatTime = (datetime) => {
    if (!datetime) return '-';
    try {
      return formatDistanceToNow(new Date(datetime), { addSuffix: true, locale: ko });
    } catch {
      return datetime;
    }
  };

  const getResponseText = (response) => {
    if (!response) return '-';
    try {
      const responseData = typeof response === 'string' ? JSON.parse(response) : response;
      return responseData.text || '응답 없음';
    } catch {
      return '응답 파싱 실패';
    }
  };

  const getTokensUsed = (response) => {
    if (!response) return 0;
    try {
      const responseData = typeof response === 'string' ? JSON.parse(response) : response;
      return responseData.tokens_used || 0;
    } catch {
      return 0;
    }
  };

  const getLatency = (response) => {
    if (!response) return 0;
    try {
      const responseData = typeof response === 'string' ? JSON.parse(response) : response;
      return responseData.latency_ms || 0;
    } catch {
      return 0;
    }
  };

  if (isLoading) {
    return (
      <div className="prompt-history-loading">
        <span className="prompt-history-spinner" aria-hidden />
        <span>테스트 이력을 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="prompt-history">
      <div className="table-area">
        <div className="table-toolbar">
          <div className="toolbar-left">
            <span className="kl-table-toolbar-summary">
              총 <strong>{snapshots.length}</strong>개의 테스트 이력
            </span>
          </div>
          <div className="toolbar-right">
            <select
              className="toolbar-select"
              value={versionFilter}
              onChange={(e) => setVersionFilter(e.target.value)}
              aria-label="버전 필터"
            >
              <option value="">전체 버전</option>
              {versions.map((v) => (
                <option key={v.id} value={v.id}>v{v.version}</option>
              ))}
            </select>
            <select
              className="toolbar-select"
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              aria-label="모델 필터"
            >
              {MODEL_OPTIONS.map((opt) => (
                <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="basic-table-shell prompt-history-table-shell">
        <table className="prompt-history-table">
          <thead>
            <tr>
              <th className="prompt-history-table__col-center">ID</th>
              <th>테스트 이름</th>
              <th className="prompt-history-table__col-center">버전</th>
              <th className="prompt-history-table__col-center">모델</th>
              <th className="prompt-history-table__col-center">토큰</th>
              <th className="prompt-history-table__col-center">응답시간</th>
              <th className="prompt-history-table__col-center">상태</th>
              <th className="prompt-history-table__col-center">실행시간</th>
              <th className="prompt-history-table__col-center">관리</th>
            </tr>
          </thead>
          <tbody>
            {snapshots.length === 0 ? (
              <tr>
                <td colSpan={9} className="prompt-history-table__empty">
                  테스트 이력이 없습니다.
                </td>
              </tr>
            ) : (
              snapshots.map((snapshot) => {
                const llmConfig = typeof snapshot.llmConfig === 'string'
                  ? JSON.parse(snapshot.llmConfig)
                  : snapshot.llmConfig;
                const model = llmConfig?.model || 'UNKNOWN';
                const version = versions.find((v) => v.id === snapshot.versionId);
                const success = snapshot.success !== false;

                return (
                  <tr key={snapshot.id} className="prompt-history-table__row">
                    <td className="prompt-history-table__col-center prompt-history-table__id">
                      {snapshot.id}
                    </td>
                    <td className="prompt-history-table__name">
                      {snapshot.testName || '테스트'}
                    </td>
                    <td className="prompt-history-table__col-center">
                      <span className="prompt-history-version-pill">v{version?.version || '?'}</span>
                    </td>
                    <td className="prompt-history-table__col-center">
                      <span className={`prompt-history-model ${getModelBadgeClass(model)}`}>
                        {model}
                      </span>
                    </td>
                    <td className="prompt-history-table__col-center">
                      {snapshot.tokensUsed || getTokensUsed(snapshot.response) || 0}
                    </td>
                    <td className="prompt-history-table__col-center">
                      {snapshot.latencyMs
                        ? (snapshot.latencyMs / 1000).toFixed(1)
                        : (getLatency(snapshot.response) / 1000).toFixed(1)}s
                    </td>
                    <td className="prompt-history-table__col-center">
                      <span className={`prompt-history-status ${success ? 'is-success' : 'is-error'}`}>
                        {success ? <CheckCircle2 size={14} aria-hidden /> : <XCircle size={14} aria-hidden />}
                        {success ? '성공' : '실패'}
                      </span>
                    </td>
                    <td className="prompt-history-table__col-center prompt-history-table__time">
                      <KlTooltip title={formatTime(snapshot.createdAt)} placement="top">
                        <span>
                          {snapshot.createdAt
                            ? new Date(snapshot.createdAt).toLocaleString('ko-KR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: false,
                            })
                            : '-'}
                        </span>
                      </KlTooltip>
                    </td>
                    <td className="prompt-history-table__col-center">
                      <div className="prompt-history-table__actions">
                        <KlTooltip title="상세보기" placement="top" variant="icon">
                          <button
                            type="button"
                            className="prompt-history-action-btn"
                            aria-label="상세보기"
                            onClick={() => handleViewDetail(snapshot)}
                          >
                            <Eye size={15} aria-hidden />
                          </button>
                        </KlTooltip>
                        <KlTooltip title="삭제" placement="top" variant="icon">
                          <button
                            type="button"
                            className="prompt-history-action-btn prompt-history-action-btn--danger"
                            aria-label="삭제"
                            onClick={() => handleDelete(snapshot.id)}
                          >
                            <Trash2 size={15} aria-hidden />
                          </button>
                        </KlTooltip>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>{/* basic-table-shell */}
      </div>{/* table-area */}

      <BaseModal
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        title="테스트 스냅샷 상세"
        maxWidth="md"
        fullWidth
        actions={(
          <button type="button" className="kl-btn gray-outline md" onClick={() => setDetailDialogOpen(false)}>
            닫기
          </button>
        )}
      >
        {selectedSnapshot && (
          <div className="prompt-history-detail">
            <div className="prompt-history-detail__block">
              <h4 className="prompt-history-detail__label">테스트 이름</h4>
              <p className="prompt-history-detail__value">{selectedSnapshot.testName}</p>
            </div>

            <div className="prompt-history-detail__block">
              <div className="prompt-history-detail__head">
                <h4 className="prompt-history-detail__label">프롬프트 내용</h4>
                <button
                  type="button"
                  className="prompt-history-action-btn"
                  aria-label="프롬프트 내용 복사"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedSnapshot.content);
                    showAlert('프롬프트 내용이 복사되었습니다.');
                  }}
                >
                  <Copy size={15} aria-hidden />
                </button>
              </div>
              <pre className="prompt-history-detail__code">{selectedSnapshot.content}</pre>
            </div>

            <div className="prompt-history-detail__block">
              <div className="prompt-history-detail__head">
                <h4 className="prompt-history-detail__label">응답 결과</h4>
                <div className="prompt-history-detail__toggle">
                  <button
                    type="button"
                    className={`prompt-history-toggle-btn ${responseViewMode === 'text' ? 'is-active' : ''}`}
                    onClick={() => setResponseViewMode('text')}
                  >
                    TEXT
                  </button>
                  <button
                    type="button"
                    className={`prompt-history-toggle-btn ${responseViewMode === 'json' ? 'is-active' : ''}`}
                    onClick={() => setResponseViewMode('json')}
                  >
                    JSON
                  </button>
                  <button
                    type="button"
                    className="prompt-history-action-btn"
                    aria-label="응답 결과 복사"
                    onClick={() => {
                      const textToCopy = responseViewMode === 'json'
                        ? JSON.stringify(selectedSnapshot.response, null, 2)
                        : getResponseText(selectedSnapshot.response);
                      navigator.clipboard.writeText(textToCopy);
                      showAlert('응답 결과가 복사되었습니다.');
                    }}
                  >
                    <Copy size={15} aria-hidden />
                  </button>
                </div>
              </div>
              <pre className="prompt-history-detail__code">
                {responseViewMode === 'json'
                  ? JSON.stringify(selectedSnapshot.response, null, 2)
                  : getResponseText(selectedSnapshot.response)}
              </pre>
            </div>

            {selectedSnapshot.notes && (
              <div className="prompt-history-detail__block">
                <h4 className="prompt-history-detail__label">노트</h4>
                <p className="prompt-history-detail__value">{selectedSnapshot.notes}</p>
              </div>
            )}
          </div>
        )}
      </BaseModal>
    </div>
  );
};

export default HistoryTab;

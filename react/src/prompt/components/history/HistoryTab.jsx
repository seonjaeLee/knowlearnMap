import React, { useCallback, useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  Eye,
  XCircle,
} from 'lucide-react';
import { useAlert } from '../../../context/AlertContext';
import BaseModal from '../../../components/common/modal/BaseModal';
import BasicTable from '../../../components/common/BasicTable';
import KlTooltip from '../../../components/common/KlTooltip';
import KlTableRowActions from '../../../components/common/table/KlTableRowActions';
import { useCopyFeedback } from '../../../hooks/useCopyFeedback';
import { listTableEmptyState } from '../../../config/supportMock';
import { useSnapshots, useDeleteSnapshot } from '../../hooks/useSnapshots';
import { formatKlDateTimeWithSeconds } from '../../../utils/formatKlDate';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import '../test/TestTab.css';
import './HistoryTab.css';

const MODEL_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'AISTUDIO', label: 'AISTUDIO' },
  { value: 'OPENAI', label: 'OPENAI' },
  { value: 'ANTHROPIC', label: 'ANTHROPIC' },
];

const MODEL_DISPLAY_NAMES = {
  AISTUDIO: 'AISTUDIO',
  OPENAI: 'OPENAI',
  ANTHROPIC: 'ANTHROPIC',
  GEMINI_2_5_PRO: 'Gemini 2.5 Pro',
  GEMINI_3_FLASH: 'Gemini 3 Flash',
  SLLM: 'Qwen3-32B-AWQ (sLLM)',
};

const HISTORY_COLUMNS = [
  { id: 'id', label: 'ID', width: 72, align: 'left' },
  { id: 'testName', label: '테스트 이름', width: '20%', align: 'left' },
  { id: 'version', label: '버전', width: 80, align: 'left' },
  { id: 'model', label: '모델', width: 112, align: 'left' },
  { id: 'tokens', label: '토큰', width: 80, align: 'left', ellipsis: false },
  { id: 'latency', label: '응답시간', width: 88, align: 'left', ellipsis: false },
  { id: 'status', label: '상태', width: 88, align: 'left', ellipsis: false },
  { id: 'createdAt', label: '실행시간', width: 168, align: 'left' },
  { id: '_actions', label: '관리', width: 92, actionsButtonCount: 2, ellipsis: false },
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

function getModelDisplayName(model) {
  return MODEL_DISPLAY_NAMES[model] || model || 'UNKNOWN';
}

function getSnapshotModel(snapshot) {
  try {
    const llmConfig = typeof snapshot.llmConfig === 'string'
      ? JSON.parse(snapshot.llmConfig)
      : snapshot.llmConfig;
    return llmConfig?.model || 'UNKNOWN';
  } catch {
    return 'UNKNOWN';
  }
}

function getResponseText(response) {
  if (!response) return '-';
  try {
    const responseData = typeof response === 'string' ? JSON.parse(response) : response;
    return responseData.text || '응답 없음';
  } catch {
    return '응답 파싱 실패';
  }
}

function getTokensUsed(response) {
  if (!response) return 0;
  try {
    const responseData = typeof response === 'string' ? JSON.parse(response) : response;
    return responseData.tokens_used || 0;
  } catch {
    return 0;
  }
}

function getLatency(response) {
  if (!response) return 0;
  try {
    const responseData = typeof response === 'string' ? JSON.parse(response) : response;
    return responseData.latency_ms || 0;
  } catch {
    return 0;
  }
}

function formatExecutedAt(datetime) {
  return formatKlDateTimeWithSeconds(datetime, { fallback: '-' });
}

function formatRelativeTime(datetime) {
  if (!datetime) return '-';
  try {
    return formatDistanceToNow(new Date(datetime), { addSuffix: true, locale: ko });
  } catch {
    return datetime;
  }
}

const HistoryTab = ({ promptCode, versions }) => {
  const [versionFilter, setVersionFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [resultTab, setResultTab] = useState('json');
  const { showAlert, showConfirm } = useAlert();
  const { copy, isCopied } = useCopyFeedback();

  const { data: snapshotsData, isLoading } = useSnapshots(promptCode, {
    versionId: versionFilter || undefined,
    model: modelFilter || undefined,
  });

  const deleteSnapshot = useDeleteSnapshot();
  const snapshots = snapshotsData?.content || [];
  const hasFilters = Boolean(versionFilter || modelFilter);

  const handleCloseDetail = useCallback(() => {
    setDetailDialogOpen(false);
    setResultTab('json');
  }, []);

  const handleDelete = useCallback(async (snapshotId) => {
    const confirmed = await showConfirm('이 테스트 스냅샷을 삭제하시겠습니까?');
    if (!confirmed) return;
    try {
      await deleteSnapshot.mutateAsync(snapshotId);
    } catch (err) {
      console.error('Failed to delete snapshot:', err);
      showAlert('삭제에 실패했습니다.');
    }
  }, [deleteSnapshot, showAlert, showConfirm]);

  const handleViewDetail = useCallback((snapshot) => {
    setSelectedSnapshot(snapshot);
    setResultTab('json');
    setDetailDialogOpen(true);
  }, []);

  const tableEmptyState = useMemo(
    () => listTableEmptyState({
      loading: isLoading,
      loadingMessage: '테스트 이력을 불러오는 중입니다.',
      emptyVariant: hasFilters ? 'search' : 'default',
      emptyMessage: !isLoading && snapshots.length === 0 && !hasFilters
        ? '테스트 이력이 없습니다.'
        : undefined,
    }),
    [hasFilters, isLoading, snapshots.length],
  );

  const selectedSnapshotMeta = useMemo(() => {
    if (!selectedSnapshot) return null;
    const version = versions.find((v) => v.id === selectedSnapshot.versionId);
    const model = getSnapshotModel(selectedSnapshot);
    const success = selectedSnapshot.success !== false;
    return {
      testName: selectedSnapshot.testName || '테스트',
      version,
      model,
      modelLabel: getModelDisplayName(model),
      success,
    };
  }, [selectedSnapshot, versions]);

  const responseJson = useMemo(() => {
    if (!selectedSnapshot?.response) return '';
    try {
      const data = typeof selectedSnapshot.response === 'string'
        ? JSON.parse(selectedSnapshot.response)
        : selectedSnapshot.response;
      return JSON.stringify(data, null, 2);
    } catch {
      return String(selectedSnapshot.response);
    }
  }, [selectedSnapshot]);

  const responseText = useMemo(
    () => (selectedSnapshot ? getResponseText(selectedSnapshot.response) : ''),
    [selectedSnapshot],
  );

  const renderHistoryCell = useCallback(({ column, row }) => {
    const label = row.testName || '테스트';
    const version = versions.find((v) => v.id === row.versionId);
    const model = getSnapshotModel(row);
    const success = row.success !== false;
    const latencySeconds = row.latencyMs
      ? (row.latencyMs / 1000).toFixed(1)
      : (getLatency(row.response) / 1000).toFixed(1);

    switch (column.id) {
      case 'id':
        return <span className="prompt-history-cell--emphasis">{row.id}</span>;
      case 'testName':
        return <span className="prompt-history-cell--emphasis">{label}</span>;
      case 'version':
        return (
          <span className="prompt-history-version-pill">
            v{version?.version || '?'}
          </span>
        );
      case 'model':
        return (
          <span className={`prompt-history-model ${getModelBadgeClass(model)}`}>
            {model}
          </span>
        );
      case 'tokens':
        return row.tokensUsed || getTokensUsed(row.response) || 0;
      case 'latency':
        return `${latencySeconds}s`;
      case 'status':
        return (
          <span className={`prompt-history-status ${success ? 'is-success' : 'is-error'}`}>
            {success ? <CheckCircle2 size={14} aria-hidden /> : <XCircle size={14} aria-hidden />}
            {success ? '성공' : '실패'}
          </span>
        );
      case 'createdAt':
        return (
          <KlTooltip title={formatRelativeTime(row.createdAt)} placement="top">
            <span className="prompt-history-cell--time">
              {formatExecutedAt(row.createdAt)}
            </span>
          </KlTooltip>
        );
      case '_actions':
        return (
          <KlTableRowActions
            actions={[
              {
                kind: 'custom',
                tooltip: '상세보기',
                ariaLabel: `${label} 상세보기`,
                onClick: () => handleViewDetail(row),
                icon: <Eye size={16} strokeWidth={1.75} aria-hidden />,
                tone: 'neutral',
              },
              {
                kind: 'delete',
                ariaLabel: `${label} 삭제`,
                onClick: () => handleDelete(row.id),
              },
            ]}
          />
        );
      default:
        return undefined;
    }
  }, [handleDelete, handleViewDetail, versions]);

  return (
    <div className="prompt-history">
      <div className="table-area">
        <div className="table-toolbar">
          <div className="toolbar-left">
            <span className="kl-table-toolbar-summary">
              총 <strong>{isLoading ? 0 : snapshots.length}</strong>건
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

        <div className="basic-table-shell">
          <BasicTable
            columns={HISTORY_COLUMNS}
            data={isLoading ? [] : snapshots}
            renderCell={renderHistoryCell}
            emptyState={tableEmptyState}
          />
        </div>
      </div>

      <BaseModal
        open={detailDialogOpen}
        onClose={handleCloseDetail}
        title="테스트 상세"
        maxWidth="lg"
        fullWidth
        actions={(
          <div className="kl-modal-actions-split">
            <div className="kl-modal-actions-split__left" aria-hidden="true" />
            <div className="kl-modal-actions-split__right">
              <button type="button" className="kl-btn primary-full md" onClick={handleCloseDetail}>
                닫기
              </button>
            </div>
          </div>
        )}
      >
        {selectedSnapshot && selectedSnapshotMeta && (
          <div className="pt-wrap">
            <div className="prompt-history-detail-info">
              <div className="prompt-history-detail-info__top">
                <div className="prompt-history-detail-info__nameg">
                  <span className="prompt-history-detail-info__label">테스트 이름</span>
                  <span className="prompt-history-detail-info__name">{selectedSnapshotMeta.testName}</span>
                </div>
                <span className="prompt-history-detail-info__sep" aria-hidden />
                <div className="prompt-history-detail-info__chips">
                  <span className="prompt-history-detail-chip">
                    v{selectedSnapshotMeta.version?.version || '?'}
                  </span>
                  <span className="prompt-history-detail-chip prompt-history-detail-chip--mono">
                    {selectedSnapshotMeta.modelLabel}
                  </span>
                  <span className={`prompt-history-detail-status ${selectedSnapshotMeta.success ? 'is-success' : 'is-error'}`}>
                    <span className="prompt-history-detail-status__dot" aria-hidden />
                    {selectedSnapshotMeta.success ? '성공' : '실패'}
                  </span>
                </div>
              </div>
              {selectedSnapshot.notes ? (
                <p className="prompt-history-detail-info__desc">{selectedSnapshot.notes}</p>
              ) : null}
            </div>

            <div className="pt-panels pt-panels--single">
              <div className="pt-panel">
                <div className="pt-panel-header">
                  <span className="pt-panel-label">프롬프트 내용</span>
                  <button
                    type="button"
                    className={`pt-copy-btn${isCopied('content') ? ' is-copied' : ''}`}
                    title={isCopied('content') ? '복사됨' : '복사'}
                    aria-label="프롬프트 내용 복사"
                    onClick={() => copy(selectedSnapshot.content || '', 'content')}
                  >
                    {isCopied('content') ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
                  </button>
                </div>
                <div className="pt-panel-body pt-panel-body--original">
                  <pre className="pt-panel-pre">{selectedSnapshot.content || '-'}</pre>
                </div>
              </div>
            </div>

            <div className="pt-result-card">
              <div className="pt-panel-header pt-panel-header--title-only">
                <span className="pt-panel-label">응답 결과</span>
              </div>
              <div className="pt-result-tabs-row">
                <div className="pt-result-tabs">
                  <button
                    type="button"
                    className={`pt-result-tab${resultTab === 'json' ? ' is-active' : ''}`}
                    onClick={() => setResultTab('json')}
                  >
                    JSON
                  </button>
                  <button
                    type="button"
                    className={`pt-result-tab${resultTab === 'text' ? ' is-active' : ''}`}
                    onClick={() => setResultTab('text')}
                  >
                    텍스트
                  </button>
                </div>
                <button
                  type="button"
                  className={`pt-copy-btn${isCopied('result') ? ' is-copied' : ''}`}
                  title={isCopied('result') ? '복사됨' : '복사'}
                  aria-label="응답 결과 복사"
                  onClick={() => copy(resultTab === 'json' ? responseJson : responseText, 'result')}
                >
                  {isCopied('result') ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
                </button>
              </div>
              <div className="pt-result-body">
                <pre className="pt-panel-pre">
                  {resultTab === 'json' ? responseJson : (responseText || '응답 없음')}
                </pre>
              </div>
            </div>
          </div>
        )}
      </BaseModal>
    </div>
  );
};

export default HistoryTab;

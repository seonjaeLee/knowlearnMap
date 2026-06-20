import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { actionApi } from '../../services/api';
import { useAlert } from '../../context/AlertContext';
import { useBasicTableColumnResize } from '../../hooks/useBasicTableColumnResize';
import { Zap, RotateCcw, Clock, Pencil, List, Info } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import BasicTable from '../../components/common/BasicTable';
import KlIconButton from '../../components/common/KlIconButton';
import KlBadge from '../../components/common/KlBadge';
import {
  getActionListStatusTone,
  getActionLogStatusTone,
} from '../../components/common/klBadgeToneMaps';
import { listTableEmptyState } from '../../config/supportMock';
import KlTooltip from '../../components/common/KlTooltip';
import KlTabBar from '../../components/common/KlTabBar';
import { formatTableCellText, isTableCellBlank } from '../../components/common/tableCellDisplay';
import { formatKlDateTimeCell } from '../../utils/formatKlDate';
import BaseModal from '../../components/common/modal/BaseModal';
import { homeRenameModalPaperSx } from '../../components/common/modal/klModalPaper';
import {
  KL_MODAL_FORM_ELEMENT_ID,
  KL_MODAL_FORM_STACK_CLASS,
  klModalFormContentClassName,
} from '../../components/common/modal/klModalForm';
import {
  getMockActionLogs,
  getMockActionsForWorkspace,
  MOCK_ACTION_LOG_DEMO_ID,
} from '../../data/actionAdminMockData';
import './admin-common.css';
import './AdminActionPage.css';

const STORAGE_KEY = 'admin_selected_workspace_id';
const isActionMockEnabled = import.meta.env.VITE_ENABLE_ACTION_MOCK === 'true';
/** 로컬 dev·mock 시 실행 이력 탭 자동 샘플 로드 */
const isActionLogDemoEnabled = isActionMockEnabled || import.meta.env.DEV;

const ACTION_TABS = [
  { id: 'list', label: 'Action 목록 (읽기 전용)', icon: <List size={14} aria-hidden /> },
  { id: 'logs', label: '실행 이력', icon: <Clock size={14} aria-hidden /> },
];

function readStoredWorkspaceId() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  const n = Number(stored);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseWorkspaceIdInput(raw) {
  const trimmed = String(raw ?? '').trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function WorkspaceIdModal({
  open,
  draft,
  onDraftChange,
  onClose,
  onConfirm,
}) {
  const parsed = useMemo(() => parseWorkspaceIdInput(draft), [draft]);

  return (
    <BaseModal
      open={open}
      title="워크스페이스 선택"
      onClose={onClose}
      maxWidth={false}
      fullWidth={false}
      paperSx={homeRenameModalPaperSx}
      contentClassName={klModalFormContentClassName}
      actions={(
        <div className="kl-modal-actions-split">
          <div className="kl-modal-actions-split__left" aria-hidden="true" />
          <div className="kl-modal-actions-split__right">
            <button type="button" className="kl-btn gray-outline md" onClick={onClose}>
              취소
            </button>
            <button
              type="submit"
              className="kl-btn primary-full md"
              form={KL_MODAL_FORM_ELEMENT_ID}
              disabled={parsed == null}
            >
              확인
            </button>
          </div>
        </div>
      )}
    >
      <form
        id={KL_MODAL_FORM_ELEMENT_ID}
        className={KL_MODAL_FORM_STACK_CLASS}
        onSubmit={(e) => {
          e.preventDefault();
          if (parsed != null) onConfirm();
        }}
      >
        <p className="kl-modal-form-helper">
          Action 관리 대상 workspaceId 를 입력하세요. 다음 방문 시에도 유지됩니다.
        </p>
        <div className="kl-modal-form-row">
          <label className="kl-modal-form-row__label" htmlFor="admin-action-ws-id">
            워크스페이스 ID
          </label>
          <div className="kl-modal-form-row__control">
            <input
              id="admin-action-ws-id"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="예: 71"
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
            />
          </div>
        </div>
      </form>
    </BaseModal>
  );
}

function AdminActionPage() {
  const [subTab, setSubTab] = useState('list');
  const [workspaceId, setWorkspaceId] = useState(() => readStoredWorkspaceId());
  const [wsModalOpen, setWsModalOpen] = useState(() => readStoredWorkspaceId() == null);
  const [wsDraft, setWsDraft] = useState(() => localStorage.getItem(STORAGE_KEY) || '');

  const openWsModal = () => {
    setWsDraft(workspaceId != null ? String(workspaceId) : (localStorage.getItem(STORAGE_KEY) || ''));
    setWsModalOpen(true);
  };

  const closeWsModal = () => setWsModalOpen(false);

  const confirmWorkspaceId = () => {
    const parsed = parseWorkspaceIdInput(wsDraft);
    if (parsed == null) return;
    setWorkspaceId(parsed);
    localStorage.setItem(STORAGE_KEY, String(parsed));
    setWsModalOpen(false);
  };

  const wsModal = (
    <WorkspaceIdModal
      open={wsModalOpen}
      draft={wsDraft}
      onDraftChange={setWsDraft}
      onClose={closeWsModal}
      onConfirm={confirmWorkspaceId}
    />
  );

  if (!workspaceId) {
    return (
      <div className="kl-page kl-page--fill admin-action-page">
        {wsModal}
        <div className="admin-action-ws-empty">
          <p>Action 관리에 워크스페이스 ID가 필요합니다.</p>
          <button type="button" className="kl-btn primary-full md" onClick={openWsModal}>
            워크스페이스 ID 입력
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="kl-page kl-page--fill admin-action-page">
      {wsModal}
      <div className="kl-main-sticky-head">
        <AdminPageHeader
          icon={Zap}
          title="Action 관리"
          subtitle="온톨로지 기반 실행 Action 을 정의하고, 개념·트리플에 바인딩합니다. Excel 일괄 업다운 지원."
        />
      </div>

      <KlTabBar
        variant="subtle"
        ariaLabel="Action 관리"
        tabs={ACTION_TABS}
        value={subTab}
        onChange={setSubTab}
        actions={(
          <KlTooltip
            title="워크스페이스 ID 변경"
            placement="bottom"
            enterDelay={0}
            triggerClassName="kl-icon-btn-tooltip-trigger"
          >
            <button
              type="button"
              className="kl-btn kl-btn--outline-success md"
              onClick={openWsModal}
              aria-label="워크스페이스 ID 변경"
            >
              <Pencil size={14} aria-hidden />
              워크스페이스 ID 변경
            </button>
          </KlTooltip>
        )}
      />

      {subTab === 'list' && <ActionListTab workspaceId={workspaceId} />}
      {subTab === 'logs' && <ActionLogTab />}
    </div>
  );
}

const actionListColumnDefinitions = [
  { id: 'id', label: 'ID', defaultWidthPx: 64, minWidthPx: 56, align: 'left' },
  { id: 'nameEn', label: '영문명', defaultWidthPx: 180, minWidthPx: 140, align: 'left' },
  { id: 'nameKo', label: '한글명', defaultWidthPx: 140, minWidthPx: 112, align: 'left' },
  { id: 'actionType', label: '타입', defaultWidthPx: 100, minWidthPx: 88, align: 'left', ellipsis: false },
  { id: 'approvalMode', label: '승인', defaultWidthPx: 100, minWidthPx: 88, align: 'left', ellipsis: false },
  { id: 'category', label: '카테고리', defaultWidthPx: 120, minWidthPx: 96, align: 'left' },
  { id: 'status', label: '상태', defaultWidthPx: 96, minWidthPx: 80, align: 'left', ellipsis: false },
];

const actionLogColumnDefinitions = [
  { id: 'executedAt', label: '시간', defaultWidthPx: 160, minWidthPx: 140, align: 'left' },
  { id: 'triggerSource', label: '트리거', defaultWidthPx: 120, minWidthPx: 96, align: 'left' },
  { id: 'status', label: '상태', defaultWidthPx: 100, minWidthPx: 88, align: 'left', ellipsis: false },
  { id: 'durationMs', label: '소요(ms)', defaultWidthPx: 88, minWidthPx: 72, align: 'left' },
  { id: 'errorMessage', label: '에러', defaultWidthPx: 220, minWidthPx: 160, align: 'left' },
];

// ────────────────── Action 목록 탭 (읽기 전용) ──────────────────

function ActionListTab({ workspaceId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listSource, setListSource] = useState('live');
  const { showAlert } = useAlert();

  const { columns: actionListColumns, startResize: actionListColumnStartResize } = useBasicTableColumnResize({
    definitions: actionListColumnDefinitions,
    storageKey: 'kl-admin-action-list-v1',
    enabled: true,
  });

  const renderActionListCell = useCallback(({ column, row }) => {
    switch (column.id) {
      case 'nameEn':
        return <span className="admin-action-name-en">{row.nameEn}</span>;
      case 'actionType':
        return (
          <KlBadge tone="info" variant="compact">
            {row.actionType}
          </KlBadge>
        );
      case 'approvalMode':
        return (
          <KlBadge tone="neutral" variant="compact">
            {row.approvalMode}
          </KlBadge>
        );
      case 'category': {
        const category = row.category;
        return (
          <span className={isTableCellBlank(category) ? 'kl-table-cell-blank' : undefined}>
            {formatTableCellText(category)}
          </span>
        );
      }
      case 'status':
        return (
          <KlBadge tone={getActionListStatusTone(row.status)} variant="inline">
            {row.status}
          </KlBadge>
        );
      default:
        return undefined;
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    if (isActionMockEnabled) {
      setItems(getMockActionsForWorkspace(workspaceId));
      setListSource('mock');
      setLoading(false);
      return;
    }
    try {
      setItems(await actionApi.list(workspaceId) || []);
      setListSource('live');
    } catch (e) {
      setItems(getMockActionsForWorkspace(workspaceId));
      setListSource('mock');
      showAlert(`API 조회 실패 — 더미 데이터로 표시합니다. (${e.message})`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchData(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [workspaceId]);

  return (
    <div className="table-area">
      <div className="table-toolbar">
        <div className="toolbar-left">
          <span className="kl-table-toolbar-summary">
            총 <strong>{items.length}</strong>건
            {listSource === 'mock' ? <span className="admin-action-mock-tag"> · 더미</span> : null}
          </span>
        </div>
        <div className="toolbar-right">
          <KlIconButton
            tooltip="새로고침"
            ariaLabel="새로고침"
            onClick={fetchData}
            buttonClassName="kl-btn gray-outline md icon-only"
            stopPropagation={false}
          >
            <RotateCcw size={16} aria-hidden />
          </KlIconButton>
        </div>
      </div>

      <div className="basic-table-shell">
        <BasicTable
          columns={actionListColumns}
          data={loading ? [] : items}
          renderCell={renderActionListCell}
          onColumnResizeMouseDown={actionListColumnStartResize}
          emptyState={listTableEmptyState({
            loading,
            loadError: null,
            loadingMessage: 'Action 목록을 불러오는 중입니다.',
            emptyVariant: 'default',
          })}
        />
      </div>
      {!loading ? (
        <div className="kl-infotxt-note-row kl-infotxt-note-row--end">
          <div className="kl-infotxt-note">
            <Info size={16} aria-hidden />
            <span>
              MAP에서는 실행+이력 조회하고 있습니다. Action 추가/수정/바인딩은 <strong>EXP 액션사전</strong>에서 관리해주세요.
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ────────────────── 실행 이력 탭 ──────────────────

function ActionLogTab() {
  const { showAlert } = useAlert();
  const [actionId, setActionId] = useState(() => (
    isActionLogDemoEnabled ? String(MOCK_ACTION_LOG_DEMO_ID) : ''
  ));
  const [logs, setLogs] = useState([]);
  const [logSource, setLogSource] = useState('live');

  const { columns: actionLogColumns, startResize: actionLogColumnStartResize } = useBasicTableColumnResize({
    definitions: actionLogColumnDefinitions,
    storageKey: 'kl-admin-action-log-v1',
    enabled: true,
  });

  const renderActionLogCell = useCallback(({ column, row }) => {
    switch (column.id) {
      case 'executedAt': {
        const executedAt = row.executedAt;
        return (
          <span className={isTableCellBlank(executedAt) ? 'kl-table-cell-blank' : undefined}>
            {isTableCellBlank(executedAt)
              ? formatTableCellText(executedAt)
              : formatKlDateTimeCell(executedAt)}
          </span>
        );
      }
      case 'status':
        return (
          <KlBadge tone={getActionLogStatusTone(row.status)} variant="inline">
            {row.status}
          </KlBadge>
        );
      case 'durationMs': {
        const durationMs = row.durationMs;
        return (
          <span className={isTableCellBlank(durationMs) ? 'kl-table-cell-blank' : undefined}>
            {isTableCellBlank(durationMs) ? formatTableCellText(durationMs) : String(durationMs)}
          </span>
        );
      }
      case 'errorMessage': {
        const errorMessage = row.errorMessage;
        return (
          <span
            className={
              isTableCellBlank(errorMessage)
                ? 'kl-table-cell-blank admin-action-log-error'
                : 'admin-action-log-error'
            }
            title={!isTableCellBlank(errorMessage) ? String(errorMessage) : undefined}
          >
            {formatTableCellText(errorMessage)}
          </span>
        );
      }
      default:
        return undefined;
    }
  }, []);

  const load = useCallback(async (idOverride) => {
    const id = String(idOverride ?? actionId ?? '').trim();
    if (!id) return;
    if (isActionLogDemoEnabled) {
      const result = getMockActionLogs(id, 0, 50);
      setLogs(result.content);
      setLogSource('mock');
      return;
    }
    try {
      const result = await actionApi.logs(id, 0, 50);
      setLogs(result?.content || (Array.isArray(result) ? result : []));
      setLogSource('live');
    } catch (e) {
      const result = getMockActionLogs(id, 0, 50);
      setLogs(result.content);
      setLogSource('mock');
      showAlert(`이력 API 실패 — 더미로 표시합니다. (${e.message})`);
    }
  }, [actionId, showAlert]);

  useEffect(() => {
    if (!isActionLogDemoEnabled) return;
    void load(String(MOCK_ACTION_LOG_DEMO_ID));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 탭 최초 진입 시 샘플 1회만
  }, []);

  return (
    <div className="table-area">
      <div className="table-toolbar">
        <div className="toolbar-left">
          <span className="kl-table-toolbar-summary">
            총 <strong>{logs.length}</strong>건
            {logSource === 'mock' ? <span className="admin-action-mock-tag"> · 더미</span> : null}
          </span>
        </div>
        <div className="toolbar-right admin-action-log-toolbar">
          <div className="toolbar-field-group">
            <label htmlFor="admin-action-log-id" className="toolbar-field-group__label">
              Action ID
            </label>
            <div className="toolbar-input-composer">
              <input
                id="admin-action-log-id"
                className="toolbar-input-composer__input"
                type="text"
                inputMode="numeric"
                value={actionId}
                onChange={(e) => setActionId(e.target.value)}
                placeholder="예: 1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void load();
                  }
                }}
              />
              <KlTooltip
                title="입력한 Action ID의 실행 이력 조회"
                placement="bottom"
                enterDelay={0}
                triggerClassName="kl-icon-btn-tooltip-trigger"
              >
                <button
                  type="button"
                  className="toolbar-input-composer__btn"
                  onClick={() => void load()}
                  disabled={!String(actionId ?? '').trim()}
                  aria-label="입력한 Action ID의 실행 이력 조회"
                >
                  조회
                </button>
              </KlTooltip>
            </div>
          </div>
        </div>
      </div>

      <div className="basic-table-shell">
        <BasicTable
          columns={actionLogColumns}
          data={logs}
          renderCell={renderActionLogCell}
          onColumnResizeMouseDown={actionLogColumnStartResize}
          emptyState={{
            variant: 'default',
            message: isActionLogDemoEnabled
              ? '실행 이력이 없습니다. (더미: Action ID 1~6 입력 후 불러오기)'
              : '실행 이력이 없습니다.',
          }}
        />
      </div>
    </div>
  );
}

export default AdminActionPage;

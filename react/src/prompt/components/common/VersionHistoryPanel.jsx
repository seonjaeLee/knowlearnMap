import React, { useCallback, useMemo } from 'react';
import { ChevronsLeft, Copy } from 'lucide-react';
import { useAlert } from '../../../context/AlertContext';
import BasicTable, {
  basicTableControlColumnDef,
} from '../../../components/common/BasicTable';
import { basicTableActionsColumnDef } from '../../../components/common/table/basicTableActionsColumn';
import KlTooltip from '../../../components/common/KlTooltip';
import KlBadge from '../../../components/common/KlBadge';
import KlTableRowActions from '../../../components/common/table/KlTableRowActions';
import { formatPromptVersionDate, getPromptVersionStatus } from '../../utils/promptVersionStatus';
import './VersionHistoryPanel.css';

const VERSION_HISTORY_COLUMNS = [
  { id: 'version', label: '버전', width: 72, align: 'left', ellipsis: false },
  { id: 'status', label: '상태', width: 76, align: 'left', ellipsis: false },
  { id: 'updatedAt', label: '수정일자', width: 136, align: 'left' },
  basicTableControlColumnDef({
    id: 'isActive',
    label: '활성',
    control: 'radio',
    width: 48,
    align: 'center',
    getControlChecked: (row) => Boolean(row.isActive),
    getControlAriaLabel: (row) => (row.isActive ? '현재 활성' : '활성으로 적용'),
  }),
  basicTableActionsColumnDef({ id: '_actions', buttonCount: 1, width: 52 }),
];

const VersionHistoryPanel = ({
  promptName = '',
  versions = [],
  selectedVersion,
  onVersionChange,
  onCopyVersion,
  onDeleteVersion,
  compareVersions,
  collapsed = false,
  onToggleCollapse,
}) => {
  const { showAlert, showConfirm } = useAlert();

  const handleVersionClick = useCallback(async (newVersionId) => {
    const currentVersion = versions.find((v) => v.id === selectedVersion);
    const newVersion = versions.find((v) => v.id === newVersionId);

    if (!currentVersion || !newVersion) {
      onVersionChange?.(newVersionId, newVersion?.content || '');
      return;
    }

    const comparison = compareVersions(currentVersion.version, newVersion.version);

    if (comparison > 0) {
      const confirmed = await showConfirm(
        `버전을 ${currentVersion.version}에서 ${newVersion.version}으로 변경하시겠습니까?`,
      );
      if (confirmed) {
        onVersionChange?.(newVersionId, newVersion.content);
      }
    } else {
      onVersionChange?.(newVersionId, newVersion.content);
    }
  }, [compareVersions, onVersionChange, selectedVersion, showConfirm, versions]);

  const handleDelete = useCallback(async (e, version) => {
    e.stopPropagation();

    if (version.isActive) {
      if (versions.length === 1) {
        const confirmed = await showConfirm(
          '활성화된 버전을 삭제하면 프롬프트 전체가 삭제됩니다. 계속하시겠습니까?',
        );
        if (confirmed) {
          onDeleteVersion?.(version.id);
        }
      } else {
        showAlert('활성화된 버전은 삭제할 수 없습니다. 다른 버전을 활성화한 후 삭제해주세요.');
      }
      return;
    }

    const sortedVersions = [...versions].sort((a, b) => compareVersions(b.version, a.version));
    const top5 = sortedVersions.slice(0, 5);
    const isTop5 = top5.some((v) => v.id === version.id);

    if (isTop5) {
      const confirmed = await showConfirm(`버전 ${version.version}을(를) 삭제하시겠습니까?`);
      if (confirmed) {
        onDeleteVersion?.(version.id);
      }
    } else {
      onDeleteVersion?.(version.id);
    }
  }, [compareVersions, onDeleteVersion, showAlert, showConfirm, versions]);

  const renderCell = useCallback(({ column, row }) => {
    switch (column.id) {
      case 'version':
        return (
          <div className="vh-vercell">
            <span className="vh-ver">v{row.version}</span>
            <KlTooltip title="복사본 만들기" placement="top" enterDelay={300}>
              <button
                type="button"
                className="vh-copy"
                aria-label={`버전 ${row.version} 복사`}
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyVersion?.(row);
                }}
              >
                <Copy size={14} strokeWidth={1.9} aria-hidden />
              </button>
            </KlTooltip>
          </div>
        );
      case 'status': {
        const status = getPromptVersionStatus(row, selectedVersion);
        const tagTone = status.tone === 'active' ? 'ok'
          : status.tone === 'editing' ? 'warn'
          : null;
        return <KlBadge tone={tagTone}>{status.label}</KlBadge>;
      }
      case 'updatedAt':
        return formatPromptVersionDate(row.updatedAt || row.createdAt);
      case '_actions':
        return (
          <KlTableRowActions
            stopPropagationOnWrapper={false}
            actions={[
              {
                kind: 'delete',
                ariaLabel: `버전 ${row.version} 삭제`,
                onClick: (e) => handleDelete(e, row),
              },
            ]}
          />
        );
      default:
        return undefined;
    }
  }, [handleDelete, onCopyVersion, selectedVersion]);

  const onRowClick = useCallback((_event, { row }) => {
    handleVersionClick(row.id);
  }, [handleVersionClick]);

  const getRowClassName = useCallback((row) => (
    selectedVersion === row.id ? 'kl-table-row-selected' : ''
  ), [selectedVersion]);

  const columns = useMemo(() => VERSION_HISTORY_COLUMNS, []);

  return (
    <div className={`vh-col ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="vh-head">
        <h3 className="vh-head__title">
          <span className="vh-head__name">{promptName}</span>
          <span className="vh-head__sub">버전 히스토리</span>
        </h3>
        <div className="vh-head__toggle">
          <KlTooltip title={collapsed ? '펼치기' : '접기'} placement="top">
            <button
              type="button"
              className="vhc-btn"
              aria-label={collapsed ? '버전 패널 펼치기' : '버전 패널 접기'}
              onClick={() => onToggleCollapse?.(!collapsed)}
            >
              <ChevronsLeft size={16} aria-hidden />
            </button>
          </KlTooltip>
        </div>
      </div>
      <div className="vh-panel basic-table-shell">
        <BasicTable
          columns={columns}
          data={versions}
          renderCell={renderCell}
          onRowClick={onRowClick}
          getRowClassName={getRowClassName}
          emptyState={{ message: '버전이 없습니다.' }}
        />
      </div>
    </div>
  );
};

export default VersionHistoryPanel;

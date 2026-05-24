import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Plus, Download, Upload, RotateCcw, FileDown, FilterX,
} from 'lucide-react';
import { useBasicTableColumnResize } from '../../../hooks/useBasicTableColumnResize';
import BasicTable from '../../../components/common/BasicTable';
import KlTableRowActions from '../../../components/common/table/KlTableRowActions';
import KlIconButton from '../../../components/common/KlIconButton';
import { listTableEmptyState } from '../../../config/supportMock';
import { formatTableCellText, isTableCellBlank, TableCellBlank } from '../../../components/common/tableCellDisplay';
import ToolbarMoreMenu from '../../../components/common/ToolbarMoreMenu';
import { semanticEntityColumnDefinitions } from './semanticEntityTableColumns';

function SemanticEntityListPanel({
  entityLabel,
  items,
  categories,
  selectedCategoryId,
  loading,
  listSource,
  importing,
  onRefresh,
  onCreate,
  onEdit,
  onDelete,
  onTemplate,
  onExport,
  onImportClick,
  fileInputRef,
  onImportFile,
  storageKey,
  onClearCategoryFilter,
}) {
  const { columns, startResize } = useBasicTableColumnResize({
    definitions: semanticEntityColumnDefinitions,
    storageKey,
    enabled: true,
  });

  const toolbarMoreItems = useMemo(() => [
    {
      id: 'template',
      label: '\uc591\uc2dd',
      icon: <FileDown size={14} aria-hidden />,
      onClick: onTemplate,
    },
    {
      id: 'export',
      label: '\ub2e4\uc6b4\ub85c\ub4dc',
      icon: <Download size={14} aria-hidden />,
      onClick: onExport,
    },
    {
      id: 'import',
      label: importing ? '\uc5c5\ub85c\ub4dc \uc911...' : '\uc5c5\ub85c\ub4dc',
      icon: <Upload size={14} aria-hidden />,
      onClick: onImportClick,
      disabled: importing,
    },
  ], [onTemplate, onExport, onImportClick, importing]);

  const renderCell = useCallback(({ column, row }) => {
    switch (column.id) {
      case 'nameEn':
        return <span className="admin-col-strong">{row.nameEn}</span>;
      case 'categoryNameEn':
        return row.categoryNameEn
          ? <span className="admin-badge admin-badge-info">{row.categoryNameEn}</span>
          : <TableCellBlank />;
      case 'description': {
        const desc = row.description;
        return (
          <span
            className="kl-table-cell-text--secondary"
            title={!isTableCellBlank(desc) ? String(desc) : undefined}
          >
            {formatTableCellText(desc)}
          </span>
        );
      }
      case 'actions':
        return (
          <KlTableRowActions
            stopPropagationOnWrapper={false}
            actions={[
              {
                kind: 'edit',
                onClick: () => onEdit(row),
                ariaLabel: `${row.nameEn} 수정`,
              },
              {
                kind: 'delete',
                onClick: () => onDelete(row),
                ariaLabel: `${row.nameEn} 삭제`,
              },
            ]}
          />
        );
      default:
        return undefined;
    }
  }, [onEdit, onDelete]);

  return (
    <div className="table-area kl-split-table-area">
      <div className="table-toolbar">
        <div className="toolbar-left">
          <span className="kl-table-toolbar-summary">
            총 <strong>{items.length}</strong>건
            {listSource === 'mock' ? <span className="admin-semantic-mock-tag"> · 더미</span> : null}
          </span>
        </div>
        <div className="toolbar-right">
          <button type="button" className="kl-btn primary-full md" onClick={onCreate}>
            <Plus size={16} aria-hidden />
            {'\ucd94\uac00'}
          </button>
          {onClearCategoryFilter ? (
            <KlIconButton
              tooltip="카테고리 전체보기"
              ariaLabel="카테고리 전체보기"
              onClick={onClearCategoryFilter}
              disabled={selectedCategoryId == null}
              buttonClassName="kl-btn gray-outline md icon-only"
              stopPropagation={false}
            >
              <FilterX size={16} aria-hidden />
            </KlIconButton>
          ) : null}
          <KlIconButton
            tooltip="새로고침"
            ariaLabel="새로고침"
            onClick={onRefresh}
            buttonClassName="kl-btn gray-outline md icon-only"
            stopPropagation={false}
          >
            <RotateCcw size={16} aria-hidden />
          </KlIconButton>
          <ToolbarMoreMenu
            items={toolbarMoreItems}
            ariaLabel="Excel 메뉴"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="admin-hidden-file-input"
            onChange={onImportFile}
          />
        </div>
      </div>

      <div className="basic-table-shell">
        <BasicTable
          className="admin-semantic-split-basic-table"
          columns={columns}
          data={loading ? [] : items}
          renderCell={renderCell}
          onColumnResizeMouseDown={startResize}
          emptyState={listTableEmptyState({
            loading,
            loadError: null,
            loadingMessage: '불러오는 중...',
            emptyVariant: 'default',
          })}
        />
      </div>
    </div>
  );
}

SemanticEntityListPanel.propTypes = {
  entityLabel: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  categories: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedCategoryId: PropTypes.number,
  loading: PropTypes.bool.isRequired,
  listSource: PropTypes.oneOf(['live', 'mock']).isRequired,
  importing: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onTemplate: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  onImportClick: PropTypes.func.isRequired,
  fileInputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.object }),
  ]).isRequired,
  onImportFile: PropTypes.func.isRequired,
  storageKey: PropTypes.string.isRequired,
  onClearCategoryFilter: PropTypes.func,
};

SemanticEntityListPanel.defaultProps = {
  selectedCategoryId: null,
  onClearCategoryFilter: undefined,
};

export default SemanticEntityListPanel;

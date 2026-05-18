import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Plus, Pencil, Trash2, Download, Upload, RotateCcw, FileDown, FilterX,
} from 'lucide-react';
import { useBasicTableColumnResize } from '../../../hooks/useBasicTableColumnResize';
import BasicTable from '../../../components/common/BasicTable';
import TableEmptyState from '../../../components/common/TableEmptyState';
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
          : <span className="admin-text-tertiary">-</span>;
      case 'description':
        return <span className="admin-text-secondary">{row.description || '-'}</span>;
      case 'actions':
        return (
          <div className="kl-table-actions">
            <button
              type="button"
              className="kl-table-icon-btn kl-table-icon-btn--neutral"
              onClick={() => onEdit(row)}
              title="\uc218\uc815"
              aria-label={`${row.nameEn} \uc218\uc815`}
            >
              <Pencil size={16} aria-hidden />
            </button>
            <button
              type="button"
              className="kl-table-icon-btn kl-table-icon-btn--danger"
              onClick={() => onDelete(row)}
              title="\uc0ad\uc81c"
              aria-label={`${row.nameEn} \uc0ad\uc81c`}
            >
              <Trash2 size={16} aria-hidden />
            </button>
          </div>
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
            {'\ucd1d '}
            <strong>{items.length}</strong>
            {'\uac74'}
            {listSource === 'mock' ? <span className="admin-semantic-mock-tag">{' \u00b7 \ub354\ubbf8'}</span> : null}
          </span>
        </div>
        <div className="toolbar-right">
          <button type="button" className="kl-btn-outline-primary-sm" onClick={onCreate}>
            <Plus size={16} aria-hidden />
            {'\ucd94\uac00'}
          </button>
          {onClearCategoryFilter ? (
            <button
              type="button"
              className="kl-toolbar-btn kl-toolbar-btn--icon-only"
              onClick={onClearCategoryFilter}
              disabled={selectedCategoryId == null}
              title="???? ?? ??"
              aria-label="???? ?? ??"
            >
              <FilterX size={16} aria-hidden />
            </button>
          ) : null}
          <button
            type="button"
            className="kl-toolbar-btn kl-toolbar-btn--icon-only"
            onClick={onRefresh}
            title="\uc0c8\ub85c\uace0\uce68"
            aria-label="\uc0c8\ub85c\uace0\uce68"
          >
            <RotateCcw size={16} aria-hidden />
          </button>
          <ToolbarMoreMenu
            items={toolbarMoreItems}
            ariaLabel="Excel \uba54\ub274"
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

      {loading ? (
        <div className="admin-semantic-loading" role="status">
          <div className="admin-spinner" aria-hidden />
          <span>{'\ubd88\ub7ec\uc624\ub294 \uc911...'}</span>
        </div>
      ) : (
        <div className="basic-table-shell">
          {items.length === 0 ? (
            <TableEmptyState solo />
          ) : (
            <BasicTable
              className="admin-semantic-split-basic-table"
              columns={columns}
              data={items}
              renderCell={renderCell}
              onColumnResizeMouseDown={startResize}
            />
          )}
        </div>
      )}
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

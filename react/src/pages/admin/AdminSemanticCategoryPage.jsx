import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Button } from '@mui/material';
import { adminSemanticApi } from '../../services/api';
import { useDialog } from '../../hooks/useDialog';
import {
  Layers,
  Plus,
  X,
  Download,
  Upload,
  RotateCcw,
  FileDown,
  ChevronRight,
  ChevronDown,
  Search,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import BaseModal from '../../components/common/modal/BaseModal';
import KlModalSelect from '../../components/common/modal/KlModalSelect';
import {
  semanticFormModalPaperClassName,
  semanticFormModalPaperSx,
} from '../../components/common/modal/supportFormModalPaperSx';
import { formatTableCellText, isTableCellBlank } from '../../components/common/tableCellDisplay';
import ToolbarMoreMenu from '../../components/common/ToolbarMoreMenu';
import BasicTable from '../../components/common/BasicTable';
import KlTableRowActions from '../../components/common/table/KlTableRowActions';
import KlIconButton from '../../components/common/KlIconButton';
import { useBasicTableColumnResize } from '../../hooks/useBasicTableColumnResize';
import {
  semanticCategoryColumnDefinitionsCollapsed,
  semanticCategoryColumnDefinitionsFull,
} from './semantic/semanticCategoryTableColumns';
import './admin-common.css';
import './AdminSemanticPage.css';

const SEMANTIC_SPLIT_TABLE_CLASS = 'admin-semantic-split-basic-table';

/**
 * 온톨로지 카테고리 관리 (V20260424 통합 이후).
 * type: OBJECT | RELATION | ACTION — 같은 테이블 다른 네임스페이스.
 * parent_id + path 로 계층 구조 표현 (path 는 DB 트리거로 자동 유지).
 */
function AdminSemanticCategoryPage({
  compact = false,
  collapsed = false,
  type = 'OBJECT',
  onSelectCategory,
  sharedCategories,
  sharedLoading,
  sharedListSource,
  onSharedRefresh,
  selectedCategoryId = null,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // { id?, nameEn, nameKo, code, parentId, description }
  const [importing, setImporting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const { alert, confirm } = useDialog();
  const fileInputRef = useRef(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await adminSemanticApi.listCategories(type);
      const list = Array.isArray(data) ? data : [];
      // path 기준 정렬 (루트→서브 순)
      list.sort((a, b) => (a.path || a.nameEn).localeCompare(b.path || b.nameEn));
      setItems(list);
    } catch (err) {
      await alert('목록 조회 실패: ' + (err?.message || '알 수 없는 오류'));
    } finally {
      setLoading(false);
    }
  };

  const usesSharedData = onSharedRefresh != null;
  const displayItems = usesSharedData ? (sharedCategories ?? []) : items;
  const showLoading = usesSharedData ? Boolean(sharedLoading) : loading;
  const activeListSource = usesSharedData ? (sharedListSource ?? 'live') : 'live';
  const refreshList = onSharedRefresh ?? fetchItems;

  useEffect(() => {
    if (usesSharedData) return;
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, usesSharedData]);

  const openCreate = () => setEditing({
    id: null, nameEn: '', nameKo: '', code: '', parentId: null, description: '',
  });
  const openEdit = (item) => setEditing({
    id: item.id,
    nameEn: item.nameEn || '',
    nameKo: item.nameKo || '',
    code: item.code || '',
    parentId: item.parentId ?? null,
    description: item.description || '',
  });

  const handleSave = async () => {
    if (!editing.nameEn?.trim() || !editing.nameKo?.trim()) {
      await alert('영문명과 한글명은 필수입니다.');
      return;
    }
    try {
      const body = {
        type,
        nameEn: editing.nameEn.trim(),
        nameKo: editing.nameKo.trim(),
        code: editing.code?.trim() || null,
        parentId: editing.parentId || null,
        description: editing.description?.trim() || null,
      };
      if (editing.id) {
        await adminSemanticApi.updateCategory(editing.id, body);
        await alert('수정되었습니다.');
      } else {
        await adminSemanticApi.createCategory(body);
        await alert('생성되었습니다.');
      }
      setEditing(null);
      refreshList();
    } catch (err) {
      await alert('저장 실패: ' + (err?.message || '알 수 없는 오류'));
    }
  };

  const handleDelete = async (item) => {
    const ok = await confirm(`"${item.nameEn} (${item.nameKo})" 카테고리를 삭제하시겠습니까?\n하위 카테고리는 parent_id=NULL 로 변경됩니다.`);
    if (!ok) return;
    try {
      await adminSemanticApi.deleteCategory(item.id);
      await alert('삭제되었습니다.');
      refreshList();
    } catch (err) {
      await alert('삭제 실패: ' + (err?.message || '알 수 없는 오류'));
    }
  };

  const handleExport = async () => {
    try { await adminSemanticApi.exportCategories(type); }
    catch (err) { await alert('다운로드 실패: ' + (err?.message || '알 수 없는 오류')); }
  };

  const handleTemplate = async () => {
    try { await adminSemanticApi.templateCategories(); }
    catch (err) { await alert('양식 다운로드 실패: ' + (err?.message || '알 수 없는 오류')); }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const replace = await confirm(
      `"${file.name}" 을(를) 업로드합니다.\n\n기존 ${type} 카테고리를 전부 삭제하고 교체하시겠습니까?\n(취소하면 업데이트 + 추가 모드로 진행)`
    );
    try {
      setImporting(true);
      const result = await adminSemanticApi.importCategories(file, replace, type);
      await alert(`가져오기 완료: ${result?.count ?? 0}건 처리`);
      refreshList();
    } catch (err) {
      await alert('가져오기 실패: ' + (err?.message || '알 수 없는 오류'));
    } finally {
      setImporting(false);
    }
  };

  const typeLabel = type === 'OBJECT' ? '객체' : type === 'RELATION' ? '관계' : '액션';

  // ─── 트리 구조 계산 ───
  const itemsById = React.useMemo(() => {
    const m = new Map();
    displayItems.forEach((i) => m.set(i.id, i));
    return m;
  }, [displayItems]);

  const childrenByParent = React.useMemo(() => {
    const m = new Map();
    displayItems.forEach((i) => {
      const pid = i.parentId ?? null;
      if (!m.has(pid)) m.set(pid, []);
      m.get(pid).push(i);
    });
    // 각 그룹 내 path/name 기준 정렬
    m.forEach((arr) => arr.sort((a, b) => (a.path || a.nameEn).localeCompare(b.path || b.nameEn)));
    return m;
  }, [displayItems]);

  const hasChildren = (id) => (childrenByParent.get(id) || []).length > 0;

  const getAncestorIds = (id) => {
    const out = new Set();
    let cur = itemsById.get(id);
    while (cur && cur.parentId != null) {
      out.add(cur.parentId);
      cur = itemsById.get(cur.parentId);
    }
    return out;
  };

  // 검색 필터: path/nameEn/nameKo/code 에 부분일치
  const searchLower = searchText.trim().toLowerCase();
  const matchesSearch = (it) => {
    if (!searchLower) return true;
    return (
      (it.path || '').toLowerCase().includes(searchLower) ||
      (it.nameEn || '').toLowerCase().includes(searchLower) ||
      (it.nameKo || '').toLowerCase().includes(searchLower) ||
      (it.code || '').toLowerCase().includes(searchLower)
    );
  };

  // 검색 시 매칭 노드의 ancestor 를 모두 자동 펼침
  const autoExpandIds = React.useMemo(() => {
    if (!searchLower) return null;
    const out = new Set();
    displayItems.forEach((it) => {
      if (matchesSearch(it)) {
        getAncestorIds(it.id).forEach((x) => out.add(x));
      }
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchLower, displayItems]);

  const isExpanded = (id) => {
    if (autoExpandIds) return autoExpandIds.has(id) || expandedIds.has(id);
    return expandedIds.has(id);
  };

  // Visible items = DFS from roots, respecting expandedIds + search filter
  const visibleItems = React.useMemo(() => {
    const out = [];
    const walk = (parentId, depth) => {
      const kids = childrenByParent.get(parentId) || [];
      for (const kid of kids) {
        // 검색어 있을 때: 자신 OR 자손이 매치하면 표시
        let selfMatch = matchesSearch(kid);
        let descendantMatch = false;
        if (searchLower && !selfMatch) {
          // 자손 검사
          const hasMatchingDescendant = (nid) => {
            const ch = childrenByParent.get(nid) || [];
            for (const c of ch) {
              if (matchesSearch(c)) return true;
              if (hasMatchingDescendant(c.id)) return true;
            }
            return false;
          };
          descendantMatch = hasMatchingDescendant(kid.id);
        }
        if (searchLower && !selfMatch && !descendantMatch) continue;
        out.push({ ...kid, __depth: depth });
        if (isExpanded(kid.id)) walk(kid.id, depth + 1);
      }
    };
    walk(null, 0);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayItems, childrenByParent, expandedIds, searchLower, autoExpandIds]);

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const expandAll = useCallback(() => {
    const all = new Set();
    displayItems.forEach((i) => {
      if ((childrenByParent.get(i.id) || []).length > 0) all.add(i.id);
    });
    setExpandedIds(all);
  }, [displayItems, childrenByParent]);

  const collapseAll = useCallback(() => setExpandedIds(new Set()), []);

  const expandableParentIds = useMemo(() => {
    const ids = [];
    displayItems.forEach((i) => {
      if ((childrenByParent.get(i.id) || []).length > 0) ids.push(i.id);
    });
    return ids;
  }, [displayItems, childrenByParent]);

  const isTreeFullyExpanded = useMemo(() => {
    if (expandableParentIds.length === 0) return false;
    return expandableParentIds.every((id) => expandedIds.has(id));
  }, [expandableParentIds, expandedIds]);

  const isTreeFullyCollapsed = expandedIds.size === 0;

  const toggleTreeExpandAll = useCallback(() => {
    if (isTreeFullyExpanded) collapseAll();
    else expandAll();
  }, [isTreeFullyExpanded, expandAll, collapseAll]);

  const categoryColumnDefinitions = useMemo(
    () => (collapsed
      ? semanticCategoryColumnDefinitionsCollapsed
      : semanticCategoryColumnDefinitionsFull),
    [collapsed],
  );

  const categoryStorageKey = useMemo(
    () => (collapsed
      ? `kl-admin-semantic-category-${type}-cols-collapsed-v1`
      : `kl-admin-semantic-category-${type}-cols-full-v3`),
    [type, collapsed],
  );

  const { columns: categoryColumns, startResize: categoryColumnStartResize } = useBasicTableColumnResize({
    definitions: categoryColumnDefinitions,
    storageKey: categoryStorageKey,
    enabled: true,
  });

  const renderCategoryCell = useCallback(({ column, row }) => {
    switch (column.id) {
      case 'nameEn': {
        const depth = row.__depth || 0;
        const expandable = hasChildren(row.id);
        const expanded = isExpanded(row.id);
        return (
          <span className="admin-semantic-name-cell-inner">
            <span
              onClick={(e) => { e.stopPropagation(); if (expandable) toggleExpand(row.id); }}
              className={`admin-semantic-tree-toggle ${expandable ? 'admin-semantic-tree-toggle--active' : 'admin-semantic-tree-toggle--inactive'}`}
            >
              {expandable && (expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />)}
            </span>
            <span className="admin-semantic-name-text">{row.nameEn}</span>
          </span>
        );
      }
      case 'code':
        return <span className="admin-code-mono">{formatTableCellText(row.code)}</span>;
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
            actions={[
              {
                kind: 'edit',
                onClick: () => openEdit(row),
                ariaLabel: `${row.nameEn} 수정`,
              },
              !collapsed && {
                kind: 'delete',
                onClick: () => handleDelete(row),
                ariaLabel: `${row.nameEn} 삭제`,
              },
            ].filter(Boolean)}
          />
        );
      default:
        return undefined;
    }
  }, [collapsed, handleDelete, hasChildren, isExpanded, openEdit, toggleExpand]);

  const getCategoryBodyCellProps = useCallback(({ column, row }) => {
    if (column.id === 'nameEn') {
      const depth = row.__depth || 0;
      return {
        style: {
          paddingLeft: `calc(var(--spacing-sm) + ${depth * 14}px)`,
        },
        className: 'admin-semantic-name-cell',
      };
    }
    if (column.id === 'nameKo') {
      return {
        className: 'admin-semantic-name-ko-cell',
      };
    }
    return undefined;
  }, [collapsed]);

  const handleCategoryRowClick = useCallback((_e, { row }) => {
    onSelectCategory?.(row);
  }, [onSelectCategory]);

  const getCategoryRowClassName = useCallback((row) => {
    const base = onSelectCategory ? 'admin-row-clickable' : '';
    if (selectedCategoryId != null && row.id === selectedCategoryId) {
      return base ? `${base} kl-table-row-selected` : 'kl-table-row-selected';
    }
    return base;
  }, [onSelectCategory, selectedCategoryId]);

  const toolbarMoreItems = useMemo(() => [
    {
      id: 'template',
      label: '양식',
      icon: <FileDown size={14} aria-hidden />,
      onClick: handleTemplate,
    },
    {
      id: 'export',
      label: '다운로드',
      icon: <Download size={14} aria-hidden />,
      onClick: handleExport,
    },
    {
      id: 'import',
      label: importing ? '업로드 중...' : '업로드',
      icon: <Upload size={14} aria-hidden />,
      onClick: handleImportClick,
      disabled: importing,
    },
  ], [importing, handleTemplate, handleExport, handleImportClick]);

  const tableAreaClass = [
    compact ? 'table-area kl-split-table-area' : 'table-area',
    collapsed
      ? 'admin-semantic-category-table-area--collapsed'
      : 'admin-semantic-category-table-area--expanded',
  ].filter(Boolean).join(' ');

  const tableArea = (
    <div className={tableAreaClass}>
      <div className="table-toolbar">
        <div className="toolbar-left">
          <span className="kl-table-toolbar-summary">
            {searchLower ? (
              <>
                검색 <strong>{visibleItems.length}</strong> / 전체 <strong>{displayItems.length}</strong>건
              </>
            ) : (
              <>
                총 <strong>{displayItems.length}</strong>건
              </>
            )}
            {activeListSource === 'mock' ? <span className="admin-semantic-mock-tag"> · 더미</span> : null}
          </span>
        </div>
        <div className="toolbar-right">
          <button type="button" className="kl-btn-outline-primary-sm" onClick={openCreate}>
            <Plus size={16} aria-hidden />
            추가
          </button>
          {expandableParentIds.length > 0 ? (
            <KlIconButton
              tooltip={isTreeFullyCollapsed ? '모두 펼침' : '모두 접음'}
              ariaLabel={isTreeFullyCollapsed ? '모두 펼침' : '모두 접음'}
              onClick={toggleTreeExpandAll}
              buttonClassName="kl-toolbar-btn kl-toolbar-btn--icon-only"
              stopPropagation={false}
              buttonProps={{ 'aria-pressed': !isTreeFullyCollapsed }}
            >
              {isTreeFullyCollapsed ? (
                <Maximize2 size={16} aria-hidden />
              ) : (
                <Minimize2 size={16} aria-hidden />
              )}
            </KlIconButton>
          ) : null}
          <KlIconButton
            tooltip="새로고침"
            ariaLabel="새로고침"
            onClick={refreshList}
            buttonClassName="kl-toolbar-btn kl-toolbar-btn--icon-only"
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
            onChange={handleImportFile}
          />
        </div>
      </div>
      <div className="table-toolbar table-toolbar--search">
        <div className="toolbar-left">
          <div className="search-area">
            <Search size={16} className="search-area-icon" aria-hidden />
            <input
              type="search"
              className="search-area-input"
              placeholder="카테고리 검색 (경로/영문/한글/코드)"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          {searchText ? (
            <KlIconButton
              tooltip="검색 초기화"
              ariaLabel="검색 초기화"
              onClick={() => setSearchText('')}
              buttonClassName="kl-toolbar-btn kl-toolbar-btn--icon-only"
              stopPropagation={false}
            >
              <X size={16} aria-hidden />
            </KlIconButton>
          ) : null}
        </div>
      </div>
      {showLoading ? (
        <div className="admin-semantic-loading" role="status">
          <div className="admin-spinner" aria-hidden />
          <span>불러오는 중...</span>
        </div>
      ) : (
        <div className="basic-table-shell">
          <BasicTable
            className={SEMANTIC_SPLIT_TABLE_CLASS}
            columns={categoryColumns}
            data={visibleItems}
            renderCell={renderCategoryCell}
            getBodyCellProps={getCategoryBodyCellProps}
            onRowClick={onSelectCategory ? handleCategoryRowClick : undefined}
            getRowClassName={onSelectCategory ? getCategoryRowClassName : undefined}
            rowAriaLabel={(row) => row.path || row.nameEn}
            onColumnResizeMouseDown={categoryColumnStartResize}
            emptyState={{ variant: searchLower ? 'search' : 'default' }}
          />
        </div>
      )}
    </div>
  );

  const editModal = (
    <BaseModal
      open={Boolean(editing)}
      title={editing?.id ? `${typeLabel} 카테고리 수정` : `${typeLabel} 카테고리 추가`}
      onClose={() => setEditing(null)}
      maxWidth={false}
      fullWidth={false}
      paperSx={semanticFormModalPaperSx}
      paperClassName={semanticFormModalPaperClassName}
      contentClassName="admin-semantic-edit-content kl-modal-form"
      actionsClassName="admin-semantic-modal-actions"
      actionsAlign="right"
      actions={(
        <>
          <Button variant="outlined" onClick={() => setEditing(null)}>취소</Button>
          <Button variant="contained" onClick={handleSave}>
            저장
          </Button>
        </>
      )}
    >
      {editing ? (
        <form className="admin-semantic-modal-form" onSubmit={(e) => e.preventDefault()}>
          <div className="admin-semantic-form-row">
            <label className="admin-semantic-form-row__label" htmlFor="semantic-cat-name-en">
              영문명 <span className="required-asterisk" aria-hidden="true">*</span>
            </label>
            <div className="admin-semantic-form-row__control">
              <input
                id="semantic-cat-name-en"
                type="text"
                value={editing.nameEn || ''}
                onChange={(e) => setEditing({ ...editing, nameEn: e.target.value })}
                placeholder="e.g. SkinType"
                autoComplete="off"
              />
            </div>
          </div>
          <div className="admin-semantic-form-row">
            <label className="admin-semantic-form-row__label" htmlFor="semantic-cat-name-ko">
              한글명 <span className="required-asterisk" aria-hidden="true">*</span>
            </label>
            <div className="admin-semantic-form-row__control">
              <input
                id="semantic-cat-name-ko"
                type="text"
                value={editing.nameKo || ''}
                onChange={(e) => setEditing({ ...editing, nameKo: e.target.value })}
                placeholder="예: 피부타입"
                autoComplete="off"
              />
            </div>
          </div>
          <div className="admin-semantic-form-row">
            <label className="admin-semantic-form-row__label" htmlFor="semantic-cat-code">
              코드
            </label>
            <div className="admin-semantic-form-row__control">
              <input
                id="semantic-cat-code"
                type="text"
                value={editing.code || ''}
                onChange={(e) => setEditing({ ...editing, code: e.target.value })}
                placeholder="e.g. skin-type"
                autoComplete="off"
              />
              <p className="admin-semantic-form-helper">비우면 영문명에서 자동 생성됩니다.</p>
            </div>
          </div>
          <div className="admin-semantic-form-row">
            <label className="admin-semantic-form-row__label" htmlFor="semantic-cat-parent">
              상위 카테고리
            </label>
            <div className="admin-semantic-form-row__control">
              <KlModalSelect
                id="semantic-cat-parent"
                placeholder="(루트 — 최상위)"
                value={editing.parentId != null ? String(editing.parentId) : ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    parentId: e.target.value ? Number(e.target.value) : null,
                  })
                }
                optionItems={displayItems
                  .filter((it) => it.id !== editing.id)
                  .map((it) => ({
                    value: it.id,
                    label: `${it.path || it.nameEn} — ${it.nameKo}`,
                  }))}
              />
            </div>
          </div>
          <div className="admin-semantic-form-row admin-semantic-form-row--start">
            <label className="admin-semantic-form-row__label" htmlFor="semantic-cat-description">
              설명
            </label>
            <div className="admin-semantic-form-row__control">
              <textarea
                id="semantic-cat-description"
                rows={3}
                value={editing.description || ''}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                placeholder="선택 사항"
              />
            </div>
          </div>
        </form>
      ) : null}
    </BaseModal>
  );

  if (compact) {
    return (
      <>
        {tableArea}
        {editModal}
      </>
    );
  }

  return (
    <div className="kl-page">
      <div className="kl-main-sticky-head">
        <AdminPageHeader
          icon={Layers}
          title={`${typeLabel} 카테고리 관리`}
          count={displayItems.length}
          subtitle={`${typeLabel} 카테고리를 계층 구조로 관리합니다 (ontology_category.type = ${type}).`}
        />
      </div>
      {tableArea}
      {editModal}
    </div>
  );
}

export default AdminSemanticCategoryPage;

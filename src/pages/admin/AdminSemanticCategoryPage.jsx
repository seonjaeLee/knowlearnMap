import React, { useState, useEffect, useRef } from 'react';
import { adminSemanticApi } from '../../services/api';
import { useAlert } from '../../context/AlertContext';
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  Save,
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
import './admin-common.css';

/**
 * 온톨로지 카테고리 관리 (V20260424 통합 이후).
 * type: OBJECT | RELATION | ACTION — 같은 테이블 다른 네임스페이스.
 * parent_id + path 로 계층 구조 표현 (path 는 DB 트리거로 자동 유지).
 */
function AdminSemanticCategoryPage({ compact = false, collapsed = false, type = 'OBJECT', onSelectCategory }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // { id?, nameEn, nameKo, code, parentId, description }
  const [importing, setImporting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const { showAlert, showConfirm } = useAlert();
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
      showAlert('목록 조회 실패: ' + (err?.message || '알 수 없는 오류'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [type]);

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
      showAlert('영문명과 한글명은 필수입니다.');
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
        showAlert('수정되었습니다.');
      } else {
        await adminSemanticApi.createCategory(body);
        showAlert('생성되었습니다.');
      }
      setEditing(null);
      fetchItems();
    } catch (err) {
      showAlert('저장 실패: ' + (err?.message || '알 수 없는 오류'));
    }
  };

  const handleDelete = async (item) => {
    const ok = await showConfirm(`"${item.nameEn} (${item.nameKo})" 카테고리를 삭제하시겠습니까?\n하위 카테고리는 parent_id=NULL 로 변경됩니다.`);
    if (!ok) return;
    try {
      await adminSemanticApi.deleteCategory(item.id);
      showAlert('삭제되었습니다.');
      fetchItems();
    } catch (err) {
      showAlert('삭제 실패: ' + (err?.message || '알 수 없는 오류'));
    }
  };

  const handleExport = async () => {
    try { await adminSemanticApi.exportCategories(type); }
    catch (err) { showAlert('다운로드 실패: ' + (err?.message || '알 수 없는 오류')); }
  };

  const handleTemplate = async () => {
    try { await adminSemanticApi.templateCategories(); }
    catch (err) { showAlert('양식 다운로드 실패: ' + (err?.message || '알 수 없는 오류')); }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const replace = await showConfirm(
      `"${file.name}" 을(를) 업로드합니다.\n\n기존 ${type} 카테고리를 전부 삭제하고 교체하시겠습니까?\n(취소하면 업데이트 + 추가 모드로 진행)`
    );
    try {
      setImporting(true);
      const result = await adminSemanticApi.importCategories(file, replace, type);
      showAlert(`가져오기 완료: ${result?.count ?? 0}건 처리`);
      fetchItems();
    } catch (err) {
      showAlert('가져오기 실패: ' + (err?.message || '알 수 없는 오류'));
    } finally {
      setImporting(false);
    }
  };

  const typeLabel = type === 'OBJECT' ? '객체' : type === 'RELATION' ? '관계' : '액션';

  // ─── 트리 구조 계산 ───
  const itemsById = React.useMemo(() => {
    const m = new Map();
    items.forEach((i) => m.set(i.id, i));
    return m;
  }, [items]);

  const childrenByParent = React.useMemo(() => {
    const m = new Map();
    items.forEach((i) => {
      const pid = i.parentId ?? null;
      if (!m.has(pid)) m.set(pid, []);
      m.get(pid).push(i);
    });
    // 각 그룹 내 path/name 기준 정렬
    m.forEach((arr) => arr.sort((a, b) => (a.path || a.nameEn).localeCompare(b.path || b.nameEn)));
    return m;
  }, [items]);

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
    items.forEach((it) => {
      if (matchesSearch(it)) {
        getAncestorIds(it.id).forEach((x) => out.add(x));
      }
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchLower, items]);

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
  }, [items, childrenByParent, expandedIds, searchLower, autoExpandIds]);

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const all = new Set();
    items.forEach((i) => { if (hasChildren(i.id)) all.add(i.id); });
    setExpandedIds(all);
  };
  const collapseAll = () => setExpandedIds(new Set());

  const actionsBar = (
    <div className="admin-semantic-actions-bar">
      <span className="admin-semantic-count">
        {searchLower ? `검색 ${visibleItems.length} / 전체 ${items.length}` : `총 ${items.length}개`} {typeLabel} 카테고리
      </span>
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="admin-btn admin-btn-sm" onClick={fetchItems} title="새로고침"><RotateCcw size={13} /></button>
        <button className="admin-btn admin-btn-sm" onClick={expandAll} title="모두 펼침"><Maximize2 size={13} /></button>
        <button className="admin-btn admin-btn-sm" onClick={collapseAll} title="모두 접음"><Minimize2 size={13} /></button>
        {!collapsed && (
          <>
            <button className="admin-btn admin-btn-sm" onClick={handleTemplate} title="양식"><FileDown size={13} /> 양식</button>
            <button className="admin-btn admin-btn-sm" onClick={handleExport} title="Excel 다운로드"><Download size={13} /> 다운로드</button>
            <button className="admin-btn admin-btn-sm" onClick={handleImportClick} disabled={importing} title="Excel 업로드">
              <Upload size={13} /> {importing ? '...' : '업로드'}
            </button>
          </>
        )}
        <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={openCreate}><Plus size={13} /> 추가</button>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleImportFile} />
      </div>
    </div>
  );

  const searchBar = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
      <Search size={13} style={{ color: '#94a3b8', marginLeft: 4 }} />
      <input
        className="admin-input"
        style={{ flex: 1, fontSize: 12, padding: '4px 8px' }}
        placeholder="카테고리 검색 (경로/영문/한글/코드)"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      {searchText && (
        <button className="admin-btn admin-btn-icon admin-btn-sm" onClick={() => setSearchText('')} title="검색 초기화">
          <X size={12} />
        </button>
      )}
    </div>
  );

  return (
    <div className={compact ? '' : 'admin-page'}>
      {!compact && (
        <AdminPageHeader
          icon={Layers}
          title={`${typeLabel} 카테고리 관리`}
          count={items.length}
          subtitle={`${typeLabel} 카테고리를 계층 구조로 관리합니다 (ontology_category.type = ${type}).`}
        />
      )}
      {actionsBar}
      {searchBar}
      {loading ? (
        <div className="admin-loading-state">
          <div className="admin-spinner" />
          <span>불러오는 중...</span>
        </div>
      ) : (
        <div className="admin-table-wrap" style={{ maxHeight: '62vh', overflowY: 'auto', overflowX: 'hidden' }}>
          <table className="admin-table">
            <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
              <tr>
                {!collapsed && <th style={{ width: 60 }}>ID</th>}
                <th>이름</th>
                <th>한글명</th>
                {!collapsed && <th>코드</th>}
                {!collapsed && <th>설명</th>}
                <th className="admin-col-actions">관리</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.length === 0 ? (
                <tr>
                  <td colSpan={collapsed ? 3 : 6}>
                    <div className="admin-empty-state" style={{ border: 'none', padding: '24px 0' }}>
                      <p className="admin-empty-state-title">
                        {searchLower ? '검색 결과 없음' : '등록된 카테고리가 없습니다'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleItems.map((item) => {
                  const depth = item.__depth || 0;
                  const expandable = hasChildren(item.id);
                  const expanded = isExpanded(item.id);
                  return (
                    <tr key={item.id} onClick={() => onSelectCategory?.(item)}
                        style={{ cursor: onSelectCategory ? 'pointer' : 'default' }}>
                      {!collapsed && <td className="admin-col-id">{item.id}</td>}
                      <td style={{
                        fontWeight: 500,
                        paddingLeft: 4 + depth * 14,
                        maxWidth: collapsed ? 180 : 'none',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: collapsed ? 'nowrap' : 'normal',
                      }} title={collapsed ? (item.path || item.nameEn) : undefined}>
                        <span
                          onClick={(e) => { e.stopPropagation(); if (expandable) toggleExpand(item.id); }}
                          style={{
                            display: 'inline-flex', alignItems: 'center',
                            width: 16, height: 16, marginRight: 2,
                            cursor: expandable ? 'pointer' : 'default',
                            color: expandable ? '#64748b' : 'transparent',
                          }}
                        >
                          {expandable && (expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />)}
                        </span>
                        {item.nameEn}
                      </td>
                      <td style={{
                        maxWidth: collapsed ? 120 : 'none',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: collapsed ? 'nowrap' : 'normal',
                      }}>{item.nameKo}</td>
                      {!collapsed && <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>{item.code || '-'}</td>}
                      {!collapsed && <td style={{ color: 'var(--admin-text-secondary)' }}>{item.description || '-'}</td>}
                      <td className="admin-col-actions" onClick={(e) => e.stopPropagation()}>
                        <button className="admin-btn admin-btn-icon" onClick={() => openEdit(item)} title="수정"><Pencil size={14} /></button>
                        {!collapsed && (
                          <button className="admin-btn admin-btn-icon admin-btn-danger-soft" onClick={() => handleDelete(item)} title="삭제" style={{ marginLeft: 4 }}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="admin-modal-overlay" onClick={() => setEditing(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editing.id ? `${typeLabel} 카테고리 수정` : `${typeLabel} 카테고리 추가`}
              </h3>
              <button className="admin-modal-close" onClick={() => setEditing(null)}><X size={18} /></button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-field">
                <label className="admin-field-label">영문명 (name_en) *</label>
                <input className="admin-input" value={editing.nameEn || ''}
                  onChange={(e) => setEditing({ ...editing, nameEn: e.target.value })}
                  placeholder="e.g. SkinType" />
              </div>
              <div className="admin-field">
                <label className="admin-field-label">한글명 (name_ko) *</label>
                <input className="admin-input" value={editing.nameKo || ''}
                  onChange={(e) => setEditing({ ...editing, nameKo: e.target.value })}
                  placeholder="예: 피부타입" />
              </div>
              <div className="admin-field">
                <label className="admin-field-label">코드 (code) — 비우면 name_en 에서 자동 생성</label>
                <input className="admin-input" value={editing.code || ''}
                  onChange={(e) => setEditing({ ...editing, code: e.target.value })}
                  placeholder="e.g. skin-type" />
              </div>
              <div className="admin-field">
                <label className="admin-field-label">상위 카테고리 (parent)</label>
                <select className="admin-input" value={editing.parentId ?? ''}
                  onChange={(e) => setEditing({ ...editing, parentId: e.target.value ? Number(e.target.value) : null })}>
                  <option value="">(루트 — 최상위)</option>
                  {items.filter((it) => it.id !== editing.id).map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.path || it.nameEn} — {it.nameKo}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-field">
                <label className="admin-field-label">설명</label>
                <textarea className="admin-textarea" rows={3} value={editing.description || ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  placeholder="선택 사항" />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn" onClick={() => setEditing(null)}>취소</button>
              <button className="admin-btn admin-btn-primary" onClick={handleSave}>
                <Save size={14} /> 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSemanticCategoryPage;

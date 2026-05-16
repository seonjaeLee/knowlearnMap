import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@mui/material';
import { adminSemanticApi } from '../../services/api';
import { useDialog } from '../../hooks/useDialog';
import {
  Link2, Plus, Pencil, Trash2, Download, Upload, RotateCcw, FileDown,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminSemanticCategoryPage from './AdminSemanticCategoryPage';
import BaseModal from '../../components/common/modal/BaseModal';
import KlModalSelect from '../../components/common/modal/KlModalSelect';
import './admin-common.css';

/**
 * 전체 시멘틱 관계 관리 — 좌(관계 카테고리 type=RELATION) + 우(관계 목록).
 * 카테고리 클릭 시 우측 목록을 해당 카테고리로 필터링.
 */
function AdminSemanticRelationPage({ compact = false }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // null = 전체
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [importing, setImporting] = useState(false);
  const [leftExpanded, setLeftExpanded] = useState(() => {
    const stored = localStorage.getItem('admin_semantic_relation_left_expanded');
    return stored === null ? true : stored !== 'false';
  });
  const { alert, confirm } = useDialog();
  const fileInputRef = useRef(null);

  const setLeftExpandedPersist = (val) => {
    setLeftExpanded(val);
    localStorage.setItem('admin_semantic_relation_left_expanded', String(val));
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const [rels, cats] = await Promise.all([
        adminSemanticApi.listRelations(),
        adminSemanticApi.listCategories('RELATION'),
      ]);
      setItems(Array.isArray(rels) ? rels : []);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      await alert('목록 조회 실패: ' + (err?.message || '알 수 없는 오류'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const filtered = selectedCategoryId == null
    ? items
    : items.filter((it) => (it.categoryId ?? null) === selectedCategoryId);

  const openCreate = () => setEditing({
    id: null, nameEn: '', nameKo: '',
    categoryId: selectedCategoryId, // 좌측 선택이 있으면 기본값
    description: '',
  });
  const openEdit = (item) => setEditing({
    id: item.id, nameEn: item.nameEn || '', nameKo: item.nameKo || '',
    categoryId: item.categoryId ?? null, description: item.description || '',
  });

  const handleSave = async () => {
    if (!editing.nameEn?.trim() || !editing.nameKo?.trim()) {
      await alert('영문명과 한글명은 필수입니다.');
      return;
    }
    try {
      const body = {
        nameEn: editing.nameEn.trim(),
        nameKo: editing.nameKo.trim(),
        categoryId: editing.categoryId || null,
        description: editing.description || null,
      };
      if (editing.id) {
        await adminSemanticApi.updateRelation(editing.id, body);
        await alert('수정되었습니다.');
      } else {
        await adminSemanticApi.createRelation(body);
        await alert('생성되었습니다.');
      }
      setEditing(null);
      fetchItems();
    } catch (err) {
      await alert('저장 실패: ' + (err?.message || '알 수 없는 오류'));
    }
  };

  const handleDelete = async (item) => {
    const ok = await confirm(`"${item.nameEn} (${item.nameKo})" 관계를 삭제하시겠습니까?`);
    if (!ok) return;
    try {
      await adminSemanticApi.deleteRelation(item.id);
      await alert('삭제되었습니다.');
      fetchItems();
    } catch (err) {
      await alert('삭제 실패: ' + (err?.message || '알 수 없는 오류'));
    }
  };

  const handleExport = async () => {
    try { await adminSemanticApi.exportRelations(); }
    catch (err) { await alert('다운로드 실패: ' + (err?.message || '알 수 없는 오류')); }
  };
  const handleTemplate = async () => {
    try { await adminSemanticApi.templateRelations(); }
    catch (err) { await alert('양식 다운로드 실패: ' + (err?.message || '알 수 없는 오류')); }
  };
  const handleImportClick = () => fileInputRef.current?.click();
  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const replace = await confirm(
      `"${file.name}" 을(를) 업로드합니다.\n\n기존 데이터를 전부 삭제하고 교체하시겠습니까?\n(취소하면 업데이트 + 추가)`
    );
    try {
      setImporting(true);
      const result = await adminSemanticApi.importRelations(file, replace);
      await alert(`가져오기 완료: ${result?.count ?? 0}건`);
      fetchItems();
    } catch (err) {
      await alert('가져오기 실패: ' + (err?.message || '알 수 없는 오류'));
    } finally {
      setImporting(false);
    }
  };

  const actionsBar = (
    <div className="admin-semantic-actions-bar">
      <span className="admin-semantic-count">
        {selectedCategoryId == null ? '전체' : categories.find(c => c.id === selectedCategoryId)?.nameEn}
        : <strong>{filtered.length}</strong>개 관계
      </span>
      <div className="admin-inline-actions">
        <button className="admin-btn admin-btn-sm" onClick={fetchItems} title="새로고침"><RotateCcw size={13} /></button>
        <button className="admin-btn admin-btn-sm" onClick={handleTemplate} title="양식"><FileDown size={13} /> 양식</button>
        <button className="admin-btn admin-btn-sm" onClick={handleExport} title="다운로드"><Download size={13} /> 다운로드</button>
        <button className="admin-btn admin-btn-sm" onClick={handleImportClick} disabled={importing}><Upload size={13} /> {importing ? '...' : '업로드'}</button>
        <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={openCreate}><Plus size={13} /> 추가</button>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="admin-hidden-file-input" onChange={handleImportFile} />
      </div>
    </div>
  );

  return (
    <div className={compact ? '' : 'kl-page'}>
      {!compact && (
        <div className="kl-main-sticky-head">
          <AdminPageHeader icon={Link2} title="관계 & 카테고리" count={items.length}
            subtitle="좌측에서 관계 카테고리를 선택해 우측 관계 목록을 필터링합니다." />
        </div>
      )}
      <div className="admin-semantic-split-layout">
        {/* 좌: 관계 카테고리 (type=RELATION) */}
        <div className="admin-semantic-left-panel" style={{
          flex: leftExpanded ? '0 0 58%' : '0 0 300px',
          maxWidth: leftExpanded ? '58%' : '300px',
          minWidth: leftExpanded ? 0 : 250,
        }}>
          <div className="admin-semantic-panel-head">
            <h4 className="admin-semantic-panel-title">
              {leftExpanded ? '관계 카테고리' : '카테고리'}
            </h4>
            <div className="admin-semantic-panel-head-actions">
              <button className="admin-btn admin-btn-sm"
                onClick={() => { setSelectedCategoryId(null); setLeftExpandedPersist(true); }}
                disabled={selectedCategoryId == null}
                title="필터 해제 + 펼침">전체</button>
              <button className="admin-btn admin-btn-sm"
                onClick={() => setLeftExpandedPersist(!leftExpanded)}
                title={leftExpanded ? '접기' : '펼치기'}>
                {leftExpanded ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
              </button>
            </div>
          </div>
          <AdminSemanticCategoryPage
            compact
            collapsed={!leftExpanded}
            type="RELATION"
            onSelectCategory={(c) => { setSelectedCategoryId(c.id); setLeftExpandedPersist(false); }} />
        </div>

        {/* 우: 관계 목록 */}
        <div className="admin-semantic-right-panel">
          {actionsBar}
          {loading ? (
            <div className="admin-loading-state"><div className="admin-spinner" /><span>불러오는 중...</span></div>
          ) : (
            <div className="admin-table-wrap admin-semantic-table-wrap">
              <table className="admin-table">
                <thead className="admin-sticky-head">
                  <tr>
                    <th className="admin-col-id-narrow">ID</th>
                    <th>영문명</th><th>한글명</th><th>카테고리</th><th>설명</th>
                    <th className="admin-col-actions">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6}><div className="admin-empty-state admin-empty-state-default"><p className="admin-empty-state-title">표시할 관계가 없습니다</p></div></td></tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item.id}>
                        <td className="admin-col-id">{item.id}</td>
                        <td className="admin-col-strong">{item.nameEn}</td>
                        <td>{item.nameKo}</td>
                        <td>{item.categoryNameEn
                          ? <span className="admin-badge admin-badge-info">{item.categoryNameEn}</span>
                          : <span className="admin-text-tertiary">-</span>}</td>
                        <td className="admin-text-secondary">{item.description || '-'}</td>
                        <td className="admin-col-actions">
                          <button className="admin-btn admin-btn-icon" onClick={() => openEdit(item)} title="수정"><Pencil size={14} /></button>
                          <button className="admin-btn admin-btn-icon admin-btn-danger-soft admin-action-gap-left" onClick={() => handleDelete(item)} title="삭제"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <BaseModal
        open={Boolean(editing)}
        title={editing?.id ? '관계 수정' : '관계 추가'}
        onClose={() => setEditing(null)}
        maxWidth="sm"
        contentClassName="admin-semantic-edit-content kl-modal-form"
        actions={(
          <>
            <Button variant="outlined" onClick={() => setEditing(null)}>취소</Button>
            <Button variant="contained" onClick={handleSave}>저장</Button>
          </>
        )}
      >
        {editing ? (
          <>
            <div className="admin-field">
              <label className="admin-field-label">영문명 <span className="required-asterisk" aria-hidden="true">*</span></label>
              <input className="admin-input" value={editing.nameEn || ''}
                onChange={(e) => setEditing({ ...editing, nameEn: e.target.value })} placeholder="e.g. BelongsTo" />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">한글명 <span className="required-asterisk" aria-hidden="true">*</span></label>
              <input className="admin-input" value={editing.nameKo || ''}
                onChange={(e) => setEditing({ ...editing, nameKo: e.target.value })} placeholder="예: 소속" />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">관계 카테고리</label>
              <KlModalSelect
                placeholder="(선택 안 함)"
                value={editing.categoryId != null ? String(editing.categoryId) : ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    categoryId: e.target.value ? Number(e.target.value) : null,
                  })
                }
                optionItems={categories.map((c) => ({
                  value: c.id,
                  label: `${c.path || c.nameEn} — ${c.nameKo}`,
                }))}
              />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">설명</label>
              <textarea className="admin-textarea" rows={3} value={editing.description || ''}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="선택 사항" />
            </div>
          </>
        ) : null}
      </BaseModal>
    </div>
  );
}

export default AdminSemanticRelationPage;

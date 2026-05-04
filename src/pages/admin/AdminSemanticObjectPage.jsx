import React, { useState, useEffect, useRef } from 'react';
import { adminSemanticApi } from '../../services/api';
import { useAlert } from '../../context/AlertContext';
import {
  Box, Plus, Pencil, Trash2, Save, X, Download, Upload, RotateCcw, FileDown,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminSemanticCategoryPage from './AdminSemanticCategoryPage';
import './admin-common.css';

/**
 * 전체 시멘틱 Object 관리 — 좌(객체 카테고리 type=OBJECT) + 우(객체 목록).
 */
function AdminSemanticObjectPage({ compact = false }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [importing, setImporting] = useState(false);
  // 좌측 카테고리 패널 접기 상태 — localStorage 연동
  const [leftExpanded, setLeftExpanded] = useState(() => {
    const stored = localStorage.getItem('admin_semantic_object_left_expanded');
    return stored === null ? true : stored !== 'false';
  });
  const { showAlert, showConfirm } = useAlert();
  const fileInputRef = useRef(null);

  const setLeftExpandedPersist = (val) => {
    setLeftExpanded(val);
    localStorage.setItem('admin_semantic_object_left_expanded', String(val));
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const [objs, cats] = await Promise.all([
        adminSemanticApi.listObjects(),
        adminSemanticApi.listCategories('OBJECT'),
      ]);
      setItems(Array.isArray(objs) ? objs : []);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      showAlert('목록 조회 실패: ' + (err?.message || '알 수 없는 오류'));
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
    categoryId: selectedCategoryId, description: '',
  });
  const openEdit = (item) => setEditing({
    id: item.id, nameEn: item.nameEn || '', nameKo: item.nameKo || '',
    categoryId: item.categoryId ?? null, description: item.description || '',
  });

  const handleSave = async () => {
    if (!editing.nameEn?.trim() || !editing.nameKo?.trim()) {
      showAlert('영문명과 한글명은 필수입니다.');
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
        await adminSemanticApi.updateObject(editing.id, body);
        showAlert('수정되었습니다.');
      } else {
        await adminSemanticApi.createObject(body);
        showAlert('생성되었습니다.');
      }
      setEditing(null);
      fetchItems();
    } catch (err) {
      showAlert('저장 실패: ' + (err?.message || '알 수 없는 오류'));
    }
  };

  const handleDelete = async (item) => {
    const ok = await showConfirm(`"${item.nameEn} (${item.nameKo})" Object 를 삭제하시겠습니까?`);
    if (!ok) return;
    try {
      await adminSemanticApi.deleteObject(item.id);
      showAlert('삭제되었습니다.');
      fetchItems();
    } catch (err) {
      showAlert('삭제 실패: ' + (err?.message || '알 수 없는 오류'));
    }
  };

  const handleExport = async () => {
    try { await adminSemanticApi.exportObjects(); }
    catch (err) { showAlert('다운로드 실패: ' + (err?.message || '알 수 없는 오류')); }
  };
  const handleTemplate = async () => {
    try { await adminSemanticApi.templateObjects(); }
    catch (err) { showAlert('양식 다운로드 실패: ' + (err?.message || '알 수 없는 오류')); }
  };
  const handleImportClick = () => fileInputRef.current?.click();
  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const replace = await showConfirm(
      `"${file.name}" 을(를) 업로드합니다.\n\n기존 데이터를 전부 삭제하고 교체하시겠습니까?\n(취소하면 업데이트 + 추가)`
    );
    try {
      setImporting(true);
      const result = await adminSemanticApi.importObjects(file, replace);
      showAlert(`가져오기 완료: ${result?.count ?? 0}건`);
      fetchItems();
    } catch (err) {
      showAlert('가져오기 실패: ' + (err?.message || '알 수 없는 오류'));
    } finally {
      setImporting(false);
    }
  };

  const actionsBar = (
    <div className="admin-semantic-actions-bar">
      <span className="admin-semantic-count">
        {selectedCategoryId == null ? '전체' : categories.find(c => c.id === selectedCategoryId)?.nameEn}
        : <strong>{filtered.length}</strong>개 Object
      </span>
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="admin-btn admin-btn-sm" onClick={fetchItems} title="새로고침"><RotateCcw size={13} /></button>
        <button className="admin-btn admin-btn-sm" onClick={handleTemplate} title="양식"><FileDown size={13} /> 양식</button>
        <button className="admin-btn admin-btn-sm" onClick={handleExport} title="다운로드"><Download size={13} /> 다운로드</button>
        <button className="admin-btn admin-btn-sm" onClick={handleImportClick} disabled={importing}><Upload size={13} /> {importing ? '...' : '업로드'}</button>
        <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={openCreate}><Plus size={13} /> 추가</button>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleImportFile} />
      </div>
    </div>
  );

  return (
    <div className={compact ? '' : 'admin-page'}>
      {!compact && (
        <AdminPageHeader icon={Box} title="객체 & 카테고리" count={items.length}
          subtitle="좌측에서 객체 카테고리(계층)를 선택해 우측 객체 목록을 필터링합니다." />
      )}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {/* 좌: 객체 카테고리 (type=OBJECT, 계층) */}
        <div style={{
          flex: leftExpanded ? '0 0 58%' : '0 0 300px',
          maxWidth: leftExpanded ? '58%' : '300px',
          minWidth: leftExpanded ? 0 : 250,
          borderRight: '1px solid #e2e8f0',
          paddingRight: 12,
          transition: 'flex-basis 0.2s ease, max-width 0.2s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h4 style={{ margin: 0, fontSize: 14 }}>
              {leftExpanded ? '객체 카테고리 (계층)' : '카테고리'}
            </h4>
            <div style={{ display: 'flex', gap: 4 }}>
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
            type="OBJECT"
            onSelectCategory={(c) => { setSelectedCategoryId(c.id); setLeftExpandedPersist(false); }} />
        </div>

        {/* 우: 객체 목록 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {actionsBar}
          {loading ? (
            <div className="admin-loading-state"><div className="admin-spinner" /><span>불러오는 중...</span></div>
          ) : (
            <div className="admin-table-wrap" style={{ maxHeight: '62vh', overflowY: 'auto' }}>
              <table className="admin-table">
                <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
                  <tr>
                    <th style={{ width: 60 }}>ID</th>
                    <th>영문명</th><th>한글명</th><th>카테고리</th><th>설명</th>
                    <th className="admin-col-actions">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6}><div className="admin-empty-state" style={{ border: 'none', padding: '32px 0' }}><p className="admin-empty-state-title">표시할 Object 가 없습니다</p></div></td></tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item.id}>
                        <td className="admin-col-id">{item.id}</td>
                        <td style={{ fontWeight: 500 }}>{item.nameEn}</td>
                        <td>{item.nameKo}</td>
                        <td>{item.categoryNameEn
                          ? <span className="admin-badge admin-badge-info">{item.categoryNameEn}</span>
                          : <span style={{ color: 'var(--admin-text-tertiary)' }}>-</span>}</td>
                        <td style={{ color: 'var(--admin-text-secondary)' }}>{item.description || '-'}</td>
                        <td className="admin-col-actions">
                          <button className="admin-btn admin-btn-icon" onClick={() => openEdit(item)} title="수정"><Pencil size={14} /></button>
                          <button className="admin-btn admin-btn-icon admin-btn-danger-soft" onClick={() => handleDelete(item)} title="삭제" style={{ marginLeft: 4 }}><Trash2 size={14} /></button>
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

      {editing && (
        <div className="admin-modal-overlay" onClick={() => setEditing(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{editing.id ? 'Object 수정' : 'Object 추가'}</h3>
              <button className="admin-modal-close" onClick={() => setEditing(null)}><X size={18} /></button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-field">
                <label className="admin-field-label">영문명 *</label>
                <input className="admin-input" value={editing.nameEn || ''}
                  onChange={(e) => setEditing({ ...editing, nameEn: e.target.value })} placeholder="e.g. PatientRecord" />
              </div>
              <div className="admin-field">
                <label className="admin-field-label">한글명 *</label>
                <input className="admin-input" value={editing.nameKo || ''}
                  onChange={(e) => setEditing({ ...editing, nameKo: e.target.value })} placeholder="예: 환자기록" />
              </div>
              <div className="admin-field">
                <label className="admin-field-label">객체 카테고리</label>
                <select className="admin-select" value={editing.categoryId ?? ''}
                  onChange={(e) => setEditing({ ...editing, categoryId: e.target.value ? Number(e.target.value) : null })}>
                  <option value="">(선택 안 함)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.path || c.nameEn} — {c.nameKo}</option>
                  ))}
                </select>
              </div>
              <div className="admin-field">
                <label className="admin-field-label">설명</label>
                <textarea className="admin-textarea" rows={3} value={editing.description || ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="선택 사항" />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn" onClick={() => setEditing(null)}>취소</button>
              <button className="admin-btn admin-btn-primary" onClick={handleSave}><Save size={14} /> 저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSemanticObjectPage;

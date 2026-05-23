import { useState, useEffect, useRef, useCallback } from 'react';
import { adminSemanticApi } from '../../../services/api';
import { semanticAdminMockStore } from '../../../services/semanticAdminMockStore';
import { isSemanticMockEnabled } from '../../../config/semanticMock';
import { useDialog } from '../../../hooks/useDialog';

const ENTITY_CONFIG = {
  object: {
    categoryType: 'OBJECT',
    entityLabel: 'Object',
    storageKey: 'kl-admin-semantic-object-v1',
    splitPanePercentKey: 'admin_semantic_object_split_percent',
    listMock: () => semanticAdminMockStore.listObjects(),
    listLive: () => adminSemanticApi.listObjects(),
    create: (body) => adminSemanticApi.createObject(body),
    update: (id, body) => adminSemanticApi.updateObject(id, body),
    remove: (id) => adminSemanticApi.deleteObject(id),
    exportFn: () => adminSemanticApi.exportObjects(),
    templateFn: () => adminSemanticApi.templateObjects(),
    importFn: (file, replace) => adminSemanticApi.importObjects(file, replace),
    mockKind: 'object',
  },
  relation: {
    categoryType: 'RELATION',
    entityLabel: '관계',
    storageKey: 'kl-admin-semantic-relation-v1',
    splitPanePercentKey: 'admin_semantic_relation_split_percent',
    listMock: () => semanticAdminMockStore.listRelations(),
    listLive: () => adminSemanticApi.listRelations(),
    create: (body) => adminSemanticApi.createRelation(body),
    update: (id, body) => adminSemanticApi.updateRelation(id, body),
    remove: (id) => adminSemanticApi.deleteRelation(id),
    exportFn: () => adminSemanticApi.exportRelations(),
    templateFn: () => adminSemanticApi.templateRelations(),
    importFn: (file, replace) => adminSemanticApi.importRelations(file, replace),
    mockKind: 'relation',
  },
  action: {
    categoryType: 'ACTION',
    entityLabel: 'Action',
    storageKey: 'kl-admin-semantic-action-v1',
    splitPanePercentKey: 'admin_semantic_action_split_percent',
    listMock: () => semanticAdminMockStore.listActions(),
    listLive: () => adminSemanticApi.listActions(),
    create: (body) => adminSemanticApi.createAction(body),
    update: (id, body) => adminSemanticApi.updateAction(id, body),
    remove: (id) => adminSemanticApi.deleteAction(id),
    exportFn: () => adminSemanticApi.exportActions(),
    templateFn: () => adminSemanticApi.templateActions(),
    importFn: (file, replace) => adminSemanticApi.importActions(file, replace),
    mockKind: 'action',
  },
};

export function useSemanticEntityAdmin(entityKey) {
  const config = ENTITY_CONFIG[entityKey];
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listSource, setListSource] = useState('live');
  const [editing, setEditing] = useState(null);
  const [importing, setImporting] = useState(false);
  /** 매 로딩·탭 진입 시 접힘(이름·한글명·관리). localStorage에 저장하지 않음 */
  const [leftExpanded, setLeftExpanded] = useState(false);
  const { alert, confirm } = useDialog();
  const fileInputRef = useRef(null);
  const usesMock = isSemanticMockEnabled || listSource === 'mock';

  const setLeftExpandedOnly = useCallback((val) => {
    setLeftExpanded(val);
  }, []);

  useEffect(() => {
    const legacyLeftExpandedKeys = [
      'admin_semantic_object_left_expanded',
      'admin_semantic_object_left_expanded_v2',
      'admin_semantic_relation_left_expanded',
      'admin_semantic_relation_left_expanded_v2',
      'admin_semantic_action_left_expanded',
      'admin_semantic_action_left_expanded_v2',
    ];
    try {
      legacyLeftExpandedKeys.forEach((key) => window.localStorage.removeItem(key));
    } catch {
      /* ignore */
    }
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    if (isSemanticMockEnabled) {
      setItems(config.listMock());
      setCategories(semanticAdminMockStore.listCategories(config.categoryType));
      setListSource('mock');
      setLoading(false);
      return;
    }
    try {
      const [entities, cats] = await Promise.all([
        config.listLive(),
        adminSemanticApi.listCategories(config.categoryType),
      ]);
      setItems(Array.isArray(entities) ? entities : []);
      setCategories(Array.isArray(cats) ? cats : []);
      setListSource('live');
    } catch (err) {
      setItems(config.listMock());
      setCategories(semanticAdminMockStore.listCategories(config.categoryType));
      setListSource('mock');
      await alert(`목록 조회 실패 — 더미 데이터를 표시합니다. ${err?.message || ''}`);
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = selectedCategoryId == null
    ? items
    : items.filter((it) => (it.categoryId ?? null) === selectedCategoryId);

  const openCreate = useCallback(() => {
    setEditing({
      id: null, nameEn: '', nameKo: '', categoryId: selectedCategoryId, description: '',
    });
  }, [selectedCategoryId]);

  const openEdit = useCallback((item) => {
    setEditing({
      id: item.id,
      nameEn: item.nameEn || '',
      nameKo: item.nameKo || '',
      categoryId: item.categoryId ?? null,
      description: item.description || '',
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!editing?.nameEn?.trim() || !editing?.nameKo?.trim()) {
      await alert('영문명과 한글명은 필수입니다.');
      return;
    }
    const body = {
      nameEn: editing.nameEn.trim(),
      nameKo: editing.nameKo.trim(),
      categoryId: editing.categoryId || null,
      description: editing.description?.trim() || null,
    };
    try {
      if (usesMock) {
        if (editing.id) semanticAdminMockStore.updateEntity(config.mockKind, editing.id, body);
        else semanticAdminMockStore.createEntity(config.mockKind, body);
        await alert(editing.id ? '수정되었습니다.' : '생성되었습니다.');
        setEditing(null);
        fetchItems();
        return;
      }
      if (editing.id) {
        await config.update(editing.id, body);
        await alert('수정되었습니다.');
      } else {
        await config.create(body);
        await alert('생성되었습니다.');
      }
      setEditing(null);
      fetchItems();
    } catch (err) {
      await alert(`저장 실패: ${err?.message || '알 수 없는 오류'}`);
    }
  }, [alert, config, editing, fetchItems, usesMock]);

  const handleDelete = useCallback(async (item) => {
    const ok = await confirm(
      `"${item.nameEn} (${item.nameKo})" ${config.entityLabel} 을(를) 삭제하시겠습니까?`
    );
    if (!ok) return;
    try {
      if (usesMock) {
        semanticAdminMockStore.deleteEntity(config.mockKind, item.id);
        await alert('삭제되었습니다.');
        fetchItems();
        return;
      }
      await config.remove(item.id);
      await alert('삭제되었습니다.');
      fetchItems();
    } catch (err) {
      await alert(`삭제 실패: ${err?.message || '알 수 없는 오류'}`);
    }
  }, [alert, config, confirm, fetchItems, usesMock]);

  const handleExport = useCallback(async () => {
    if (usesMock) { await alert('더미 모드에서는 Excel 다운로드를 사용할 수 없습니다.'); return; }
    try { await config.exportFn(); }
    catch (err) { await alert(`다운로드 실패: ${err?.message || '알 수 없는 오류'}`); }
  }, [alert, config, usesMock]);

  const handleTemplate = useCallback(async () => {
    if (usesMock) { await alert('더미 모드에서는 양식 다운로드를 사용할 수 없습니다.'); return; }
    try { await config.templateFn(); }
    catch (err) { await alert(`양식 다운로드 실패: ${err?.message || '알 수 없는 오류'}`); }
  }, [alert, config, usesMock]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImportFile = useCallback(async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (usesMock) { await alert('더미 모드에서는 Excel 업로드를 사용할 수 없습니다.'); return; }
    const replace = await confirm(
      `"${file.name}" 을(를) 업로드합니다.\n\n기존 데이터를 전부 삭제하고 교체하시겠습니까?\n(취소하면 업데이트 + 추가)`
    );
    try {
      setImporting(true);
      const result = await config.importFn(file, replace);
      await alert(`가져오기 완료: ${result?.count ?? 0}건`);
      fetchItems();
    } catch (err) {
      await alert(`가져오기 실패: ${err?.message || '알 수 없는 오류'}`);
    } finally {
      setImporting(false);
    }
  }, [alert, config, confirm, fetchItems, usesMock]);

  return {
    config,
    items,
    categories,
    filtered,
    selectedCategoryId,
    setSelectedCategoryId,
    loading,
    listSource,
    editing,
    setEditing,
    importing,
    leftExpanded,
    setLeftExpandedOnly,
    fileInputRef,
    fetchItems,
    openCreate,
    openEdit,
    handleSave,
    handleDelete,
    handleExport,
    handleTemplate,
    handleImportClick,
    handleImportFile,
  };
}

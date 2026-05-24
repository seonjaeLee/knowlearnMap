import {
  mockSemanticActionsSeed,
  mockSemanticCategoriesSeed,
  mockSemanticObjectsSeed,
  mockSemanticRelationsSeed,
} from '../data/semanticAdminMockData';

/**
 * @typedef {Object} SemanticCategory
 * @property {number} id
 * @property {'OBJECT'|'RELATION'|'ACTION'} type
 * @property {string} nameEn
 * @property {string} nameKo
 * @property {string|null} code
 * @property {number|null} parentId
 * @property {string} path
 * @property {string|null} [description]
 */

/**
 * @typedef {Object} SemanticEntity
 * @property {number} id
 * @property {string} nameEn
 * @property {string} nameKo
 * @property {number|null} [categoryId]
 * @property {string|null} [categoryNameEn]
 * @property {string|null} [description]
 */

let categories = [];
let objects = [];
let relations = [];
let actions = [];
let nextCategoryId = 1000;
let nextObjectId = 100;
let nextRelationId = 100;
let nextActionId = 100;
let initialized = false;

function cloneSeed() {
  categories = mockSemanticCategoriesSeed.map((row) => ({ ...row }));
  objects = mockSemanticObjectsSeed.map((row) => ({ ...row }));
  relations = mockSemanticRelationsSeed.map((row) => ({ ...row }));
  actions = mockSemanticActionsSeed.map((row) => ({ ...row }));
  const maxCat = Math.max(0, ...categories.map((c) => c.id));
  const maxObj = Math.max(0, ...objects.map((o) => o.id));
  const maxRel = Math.max(0, ...relations.map((r) => r.id));
  const maxAct = Math.max(0, ...actions.map((a) => a.id));
  nextCategoryId = maxCat + 1;
  nextObjectId = maxObj + 1;
  nextRelationId = maxRel + 1;
  nextActionId = maxAct + 1;
  initialized = true;
}

function ensureInit() {
  if (!initialized) cloneSeed();
}

function recomputePaths(type) {
  const list = categories.filter((c) => c.type === type);
  const byId = new Map(list.map((c) => [c.id, c]));
  const pathFor = (item, seen = new Set()) => {
    if (seen.has(item.id)) return item.nameEn;
    seen.add(item.id);
    if (item.parentId == null) return item.nameEn;
    const parent = byId.get(item.parentId);
    if (!parent) return item.nameEn;
    return `${pathFor(parent, seen)}/${item.nameEn}`;
  };
  list.forEach((c) => {
    c.path = pathFor(c);
  });
}

function categoryNameEn(categoryId) {
  if (categoryId == null) return null;
  const cat = categories.find((c) => c.id === categoryId);
  return cat ? (cat.path || cat.nameEn) : null;
}

function attachCategoryLabel(entity) {
  return {
    ...entity,
    categoryNameEn: categoryNameEn(entity.categoryId ?? null),
  };
}

function listByType(type) {
  ensureInit();
  return categories
    .filter((c) => c.type === type)
    .map((c) => ({ ...c }))
    .sort((a, b) => (a.path || a.nameEn).localeCompare(b.path || b.nameEn));
}

function getEntityList(kind) {
  ensureInit();
  if (kind === 'object') return objects.map((o) => attachCategoryLabel({ ...o }));
  if (kind === 'relation') return relations.map((r) => attachCategoryLabel({ ...r }));
  return actions.map((a) => attachCategoryLabel({ ...a }));
}

function nextIdFor(kind) {
  if (kind === 'object') return nextObjectId++;
  if (kind === 'relation') return nextRelationId++;
  return nextActionId++;
}

function entityArray(kind) {
  if (kind === 'object') return objects;
  if (kind === 'relation') return relations;
  return actions;
}

export const semanticAdminMockStore = {
  reset() {
    cloneSeed();
  },

  listCategories(type = 'OBJECT') {
    return listByType(type);
  },

  createCategory(body) {
    ensureInit();
    const row = {
      id: nextCategoryId++,
      type: body.type,
      nameEn: body.nameEn,
      nameKo: body.nameKo,
      code: body.code ?? null,
      parentId: body.parentId ?? null,
      path: body.nameEn,
      description: body.description ?? null,
    };
    categories.push(row);
    recomputePaths(body.type);
    return { ...categories.find((c) => c.id === row.id) };
  },

  updateCategory(id, body) {
    ensureInit();
    const idx = categories.findIndex((c) => c.id === id);
    if (idx < 0) throw new Error('카테고리를 찾을 수 없습니다.');
    const prev = categories[idx];
    categories[idx] = {
      ...prev,
      nameEn: body.nameEn ?? prev.nameEn,
      nameKo: body.nameKo ?? prev.nameKo,
      code: body.code !== undefined ? body.code : prev.code,
      parentId: body.parentId !== undefined ? body.parentId : prev.parentId,
      description: body.description !== undefined ? body.description : prev.description,
    };
    recomputePaths(prev.type);
    objects.forEach((o) => { o.categoryNameEn = categoryNameEn(o.categoryId); });
    relations.forEach((r) => { r.categoryNameEn = categoryNameEn(r.categoryId); });
    actions.forEach((a) => { a.categoryNameEn = categoryNameEn(a.categoryId); });
    return { ...categories[idx] };
  },

  deleteCategory(id) {
    ensureInit();
    const target = categories.find((c) => c.id === id);
    if (!target) return;
    categories = categories.filter((c) => c.id !== id);
    categories.forEach((c) => {
      if (c.parentId === id) c.parentId = null;
    });
    recomputePaths(target.type);
    const clearCat = (arr) => {
      arr.forEach((row) => {
        if (row.categoryId === id) {
          row.categoryId = null;
          row.categoryNameEn = null;
        }
      });
    };
    clearCat(objects);
    clearCat(relations);
    clearCat(actions);
  },

  listObjects() {
    return getEntityList('object');
  },

  listRelations() {
    return getEntityList('relation');
  },

  listActions() {
    return getEntityList('action');
  },

  createEntity(kind, body) {
    ensureInit();
    const row = {
      id: nextIdFor(kind),
      nameEn: body.nameEn,
      nameKo: body.nameKo,
      categoryId: body.categoryId ?? null,
      description: body.description ?? null,
      categoryNameEn: null,
    };
    row.categoryNameEn = categoryNameEn(row.categoryId);
    entityArray(kind).push(row);
    return { ...row };
  },

  updateEntity(kind, id, body) {
    ensureInit();
    const arr = entityArray(kind);
    const idx = arr.findIndex((r) => r.id === id);
    if (idx < 0) throw new Error('항목을 찾을 수 없습니다.');
    arr[idx] = {
      ...arr[idx],
      nameEn: body.nameEn ?? arr[idx].nameEn,
      nameKo: body.nameKo ?? arr[idx].nameKo,
      categoryId: body.categoryId !== undefined ? body.categoryId : arr[idx].categoryId,
      description: body.description !== undefined ? body.description : arr[idx].description,
    };
    arr[idx].categoryNameEn = categoryNameEn(arr[idx].categoryId);
    return { ...arr[idx] };
  },

  deleteEntity(kind, id) {
    ensureInit();
    const arr = entityArray(kind);
    const idx = arr.findIndex((r) => r.id === id);
    if (idx >= 0) arr.splice(idx, 1);
  },
};

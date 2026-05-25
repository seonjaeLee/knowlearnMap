import PropTypes from 'prop-types';
import { ChevronsLeft } from 'lucide-react';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import AdminSemanticCategoryPage from '../AdminSemanticCategoryPage';
import BaseModal from '../../../components/common/modal/BaseModal';
import { klFormModalPaperSx } from '../../../components/common/modal/klModalPaper';
import {
  KL_MODAL_FORM_ELEMENT_ID,
  KL_MODAL_FORM_STACK_CLASS,
  klModalFormContentClassName,
} from '../../../components/common/modal/klModalForm';
import SplitPane from '../../../components/common/SplitPane';
import KlIconButton from '../../../components/common/KlIconButton';
import SemanticEntityListPanel from './SemanticEntityListPanel';
import { useSemanticEntityAdmin } from './useSemanticEntityAdmin';
import { SEMANTIC_ENTITY_PAGE_LABELS } from './semanticEntityPageLabels';
import '../admin-common.css';
import '../AdminSemanticPage.css';

function SemanticEntitySplitPage({
  compact,
  entityKey,
  headerIcon: HeaderIcon,
}) {
  const labels = SEMANTIC_ENTITY_PAGE_LABELS[entityKey];
  const {
    headerTitle,
    headerSubtitle,
    splitLeftHeading,
    splitRightHeading,
    categoryFieldLabel,
  } = labels;
  const admin = useSemanticEntityAdmin(entityKey);
  const {
    config,
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
    items,
  } = admin;

  const rootClass = compact ? 'kl-subtab-panel' : 'kl-page';

  const leftPanel = (
    <>
      <div className="kl-split-panel-head">
        <h4 className="kl-split-panel-title">{splitLeftHeading}</h4>
        <div className="kl-split-panel-head-actions">
          <KlIconButton
            tooltip={leftExpanded ? '접기' : '펼치기'}
            ariaLabel={leftExpanded ? '접기' : '펼치기'}
            onClick={() => setLeftExpandedOnly(!leftExpanded)}
            buttonClassName={`kl-toolbar-icon-toggle${leftExpanded ? '' : ' is-collapsed'}`}
            stopPropagation={false}
          >
            <ChevronsLeft size={16} className="kl-toolbar-icon-toggle__icon" aria-hidden />
          </KlIconButton>
        </div>
      </div>
      <AdminSemanticCategoryPage
        compact
        collapsed={!leftExpanded}
        type={config.categoryType}
        sharedCategories={categories}
        sharedLoading={loading}
        sharedListSource={listSource}
        onSharedRefresh={fetchItems}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={(c) => {
          setSelectedCategoryId(c.id);
          setLeftExpandedOnly(false);
        }}
      />
    </>
  );

  const rightPanel = (
    <>
      <div className="kl-split-panel-head">
        <h4 className="kl-split-panel-title">{splitRightHeading}</h4>
      </div>
      <SemanticEntityListPanel
        entityLabel={config.entityLabel}
        items={filtered}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        loading={loading}
        listSource={listSource}
        importing={importing}
        onRefresh={fetchItems}
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={handleDelete}
        onTemplate={handleTemplate}
        onExport={handleExport}
        onImportClick={handleImportClick}
        fileInputRef={fileInputRef}
        onImportFile={handleImportFile}
        storageKey={config.storageKey}
        onClearCategoryFilter={() => {
          setSelectedCategoryId(null);
          setLeftExpandedOnly(true);
        }}
      />
    </>
  );

  return (
    <div className={rootClass}>
      {!compact && (
        <div className="kl-main-sticky-head">
          <AdminPageHeader
            icon={HeaderIcon}
            title={headerTitle}
            count={items.length}
            subtitle={headerSubtitle}
          />
        </div>
      )}
      <SplitPane
        className="admin-semantic-split-layout"
        left={leftPanel}
        right={rightPanel}
        leftCollapsed={!leftExpanded}
        defaultLeftPercent={45}
        minLeftPercent={20}
        maxLeftPercent={60}
        collapsedLeftWidthPx={300}
        minCollapsedLeftWidthPx={250}
        percentStorageKey={config.splitPanePercentKey}
        onResizeStart={() => {
          if (!leftExpanded) setLeftExpandedOnly(true);
        }}
        leftPaneClassName="admin-semantic-left-panel"
        rightPaneClassName="admin-semantic-right-panel"
        resizerAriaLabel="카테고리·목록 패널 너비 조절"
      />

      <BaseModal
        open={Boolean(editing)}
        title={editing?.id ? `${config.entityLabel} 수정` : `${config.entityLabel} 추가`}
        onClose={() => setEditing(null)}
        maxWidth={false}
        fullWidth={false}
        paperSx={klFormModalPaperSx}
        contentClassName={klModalFormContentClassName}
        actions={(
          <div className="kl-modal-actions-split">
            <div className="kl-modal-actions-split__left" aria-hidden="true" />
            <div className="kl-modal-actions-split__right">
              <button
                type="button"
                className="kl-btn gray-outline md"
                onClick={() => setEditing(null)}
              >
                취소
              </button>
              <button
                type="submit"
                className="kl-btn primary-full md"
                form={KL_MODAL_FORM_ELEMENT_ID}
              >
                저장
              </button>
            </div>
          </div>
        )}
      >
        {editing ? (
          <form
            id={KL_MODAL_FORM_ELEMENT_ID}
            className={KL_MODAL_FORM_STACK_CLASS}
            onSubmit={(e) => {
              e.preventDefault();
              void handleSave();
            }}
          >
            <div className="kl-modal-form-row">
              <label className="kl-modal-form-row__label" htmlFor={`semantic-${entityKey}-name-en`}>
                영문명 <span className="kl-modal-form-required" aria-hidden="true">*</span>
              </label>
              <div className="kl-modal-form-row__control">
                <input
                  id={`semantic-${entityKey}-name-en`}
                  type="text"
                  value={editing.nameEn || ''}
                  onChange={(e) => setEditing({ ...editing, nameEn: e.target.value })}
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="kl-modal-form-row">
              <label className="kl-modal-form-row__label" htmlFor={`semantic-${entityKey}-name-ko`}>
                한글명 <span className="kl-modal-form-required" aria-hidden="true">*</span>
              </label>
              <div className="kl-modal-form-row__control">
                <input
                  id={`semantic-${entityKey}-name-ko`}
                  type="text"
                  value={editing.nameKo || ''}
                  onChange={(e) => setEditing({ ...editing, nameKo: e.target.value })}
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="kl-modal-form-row">
              <label className="kl-modal-form-row__label" htmlFor={`semantic-${entityKey}-category`}>
                {categoryFieldLabel}
              </label>
              <div className="kl-modal-form-row__control">
                <select
                  id={`semantic-${entityKey}-category`}
                  value={editing.categoryId != null ? String(editing.categoryId) : ''}
                  onChange={(e) => setEditing({
                    ...editing,
                    categoryId: e.target.value ? Number(e.target.value) : null,
                  })}
                >
                  <option value="">(선택 안 함)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {`${c.path || c.nameEn} — ${c.nameKo}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="kl-modal-form-row kl-vert-start">
              <label className="kl-modal-form-row__label" htmlFor={`semantic-${entityKey}-description`}>
                설명
              </label>
              <div className="kl-modal-form-row__control">
                <textarea
                  id={`semantic-${entityKey}-description`}
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
    </div>
  );
}

SemanticEntitySplitPage.propTypes = {
  compact: PropTypes.bool,
  entityKey: PropTypes.oneOf(['object', 'relation', 'action']).isRequired,
  headerIcon: PropTypes.elementType.isRequired,
};

SemanticEntitySplitPage.defaultProps = {
  compact: false,
};

export default SemanticEntitySplitPage;

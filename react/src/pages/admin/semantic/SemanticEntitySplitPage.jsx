import PropTypes from 'prop-types';
import { Button } from '@mui/material';
import { ChevronsLeft } from 'lucide-react';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import AdminSemanticCategoryPage from '../AdminSemanticCategoryPage';
import BaseModal from '../../../components/common/modal/BaseModal';
import KlModalSelect from '../../../components/common/modal/KlModalSelect';
import {
  klFormModalPaperSx,
} from '../../../components/common/modal/klModalPaper';
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
        contentClassName="admin-semantic-edit-content kl-modal-form"
        actionsClassName="admin-semantic-modal-actions"
        actionsAlign="right"
        actions={(
          <>
            <Button variant="outlined" onClick={() => setEditing(null)}>취소</Button>
            <Button variant="contained" onClick={handleSave}>저장</Button>
          </>
        )}
      >
        {editing ? (
          <form className="admin-semantic-modal-form" onSubmit={(e) => e.preventDefault()}>
            <div className="admin-semantic-form-row">
              <label className="admin-semantic-form-row__label" htmlFor={`semantic-${entityKey}-name-en`}>
                영문명 <span className="required-asterisk" aria-hidden="true">*</span>
              </label>
              <div className="admin-semantic-form-row__control">
                <input
                  id={`semantic-${entityKey}-name-en`}
                  type="text"
                  value={editing.nameEn || ''}
                  onChange={(e) => setEditing({ ...editing, nameEn: e.target.value })}
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="admin-semantic-form-row">
              <label className="admin-semantic-form-row__label" htmlFor={`semantic-${entityKey}-name-ko`}>
                한글명 <span className="required-asterisk" aria-hidden="true">*</span>
              </label>
              <div className="admin-semantic-form-row__control">
                <input
                  id={`semantic-${entityKey}-name-ko`}
                  type="text"
                  value={editing.nameKo || ''}
                  onChange={(e) => setEditing({ ...editing, nameKo: e.target.value })}
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="admin-semantic-form-row">
              <label className="admin-semantic-form-row__label" htmlFor={`semantic-${entityKey}-category`}>
                {categoryFieldLabel}
              </label>
              <div className="admin-semantic-form-row__control">
                <KlModalSelect
                  id={`semantic-${entityKey}-category`}
                  placeholder="(선택 안 함)"
                  value={editing.categoryId != null ? String(editing.categoryId) : ''}
                  onChange={(e) => setEditing({
                    ...editing,
                    categoryId: e.target.value ? Number(e.target.value) : null,
                  })}
                  optionItems={categories.map((c) => ({
                    value: c.id,
                    label: `${c.path || c.nameEn} — ${c.nameKo}`,
                  }))}
                />
              </div>
            </div>
            <div className="admin-semantic-form-row admin-semantic-form-row--start">
              <label className="admin-semantic-form-row__label" htmlFor={`semantic-${entityKey}-description`}>
                설명
              </label>
              <div className="admin-semantic-form-row__control">
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

import React, { memo, useMemo } from 'react';
import {
  AlignLeft,
  Check,
  CircleAlert,
  CircleCheck,
  Clipboard,
  Copy,
  Expand,
  Maximize,
  Minimize2,
  ScanText,
} from 'lucide-react';
import KlTooltip from '../../../components/common/KlTooltip';
import KlTabBar from '../../../components/common/KlTabBar';
import { useCopyFeedback } from '../../../hooks/useCopyFeedback';
import './PromptEditTabs.css';

const TOOLBAR_BTN = 'kl-toolbar-btn kl-toolbar-btn--icon-only';
const ICON_SIZE = 16;
const ICON_STROKE = 1.9;

const PanelToolBtn = ({ tooltip, onClick, disabled, className = '', children }) => (
  <KlTooltip title={tooltip} placement="top" enterDelay={0} leaveDelay={60} variant="icon">
    <button
      type="button"
      className={`prompt-panel-tool-btn ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      aria-label={tooltip}
    >
      {children}
    </button>
  </KlTooltip>
);

const PromptEditTabs = memo(({
  activeTab,
  onTabChange,
  extractedVariables = [],
  promptContent,
  onPromptContentChange,
  variables = {},
  onVariableUpdate,
  onCheckVariables,
  disabled = false,
  showToolbar = false,
  isExpanded = false,
  onToggleExpand,
  customHeight,
  fillParent = false,
  variant = 'default',
  children,
}) => {
  const { copy, isCopied } = useCopyFeedback();
  const isDetail = variant === 'detail';
  const rootClass = [
    'prompt-edit-tabs',
    fillParent ? 'prompt-edit-tabs--fill' : '',
    isDetail ? 'prompt-edit-tabs--detail' : 'prompt-edit-tabs--default',
  ].filter(Boolean).join(' ');

  const handleCopy = () => {
    const text = activeTab === 0
      ? promptContent
      : (variables[extractedVariables[activeTab - 1]]?.content || '');
    copy(text);
  };

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();
    if (activeTab === 0) {
      onPromptContentChange(text);
    } else {
      const varKey = extractedVariables[activeTab - 1];
      onVariableUpdate(varKey, 'content', text);
    }
  };

  const handleClear = () => {
    if (activeTab === 0) {
      onPromptContentChange('');
    } else {
      const varKey = extractedVariables[activeTab - 1];
      onVariableUpdate(varKey, 'content', '');
    }
  };

  const renderDetailPanelTools = () => (
    <div className="prompt-panel__tools">
      <PanelToolBtn
        tooltip="변수 추출"
        className="prompt-panel-tool-btn--extract"
        onClick={onCheckVariables}
        disabled={disabled || activeTab !== 0}
      >
        <ScanText size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      </PanelToolBtn>
      <PanelToolBtn tooltip={isCopied() ? '복사됨' : '복사'} onClick={handleCopy} disabled={disabled} className={isCopied() ? 'is-copied' : ''}>
        {isCopied() ? <Check size={ICON_SIZE} strokeWidth={ICON_STROKE} /> : <Copy size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
      </PanelToolBtn>
      <PanelToolBtn tooltip="붙여넣기" onClick={handlePaste} disabled={disabled}>
        <Clipboard size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      </PanelToolBtn>
      <PanelToolBtn tooltip="내용 지우기" onClick={handleClear} disabled={disabled}>
        <AlignLeft size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      </PanelToolBtn>
      {onToggleExpand && (
        <PanelToolBtn
          tooltip={isExpanded ? '축소' : '전체화면'}
          onClick={onToggleExpand}
          disabled={disabled}
        >
          {isExpanded ? (
            <Minimize2 size={ICON_SIZE} strokeWidth={ICON_STROKE} />
          ) : (
            <Maximize size={ICON_SIZE} strokeWidth={ICON_STROKE} />
          )}
        </PanelToolBtn>
      )}
    </div>
  );

  const renderDefaultHeaderActions = () => (
    <div className="prompt-edit-default-toolbar__actions" id="toolbar-buttons-box">
      <KlTooltip title={isCopied() ? '복사됨' : '복사'} placement="top" enterDelay={0} leaveDelay={60} variant="icon">
        <button type="button" className={`${TOOLBAR_BTN}${isCopied() ? ' is-copied' : ''}`} onClick={handleCopy} disabled={disabled} aria-label="복사">
          {isCopied() ? <Check size={15} strokeWidth={1.75} /> : <Copy size={15} strokeWidth={1.75} />}
        </button>
      </KlTooltip>
      <KlTooltip title="붙여넣기" placement="top" enterDelay={0} leaveDelay={60} variant="icon">
        <button type="button" className={TOOLBAR_BTN} onClick={handlePaste} disabled={disabled} aria-label="붙여넣기">
          <Clipboard size={15} strokeWidth={1.75} />
        </button>
      </KlTooltip>
      <KlTooltip title="내용 지우기" placement="top" enterDelay={0} leaveDelay={60} variant="icon">
        <button type="button" className={TOOLBAR_BTN} onClick={handleClear} disabled={disabled} aria-label="내용 지우기">
          <AlignLeft size={15} strokeWidth={1.75} />
        </button>
      </KlTooltip>
      {onToggleExpand && (
        <KlTooltip title={isExpanded ? '축소' : '확장'} placement="top" enterDelay={0} leaveDelay={60} variant="icon">
          <button type="button" className={TOOLBAR_BTN} onClick={onToggleExpand} disabled={disabled} aria-label={isExpanded ? '에디터 축소' : '에디터 확장'}>
            {isExpanded ? <Minimize2 size={15} strokeWidth={1.75} /> : <Expand size={15} strokeWidth={1.75} />}
          </button>
        </KlTooltip>
      )}
    </div>
  );

  const paneStyle = !fillParent && customHeight ? { height: customHeight } : undefined;
  const paneClassName = [
    'prompt-edit-tabs__pane',
    fillParent ? 'prompt-edit-tabs__pane--fill' : '',
    !fillParent && (showToolbar || customHeight) ? 'prompt-edit-tabs__pane--fixed' : '',
  ].filter(Boolean).join(' ');

  const renderDefaultPane = (value, onChange, placeholder, id) => (
    <div className={paneClassName} id={id} style={paneStyle}>
      <textarea
        id={`${id}-textarea`}
        className={[
          'prompt-edit-native-textarea',
          fillParent ? 'prompt-edit-native-textarea--fill' : '',
        ].filter(Boolean).join(' ')}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        spellCheck={false}
        rows={fillParent || showToolbar ? undefined : 20}
      />
    </div>
  );

  const renderVarBubbleIcon = (filled, selected) => {
    if (selected) return <Check size={11} strokeWidth={2.5} aria-hidden />;
    if (filled) return <CircleCheck size={11} strokeWidth={2} aria-hidden />;
    return <CircleAlert size={11} strokeWidth={2} aria-hidden />;
  };

  const detailTabs = useMemo(() => {
    const tabs = [{ id: 0, label: '프롬프트 편집', disabled }];
    extractedVariables.forEach((varKey, index) => {
      const tabIndex = index + 1;
      const filled = Boolean(variables[varKey]?.content);
      tabs.push({
        id: tabIndex,
        label: varKey,
        disabled,
        className: [
          'kl-tab-bar__tab--bubble',
          filled ? 'kl-tab-bar__tab--bubble-filled' : 'kl-tab-bar__tab--bubble-empty',
        ].join(' '),
        icon: (
          <span className="kl-tab-bar__tab-bubble-mark">
            {renderVarBubbleIcon(filled, activeTab === tabIndex)}
          </span>
        ),
      });
    });
    return tabs;
  }, [extractedVariables, variables, disabled, activeTab]);

  const defaultTabs = useMemo(() => {
    const tabs = [{ id: 0, label: '프롬프트 편집', disabled }];
    extractedVariables.forEach((varKey, index) => {
      const tabIndex = index + 1;
      const isMissing = !variables[varKey]?.content;
      const label = variables[varKey]?.label
        ? `${variables[varKey].label} (${varKey})`
        : varKey;
      tabs.push({
        id: tabIndex,
        label,
        disabled,
        className: isMissing ? 'kl-tab-bar__tab--error' : '',
      });
    });
    return tabs;
  }, [extractedVariables, variables, disabled]);

  const promptPlaceholder = showToolbar
    ? '프롬프트 내용을 입력하세요\n\n예시:\nYou are a document chunking assistant.\nSplit the following document into chunks based on the rule: {{rule}}.\nLanguage: {{lang}}.\nMax length per chunk: {{max_length}} characters.'
    : '프롬프트 내용을 입력하세요…';

  const currentValue = activeTab === 0
    ? promptContent
    : (variables[extractedVariables[activeTab - 1]]?.content || '');

  const currentOnChange = activeTab === 0
    ? (e) => onPromptContentChange(e.target.value)
    : (e) => onVariableUpdate(extractedVariables[activeTab - 1], 'content', e.target.value);

  const currentPlaceholder = activeTab === 0
    ? promptPlaceholder
    : `${extractedVariables[activeTab - 1]} 변수의 내용을 입력하세요`;

  if (isDetail) {
    return (
      <div id="prompt-edit-tabs-root" className={rootClass}>
        <div className="prompt-panel">
          <div className="prompt-panel__head">
            <KlTabBar
              variant="panel"
              className="prompt-panel__head-tabs"
              ariaLabel="프롬프트·변수 편집"
              tabs={detailTabs}
              value={activeTab}
              onChange={onTabChange}
              scrollTail={extractedVariables.length > 0}
              scrollTailAfterIndex={0}
              scrollFade
              scrollNav
            />
            {showToolbar ? renderDetailPanelTools() : null}
          </div>
          <div className="editor-body">
            <div className="prompt-area-wrap">
              <textarea
                id="prompt-content-textarea-box-textarea"
                className="prompt-area"
                value={currentValue}
                onChange={currentOnChange}
                disabled={disabled}
                placeholder={currentPlaceholder}
                spellCheck={false}
              />
            </div>
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="prompt-edit-tabs-root" className={rootClass}>
      <div className="prompt-edit-default-toolbar" id="tabs-toolbar-header">
        <KlTabBar
          variant="compact"
          ariaLabel="프롬프트·변수 편집"
          tabs={defaultTabs}
          value={activeTab}
          onChange={onTabChange}
          scrollable
          actions={showToolbar ? renderDefaultHeaderActions() : null}
        />
      </div>

      <div className="prompt-edit-tabs__body">
        {activeTab === 0 && renderDefaultPane(
          promptContent,
          (e) => onPromptContentChange(e.target.value),
          promptPlaceholder,
          'prompt-content-textarea-box',
        )}

        {extractedVariables.map((varKey, index) => (
          activeTab === index + 1 && renderDefaultPane(
            variables[varKey]?.content || '',
            (e) => onVariableUpdate(varKey, 'content', e.target.value),
            `${varKey} 변수의 내용을 입력하세요`,
            `variable-textarea-box-${varKey}`,
          )
        ))}
      </div>

      {children && activeTab === 0 ? (
        <div className="prompt-edit-tabs__children">{children}</div>
      ) : null}
    </div>
  );
});

PromptEditTabs.displayName = 'PromptEditTabs';

export default PromptEditTabs;

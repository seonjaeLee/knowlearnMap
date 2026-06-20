import React, {
  forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Save } from 'lucide-react';
import { useAlert } from '../../../context/AlertContext';
import BaseModal from '../../../components/common/modal/BaseModal';
import SplitPane from '../../../components/common/SplitPane';
import PromptEditTabs from '../common/PromptEditTabs';
import PromptFormDialog from '../prompts/PromptFormDialog';
import TestTab from '../test/TestTab';
import VersionHistoryPanel from '../common/VersionHistoryPanel';
import { extractVariables } from '../../utils/variableParser';
import { useCreateVersion, useUpdateVersion, usePublishVersion, useDeleteVersion } from '../../hooks/useVersions';
import './PromptEditor.css';

const EditorTab = forwardRef(({
  promptCode,
  promptName = '',
  securityLevel = 'PUBLIC',
  versions = [],
  activeVersion,
  variableSchemas = [],
  onEditorStateChange,
  onOpenTest,
  promptsBasePath = '/prompts',
}, ref) => {
  const isMasked = securityLevel === 'TOP_SECRET' && activeVersion?.content === '********';
  const [selectedVersion, setSelectedVersion] = useState(activeVersion?.id);
  const [content, setContent] = useState(activeVersion?.content || '');
  const [notes, setNotes] = useState('');
  const [validation, setValidation] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [variables, setVariables] = useState({});
  const [extractedVariables, setExtractedVariables] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [versionPanelExpanded, setVersionPanelExpanded] = useState(true);
  const [testOpen, setTestOpen] = useState(false);
  const [testRunState, setTestRunState] = useState({ loading: false, disabled: true });
  const testTabRef = useRef(null);

  const handleTestRunStateChange = useCallback((next) => {
    setTestRunState((prev) => (
      prev.loading === next.loading && prev.disabled === next.disabled ? prev : next
    ));
  }, []);

  const closeTestModal = useCallback(() => {
    setTestOpen(false);
    setTestRunState({ loading: false, disabled: true });
  }, []);

  const navigate = useNavigate();
  const { showAlert, showConfirm } = useAlert();
  const createVersion = useCreateVersion();
  const updateVersion = useUpdateVersion();
  const publishVersion = usePublishVersion();
  const deleteVersion = useDeleteVersion();

  const selectedVersionObj = versions.find((v) => v.id === selectedVersion);

  useEffect(() => {
    if (activeVersion) {
      setSelectedVersion(activeVersion.id);
      setContent(activeVersion.content || '');
      setNotes(activeVersion.notes || '');

      if (activeVersion.variableSchema) {
        const varKeys = activeVersion.variableSchema.map((v) => v.key);
        setExtractedVariables(varKeys);

        const varsObj = {};
        activeVersion.variableSchema.forEach((v) => {
          varsObj[v.key] = {
            type: v.type,
            required: v.required,
            defaultValue: v.defaultValue,
            description: v.description,
            content: v.content || '',
            editable: v.editable ?? false,
            label: v.label || '',
          };
        });
        setVariables(varsObj);
      }
    }
  }, [activeVersion]);

  useEffect(() => {
    if (activeTab > extractedVariables.length) {
      setActiveTab(0);
    }
  }, [extractedVariables.length, activeTab]);

  useEffect(() => {
    if (content) {
      const usedVars = extractVariables(content);
      const missing = usedVars.filter((v) => !extractedVariables.includes(v));
      const unused = extractedVariables.filter((v) => !usedVars.includes(v));
      setValidation({
        valid: missing.length === 0,
        usedVars,
        definedVars: extractedVariables,
        missing,
        unused,
      });
    } else {
      setValidation(null);
    }
  }, [content, extractedVariables]);

  useEffect(() => {
    if (selectedVersion && versions.length > 0) {
      const version = versions.find((v) => v.id === selectedVersion);
      if (version) {
        setNotes(version.notes || '');

        if (version.variableSchema) {
          const varKeys = version.variableSchema.map((v) => v.key);
          setExtractedVariables(varKeys);

          const varsObj = {};
          version.variableSchema.forEach((v) => {
            varsObj[v.key] = {
              type: v.type,
              required: v.required,
              defaultValue: v.defaultValue,
              description: v.description,
              content: v.content || '',
              editable: v.editable ?? false,
              label: v.label || '',
            };
          });
          setVariables(varsObj);
        }
      }
    }
  }, [selectedVersion, versions]);

  useEffect(() => {
    onEditorStateChange?.({
      selectedVersionId: selectedVersion,
      selectedVersion: selectedVersionObj,
      validation,
    });
  }, [selectedVersion, selectedVersionObj, validation, onEditorStateChange]);

  const handleCheckVariables = () => {
    const found = extractVariables(content);

    setExtractedVariables(found);
    setVariables((prev) => {
      const next = {};
      found.forEach((key) => {
        next[key] = prev[key] ?? {
          type: 'string',
          required: true,
          defaultValue: '',
          description: '',
          content: '',
          editable: false,
          label: '',
        };
      });
      return next;
    });

    if (found.length > 0) {
      setActiveTab(0);
    }
  };

  const handleUpdateVariable = (key, field, value) => {
    setVariables((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedVersion) {
      showAlert('버전을 선택해주세요.');
      return;
    }

    const version = versions.find((v) => v.id === selectedVersion);
    if (!version) {
      showAlert('선택한 버전을 찾을 수 없습니다.');
      return;
    }

    try {
      const variablesArray = extractedVariables.map((key) => ({
        key,
        type: variables[key]?.type || 'string',
        required: variables[key]?.required ?? true,
        defaultValue: variables[key]?.defaultValue || '',
        description: variables[key]?.description || '',
        content: variables[key]?.content || '',
        editable: variables[key]?.editable ?? false,
        label: variables[key]?.label || '',
      }));

      await updateVersion.mutateAsync({
        code: promptCode,
        versionId: selectedVersion,
        data: {
          content,
          variableSchema: variablesArray,
          notes: notes || '',
        },
      });

      showAlert(`버전 ${version.version}이(가) 저장되었습니다.`);
    } catch (error) {
      console.error('Failed to save version:', error);
      const status = error?.response?.status;
      if (status === 404) {
        showAlert(`프롬프트 "${promptCode}"가 DB에 존재하지 않습니다. 프롬프트를 먼저 생성해주세요.`);
      } else {
        showAlert('버전 저장에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  const handlePublish = async () => {
    if (!selectedVersion) {
      showAlert('버전을 선택해주세요.');
      return;
    }

    const version = versions.find((v) => v.id === selectedVersion);
    if (!version) {
      showAlert('선택한 버전을 찾을 수 없습니다.');
      return;
    }

    let confirmMsg = `버전 ${version.version}을(를) 활성화하시겠습니까?`;
    if (validation?.missing?.length > 0) {
      confirmMsg = `미정의 변수(${validation.missing.join(', ')})가 있습니다.\n그래도 버전 ${version.version}을(를) 활성화하시겠습니까?`;
    }

    const confirmed = await showConfirm(confirmMsg);
    if (confirmed) {
      try {
        await publishVersion.mutateAsync({
          code: promptCode,
          versionId: selectedVersion,
          data: {},
        });
        showAlert('버전이 활성화되었습니다.');
      } catch (error) {
        console.error('Failed to publish version:', error);
        showAlert('버전 활성화에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  useImperativeHandle(ref, () => ({
    publish: handlePublish,
    save: handleSave,
  }));

  const compareVersions = (v1, v2) => {
    const num1 = typeof v1 === 'number' ? v1 : parseInt(v1, 10);
    const num2 = typeof v2 === 'number' ? v2 : parseInt(v2, 10);

    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
    return 0;
  };

  const handleVersionChange = (newVersionId, newContent) => {
    setSelectedVersion(newVersionId);
    setContent(newContent);
    setActiveTab(0);
  };

  const handleCopyVersion = async (version) => {
    try {
      const maxVersion = Math.max(
        ...versions.map((v) => (typeof v.version === 'number' ? v.version : parseInt(v.version, 10))),
      );
      const nextVersion = maxVersion + 1;

      const variablesArray = version.variableSchema?.map((v) => ({
        key: v.key,
        type: v.type || 'string',
        required: v.required ?? true,
        defaultValue: v.defaultValue || '',
        description: v.description || '',
        content: v.content || '',
      })) || [];

      await createVersion.mutateAsync({
        code: promptCode,
        data: {
          content: version.content,
          version: String(nextVersion),
          variableSchema: variablesArray,
          notes: `버전 ${version.version}에서 복사됨`,
          status: 'draft',
        },
      });

      showAlert(`버전 ${nextVersion}이(가) 생성되었습니다.`);
    } catch (error) {
      console.error('Failed to copy version:', error);
      showAlert('버전 복사에 실패했습니다.');
    }
  };

  const handleDeleteVersion = async (versionId) => {
    const isLastVersion = versions.length === 1;

    try {
      await deleteVersion.mutateAsync({
        code: promptCode,
        versionId,
      });

      if (isLastVersion) {
        showAlert('프롬프트가 삭제되었습니다.');
        navigate(promptsBasePath);
        return;
      }

      if (selectedVersion === versionId && activeVersion) {
        setSelectedVersion(activeVersion.id);
        setContent(activeVersion.content || '');
      }

      showAlert('버전이 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to delete version:', error);
      showAlert('버전 삭제에 실패했습니다.');
    }
  };

  const openTest = () => {
    if (onOpenTest) {
      onOpenTest();
    } else {
      setTestOpen(true);
    }
  };

  const leftPanel = (
    <VersionHistoryPanel
      promptName={promptName || promptCode}
      versions={versions}
      selectedVersion={selectedVersion}
      onVersionChange={handleVersionChange}
      onCopyVersion={handleCopyVersion}
      onDeleteVersion={handleDeleteVersion}
      compareVersions={compareVersions}
      collapsed={!versionPanelExpanded}
      onToggleCollapse={(next) => setVersionPanelExpanded(!next)}
    />
  );

  const rightPanel = (
    <div className="prompt-panel-wrap">
      {isMasked ? (
        <div className="prompt-panel prompt-editor-masked">
          <span aria-hidden style={{ fontSize: '48px' }}>🔒</span>
          <p className="prompt-editor-masked__title">극비 프롬프트</p>
          <p>이 프롬프트는 극비 등급입니다. SYSOP 권한으로 로그인해야 열람 및 수정이 가능합니다.</p>
        </div>
      ) : (
        <PromptEditTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          extractedVariables={extractedVariables}
          promptContent={content}
          onPromptContentChange={setContent}
          variables={variables}
          onVariableUpdate={handleUpdateVariable}
          onCheckVariables={handleCheckVariables}
          disabled={false}
          showToolbar
          fillParent
          variant="detail"
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
        >
          <label className="deploy-input__label" htmlFor="prompt-deployment-notes">
            배포내용 설명
          </label>
          <input
            id="prompt-deployment-notes"
            type="text"
            className="deploy-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={`배포내용 설명(버전 : ${selectedVersionObj?.version ?? '-'})`}
          />
          <div className="editor-actions">
            <button type="button" className="editor-actions__outline" onClick={handleSave}>
              <Save size={17} strokeWidth={1.9} aria-hidden />
              저장 (DRAFT)
            </button>
            <button type="button" className="editor-actions__primary" onClick={openTest}>
              <Play size={17} strokeWidth={2.2} aria-hidden />
              테스트
            </button>
          </div>
        </PromptEditTabs>
      )}
    </div>
  );

  return (
    <div className={`kl-subtab-panel prompt-editor-root ${isExpanded ? 'is-expanded' : ''}`}>
      <SplitPane
        className="prompt-detail-split"
        left={leftPanel}
        right={rightPanel}
        leftCollapsed={!versionPanelExpanded}
        defaultLeftPercent={28}
        minLeftPercent={20}
        maxLeftPercent={60}
        collapsedLeftWidthPx={300}
        minCollapsedLeftWidthPx={260}
        percentStorageKey="km-prompt-detail-split-v2"
        onResizeStart={() => {
          if (!versionPanelExpanded) setVersionPanelExpanded(true);
        }}
        leftPaneClassName="prompt-detail-left-panel"
        rightPaneClassName="prompt-detail-right-panel"
        resizerAriaLabel="버전 히스토리·에디터 패널 너비 조절"
      />

      <PromptFormDialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setDialogData(null);
        }}
        initialData={dialogData}
        mode="edit"
      />

      {testOpen ? (
        <BaseModal
          open={testOpen}
          onClose={closeTestModal}
          title="프롬프트 테스트"
          maxWidth="lg"
          fullWidth
          actions={(
            <div className="kl-modal-actions-split">
              <div className="kl-modal-actions-split__left" aria-hidden="true" />
              <div className="kl-modal-actions-split__right">
                <button
                  type="button"
                  className="kl-btn primary-full md"
                  onClick={() => testTabRef.current?.runTest()}
                  disabled={testRunState.loading || testRunState.disabled}
                >
                  {testRunState.loading
                    ? <span className="spinner pt-spinner" aria-hidden />
                    : <Play size={15} aria-hidden />}
                  {testRunState.loading ? '실행 중...' : 'API 호출 테스트'}
                </button>
              </div>
            </div>
          )}
        >
          <TestTab
            ref={testTabRef}
            hideRunButton
            onRunStateChange={handleTestRunStateChange}
            promptCode={promptCode}
            versions={versions}
            variableSchemas={variableSchemas}
          />
        </BaseModal>
      ) : null}
    </div>
  );
});

EditorTab.displayName = 'EditorTab';

export default EditorTab;

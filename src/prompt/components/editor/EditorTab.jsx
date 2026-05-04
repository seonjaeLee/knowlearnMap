import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../../../context/AlertContext';
import {
  Box,
  Paper,
  TextField,
  Button,
} from '@mui/material';
import {
  Save as SaveIcon,
  Publish as PublishIcon,
} from '@mui/icons-material';
import { extractVariables, validateVariables } from '../../utils/variableParser';
//import VariableSchemaPanel from './VariableSchemaPanel';
import PromptFormDialog from '../prompts/PromptFormDialog';
import PromptEditTabs from '../common/PromptEditTabs';
import VersionHistoryPanel from '../common/VersionHistoryPanel';
import { useCreateVersion, useUpdateVersion, usePublishVersion, useDeleteVersion } from '../../hooks/useVersions';

const EditorTab = ({
  promptCode,
  promptName = '',
  promptDescription = '',
  securityLevel = 'PUBLIC',
  versions = [],
  activeVersion,
  variableSchemas = [],
  onSave,
  onPublish
}) => {
  // TOP_SECRET 마스킹 여부 (content가 ******** 이면 마스킹됨)
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

  const navigate = useNavigate();
  const { showAlert, showConfirm } = useAlert();
  const createVersion = useCreateVersion();
  const updateVersion = useUpdateVersion();
  const publishVersion = usePublishVersion();
  const deleteVersion = useDeleteVersion();

  // activeVersion 초기 로드
  useEffect(() => {
    if (activeVersion) {
      setSelectedVersion(activeVersion.id);
      setContent(activeVersion.content || '');
      setNotes(activeVersion.notes || '');

      if (activeVersion.variableSchema) {
        const varKeys = activeVersion.variableSchema.map(v => v.key);
        setExtractedVariables(varKeys);

        const varsObj = {};
        activeVersion.variableSchema.forEach(v => {
          varsObj[v.key] = {
            type: v.type,
            required: v.required,
            defaultValue: v.defaultValue,
            description: v.description,
            content: v.content || ''
          };
        });
        setVariables(varsObj);
      }
    }
  }, [activeVersion]);

  // activeTab이 범위를 벗어나면 0으로 리셋
  useEffect(() => {
    if (activeTab > extractedVariables.length) {
      setActiveTab(0);
    }
  }, [extractedVariables.length, activeTab]);

  // validation 체크 - 현재 편집 중인 extractedVariables 기반
  useEffect(() => {
    if (content) {
      const usedVars = extractVariables(content);
      const missing = usedVars.filter(v => !extractedVariables.includes(v));
      const unused = extractedVariables.filter(v => !usedVars.includes(v));
      setValidation({
        valid: missing.length === 0,
        usedVars,
        definedVars: extractedVariables,
        missing,
        unused
      });
    } else {
      setValidation(null);
    }
  }, [content, extractedVariables]);

  // 선택된 버전의 variableSchema 및 notes 로드
  useEffect(() => {
    if (selectedVersion && versions.length > 0) {
      const version = versions.find(v => v.id === selectedVersion);
      if (version) {
        // notes 업데이트
        setNotes(version.notes || '');

        // variableSchema 업데이트
        if (version.variableSchema) {
          const varKeys = version.variableSchema.map(v => v.key);
          setExtractedVariables(varKeys);

          const varsObj = {};
          version.variableSchema.forEach(v => {
            varsObj[v.key] = {
              type: v.type,
              required: v.required,
              defaultValue: v.defaultValue,
              description: v.description,
              content: v.content || ''
            };
          });
          setVariables(varsObj);
        }
      }
    }
  }, [selectedVersion, versions]);

  // 변수 체크 (프롬프트에서 {{}} 패턴 추출)
  const handleCheckVariables = () => {
    const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
    const matches = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (!matches.includes(match[1])) {
        matches.push(match[1]);
      }
    }

    setExtractedVariables(matches);
    if (matches.length > 0) {
      setActiveTab(0); // 첫 번째 탭으로 이동
    }
  };

  // 변수 업데이트
  const handleUpdateVariable = (key, field, value) => {
    setVariables(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      }
    }));
  };

  const handleSave = async () => {
    if (!selectedVersion) {
      showAlert('버전을 선택해주세요.');
      return;
    }

    const version = versions.find(v => v.id === selectedVersion);
    if (!version) {
      showAlert('선택한 버전을 찾을 수 없습니다.');
      return;
    }

    try {
      // 변수 배열 생성
      const variablesArray = extractedVariables.map(key => ({
        key,
        type: variables[key]?.type || 'string',
        required: variables[key]?.required ?? true,
        defaultValue: variables[key]?.defaultValue || '',
        description: variables[key]?.description || '',
        content: variables[key]?.content || '',
      }));

      await updateVersion.mutateAsync({
        code: promptCode,
        versionId: selectedVersion,
        data: {
          content: content,
          variableSchema: variablesArray,
          notes: notes || '',
        }
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

    const version = versions.find(v => v.id === selectedVersion);
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
        const result = await publishVersion.mutateAsync({
          code: promptCode,
          versionId: selectedVersion,
          data: {}
        });
        console.log('Publish result:', result);
        showAlert('버전이 활성화되었습니다.');
      } catch (error) {
        console.error('Failed to publish version:', error);
        console.error('Error details:', error.response?.data);
        showAlert('버전 활성화에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

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
  };

  const handleCopyVersion = async (version) => {
    try {
      console.log('Copy version:', version);
      console.log('variableSchema:', version.variableSchema);

      // 다음 버전 번호 계산
      const maxVersion = Math.max(...versions.map(v => typeof v.version === 'number' ? v.version : parseInt(v.version, 10)));
      const nextVersion = maxVersion + 1;

      // 변수 배열 생성
      const variablesArray = version.variableSchema?.map(v => ({
        key: v.key,
        type: v.type || 'string',
        required: v.required ?? true,
        defaultValue: v.defaultValue || '',
        description: v.description || '',
        content: v.content || '',
      })) || [];

      console.log('variablesArray:', variablesArray);

      await createVersion.mutateAsync({
        code: promptCode,
        data: {
          content: version.content,
          version: String(nextVersion),
          variableSchema: variablesArray,
          notes: `버전 ${version.version}에서 복사됨`,
          status: 'draft'
        }
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
        versionId: versionId
      });

      // 마지막 버전이었다면 목록 화면으로 이동
      if (isLastVersion) {
        showAlert('프롬프트가 삭제되었습니다.');
        navigate('/prompts');
        return;
      }

      // 삭제한 버전이 현재 선택된 버전이면 activeVersion으로 변경
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

  return (
    <Box sx={{ p: 0, bgcolor: '#f9fafb', width: '100%' }} id="editor-wrapper">
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'stretch' }} id="editor-grid-container">
        {/* 좌측: 버전 히스토리 */}
        <Box sx={{ flex: '0 0 33.33%', minWidth: 0, display: 'flex', flexDirection: 'column' }} id="version-history-grid">
          <VersionHistoryPanel
            versions={versions}
            selectedVersion={selectedVersion}
            onVersionChange={handleVersionChange}
            onCopyVersion={handleCopyVersion}
            onDeleteVersion={handleDeleteVersion}
            compareVersions={compareVersions}
          />
        </Box>

        {/* 중앙: 프롬프트 에디터 - 탭 기반 */}
        <Box sx={{ flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column' }} id="prompt-editor-grid">
          <Paper sx={{ p: 2, bgcolor: '#fff', height: '560px', display: 'flex', flexDirection: 'column' }} id="prompt-editor-paper">
            {isMasked ? (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ fontSize: '48px' }}>🔒</Box>
                <Box sx={{ fontSize: '16px', fontWeight: 600, color: '#b91c1c' }}>극비 프롬프트</Box>
                <Box sx={{ fontSize: '13px', color: '#6b7280' }}>이 프롬프트는 극비 등급입니다. SYSOP 권한으로 로그인해야 열람 및 수정이 가능합니다.</Box>
              </Box>
            ) : (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} id="prompt-edit-container">
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
                showToolbar={true}
                isExpanded={isExpanded}
                onToggleExpand={() => setIsExpanded(!isExpanded)}
                customHeight="320px"
              />

              <TextField
                fullWidth
                label={`배포내용 설명(버전 : ${versions.find(v => v.id === selectedVersion)?.version || '-'})`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="변경 사항을 간단히 설명해주세요."
                variant="outlined"
                sx={{ mb: 1, mt: 2 }}
                id="deployment-notes-textfield"
              />

              <Box display="flex" gap={2} id="action-buttons-box">
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                >
                  저장 (Draft)
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PublishIcon />}
                  onClick={handlePublish}
                  disabled={selectedVersion === activeVersion?.id}
                >
                  배포 (Publish)
                </Button>
              </Box>
            </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* 버전 생성 Dialog */}
      <PromptFormDialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setDialogData(null);
        }}
        initialData={dialogData}
        mode="edit"
      />
    </Box>
  );
};

export default EditorTab;

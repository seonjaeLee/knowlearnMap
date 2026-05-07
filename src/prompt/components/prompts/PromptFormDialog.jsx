import React, { useState, useCallback, useMemo } from 'react';
import { useAlert } from '../../../context/AlertContext';
import { useAuth } from '../../../context/AuthContext';
import {
  TextField,
  Button,
  Box,
  Typography,
  Select,
  MenuItem
} from '@mui/material';
import { useCreatePrompt, usePrompts } from '../../hooks/usePrompts';
import { useVersions } from '../../hooks/useVersions';
import { promptService } from '../../api/promptService';
import { testService } from '../../api/testService';
import PromptEditTabs from '../common/PromptEditTabs';
import BaseModal from '../../../components/common/modal/BaseModal';
import './PromptDialogs.css';

const PromptFormDialog = ({ open, onClose, initialData = null, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    code: initialData?.code || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    purpose: initialData?.purpose || '',
    version: '',
    promptContent: initialData?.promptContent || '',
    securityLevel: initialData?.securityLevel || 'PUBLIC',
  });

  const { user } = useAuth();
  const isSysop = user?.role === 'SYSOP';

  // 보안 등급 옵션 (SYSOP만 극비 선택 가능)
  const securityLevels = useMemo(() => {
    const levels = [
      { value: 'TEMP', label: '임시', color: '#9e9e9e' },
      { value: 'PUBLIC', label: '공개', color: '#4caf50' },
      { value: 'INTERNAL', label: '내부용', color: '#2196f3' },
      { value: 'CONFIDENTIAL', label: '기밀', color: '#ff9800' },
    ];
    if (isSysop) {
      levels.push({ value: 'TOP_SECRET', label: '극비', color: '#f44336' });
    }
    return levels;
  }, [isSysop]);
  const [variables, setVariables] = useState({});
  const [isExistingCode, setIsExistingCode] = useState(false);
  const [codeCheckStatus, setCodeCheckStatus] = useState(mode === 'edit' ? 'available' : null); // null | 'checking' | 'available' | 'duplicate'
  const [isCodeLocked, setIsCodeLocked] = useState(mode === 'edit');
  const [activeTab, setActiveTab] = useState(0);
  const [extractedVariables, setExtractedVariables] = useState([]); // 변수 추출 결과를 state로 관리
  const [isExpanded, setIsExpanded] = useState(false);
  const [categories, setCategories] = useState([]);
  const [purposes, setPurposes] = useState([]);
  const prevOpenRef = React.useRef(false);
  const { showAlert } = useAlert();

  // activeTab이 범위를 벗어나면 0으로 리셋
  React.useEffect(() => {
    if (activeTab > extractedVariables.length) {
      setActiveTab(0);
    }
  }, [extractedVariables.length]);

  // Dialog가 열릴 때만 초기화 (false -> true)
  React.useEffect(() => {
    if (open && !prevOpenRef.current) {
      setFormData({
        code: initialData?.code || '',
        name: initialData?.name || '',
        description: initialData?.description || '',
        category: initialData?.category || '',
        purpose: initialData?.purpose || '',
        version: '',
        promptContent: initialData?.promptContent || '',
        securityLevel: initialData?.securityLevel || 'PUBLIC',
      });
      setVariables({});
      setExtractedVariables([]);
      setIsExistingCode(false);
      setCodeCheckStatus(mode === 'edit' ? 'available' : null);
      setIsCodeLocked(mode === 'edit');
      setActiveTab(0);
      setIsExpanded(false);

      const fetchCategories = async () => {
        try {
          const response = await promptService.getCategories();
          const list = response?.data || response;
          if (Array.isArray(list)) {
            setCategories(list);
          }
        } catch (error) {
          console.error('Failed to fetch categories:', error);
        }
      };
      const fetchPurposes = async () => {
        try {
          const response = await promptService.getPurposes();
          const list = response?.data || response;
          if (Array.isArray(list)) {
            setPurposes(list);
          }
        } catch (error) {
          console.error('Failed to fetch purposes:', error);
        }
      };
      fetchCategories();
      fetchPurposes();
    }
    prevOpenRef.current = open;
  }, [open, mode, initialData]);

  const createPrompt = useCreatePrompt();
  const emptyFilters = useMemo(() => ({}), []);
  const { data: promptsData } = usePrompts(emptyFilters);
  const { data: versionsData } = useVersions(formData.code);

  // 등록된 코드 목록 추출 (메모이제이션)
  const existingCodes = useMemo(() =>
    Array.isArray(promptsData?.data?.content)
      ? promptsData.data.content.map(p => p.code)
      : [],
    [promptsData?.data?.content]
  );

  // 선택된 코드가 기존 코드인지 확인하고, 기존 코드면 해당 프롬프트 정보 가져오기 (메모이제이션)
  const selectedPrompt = useMemo(() =>
    Array.isArray(promptsData?.data?.content)
      ? promptsData.data.content.find(p => p.code === formData.code)
      : undefined,
    [promptsData?.data?.content, formData.code]
  );

  // 다음 버전 번호 계산
  const getNextVersion = (versions) => {
    if (!versions || versions.length === 0) return '1';

    // 버전에서 숫자 추출 (v1.2.0 -> [1, 2, 0])
    const versionNumbers = versions.map(v => {
      const match = v.version.match(/v?(\d+)\.?(\d+)?\.?(\d+)?/);
      if (match) {
        return parseInt(match[1]) || 0;
      }
      return 0;
    });

    const maxVersion = Math.max(...versionNumbers);
    return String(maxVersion + 1);
  };

  // 코드 중복 확인
  const handleCheckCode = () => {
    if (!formData.code.trim()) {
      return;
    }

    setCodeCheckStatus('checking');

    // 테스트용: "CODE"라고 입력하면 중복으로 처리
    setTimeout(() => {
      const isDuplicate = formData.code === 'CODE' || existingCodes.includes(formData.code);

      if (isDuplicate) {
        setCodeCheckStatus('duplicate');
        setIsCodeLocked(false);
      } else {
        setCodeCheckStatus('available');
        setIsCodeLocked(true);
      }
    }, 300);
  };

  // 변수 체크 (프롬프트에서 {{}} 패턴 추출) - 메모이제이션
  const handleCheckVariables = useCallback(() => {
    setFormData(currentFormData => {
      const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
      const matches = [];
      let match;

      while ((match = regex.exec(currentFormData.promptContent)) !== null) {
        if (!matches.includes(match[1])) {
          matches.push(match[1]);
        }
      }

      setExtractedVariables(matches);
      return currentFormData; // 상태 변경 없음
    });
  }, []);

  // 변수 업데이트 (메모이제이션)
  const handleUpdateVariable = useCallback((key, field, value) => {
    setVariables(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      }
    }));
  }, []);

  const handlePromptContentChange = useCallback((value) => {
    setFormData(prev => ({ ...prev, promptContent: value }));
  }, []);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // 프롬프트 내용에서 현재 변수 추출
  const getCurrentVariables = () => {
    const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
    const matches = [];
    let match;

    while ((match = regex.exec(formData.promptContent)) !== null) {
      if (!matches.includes(match[1])) {
        matches.push(match[1]);
      }
    }

    return matches.sort();
  };

  // 변수 체크 필요 여부 확인 (메모이제이션)
  const variableCheckNeeded = useMemo(() => {
    if (!formData.promptContent) return false;

    // getCurrentVariables 로직 인라인
    const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
    const matches = [];
    let match;
    while ((match = regex.exec(formData.promptContent)) !== null) {
      if (!matches.includes(match[1])) {
        matches.push(match[1]);
      }
    }
    const currentVars = matches.sort();
    const extractedVars = [...extractedVariables].sort();

    // 변수가 없으면 체크 불필요
    if (currentVars.length === 0) return false;

    // 변수 개수가 다르거나, 내용이 다르면 체크 필요
    if (currentVars.length !== extractedVars.length) return true;

    return !currentVars.every((v, i) => v === extractedVars[i]);
  }, [formData.promptContent, extractedVariables]);

  const handleSubmit = async () => {
    try {
      // 버전 자동 설정
      const version = isExistingCode && versionsData
        ? getNextVersion(versionsData)
        : '1';

      // 변수 데이터 정리
      const variablesArray = extractedVariables.map(key => ({
        key,
        type: variables[key]?.type || 'string',
        required: variables[key]?.required ?? true,
        defaultValue: variables[key]?.defaultValue || '',
        description: variables[key]?.description || '',
        content: variables[key]?.content || '',
      }));

      // 백엔드 CreatePromptRequest에는 version 필드가 없으므로 제외하고 전송
      // (백엔드에서 초기 버전을 1로 자동 설정함)
      const { version: _, ...submitData } = formData;

      const response = await createPrompt.mutateAsync({
        ...submitData,
        variables: variablesArray,
      });

      // 프롬프트 생성 후 기본 환경설정 저장
      const createdData = response?.data?.data || response?.data;
      if (createdData?.publishVersionId) {
        try {
          await testService.saveLlmConfig(formData.code, createdData.publishVersionId, {
            testName: 'Default Config',
            variables: {},
            llmConfig: {
              model: 'GEMINI_2_5_PRO',
              temperature: 0.7,
              topP: 0.95,
              maxOutputTokens: 40000,
              topK: 40,
              n: 1
            }
          });
        } catch (configError) {
          console.warn('Failed to save default LLM config:', configError);
          // 환경설정 저장 실패는 무시 (프롬프트는 생성됨)
        }
      }

      onClose();
      // 폼 초기화
      setFormData({
        code: '',
        name: '',
        description: '',
        category: '',
        purpose: '',
        version: '',
        promptContent: '',
        securityLevel: 'PUBLIC',
      });
      setVariables({});
      setIsExistingCode(false);
      setIsExpanded(false);
    } catch (error) {
      console.error('Failed to create prompt:', error);
      const errorMessage = error.response?.data?.message || error.message || '알 수 없는 오류가 발생했습니다.';
      showAlert(`프롬프트 생성 실패: ${errorMessage}`);
    }
  };

  const handleClose = () => {
    onClose();
    // 폼 초기화
    setFormData({
      code: '',
      name: '',
      description: '',
      category: '',
      version: '',
      promptContent: '',
      securityLevel: 'PUBLIC',
    });
    setVariables({});
    setIsExistingCode(false);
    setCodeCheckStatus(null);
    setIsCodeLocked(false);
    setActiveTab(0);
    setIsExpanded(false);
  };

  return (
    <BaseModal
      open={open}
      title={mode === 'edit' ? '프롬프트 버전 생성' : '새 프롬프트 생성'}
      onClose={handleClose}
      maxWidth="md"
      disableBackdropClose
      disableEscapeKeyDown
      contentClassName="prompt-form-modal-content"
      actions={(
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 1 }}>
          {codeCheckStatus !== 'available' && (
            <Typography variant="caption" color="error.main" sx={{ textAlign: 'center' }}>
              ⚠️ 코드 중복 확인을 완료해주세요
            </Typography>
          )}
          {variableCheckNeeded && (
            <Typography variant="caption" color="error.main" sx={{ textAlign: 'center' }}>
              ⚠️ 변수 체크를 완료해주세요
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'left', mb: 1 }}>
            💡 변수는 {`{{변수명}}`} 형태로 입력하세요. 변수 체크 버튼을 눌러 변수를 추출하세요.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{
                color: 'text.secondary',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              취소
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={
                codeCheckStatus !== 'available' ||
                !formData.code ||
                !formData.name ||
                variableCheckNeeded ||
                createPrompt.isPending
              }
              sx={{
                minWidth: 100,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
                },
                '&.Mui-disabled': {
                  bgcolor: 'action.disabledBackground',
                  color: 'text.disabled',
                }
              }}
            >
              {createPrompt.isPending ? (mode === 'edit' ? '버전 생성 중...' : '생성 중...') :
                codeCheckStatus !== 'available' ? '코드 확인 필요' :
                  !formData.name ? '이름 입력 필요' :
                    variableCheckNeeded ? '변수 체크 필요' :
                      (mode === 'edit' ? '버전 생성' : '생성')}
            </Button>
          </Box>
        </Box>
      )}
    >
      <Box sx={{ pt: 1, pb: 1, overflow: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* 코드, 버전, 이름, 카테고리 - 한 줄 배치 */}
          <Box display="flex" gap={2} alignItems="flex-start">
            {/* 코드 - 30% */}
            <Box flex="1 1 30%">
              <Typography
                variant="body2"
                sx={{ mb: 0.75, fontWeight: 500, color: 'text.primary' }}
              >
                코드 <Typography component="span" color="error.main">*</Typography>
              </Typography>
              <Box display="flex" gap={1}>
                {/* ... existing code textfield ... */}
                <TextField
                  value={formData.code}
                  onChange={(e) => {
                    if (mode === 'edit') return;
                    const value = e.target.value
                      .replace(/[^a-zA-Z0-9_]/g, '')
                      .toUpperCase();
                    setFormData(prev => ({ ...prev, code: value }));
                    setCodeCheckStatus(null);
                  }}
                  fullWidth
                  placeholder="코드 입력"
                  size="small"
                  disabled={mode === 'edit' || isCodeLocked || !!initialData}
                  error={codeCheckStatus === 'duplicate'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: (mode === 'edit' || isCodeLocked) ? 'action.hover' : 'background.paper',
                    }
                  }}
                />
                {mode !== 'edit' && (
                  <Button
                    variant="outlined"
                    onClick={handleCheckCode}
                    disabled={!formData.code.trim() || isCodeLocked || !!initialData}
                    sx={{
                      minWidth: 40,
                      px: 1,
                      borderColor: codeCheckStatus === 'available' ? 'success.main' : undefined,
                      color: codeCheckStatus === 'available' ? 'success.main' : undefined,
                    }}
                  >
                    {codeCheckStatus === 'checking' ? '...' :
                      codeCheckStatus === 'available' ? '✓' : '확인'}
                  </Button>
                )}
              </Box>
              {/* ... error messages ... */}
              {codeCheckStatus === 'duplicate' && mode !== 'edit' && (
                <Typography variant="caption" color="error.main" sx={{ mt: 0.5, display: 'block' }}>
                  중복됨
                </Typography>
              )}
            </Box>

            {/* 버전 - 10% */}
            {codeCheckStatus === 'available' && (
              <Box flex="0 0 10%">
                <Typography
                  variant="body2"
                  sx={{ mb: 0.75, fontWeight: 500, color: 'text.primary' }}
                >
                  버전
                </Typography>
                <TextField
                  value="1"
                  size="small"
                  disabled
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'action.hover',
                    }
                  }}
                />
              </Box>
            )}

            {/* 이름 - 30% */}
            <Box flex="1 1 30%">
              <Typography
                variant="body2"
                sx={{ mb: 0.75, fontWeight: 500, color: 'text.primary' }}
              >
                이름 <Typography component="span" color="error.main">*</Typography>
              </Typography>
              <TextField
                value={formData.name}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({ ...prev, name: value }));
                }}
                fullWidth
                placeholder="이름 입력"
                size="small"
                disabled={codeCheckStatus !== 'available'}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper',
                  }
                }}
              />
            </Box>

            {/* 카테고리 - 15% */}
            <Box flex="1 1 15%">
              <Typography
                variant="body2"
                sx={{ mb: 0.75, fontWeight: 500, color: 'text.primary' }}
              >
                카테고리
              </Typography>
              <Select
                value={formData.category || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                fullWidth
                size="small"
                disabled={codeCheckStatus !== 'available'}
                displayEmpty
              >
                <MenuItem value=""><em>선택</em></MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </Box>

            {/* 용도 - 15% */}
            <Box flex="1 1 15%">
              <Typography
                variant="body2"
                sx={{ mb: 0.75, fontWeight: 500, color: 'text.primary' }}
              >
                용도
              </Typography>
              <Select
                value={formData.purpose || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                fullWidth
                size="small"
                disabled={codeCheckStatus !== 'available'}
                displayEmpty
              >
                <MenuItem value=""><em>선택</em></MenuItem>
                {purposes.map((p) => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
              </Select>
            </Box>

            {/* 보안 등급 - 15% */}
            <Box flex="1 1 15%">
              <Typography
                variant="body2"
                sx={{ mb: 0.75, fontWeight: 500, color: 'text.primary' }}
              >
                보안 등급
              </Typography>
              <Select
                value={formData.securityLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, securityLevel: e.target.value }))}
                fullWidth
                size="small"
                disabled={codeCheckStatus !== 'available'}
              >
                {securityLevels.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: level.color }} />
                      {level.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>

          {/* 설명 */}
          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 0.75, fontWeight: 500, color: 'text.primary' }}
            >
              설명
            </Typography>
            <TextField
              value={formData.description}
              onChange={(e) => {
                const value = e.target.value;
                setFormData(prev => ({ ...prev, description: value }));
              }}
              fullWidth
              multiline
              rows={3}
              placeholder="프롬프트에 대한 설명을 입력하세요"
              size="small"
              disabled={codeCheckStatus !== 'available'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.paper',
                }
              }}
            />
          </Box>

          {/* 탭 영역 */}
          <Box sx={{ mt: 2 }}>
            <PromptEditTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              extractedVariables={extractedVariables}
              promptContent={formData.promptContent}
              onPromptContentChange={handlePromptContentChange}
              variables={variables}
              onVariableUpdate={handleUpdateVariable}
              onCheckVariables={handleCheckVariables}
              disabled={codeCheckStatus !== 'available'}
              showToolbar={true}
              isExpanded={isExpanded}
              onToggleExpand={handleToggleExpand}
              customHeight={isExpanded ? '500px' : '250px'}
            />
          </Box>

        </Box>
      </Box>
    </BaseModal>
  );
};

export default PromptFormDialog;

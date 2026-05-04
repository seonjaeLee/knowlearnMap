import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Button,
  Alert,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, ErrorOutline as ErrorIcon } from '@mui/icons-material';
import { usePromptDetail } from '../../hooks/usePrompts';
import { useVersions } from '../../hooks/useVersions';
import EditorTab from '../editor/EditorTab';
import TestTab from '../test/TestTab';
import HistoryTab from '../history/HistoryTab';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      style={{ width: '100%' }}
      {...other}
    >
      {value === index && <Box sx={{ width: '100%' }}>{children}</Box>}
    </div>
  );
}

const PromptDetailContent = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);

  const { data: promptData, isLoading: promptLoading, error: promptError } = usePromptDetail(code);
  const { data: versionsData, isLoading: versionsLoading, error: versionsError } = useVersions(code);

  const handleGoBack = () => {
    navigate('/prompts');
  };

  if (promptLoading || versionsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // 프롬프트가 존재하지 않는 경우 방어 처리
  const prompt = promptData?.data;
  const isNotFound = promptError || (!promptLoading && !prompt);

  if (isNotFound) {
    const status = promptError?.response?.status;
    const isHttp404 = status === 404;
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ErrorIcon sx={{ fontSize: 64, color: isHttp404 ? '#ff9800' : '#f44336', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {isHttp404
              ? `프롬프트를 찾을 수 없습니다: ${code}`
              : '프롬프트를 불러오는 중 오류가 발생했습니다'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {isHttp404
              ? '해당 코드의 프롬프트가 DB에 존재하지 않습니다. 프롬프트 목록에서 먼저 생성해주세요.'
              : (promptError?.message || '서버에 연결할 수 없거나 예상치 못한 오류가 발생했습니다.')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
          >
            프롬프트 목록으로 돌아가기
          </Button>
        </Paper>
      </Box>
    );
  }

  const versions = Array.isArray(versionsData?.data?.content) ? versionsData.data.content :
    Array.isArray(versionsData?.data) ? versionsData.data : [];

  // versions에 variableSchema가 포함되어 있으므로 별도 API 호출 불필요
  const schemas = [];
  const sets = [];

  const activeVersion = versions.find(v => v.isActive);

  const handleSaveVersion = (versionData) => {
    console.log('Save version:', versionData);
    // TODO: API 호출
  };

  const handlePublishVersion = (versionId) => {
    console.log('Publish version:', versionId);
    // TODO: API 호출
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 1, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
            sx={{ mr: 2 }}
          >
            이전
          </Button>
          {/* 코드 */}
          <Typography variant="body1" sx={{ fontWeight: 500, minWidth: '200px', mr: 3 }}>
            코드: {code}
          </Typography>

          {/* 이름 */}
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            이름: {prompt?.name || code}
          </Typography>

          {/* 카테고리 */}
          <Typography variant="body1" sx={{ fontWeight: 500, ml: 3 }}>
            카테고리: {prompt?.category || <span style={{ color: '#999' }}>미분류</span>}
          </Typography>

          {/* 설명 */}
          <Typography variant="body2" color="text.secondary" sx={{ flex: 1, ml: 3 }}>
            {prompt?.description || '-'}
          </Typography>
        </Box>
      </Paper>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Editor" />
          <Tab label="Test" />
          <Tab label="History" />
        </Tabs>

        <TabPanel value={currentTab} index={0} sx={{ width: '100%' }}>
          <EditorTab
            promptCode={code}
            promptName={prompt?.name || code}
            promptDescription={prompt?.description || ''}
            securityLevel={prompt?.securityLevel || 'PUBLIC'}
            versions={versions}
            activeVersion={activeVersion}
            variableSchemas={schemas}
            onSave={handleSaveVersion}
            onPublish={handlePublishVersion}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <TestTab
            promptCode={code}
            versions={versions}
            variableSets={sets}
            variableSchemas={schemas}
            llmConfig={prompt?.llmConfig}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <HistoryTab
            promptCode={code}
            versions={versions}
          />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default PromptDetailContent;

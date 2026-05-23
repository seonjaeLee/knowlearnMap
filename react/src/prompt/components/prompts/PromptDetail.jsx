import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { usePromptDetail } from '../../hooks/usePrompts';
import { useVersions } from '../../hooks/useVersions';
import EditorTab from '../editor/EditorTab';
import TestTab from '../test/TestTab';
import HistoryTab from '../history/HistoryTab';
import '../../../pages/admin/admin-common.css';
import './PromptDetail.css';

const DETAIL_TABS = [
  { id: 'editor', label: 'Editor' },
  { id: 'test', label: 'Test' },
  { id: 'history', label: 'History' },
];

const PromptDetailContent = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState('editor');

  const { data: promptData, isLoading: promptLoading, error: promptError } = usePromptDetail(code);
  const { data: versionsData, isLoading: versionsLoading } = useVersions(code);

  const handleGoBack = () => {
    navigate('/prompts');
  };

  if (promptLoading || versionsLoading) {
    return (
      <div className="kl-page prompt-detail-page">
        <div className="prompt-detail-loading">
          <div className="admin-spinner" />
          <span>데이터를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  const prompt = promptData?.data;
  const isNotFound = promptError || (!promptLoading && !prompt);

  if (isNotFound) {
    const status = promptError?.response?.status;
    const isHttp404 = status === 404;
    return (
      <div className="kl-page prompt-detail-page">
        <div className="prompt-detail-error">
          <AlertCircle size={48} className="prompt-detail-error__icon" aria-hidden />
          <h2 className="prompt-detail-error__title">
            {isHttp404
              ? `프롬프트를 찾을 수 없습니다: ${code}`
              : '프롬프트를 불러오는 중 오류가 발생했습니다'}
          </h2>
          <p className="prompt-detail-error__message">
            {isHttp404
              ? '해당 코드의 프롬프트가 DB에 존재하지 않습니다. 프롬프트 목록에서 먼저 생성해주세요.'
              : (promptError?.message || '서버에 연결할 수 없거나 예상치 못한 오류가 발생했습니다.')}
          </p>
          <button type="button" className="kl-btn primary-full md" onClick={handleGoBack}>
            <ArrowLeft size={14} aria-hidden />
            프롬프트 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const versions = Array.isArray(versionsData?.data?.content) ? versionsData.data.content
    : Array.isArray(versionsData?.data) ? versionsData.data : [];

  const schemas = [];
  const sets = [];
  const activeVersion = versions.find((v) => v.isActive);

  const handleSaveVersion = (versionData) => {
    console.log('Save version:', versionData);
  };

  const handlePublishVersion = (versionId) => {
    console.log('Publish version:', versionId);
  };

  return (
    <div className="kl-page prompt-detail-page">
      <div className="kl-main-sticky-head">
        <div className="prompt-detail-meta">
          <button type="button" className="kl-btn kl-btn--secondary prompt-detail-meta__back" onClick={handleGoBack}>
            <ArrowLeft size={14} aria-hidden />
            목록
          </button>
          <dl className="prompt-detail-meta__grid">
            <div className="prompt-detail-meta__item">
              <dt className="prompt-detail-meta__label">코드</dt>
              <dd className="prompt-detail-meta__value">{code}</dd>
            </div>
            <div className="prompt-detail-meta__item">
              <dt className="prompt-detail-meta__label">이름</dt>
              <dd className="prompt-detail-meta__value">{prompt?.name || code}</dd>
            </div>
            <div className="prompt-detail-meta__item">
              <dt className="prompt-detail-meta__label">카테고리</dt>
              <dd className="prompt-detail-meta__value">
                {prompt?.category || (
                  <span className="prompt-detail-meta__value--muted">미분류</span>
                )}
              </dd>
            </div>
          </dl>
          {prompt?.description ? (
            <p className="prompt-detail-meta__desc">{prompt.description}</p>
          ) : null}
        </div>

        <div className="kl-subtabs" role="tablist" aria-label="프롬프트 상세">
          {DETAIL_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={currentTab === tab.id}
              className={`kl-subtab ${currentTab === tab.id ? 'active' : ''}`}
              onClick={() => setCurrentTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="prompt-detail-panel">
        {currentTab === 'editor' && (
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
        )}
        {currentTab === 'test' && (
          <TestTab
            promptCode={code}
            versions={versions}
            variableSets={sets}
            variableSchemas={schemas}
            llmConfig={prompt?.llmConfig}
          />
        )}
        {currentTab === 'history' && (
          <HistoryTab
            promptCode={code}
            versions={versions}
          />
        )}
      </div>
    </div>
  );
};

export default PromptDetailContent;

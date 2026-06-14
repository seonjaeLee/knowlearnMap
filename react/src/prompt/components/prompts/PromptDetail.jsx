import React, { useCallback, useRef, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronLeft, Upload } from 'lucide-react';
import MakerPageHeader from '../../../components/admin/MakerPageHeader';
import { usePromptDetail } from '../../hooks/usePrompts';
import { useVersions } from '../../hooks/useVersions';
import { getPromptsBasePath } from '../../utils/promptRoutes';
import EditorTab from '../editor/EditorTab';
import HistoryTab from '../history/HistoryTab';
import '../../../pages/admin/admin-common.css';
import './PromptDetail.css';

const DETAIL_TABS = [
  { id: 'editor', label: 'Editor' },
  { id: 'history', label: 'History' },
];

function pickDefaultVersion(versions, activeVersion) {
  if (!versions?.length) return activeVersion;
  const drafts = versions.filter((v) => v.status === 'draft' && !v.isActive);
  if (drafts.length > 0) {
    return drafts.reduce((best, v) => (Number(v.version) > Number(best.version) ? v : best));
  }
  return versions.reduce((best, v) => (Number(v.version) > Number(best.version) ? v : best), versions[0]);
}

const PromptDetailContent = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const promptsBasePath = getPromptsBasePath(location.pathname);
  const [currentTab, setCurrentTab] = useState('editor');
  const [editorState, setEditorState] = useState(null);
  const editorRef = useRef(null);

  const { data: promptData, isLoading: promptLoading, error: promptError } = usePromptDetail(code);
  const { data: versionsData, isLoading: versionsLoading } = useVersions(code);

  const handleGoBack = () => {
    navigate(promptsBasePath);
  };

  const handleEditorStateChange = useCallback((state) => {
    setEditorState(state);
  }, []);

  const handlePublish = () => {
    editorRef.current?.publish?.();
  };

  const versions = Array.isArray(versionsData?.data?.content) ? versionsData.data.content
    : Array.isArray(versionsData?.data) ? versionsData.data : [];
  const activeVersion = versions.find((v) => v.isActive);
  const defaultVersion = pickDefaultVersion(versions, activeVersion);

  if (promptLoading || versionsLoading) {
    return (
      <div className="kl-page kl-page--fill prompt-detail-page">
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
      <div className="kl-page kl-page--fill prompt-detail-page">
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
            <ChevronLeft size={14} aria-hidden />
            프롬프트 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const selectedVersion = editorState?.selectedVersion ?? defaultVersion;
  const draftVersion = versions.find((v) => v.status === 'draft' && !v.isActive);
  const editingVersion = selectedVersion?.status === 'draft' && !selectedVersion?.isActive
    ? selectedVersion
    : draftVersion;

  return (
    <div className="kl-page kl-page--fill prompt-detail-page">
      <div className="kl-main-sticky-head">
        <MakerPageHeader title="프롬프트 관리" />
      </div>

      <div className="prompt-detail-info-wrap">
        <button
          type="button"
          className="prompt-detail-back"
          onClick={handleGoBack}
          aria-label="프롬프트 목록으로"
        >
          <ChevronLeft size={16} strokeWidth={2} aria-hidden />
        </button>
        <div className="item-info">
        <div className="item-info__top">
          <div className="item-info__nameg">
            <span className="item-info__label">이름</span>
            <span className="item-info__name">{prompt?.name || code}</span>
          </div>
          <span className="item-info__sep" aria-hidden />
          <div className="item-info__chips">
            <span className="code-chip">
              <span className="code-chip__k">코드</span>
              {code}
            </span>
            {prompt?.category ? (
              <span className="prompt-skin-tag prompt-skin-tag--info">
                <span className="prompt-skin-tag__dot" aria-hidden />
                {prompt.category}
              </span>
            ) : null}
            {activeVersion ? (
              <span className="prompt-skin-tag prompt-skin-tag--ok">
                <span className="prompt-skin-tag__dot" aria-hidden />
                활성중 v{activeVersion.version}
              </span>
            ) : null}
            {editingVersion ? (
              <span className="prompt-skin-tag prompt-skin-tag--warn">
                <span className="prompt-skin-tag__dot" aria-hidden />
                편집중 v{editingVersion.version}
              </span>
            ) : null}
          </div>
        </div>
        {prompt?.description ? (
          <p className="item-info__desc">{prompt.description}</p>
        ) : null}
        </div>
      </div>

      <div className="prompt-detail-tabs" role="tablist" aria-label="프롬프트 상세">
        {DETAIL_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={currentTab === tab.id}
            className={`prompt-detail-tab ${currentTab === tab.id ? 'is-active' : ''}`}
            onClick={() => setCurrentTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        {currentTab === 'editor' && (
          <div className="prompt-detail-tabs__actions">
            <button type="button" className="prompt-detail-deploy-btn" onClick={handlePublish}>
              <Upload size={17} strokeWidth={2.2} aria-hidden />
              배포 (PUBLISH)
            </button>
          </div>
        )}
      </div>

      <div className="prompt-detail-body">
        {currentTab === 'editor' && (
          <EditorTab
            ref={editorRef}
            promptCode={code}
            promptName={prompt?.name || code}
            securityLevel={prompt?.securityLevel || 'PUBLIC'}
            versions={versions}
            activeVersion={defaultVersion}
            variableSchemas={[]}
            onEditorStateChange={handleEditorStateChange}
            promptsBasePath={promptsBasePath}
          />
        )}
        {currentTab === 'history' && (
          <div className="kl-subtab-panel prompt-detail-history-panel">
            <HistoryTab
              promptCode={code}
              versions={versions}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptDetailContent;

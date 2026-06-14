import React, { useState, useEffect } from 'react';
import { Check, Copy, Play, Save } from 'lucide-react';
import { useAlert } from '../../../context/AlertContext';
import { configApi } from '../../../services/api';
import { testService } from '../../api/testService';
import axiosClient from '../../api/axiosClient';
import { useCopyFeedback } from '../../../hooks/useCopyFeedback';
import './TestTab.css';

const LLM_MODELS_DEFAULT = [
  { value: 'GEMINI_3_FLASH',  label: 'Gemini 3 Flash' },
  { value: 'GEMINI_2_5_PRO', label: 'Gemini 2.5 Pro' },
  { value: 'OPENAI',          label: 'OPENAI' },
  { value: 'ANTHROPIC',       label: 'ANTHROPIC' },
  { value: 'SLLM',            label: 'Qwen3-32B-AWQ (sLLM)' },
];

const TestTab = ({
  promptCode,
  versions = [],
  variableSchemas = [],
  llmConfig,
}) => {
  const [selectedVersion, setSelectedVersion] = useState(versions?.[0]?.id);
  const [llmModel, setLlmModel]               = useState(llmConfig?.llmModel || 'GEMINI_2_5_PRO');
  const [temperature, setTemperature]         = useState(llmConfig?.temperature ?? 0.7);
  const [topP, setTopP]                       = useState(llmConfig?.topP ?? 0.95);
  const [maxOutputTokens, setMaxOutputTokens] = useState(llmConfig?.maxOutputTokens ?? 40000);
  const [topK, setTopK]                       = useState(llmConfig?.topK ?? 40);
  const [n, setN]                             = useState(llmConfig?.n ?? 1);
  const [loading, setLoading]                 = useState(false);
  const [result, setResult]                   = useState(null);
  const [resultTab, setResultTab]             = useState('json');
  const [llmModels, setLlmModels]             = useState(LLM_MODELS_DEFAULT);
  const { copy, isCopied } = useCopyFeedback();
  const { showAlert } = useAlert();

  useEffect(() => {
    configApi.getLlmModels()
      .then((list) => { if (Array.isArray(list) && list.length > 0) setLlmModels(list); })
      .catch(() => {});
  }, []);

  const currentVersion = versions?.find((v) => v.id === selectedVersion);

  useEffect(() => {
    const applyDefaultConfig = () => {
      const version = versions?.find((v) => v.id === selectedVersion);
      if (version?.llmConfig) {
        setLlmModel(version.llmConfig.model || 'GEMINI_2_5_PRO');
        setTemperature(version.llmConfig.temperature ?? 0.7);
        setTopP(version.llmConfig.topP ?? 0.95);
        setMaxOutputTokens(version.llmConfig.maxOutputTokens ?? 40000);
        setTopK(version.llmConfig.topK ?? 40);
        setN(version.llmConfig.n ?? 1);
      } else if (llmConfig) {
        setLlmModel(llmConfig.llmModel || llmConfig.model || 'GEMINI_2_5_PRO');
        setTemperature(llmConfig.temperature ?? 0.7);
        setTopP(llmConfig.topP ?? 0.95);
        setMaxOutputTokens(llmConfig.maxOutputTokens ?? 40000);
        setTopK(llmConfig.topK ?? 40);
        setN(llmConfig.n ?? 1);
      } else {
        setLlmModel('GEMINI_2_5_PRO');
        setTemperature(0.7);
        setTopP(0.95);
        setMaxOutputTokens(40000);
        setTopK(40);
        setN(1);
      }
    };

    const fetchLlmConfig = async () => {
      if (!selectedVersion) return;
      try {
        const response = await testService.getLlmConfig(promptCode, selectedVersion);
        const data = response.data;
        if (data?.llmConfig) {
          setLlmModel(data.llmConfig.model || 'GEMINI_2_5_PRO');
          setTemperature(data.llmConfig.temperature ?? 0.7);
          setTopP(data.llmConfig.topP ?? 0.95);
          setMaxOutputTokens(data.llmConfig.maxOutputTokens ?? 40000);
          setTopK(data.llmConfig.topK ?? 40);
          setN(data.llmConfig.n ?? 1);
        } else {
          applyDefaultConfig();
        }
      } catch {
        applyDefaultConfig();
      }
    };
    fetchLlmConfig();
  }, [selectedVersion, promptCode]);

  const resolvedPrompt = React.useMemo(() => {
    if (!currentVersion?.content) return '';
    let resolved = currentVersion.content;
    (currentVersion.variableSchema || []).forEach((variable) => {
      const value = variable.content || variable.defaultValue || '';
      const regex = new RegExp(`\\{\\{\\s*${variable.key}\\s*\\}\\}`, 'g');
      resolved = resolved.replace(regex, value);
    });
    return resolved;
  }, [currentVersion]);

  const unresolvedVariableNames = React.useMemo(() => {
    if (!resolvedPrompt) return [];
    const matches = resolvedPrompt.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];
    return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '').trim()))];
  }, [resolvedPrompt]);


  const handleSaveLlmConfig = async () => {
    try {
      await testService.saveLlmConfig(promptCode, selectedVersion, {
        model: llmModel, temperature, topP, maxOutputTokens, topK, n,
      });
      showAlert('환경 설정이 저장되었습니다.');
    } catch {
      showAlert('환경 설정 저장에 실패했습니다.');
    }
  };

  const handleTest = async () => {
    setLoading(true);
    try {
      const variables = {};
      currentVersion?.variableSchema?.forEach((v) => {
        variables[v.key] = v.content || v.defaultValue || '';
      });
      const res = await axiosClient.post(`/prompts/${promptCode}/test`, {
        versionId: selectedVersion,
        variables,
        llmConfig: { model: llmModel, temperature, topP, maxOutputTokens, topK, n },
      });
      setResult(res?.data?.data || res?.data);
    } catch (error) {
      setResult({ error: error.message || 'API 호출에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const resultJson = result ? JSON.stringify(result, null, 2) : '';
  const resultText = result?.response?.text || result?.error || '';

  return (
    <div className="pt-wrap">
      {/* 환경 설정 */}
      <div className="pt-env-card">
        <div className="pt-env-header">
          <span className="pt-env-title">환경 설정</span>
          <button type="button" className="kl-btn kl-btn--outline-primary pt-save-btn" onClick={handleSaveLlmConfig}>
            <Save size={14} aria-hidden />
            환경 저장
          </button>
        </div>
        <div className="pt-env-form">
          <div className="pt-field pt-field--wide">
            <label className="pt-field-label" htmlFor="pt-version">버전 선택</label>
            <select
              id="pt-version"
              className="kl-select gray-outline md pt-field-ctrl"
              value={selectedVersion ?? ''}
              onChange={(e) => setSelectedVersion(e.target.value)}
            >
              {versions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.version}{v.isActive ? ' (활성)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-field pt-field--wide">
            <label className="pt-field-label" htmlFor="pt-llm-model">LLM 모델</label>
            <select
              id="pt-llm-model"
              className="kl-select gray-outline md pt-field-ctrl"
              value={llmModel}
              onChange={(e) => setLlmModel(e.target.value)}
            >
              {llmModels.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {[
            { id: 'pt-temperature', label: 'Temperature', value: temperature, set: setTemperature, step: 0.1, min: 0, max: 2, parse: parseFloat },
            { id: 'pt-topp',        label: 'Top P',        value: topP,         set: setTopP,         step: 0.05, min: 0, max: 1, parse: parseFloat },
            { id: 'pt-maxtokens',   label: 'Max Tokens',   value: maxOutputTokens, set: setMaxOutputTokens, step: 1000, min: 1, max: 100000, parse: parseInt },
            { id: 'pt-topk',        label: 'Top K',        value: topK,         set: setTopK,         step: 1, min: 1, max: 100, parse: parseInt },
            { id: 'pt-n',           label: 'N',            value: n,            set: setN,            step: 1, min: 1, max: 10, parse: parseInt },
          ].map(({ id, label, value, set, step, min, max, parse }) => (
            <div key={id} className="pt-field">
              <label className="pt-field-label" htmlFor={id}>{label}</label>
              <input
                id={id}
                type="number"
                className="kl-input gray-outline md pt-field-ctrl"
                value={value}
                onChange={(e) => set(parse(e.target.value))}
                step={step}
                min={min}
                max={max}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 프롬프트 패널 */}
      <div className="pt-panels">
        <div className="pt-panel">
          <div className="pt-panel-header">
            <span className="pt-panel-label">원본 프롬프트</span>
            <button
              type="button"
              className={`pt-copy-btn${isCopied('original') ? ' is-copied' : ''}`}
              title={isCopied('original') ? '복사됨' : '복사'}
              onClick={() => copy(currentVersion?.content || '', 'original')}
            >
              {isCopied('original') ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
            </button>
          </div>
          <div className="pt-panel-body pt-panel-body--original">
            <pre className="pt-panel-pre">{currentVersion?.content || '버전을 선택하세요.'}</pre>
          </div>
        </div>

        <div className="pt-panel">
          <div className="pt-panel-header">
            <div className="pt-panel-label-wrap">
              <span className={`pt-panel-label${unresolvedVariableNames.length ? ' pt-panel-label--warn' : ''}`}>
                변수 치환 후 (Resolved)
              </span>
              {unresolvedVariableNames.length > 0 && (
                <span className="pt-panel-unresolved">미치환: {unresolvedVariableNames.join(', ')}</span>
              )}
            </div>
            <button
              type="button"
              className={`pt-copy-btn${isCopied('resolved') ? ' is-copied' : ''}`}
              title={isCopied('resolved') ? '복사됨' : '복사'}
              onClick={() => copy(resolvedPrompt, 'resolved')}
            >
              {isCopied('resolved') ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
            </button>
          </div>
          <div className="pt-panel-body pt-panel-body--resolved">
            <pre className="pt-panel-pre">{resolvedPrompt || '변수를 설정하세요.'}</pre>
          </div>
        </div>
      </div>

      {/* 응답 결과 */}
      {result && (
        <div className="pt-result-card">
          <div className="pt-panel-header">
            <span className="pt-panel-label">응답 결과</span>
            <button
              type="button"
              className={`pt-copy-btn${isCopied('result') ? ' is-copied' : ''}`}
              title={isCopied('result') ? '복사됨' : '복사'}
              onClick={() => copy(resultTab === 'json' ? resultJson : resultText, 'result')}
            >
              {isCopied('result') ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
            </button>
          </div>
          <div className="pt-result-tabs">
            <button
              type="button"
              className={`pt-result-tab${resultTab === 'json' ? ' is-active' : ''}`}
              onClick={() => setResultTab('json')}
            >JSON</button>
            <button
              type="button"
              className={`pt-result-tab${resultTab === 'text' ? ' is-active' : ''}`}
              onClick={() => setResultTab('text')}
            >텍스트</button>
          </div>
          <div className="pt-result-body">
            <pre className="pt-panel-pre">
              {resultTab === 'json' ? resultJson : (resultText || '응답 없음')}
            </pre>
          </div>
        </div>
      )}

      {/* 실행 버튼 */}
      <div className="pt-run-wrap">
        <button
          type="button"
          className="kl-btn kl-btn--primary pt-run-btn"
          onClick={handleTest}
          disabled={loading || !currentVersion}
        >
          {loading
            ? <span className="spinner pt-spinner" aria-hidden />
            : <Play size={15} aria-hidden />}
          {loading ? '실행 중...' : 'API 호출 테스트'}
        </button>
      </div>
    </div>
  );
};

export default TestTab;

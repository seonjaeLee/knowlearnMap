import { useState, useEffect, useMemo } from 'react';
import { Button } from '@mui/material';
import { Search, Plus, Globe, CheckCircle, AlertCircle, Database, Layout, Info } from 'lucide-react';
import { useDialog } from '../hooks/useDialog';
import { useResizableColumns } from '../hooks/useResizableColumns';
import { apiCall } from '../services/api';
import AdminPageHeader from './admin/AdminPageHeader';
import BaseModal from './common/modal/BaseModal';
import ModalFormField from './common/modal/ModalFormField';
import KmModalSelect from './common/modal/KmModalSelect';
import { mockDomains, mockDomainPromptDefaults, mockPromptCodesByPurpose } from '../data/domainMockData';
import '../pages/admin/admin-common.css';
import './DomainManagement.css';

const isDomainMockEnabled = import.meta.env.VITE_ENABLE_DOMAIN_MOCK === 'true';
const PROMPT_PURPOSES = ['CHUNK', 'ONTOLOGY', 'CHAT_RESULT', 'CONTENT_ONTOLOGY', 'SCHEMA_ANALYSIS', 'INTER_TABLE_ANALYSIS', 'AQL_GENERATION', 'AQL_INTERPRETATION', 'AGGREGATION_STRATEGY'];

/** 도메인 관리 표 열 리사이즈 (px) — 순서: 도메인명, 설명, 워크스페이스, 생성일, ArangoDB */
const DOMAIN_TABLE_RESIZE_DEFAULTS_PX = [260, 280, 240, 112, 104];
const DOMAIN_TABLE_RESIZE_MINS_PX = [160, 200, 208, 112, 104];

function DomainManagement() {
    const { alert, confirm } = useDialog();
    const [domains, setDomains] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Edit Mode State
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        arangoDbName: '',
        ontologyPrompt: '',
        chatResultPrompt: '',
        chunkPrompt: '',
        contentOntologyPrompt: '',
        schemaAnalysisPrompt: '',
        interTableAnalysisPrompt: '',
        aqlGenerationPrompt: '',
        aqlInterpretationPrompt: '',
        aggregationStrategyPrompt: ''
    });

    // Validation State
    const [isArangoDbChecked, setIsArangoDbChecked] = useState(false);
    const [checkMessage, setCheckMessage] = useState('');
    const [error, setError] = useState('');

    // 용도별 프롬프트 코드 목록
    const [chunkPromptCodes, setChunkPromptCodes] = useState([]);
    const [ontologyPromptCodes, setOntologyPromptCodes] = useState([]);
    const [chatPromptCodes, setChatPromptCodes] = useState([]);
    const [contentOntologyPromptCodes, setContentOntologyPromptCodes] = useState([]);
    const [schemaAnalysisPromptCodes, setSchemaAnalysisPromptCodes] = useState([]);
    const [interTableAnalysisPromptCodes, setInterTableAnalysisPromptCodes] = useState([]);
    const [aqlGenerationPromptCodes, setAqlGenerationPromptCodes] = useState([]);
    const [aqlInterpretationPromptCodes, setAqlInterpretationPromptCodes] = useState([]);
    const [aggregationStrategyPromptCodes, setAggregationStrategyPromptCodes] = useState([]);
    const [promptDefaults, setPromptDefaults] = useState({});
    const [domainSearch, setDomainSearch] = useState('');

    const columnResize = useResizableColumns({
        defaultWidthsPx: DOMAIN_TABLE_RESIZE_DEFAULTS_PX,
        minWidthsPx: DOMAIN_TABLE_RESIZE_MINS_PX,
        storageKey: 'km-domain-mgmt-columns-v1',
        enabled: true,
    });

    useEffect(() => {
        fetchDomains();
    }, []);

    const filteredDomains = useMemo(() => {
        const q = domainSearch.trim().toLowerCase();
        if (!q) return domains;
        return domains.filter((d) => {
            const name = (d.name || '').toLowerCase();
            const desc = (d.description || '').toLowerCase();
            const db = (d.arangoDbName || '').toLowerCase();
            return name.includes(q) || desc.includes(q) || db.includes(q);
        });
    }, [domains, domainSearch]);

    const fetchDomains = async () => {
        if (isDomainMockEnabled) {
            setDomains(mockDomains);
            return;
        }

        try {
            const data = await apiCall('/domains');
            setDomains(data);
        } catch (err) {
            console.error('Failed to fetch domains', err);
            setDomains(mockDomains);
        }
    };

    const fetchPromptDefaults = async () => {
        if (isDomainMockEnabled) {
            setPromptDefaults(mockDomainPromptDefaults);
            return mockDomainPromptDefaults;
        }

        try {
            const data = await apiCall('/domains/prompt-defaults');
            setPromptDefaults(data);
            return data;
        } catch (err) {
            console.error('프롬프트 기본값 조회 실패:', err);
            setPromptDefaults(mockDomainPromptDefaults);
        }
        return mockDomainPromptDefaults;
    };

    const fetchPromptCodesByPurpose = async () => {
        if (isDomainMockEnabled) {
            setChunkPromptCodes(mockPromptCodesByPurpose.CHUNK || []);
            setOntologyPromptCodes(mockPromptCodesByPurpose.ONTOLOGY || []);
            setChatPromptCodes(mockPromptCodesByPurpose.CHAT_RESULT || []);
            setContentOntologyPromptCodes(mockPromptCodesByPurpose.CONTENT_ONTOLOGY || []);
            setSchemaAnalysisPromptCodes(mockPromptCodesByPurpose.SCHEMA_ANALYSIS || []);
            setInterTableAnalysisPromptCodes(mockPromptCodesByPurpose.INTER_TABLE_ANALYSIS || []);
            setAqlGenerationPromptCodes(mockPromptCodesByPurpose.AQL_GENERATION || []);
            setAqlInterpretationPromptCodes(mockPromptCodesByPurpose.AQL_INTERPRETATION || []);
            setAggregationStrategyPromptCodes(mockPromptCodesByPurpose.AGGREGATION_STRATEGY || []);
            return;
        }

        try {
            const results = await Promise.all(
                PROMPT_PURPOSES.map((purpose) =>
                    apiCall(`/v1/prompts?purpose=${encodeURIComponent(purpose)}&isActive=true&size=100`)
                        .catch(() => ({ data: { content: [] } }))
                )
            );
            const extractCodes = (res) => {
                const content = res?.data?.content || res?.content || [];
                return Array.isArray(content) ? content.map(p => p.code) : [];
            };
            setChunkPromptCodes(extractCodes(results[0]));
            setOntologyPromptCodes(extractCodes(results[1]));
            setChatPromptCodes(extractCodes(results[2]));
            setContentOntologyPromptCodes(extractCodes(results[3]));
            setSchemaAnalysisPromptCodes(extractCodes(results[4]));
            setInterTableAnalysisPromptCodes(extractCodes(results[5]));
            setAqlGenerationPromptCodes(extractCodes(results[6]));
            setAqlInterpretationPromptCodes(extractCodes(results[7]));
            setAggregationStrategyPromptCodes(extractCodes(results[8]));
        } catch (err) {
            console.error('프롬프트 코드 목록 조회 실패:', err);
            setChunkPromptCodes(mockPromptCodesByPurpose.CHUNK || []);
            setOntologyPromptCodes(mockPromptCodesByPurpose.ONTOLOGY || []);
            setChatPromptCodes(mockPromptCodesByPurpose.CHAT_RESULT || []);
            setContentOntologyPromptCodes(mockPromptCodesByPurpose.CONTENT_ONTOLOGY || []);
            setSchemaAnalysisPromptCodes(mockPromptCodesByPurpose.SCHEMA_ANALYSIS || []);
            setInterTableAnalysisPromptCodes(mockPromptCodesByPurpose.INTER_TABLE_ANALYSIS || []);
            setAqlGenerationPromptCodes(mockPromptCodesByPurpose.AQL_GENERATION || []);
            setAqlInterpretationPromptCodes(mockPromptCodesByPurpose.AQL_INTERPRETATION || []);
            setAggregationStrategyPromptCodes(mockPromptCodesByPurpose.AGGREGATION_STRATEGY || []);
        }
    };

    const handleOpenCreateModal = async () => {
        setIsEditMode(false);
        setEditId(null);
        const defaults = await fetchPromptDefaults();
        setFormData({
            name: '', description: '', arangoDbName: '',
            ontologyPrompt: defaults.ontologyPrompt || '',
            chatResultPrompt: defaults.chatResultPrompt || '',
            chunkPrompt: defaults.chunkPrompt || '',
            contentOntologyPrompt: defaults.contentOntologyPrompt || '',
            schemaAnalysisPrompt: defaults.schemaAnalysisPrompt || '',
            interTableAnalysisPrompt: defaults.interTableAnalysisPrompt || '',
            aqlGenerationPrompt: defaults.aqlGenerationPrompt || '',
            aqlInterpretationPrompt: defaults.aqlInterpretationPrompt || '',
            aggregationStrategyPrompt: defaults.aggregationStrategyPrompt || ''
        });
        setIsArangoDbChecked(false);
        setCheckMessage('');
        setError('');
        setIsModalOpen(true);
        fetchPromptCodesByPurpose();
    };

    const handleOpenEditModal = async (domain) => {
        setIsEditMode(true);
        setEditId(domain.id);
        const defaults = await fetchPromptDefaults();
        setFormData({
            name: domain.name,
            description: domain.description || '',
            arangoDbName: domain.arangoDbName,
            ontologyPrompt: domain.ontologyPrompt || defaults.ontologyPrompt || '',
            chatResultPrompt: domain.chatResultPrompt || defaults.chatResultPrompt || '',
            chunkPrompt: domain.chunkPrompt || defaults.chunkPrompt || '',
            contentOntologyPrompt: domain.contentOntologyPrompt || defaults.contentOntologyPrompt || '',
            schemaAnalysisPrompt: domain.schemaAnalysisPrompt || defaults.schemaAnalysisPrompt || '',
            interTableAnalysisPrompt: domain.interTableAnalysisPrompt || defaults.interTableAnalysisPrompt || '',
            aqlGenerationPrompt: domain.aqlGenerationPrompt || defaults.aqlGenerationPrompt || '',
            aqlInterpretationPrompt: domain.aqlInterpretationPrompt || defaults.aqlInterpretationPrompt || '',
            aggregationStrategyPrompt: domain.aggregationStrategyPrompt || defaults.aggregationStrategyPrompt || ''
        });
        setIsArangoDbChecked(true);
        setCheckMessage('');
        setError('');
        setIsModalOpen(true);
        fetchPromptCodesByPurpose();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'arangoDbName') {
            // Edit Mode: ArangoDB Name cannot be changed usually, but if UI allows, it must be validated.
            // However, typical requirement is to lock DB name.
            if (isEditMode) return;

            // Validation: only lowercase letters, numbers, hyphens, underscores
            if (value && !/^[a-z0-9_-]*$/.test(value)) {
                return;
            }
            // Reset check status on change
            setIsArangoDbChecked(false);
            setCheckMessage('');
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDuplicateCheck = () => {
        if (!formData.arangoDbName) {
            setCheckMessage('ArangoDB 이름을 입력해주세요.');
            return;
        }
        if (!/^[a-z]/.test(formData.arangoDbName)) {
            setCheckMessage('영문 소문자로 시작해야 합니다.');
            setIsArangoDbChecked(false);
            return;
        }

        // Logic handled in frontend for existing domains list
        // Note: For multi-user concurrent creation, backend check is source of truth.
        // But here we check against loaded list.
        const exists = domains.some(d => d.arangoDbName === formData.arangoDbName);
        if (exists) {
            setCheckMessage('이미 사용 중인 이름입니다.');
            setIsArangoDbChecked(false);
        } else {
            setCheckMessage('사용 가능한 이름입니다.');
            setIsArangoDbChecked(true);
        }
    };

    const handleDelete = async (id, name) => {
        const confirmed = await confirm(`정말 '${name}' 도메인을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없으며, 연결된 데이터가 모두 삭제됩니다 (워크스페이스가 없어야 삭제 가능).`);
        if (!confirmed) {
            return;
        }

        if (isDomainMockEnabled) {
            setDomains((prev) => prev.filter((domain) => domain.id !== id));
            setIsModalOpen(false);
            return;
        }

        try {
            await apiCall(`/domains/${id}`, { method: 'DELETE' });
            await fetchDomains();
            setIsModalOpen(false);
        } catch (err) {
            await alert('삭제 실패: ' + (err.message || '오류가 발생했습니다.'));
            console.error(err);
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.name) {
            setError('도메인명은 필수입니다.');
            return;
        }
        if (!isEditMode && !formData.arangoDbName) {
            setError('ArangoDB명은 필수입니다.');
            return;
        }
        if (!isEditMode && !isArangoDbChecked) {
            setError('ArangoDB명 중복 확인을 해주세요.');
            return;
        }

        try {
            if (isDomainMockEnabled) {
                if (isEditMode) {
                    setDomains((prev) => prev.map((domain) => (
                        domain.id === editId
                            ? { ...domain, ...formData }
                            : domain
                    )));
                } else {
                    const nextId = domains.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
                    const newDomain = {
                        ...formData,
                        id: nextId,
                        workspaceCount: 0,
                        workspaces: [],
                        createdAt: new Date().toISOString(),
                    };
                    setDomains((prev) => [newDomain, ...prev]);
                }
                setIsModalOpen(false);
                return;
            }

            const url = isEditMode ? `/domains/${editId}` : '/domains';
            const method = isEditMode ? 'PUT' : 'POST';

            await apiCall(url, {
                method: method,
                body: JSON.stringify(formData),
            });

            await fetchDomains();
            setIsModalOpen(false);
        } catch (err) {
            setError(err.message || (isEditMode ? '도메인 수정 실패' : '도메인 생성 실패'));
        }
    };

    const handleSelectFieldChange = (fieldName) => (e) => {
        const value = e?.target?.value ?? '';
        setFormData((prev) => ({
            ...prev,
            [fieldName]: value,
        }));
    };

    const promptSelectConfigs = [
        { key: 'ontologyPrompt', label: '온톨로지 프롬프트', options: ontologyPromptCodes, helper: 'Chunk → LLM 온톨로지 추출' },
        { key: 'chatResultPrompt', label: '채팅 프롬프트', options: chatPromptCodes, helper: 'Chat 응답 생성' },
        { key: 'contentOntologyPrompt', label: 'CONTENT 온톨로지', options: contentOntologyPromptCodes, helper: '정형 Chunk → LLM 온톨로지' },
        { key: 'schemaAnalysisPrompt', label: '스키마 분석', options: schemaAnalysisPromptCodes, helper: 'CSV/DB 스키마 자동 분석' },
        { key: 'interTableAnalysisPrompt', label: '테이블 간 관계 분석', options: interTableAnalysisPromptCodes, helper: '다건 테이블 간 FK/관계 분석' },
        { key: 'aqlGenerationPrompt', label: 'AQL 생성', options: aqlGenerationPromptCodes, helper: '자연어 → AQL 쿼리 생성' },
        { key: 'aqlInterpretationPrompt', label: 'AQL 결과 해석', options: aqlInterpretationPromptCodes, helper: 'AQL 쿼리 결과 자연어 해석' },
        { key: 'aggregationStrategyPrompt', label: '집계 전략', options: aggregationStrategyPromptCodes, helper: '대규모 정형 데이터 집계 전략' },
    ];

    return (
        <div className="domain-management-container admin-page">
            <div className="km-main-sticky-head">
            <AdminPageHeader
                title="도메인 관리"
                count={domains.length}
                actions={(
                    <button type="button" className="admin-btn admin-btn-primary" onClick={handleOpenCreateModal}>
                        <Plus size={14} />
                        새 도메인
                    </button>
                )}
            />

            <div className="admin-toolbar">
                <div className="admin-toolbar-left">
                    <div className="admin-search">
                        <Search size={16} className="admin-search-icon" />
                        <input
                            type="text"
                            className="admin-search-input"
                            placeholder="도메인 검색..."
                            value={domainSearch}
                            onChange={(e) => setDomainSearch(e.target.value)}
                            aria-label="도메인 검색"
                        />
                    </div>
                </div>
            </div>
            </div>

            <div className="admin-table-card domain-mgmt-table-card">
                <div className="admin-table-wrap">
                    <table className="admin-table domain-mgmt-table domain-mgmt-table--resizable">
                        {columnResize.colGroup}
                        <thead>
                            <tr>
                                <th className="domain-mgmt-th-name km-th-col-resizable">
                                    도메인명
                                    <span
                                        className="km-col-resize-handle"
                                        onMouseDown={(e) => columnResize.startResize(0, e)}
                                        onClick={(e) => e.stopPropagation()}
                                        aria-hidden
                                    />
                                </th>
                                <th className="domain-mgmt-th-desc km-th-col-resizable">
                                    설명
                                    <span
                                        className="km-col-resize-handle"
                                        onMouseDown={(e) => columnResize.startResize(1, e)}
                                        onClick={(e) => e.stopPropagation()}
                                        aria-hidden
                                    />
                                </th>
                                <th className="domain-mgmt-th-ws km-th-col-resizable">
                                    워크스페이스
                                    <span
                                        className="km-col-resize-handle"
                                        onMouseDown={(e) => columnResize.startResize(2, e)}
                                        onClick={(e) => e.stopPropagation()}
                                        aria-hidden
                                    />
                                </th>
                                <th className="domain-mgmt-th-created km-th-col-resizable">
                                    생성일
                                    <span
                                        className="km-col-resize-handle"
                                        onMouseDown={(e) => columnResize.startResize(3, e)}
                                        onClick={(e) => e.stopPropagation()}
                                        aria-hidden
                                    />
                                </th>
                                <th className="domain-mgmt-th-arango">ArangoDB</th>
                            </tr>
                        </thead>
                        <tbody>
                            {domains.length === 0 ? (
                                <tr className="domain-mgmt-tr-empty">
                                    <td colSpan={5} className="domain-mgmt-empty">
                                        등록된 도메인이 없습니다.
                                    </td>
                                </tr>
                            ) : filteredDomains.length === 0 ? (
                                <tr className="domain-mgmt-tr-empty">
                                    <td colSpan={5} className="domain-mgmt-empty">
                                        검색 결과가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                filteredDomains.map((domain) => (
                                    <tr
                                        key={domain.id}
                                        className="domain-mgmt-tr-clickable"
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`${domain.name} 도메인 상세 열기`}
                                        onClick={() => handleOpenEditModal(domain)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handleOpenEditModal(domain);
                                            }
                                        }}
                                    >
                                        <td className="domain-mgmt-td-name">
                                            <div className="domain-mgmt-name-row">
                                                <Globe size={16} aria-hidden className="domain-mgmt-name-icon" />
                                                <span className="domain-mgmt-name-text">{domain.name}</span>
                                            </div>
                                        </td>
                                        <td className="domain-mgmt-td-desc" title={domain.description || ''}>
                                            {domain.description || '-'}
                                        </td>
                                        <td className="domain-mgmt-td-ws">
                                            <div
                                                className="domain-mgmt-ws-cell"
                                                title={
                                                    domain.workspaces?.length > 0
                                                        ? domain.workspaces.map((ws) => ws.name).join(', ')
                                                        : '워크스페이스 없음'
                                                }
                                            >
                                                <span className="domain-mgmt-ws-badge">
                                                    <Layout size={16} aria-hidden />
                                                    {domain.workspaceCount || 0}
                                                </span>
                                                {domain.workspaces?.length > 0 && (
                                                    <span className="domain-mgmt-ws-names">
                                                        {domain.workspaces.map((ws) => ws.name).join(', ')}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="domain-mgmt-td-created admin-col-date">
                                            {new Date(domain.createdDatetime || domain.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="domain-mgmt-td-arango">
                                            <div className="domain-mgmt-arango-row">
                                                <Database size={16} aria-hidden />
                                                <span>{domain.arangoDbName}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <BaseModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditMode ? '도메인 정보 수정' : '새 도메인 추가'}
                contentClassName="km-modal-form domain-modal-content"
                paperSx={{ width: '680px', maxWidth: '95vw', maxHeight: '90vh' }}
                actions={(
                    <>
                        <div className="domain-modal-actions-left">
                            {isEditMode && (
                                <Button
                                    type="button"
                                    variant="outlined"
                                    color="error"
                                    className="persona-delete-btn"
                                    onClick={() => handleDelete(editId, formData.name)}
                                >
                                    도메인 삭제
                                </Button>
                            )}
                        </div>
                        <button type="button" className="admin-btn" onClick={() => setIsModalOpen(false)}>
                            취소
                        </button>
                        <button
                            type="button"
                            className="admin-btn admin-btn-primary"
                            onClick={handleSubmit}
                            disabled={!isEditMode && !isArangoDbChecked}
                        >
                            {isEditMode ? '수정 완료' : '생성하기'}
                        </button>
                    </>
                )}
            >
                <ModalFormField label="도메인명" required>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="도메인 이름을 입력하세요"
                        autoFocus
                    />
                </ModalFormField>

                <ModalFormField label="설명">
                    <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="도메인에 대한 한 줄 설명"
                    />
                </ModalFormField>

                <ModalFormField
                    label="ArangoDB 데이터베이스명"
                    required={!isEditMode}
                    helperText={!isEditMode ? '* 생성 후에는 변경할 수 없습니다. (영문 소문자만 가능)' : undefined}
                >
                    {isEditMode ? (
                        <input type="text" value={formData.arangoDbName} disabled />
                    ) : (
                        <div className="domain-input-group">
                            <input
                                type="text"
                                name="arangoDbName"
                                value={formData.arangoDbName}
                                onChange={handleInputChange}
                                placeholder="예: mydomaindb (소문자)"
                            />
                            <button type="button" className="admin-btn" onClick={handleDuplicateCheck}>
                                중복확인
                            </button>
                        </div>
                    )}
                </ModalFormField>

                {checkMessage && (
                    <div className={`domain-validation-msg ${isArangoDbChecked ? 'success' : 'error'}`}>
                        {isArangoDbChecked ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                        {checkMessage}
                    </div>
                )}

                <div className="domain-prompt-grid">
                    <ModalFormField
                        label="청킹 프롬프트"
                        helperText={formData.chunkPrompt === 'NONE' ? 'LLM 청킹 비활성화' : 'LLM 청킹 프롬프트'}
                        helperClassName={formData.chunkPrompt === 'NONE' ? 'domain-helper-error' : ''}
                    >
                        <div className="domain-input-group">
                            <KmModalSelect
                                value={formData.chunkPrompt}
                                onChange={handleSelectFieldChange('chunkPrompt')}
                                options={chunkPromptCodes}
                                warn={formData.chunkPrompt === 'NONE'}
                            />
                            <button
                                type="button"
                                className={`admin-btn ${formData.chunkPrompt === 'NONE' ? 'admin-btn-danger' : ''}`}
                                onClick={() => setFormData((prev) => ({ ...prev, chunkPrompt: prev.chunkPrompt === 'NONE' ? '' : 'NONE' }))}
                            >
                                NONE
                            </button>
                        </div>
                    </ModalFormField>

                    {promptSelectConfigs.map((item) => (
                        <ModalFormField key={item.key} label={item.label} helperText={item.helper}>
                            <KmModalSelect
                                value={formData[item.key]}
                                onChange={handleSelectFieldChange(item.key)}
                                options={item.options}
                            />
                        </ModalFormField>
                    ))}
                </div>

                {isEditMode && (
                    <div className="domain-info-note">
                        <Info size={16} />
                        <span>
                            <strong>시맨틱 카테고리/관계</strong>는 KnowlearnEXP의 카테고리 관리 메뉴에서 편집할 수 있습니다.
                        </span>
                    </div>
                )}

                {error && <div className="domain-error-note">{error}</div>}
            </BaseModal>
        </div>
    );
}

export default DomainManagement;

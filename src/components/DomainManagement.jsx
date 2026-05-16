import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@mui/material';
import {
    Search, Plus, Globe, CheckCircle, AlertCircle, Database, Layout, Info, FilePen, Trash2,
} from 'lucide-react';
import { useDialog } from '../hooks/useDialog';
import { useBasicTableColumnResize } from '../hooks/useBasicTableColumnResize';
import { apiCall } from '../services/api';
import AdminPageHeader from './admin/AdminPageHeader';
import BaseModal from './common/modal/BaseModal';
import ModalFormField from './common/modal/ModalFormField';
import BasicTable from './common/BasicTable';
import { mockDomains, mockDomainPromptDefaults, mockPromptCodesByPurpose } from '../data/domainMockData';
import '../pages/admin/admin-common.css';
import './DomainManagement.css';

const isDomainMockEnabled = import.meta.env.VITE_ENABLE_DOMAIN_MOCK === 'true';
const PROMPT_PURPOSES = ['CHUNK', 'ONTOLOGY', 'CHAT_RESULT', 'CONTENT_ONTOLOGY', 'SCHEMA_ANALYSIS', 'INTER_TABLE_ANALYSIS', 'AQL_GENERATION', 'AQL_INTERPRETATION', 'AGGREGATION_STRATEGY'];

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
    const [, setPromptDefaults] = useState({});
    const [domainSearch, setDomainSearch] = useState('');

    const domainTableColumnDefinitions = useMemo(
        () => [
            { id: 'name', label: '도메인명', defaultWidthPx: 260, minWidthPx: 160, align: 'left' },
            { id: 'description', label: '설명', defaultWidthPx: 280, minWidthPx: 200, align: 'left' },
            { id: '_workspaces', label: '워크스페이스', defaultWidthPx: 240, minWidthPx: 208, align: 'left', ellipsis: false },
            { id: '_created', label: '생성일', defaultWidthPx: 112, minWidthPx: 112, align: 'left' },
            { id: 'arangoDbName', label: 'ArangoDB', defaultWidthPx: 104, minWidthPx: 104, align: 'left' },
            {
                id: 'actions',
                label: <span className="domain-mgmt-actions-head">관리</span>,
                defaultWidthPx: 120,
                minWidthPx: 120,
                align: 'right',
                ellipsis: false,
            },
        ],
        []
    );

    const { columns: domainTableColumns, startResize: domainColumnStartResize } = useBasicTableColumnResize({
        definitions: domainTableColumnDefinitions,
        storageKey: 'km-domain-mgmt-columns-v1',
        enabled: true,
    });

    const fetchDomains = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 시 도메인 목록 1회 로드
        fetchDomains();
    }, [fetchDomains]);

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

    const renderPromptCodeSelect = (fieldKey, options, { ariaLabel, warnNone = false } = {}) => {
        const value = formData[fieldKey] ?? '';
        const warnClass = warnNone && value === 'NONE' ? 'modal-input--chunk-none' : '';
        return (
            <select
                value={value}
                onChange={handleSelectFieldChange(fieldKey)}
                className={warnClass || undefined}
                aria-label={ariaLabel}
            >
                <option value="">-- 기본값 --</option>
                {(options || []).map((code) => (
                    <option key={code} value={code}>
                        {code}
                    </option>
                ))}
            </select>
        );
    };

    const renderDomainCell = useCallback(({ column, row: domain }) => {
        switch (column.id) {
            case 'name':
                return (
                    <div className="domain-mgmt-name-row">
                        <Globe size={16} aria-hidden className="domain-mgmt-name-icon" />
                        <span className="domain-mgmt-name-text">{domain.name}</span>
                    </div>
                );
            case 'description':
                return (
                    <span className="domain-mgmt-desc-text" title={domain.description || ''}>
                        {domain.description || '-'}
                    </span>
                );
            case '_workspaces':
                return (
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
                        {domain.workspaces?.length > 0 ? (
                            <span className="domain-mgmt-ws-names">
                                {domain.workspaces.map((ws) => ws.name).join(', ')}
                            </span>
                        ) : null}
                    </div>
                );
            case '_created':
                return (
                    <span className="domain-mgmt-date-text">
                        {new Date(domain.createdDatetime || domain.createdAt).toLocaleDateString()}
                    </span>
                );
            case 'arangoDbName':
                return (
                    <div className="domain-mgmt-arango-row">
                        <Database size={16} aria-hidden />
                        <span>{domain.arangoDbName}</span>
                    </div>
                );
            case 'actions':
                return (
                    <div className="domain-mgmt-actions">
                        <button
                            type="button"
                            className="kl-table-icon-btn kl-table-icon-btn--neutral"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditModal(domain);
                            }}
                            title="도메인 수정"
                            aria-label={`${domain.name} 도메인 수정`}
                        >
                            <FilePen strokeWidth={1.75} aria-hidden />
                        </button>
                        <button
                            type="button"
                            className="kl-table-icon-btn kl-table-icon-btn--danger"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(domain.id, domain.name);
                            }}
                            title="도메인 삭제"
                            aria-label={`${domain.name} 도메인 삭제`}
                        >
                            <Trash2 strokeWidth={1.75} aria-hidden />
                        </button>
                    </div>
                );
            default:
                return undefined;
        }
    }, [handleOpenEditModal, handleDelete]);

    return (
        <div className="kl-page">
            <div className="kl-main-sticky-head">
            <AdminPageHeader
                title="도메인 관리"
                count={domains.length}
                actions={(
                    <button type="button" className="admin-btn admin-btn-primary" onClick={handleOpenCreateModal}>
                        <Plus size={14} aria-hidden />
                        새 도메인
                    </button>
                )}
            />

            
            </div>

            <div className="table-area">
                    <div className="table-toolbar">
                    <div className="toolbar-left">
                    <div className="search-area">
                    <Search size={16} className="search-area-icon" />
                    <input
                    type="text"
                    className="search-area-input"
                    placeholder="도메인 검색..."
                    value={domainSearch}
                    onChange={(e) => setDomainSearch(e.target.value)}
                    aria-label="도메인 검색"
                    />
                    </div>
                    </div>
                    </div>

                <div className="basic-table-shell">
                    {domains.length === 0 ? (
                        <div className="domain-mgmt-empty domain-mgmt-empty--solo" role="status">
                            등록된 도메인이 없습니다.
                        </div>
                    ) : filteredDomains.length === 0 ? (
                        <div className="domain-mgmt-empty domain-mgmt-empty--solo" role="status">
                            검색 결과가 없습니다.
                        </div>
                    ) : (
                        <BasicTable
                            className="domain-mgmt-basic-table"
                            columns={domainTableColumns}
                            data={filteredDomains}
                            renderCell={renderDomainCell}
                            onColumnResizeMouseDown={domainColumnStartResize}
                        />
                    )}
                </div>
            </div>

            <BaseModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditMode ? '도메인 정보 수정' : '새 도메인 추가'}
                contentClassName="kl-modal-form domain-modal-content"
                paperSx={{ width: '680px', maxWidth: '95vw', maxHeight: '90vh' }}
                actions={(
                    <>
                        <Button variant="outlined" onClick={() => setIsModalOpen(false)}>
                            취소
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={!isEditMode && !isArangoDbChecked}
                        >
                            {isEditMode ? '수정 완료' : '생성하기'}
                        </Button>
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
                            <button type="button" className="domain-mgmt-btn" onClick={handleDuplicateCheck}>
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
                            {renderPromptCodeSelect('chunkPrompt', chunkPromptCodes, {
                                ariaLabel: '청킹 프롬프트',
                                warnNone: true,
                            })}
                            <button
                                type="button"
                                className={`domain-mgmt-btn ${formData.chunkPrompt === 'NONE' ? 'domain-mgmt-btn--danger' : ''}`}
                                onClick={() => setFormData((prev) => ({ ...prev, chunkPrompt: prev.chunkPrompt === 'NONE' ? '' : 'NONE' }))}
                            >
                                NONE
                            </button>
                        </div>
                    </ModalFormField>

                    {promptSelectConfigs.map((item) => (
                        <ModalFormField key={item.key} label={item.label} helperText={item.helper}>
                            {renderPromptCodeSelect(item.key, item.options, { ariaLabel: item.label })}
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

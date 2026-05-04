import { useState, useEffect } from 'react';
import { Search, Plus, X, Globe, CheckCircle, AlertCircle, Trash2, Edit2, Database, Layout, Info } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { apiCall } from '../services/api';
import PageHeader from './common/PageHeader';
import './DomainManagement.css';

function DomainManagement() {
    const { showAlert, showConfirm } = useAlert();
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

    useEffect(() => {
        fetchDomains();
    }, []);

    const fetchDomains = async () => {
        try {
            const data = await apiCall('/domains');
            setDomains(data);
        } catch (err) {
            console.error('Failed to fetch domains', err);
        }
    };

    const fetchPromptDefaults = async () => {
        try {
            const data = await apiCall('/domains/prompt-defaults');
            setPromptDefaults(data);
            return data;
        } catch (err) {
            console.error('프롬프트 기본값 조회 실패:', err);
        }
        return {};
    };

    const fetchPromptCodesByPurpose = async () => {
        try {
            const purposes = ['CHUNK', 'ONTOLOGY', 'CHAT_RESULT', 'CONTENT_ONTOLOGY', 'SCHEMA_ANALYSIS', 'INTER_TABLE_ANALYSIS', 'AQL_GENERATION', 'AQL_INTERPRETATION', 'AGGREGATION_STRATEGY'];
            const results = await Promise.all(
                purposes.map(purpose =>
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
        const confirmed = await showConfirm(`정말 '${name}' 도메인을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없으며, 연결된 데이터가 모두 삭제됩니다 (워크스페이스가 없어야 삭제 가능).`);
        if (!confirmed) {
            return;
        }

        try {
            await apiCall(`/domains/${id}`, { method: 'DELETE' });
            fetchDomains();
        } catch (err) {
            showAlert('삭제 실패: ' + (err.message || '오류가 발생했습니다.'), 'error');
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

    return (
        <div className="domain-management-container">
            <PageHeader
                title="도메인 관리"
                breadcrumbs={['어드민센터']}
                actions={(
                    <div className="domain-toolbar">
                        <div className="search-wrapper">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                className="domain-search-input"
                                placeholder="도메인 검색..."
                            />
                        </div>
                        <button
                            className="new-domain-btn"
                            onClick={handleOpenCreateModal}
                        >
                            <Plus size={18} />
                            새 도메인
                        </button>
                    </div>
                )}
            />

            <div className="domain-table-container">
                <table className="domain-table">
                    <thead>
                        <tr>
                            <th>도메인명</th>
                            <th>설명</th>
                            <th>프롬프트</th>
                            <th style={{ textAlign: 'center' }}>워크스페이스</th>
                            <th>생성일</th>
                            <th>ArangoDB</th>
                            <th style={{ textAlign: 'right' }}>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {domains.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="empty-state">
                                    등록된 도메인이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            domains.map((domain) => (
                                <tr key={domain.id}>
                                    <td className="domain-name-cell">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Globe size={16} color="#475569" />
                                            {domain.name}
                                        </div>
                                    </td>
                                    <td>{domain.description || '-'}</td>
                                    <td>
                                        <div className="prompt-tag-grid">
                                            {[
                                                { label: 'chunk', value: domain.chunkPrompt, color: domain.chunkPrompt === 'NONE' ? '#dc2626' : '#7c3aed' },
                                                { label: 'ontology', value: domain.ontologyPrompt, color: '#1e40af' },
                                                { label: 'chat', value: domain.chatResultPrompt, color: '#047857' },
                                                { label: 'content', value: domain.contentOntologyPrompt, color: '#9333ea' },
                                                { label: 'schema', value: domain.schemaAnalysisPrompt, color: '#ea580c' },
                                                { label: 'interTable', value: domain.interTableAnalysisPrompt, color: '#0891b2' },
                                                { label: 'aqlGen', value: domain.aqlGenerationPrompt, color: '#4f46e5' },
                                                { label: 'aqlInterp', value: domain.aqlInterpretationPrompt, color: '#be185d' },
                                                { label: 'aggStrategy', value: domain.aggregationStrategyPrompt, color: '#059669' },
                                            ].map(({ label, value, color }) => (
                                                <span key={label} className={`prompt-tag ${value ? 'prompt-tag--active' : ''}`}
                                                    style={value ? { borderColor: color, color } : {}}>
                                                    <span className="prompt-tag__label">{label}</span>
                                                    <span className="prompt-tag__value">{value || '기본값'}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                padding: '4px 8px', backgroundColor: '#f1f5f9', borderRadius: '12px',
                                                fontSize: '12px', fontWeight: '500', color: '#475569',
                                                cursor: domain.workspaces?.length > 0 ? 'pointer' : 'default',
                                                position: 'relative'
                                            }}
                                            title={domain.workspaces?.length > 0
                                                ? domain.workspaces.map(ws => `${ws.name} (${ws.createdBy})`).join('\n')
                                                : '워크스페이스 없음'}
                                        >
                                            <Layout size={12} />
                                            {domain.workspaceCount || 0}
                                        </span>
                                        {domain.workspaces?.length > 0 && (
                                            <div style={{ marginTop: '4px' }}>
                                                {domain.workspaces.map(ws => (
                                                    <div key={ws.id} style={{
                                                        fontSize: '11px', color: '#64748b',
                                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                        maxWidth: '160px'
                                                    }}>
                                                        {ws.name} <span style={{ color: '#94a3b8' }}>({ws.createdBy})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td>{new Date(domain.createdDatetime || domain.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b' }}>
                                            <Database size={14} />
                                            {domain.arangoDbName}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button
                                                onClick={() => handleOpenEditModal(domain)}
                                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#3b82f6', padding: '4px' }}
                                                title="수정"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(domain.id, domain.name)}
                                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                                                title="삭제"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{isEditMode ? '도메인 정보 수정' : '새 도메인 추가'}</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">도메인명</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="도메인 이름을 입력하세요"
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">설명</label>
                                <input
                                    type="text"
                                    name="description"
                                    className="form-input"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="도메인에 대한 한 줄 설명"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">ArangoDB 데이터베이스명</label>
                                {isEditMode ? (
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.arangoDbName}
                                        disabled
                                        style={{ backgroundColor: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' }}
                                    />
                                ) : (
                                    <>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                name="arangoDbName"
                                                className="form-input"
                                                value={formData.arangoDbName}
                                                onChange={handleInputChange}
                                                placeholder="예: mydomaindb (소문자)"
                                            />
                                            <button className="check-btn" onClick={handleDuplicateCheck}>
                                                중복확인
                                            </button>
                                        </div>
                                        {checkMessage && (
                                            <div className={`validation-msg ${isArangoDbChecked ? 'success' : 'error'}`}>
                                                {isArangoDbChecked ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                                {checkMessage}
                                            </div>
                                        )}
                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                                            * 생성 후에는 변경할 수 없습니다. (영문 소문자만 가능)
                                        </div>
                                    </>
                                )}
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '12px 16px',
                                marginBottom: '12px'
                            }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">청킹 프롬프트</label>
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                        <select
                                            name="chunkPrompt"
                                            className="form-input"
                                            style={{ flex: 1, marginBottom: 0, ...(formData.chunkPrompt === 'NONE' ? { backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#dc2626', fontWeight: '600' } : {}) }}
                                            value={formData.chunkPrompt}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">-- 기본값 --</option>
                                            {chunkPromptCodes.map(code => (
                                                <option key={code} value={code}>{code}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            className="check-btn"
                                            onClick={() => setFormData(prev => ({ ...prev, chunkPrompt: prev.chunkPrompt === 'NONE' ? '' : 'NONE' }))}
                                            style={{
                                                ...(formData.chunkPrompt === 'NONE'
                                                    ? { backgroundColor: '#dc2626', color: '#fff', borderColor: '#dc2626' }
                                                    : {})
                                            }}
                                        >
                                            NONE
                                        </button>
                                    </div>
                                    <div style={{ fontSize: '11px', color: formData.chunkPrompt === 'NONE' ? '#dc2626' : '#94a3b8', marginTop: '4px' }}>
                                        {formData.chunkPrompt === 'NONE' ? 'LLM 청킹 비활성화' : 'LLM 청킹 프롬프트'}
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">온톨로지 프롬프트</label>
                                    <select
                                        name="ontologyPrompt"
                                        className="form-input"
                                        value={formData.ontologyPrompt}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">-- 기본값 --</option>
                                        {ontologyPromptCodes.map(code => (
                                            <option key={code} value={code}>{code}</option>
                                        ))}
                                    </select>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                        Chunk → LLM 온톨로지 추출
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">채팅 프롬프트</label>
                                    <select
                                        name="chatResultPrompt"
                                        className="form-input"
                                        value={formData.chatResultPrompt}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">-- 기본값 --</option>
                                        {chatPromptCodes.map(code => (
                                            <option key={code} value={code}>{code}</option>
                                        ))}
                                    </select>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                        Chat 응답 생성
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">CONTENT 온톨로지</label>
                                    <select
                                        name="contentOntologyPrompt"
                                        className="form-input"
                                        value={formData.contentOntologyPrompt}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">-- 기본값 --</option>
                                        {contentOntologyPromptCodes.map(code => (
                                            <option key={code} value={code}>{code}</option>
                                        ))}
                                    </select>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                        정형 Chunk → LLM 온톨로지
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">스키마 분석</label>
                                    <select
                                        name="schemaAnalysisPrompt"
                                        className="form-input"
                                        value={formData.schemaAnalysisPrompt}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">-- 기본값 --</option>
                                        {schemaAnalysisPromptCodes.map(code => (
                                            <option key={code} value={code}>{code}</option>
                                        ))}
                                    </select>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                        CSV/DB 스키마 자동 분석
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">테이블 간 관계 분석</label>
                                    <select
                                        name="interTableAnalysisPrompt"
                                        className="form-input"
                                        value={formData.interTableAnalysisPrompt}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">-- 기본값 --</option>
                                        {interTableAnalysisPromptCodes.map(code => (
                                            <option key={code} value={code}>{code}</option>
                                        ))}
                                    </select>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                        다건 테이블 간 FK/관계 분석
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">AQL 생성</label>
                                    <select
                                        name="aqlGenerationPrompt"
                                        className="form-input"
                                        value={formData.aqlGenerationPrompt}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">-- 기본값 --</option>
                                        {aqlGenerationPromptCodes.map(code => (
                                            <option key={code} value={code}>{code}</option>
                                        ))}
                                    </select>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                        자연어 → AQL 쿼리 생성
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">AQL 결과 해석</label>
                                    <select
                                        name="aqlInterpretationPrompt"
                                        className="form-input"
                                        value={formData.aqlInterpretationPrompt}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">-- 기본값 --</option>
                                        {aqlInterpretationPromptCodes.map(code => (
                                            <option key={code} value={code}>{code}</option>
                                        ))}
                                    </select>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                        AQL 쿼리 결과 자연어 해석
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">집계 전략</label>
                                    <select
                                        name="aggregationStrategyPrompt"
                                        className="form-input"
                                        value={formData.aggregationStrategyPrompt}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">-- 기본값 --</option>
                                        {aggregationStrategyPromptCodes.map(code => (
                                            <option key={code} value={code}>{code}</option>
                                        ))}
                                    </select>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                        대규모 정형 데이터 집계 전략
                                    </div>
                                </div>
                            </div>

                            {isEditMode && (
                                <div style={{
                                    marginTop: '20px',
                                    padding: '12px 16px',
                                    backgroundColor: '#fef3c7',
                                    borderRadius: '8px',
                                    border: '1px solid #fde68a',
                                    fontSize: '13px',
                                    color: '#92400e',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <Info size={16} />
                                    <span>
                                        <strong>시맨틱 카테고리/관계</strong>는 KnowlearnEXP의 카테고리 관리 메뉴에서 편집할 수 있습니다.
                                    </span>
                                </div>
                            )}

                            {error && (
                                <div style={{
                                    padding: '10px',
                                    backgroundColor: '#fee2e2',
                                    color: '#dc2626',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    marginBottom: '16px'
                                }}>
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn-cancel"
                                onClick={() => setIsModalOpen(false)}
                            >
                                취소
                            </button>
                            <button
                                className="btn-submit"
                                onClick={handleSubmit}
                                disabled={!isEditMode && !isArangoDbChecked}
                            >
                                {isEditMode ? '수정 완료' : '생성하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DomainManagement;

import React, { useState, useEffect } from 'react';
import { adminConfigApi } from '../../services/api';
import { Box, Button, Typography } from '@mui/material';
import { useAlert } from '../../context/AlertContext';
import { RotateCcw, Settings, RefreshCw, HelpCircle } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import BaseModal from '../../components/common/modal/BaseModal';
import './admin-common.css';

const CATEGORY_LABELS = {
    BATCH: '배치 처리',
    GRAPH: '그래프 제한',
    ARANGO: 'ArangoDB 컬렉션',
    PROMPT: '프롬프트',
    STRUCTURED: '정형 데이터',
    PERSONA: '페르소나',
    TIMEOUT: '타임아웃 & 재시도',
    STATUS: '상태값',
    CHAT: '채팅',
    ROLE: '역할',
    FILE: '파일 업로드',
    GRADE: '등급별 제한',
    MODEL: 'AI 모델'
};

// 카테고리별 역할 설명 (관리자가 한눈에 이해 가능하도록)
const CATEGORY_DESCRIPTIONS = {
    BATCH: {
        title: '배치 처리',
        summary: 'LLM/정형 데이터 배치 처리 시 동시성과 청크 크기를 제어합니다.',
        details: [
            'LLM_BATCH_SIZE: 한 번의 LLM 호출에 포함되는 레코드 개수',
            'LLM_PARALLEL_SIZE: 동시에 실행되는 LLM 워커 스레드 수',
            '값을 높이면 처리 속도는 빨라지지만 API 비용과 메모리 사용량이 증가합니다.'
        ]
    },
    GRAPH: {
        title: '그래프 제한',
        summary: '지식그래프 시각화 및 탐색 시 노드/엣지 개수 상한을 제어합니다.',
        details: [
            '값이 너무 크면 브라우저가 느려지고, 너무 작으면 중요한 연결이 잘립니다.',
            '일반적으로 500~2000 범위가 적절합니다.'
        ]
    },
    ARANGO: {
        title: 'ArangoDB 컬렉션',
        summary: 'ArangoDB 그래프/벡터 저장소에서 사용하는 컬렉션 이름을 정의합니다.',
        details: [
            '운영 중 변경하면 기존 데이터와 단절될 수 있으므로 신중하게 변경하세요.',
            '이름 변경 시 사전에 데이터 마이그레이션이 필요합니다.'
        ]
    },
    PROMPT: {
        title: '프롬프트',
        summary: '시스템 기본 프롬프트 템플릿 및 프롬프트 관련 동작을 제어합니다.',
        details: [
            '프롬프트 용도별 기본값이 지정되어 있으며, 도메인/워크스페이스별로 오버라이드 가능합니다.',
            '"NONE" 또는 빈 값으로 두면 해당 기능이 명시적으로 스킵됩니다.'
        ]
    },
    STRUCTURED: {
        title: '정형 데이터',
        summary: 'CSV/DB 정형 데이터 파이프라인(파싱, 매핑, 집계)의 동작 파라미터입니다.',
        details: [
            '월별 시리즈 감지, 집계 전략, Text-to-SQL 관련 설정을 포함합니다.'
        ]
    },
    PERSONA: {
        title: '페르소나',
        summary: '채팅 응답에 사용되는 페르소나(말투/역할) 프리셋입니다.'
    },
    TIMEOUT: {
        title: '타임아웃 & 재시도',
        summary: '외부 API 호출(LLM, DB 등)의 타임아웃과 재시도 정책을 제어합니다.',
        details: [
            '너무 짧으면 정상 응답도 실패 처리되고, 너무 길면 장애 감지가 늦어집니다.'
        ]
    },
    STATUS: {
        title: '상태값',
        summary: '문서, 파이프라인 등 각 엔티티의 상태 코드 목록입니다. 일반적으로 수정 불필요.'
    },
    CHAT: {
        title: '채팅',
        summary: '채팅 화면의 동작(디버그 패널 표시, RAG/온톨로지 디버그 등)을 제어합니다.'
    },
    ROLE: {
        title: '역할',
        summary: '시스템 내 사용자 역할(ADMIN, USER 등) 관련 설정입니다.'
    },
    FILE: {
        title: '파일 업로드',
        summary: '업로드 가능한 파일 확장자, 크기 제한 등을 정의합니다.',
        details: [
            '보안 및 스토리지 용량을 고려해 설정하세요.'
        ]
    },
    GRADE: {
        title: '등급별 제한',
        summary: '회원 등급(FREE, BASIC, PRO 등)별 워크스페이스/소스/페이지 개수 상한을 제어합니다.',
        details: [
            'SPECIAL/ADMIN 등급은 UI에 노출되지 않습니다.'
        ]
    },
    MODEL: {
        title: 'AI 모델',
        summary: '사용 중인 LLM 모델 이름, 임베딩 모델, API 관련 파라미터를 정의합니다.',
        details: [
            '모델을 변경하면 비용/품질/응답속도가 크게 달라질 수 있습니다.'
        ]
    },
    ETC: {
        title: '기타',
        summary: '분류되지 않은 기타 설정입니다.'
    }
};

function AdminConfigManagement() {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingKey, setEditingKey] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [helpModal, setHelpModal] = useState(null); // { type: 'row'|'category', data }
    const { showAlert } = useAlert();

    const openRowHelp = (config) => setHelpModal({ type: 'row', data: config });
    const openCategoryHelp = (category) => setHelpModal({ type: 'category', data: category });
    const closeHelp = () => setHelpModal(null);

    const fetchCategories = async () => {
        try {
            const data = await adminConfigApi.getCategories();
            setCategories(data || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchConfigs = async (category) => {
        try {
            setLoading(true);
            const cat = category !== undefined ? category : selectedCategory;
            const data = await adminConfigApi.getAll(cat || undefined);
            setConfigs(data || []);
        } catch (error) {
            console.error('Failed to fetch configs:', error);
            showAlert('시스템 설정을 불러오는데 실패했습니다.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchConfigs('');
    }, []);

    const handleCategoryChange = (e) => {
        const cat = e.target.value;
        setSelectedCategory(cat);
        fetchConfigs(cat);
    };

    const handleEdit = (config) => {
        setEditingKey(config.configKey);
        setEditValue(config.configValue);
    };

    const handleCancel = () => {
        setEditingKey(null);
        setEditValue('');
    };

    const handleSave = async (key) => {
        try {
            setSaving(true);
            await adminConfigApi.update(key, editValue);
            showAlert('설정이 저장되었습니다.', 'success');
            setEditingKey(null);
            setEditValue('');
            fetchConfigs();
        } catch (error) {
            console.error('Failed to save config:', error);
            showAlert('설정 저장에 실패했습니다.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleRefreshCache = async () => {
        try {
            await adminConfigApi.refreshCache();
            showAlert('캐시가 새로고침되었습니다.', 'success');
        } catch (error) {
            console.error('Failed to refresh cache:', error);
            showAlert('캐시 새로고침에 실패했습니다.', 'error');
        }
    };

    // 카테고리별로 그룹화
    const groupedConfigs = configs.reduce((acc, config) => {
        const category = config.category || 'ETC';
        if (!acc[category]) acc[category] = [];
        acc[category].push(config);
        return acc;
    }, {});

    const thStyle = { padding: '10px 12px', fontWeight: 600, color: '#555', textAlign: 'left' };
    const tdStyle = { padding: '10px 12px', color: '#666' };

    return (
        <div className="admin-page">
            <AdminPageHeader
                icon={Settings}
                title="시스템 설정 관리"
                count={configs.length}
                actions={(
                    <>
                        <button
                            onClick={handleRefreshCache}
                            className="admin-btn admin-btn-sm"
                            title="캐시 새로고침"
                            style={{ borderColor: '#4CAF50', background: '#e8f5e9', color: '#2e7d32' }}
                        >
                            <RefreshCw size={14} />
                            캐시 갱신
                        </button>
                        <button onClick={() => fetchConfigs()} className="admin-btn admin-btn-icon" title="새로고침">
                            <RotateCcw size={16} />
                        </button>
                    </>
                )}
            />

            <div className="admin-toolbar">
                <div className="admin-toolbar-left" style={{ maxWidth: '260px' }}>
                <select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    style={{
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: 'var(--admin-font-base)',
                        background: 'white',
                        cursor: 'pointer',
                        minWidth: '160px'
                    }}
                >
                    <option value="">전체 카테고리</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>
                            {CATEGORY_LABELS[cat] || cat}
                        </option>
                    ))}
                </select>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                    데이터를 불러오는 중...
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {Object.entries(groupedConfigs).map(([category, categoryConfigs]) => (
                        <div key={category} style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                            <div style={{ background: '#f8f9fa', padding: '12px 16px', borderBottom: '1px solid #e0e0e0', fontWeight: 600, color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>{CATEGORY_LABELS[category] || category}</span>
                                <button
                                    onClick={() => openCategoryHelp(category)}
                                    title="카테고리 설명 보기"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '22px',
                                        height: '22px',
                                        border: '1px solid #1976d2',
                                        borderRadius: '50%',
                                        background: '#e3f2fd',
                                        color: '#1976d2',
                                        cursor: 'pointer',
                                        padding: 0
                                    }}
                                >
                                    <HelpCircle size={14} />
                                </button>
                                <span style={{ marginLeft: '4px', fontSize: 'var(--admin-font-sm)', color: '#888', fontWeight: 400 }}>
                                    ({categoryConfigs.length}개)
                                </span>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--admin-font-md)' }}>
                                <thead>
                                    <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                                        <th style={{ ...thStyle, width: '30%' }}>키</th>
                                        <th style={{ ...thStyle, width: '25%' }}>값</th>
                                        <th style={{ ...thStyle, width: '10%' }}>타입</th>
                                        <th style={{ ...thStyle, width: '25%' }}>설명</th>
                                        <th style={{ ...thStyle, width: '10%', textAlign: 'center' }}>액션</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categoryConfigs.map(config => (
                                        <tr key={config.configKey} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 'var(--admin-font-sm)', color: '#1976d2' }}>
                                                {config.configKey}
                                            </td>
                                            <td style={tdStyle}>
                                                {editingKey === config.configKey ? (
                                                    <textarea
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '6px 8px',
                                                            border: '1px solid #1976d2',
                                                            borderRadius: '4px',
                                                            fontSize: 'var(--admin-font-base)',
                                                            fontFamily: 'monospace',
                                                            minHeight: '80px',
                                                            resize: 'vertical',
                                                            lineHeight: '1.5'
                                                        }}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span style={{
                                                        fontFamily: 'monospace',
                                                        fontSize: 'var(--admin-font-base)',
                                                        background: '#f5f5f5',
                                                        padding: '2px 6px',
                                                        borderRadius: '3px',
                                                        whiteSpace: 'pre-wrap',
                                                        display: 'block',
                                                        maxHeight: '120px',
                                                        overflowY: 'auto'
                                                    }}>
                                                        {config.configValue}
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ ...tdStyle, fontSize: 'var(--admin-font-sm)' }}>
                                                <span style={{
                                                    padding: '2px 6px',
                                                    borderRadius: '10px',
                                                    fontSize: 'var(--admin-font-xs)',
                                                    background: config.dataType === 'INT' || config.dataType === 'LONG' ? '#e3f2fd' :
                                                               config.dataType === 'BOOLEAN' ? '#fff3e0' : '#f3e5f5',
                                                    color: config.dataType === 'INT' || config.dataType === 'LONG' ? '#1565c0' :
                                                           config.dataType === 'BOOLEAN' ? '#ef6c00' : '#7b1fa2'
                                                }}>
                                                    {config.dataType}
                                                </span>
                                            </td>
                                            <td style={{ ...tdStyle, fontSize: 'var(--admin-font-base)', color: '#888' }}>
                                                {config.description}
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                {editingKey === config.configKey ? (
                                                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                                        <button
                                                            onClick={() => handleSave(config.configKey)}
                                                            disabled={saving}
                                                            style={{
                                                                padding: '4px 8px',
                                                                border: '1px solid #4CAF50',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                background: '#e8f5e9',
                                                                color: '#2e7d32',
                                                                fontSize: 'var(--admin-font-sm)'
                                                            }}
                                                        >
                                                            저장
                                                        </button>
                                                        <button
                                                            onClick={handleCancel}
                                                            style={{
                                                                padding: '4px 8px',
                                                                border: '1px solid #ddd',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                background: 'white',
                                                                color: '#666',
                                                                fontSize: 'var(--admin-font-sm)'
                                                            }}
                                                        >
                                                            취소
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center' }}>
                                                        <button
                                                            onClick={() => handleEdit(config)}
                                                            style={{
                                                                padding: '4px 8px',
                                                                border: '1px solid #1976d2',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                background: '#e3f2fd',
                                                                color: '#1976d2',
                                                                fontSize: 'var(--admin-font-sm)'
                                                            }}
                                                        >
                                                            수정
                                                        </button>
                                                        <button
                                                            onClick={() => openRowHelp(config)}
                                                            title="이 설정 설명 보기"
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                width: '24px',
                                                                height: '24px',
                                                                border: '1px solid #1976d2',
                                                                borderRadius: '50%',
                                                                background: '#e3f2fd',
                                                                color: '#1976d2',
                                                                cursor: 'pointer',
                                                                padding: 0
                                                            }}
                                                        >
                                                            <HelpCircle size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}

            <BaseModal
                open={Boolean(helpModal)}
                title={(
                    <span className="admin-config-help-title">
                        <HelpCircle size={18} color="#1976d2" />
                        {helpModal?.type === 'category'
                            ? `카테고리 설명: ${CATEGORY_LABELS[helpModal?.data] || helpModal?.data || ''}`
                            : '설정 항목 설명'}
                    </span>
                )}
                onClose={closeHelp}
                maxWidth="md"
                contentClassName="admin-config-help-content km-modal-form"
                showCloseButton={false}
                actions={(
                    <Button variant="outlined" onClick={closeHelp}>
                        닫기
                    </Button>
                )}
                actionsAlign="right"
            >
                {helpModal?.type === 'category' ? (
                    (() => {
                        const info = CATEGORY_DESCRIPTIONS[helpModal.data] || { summary: '설명이 없습니다.' };
                        return (
                            <Box className="admin-config-help-category-wrap">
                                <Typography className="admin-config-help-summary">{info.summary}</Typography>
                                {info.details && info.details.length > 0 && (
                                    <ul className="admin-config-help-details">
                                        {info.details.map((d, i) => (
                                            <li key={i}>{d}</li>
                                        ))}
                                    </ul>
                                )}
                            </Box>
                        );
                    })()
                ) : (
                    <Box className="admin-config-help-field-list">
                        <div>
                            <div className="admin-config-help-label">키</div>
                            <div className="admin-config-help-code-block">{helpModal?.data?.configKey}</div>
                        </div>
                        <div className="admin-config-help-split-row">
                            <div>
                                <div className="admin-config-help-label">카테고리</div>
                                <div className="admin-config-help-text">
                                    {CATEGORY_LABELS[helpModal?.data?.category] || helpModal?.data?.category || '-'}
                                </div>
                            </div>
                            <div>
                                <div className="admin-config-help-label">타입</div>
                                <div className="admin-config-help-text">{helpModal?.data?.dataType || '-'}</div>
                            </div>
                        </div>
                        <div>
                            <div className="admin-config-help-label">현재 값</div>
                            <div className="admin-config-help-value-block">{helpModal?.data?.configValue || '(빈 값)'}</div>
                        </div>
                        <div>
                            <div className="admin-config-help-label">설명</div>
                            <div className="admin-config-help-description">
                                {helpModal?.data?.description || '등록된 설명이 없습니다. 관리자에게 문의하세요.'}
                            </div>
                        </div>
                    </Box>
                )}
            </BaseModal>
        </div>
    );
}

export default AdminConfigManagement;

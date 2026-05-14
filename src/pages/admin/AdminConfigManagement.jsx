import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { adminConfigApi } from '../../services/api';
import { Box, Button, MenuItem, Select, Typography } from '@mui/material';
import { useDialog } from '../../hooks/useDialog';
import { useBasicTableColumnResize } from '../../hooks/useBasicTableColumnResize';
import { RotateCcw, RefreshCw, HelpCircle, FilePen, Info } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import BasicTable from '../../components/common/BasicTable';
import KmPopover from '../../components/common/KmPopover';
import BaseModal from '../../components/common/modal/BaseModal';
import { mockAdminConfigCategories, mockAdminConfigItems } from '../../data/adminConfigMockData';
import { promptToolbarSelectSx } from './promptToolbarSelectSx';
import './admin-common.css';
import './AdminConfigManagement.css';

const isMockEnabled = import.meta.env.VITE_ENABLE_ADMIN_CONFIG_MOCK === 'true';

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
    MODEL: 'AI 모델',
    SEMANTIC: '시멘틱',
    SLLM: 'SLLM',
    ETC: '기타',
};

const CATEGORY_DESCRIPTIONS = {
    BATCH: {
        title: '배치 처리',
        summary: 'LLM/정형 데이터 배치 처리 시 동시성과 청크 크기를 제어합니다.',
        details: [
            'LLM_BATCH_SIZE: 한 번의 LLM 호출에 포함되는 레코드 개수',
            'LLM_PARALLEL_SIZE: 동시에 실행되는 LLM 워커 스레드 수',
            '값을 높이면 처리 속도는 빨라지지만 API 비용과 메모리 사용량이 증가합니다.',
        ],
    },
    GRAPH: {
        title: '그래프 제한',
        summary: '지식그래프 시각화 및 탐색 시 노드/엣지 개수 상한을 제어합니다.',
        details: [
            '값이 너무 크면 브라우저가 느려지고, 너무 작으면 중요한 연결이 잘립니다.',
            '일반적으로 500~2000 범위가 적절합니다.',
        ],
    },
    ARANGO: {
        title: 'ArangoDB 컬렉션',
        summary: 'ArangoDB 그래프/벡터 저장소에서 사용하는 컬렉션 이름을 정의합니다.',
        details: [
            '운영 중 변경하면 기존 데이터와 단절될 수 있으므로 신중하게 변경하세요.',
            '이름 변경 시 사전에 데이터 마이그레이션이 필요합니다.',
        ],
    },
    PROMPT: {
        title: '프롬프트',
        summary: '시스템 기본 프롬프트 템플릿 및 프롬프트 관련 동작을 제어합니다.',
        details: [
            '프롬프트 용도별 기본값이 지정되어 있으며, 도메인/워크스페이스별로 오버라이드 가능합니다.',
            '"NONE" 또는 빈 값으로 두면 해당 기능이 명시적으로 스킵됩니다.',
        ],
    },
    STRUCTURED: {
        title: '정형 데이터',
        summary: 'CSV/DB 정형 데이터 파이프라인(파싱, 매핑, 집계)의 동작 파라미터입니다.',
        details: ['월별 시리즈 감지, 집계 전략, Text-to-SQL 관련 설정을 포함합니다.'],
    },
    PERSONA: {
        title: '페르소나',
        summary: '채팅 응답에 사용되는 페르소나(말투/역할) 프리셋입니다.',
    },
    TIMEOUT: {
        title: '타임아웃 & 재시도',
        summary: '외부 API 호출(LLM, DB 등)의 타임아웃과 재시도 정책을 제어합니다.',
        details: ['너무 짧으면 정상 응답도 실패 처리되고, 너무 길면 장애 감지가 늦어집니다.'],
    },
    STATUS: {
        title: '상태값',
        summary: '문서, 파이프라인 등 각 엔티티의 상태 코드 목록입니다. 일반적으로 수정 불필요.',
    },
    CHAT: {
        title: '채팅',
        summary: '채팅 화면의 동작(디버그 패널 표시, RAG/온톨로지 디버그 등)을 제어합니다.',
    },
    ROLE: {
        title: '역할',
        summary: '시스템 내 사용자 역할(ADMIN, USER 등) 관련 설정입니다.',
    },
    FILE: {
        title: '파일 업로드',
        summary: '업로드 가능한 파일 확장자, 크기 제한 등을 정의합니다.',
        details: ['보안 및 스토리지 용량을 고려해 설정하세요.'],
    },
    GRADE: {
        title: '등급별 제한',
        summary: '회원 등급(FREE, BASIC, PRO 등)별 워크스페이스/소스/페이지 개수 상한을 제어합니다.',
        details: ['SPECIAL/ADMIN 등급은 UI에 노출되지 않습니다.'],
    },
    MODEL: {
        title: 'AI 모델',
        summary: '사용 중인 LLM 모델 이름, 임베딩 모델, API 관련 파라미터를 정의합니다.',
        details: ['모델을 변경하면 비용/품질/응답속도가 크게 달라질 수 있습니다.'],
    },
    SEMANTIC: {
        title: '시멘틱',
        summary: '온톨로지·시멘틱 옵션(JSON 등)을 저장합니다. 값은 여러 줄로 표시됩니다.',
    },
    SLLM: {
        title: 'SLLM',
        summary: '경량 LLM·표시용 설정 등 문자열이 긴 항목입니다.',
    },
    ETC: {
        title: '기타',
        summary: '분류되지 않은 기타 설정입니다.',
    },
};

const CATEGORY_SORT_ORDER = [
    'BATCH',
    'GRAPH',
    'ARANGO',
    'PROMPT',
    'STRUCTURED',
    'PERSONA',
    'TIMEOUT',
    'STATUS',
    'CHAT',
    'ROLE',
    'FILE',
    'GRADE',
    'MODEL',
    'SEMANTIC',
    'SLLM',
    'ETC',
];

function typeBadgeClassName(dataType) {
    const dt = String(dataType || '');
    if (dt === 'INT' || dt === 'LONG') {
        return 'config-mgmt-type-badge config-mgmt-type-badge--numeric';
    }
    if (dt === 'BOOLEAN') {
        return 'config-mgmt-type-badge config-mgmt-type-badge--bool';
    }
    return 'config-mgmt-type-badge config-mgmt-type-badge--string';
}

/** 값 열을 textarea 형태(읽기 전용/편집)로 — dev의 PERSONA·SEMANTIC·SLLM 및 `valuePresentation: 'textarea'` */
const TEXTAREA_VALUE_CATEGORIES = new Set(['PERSONA', 'SEMANTIC', 'SLLM']);

function usesTextareaValuePresentation(row) {
    if (!row) return false;
    if (row.valuePresentation === 'textarea') return true;
    return TEXTAREA_VALUE_CATEGORIES.has(row.category);
}

/** 표 값 열 한 줄 미리보기(공백·개행 축약) */
function formatConfigValuePreview(raw) {
    if (raw == null || String(raw).trim() === '') {
        return '—';
    }
    return String(raw).replace(/\s+/g, ' ').trim();
}

function ConfigMgmtValueTableCell({ row, valuePopover, setValuePopover }) {
    const lineRef = useRef(null);
    const [truncated, setTruncated] = useState(false);
    const preview = formatConfigValuePreview(row.configValue);

    useEffect(() => {
        const el = lineRef.current;
        if (!el || typeof ResizeObserver === 'undefined') {
            return undefined;
        }
        const update = () => {
            requestAnimationFrame(() => {
                const node = lineRef.current;
                if (!node) return;
                setTruncated(node.scrollWidth > node.clientWidth + 1);
            });
        };
        update();
        const ro = new ResizeObserver(() => update());
        ro.observe(el);
        return () => ro.disconnect();
    }, [row.configKey, row.configValue]);

    const popoverOpen = Boolean(
        valuePopover && valuePopover.row && valuePopover.row.configKey === row.configKey
    );

    return (
        <div className="config-mgmt-value-cell">
            <span
                ref={lineRef}
                className="config-mgmt-value-line"
                title={truncated ? String(row.configValue ?? '') : undefined}
            >
                {preview}
            </span>
            {truncated ? (
                <button
                    type="button"
                    className="km-table-icon-btn km-table-icon-btn--neutral config-mgmt-value-popover-trigger"
                    onClick={(e) => {
                        e.stopPropagation();
                        setValuePopover({ anchorEl: e.currentTarget, row });
                    }}
                    aria-expanded={popoverOpen}
                    aria-haspopup="true"
                    aria-controls="config-mgmt-value-popover"
                    title="값 전체 보기"
                    aria-label={`${row.configKey} 값 전체 보기`}
                >
                    <Info strokeWidth={1.75} size={16} aria-hidden />
                </button>
            ) : null}
        </div>
    );
}

function configEditModalTitle(row) {
    if (!row?.configKey) return '값 수정';
    const catLabel = CATEGORY_LABELS[row.category] || row.category || '';
    return `${catLabel} ${row.configKey} 값 수정`;
}

function AdminConfigManagement() {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [listSource, setListSource] = useState('live');
    const [editModalRow, setEditModalRow] = useState(null);
    const [editDraft, setEditDraft] = useState('');
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [helpModal, setHelpModal] = useState(null);
    /** { anchorEl: Element, row: object } | null — 값 전체 보기 Popover */
    const [valuePopover, setValuePopover] = useState(null);
    const mockStoreRef = useRef(null);
    const { alert } = useDialog();

    const saveUsesMock = isMockEnabled || listSource === 'mock';

    const applyMockConfigsFilter = useCallback((cat) => {
        if (mockStoreRef.current == null) {
            mockStoreRef.current = mockAdminConfigItems.map((item) => ({ ...item }));
        }
        const rows = mockStoreRef.current;
        setConfigs(!cat ? [...rows] : rows.filter((c) => c.category === cat));
    }, []);

    const fetchCategories = useCallback(async () => {
        if (isMockEnabled) {
            setCategories(mockAdminConfigCategories);
            return;
        }
        try {
            const data = await adminConfigApi.getCategories();
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.warn('[AdminConfigManagement] 카테고리 목록 실패, 목으로 대체:', error?.message || error);
            setCategories(mockAdminConfigCategories);
        }
    }, []);

    const fetchConfigs = useCallback(
        async (categoryOverride) => {
            const cat = categoryOverride !== undefined ? categoryOverride : selectedCategory;
            try {
                setLoading(true);
                if (isMockEnabled) {
                    applyMockConfigsFilter(cat);
                    setListSource('mock');
                    return;
                }
                const data = await adminConfigApi.getAll(cat || undefined);
                setConfigs(Array.isArray(data) ? data : []);
                setListSource('live');
                mockStoreRef.current = null;
            } catch (error) {
                console.warn('[AdminConfigManagement] 설정 목록 실패, 목 데이터로 표시:', error?.message || error);
                mockStoreRef.current = mockAdminConfigItems.map((item) => ({ ...item }));
                applyMockConfigsFilter(cat);
                setListSource('mock');
                await alert('시스템 설정을 불러오지 못했습니다. 샘플 목록을 표시합니다.');
            } finally {
                setLoading(false);
            }
        },
        [selectedCategory, alert, applyMockConfigsFilter]
    );

    useEffect(() => {
        void fetchCategories();
        void fetchConfigs('');
    }, []); // eslint-disable-line react-hooks/exhaustive-deps -- 초기 로드만

    const handleCategoryChange = useCallback(
        (e) => {
            const cat = e.target.value;
            setSelectedCategory(cat);
            void fetchConfigs(cat);
        },
        [fetchConfigs]
    );

    const handleRefreshList = useCallback(() => {
        void fetchConfigs(selectedCategory);
    }, [fetchConfigs, selectedCategory]);

    const openRowHelp = useCallback((config) => setHelpModal({ type: 'row', data: config }), []);
    const openCategoryHelp = useCallback((category) => setHelpModal({ type: 'category', data: category }), []);
    const closeHelp = useCallback(() => setHelpModal(null), []);
    const closeValuePopover = useCallback(() => setValuePopover(null), []);

    const openEditModal = useCallback((config) => {
        setEditModalRow(config);
        setEditDraft(config.configValue ?? '');
    }, []);

    const closeEditModal = useCallback(() => {
        if (saving) return;
        setEditModalRow(null);
        setEditDraft('');
    }, [saving]);

    const handleSaveEdit = useCallback(async () => {
        const key = editModalRow?.configKey;
        if (!key) return;
        try {
            setSaving(true);
            if (saveUsesMock) {
                const rows = mockStoreRef.current;
                if (rows) {
                    const idx = rows.findIndex((c) => c.configKey === key);
                    if (idx >= 0) {
                        rows[idx] = { ...rows[idx], configValue: editDraft };
                    }
                }
                applyMockConfigsFilter(selectedCategory);
                await alert('설정이 저장되었습니다. (목 데이터 모드)');
            } else {
                await adminConfigApi.update(key, editDraft);
                await alert('설정이 저장되었습니다.');
                await fetchConfigs(selectedCategory);
            }
            setEditModalRow(null);
            setEditDraft('');
        } catch (error) {
            console.error('Failed to save config:', error);
            await alert('설정 저장에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    }, [alert, applyMockConfigsFilter, editDraft, editModalRow, fetchConfigs, saveUsesMock, selectedCategory]);

    const handleRefreshCache = useCallback(async () => {
        try {
            if (saveUsesMock) {
                await alert('캐시가 새로고침되었습니다. (목 데이터 모드)');
                return;
            }
            await adminConfigApi.refreshCache();
            await alert('캐시가 새로고침되었습니다.');
        } catch (error) {
            console.error('Failed to refresh cache:', error);
            await alert('캐시 새로고침에 실패했습니다.');
        }
    }, [alert, saveUsesMock]);

    const groupedConfigs = useMemo(() => {
        return configs.reduce((acc, config) => {
            const category = config.category || 'ETC';
            if (!acc[category]) acc[category] = [];
            acc[category].push(config);
            return acc;
        }, {});
    }, [configs]);

    const sortedGroupedEntries = useMemo(() => {
        const entries = Object.entries(groupedConfigs);
        entries.sort(([a], [b]) => {
            const ia = CATEGORY_SORT_ORDER.indexOf(a);
            const ib = CATEGORY_SORT_ORDER.indexOf(b);
            const sa = ia === -1 ? 999 : ia;
            const sb = ib === -1 ? 999 : ib;
            if (sa !== sb) return sa - sb;
            return String(a).localeCompare(String(b));
        });
        return entries;
    }, [groupedConfigs]);

    const configColumnDefinitions = useMemo(
        () => [
            { id: 'configKey', label: '키', defaultWidthPx: 220, minWidthPx: 160, align: 'left' },
            { id: 'configValue', label: '값', defaultWidthPx: 280, minWidthPx: 200, align: 'left', ellipsis: false },
            { id: 'dataType', label: '타입', defaultWidthPx: 88, minWidthPx: 72, align: 'center' },
            { id: 'description', label: '설명', defaultWidthPx: 260, minWidthPx: 160, align: 'left', ellipsis: false },
            {
                id: '_actions',
                label: <span className="config-mgmt-actions-head">관리</span>,
                defaultWidthPx: 140,
                minWidthPx: 120,
                align: 'right',
                ellipsis: false,
            },
        ],
        []
    );

    const { columns: configTableColumns, startResize: configColumnStartResize } = useBasicTableColumnResize({
        definitions: configColumnDefinitions,
        storageKey: 'km-admin-config-mgmt-v1',
        enabled: true,
    });

    const renderConfigCell = useCallback(
        ({ column, row }) => {
            switch (column.id) {
                case 'configKey':
                    return <span className="config-mgmt-key">{row.configKey}</span>;
                case 'configValue':
                    return (
                        <ConfigMgmtValueTableCell
                            row={row}
                            valuePopover={valuePopover}
                            setValuePopover={setValuePopover}
                        />
                    );
                case 'dataType':
                    return <span className={typeBadgeClassName(row.dataType)}>{row.dataType}</span>;
                case 'description':
                    return <span className="config-mgmt-desc">{row.description || '-'}</span>;
                case '_actions':
                    return (
                        <div className="km-table-actions">
                            <button
                                type="button"
                                className="km-table-icon-btn km-table-icon-btn--neutral"
                                onClick={() => openEditModal(row)}
                                title="수정"
                                aria-label={`${row.configKey} 수정`}
                            >
                                <FilePen strokeWidth={1.75} aria-hidden />
                            </button>
                            <button
                                type="button"
                                className="km-table-icon-btn km-table-icon-btn--neutral"
                                onClick={() => openRowHelp(row)}
                                title="이 설정 설명 보기"
                                aria-label={`${row.configKey} 설명 보기`}
                            >
                                <HelpCircle strokeWidth={1.75} aria-hidden />
                            </button>
                        </div>
                    );
                default:
                    return undefined;
            }
        },
        [openEditModal, openRowHelp, valuePopover]
    );

    return (
        <div className="admin-page config-mgmt-page">
            <div className="km-main-sticky-head">
                <AdminPageHeader
                    title="시스템 설정 관리"
                    count={configs.length}
                    actions={(
                        <div className="admin-toolbar-actions">
                            <button
                                type="button"
                                onClick={handleRefreshCache}
                                className="admin-btn admin-btn-outline-success"
                                title="캐시 새로고침"
                            >
                                <RefreshCw size={14} aria-hidden />
                                캐시 갱신
                            </button>
                            <button
                                type="button"
                                onClick={handleRefreshList}
                                className="admin-btn admin-btn-icon"
                                title="목록 새로고침"
                                aria-label="설정 목록 새로고침"
                            >
                                <RotateCcw size={16} aria-hidden />
                            </button>
                        </div>
                    )}
                />

                <div className="config-mgmt-toolbar admin-toolbar">
                    <div className="config-mgmt-toolbar-left admin-toolbar-left">
                        <Select
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            size="small"
                            variant="outlined"
                            displayEmpty
                            aria-label="카테고리 필터"
                            sx={{
                                ...promptToolbarSelectSx,
                                minWidth: 160,
                                maxWidth: 'min(100%, 280px)',
                            }}
                        >
                            <MenuItem value="">전체 카테고리</MenuItem>
                            {categories.map((cat) => (
                                <MenuItem key={cat} value={cat}>
                                    {CATEGORY_LABELS[cat] || cat}
                                </MenuItem>
                            ))}
                        </Select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="config-mgmt-loading">데이터를 불러오는 중...</div>
            ) : sortedGroupedEntries.length === 0 ? (
                <div className="config-mgmt-empty" role="status">
                    표시할 설정이 없습니다.
                </div>
            ) : (
                <div className="config-mgmt-groups">
                    {sortedGroupedEntries.map(([category, categoryConfigs]) => (
                        <section key={category} className="config-mgmt-category-section" aria-labelledby={`config-cat-${category}`}>
                            <div className="config-mgmt-category-subtitle">
                                <Typography component="h3" variant="h6" id={`config-cat-${category}`} className="config-mgmt-category-title-text">
                                    {CATEGORY_LABELS[category] || category}
                                </Typography>
                                <button
                                    type="button"
                                    className="km-table-icon-btn km-table-icon-btn--neutral"
                                    onClick={() => openCategoryHelp(category)}
                                    title="카테고리 설명 보기"
                                    aria-label={`${CATEGORY_LABELS[category] || category} 설명 보기`}
                                >
                                    <HelpCircle strokeWidth={1.75} aria-hidden />
                                </button>
                                <span className="config-mgmt-category-count">({categoryConfigs.length}개)</span>
                            </div>
                            <div className="config-mgmt-category-table-area">
                                <div className="config-mgmt-table-shell basic-table-shell">
                                    <BasicTable
                                        key={category}
                                        className="config-mgmt-basic-table"
                                        columns={configTableColumns}
                                        data={categoryConfigs.map((c) => ({ ...c, id: c.configKey }))}
                                        renderCell={renderConfigCell}
                                        onColumnResizeMouseDown={configColumnStartResize}
                                    />
                                </div>
                            </div>
                        </section>
                    ))}
                </div>
            )}

            <BaseModal
                open={Boolean(helpModal)}
                title={(
                    <span className="admin-config-help-title">
                        <HelpCircle size={18} aria-hidden />
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

            <BaseModal
                open={Boolean(editModalRow)}
                title={configEditModalTitle(editModalRow)}
                onClose={closeEditModal}
                maxWidth="md"
                disableBackdropClose={saving}
                disableEscapeKeyDown={saving}
                contentClassName="config-mgmt-edit-modal-content km-modal-form"
                actions={(
                    <>
                        <Button variant="outlined" onClick={closeEditModal} disabled={saving}>
                            취소
                        </Button>
                        <Button variant="contained" onClick={() => void handleSaveEdit()} disabled={saving}>
                            저장
                        </Button>
                    </>
                )}
            >
                {editModalRow ? (
                    <textarea
                        className="config-mgmt-edit-modal-textarea"
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        rows={usesTextareaValuePresentation(editModalRow) ? 16 : 8}
                        aria-label="설정 값"
                        disabled={saving}
                    />
                ) : null}
            </BaseModal>

            <KmPopover
                id="config-mgmt-value-popover"
                open={Boolean(valuePopover)}
                anchorEl={valuePopover?.anchorEl ?? null}
                onClose={closeValuePopover}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                panelClassName="config-mgmt-value-popover-panel"
            >
                {valuePopover?.row ? (
                    <div className="config-mgmt-value-popover-inner">
                        <pre className="config-mgmt-value-popover-pre">
                            {valuePopover.row.configValue === '' || valuePopover.row.configValue == null
                                ? '(비어 있음)'
                                : String(valuePopover.row.configValue)}
                        </pre>
                    </div>
                ) : null}
            </KmPopover>
        </div>
    );
}

export default AdminConfigManagement;

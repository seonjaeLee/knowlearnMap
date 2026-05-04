import React, { useState, useEffect, useCallback } from 'react';
import { X, Table2, Play, RotateCcw, CheckCircle, AlertCircle, Loader, Sparkles, ChevronDown, ChevronUp, FileBarChart, AlertTriangle, Info, Save, FolderOpen, Trash2, Settings, Download, Upload, HelpCircle } from 'lucide-react';
import { structuredApi, configApi } from '../services/api';
import { documentApi } from '../services/documentApi';
import './ColumnMappingModal.css';

const COLUMN_ROLES = [
    { value: 'ENTITY', label: 'ENTITY', desc: '주 엔티티 (노드 이름)', color: '#4caf50' },
    { value: 'ENTITIES', label: 'ENTITIES', desc: '복수 엔티티 (자동 분리, 각각 노드 생성)', color: '#2e7d32' },
    { value: 'ATTRIBUTE', label: 'ATTRIBUTE', desc: '단일 속성값', color: '#2196f3' },
    { value: 'ATTRIBUTES', label: 'ATTRIBUTES', desc: '복수 속성값 (자동 분리)', color: '#0288d1' },
    { value: 'RELATION', label: 'JOIN', desc: '테이블 연결 키', color: '#ff9800' },
    { value: 'CONTENT', label: 'CONTENT', desc: 'LLM 추출 대상', color: '#9c27b0' },
    { value: 'SKIP', label: 'SKIP', desc: '저장 안함', color: '#9e9e9e' },
];

// 기본 폴백값 (API 로드 실패 시)
const DEFAULT_CATEGORIES = [{ en: 'Person', ko: '사람' }, { en: 'Organization', ko: '조직' }, { en: 'Department', ko: '부서' }, { en: 'Team', ko: '팀' }, { en: 'Company', ko: '회사' }, { en: 'Project', ko: '프로젝트' }, { en: 'Product', ko: '제품' }, { en: 'Skill', ko: '기술' }, { en: 'Role', ko: '역할' }, { en: 'Location', ko: '위치' }, { en: 'Vehicle', ko: '차량' }, { en: 'Equipment', ko: '장비' }, { en: 'Facility', ko: '시설' }, { en: 'Date', ko: '날짜' }, { en: 'Amount', ko: '금액' }, { en: 'Code', ko: '코드' }, { en: 'CodeGroup', ko: '코드그룹' }, { en: 'CodeValue', ko: '코드값' }, { en: 'Category', ko: '카테고리' }, { en: 'Description', ko: '설명' }, { en: 'Value', ko: '값' }, { en: 'Table', ko: '테이블' }, { en: 'Column', ko: '컬럼' }, { en: 'Contract', ko: '계약' }, { en: 'Level', ko: '등급' }, { en: 'Status', ko: '상태' }, { en: 'Partner', ko: '협력사' }, { en: 'Part', ko: '부품' }];
const DEFAULT_RELATIONS = [{ en: 'Belongs_To', ko: '소속' }, { en: 'Works_On', ko: '참여함' }, { en: 'Has_Skill', ko: '보유기술' }, { en: 'Has_Role', ko: '역할' }, { en: 'Manages', ko: '관리' }, { en: 'Contains', ko: '포함' }, { en: 'Produces', ko: '생산' }, { en: 'Uses', ko: '사용' }, { en: 'Owns', ko: '소유' }, { en: 'Related_To', ko: '관련됨' }, { en: 'Has_Contract', ko: '계약' }, { en: 'Has_Level', ko: '등급' }, { en: 'Has_Status', ko: '상태' }, { en: 'Is_Defined_As', ko: '정의' }, { en: 'Has_Description', ko: '설명' }, { en: 'Is_Type_Of', ko: '유형' }];

function ColumnMappingModal({ docId, filename, workspaceId, domainId, onClose, onProcessingComplete, initialTab }) {
    const [columns, setColumns] = useState([]);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [status, setStatus] = useState(null);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(initialTab || 'mapping');

    // AI 스키마 분석 관련 상태
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);

    // 품질 리포트 관련 상태
    const [qualityReport, setQualityReport] = useState(null);
    const [loadingQuality, setLoadingQuality] = useState(false);

    // 참조 문서 관련 상태
    const [workspaceDocs, setWorkspaceDocs] = useState([]);
    const [refDocColumns, setRefDocColumns] = useState({}); // { docId: [columns] }

    // 힌트 패널 상태
    const [showHintPanel, setShowHintPanel] = useState(false);
    const [hints, setHints] = useState({
        tableTypeHint: null,
        keyColumn: null,
        timeColumn: null,
        skipColumns: []
    });

    // 템플릿 관련 상태
    const [templates, setTemplates] = useState([]);
    const [showTemplateSaveForm, setShowTemplateSaveForm] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [templateDesc, setTemplateDesc] = useState('');
    const [savingTemplate, setSavingTemplate] = useState(false);
    const [applyingTemplate, setApplyingTemplate] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');

    // 시맨틱 옵션 (DB에서 로드)
    const [semanticCategories, setSemanticCategories] = useState(DEFAULT_CATEGORIES);
    const [semanticRelations, setSemanticRelations] = useState(DEFAULT_RELATIONS);

    // Help 패널 상태
    const [showHelp, setShowHelp] = useState(false);
    const [helpSection, setHelpSection] = useState(0); // 0=역할&복수값, 1=매핑옵션, 2=처리모드

    // 처리 모드 관련 상태
    const [processingMode, setProcessingMode] = useState(null); // MASTER, TRANSACTION, MIXED
    const [modeRecommendation, setModeRecommendation] = useState(null);
    const [showModePanel, setShowModePanel] = useState(false);
    const [loadingMode, setLoadingMode] = useState(false);
    const modePanelRef = React.useRef(null);

    // 초기 데이터 로드
    useEffect(() => {
        loadData();
    }, [docId]);

    // 워크스페이스 문서 목록 로드 (참조 드롭다운용) + 템플릿 목록
    useEffect(() => {
        if (workspaceId) {
            loadWorkspaceDocs();
            loadTemplates();
        }
    }, [workspaceId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [columnsData, previewData, statusData, semanticOpts] = await Promise.all([
                structuredApi.getColumns(docId),
                structuredApi.getPreview(docId),
                structuredApi.getStatus(docId).catch(() => null),
                configApi.getSemanticOptions(domainId).catch(() => null)
            ]);
            setColumns(columnsData || []);
            if (semanticOpts) {
                if (semanticOpts.categories?.length > 0) setSemanticCategories(semanticOpts.categories);
                if (semanticOpts.relations?.length > 0) setSemanticRelations(semanticOpts.relations);
            }
            setPreview(previewData);
            if (statusData) {
                setStatus(statusData);
                // PROCESSING 중이면 자동 폴링 시작
                if (statusData.status === 'PROCESSING') {
                    setProcessing(true);
                    setTimeout(pollStatus, 3000);
                }
            }

            // 기존 FK 참조가 있는 컬럼의 참조문서 컬럼 목록 프리로드
            const refDocIds = [...new Set(
                (columnsData || []).filter(c => c.referenceDocumentId).map(c => c.referenceDocumentId)
            )];
            if (refDocIds.length > 0) {
                const map = {};
                await Promise.all(refDocIds.map(async id => {
                    try {
                        const cols = await structuredApi.getColumns(id);
                        if (cols?.length > 0) map[id] = cols; // 빈 배열은 캐시하지 않음
                    } catch(e) { /* ignore */ }
                }));
                if (Object.keys(map).length > 0) {
                    setRefDocColumns(prev => ({ ...prev, ...map }));
                }
            }
        } catch (e) {
            setError('데이터를 불러오는데 실패했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    const loadWorkspaceDocs = async () => {
        try {
            const docs = await documentApi.getByWorkspace(workspaceId);
            // CSV/DATABASE 문서만, 현재 문서 제외
            const csvDocs = (docs || []).filter(d =>
                (d.sourceType === 'CSV' || d.sourceType === 'DATABASE') && d.id !== docId
            );
            setWorkspaceDocs(csvDocs);
        } catch (e) {
            console.warn('워크스페이스 문서 목록 로드 실패:', e);
        }
    };

    // 템플릿 목록 로드
    const loadTemplates = async () => {
        try {
            const tpls = await structuredApi.listTemplates(workspaceId);
            setTemplates(tpls || []);
        } catch (e) {
            console.warn('템플릿 목록 로드 실패:', e);
        }
    };

    // 참조 문서의 컬럼 목록 로드
    const loadRefDocColumns = async (refDocId) => {
        if (refDocColumns[refDocId]?.length > 0) return; // 컬럼이 있을 때만 캐시 사용
        try {
            console.log(`[FK로드] API 호출: /structured/${refDocId}/columns`);
            const cols = await structuredApi.getColumns(refDocId);
            console.log(`[FK로드] docId=${refDocId}, 응답:`, cols, `타입=${typeof cols}, 길이=${Array.isArray(cols) ? cols.length : 'N/A'}`);
            if (cols?.length > 0) {
                setRefDocColumns(prev => ({ ...prev, [refDocId]: cols }));
            } else {
                console.warn(`[FK로드] docId=${refDocId} 컬럼 없음. column_mappings가 비어있거나 문서가 존재하지 않을 수 있음.`);
                // 빈 배열도 임시 캐시하여 무한 재시도 방지 (5초 후 재시도 가능)
                setRefDocColumns(prev => ({ ...prev, [refDocId]: [] }));
                setTimeout(() => {
                    setRefDocColumns(prev => {
                        const next = { ...prev };
                        if (next[refDocId]?.length === 0) delete next[refDocId];
                        return next;
                    });
                }, 5000);
            }
        } catch (e) {
            console.warn('[FK로드] 참조 문서 컬럼 로드 실패:', refDocId, e);
        }
    };

    // 컬럼 역할 변경
    const handleRoleChange = (columnName, newRole) => {
        setColumns(prev => prev.map(col => {
            if (col.columnName !== columnName) return col;
            const updated = { ...col, columnRole: newRole };
            // RELATION이 아닌 역할로 변경 시 참조 설정 초기화
            if (newRole !== 'RELATION') {
                updated.referenceDocumentId = null;
                updated.referenceKeyColumn = null;
            }
            // SKIP/CONTENT로 변경 시 시맨틱 필드 초기화
            if (newRole === 'SKIP' || newRole === 'CONTENT') {
                updated.semanticCategory = null;
                updated.semanticRelation = null;
                updated.semanticRelationKo = null;
            }
            // ENTITY로 변경 시 관계 필드 초기화 (ENTITY는 주어 역할)
            if (newRole === 'ENTITY') {
                updated.semanticRelation = null;
                updated.semanticRelationKo = null;
            }
            return updated;
        }));
    };

    // 한글명 변경
    const handleKoNameChange = (columnName, value) => {
        setColumns(prev => prev.map(col =>
            col.columnName === columnName ? { ...col, columnNameKo: value } : col
        ));
    };

    // entityGroup 변경
    const handleEntityGroupChange = (columnName, value) => {
        setColumns(prev => prev.map(col =>
            col.columnName === columnName ? { ...col, entityGroup: value || null } : col
        ));
    };

    // isGroupKey 토글
    const handleGroupKeyToggle = (columnName) => {
        setColumns(prev => prev.map(col =>
            col.columnName === columnName ? { ...col, isGroupKey: !col.isGroupKey } : col
        ));
    };

    // isTimeAxis 토글
    const handleTimeAxisToggle = (columnName) => {
        setColumns(prev => prev.map(col =>
            col.columnName === columnName ? { ...col, isTimeAxis: !col.isTimeAxis } : col
        ));
    };

    // 시맨틱 카테고리 변경
    const handleSemanticCategoryChange = (columnName, value) => {
        setColumns(prev => prev.map(col =>
            col.columnName === columnName ? { ...col, semanticCategory: value || null } : col
        ));
    };

    // 시맨틱 관계 변경
    const handleSemanticRelationChange = (columnName, value) => {
        const rel = semanticRelations.find(r => r.en === value);
        setColumns(prev => prev.map(col =>
            col.columnName === columnName
                ? { ...col, semanticRelation: value || null, semanticRelationKo: rel?.ko || null }
                : col
        ));
    };

    // 시맨틱 관계 한글명 직접 입력
    const handleSemanticRelationKoChange = (columnName, value) => {
        setColumns(prev => prev.map(col =>
            col.columnName === columnName ? { ...col, semanticRelationKo: value || null } : col
        ));
    };

    // 참조 문서 변경
    const handleRefDocChange = (columnName, refDocId) => {
        const parsedId = refDocId ? parseInt(refDocId) : null;
        const selectedDoc = workspaceDocs.find(d => d.id === parsedId);
        console.log(`[FK선택] column=${columnName}, refDocId=${parsedId}, filename=${selectedDoc?.filename}, cached=${!!refDocColumns[parsedId]}, cachedLen=${refDocColumns[parsedId]?.length}`);
        setColumns(prev => prev.map(col =>
            col.columnName === columnName
                ? { ...col, referenceDocumentId: parsedId, referenceKeyColumn: null }
                : col
        ));
        if (parsedId) {
            loadRefDocColumns(parsedId);
        }
    };

    // 참조 키 컬럼 변경
    const handleRefKeyColumnChange = (columnName, keyCol) => {
        setColumns(prev => prev.map(col =>
            col.columnName === columnName ? { ...col, referenceKeyColumn: keyCol || null } : col
        ));
    };

    // 매핑 저장
    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const result = await structuredApi.updateColumns(docId, columns);
            setColumns(result || columns);
        } catch (e) {
            setError('매핑 저장에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setSaving(false);
        }
    };

    // 샘플 처리
    const handleProcessSample = async () => {
        setProcessing(true);
        setError('');
        try {
            await structuredApi.updateColumns(docId, columns);
            const result = await structuredApi.processSample(docId);
            setStatus(result);
            setActiveTab('status');
        } catch (e) {
            setError('샘플 데이터 처리에 실패했습니다. 매핑 설정을 확인해주세요.');
        } finally {
            setProcessing(false);
        }
    };

    // 처리 모드 추천 로드
    const loadProcessingModeRecommendation = async () => {
        setLoadingMode(true);
        try {
            const result = await structuredApi.recommendProcessingMode(docId);
            setModeRecommendation(result);
            setProcessingMode(result.recommendedMode);
            setShowModePanel(true);
            // 모드 패널이 렌더링된 후 자동 스크롤
            setTimeout(() => {
                modePanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        } catch (e) {
            setError('처리 모드 추천에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setLoadingMode(false);
        }
    };

    // 전체 처리 (모드 선택 후 실행)
    const handleProcessAll = async () => {
        setProcessing(true);
        setError('');
        try {
            await structuredApi.updateColumns(docId, columns);
            // 선택한 처리 모드로 tableType 업데이트
            if (processingMode) {
                await structuredApi.updateTableType(docId, processingMode);
            }
            await structuredApi.processAll(docId);
            setShowModePanel(false);
            setActiveTab('status');
            setTimeout(pollStatus, 2000);
        } catch (e) {
            setError('데이터 처리 시작에 실패했습니다. 다시 시도해주세요.');
            setProcessing(false);
        }
    };

    // 상태 폴링
    const pollStatusRetryRef = React.useRef(0);
    const pollStatus = useCallback(async () => {
        try {
            const result = await structuredApi.getStatus(docId);
            setStatus(result);

            if (result.status === 'PROCESSING') {
                pollStatusRetryRef.current = 0;
                setTimeout(pollStatus, 3000);
            } else if (processing && pollStatusRetryRef.current < 3) {
                // processing=true인데 백엔드가 아직 PROCESSING이 아니면 재시도
                pollStatusRetryRef.current++;
                setTimeout(pollStatus, 2000);
            } else {
                pollStatusRetryRef.current = 0;
                setProcessing(false);
                if (result.status === 'COMPLETED' && onProcessingComplete) {
                    onProcessingComplete();
                }
            }
        } catch (e) {
            setProcessing(false);
        }
    }, [docId, onProcessingComplete, processing]);

    // 상태 수동 새로고침
    const refreshStatus = async () => {
        try {
            const result = await structuredApi.getStatus(docId);
            setStatus(result);
        } catch (e) {
            setError('처리 상태 조회에 실패했습니다.');
        }
    };

    // 재처리
    const handleRetry = async () => {
        setProcessing(true);
        try {
            const result = await structuredApi.processRetry(docId);
            setStatus(result);
        } catch (e) {
            setError('재처리에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setProcessing(false);
        }
    };

    // 매핑 변경 후 재처리 (기존 결과 삭제 → 전체 재처리)
    const handleReprocess = async () => {
        if (!window.confirm('기존 처리 결과를 모두 삭제하고 다시 처리합니다. 진행하시겠습니까?')) return;
        setProcessing(true);
        setError('');
        try {
            await structuredApi.updateColumns(docId, columns);  // 현재 매핑 저장
            await structuredApi.reprocess(docId);
            setActiveTab('status');
            setTimeout(pollStatus, 2000);
        } catch (e) {
            setError('재처리에 실패했습니다. 다시 시도해주세요.');
            setProcessing(false);
        }
    };

    // AI 스키마 자동 분석 (힌트 포함)
    const handleAnalyzeSchema = async () => {
        setAnalyzing(true);
        setError('');
        try {
            // 빈 힌트 필터링
            const hasHints = hints.tableTypeHint || hints.keyColumn || hints.timeColumn || (hints.skipColumns?.length > 0);
            const result = await structuredApi.analyzeSchema(docId, workspaceId, hasHints ? hints : null);
            // AI 결과에서 카테고리/관계 자동 매칭 보정
            if (result?.columns) {
                // semanticCategories가 {en,ko} 객체 배열인지 확인
                const cats = semanticCategories.filter(c => typeof c === 'object' && c?.en);
                const rels = semanticRelations.filter(r => typeof r === 'object' && r?.en);

                result.columns = result.columns.map(col => {
                    const patched = { ...col };

                    // semanticCategory 매칭: AI 반환값 → 영문값으로 정규화
                    if (patched.semanticCategory) {
                        // 한글이면 영문으로 변환
                        const matchKo = cats.find(c => c.ko === patched.semanticCategory);
                        if (matchKo) patched.semanticCategory = matchKo.en;
                    }
                    // semanticCategory가 아직 없으면 columnNameKo로 매칭
                    if (!patched.semanticCategory && patched.columnNameKo) {
                        const koVal = patched.columnNameKo.trim();
                        const matchKo = cats.find(c => c.ko === koVal);
                        const matchEn = cats.find(c => c.en === koVal);
                        // 부분 매칭 (예: "팀책임자" → "직원", "공통코드" → "코드")
                        const matchPartial = !matchKo && !matchEn
                            ? cats.find(c => koVal.includes(c.ko) || c.ko.includes(koVal))
                            : null;
                        if (matchKo) patched.semanticCategory = matchKo.en;
                        else if (matchEn) patched.semanticCategory = matchEn.en;
                        else if (matchPartial) patched.semanticCategory = matchPartial.en;
                    }
                    // 그래도 없으면: 같은 columnNameKo를 가진 다른 컬럼에서 카테고리 복사
                    if (!patched.semanticCategory && patched.columnNameKo) {
                        const sameKoCol = result.columns.find(c =>
                            c.columnName !== patched.columnName &&
                            c.columnNameKo === patched.columnNameKo &&
                            c.semanticCategory
                        );
                        if (sameKoCol) patched.semanticCategory = sameKoCol.semanticCategory;
                    }

                    // semanticRelation 매칭
                    if (patched.semanticRelation) {
                        const matchKo = rels.find(r => r.ko === patched.semanticRelation);
                        if (matchKo) {
                            patched.semanticRelationKo = matchKo.ko;
                            patched.semanticRelation = matchKo.en;
                        }
                        if (!patched.semanticRelationKo) {
                            const matchEn = rels.find(r => r.en === patched.semanticRelation);
                            if (matchEn) patched.semanticRelationKo = matchEn.ko;
                        }
                    }

                    console.log(`[AI매칭] ${patched.columnName}: ko=${patched.columnNameKo}, category=${patched.semanticCategory}, relation=${patched.semanticRelation}`);
                    return patched;
                });
            }
            setAnalysisResult(result);
            setShowAnalysisPanel(true);
        } catch (e) {
            setError('AI 분석에 실패했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setAnalyzing(false);
        }
    };

    // 템플릿 적용
    const handleApplyTemplate = async (templateId) => {
        setApplyingTemplate(true);
        setSelectedTemplateId(templateId);
        setError('');
        try {
            await structuredApi.applyTemplate(docId, templateId);
            const freshColumns = await structuredApi.getColumns(docId);
            if (freshColumns && freshColumns.length > 0) {
                setColumns(freshColumns);
            }
            setError('');
            // 성공 시 선택된 템플릿 유지 (어떤 템플릿이 적용됐는지 표시)
        } catch (e) {
            setError('템플릿 적용에 실패했습니다. 다시 시도해주세요.');
            setSelectedTemplateId('');
        } finally {
            setApplyingTemplate(false);
        }
    };

    // 템플릿 저장
    const handleSaveTemplate = async () => {
        if (!templateName.trim()) return;
        // 동일 이름 템플릿 존재 확인
        const existing = templates.find(t => t.name === templateName.trim());
        if (existing) {
            if (!window.confirm(`"${templateName.trim()}" 템플릿이 이미 존재합니다. 덮어쓰시겠습니까?`)) {
                return;
            }
        }
        setSavingTemplate(true);
        setError('');
        try {
            // 현재 UI 매핑을 먼저 DB에 저장 (템플릿은 DB에서 읽으므로)
            await structuredApi.updateColumns(docId, columns);
            // 그 다음 템플릿으로 저장
            await structuredApi.saveAsTemplate(docId, workspaceId, templateName.trim(), templateDesc.trim());
            setShowTemplateSaveForm(false);
            setTemplateName('');
            setTemplateDesc('');
            loadTemplates();
        } catch (e) {
            setError('템플릿 저장에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setSavingTemplate(false);
        }
    };

    // 템플릿 삭제
    const handleDeleteTemplate = async (templateId) => {
        try {
            await structuredApi.deleteTemplate(templateId);
            loadTemplates();
        } catch (e) {
            setError('템플릿 삭제에 실패했습니다. 다시 시도해주세요.');
        }
    };

    // 템플릿 다운로드 (JSON 파일)
    const handleDownloadTemplate = (template) => {
        // columnsJson이 API에서 내려오면 사용, 없으면 현재 columns state 사용
        const colsData = template.columnsJson
            ? (typeof template.columnsJson === 'string' ? template.columnsJson : JSON.stringify(template.columnsJson))
            : JSON.stringify(columns.map(c => ({
                columnName: c.columnName,
                columnNameKo: c.columnNameKo,
                columnRole: c.columnRole,
                entityGroup: c.entityGroup || null,
                description: c.description || null,
                isGroupKey: c.isGroupKey || false,
                isTimeAxis: c.isTimeAxis || false,
                semanticCategory: c.semanticCategory || null,
                semanticRelation: c.semanticRelation || null,
                semanticRelationKo: c.semanticRelationKo || null,
                referenceDocumentId: c.referenceDocumentId || null,
                referenceKeyColumn: c.referenceKeyColumn || null
            })));
        const data = {
            name: template.name,
            description: template.description || '',
            columnCount: template.columnCount || columns.length,
            tableType: template.tableType || null,
            columnsJson: colsData
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `template_${template.name.replace(/\s+/g, '_')}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // 템플릿 업로드 (JSON 파일 → 워크스페이스에 저장)
    const handleUploadTemplate = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            if (!data.name || !data.columnsJson) {
                setError('유효하지 않은 템플릿 파일입니다. name과 columnsJson이 필요합니다.');
                return;
            }
            // columnsJson이 문자열이면 파싱 후 다시 직렬화 (검증)
            const cols = typeof data.columnsJson === 'string' ? JSON.parse(data.columnsJson) : data.columnsJson;
            // API로 템플릿 저장 (현재 매핑을 먼저 저장한 뒤 save-as-template 호출이 아닌, 직접 DB 삽입 필요)
            // 기존 API는 docId 기반이므로, 업로드된 템플릿을 현재 매핑에 직접 적용
            const existing = templates.find(t => t.name === data.name);
            if (existing && !window.confirm(`"${data.name}" 템플릿이 이미 존재합니다. 덮어쓰시겠습니까?`)) {
                return;
            }
            // 업로드된 JSON의 컬럼을 현재 columns에 적용
            const templateColumns = cols;
            const updated = columns.map(col => {
                const tCol = templateColumns.find(tc => tc.columnName === col.columnName);
                if (!tCol) return col;
                return {
                    ...col,
                    columnNameKo: tCol.columnNameKo || col.columnNameKo,
                    columnRole: tCol.columnRole || col.columnRole,
                    entityGroup: tCol.entityGroup ?? col.entityGroup,
                    semanticCategory: tCol.semanticCategory ?? col.semanticCategory,
                    semanticRelation: tCol.semanticRelation ?? col.semanticRelation,
                    semanticRelationKo: tCol.semanticRelationKo ?? col.semanticRelationKo,
                    description: tCol.description ?? col.description,
                    isGroupKey: tCol.isGroupKey ?? col.isGroupKey,
                    isTimeAxis: tCol.isTimeAxis ?? col.isTimeAxis,
                };
            });
            setColumns(updated);
            // DB에 저장 + 템플릿으로 저장
            await structuredApi.updateColumns(docId, updated);
            await structuredApi.saveAsTemplate(docId, workspaceId, data.name, data.description || '');
            loadTemplates();
            loadData();
        } catch (err) {
            setError('템플릿 파일 처리 실패: ' + (err.message || '알 수 없는 오류'));
        }
    };

    // 힌트 SKIP 토글
    const toggleSkipColumn = (columnName) => {
        setHints(prev => {
            const skip = prev.skipColumns || [];
            return {
                ...prev,
                skipColumns: skip.includes(columnName)
                    ? skip.filter(c => c !== columnName)
                    : [...skip, columnName]
            };
        });
    };

    // 분석 결과에서 컬럼 역할 수정
    const handleAnalysisColumnChange = (idx, field, value) => {
        setAnalysisResult(prev => {
            const updated = { ...prev };
            updated.columns = [...prev.columns];
            updated.columns[idx] = { ...updated.columns[idx], [field]: value };
            return updated;
        });
    };

    // 분석 결과 적용
    const handleApplySchema = async () => {
        if (!analysisResult) return;
        setSaving(true);
        setError('');
        try {
            const result = await structuredApi.applySchema(docId, analysisResult);
            setColumns(result || columns);
            setShowAnalysisPanel(false);
            setAnalysisResult(null);
        } catch (e) {
            setError('분석 결과 적용에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setSaving(false);
        }
    };

    // 품질 리포트 로드 (lazy)
    const loadQualityReport = async () => {
        if (qualityReport) return; // 이미 로드됨
        setLoadingQuality(true);
        try {
            const report = await structuredApi.getQualityReport(docId);
            setQualityReport(report);
        } catch (e) {
            setError('품질 리포트를 불러오는데 실패했습니다.');
        } finally {
            setLoadingQuality(false);
        }
    };

    // null% 기반 색상 클래스
    const getNullSeverity = (nullPercentage) => {
        if (nullPercentage > 90) return 'severity-critical';
        if (nullPercentage > 50) return 'severity-warning';
        return '';
    };

    // 타입 뱃지 색상
    const getTypeBadgeClass = (detectedType) => {
        switch (detectedType) {
            case 'NUMBER': return 'type-number';
            case 'DATE': return 'type-date';
            case 'BOOLEAN': return 'type-boolean';
            default: return 'type-string';
        }
    };

    if (loading) {
        return (
            <div className="column-mapping-overlay">
                <div className="column-mapping-modal">
                    <div className="cmm-loading">
                        <Loader className="spinner" size={24} />
                        <span>데이터 로딩 중...</span>
                    </div>
                </div>
            </div>
        );
    }

    const entityCount = columns.filter(c => c.columnRole === 'ENTITY').length;
    const attrCount = columns.filter(c => c.columnRole === 'ATTRIBUTE').length;
    const attrsCount = columns.filter(c => c.columnRole === 'ATTRIBUTES').length;
    const contentCount = columns.filter(c => c.columnRole === 'CONTENT').length;
    const skipCount = columns.filter(c => c.columnRole === 'SKIP').length;
    const relationCount = columns.filter(c => c.columnRole === 'RELATION').length;
    const hasRefDocs = workspaceDocs.length > 0;

    // 상태 기반 버튼 제어
    const isCompleted = status?.status === 'COMPLETED' && (status?.pending || 0) === 0;
    const isProcessing = processing || status?.status === 'PROCESSING';
    const hasFailed = (status?.failed || 0) > 0;
    const noEntity = entityCount === 0;

    return (
        <div className="column-mapping-overlay" onClick={onClose}>
            <div className="column-mapping-modal" onClick={e => e.stopPropagation()}>
                {/* 헤더 */}
                <div className="cmm-header">
                    <div className="cmm-header-left">
                        <Table2 size={20} />
                        <span className="cmm-title">{filename}</span>
                        <span className="cmm-subtitle">컬럼 매핑</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button className="cmm-help-btn" onClick={() => setShowHelp(true)} title="도움말">
                            <HelpCircle size={18} />
                        </button>
                        <button className="cmm-close" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* 탭 */}
                <div className="cmm-tabs">
                    <button
                        className={`cmm-tab ${activeTab === 'mapping' ? 'active' : ''}`}
                        onClick={() => setActiveTab('mapping')}
                    >
                        컬럼 매핑
                    </button>
                    <button
                        className={`cmm-tab ${activeTab === 'preview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('preview')}
                    >
                        미리보기
                    </button>
                    <button
                        className={`cmm-tab ${activeTab === 'status' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('status'); refreshStatus(); }}
                    >
                        처리 상태
                    </button>
                    <button
                        className={`cmm-tab ${activeTab === 'quality' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('quality'); loadQualityReport(); }}
                    >
                        <FileBarChart size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        품질 리포트
                    </button>
                </div>

                {/* 에러 */}
                {error && (
                    <div className="cmm-error">
                        <AlertCircle size={14} />
                        <span>{error}</span>
                        <button onClick={() => setError('')}>x</button>
                    </div>
                )}

                {/* 컨텐츠 */}
                <div className="cmm-content">
                    {activeTab === 'mapping' && (
                        <div className="cmm-mapping">
                            <div className="cmm-summary">
                                <span className="cmm-badge entity">ENTITY: {entityCount}</span>
                                {attrCount > 0 && <span className="cmm-badge total">ATTR: {attrCount}</span>}
                                {attrsCount > 0 && <span className="cmm-badge content" style={{ background: '#e0f2f1', color: '#00695c' }}>ATTRS: {attrsCount}</span>}
                                <span className="cmm-badge content">CONTENT: {contentCount}</span>
                                {relationCount > 0 && (
                                    <span className="cmm-badge relation">JOIN: {relationCount}</span>
                                )}
                                <span className="cmm-badge skip">SKIP: {skipCount}</span>
                                <span className="cmm-badge total">총 {columns.length}개 컬럼</span>

                                {/* 템플릿 불러오기 드롭다운 */}
                                {templates.length > 0 && (
                                    <div className="cmm-template-dropdown">
                                        <select
                                            className="cmm-template-select"
                                            value={selectedTemplateId}
                                            onChange={e => {
                                                const val = e.target.value;
                                                if (val) handleApplyTemplate(parseInt(val));
                                                else setSelectedTemplateId('');
                                            }}
                                            disabled={applyingTemplate || isProcessing}
                                        >
                                            <option value="">
                                                {applyingTemplate ? '적용 중...' : '템플릿 불러오기'}
                                            </option>
                                            {templates.map(t => (
                                                <option key={t.id} value={t.id}>
                                                    {t.name} ({t.columnCount}컬럼)
                                                </option>
                                            ))}
                                        </select>
                                        <FolderOpen size={13} className="cmm-template-icon" />
                                    </div>
                                )}

                                <button
                                    className="cmm-btn ai-analyze"
                                    onClick={handleAnalyzeSchema}
                                    disabled={analyzing || isProcessing}
                                >
                                    {analyzing ? (
                                        <><Loader className="spinner" size={14} /> 분석 중...</>
                                    ) : (
                                        <><Sparkles size={14} /> AI 자동 분석</>
                                    )}
                                </button>
                            </div>

                            {/* 수동 모드 안내 배너 */}
                            {!analysisResult && !analyzing && columns.every(c => c.columnRole === 'ATTRIBUTE') && (
                                <div className="cmm-manual-hint">
                                    <Info size={14} />
                                    <span>컬럼 역할을 수동으로 설정하거나 AI 자동 분석을 사용하세요.</span>
                                </div>
                            )}

                            {/* 힌트 패널 (접이식) */}
                            <button
                                className="cmm-hint-toggle"
                                onClick={() => setShowHintPanel(!showHintPanel)}
                            >
                                <Info size={13} />
                                <span>AI 분석 힌트</span>
                                {showHintPanel ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>

                            {showHintPanel && (
                                <div className="cmm-hint-panel">
                                    <div className="cmm-hint-row">
                                        <label className="cmm-hint-label">데이터 유형</label>
                                        <div className="cmm-hint-btns">
                                            {['TRANSACTION', 'MASTER', 'META'].map(t => (
                                                <button
                                                    key={t}
                                                    className={`cmm-hint-type-btn ${hints.tableTypeHint === t ? 'active' : ''}`}
                                                    onClick={() => setHints(prev => ({
                                                        ...prev,
                                                        tableTypeHint: prev.tableTypeHint === t ? null : t
                                                    }))}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="cmm-hint-row">
                                        <label className="cmm-hint-label">키 컬럼</label>
                                        <select
                                            className="cmm-hint-select"
                                            value={hints.keyColumn || ''}
                                            onChange={e => setHints(prev => ({ ...prev, keyColumn: e.target.value || null }))}
                                        >
                                            <option value="">자동 감지</option>
                                            {columns.map(c => (
                                                <option key={c.columnName} value={c.columnName}>{c.columnName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="cmm-hint-row">
                                        <label className="cmm-hint-label">시간 컬럼</label>
                                        <select
                                            className="cmm-hint-select"
                                            value={hints.timeColumn || ''}
                                            onChange={e => setHints(prev => ({ ...prev, timeColumn: e.target.value || null }))}
                                        >
                                            <option value="">자동 감지</option>
                                            {columns.map(c => (
                                                <option key={c.columnName} value={c.columnName}>{c.columnName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="cmm-hint-row">
                                        <label className="cmm-hint-label">SKIP 컬럼</label>
                                        <div className="cmm-hint-skip-list">
                                            {columns.map(c => (
                                                <label key={c.columnName} className="cmm-hint-skip-item">
                                                    <input
                                                        type="checkbox"
                                                        checked={hints.skipColumns?.includes(c.columnName) || false}
                                                        onChange={() => toggleSkipColumn(c.columnName)}
                                                    />
                                                    <span>{c.columnName}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* AI 분석 결과 패널 */}
                            {showAnalysisPanel && analysisResult && (
                                <div className="cmm-analysis-panel">
                                    <div className="cmm-analysis-header">
                                        <div className="cmm-analysis-title">
                                            <Sparkles size={16} />
                                            <span>AI 스키마 분석 결과</span>
                                            {analysisResult.tableType && (
                                                <span className="cmm-analysis-type">{analysisResult.tableType}</span>
                                            )}
                                        </div>
                                        <button
                                            className="cmm-analysis-toggle"
                                            onClick={() => setShowAnalysisPanel(false)}
                                        >
                                            <ChevronUp size={16} />
                                        </button>
                                    </div>

                                    {analysisResult.analysisNote && (
                                        <p className="cmm-analysis-note">{analysisResult.analysisNote}</p>
                                    )}

                                    {/* 컬럼 분석 테이블 */}
                                    <div className="cmm-analysis-table-wrapper">
                                        <table className="cmm-table cmm-analysis-table">
                                            <thead>
                                                <tr>
                                                    <th>컬럼명</th>
                                                    <th>한글명</th>
                                                    <th>역할</th>
                                                    <th>카테고리</th>
                                                    <th>관계</th>
                                                    <th>그룹</th>
                                                    <th>설명</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {analysisResult.columns?.map((col, idx) => (
                                                    <tr key={col.columnName}>
                                                        <td className="col-name">{col.columnName}</td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                value={col.columnNameKo || ''}
                                                                onChange={e => handleAnalysisColumnChange(idx, 'columnNameKo', e.target.value)}
                                                                className="cmm-analysis-input"
                                                            />
                                                        </td>
                                                        <td>
                                                            <select
                                                                value={col.columnRole}
                                                                onChange={e => handleAnalysisColumnChange(idx, 'columnRole', e.target.value)}
                                                                className="cmm-analysis-select"
                                                                style={{
                                                                    borderColor: COLUMN_ROLES.find(r => r.value === col.columnRole)?.color || '#ccc'
                                                                }}
                                                            >
                                                                {COLUMN_ROLES.map(role => (
                                                                    <option key={role.value} value={role.value}>
                                                                        {role.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select
                                                                value={col.semanticCategory || ''}
                                                                onChange={e => handleAnalysisColumnChange(idx, 'semanticCategory', e.target.value)}
                                                                className="cmm-analysis-select"
                                                            >
                                                                <option value="">자동</option>
                                                                {/* AI가 반환한 값이 목록에 없으면 별도 옵션으로 표시 */}
                                                                {col.semanticCategory && !semanticCategories.some(c => c?.en === col.semanticCategory) && (
                                                                    <option value={col.semanticCategory}>{col.semanticCategory} (AI)</option>
                                                                )}
                                                                {semanticCategories.filter(c => c?.en).map(cat => (
                                                                    <option key={cat.en} value={cat.en}>{cat.ko} ({cat.en})</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td>
                                                            {col.columnRole === 'RELATION' || col.columnRole === 'ATTRIBUTE' || col.columnRole === 'ATTRIBUTES' ? (
                                                                <select
                                                                    value={col.semanticRelation || ''}
                                                                    onChange={e => handleAnalysisColumnChange(idx, 'semanticRelation', e.target.value)}
                                                                    className="cmm-analysis-select"
                                                                >
                                                                    <option value="">자동</option>
                                                                    {semanticRelations.filter(r => r.en).map(rel => (
                                                                        <option key={rel.en} value={rel.en}>{rel.ko} ({rel.en})</option>
                                                                    ))}
                                                                </select>
                                                            ) : <span>-</span>}
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                value={col.entityGroup || ''}
                                                                onChange={e => handleAnalysisColumnChange(idx, 'entityGroup', e.target.value)}
                                                                className="cmm-analysis-input small"
                                                                placeholder="-"
                                                            />
                                                        </td>
                                                        <td className="col-desc" title={col.description}>
                                                            {col.description?.length > 40
                                                                ? col.description.substring(0, 40) + '...'
                                                                : col.description}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* 관계 분석 */}
                                    {analysisResult.intraRelations?.length > 0 && (
                                        <div className="cmm-analysis-section">
                                            <h4>테이블 내 관계</h4>
                                            <div className="cmm-relation-list">
                                                {analysisResult.intraRelations.map((rel, idx) => (
                                                    <div key={idx} className="cmm-relation-item">
                                                        <span className="cmm-rel-subject">{rel.subject}</span>
                                                        <span className="cmm-rel-arrow">→</span>
                                                        <span className="cmm-rel-label">{rel.relation}</span>
                                                        <span className="cmm-rel-arrow">→</span>
                                                        <span className="cmm-rel-object">{rel.object}</span>
                                                        <span className={`cmm-rel-type ${rel.type}`}>{rel.type}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 인사이트 */}
                                    {analysisResult.derivedInsights?.length > 0 && (
                                        <div className="cmm-analysis-section">
                                            <h4>도출 인사이트</h4>
                                            <ul className="cmm-insights-list">
                                                {analysisResult.derivedInsights.map((insight, idx) => (
                                                    <li key={idx}>{insight}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* 적용 버튼 */}
                                    <div className="cmm-analysis-actions">
                                        <button
                                            className="cmm-btn secondary"
                                            onClick={() => { setShowAnalysisPanel(false); setAnalysisResult(null); }}
                                        >
                                            취소
                                        </button>
                                        <button
                                            className="cmm-btn ai-apply"
                                            onClick={handleApplySchema}
                                            disabled={saving}
                                        >
                                            <CheckCircle size={14} />
                                            {saving ? '적용 중...' : '매핑에 적용'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* 분석 결과 접힌 상태 알림 */}
                            {!showAnalysisPanel && analysisResult && (
                                <button
                                    className="cmm-analysis-collapsed"
                                    onClick={() => setShowAnalysisPanel(true)}
                                >
                                    <Sparkles size={14} />
                                    <span>AI 분석 결과가 준비되었습니다</span>
                                    <ChevronDown size={14} />
                                </button>
                            )}

                            <div className="cmm-table-wrapper">
                                <table className="cmm-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>컬럼명</th>
                                            <th>한글명</th>
                                            <th>역할</th>
                                            <th title="온톨로지 카테고리 (Person, Project, Skill 등)">카테고리</th>
                                            <th title="온톨로지 관계명 (Works_On, Has_Skill 등)">관계</th>
                                            <th>그룹</th>
                                            <th title="그룹 키 컬럼 (ENTITY 집계 기준)">GK</th>
                                            <th title="시계열 컬럼 (TRANSACTION 시계열 기준)">TA</th>
                                            <th>샘플값</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {columns.map((col, idx) => {
                                            const roleInfo = COLUMN_ROLES.find(r => r.value === col.columnRole);
                                            const sampleVal = preview?.sampleRows?.[0]?.[col.columnName] || '';
                                            const isRelation = col.columnRole === 'RELATION';
                                            const refCols = col.referenceDocumentId ? (refDocColumns[col.referenceDocumentId] || []) : [];

                                            return (
                                                <React.Fragment key={col.columnName}>
                                                    <tr className={col.columnRole === 'SKIP' ? 'row-skip' : ''}>
                                                        <td className="col-num">{idx + 1}</td>
                                                        <td className="col-name">{col.columnName}</td>
                                                        <td className="col-ko">
                                                            <input
                                                                type="text"
                                                                value={col.columnNameKo || ''}
                                                                onChange={e => handleKoNameChange(col.columnName, e.target.value)}
                                                                placeholder="한글명"
                                                            />
                                                        </td>
                                                        <td className="col-role">
                                                            <select
                                                                value={col.columnRole}
                                                                onChange={e => handleRoleChange(col.columnName, e.target.value)}
                                                                style={{ borderColor: roleInfo?.color || '#ccc' }}
                                                            >
                                                                {COLUMN_ROLES.map(role => (
                                                                    <option key={role.value} value={role.value}>
                                                                        {role.label} - {role.desc}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="col-semantic">
                                                            {col.columnRole !== 'SKIP' && col.columnRole !== 'CONTENT' ? (
                                                                <select
                                                                    value={col.semanticCategory || ''}
                                                                    onChange={e => handleSemanticCategoryChange(col.columnName, e.target.value)}
                                                                    className="cmm-semantic-select"
                                                                    title="온톨로지 카테고리 (Person, Project 등)"
                                                                >
                                                                    <option value="">자동</option>
                                                                    {semanticCategories.filter(c => c?.en).map(cat => (
                                                                        <option key={cat.en} value={cat.en}>{cat.ko} ({cat.en})</option>
                                                                    ))}
                                                                </select>
                                                            ) : <span className="cmm-semantic-na">-</span>}
                                                        </td>
                                                        <td className="col-semantic">
                                                            {col.columnRole !== 'SKIP' && col.columnRole !== 'CONTENT' && col.columnRole !== 'ENTITY' && col.columnRole !== 'ENTITIES' ? (
                                                                <div className="cmm-semantic-rel-group">
                                                                    <select
                                                                        value={col.semanticRelation || ''}
                                                                        onChange={e => handleSemanticRelationChange(col.columnName, e.target.value)}
                                                                        className="cmm-semantic-select"
                                                                        title="온톨로지 관계명"
                                                                    >
                                                                        <option value="">자동</option>
                                                                        {semanticRelations.filter(r => r.en).map(rel => (
                                                                            <option key={rel.en} value={rel.en}>{rel.en} ({rel.ko})</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            ) : col.columnRole === 'ENTITY' ? (
                                                                <span className="cmm-semantic-na" title="ENTITY는 주어 역할 (관계 없음)">-</span>
                                                            ) : col.columnRole === 'ENTITIES' ? (
                                                                <span className="cmm-semantic-na" title="ENTITIES는 복수 엔티티 (각 값을 분리 저장, 관계 없음)">-</span>
                                                            ) : <span className="cmm-semantic-na">-</span>}
                                                        </td>
                                                        <td className="col-group">
                                                            <input
                                                                type="text"
                                                                value={col.entityGroup || ''}
                                                                onChange={e => handleEntityGroupChange(col.columnName, e.target.value)}
                                                                placeholder="-"
                                                                title="엔티티 그룹 (같은 그룹의 컬럼은 하나의 엔티티를 구성)"
                                                            />
                                                        </td>
                                                        <td className="col-flag">
                                                            <input
                                                                type="checkbox"
                                                                checked={!!col.isGroupKey}
                                                                onChange={() => handleGroupKeyToggle(col.columnName)}
                                                                title="그룹 키 (집계 시 기준 컬럼)"
                                                            />
                                                        </td>
                                                        <td className="col-flag">
                                                            <input
                                                                type="checkbox"
                                                                checked={!!col.isTimeAxis}
                                                                onChange={() => handleTimeAxisToggle(col.columnName)}
                                                                title="시간축 (시계열 요약 기준)"
                                                            />
                                                        </td>
                                                        <td className="col-sample" title={sampleVal}>
                                                            {sampleVal.length > 40 ? sampleVal.substring(0, 40) + '...' : sampleVal}
                                                        </td>
                                                    </tr>
                                                    {/* RELATION 역할이고 참조 가능한 문서가 있을 때 참조 설정 서브행 */}
                                                    {isRelation && hasRefDocs && (
                                                        <tr className="ref-sub-row">
                                                            <td></td>
                                                            <td colSpan={9}>
                                                                <div className="ref-settings">
                                                                    <span className="ref-label">FK 참조:</span>
                                                                    <select
                                                                        className="ref-select"
                                                                        value={col.referenceDocumentId || ''}
                                                                        onChange={e => handleRefDocChange(col.columnName, e.target.value)}
                                                                    >
                                                                        <option value="">직접값 (참조 없음)</option>
                                                                        {workspaceDocs.map(d => (
                                                                            <option key={d.id} value={d.id}>
                                                                                {d.filename}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    {col.referenceDocumentId && (
                                                                        <>
                                                                            <span className="ref-label">매칭 컬럼:</span>
                                                                            <select
                                                                                className="ref-select"
                                                                                value={col.referenceKeyColumn || ''}
                                                                                onChange={e => handleRefKeyColumnChange(col.columnName, e.target.value)}
                                                                            >
                                                                                <option value="">선택...</option>
                                                                                {refCols.map(rc => (
                                                                                    <option key={rc.columnName} value={rc.columnName}>
                                                                                        {rc.columnName} {rc.columnNameKo ? `(${rc.columnNameKo})` : ''}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* 처리 모드 선택 패널 */}
                            {showModePanel && modeRecommendation && (
                                <div className="cmm-mode-panel" ref={modePanelRef}>
                                    <div className="cmm-mode-header">
                                        <div className="cmm-mode-title">
                                            <Settings size={16} />
                                            처리 모드 선택
                                        </div>
                                        <button
                                            className="cmm-analysis-toggle"
                                            onClick={() => setShowModePanel(false)}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>

                                    <div className="cmm-mode-reason">
                                        <Info size={14} />
                                        <span>{modeRecommendation.reason}</span>
                                    </div>

                                    {modeRecommendation.hints?.length > 0 && (
                                        <ul className="cmm-mode-hints">
                                            {modeRecommendation.hints.map((h, i) => (
                                                <li key={i}>{h}</li>
                                            ))}
                                        </ul>
                                    )}

                                    <div className="cmm-mode-options">
                                        <button
                                            className={`cmm-mode-btn ${processingMode === 'MASTER' ? 'active master' : ''}`}
                                            onClick={() => setProcessingMode('MASTER')}
                                        >
                                            <span className="cmm-mode-btn-label">온톨로지</span>
                                            <span className="cmm-mode-btn-desc">전체 → 지식그래프(ArangoDB)</span>
                                        </button>
                                        <button
                                            className={`cmm-mode-btn ${processingMode === 'TRANSACTION' ? 'active transaction' : ''}`}
                                            onClick={() => setProcessingMode('TRANSACTION')}
                                        >
                                            <span className="cmm-mode-btn-label">시계열 집계</span>
                                            <span className="cmm-mode-btn-desc">그룹 요약 → RAG 검색</span>
                                        </button>
                                        <button
                                            className={`cmm-mode-btn ${processingMode === 'MIXED' ? 'active mixed' : ''}`}
                                            onClick={() => setProcessingMode('MIXED')}
                                        >
                                            <span className="cmm-mode-btn-label">혼합</span>
                                            <span className="cmm-mode-btn-desc">엔티티 → 온톨로지 + 나머지 → 요약</span>
                                        </button>
                                    </div>

                                    <div className="cmm-mode-actions">
                                        <button
                                            className="cmm-btn secondary"
                                            onClick={() => setShowModePanel(false)}
                                        >
                                            취소
                                        </button>
                                        <button
                                            className="cmm-btn primary"
                                            onClick={handleProcessAll}
                                            disabled={!processingMode || isProcessing}
                                        >
                                            {isProcessing ? (
                                                <><Loader className="spinner" size={14} /> 처리 중...</>
                                            ) : (
                                                <><Play size={14} /> {processingMode === 'MASTER' ? '온톨로지 처리 시작' : processingMode === 'TRANSACTION' ? '시계열 집계 시작' : '혼합 처리 시작'}</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'preview' && preview && (
                        <div className="cmm-preview">
                            <p className="cmm-preview-info">
                                총 {preview.totalRecords?.toLocaleString()}건 중 상위 5건
                            </p>
                            <div className="cmm-table-wrapper">
                                <table className="cmm-table preview-table">
                                    <thead>
                                        <tr>
                                            {preview.headers?.map(h => (
                                                <th key={h}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.sampleRows?.map((row, rowIdx) => (
                                            <tr key={rowIdx}>
                                                {preview.headers?.map(h => (
                                                    <td key={h} title={row[h]}>
                                                        {(row[h] || '').length > 50
                                                            ? row[h].substring(0, 50) + '...'
                                                            : row[h] || ''}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'status' && (
                        <div className="cmm-status">
                            {status ? (
                                <>
                                    <div className="cmm-status-header">
                                        <span className={`cmm-status-badge ${status.status?.toLowerCase()}`}>
                                            {status.status}
                                        </span>
                                        <button className="cmm-refresh-btn" onClick={refreshStatus}>
                                            <RotateCcw size={14} /> 새로고침
                                        </button>
                                    </div>

                                    {status.pipelineStep && status.status === 'PROCESSING' && (
                                        <p className="cmm-pipeline-step">{status.pipelineStep}</p>
                                    )}
                                    <div className="cmm-progress-bar">
                                        <div
                                            className="cmm-progress-fill"
                                            style={{ width: `${status.progress || 0}%` }}
                                        />
                                    </div>
                                    <p className="cmm-progress-text">{status.progress || 0}%</p>

                                    <div className="cmm-status-grid">
                                        <div className="cmm-stat">
                                            <span className="cmm-stat-label">전체</span>
                                            <span className="cmm-stat-value">{status.totalRecords?.toLocaleString()}</span>
                                        </div>
                                        <div className="cmm-stat completed">
                                            <span className="cmm-stat-label">완료</span>
                                            <span className="cmm-stat-value">{status.completed?.toLocaleString()}</span>
                                        </div>
                                        <div className="cmm-stat failed">
                                            <span className="cmm-stat-label">실패</span>
                                            <span className="cmm-stat-value">{status.failed?.toLocaleString()}</span>
                                        </div>
                                        <div className="cmm-stat pending">
                                            <span className="cmm-stat-label">대기</span>
                                            <span className="cmm-stat-value">{status.pending?.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {status.failed > 0 && !isProcessing && (
                                        <p className="cmm-failed-hint">
                                            <AlertCircle size={14} />
                                            실패 {status.failed}건 — 하단 버튼으로 재처리 가능
                                        </p>
                                    )}
                                </>
                            ) : (
                                <p className="cmm-no-status">처리가 시작되지 않았습니다.</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'quality' && (
                        <div className="cmm-quality">
                            {loadingQuality ? (
                                <div className="cmm-loading">
                                    <Loader className="spinner" size={24} />
                                    <span>품질 리포트 생성 중...</span>
                                </div>
                            ) : qualityReport ? (
                                <>
                                    {/* 요약 섹션 */}
                                    <div className="cmm-quality-summary">
                                        <div className="cmm-quality-summary-grid">
                                            <div className="cmm-quality-stat">
                                                <span className="cmm-quality-stat-label">전체 레코드</span>
                                                <span className="cmm-quality-stat-value">{qualityReport.totalRecords?.toLocaleString()}</span>
                                            </div>
                                            <div className="cmm-quality-stat">
                                                <span className="cmm-quality-stat-label">전체 컬럼</span>
                                                <span className="cmm-quality-stat-value">{qualityReport.totalColumns}</span>
                                            </div>
                                            <div className={`cmm-quality-stat ${qualityReport.duplicateRowCount > 0 ? 'has-issue' : ''}`}>
                                                <span className="cmm-quality-stat-label">중복 행</span>
                                                <span className="cmm-quality-stat-value">{qualityReport.duplicateRowCount?.toLocaleString()}</span>
                                            </div>
                                            <div className={`cmm-quality-stat ${qualityReport.emptyRowCount > 0 ? 'has-issue' : ''}`}>
                                                <span className="cmm-quality-stat-label">빈 행</span>
                                                <span className="cmm-quality-stat-value">{qualityReport.emptyRowCount?.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {/* 경고 메시지 */}
                                        {qualityReport.warnings?.length > 0 && (
                                            <div className="cmm-quality-warnings">
                                                <div className="cmm-quality-warnings-title">
                                                    <AlertTriangle size={14} />
                                                    <span>경고 ({qualityReport.warnings.length}건)</span>
                                                </div>
                                                <ul className="cmm-quality-warnings-list">
                                                    {qualityReport.warnings.map((w, idx) => (
                                                        <li key={idx}>{w}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* 컬럼별 상세 테이블 */}
                                    <div className="cmm-quality-detail">
                                        <h4 className="cmm-quality-detail-title">
                                            <Info size={14} />
                                            컬럼별 품질 분석
                                        </h4>
                                        <div className="cmm-table-wrapper">
                                            <table className="cmm-table cmm-quality-table">
                                                <thead>
                                                    <tr>
                                                        <th>컬럼명</th>
                                                        <th>타입</th>
                                                        <th>Null %</th>
                                                        <th>고유값</th>
                                                        <th>샘플값</th>
                                                        <th>상태</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {qualityReport.columnQualities?.map((col) => (
                                                        <tr
                                                            key={col.columnName}
                                                            className={`${col.allSameValue ? 'row-all-same' : ''} ${col.suspectedDerived ? 'row-derived' : ''}`}
                                                        >
                                                            <td className="col-name">{col.columnName}</td>
                                                            <td>
                                                                <span className={`cmm-quality-type-badge ${getTypeBadgeClass(col.detectedType)}`}>
                                                                    {col.detectedType || 'STRING'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <div className={`cmm-quality-null-cell ${getNullSeverity(col.nullPercentage)}`}>
                                                                    <div className="cmm-quality-null-bar">
                                                                        <div
                                                                            className="cmm-quality-null-fill"
                                                                            style={{ width: `${Math.min(col.nullPercentage, 100)}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className="cmm-quality-null-text">
                                                                        {col.nullPercentage?.toFixed(1)}%
                                                                        <span className="cmm-quality-null-count">({col.nullCount})</span>
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="cmm-quality-distinct">
                                                                {col.distinctCount?.toLocaleString()}
                                                            </td>
                                                            <td className="col-sample" title={col.sampleValue}>
                                                                {(col.sampleValue || '').length > 30
                                                                    ? col.sampleValue.substring(0, 30) + '...'
                                                                    : col.sampleValue || '-'}
                                                            </td>
                                                            <td className="cmm-quality-indicators">
                                                                {col.allSameValue && (
                                                                    <span className="cmm-quality-indicator all-same" title="모든 값이 동일">
                                                                        동일값
                                                                    </span>
                                                                )}
                                                                {col.hasNumberFormat && (
                                                                    <span className="cmm-quality-indicator number-format" title="천단위 구분자 포함 (예: 1,000)">
                                                                        천단위
                                                                    </span>
                                                                )}
                                                                {col.suspectedDerived && (
                                                                    <span className="cmm-quality-indicator derived" title={`파생 의심: ${col.derivedFrom || ''}`}>
                                                                        파생?{col.derivedFrom ? ` (${col.derivedFrom})` : ''}
                                                                    </span>
                                                                )}
                                                                {col.nullPercentage > 90 && (
                                                                    <span className="cmm-quality-indicator high-null" title="Null 비율 90% 초과">
                                                                        결측
                                                                    </span>
                                                                )}
                                                                {!col.allSameValue && !col.hasNumberFormat && !col.suspectedDerived && col.nullPercentage <= 90 && (
                                                                    <span className="cmm-quality-indicator ok">
                                                                        정상
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="cmm-no-status">품질 리포트를 불러올 수 없습니다.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* 하단 액션 */}
                <div className="cmm-footer">
                    {/* 템플릿 저장 영역 */}
                    {showTemplateSaveForm ? (
                        <div className="cmm-template-save-form">
                            <input
                                type="text"
                                className="cmm-template-name-input"
                                placeholder="템플릿 이름"
                                value={templateName}
                                onChange={e => setTemplateName(e.target.value)}
                                autoFocus
                            />
                            <button
                                className="cmm-btn secondary"
                                onClick={handleSaveTemplate}
                                disabled={savingTemplate || !templateName.trim()}
                            >
                                {savingTemplate ? '저장 중...' : '매핑 + 템플릿 저장'}
                            </button>
                            <button
                                className="cmm-btn secondary"
                                onClick={() => { setShowTemplateSaveForm(false); setTemplateName(''); }}
                            >
                                취소
                            </button>
                            {templates.length > 0 && (
                                <div className="cmm-template-list">
                                    <span className="cmm-template-list-label">저장된 템플릿:</span>
                                    {templates.map(t => (
                                        <span key={t.id} className="cmm-template-list-item">
                                            {t.name} ({t.columnCount}컬럼)
                                            <button
                                                className="cmm-template-delete-btn"
                                                onClick={() => handleDownloadTemplate(t)}
                                                title="템플릿 다운로드"
                                            >
                                                <Download size={11} />
                                            </button>
                                            <button
                                                className="cmm-template-delete-btn"
                                                onClick={() => {
                                                    if (window.confirm(`"${t.name}" 템플릿을 삭제하시겠습니까?`)) {
                                                        handleDeleteTemplate(t.id);
                                                    }
                                                }}
                                                title="템플릿 삭제"
                                            >
                                                <Trash2 size={11} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <button
                                className="cmm-btn secondary cmm-template-save-btn"
                                onClick={() => setShowTemplateSaveForm(true)}
                                disabled={isProcessing}
                                title="현재 매핑을 템플릿으로 저장"
                            >
                                <Save size={13} />
                                템플릿 저장
                            </button>
                            <label
                                className="cmm-btn secondary cmm-template-save-btn"
                                style={{ cursor: 'pointer' }}
                                title="JSON 템플릿 파일 업로드"
                            >
                                <Upload size={13} />
                                템플릿 불러오기
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleUploadTemplate}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </>
                    )}

                    <button className="cmm-btn secondary" onClick={handleSave} disabled={saving || isProcessing}
                        title="현재 컬럼 역할만 저장 (템플릿 생성 없음)">
                        {saving ? '저장 중...' : '매핑만 저장'}
                    </button>
                    <button
                        className="cmm-btn secondary"
                        onClick={handleProcessSample}
                        disabled={isProcessing || isCompleted || noEntity}
                    >
                        {isProcessing ? <Loader className="spinner" size={14} /> : <Play size={14} />}
                        샘플 10건 처리
                    </button>
                    {isCompleted && !hasFailed ? (
                        <button
                            className="cmm-btn primary"
                            onClick={handleReprocess}
                            disabled={isProcessing}
                            title="매핑 변경 후 기존 결과를 삭제하고 다시 처리"
                        >
                            <RotateCcw size={14} />
                            재처리
                        </button>
                    ) : hasFailed && !isProcessing ? (
                        <button
                            className="cmm-btn primary"
                            onClick={handleRetry}
                            disabled={isProcessing || noEntity}
                        >
                            <RotateCcw size={14} />
                            실패 {status.failed}건 재처리
                        </button>
                    ) : (
                        <button
                            className="cmm-btn primary"
                            onClick={loadProcessingModeRecommendation}
                            disabled={isProcessing || loadingMode}
                        >
                            {loadingMode ? <Loader className="spinner" size={14} /> : <Settings size={14} />}
                            {loadingMode ? '분석 중...' : '전체 처리 시작'}
                        </button>
                    )}
                </div>
            </div>

            {/* Help 패널 (오버레이) */}
            {showHelp && (
                <div className="cmm-help-overlay" onClick={() => setShowHelp(false)}>
                    <div className="cmm-help-panel" onClick={e => e.stopPropagation()}>
                        <div className="cmm-help-header">
                            <HelpCircle size={20} color="#1a73e8" />
                            <span className="cmm-help-title">컬럼 매핑 도움말</span>
                            <button className="cmm-close" onClick={() => setShowHelp(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* 섹션 탭 */}
                        <div className="cmm-help-tabs">
                            {['컬럼 역할 & 복수값', '매핑 옵션', '처리 모드'].map((label, i) => (
                                <button
                                    key={i}
                                    className={`cmm-help-tab ${helpSection === i ? 'active' : ''}`}
                                    onClick={() => setHelpSection(i)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="cmm-help-body">
                            {/* 섹션 1: 컬럼 역할 */}
                            {helpSection === 0 && (
                                <div className="cmm-help-section">
                                    <h3>컬럼 역할 (ENTITY / ATTRIBUTE / CONTENT / JOIN) 설명</h3>
                                    <table className="cmm-help-table">
                                        <thead>
                                            <tr>
                                                <th>역할</th>
                                                <th>의미</th>
                                                <th>예시</th>
                                                <th>온톨로지에서의 역할</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td><span className="cmm-help-role-badge entity">ENTITY</span></td>
                                                <td>핵심 개체 — 지식그래프의 노드(동그라미)가 됨</td>
                                                <td>피부타입="지성", 브랜드="이니스프리"</td>
                                                <td>그래프 노드로 생성, 다른 노드와 관계선으로 연결</td>
                                            </tr>
                                            <tr>
                                                <td><span className="cmm-help-role-badge attribute">ATTRIBUTE</span></td>
                                                <td>단일 속성값 — 값 전체를 하나로 사용 (분리 안 함)</td>
                                                <td>나이=28, 주소="서울시 강남구"</td>
                                                <td>노드의 속성(프로퍼티)으로 저장, 독립 노드 아님</td>
                                            </tr>
                                            <tr>
                                                <td><span className="cmm-help-role-badge attributes">ATTRIBUTES</span></td>
                                                <td>복수 속성값 — 구분자(; | ,)로 자동 분리하여 각각 트리플 생성</td>
                                                <td>"모공, 주름, 탄력" → 3개 트리플</td>
                                                <td>분리된 각 값이 별도 속성 트리플로 저장</td>
                                            </tr>
                                            <tr>
                                                <td><span className="cmm-help-role-badge content">CONTENT</span></td>
                                                <td>텍스트 내용 — LLM이 분석하여 개체/관계를 자동 추출</td>
                                                <td>"레티놀, 나이아신아마이드 사용 경험 있음"</td>
                                                <td>LLM이 텍스트를 읽고 알아서 노드+관계 생성</td>
                                            </tr>
                                            <tr>
                                                <td><span className="cmm-help-role-badge join">JOIN</span></td>
                                                <td>다른 테이블과 연결하는 키 — FK 역할</td>
                                                <td>사원번호, 부서코드</td>
                                                <td>테이블 간 관계 매핑에 사용</td>
                                            </tr>
                                            <tr>
                                                <td><span className="cmm-help-role-badge skip">SKIP</span></td>
                                                <td>무시 — 처리 안 함</td>
                                                <td>타임스탬프, 개인정보동의</td>
                                                <td>온톨로지에 포함 안 됨</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div className="cmm-help-analogy">
                                        <strong>{'💡'} 간단 비유</strong>
                                        <ul>
                                            <li><b>ENTITY</b> = 사람 이름 (주인공)</li>
                                            <li><b>ATTRIBUTE</b> = 그 사람의 키, 나이 (단일 부가 정보)</li>
                                            <li><b>ATTRIBUTES</b> = 취미: 독서, 영화, 등산 (복수값 자동 분리)</li>
                                            <li><b>CONTENT</b> = 그 사람에 대한 메세지 (AI가 읽고 정보 추출)</li>
                                            <li><b>JOIN</b> = 주민번호 (다른 문서와 연결하는 열쇠)</li>
                                        </ul>
                                    </div>

                                    <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '20px 0' }} />

                                    <h3>ATTRIBUTES 복수값 자동 분리 규칙</h3>
                                    <p className="cmm-help-desc">역할을 <b>ATTRIBUTES</b>로 설정하면 아래 구분자로 자동 분리됩니다:</p>
                                    <table className="cmm-help-table">
                                        <thead>
                                            <tr>
                                                <th>구분자</th>
                                                <th>예시</th>
                                                <th>처리</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td><code>;</code> (세미콜론)</td>
                                                <td>레티놀;나이아신아마이드</td>
                                                <td>2개 트리플 생성</td>
                                            </tr>
                                            <tr>
                                                <td><code>|</code> (파이프)</td>
                                                <td>건성|복합성</td>
                                                <td>2개 트리플 생성</td>
                                            </tr>
                                            <tr>
                                                <td><code>,</code> (쉼표)</td>
                                                <td>모공, 주름, 탄력</td>
                                                <td>3개 트리플 생성</td>
                                            </tr>
                                            <tr>
                                                <td>숫자 쉼표</td>
                                                <td>1,234,567</td>
                                                <td>숫자로 인식 → 1개로 유지</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div className="cmm-help-example">
                                        <strong>예시:</strong> ATTRIBUTES 컬럼 값이 <code>모공, 주름, 탄력</code>이면 각각 별도 트리플 생성:
                                        <div className="cmm-help-triple-list">
                                            <div>Subject —[Has_XXX]→ 모공</div>
                                            <div>Subject —[Has_XXX]→ 주름</div>
                                            <div>Subject —[Has_XXX]→ 탄력</div>
                                        </div>
                                    </div>
                                    <div className="cmm-help-analogy">
                                        <strong>{'💡'} ATTRIBUTE vs ATTRIBUTES 선택 기준</strong>
                                        <p>값에 쉼표가 있지만 <b>분리하면 안 되는 경우</b>(예: 주소 "서울시 강남구, 역삼동") → <b>ATTRIBUTE</b></p>
                                        <p>값에 쉼표가 있고 <b>각각 독립적인 의미</b>인 경우(예: 피부고민 "모공, 주름, 탄력") → <b>ATTRIBUTES</b></p>
                                    </div>
                                </div>
                            )}

                            {/* 섹션 2: 매핑 옵션 (그룹/GK/TA) */}
                            {helpSection === 1 && (
                                <div className="cmm-help-section">
                                    <h3>매핑 옵션 (그룹 / GK / TA) 설명</h3>
                                    <table className="cmm-help-table">
                                        <thead>
                                            <tr>
                                                <th>옵션</th>
                                                <th>표시</th>
                                                <th>의미</th>
                                                <th>예시</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td><b>그룹</b></td>
                                                <td>텍스트 입력</td>
                                                <td>엔티티 그룹명. 같은 그룹의 컬럼은 하나의 엔티티(노드)를 구성합니다. 비워두면 기본(primary) 엔티티 소속.</td>
                                                <td>"Brand" 그룹에 브랜드명+브랜드코드 → 하나의 Brand 노드</td>
                                            </tr>
                                            <tr>
                                                <td><b>GK</b></td>
                                                <td>체크박스</td>
                                                <td><b>Group Key</b> — 시계열 집계(TRANSACTION) 모드에서 레코드를 묶는 기준 컬럼. 이 컬럼 값이 같은 행들을 하나로 그룹핑하여 요약합니다.</td>
                                                <td>상품코드를 GK로 → 같은 상품의 월별 매출을 합산</td>
                                            </tr>
                                            <tr>
                                                <td><b>TA</b></td>
                                                <td>체크박스</td>
                                                <td><b>Time Axis</b> — 시계열 집계 시 시간축으로 사용할 컬럼. 날짜/월 등 시간 정보가 담긴 컬럼에 체크합니다.</td>
                                                <td>거래월을 TA로 → 월별 추이 요약 생성</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div className="cmm-help-analogy">
                                        <strong>{'💡'} 간단 비유</strong>
                                        <ul>
                                            <li><b>그룹</b> = 같은 부서 직원들을 하나의 명함첩에 묶기</li>
                                            <li><b>GK</b> = 가계부에서 "식비" 항목끼리 묶는 기준</li>
                                            <li><b>TA</b> = 가계부의 "날짜" 열 (언제 지출했는지)</li>
                                        </ul>
                                    </div>
                                    <div className="cmm-help-example" style={{ marginTop: 12 }}>
                                        <strong>참고:</strong> GK와 TA는 처리 모드가 <b>시계열 집계(TRANSACTION)</b> 또는 <b>혼합(MIXED)</b>일 때만 의미가 있습니다. 온톨로지(MASTER) 모드에서는 무시됩니다.
                                    </div>
                                </div>
                            )}

                            {/* 섹션 3: 처리 모드 */}
                            {helpSection === 2 && (
                                <div className="cmm-help-section">
                                    <h3>처리 모드 (온톨로지 / 시계열 집계 / 혼합) 설명</h3>
                                    <table className="cmm-help-table">
                                        <thead>
                                            <tr>
                                                <th>모드</th>
                                                <th>언제 사용</th>
                                                <th>처리 방식</th>
                                                <th>예시</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td><span className="cmm-help-mode-badge master">온톨로지<br />(MASTER)</span></td>
                                                <td>기준 데이터, 코드 테이블, 설문 응답 등 한 행이 하나의 의미 단위</td>
                                                <td>각 행에서 ENTITY → 노드, ATTRIBUTE → 속성, 관계 자동 생성</td>
                                                <td>설문 응답(1행=1명), 제품 목록(1행=1개)</td>
                                            </tr>
                                            <tr>
                                                <td><span className="cmm-help-mode-badge transaction">시계열 집계<br />(TRANSACTION)</span></td>
                                                <td>매출, 로그, 거래 내역 등 같은 키의 행이 여러 개이고 시간축이 있는 데이터</td>
                                                <td>같은 ENTITY 값으로 묶어서 요약(합계/평균/추이) → 요약 결과를 온톨로지로 변환</td>
                                                <td>월별 매출(동일 상품 12행 → 1개 요약 노드)</td>
                                            </tr>
                                            <tr>
                                                <td><span className="cmm-help-mode-badge mixed">혼합<br />(MIXED)</span></td>
                                                <td>위 둘 다 해당하는 데이터</td>
                                                <td>온톨로지 추출 + 시계열 집계 둘 다 실행</td>
                                                <td>설문 데이터인데 동일 응답자가 여러 번 응답</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div className="cmm-help-analogy">
                                        <strong>💡 간단 비유</strong>
                                        <ul>
                                            <li><b>온톨로지</b> = 명함 정리 (한 장에 한 사람 정보)</li>
                                            <li><b>시계열 집계</b> = 가계부 정리 (같은 항목 여러 건을 월별로 합산)</li>
                                            <li><b>혼합</b> = 명함 + 가계부 둘 다</li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ColumnMappingModal;

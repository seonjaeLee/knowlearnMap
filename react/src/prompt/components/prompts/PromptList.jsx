import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../../../context/AlertContext';
import { FileText, Plus, RotateCcw, Search } from 'lucide-react';
import { Popover } from '@mui/material';
import { usePrompts, useDeletePrompt, useUpdatePrompt } from '../../hooks/usePrompts';
import { promptService } from '../../api/promptService';
import { PROMPT_SECURITY_LEVELS } from '../../constants/securityLevels';
import PromptFormDialog from './PromptFormDialog';
import EditPromptDialog from './EditPromptDialog';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import KlIconButton from '../../../components/common/KlIconButton';
import BasicTable from '../../../components/common/BasicTable';
import KlTableRowActions from '../../../components/common/table/KlTableRowActions';
import { formatTableCellText, isTableCellBlank, TableCellBlank } from '../../../components/common/tableCellDisplay';
import '../../../pages/admin/admin-common.css';
import './PromptList.css';

const PROMPT_TABLE_COLUMNS = [
  { id: 'no', label: 'No', width: 48, align: 'center', ellipsis: false },
  { id: 'category', label: '카테고리', width: 100, align: 'left' },
  { id: 'purpose', label: '용도', width: 100, align: 'left' },
  { id: 'code', label: '코드', width: 120, align: 'left' },
  { id: 'name', label: '이름', width: 140, align: 'left' },
  { id: 'description', label: '설명', width: 180, align: 'left' },
  { id: 'securityLevel', label: '등급', width: 72, align: 'center', ellipsis: false },
  { id: 'activeVersion', label: '버전', width: 64, align: 'center', ellipsis: false },
  { id: 'versionCount', label: '수', width: 48, align: 'center', ellipsis: false },
  { id: 'updatedAt', label: '수정일', width: 100, align: 'left' },
  { id: 'actions', label: '관리', width: 92, align: 'center', ellipsis: false },
];

const PromptListContent = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: '',
    activeFilter: 'true',
    category: '',
    purpose: '',
  });
  const [categories, setCategories] = useState([]);
  const [purposes, setPurposes] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [descAnchorEl, setDescAnchorEl] = useState(null);
  const [selectedDesc, setSelectedDesc] = useState('');
  const { showAlert, showConfirm } = useAlert();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const apiFilters = useMemo(() => ({
    search: filters.search,
    category: filters.category,
    purpose: filters.purpose,
    isActive: filters.activeFilter === 'all'
      ? undefined
      : filters.activeFilter === 'true',
  }), [filters]);

  const { data, isLoading, refetch } = usePrompts(apiFilters);
  const deletePrompt = useDeletePrompt();
  const updatePrompt = useUpdatePrompt();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await promptService.getCategories();
        const list = response?.data || response;
        if (Array.isArray(list)) setCategories(list);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    const fetchPurposes = async () => {
      try {
        const response = await promptService.getPurposes();
        const list = response?.data || response;
        if (Array.isArray(list)) setPurposes(list);
      } catch (error) {
        console.error('Failed to fetch purposes:', error);
      }
    };
    fetchCategories();
    fetchPurposes();
  }, []);

  const handleDescClick = (event, description) => {
    event.stopPropagation();
    setSelectedDesc(description);
    setDescAnchorEl(event.currentTarget);
  };

  const handleDescClose = () => {
    setDescAnchorEl(null);
    setSelectedDesc('');
  };

  const descOpen = Boolean(descAnchorEl);

  const handleRowClick = useCallback((_event, { row }) => {
    navigate(`/prompts/${row.code}`);
  }, [navigate]);

  const handleEditClick = useCallback((e, prompt) => {
    e.stopPropagation();
    setEditingPrompt(prompt);
    setEditDialogOpen(true);
  }, []);

  const handleEditSave = async (formData) => {
    if (!editingPrompt) return;
    setIsUpdating(true);
    try {
      await updatePrompt.mutateAsync({
        code: editingPrompt.code,
        data: {
          name: formData.name,
          category: formData.category,
          purpose: formData.purpose,
          description: formData.description,
          securityLevel: formData.securityLevel,
        },
      });
      showAlert('수정되었습니다.');
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update prompt:', error);
      showAlert('프롬프트 수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = useCallback(async (e, prompt) => {
    e.stopPropagation();
    const ok = await showConfirm('정말로 이 프롬프트와 관련된 모든 버전 및 스낵샷을 삭제하시겠습니까?');
    if (!ok) return;
    try {
      await deletePrompt.mutateAsync(prompt.code);
      showAlert('삭제되었습니다.');
    } catch {
      showAlert('프롬프트 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  }, [deletePrompt, showAlert, showConfirm]);

  const prompts = Array.isArray(data?.data?.content) ? data.data.content : [];

  const hasActiveFilters = Boolean(
    filters.search.trim()
    || filters.category
    || filters.purpose
    || filters.activeFilter !== 'true',
  );

  const renderPromptCell = useCallback(({ column, row: prompt, rowIndex }) => {
    const level = PROMPT_SECURITY_LEVELS.find(
      (l) => l.value === (prompt.securityLevel || 'PUBLIC'),
    ) || PROMPT_SECURITY_LEVELS[0];

    switch (column.id) {
      case 'no':
        return rowIndex + 1;
      case 'category':
        return prompt.category ? (
          <span className="admin-badge admin-badge-primary">{prompt.category}</span>
        ) : (
          <span className="prompt-list-muted">미분류</span>
        );
      case 'purpose':
        return prompt.purpose ? (
          <span className="admin-badge admin-badge-info">{prompt.purpose}</span>
        ) : (
          <TableCellBlank className="prompt-list-muted" />
        );
      case 'code':
        return prompt.code;
      case 'name':
        return <span className="prompt-list-name-cell">{prompt.name}</span>;
      case 'description':
        if (isTableCellBlank(prompt.description)) {
          return <TableCellBlank className="prompt-list-desc-cell" />;
        }
        return (
          <span
            className="prompt-list-desc-cell prompt-list-desc-cell--interactive"
            onClick={(e) => handleDescClick(e, prompt.description)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleDescClick(e, prompt.description);
              }
            }}
            role="button"
            tabIndex={0}
          >
            {prompt.description}
          </span>
        );
      case 'securityLevel':
        return <span className={level.badge}>{level.label}</span>;
      case 'activeVersion': {
        const activeVersion = prompt.activeVersion;
        return (
          <span className={isTableCellBlank(activeVersion) ? 'kl-table-cell-blank' : undefined}>
            {formatTableCellText(activeVersion)}
          </span>
        );
      }
      case 'versionCount':
        return prompt.versionCount || 0;
      case 'updatedAt':
        return (
          <span className="prompt-list-date-cell">
            {new Date(prompt.updatedAt).toLocaleDateString()}
          </span>
        );
      case 'actions':
        return (
          <KlTableRowActions
            actions={[
              {
                kind: 'edit',
                onClick: (e) => handleEditClick(e, prompt),
                ariaLabel: `${prompt.code} 수정`,
              },
              {
                kind: 'delete',
                onClick: (e) => handleDelete(e, prompt),
                ariaLabel: `${prompt.code} 삭제`,
              },
            ]}
          />
        );
      default:
        return undefined;
    }
  }, [handleDelete, handleEditClick]);

  return (
    <div className="kl-page kl-page--fill prompt-list-page">
      <div className="kl-main-sticky-head">
        <AdminPageHeader
          icon={FileText}
          title="프롬프트 관리"
          count={prompts.length}
          subtitle="시스템 프롬프트의 카테고리·용도·버전·보안 등급을 관리합니다."
        />
      </div>

      <div className="table-area">
        <div className="table-toolbar">
          <div className="toolbar-left">
            <span className="kl-table-toolbar-summary">
              총 <strong>{prompts.length}</strong>건
            </span>
          </div>
          <div className="toolbar-right">
            <div className="search-area">
              <Search size={16} className="search-area-icon" aria-hidden />
              <input
                type="text"
                className="search-area-input"
                placeholder="코드 / 이름으로 검색..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                aria-label="프롬프트 검색"
              />
            </div>
            <select
              className="toolbar-select"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              aria-label="카테고리 필터"
            >
              <option value="">전체 카테고리</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              className="toolbar-select"
              value={filters.purpose}
              onChange={(e) => setFilters({ ...filters, purpose: e.target.value })}
              aria-label="용도 필터"
            >
              <option value="">전체 용도</option>
              {purposes.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select
              className="toolbar-select"
              value={filters.activeFilter}
              onChange={(e) => setFilters({ ...filters, activeFilter: e.target.value })}
              aria-label="활성 상태 필터"
            >
              <option value="true">활성</option>
              <option value="false">비활성</option>
              <option value="all">전체</option>
            </select>
            <KlIconButton
              tooltip="새로고침"
              ariaLabel="프롬프트 목록 새로고침"
              onClick={() => refetch()}
              buttonClassName="kl-btn gray-outline md icon-only"
              stopPropagation={false}
            >
              <RotateCcw size={16} aria-hidden />
            </KlIconButton>
            <button type="button" className="kl-btn primary-full md" onClick={() => setOpenDialog(true)}>
              <Plus size={14} aria-hidden />
              생성
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="admin-loading-state">
            <div className="admin-spinner" />
            <span>데이터를 불러오는 중...</span>
          </div>
        ) : (
          <div className="basic-table-shell">
            <BasicTable
              className="prompt-list-basic-table"
              columns={PROMPT_TABLE_COLUMNS}
              data={prompts}
              renderCell={renderPromptCell}
              onRowClick={handleRowClick}
              rowAriaLabel={(row) => `${row.name || row.code} 상세`}
              emptyState={{ variant: hasActiveFilters ? 'search' : 'default' }}
            />
          </div>
        )}
      </div>

      <PromptFormDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          refetch();
        }}
      />

      <Popover
        open={descOpen}
        anchorEl={descAnchorEl}
        onClose={handleDescClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <div className="prompt-list-desc-popover">{selectedDesc}</div>
      </Popover>

      <EditPromptDialog
        open={editDialogOpen}
        prompt={editingPrompt}
        categories={categories}
        purposes={purposes}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleEditSave}
        isUpdating={isUpdating}
      />
    </div>
  );
};

export default PromptListContent;

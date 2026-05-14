import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../../../context/AlertContext';
import { FileText, Plus, Pencil, Trash2, Search } from 'lucide-react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Select,
  MenuItem,
  Popover,
  Typography,
  Box,
} from '@mui/material';
import { usePrompts, useDeletePrompt, useUpdatePrompt } from '../../hooks/usePrompts';
import { promptService } from '../../api/promptService';
import PromptFormDialog from './PromptFormDialog';
import EditPromptDialog from './EditPromptDialog';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import { promptToolbarSelectSx } from '../../../pages/admin/promptToolbarSelectSx';
import '../../../pages/admin/admin-common.css';

// 보안 등급 → 공통 배지 클래스 매핑
const SECURITY_LEVELS = [
  { value: 'TEMP',         label: '임시',   badge: 'admin-badge admin-badge-neutral' },
  { value: 'PUBLIC',       label: '공개',   badge: 'admin-badge admin-badge-success' },
  { value: 'INTERNAL',     label: '내부용', badge: 'admin-badge admin-badge-info' },
  { value: 'CONFIDENTIAL', label: '기밀',   badge: 'admin-badge admin-badge-warn' },
  { value: 'TOP_SECRET',   label: '극비',   badge: 'admin-badge admin-badge-danger' },
];

const PromptListContent = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: '',
    isActive: true,
    category: '',
    purpose: '',
  });
  const [categories, setCategories] = useState([]);
  const [purposes, setPurposes] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [descAnchorEl, setDescAnchorEl] = useState(null);
  const [selectedDesc, setSelectedDesc] = useState('');
  const { showAlert, showConfirm } = useAlert();

  // 수정 모달 상태
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const { data, isLoading, refetch } = usePrompts(filters);
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

  const handleRowClick = (code) => {
    navigate(`/prompts/${code}`);
  };

  const handleEditClick = (e, prompt) => {
    e.stopPropagation();
    setEditingPrompt(prompt);
    setEditDialogOpen(true);
  };

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

  const handleDelete = async (e, prompt) => {
    e.stopPropagation();
    const ok = await showConfirm('정말로 이 프롬프트와 관련된 모든 버전 및 스냅샷을 삭제하시겠습니까?');
    if (!ok) return;
    try {
      await deletePrompt.mutateAsync(prompt.code);
      showAlert('삭제되었습니다.');
    } catch {
      showAlert('프롬프트 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const prompts = Array.isArray(data?.data?.content) ? data.data.content : [];

  // MUI Select/TextField용 공통 sx — admin-common.css 의 input 스타일과 시각적으로 정렬
  const selectSx = promptToolbarSelectSx;

  return (
    <div className="admin-page">
      <div className="km-main-sticky-head">
      <AdminPageHeader
        icon={FileText}
        title="프롬프트 관리"
        count={prompts.length}
        subtitle="시스템 프롬프트의 카테고리·용도·버전·보안 등급을 관리합니다."
        actions={
          <button className="admin-btn admin-btn-primary" onClick={() => setOpenDialog(true)}>
            <Plus size={14} />
            생성
          </button>
        }
      />

      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <div className="admin-search">
            <Search size={16} className="admin-search-icon" />
            <input
              type="text"
              className="admin-search-input"
              placeholder="코드 / 이름으로 검색..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <Select
            value={filters.category || ''}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            size="small"
            displayEmpty
            sx={selectSx}
          >
            <MenuItem value="">전체 카테고리</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
          <Select
            value={filters.purpose || ''}
            onChange={(e) => setFilters({ ...filters, purpose: e.target.value })}
            size="small"
            displayEmpty
            sx={selectSx}
          >
            <MenuItem value="">전체 용도</MenuItem>
            {purposes.map((p) => (
              <MenuItem key={p} value={p}>{p}</MenuItem>
            ))}
          </Select>
          <Select
            value={filters.isActive}
            onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
            size="small"
            sx={{ ...selectSx, minWidth: 100 }}
          >
            <MenuItem value={true}>활성</MenuItem>
            <MenuItem value={false}>비활성</MenuItem>
            <MenuItem value={undefined}>전체</MenuItem>
          </Select>
        </div>
      </div>
      </div>

      {isLoading ? (
        <div className="admin-loading-state">
          <div className="admin-spinner" />
          <span>데이터를 불러오는 중...</span>
        </div>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: '1px solid var(--admin-border)',
            borderRadius: 'var(--admin-radius-lg)',
            bgcolor: 'var(--admin-bg-panel)',
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{
                  '& .MuiTableCell-head': {
                    py: 1.25,
                    px: 2,
                    fontSize: 'var(--admin-font-sm)',
                    fontWeight: 600,
                    color: 'var(--admin-text-secondary)',
                    bgcolor: 'var(--admin-bg-subtle)',
                    borderBottom: '1px solid var(--admin-border)',
                    letterSpacing: '0.02em',
                  },
                }}
              >
                <TableCell align="center" width="4%">No</TableCell>
                <TableCell width="9%">카테고리</TableCell>
                <TableCell width="9%">용도</TableCell>
                <TableCell width="12%">코드</TableCell>
                <TableCell width="14%">이름</TableCell>
                <TableCell width="17%">설명</TableCell>
                <TableCell align="center" width="7%">등급</TableCell>
                <TableCell align="center" width="5%">버전</TableCell>
                <TableCell align="center" width="4%">수</TableCell>
                <TableCell width="10%">수정일</TableCell>
                <TableCell align="center" width="9%">관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prompts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ border: 'none', py: 6 }}>
                    <p className="admin-empty-state-title" style={{ margin: 0 }}>
                      데이터가 없습니다
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                prompts.map((prompt, index) => {
                  const level = SECURITY_LEVELS.find((l) => l.value === (prompt.securityLevel || 'PUBLIC')) || SECURITY_LEVELS[0];
                  return (
                    <TableRow
                      key={prompt.id}
                      hover
                      sx={{
                        cursor: 'pointer',
                        '& .MuiTableCell-root': {
                          py: 1.25,
                          px: 2,
                          fontSize: 'var(--admin-font-base)',
                          color: 'var(--admin-text-primary)',
                          borderBottom: '1px solid var(--admin-border)',
                        },
                        '&:last-child .MuiTableCell-root': { borderBottom: 'none' },
                        '&:hover': { bgcolor: 'var(--admin-bg-hover)' },
                      }}
                    >
                      <TableCell align="center" onClick={() => handleRowClick(prompt.code)}>
                        {index + 1}
                      </TableCell>
                      <TableCell onClick={() => handleRowClick(prompt.code)}>
                        {prompt.category ? (
                          <span className="admin-badge admin-badge-primary">{prompt.category}</span>
                        ) : (
                          <span style={{ color: 'var(--admin-text-muted)' }}>미분류</span>
                        )}
                      </TableCell>
                      <TableCell onClick={() => handleRowClick(prompt.code)}>
                        {prompt.purpose ? (
                          <span className="admin-badge admin-badge-info">{prompt.purpose}</span>
                        ) : (
                          <span style={{ color: 'var(--admin-text-muted)' }}>-</span>
                        )}
                      </TableCell>
                      <TableCell onClick={() => handleRowClick(prompt.code)}>
                        {prompt.code}
                      </TableCell>
                      <TableCell onClick={() => handleRowClick(prompt.code)} style={{ fontWeight: 500 }}>
                        {prompt.name}
                      </TableCell>
                      <TableCell
                        onClick={(e) => {
                          e.stopPropagation();
                          if (prompt.description) handleDescClick(e, prompt.description);
                        }}
                      >
                        <span
                          style={{
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 180,
                            cursor: prompt.description ? 'help' : 'inherit',
                            color: 'var(--admin-text-secondary)',
                          }}
                        >
                          {prompt.description || '-'}
                        </span>
                      </TableCell>
                      <TableCell align="center" onClick={() => handleRowClick(prompt.code)}>
                        <span className={level.badge}>{level.label}</span>
                      </TableCell>
                      <TableCell align="center" onClick={() => handleRowClick(prompt.code)}>
                        {prompt.activeVersion || '-'}
                      </TableCell>
                      <TableCell align="center" onClick={() => handleRowClick(prompt.code)}>
                        {prompt.versionCount || 0}
                      </TableCell>
                      <TableCell
                        onClick={() => handleRowClick(prompt.code)}
                        sx={{ color: 'var(--admin-text-secondary)', fontSize: 'var(--admin-font-sm) !important', whiteSpace: 'nowrap' }}
                      >
                        {new Date(prompt.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'inline-flex', gap: 0.5 }}>
                          <button
                            className="admin-btn admin-btn-icon"
                            onClick={(e) => handleEditClick(e, prompt)}
                            title="수정"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="admin-btn admin-btn-icon admin-btn-danger-soft"
                            onClick={(e) => handleDelete(e, prompt)}
                            title="삭제"
                          >
                            <Trash2 size={14} />
                          </button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

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
        <Box sx={{ p: 2, maxWidth: 400, bgcolor: 'var(--admin-bg-panel)' }}>
          <Typography variant="body2" sx={{ color: 'var(--admin-text-primary)' }}>
            {selectedDesc}
          </Typography>
        </Box>
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

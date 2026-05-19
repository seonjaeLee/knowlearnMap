import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const target = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/prompt/components/prompts/PromptList.jsx',
);

const content = `import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../../../context/AlertContext';
import { FileText, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Popover } from '@mui/material';
import { usePrompts, useDeletePrompt, useUpdatePrompt } from '../../hooks/usePrompts';
import { promptService } from '../../api/promptService';
import { PROMPT_SECURITY_LEVELS } from '../../constants/securityLevels';
import PromptFormDialog from './PromptFormDialog';
import EditPromptDialog from './EditPromptDialog';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import BasicTable from '../../../components/common/BasicTable';
import '../../../pages/admin/admin-common.css';
import './PromptList.css';

const PROMPT_TABLE_COLUMNS = [
  { id: 'no', label: 'No', width: 48, align: 'center', ellipsis: false },
  { id: 'category', label: '\uCE74\uD14C\uACE0\uB9AC', width: 100, align: 'left' },
  { id: 'purpose', label: '\uC6A9\uB3C4', width: 100, align: 'left' },
  { id: 'code', label: '\uCF54\uB4DC', width: 120, align: 'left' },
  { id: 'name', label: '\uC774\uB984', width: 140, align: 'left' },
  { id: 'description', label: '\uC124\uBA85', width: 180, align: 'left' },
  { id: 'securityLevel', label: '\uB4F1\uAE09', width: 72, align: 'center', ellipsis: false },
  { id: 'activeVersion', label: '\uBC84\uC804', width: 64, align: 'center', ellipsis: false },
  { id: 'versionCount', label: '\uC218', width: 48, align: 'center', ellipsis: false },
  { id: 'updatedAt', label: '\uC218\uC815\uC77C', width: 100, align: 'left' },
  { id: 'actions', label: '\uAD00\uB9AC', width: 92, align: 'center', ellipsis: false },
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
    navigate(\`/prompts/\${row.code}\`);
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
      showAlert('\uC218\uC815\uB418\uC5C8\uC2B5\uB2C8\uB2E4.');
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update prompt:', error);
      showAlert('\uD504\uB85C\uD504\uD2B8 \uC218\uC815\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = useCallback(async (e, prompt) => {
    e.stopPropagation();
    const ok = await showConfirm('\uC815\uB9D0\uB85C \uC774 \uD504\uB85C\uD504\uD2B8\uC640 \uAD00\uB828\uB41C \uBAA8\uB4E0 \uBC84\uC804 \uBC0F \uC2A4\uB0B5\uC0F7\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?');
    if (!ok) return;
    try {
      await deletePrompt.mutateAsync(prompt.code);
      showAlert('\uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4.');
    } catch {
      showAlert('\uD504\uB85C\uD504\uD2B8 \uC0AD\uC81C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.');
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
          <span className="prompt-list-muted">\uBBF8\uBD84\uB958</span>
        );
      case 'purpose':
        return prompt.purpose ? (
          <span className="admin-badge admin-badge-info">{prompt.purpose}</span>
        ) : (
          <span className="prompt-list-muted">-</span>
        );
      case 'code':
        return prompt.code;
      case 'name':
        return <span className="prompt-list-name-cell">{prompt.name}</span>;
      case 'description':
        if (!prompt.description) return '-';
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
      case 'activeVersion':
        return prompt.activeVersion || '-';
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
          <div className="kl-table-actions" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="kl-table-icon-btn kl-table-icon-btn--neutral"
              onClick={(e) => handleEditClick(e, prompt)}
              title="\uC218\uC815"
              aria-label={\`\${prompt.code} \uC218\uC815\`}
            >
              <Pencil strokeWidth={1.75} aria-hidden />
            </button>
            <button
              type="button"
              className="kl-table-icon-btn kl-table-icon-btn--danger"
              onClick={(e) => handleDelete(e, prompt)}
              title="\uC0AD\uC81C"
              aria-label={\`\${prompt.code} \uC0AD\uC81C\`}
            >
              <Trash2 strokeWidth={1.75} aria-hidden />
            </button>
          </motion.div>
        );
      default:
        return undefined;
    }
  }, [handleDelete, handleEditClick]);

  return (
    <motion.div className="kl-page prompt-list-page">
      <motion.div className="kl-main-sticky-head">
        <AdminPageHeader
          icon={FileText}
          title="\uD504\uB85C\uD504\uD2B8 \uAD00\uB9AC"
          count={prompts.length}
          subtitle="\uC2DC\uC2A4\uD15C \uD504\uB85C\uD504\uD2B8\uC758 \uCE74\uD14C\uACE0\uB9AC\u00B7\uC6A9\uB3C4\u00B7\uBC84\uC804\u00B7\uBCF4\uC548 \uB4F1\uAE09\uC744 \uAD00\uB9AC\uD569\uB2C8\uB2E4."
          actions={(
            <button type="button" className="kl-btn kl-btn--primary" onClick={() => setOpenDialog(true)}>
              <Plus size={14} aria-hidden />
              \uC0DD\uC131
            </button>
          )}
        />
      </motion.div>

      <motion.div className="table-area">
        <motion.div className="table-toolbar">
          <motion.div className="toolbar-left">
            <motion.div className="search-area">
              <Search size={16} className="search-area-icon" aria-hidden />
              <input
                type="text"
                className="search-area-input"
                placeholder="\uCF54\uB4DC / \uC774\uB984\uC73C\uB85C \uAC80\uC0C9..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                aria-label="\uD504\uB85C\uD504\uD2B8 \uAC80\uC0C9"
              />
            </motion.div>
            <select
              className="toolbar-select"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              aria-label="\uCE74\uD14C\uACE0\uB9AC \uD544\uD130"
            >
              <option value="">\uC804\uCCB4 \uCE74\uD14C\uACE0\uB9AC</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              className="toolbar-select"
              value={filters.purpose}
              onChange={(e) => setFilters({ ...filters, purpose: e.target.value })}
              aria-label="\uC6A9\uB3C4 \uD544\uD130"
            >
              <option value="">\uC804\uCCB4 \uC6A9\uB3C4</option>
              {purposes.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select
              className="toolbar-select"
              value={filters.activeFilter}
              onChange={(e) => setFilters({ ...filters, activeFilter: e.target.value })}
              aria-label="\uD65C\uC131 \uC0C1\uD0DC \uD544\uD130"
            >
              <option value="true">\uD65C\uC131</option>
              <option value="false">\uBE44\uD65C\uC131</option>
              <option value="all">\uC804\uCCB4</option>
            </select>
          </motion.div>
        </motion.div>

        {isLoading ? (
          <motion.div className="admin-loading-state">
            <motion.div className="admin-spinner" />
            <span>\uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uB294 \uC911...</span>
          </motion.div>
        ) : (
          <motion.div className="basic-table-shell">
            <BasicTable
              className="prompt-list-basic-table"
              columns={PROMPT_TABLE_COLUMNS}
              data={prompts}
              renderCell={renderPromptCell}
              onRowClick={handleRowClick}
              rowAriaLabel={(row) => \`\${row.name || row.code} \uC0C1\uC138\`}
              emptyState={{ variant: hasActiveFilters ? 'search' : 'default' }}
            />
          </motion.div>
        )}
      </motion.div>

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
        <motion.div className="prompt-list-desc-popover">{selectedDesc}</motion.div>
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
    </motion.div>
  );
};

export default PromptListContent;
`;

fs.writeFileSync(target, content.replace(/motion\.div/g, 'motion.div').replace(/<\/?motion\.div/g, (m) => m.replace('motion.', '')).replace(/motion\.div/g, 'motion.div'), 'utf8');
// fix: simple replace motion.div -> div
const fixed = fs.readFileSync(target, 'utf8').replace(/motion\.motion\.motion\./g, '').replace(/motion\.div/g, 'motion.div');
fs.writeFileSync(target, fixed.replace(/motion\.div/g, 'div'), 'utf8');
console.log('wrote', target);

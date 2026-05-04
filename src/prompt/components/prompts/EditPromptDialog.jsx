import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Select,
  MenuItem,
  IconButton,
  Divider,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const securityLevels = [
  { value: 'TEMP', label: '임시', color: '#9e9e9e' },
  { value: 'PUBLIC', label: '공개', color: '#4caf50' },
  { value: 'INTERNAL', label: '내부용', color: '#2196f3' },
  { value: 'CONFIDENTIAL', label: '기밀', color: '#ff9800' },
  { value: 'TOP_SECRET', label: '극비', color: '#f44336' }
];

const EditPromptDialog = ({ open, prompt, categories, purposes, onClose, onSave, isUpdating }) => {
  const [formData, setFormData] = useState({
    category: '',
    purpose: '',
    name: '',
    description: '',
    securityLevel: 'PUBLIC'
  });

  useEffect(() => {
    if (prompt) {
      setFormData({
        category: prompt.category || '',
        purpose: prompt.purpose || '',
        name: prompt.name || '',
        description: prompt.description || '',
        securityLevel: prompt.securityLevel || 'PUBLIC'
      });
    }
  }, [prompt]);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            프롬프트 정보 수정
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* 코드 (읽기 전용) */}
          <Box>
            <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 500 }}>
              코드
            </Typography>
            <TextField
              value={prompt?.code || ''}
              fullWidth
              size="small"
              disabled
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'action.hover' } }}
            />
          </Box>

          {/* 카테고리 & 용도 & 등급 */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 500 }}>
                카테고리
              </Typography>
              <Select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                fullWidth
                size="small"
                displayEmpty
              >
                <MenuItem value=""><em>선택</em></MenuItem>
                {(categories || []).map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 500 }}>
                용도
              </Typography>
              <Select
                value={formData.purpose}
                onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                fullWidth
                size="small"
                displayEmpty
              >
                <MenuItem value=""><em>선택</em></MenuItem>
                {(purposes || []).map((p) => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
              </Select>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 500 }}>
                보안 등급
              </Typography>
              <Select
                value={formData.securityLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, securityLevel: e.target.value }))}
                fullWidth
                size="small"
              >
                {securityLevels.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: level.color }} />
                      {level.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>

          {/* 이름 */}
          <Box>
            <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 500 }}>
              이름 <Typography component="span" color="error.main">*</Typography>
            </Typography>
            <TextField
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              placeholder="이름 입력"
              size="small"
            />
          </Box>

          {/* 설명 */}
          <Box>
            <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 500 }}>
              설명
            </Typography>
            <TextField
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={3}
              placeholder="설명 입력"
              size="small"
            />
          </Box>
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ color: 'text.secondary' }}>
          취소
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!formData.name || isUpdating}
        >
          {isUpdating ? '저장 중...' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPromptDialog;

# -*- coding: utf-8 -*-
"""Restore NoticeList.jsx from git and apply API + kl-btn patches (UTF-8 safe)."""
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "src" / "pages" / "NoticeList.jsx"

text = subprocess.check_output(
    ["git", "show", "0d21a38:src/pages/NoticeList.jsx"],
    cwd=ROOT,
).decode("utf-8")

old_imp = """import { useCallback, useMemo, useState } from 'react';
import { Pin, Plus, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDialog } from '../hooks/useDialog';
import NoticeCreateModal from '../components/NoticeCreateModal';
import NoticeDetailModal from '../components/NoticeDetailModal';
import PageHeader from '../components/common/PageHeader';
import BasicTable from '../components/common/BasicTable';
import SupportTableAdminActions from '../components/support/SupportTableAdminActions';
import { mockNotices } from '../data/supportMockData';
import { isSupportCenterAdmin } from '../utils/supportCenterAdmin';
import { SUPPORT_ADMIN_ACTIONS_COLUMN } from './supportCenterColumns';
import './admin/admin-common.css';
import './NoticeList.css';
import './SupportCenter.css';"""

new_imp = """import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pin, Plus, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDialog } from '../hooks/useDialog';
import NoticeCreateModal from '../components/NoticeCreateModal';
import NoticeDetailModal from '../components/NoticeDetailModal';
import PageHeader from '../components/common/PageHeader';
import BasicTable from '../components/common/BasicTable';
import SupportTableAdminActions from '../components/support/SupportTableAdminActions';
import { isSupportMockEnabled } from '../config/supportMock';
import { mockNotices } from '../data/supportMockData';
import { noticeApi } from '../services/api';
import { normalizeSupportListPayload } from '../utils/supportListResponse';
import { isSupportCenterAdmin } from '../utils/supportCenterAdmin';
import { SUPPORT_ADMIN_ACTIONS_COLUMN } from './supportCenterColumns';
import './NoticeList.css';
import './SupportCenter.css';"""

text = text.replace(old_imp, new_imp)
text = text.replace(
    "const { confirm } = useDialog();",
    "const { confirm, alert } = useDialog();",
)
text = text.replace(
    "const [notices, setNotices] = useState(mockNotices);",
    """const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);""",
)

fetch_block = """
  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      if (isSupportMockEnabled) {
        setNotices(sortNoticesForList(mockNotices.map((item) => ({ ...item }))));
        return;
      }
      const data = await noticeApi.getAll();
      setNotices(sortNoticesForList(normalizeSupportListPayload(data)));
    } catch (error) {
      console.error('\uacf5\uc9c0\uc0ac\ud56d \ubaa9\ub85d \uc870\ud68c \uc2e4\ud328:', error);
      setNotices([]);
      setLoadError(error.message || '\uacf5\uc9c0\uc0ac\ud56d\uc744 \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

"""

text = text.replace(
    "  const isAdmin = isSupportCenterAdmin(user);\n\n  const noticeColumns",
    "  const isAdmin = isSupportCenterAdmin(user);\n" + fetch_block + "  const noticeColumns",
)

save_new = """  const handleSaveNotice = async (noticeData) => {
    if (isSupportMockEnabled) {
      if (editingNotice) {
        setNotices((prev) => prev.map((item) => (
          item.id === editingNotice.id
            ? {
              ...item,
              ...noticeData,
              category: noticeData.category || item.category || '\uc77c\ubc18',
              updatedAt: new Date().toISOString(),
            }
            : item
        )));
      } else {
        const nextId = notices.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
        setNotices((prev) => sortNoticesForList([{
          id: nextId,
          ...noticeData,
          category: noticeData.category || '\uc77c\ubc18',
          authorEmail: user?.email || 'admin@knowlearn.co.kr',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          viewCount: 0,
          isPinned: false,
          isRead: false,
        }, ...prev]));
      }
      return;
    }
    try {
      if (editingNotice) {
        await noticeApi.update(editingNotice.id, {
          title: noticeData.title,
          content: noticeData.content,
          category: noticeData.category || editingNotice.category,
        });
      } else {
        await noticeApi.create({
          title: noticeData.title,
          content: noticeData.content,
          category: noticeData.category,
        });
      }
      await fetchNotices();
    } catch (error) {
      console.error('\uacf5\uc9c0\uc0ac\ud56d \uc800\uc7a5 \uc2e4\ud328:', error);
      await alert(error.message || '\uacf5\uc9c0\uc0ac\ud56d\uc744 \uc800\uc7a5\ud558\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.');
      throw error;
    }
  };

  const handleOpenCreateModal"""

text = re.sub(
    r"  const handleSaveNotice = async \(noticeData\) => \{.*?\n  \};\n\n  const handleOpenCreateModal",
    save_new,
    text,
    flags=re.DOTALL,
)

del_new = """  const handleDeleteNotice = useCallback(async (notice) => {
    const confirmed = await confirm(`"${notice.title}" \uacf5\uc9c0\ub97c \uc0ad\uc81c\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?`);
    if (!confirmed) return;
    if (isSupportMockEnabled) {
      setNotices((prev) => prev.filter((item) => item.id !== notice.id));
      if (selectedNoticeId === notice.id) setSelectedNoticeId(null);
      return;
    }
    try {
      await noticeApi.delete(notice.id);
      if (selectedNoticeId === notice.id) setSelectedNoticeId(null);
      await fetchNotices();
    } catch (error) {
      console.error('\uacf5\uc9c0\uc0ac\ud56d \uc0ad\uc81c \uc2e4\ud328:', error);
      await alert(error.message || '\uacf5\uc9c0\uc0ac\ud56d\uc744 \uc0ad\uc81c\ud558\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.');
    }
  }, [confirm, alert, selectedNoticeId, fetchNotices]);"""

text = re.sub(
    r"  const handleDeleteNotice = useCallback\(async \(notice\) => \{.*?\}, \[confirm, selectedNoticeId\]\);",
    del_new,
    text,
    flags=re.DOTALL,
)

click_new = """  const handleNoticeClick = useCallback(async (notice) => {
    setSelectedNoticeId(notice.id);
    if (isSupportMockEnabled) {
      setNotices((prev) => prev.map((item) => (
        item.id === notice.id ? { ...item, isRead: true, viewCount: (item.viewCount ?? 0) + 1 } : item
      )));
      return;
    }
    if (!notice.isRead) {
      try {
        await noticeApi.markAsRead(notice.id);
        setNotices((prev) => prev.map((item) => (item.id === notice.id ? { ...item, isRead: true } : item)));
      } catch (error) {
        console.error('\uc74d\uc74c \ucc98\ub9ac \uc2e4\ud328:', error);
      }
    }
  }, []);

  const handleDetailUpdate = useCallback(() => { fetchNotices(); }, [fetchNotices]);

  const handleMoveNotice"""

text = re.sub(
    r"  const handleNoticeClick = \(notice\) => \{.*?\n  \};\n\n  const handleMoveNotice",
    click_new,
    text,
    flags=re.DOTALL,
)

text = text.replace("admin-btn admin-btn-primary", "kl-btn kl-btn--primary")
text = text.replace("\uacf5\uc9c0\uc0ac\ud56d \ub4f1\ub85d", "\uacf5\uc9c0 \uc791\uc131")

table_old = """        <motion.div className=\"basic-table-shell\">
          {filteredNotices.length === 0 ? (
            <div className=\"support-empty\" role=\"status\">\uacf5\uc9c0\uc0ac\ud56d\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.</div>
          ) : ("""

table_old = table_old.replace("motion.div", "motion.div")  # noqa - keep div
table_old = """        <div className="basic-table-shell">
          {filteredNotices.length === 0 ? (
            <motion.div className="support-empty" role="status">\uacf5\uc9c0\uc0ac\ud56d\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.</motion.div>
          ) : ("""

table_old = """        <div className="basic-table-shell">
          {filteredNotices.length === 0 ? (
            <div className="support-empty" role="status">\uacf5\uc9c0\uc0ac\ud56d\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.</div>
          ) : ("""

table_new = """        <div className="basic-table-shell">
          {loading ? (
            <div className="support-empty" role="status">\uacf5\uc9c0\uc0ac\ud56d\uc744 \ubd88\ub7ec\uc624\ub294 \uc911\uc785\ub2c8\ub2e4.</div>
          ) : loadError ? (
            <div className="support-empty" role="alert">{loadError}</div>
          ) : filteredNotices.length === 0 ? (
            <div className="support-empty" role="status">\ub4f1\ub85d\ub41c \uacf5\uc9c0\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.</div>
          ) : ("""

text = text.replace(table_old, table_new)

text = text.replace("isOpen={Boolean(selectedNotice)}", "isOpen={Boolean(selectedNoticeId)}")
text = text.replace(
    "noticeData={selectedNotice}",
    "noticeData={isSupportMockEnabled ? selectedNotice : undefined}",
)
text = text.replace(
    "        onBackToList={() => setSelectedNoticeId(null)}",
    "        onUpdate={isSupportMockEnabled ? undefined : handleDetailUpdate}\n        onBackToList={() => setSelectedNoticeId(null)}",
)

TARGET.write_text(text, encoding="utf-8")
assert "\uacf5\uc9c0\uc0ac\ud56d" in text
print("OK:", TARGET)

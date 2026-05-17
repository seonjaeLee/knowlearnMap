import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Save, RotateCcw, Layers } from 'lucide-react';
import { useDialog } from '../../hooks/useDialog';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import './admin-common.css';

/**
 * 어드민 전역 시멘틱 옵션(카테고리/관계) 편집기.
 *
 * @param title      페이지 제목 (예: "전체 카테고리 관리")
 * @param subtitle   설명
 * @param loadFn     () => Promise<Array<{en, ko}>>
 * @param saveFn     (items) => Promise<...>
 * @param itemLabel  "카테고리" | "관계"
 */
export default function SemanticOptionsEditor({ title, subtitle, loadFn, saveFn, itemLabel = '항목' }) {
    const { alert, confirm } = useDialog();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    const reload = useCallback(async () => {
        setLoading(true);
        try {
            const res = await loadFn();
            const data = res?.data || res;
            setItems(Array.isArray(data) ? data : []);
            setDirty(false);
        } catch (err) {
            await alert('불러오기 실패: ' + (err?.message || '알 수 없는 오류'));
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [loadFn, alert]);

    useEffect(() => { reload(); }, [reload]);

    const handleAdd = () => {
        setItems((prev) => [...prev, { en: '', ko: '' }]);
        setDirty(true);
    };

    const handleChange = (idx, field, value) => {
        setItems((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], [field]: value };
            return next;
        });
        setDirty(true);
    };

    const handleDelete = (idx) => {
        setItems((prev) => prev.filter((_, i) => i !== idx));
        setDirty(true);
    };

    const handleSave = async () => {
        const cleaned = items
            .map((i) => ({ en: (i.en || '').trim(), ko: (i.ko || '').trim() }))
            .filter((i) => i.en || i.ko);
        setSaving(true);
        try {
            await saveFn(cleaned);
            setItems(cleaned);
            setDirty(false);
            await alert('저장되었습니다.');
        } catch (err) {
            await alert('저장 실패: ' + (err?.message || '알 수 없는 오류'));
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (dirty) {
            const ok = await confirm('변경사항을 버리고 다시 불러오시겠습니까?');
            if (!ok) return;
        }
        reload();
    };

    return (
        <div className="kl-page">
            <div className="kl-main-sticky-head">
                <AdminPageHeader
                icon={Layers}
                title={title}
                count={items.length}
                subtitle={subtitle}
                actions={
                    <>
                        <button className="kl-btn" onClick={handleReset} disabled={loading || saving}>
                            <RotateCcw size={14} /> 새로고침
                        </button>
                        <button
                            className="kl-btn kl-btn--primary"
                            onClick={handleSave}
                            disabled={saving || !dirty}
                        >
                            <Save size={14} /> {saving ? '저장 중...' : '저장'}
                        </button>
                    </>
                }
            />
            </div>

            {loading ? (
                <div className="admin-loading-state">
                    <div className="admin-spinner" />
                    <span>데이터를 불러오는 중...</span>
                </div>
            ) : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ width: 60 }}>#</th>
                                <th>English</th>
                                <th>한글</th>
                                <th className="admin-col-actions" style={{ width: 60 }}>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={4}>
                                        <div className="admin-empty-state" style={{ border: 'none', padding: '24px 0' }}>
                                            <p className="admin-empty-state-title">등록된 {itemLabel}가 없습니다</p>
                                            <p style={{ fontSize: 12, color: 'var(--admin-text-muted)', margin: 0 }}>
                                                아래 "+ 행 추가" 버튼을 눌러 시작하세요.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="admin-col-id">{idx + 1}</td>
                                        <td>
                                            <input
                                                className="admin-input"
                                                placeholder="English (e.g. SkinType)"
                                                value={item.en || ''}
                                                onChange={(e) => handleChange(idx, 'en', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                className="admin-input"
                                                placeholder="한글 (예: 피부타입)"
                                                value={item.ko || ''}
                                                onChange={(e) => handleChange(idx, 'ko', e.target.value)}
                                            />
                                        </td>
                                        <td className="admin-col-actions">
                                            <button
                                                className="kl-btn kl-btn--icon kl-btn--danger-soft"
                                                onClick={() => handleDelete(idx)}
                                                title="삭제"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <div style={{ marginTop: 12 }}>
                <button className="kl-btn" onClick={handleAdd} disabled={loading || saving}>
                    <Plus size={14} /> 행 추가
                </button>
                {dirty && (
                    <span style={{ marginLeft: 12, fontSize: 12, color: 'var(--admin-color-warn-on-soft)' }}>
                        저장되지 않은 변경사항이 있습니다
                    </span>
                )}
            </div>
        </div>
    );
}

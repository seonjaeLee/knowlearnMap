import React, { useState } from 'react';
import { Network, Box, Link2, Zap } from 'lucide-react';
import KlTabBar from '../../components/common/KlTabBar';
import AdminSemanticObjectPage from './AdminSemanticObjectPage';
import AdminSemanticRelationPage from './AdminSemanticRelationPage';
import AdminSemanticActionPage from './AdminSemanticActionPage';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import './admin-common.css';
import './AdminSemanticPage.css';

/**
 * 온톨로지 옵션 통합 페이지 (V20260424 통합 이후).
 * 각 탭은 type 별 카테고리(좌) + 항목(우) 2패널 구조.
 */
const SEMANTIC_TABS = [
  { id: 'objects', label: '객체 & 카테고리', icon: <Box size={14} aria-hidden /> },
  { id: 'relations', label: '관계 & 카테고리', icon: <Link2 size={14} aria-hidden /> },
  { id: 'actions', label: '액션 & 카테고리', icon: <Zap size={14} aria-hidden /> },
];

function AdminSemanticPage() {
  const [subTab, setSubTab] = useState('objects');

  return (
    <div className="kl-page kl-page--fill admin-semantic-page">
      <div className="kl-main-sticky-head">
        <AdminPageHeader
          icon={Network}
          title="온톨로지 옵션"
          subtitle="MAP 온톨로지 프롬프트가 참조하는 객체 / 관계 / 액션 및 각 카테고리 계층을 관리합니다."
        />
      </div>

      <KlTabBar
        variant="subtle"
        ariaLabel="온톨로지 옵션"
        tabs={SEMANTIC_TABS}
        value={subTab}
        onChange={setSubTab}
      />

      <div className="admin-semantic-page-body">
        {subTab === 'objects'   && <AdminSemanticObjectPage   compact />}
        {subTab === 'relations' && <AdminSemanticRelationPage compact />}
        {subTab === 'actions'   && <AdminSemanticActionPage   compact />}
      </div>
    </div>
  );
}

export default AdminSemanticPage;

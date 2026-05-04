import React, { useState } from 'react';
import { Network } from 'lucide-react';
import AdminSemanticObjectPage from './AdminSemanticObjectPage';
import AdminSemanticRelationPage from './AdminSemanticRelationPage';
import AdminSemanticActionPage from './AdminSemanticActionPage';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import './admin-common.css';

/**
 * 온톨로지 옵션 통합 페이지 (V20260424 통합 이후).
 * 각 탭은 type 별 카테고리(좌) + 항목(우) 2패널 구조.
 */
function AdminSemanticPage() {
  const [subTab, setSubTab] = useState('objects');

  return (
    <div className="admin-page">
      <AdminPageHeader
        icon={Network}
        title="온톨로지 옵션"
        subtitle="MAP 온톨로지 프롬프트가 참조하는 객체 / 관계 / 액션 및 각 카테고리 계층을 관리합니다."
      />

      <div className="admin-semantic-subtabs">
        <button
          className={`admin-semantic-subtab ${subTab === 'objects' ? 'active' : ''}`}
          onClick={() => setSubTab('objects')}
        >
          🎯 객체 & 카테고리
        </button>
        <button
          className={`admin-semantic-subtab ${subTab === 'relations' ? 'active' : ''}`}
          onClick={() => setSubTab('relations')}
        >
          🔗 관계 & 카테고리
        </button>
        <button
          className={`admin-semantic-subtab ${subTab === 'actions' ? 'active' : ''}`}
          onClick={() => setSubTab('actions')}
        >
          ⚡ 액션 & 카테고리
        </button>
      </div>

      {/* overflow:hidden → 각 패널(좌 카테고리 / 우 항목)이 독립적으로 내부 스크롤 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {subTab === 'objects'   && <AdminSemanticObjectPage   compact />}
        {subTab === 'relations' && <AdminSemanticRelationPage compact />}
        {subTab === 'actions'   && <AdminSemanticActionPage   compact />}
      </div>
    </div>
  );
}

export default AdminSemanticPage;

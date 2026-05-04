import AdminUpgradeRequests from './admin/AdminUpgradeRequests';
import AdminMemberManagement from './admin/AdminMemberManagement';
import AdminWorkspaceManagement from './admin/AdminWorkspaceManagement';
import AdminArangoManagement from './admin/AdminArangoManagement';
import AdminConfigManagement from './admin/AdminConfigManagement';
import AdminSemanticPage from './admin/AdminSemanticPage';
import AdminActionPage from './admin/AdminActionPage';
import { useState } from 'react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PromptList from '../prompt/components/prompts/PromptList';
import DomainManagement from '../components/DomainManagement';
import PromptDetail from '../prompt/components/prompts/PromptDetail';

function Admin() {
    const [activeTab, setActiveTab] = useState('prompts');
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (!isAdmin) {
        navigate('/');
        return null;
    }

    return (
        <div className="admin-container">
            <Routes>
                <Route path="/" element={
                    <div className="admin-content">
                        {/* Admin Tab Navigation */}
                        <nav className="admin-tab-navigation">
                            <button
                                className={`admin-tab ${activeTab === 'prompts' ? 'active' : ''}`}
                                onClick={() => setActiveTab('prompts')}
                            >
                                📝 프롬프트 관리
                            </button>
                            <button
                                className={`admin-tab ${activeTab === 'domains' ? 'active' : ''}`}
                                onClick={() => setActiveTab('domains')}
                            >
                                🌐 도메인 관리
                            </button>
                            <button
                                className={`admin-tab ${activeTab === 'workspaces' ? 'active' : ''}`}
                                onClick={() => setActiveTab('workspaces')}
                            >
                                📁 워크스페이스 관리
                            </button>
                            <button
                                className={`admin-tab ${activeTab === 'upgrades' ? 'active' : ''}`}
                                onClick={() => setActiveTab('upgrades')}
                            >
                                ⭐ 승인 관리
                            </button>
                            <button
                                className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
                                onClick={() => setActiveTab('users')}
                            >
                                👥 사용자 관리
                            </button>
                            <button
                                className={`admin-tab ${activeTab === 'arango' ? 'active' : ''}`}
                                onClick={() => setActiveTab('arango')}
                            >
                                🗄️ 아랑고 관리
                            </button>
                            <button
                                className={`admin-tab ${activeTab === 'config' ? 'active' : ''}`}
                                onClick={() => setActiveTab('config')}
                            >
                                ⚙️ 시스템 설정
                            </button>
                            <button
                                className={`admin-tab ${activeTab === 'semantic' ? 'active' : ''}`}
                                onClick={() => setActiveTab('semantic')}
                            >
                                🧩 온톨로지 옵션
                            </button>
                        </nav>

                        {/* Tab Content */}
                        <div className="admin-tab-content">
                            {activeTab === 'prompts' && <PromptList />}
                            {activeTab === 'domains' && <DomainManagement />}
                            {activeTab === 'workspaces' && <AdminWorkspaceManagement />}
                            {activeTab === 'upgrades' && <AdminUpgradeRequests />}
                            {activeTab === 'users' && <AdminMemberManagement />}
                            {activeTab === 'arango' && <AdminArangoManagement />}
                            {activeTab === 'config' && <AdminConfigManagement />}
                            {activeTab === 'semantic' && <AdminSemanticPage />}
                        </div>
                    </div>
                } />
                <Route path="/prompts" element={<PromptList />} />
                <Route path="/prompts/:code" element={<PromptDetail />} />
                <Route path="/upgrades" element={<AdminUpgradeRequests />} />
                <Route path="/users" element={<AdminMemberManagement />} />
                <Route path="/domains" element={<DomainManagement />} />
                <Route path="/workspaces" element={<AdminWorkspaceManagement />} />
                <Route path="/arango" element={<AdminArangoManagement />} />
                <Route path="/config" element={<AdminConfigManagement />} />
                <Route path="/semantic" element={<AdminSemanticPage />} />
                <Route path="/action" element={<AdminActionPage />} />
            </Routes>
        </div>
    );
}

export default Admin;

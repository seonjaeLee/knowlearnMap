import { useState, useEffect, useMemo } from 'react';
import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LogOut,
  Layers,
  LayoutGrid,
  HelpCircle,
  MessageSquareText,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Bell,
  SlidersHorizontal,
  Sparkles,
  ShieldCheck,
  Users,
  Database,
  Wrench,
  Workflow,
  Bot,
  FolderKanban,
} from 'lucide-react';
import UpgradeModal from '../UpgradeModal';
import NotificationBell from './NotificationBell';
import NoticePopupModal from '../NoticePopupModal';
import { noticeApi } from '../../services/api';
import './MainLayout.css';

function MainLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [noticePopupOpen, setNoticePopupOpen] = useState(false);
  const [hasCheckedNotices, setHasCheckedNotices] = useState(false);
  const [isLnbCollapsed, setIsLnbCollapsed] = useState(false);
  const [lnbOpenGroups, setLnbOpenGroups] = useState({
    workspace: true,
    admin: true,
    support: true,
  });

  useEffect(() => {
    if (user && !hasCheckedNotices) {
      setHasCheckedNotices(true);
      noticeApi.getUnreadCount()
        .then(count => {
          if (count > 0) {
            setNoticePopupOpen(true);
          }
        })
        .catch(() => {});
    }
  }, [user, hasCheckedNotices]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAllWorkspace = () => {
    const params = new URLSearchParams(location.search);
    return location.pathname === '/workspaces' && params.get('filter') === 'ALL';
  };

  const isMyWorkspace = () => {
    const params = new URLSearchParams(location.search);
    return (
      (location.pathname === '/workspaces' && (params.get('filter') === 'MY' || !params.get('filter')))
      || location.pathname.startsWith('/notebook/')
    );
  };

  const isAdminCenterActive = () => location.pathname === '/' || location.pathname.startsWith('/admin');
  const isCustomerCenterActive = () => ['/notices', '/faq', '/qna'].includes(location.pathname);

  const toggleLnbGroup = (groupKey) => {
    setLnbOpenGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const mainOutletContext = useMemo(
    () => ({ setLnbCollapsed: setIsLnbCollapsed }),
    [setIsLnbCollapsed],
  );

  return (
    <div className="main-layout">
      <header className="gnb-header">
        <div className="gnb-left">
          <Link to="/workspaces" className="site-logo">
            <img src="/knowlearn_logo_w.png" alt="KNOWLEARN MAP" style={{ height: '32px' }} />
          </Link>
        </div>
        <div className="gnb-right">
          <NotificationBell />

          {/* Service Info Button with Grade Badge */}
          <button
            className="service-info-btn"
            onClick={() => setUpgradeModalOpen(true)}
            title="서비스 정보 및 업그레이드"
          >
            <span className="service-label">이용 서비스</span>
            <span className={`grade-tag ${user?.grade?.toLowerCase() || 'free'}`}>
              {user?.grade || 'FREE'}
            </span>
          </button>

          <div className="user-info">
            {user?.email || user?.username || 'User'}
          </div>

          <button className="logout-btn" onClick={handleLogout} title="로그아웃">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="layout-body">
        <aside className={`lnb-sidebar ${isLnbCollapsed ? 'collapsed' : ''}`}>
          <nav className="lnb-nav" aria-label="주요 메뉴">
            <div className="lnb-group">
              {!isLnbCollapsed && (
                <button type="button" className="lnb-group-toggle" onClick={() => toggleLnbGroup('workspace')}>
                  <span className="lnb-group-title">워크스페이스</span>
                  <ChevronDown size={14} className={`lnb-group-chevron ${lnbOpenGroups.workspace ? 'is-open' : ''}`} />
                </button>
              )}
              <div className={`lnb-group-highlight ${isLnbCollapsed || lnbOpenGroups.workspace ? 'is-open' : ''}`}>
                  <NavLink
                    to="/workspaces?filter=ALL"
                    className={() => `lnb-item ${isAllWorkspace() ? 'active' : ''}`}
                    title="전체"
                  >
                    <LayoutGrid size={14} className="lnb-item-icon" />
                    {!isLnbCollapsed && <span>전체</span>}
                  </NavLink>
                  <NavLink
                    to="/workspaces?filter=MY"
                    className={() => `lnb-item ${isMyWorkspace() ? 'active' : ''}`}
                    title="내 워크스페이스"
                  >
                    <Layers size={14} className="lnb-item-icon" />
                    {!isLnbCollapsed && (
                      <span>
                        {isAdmin && localStorage.getItem('admin_selected_domain_name')
                          ? `${localStorage.getItem('admin_selected_domain_name')} 워크스페이스`
                          : '내 워크스페이스'}
                      </span>
                    )}
                  </NavLink>
              </div>
            </div>

            {isAdmin && (
              <div className="lnb-group">
                {!isLnbCollapsed && (
                  <button type="button" className="lnb-group-toggle" onClick={() => toggleLnbGroup('admin')}>
                    <span className="lnb-group-title">어드민센터</span>
                    <ChevronDown size={14} className={`lnb-group-chevron ${lnbOpenGroups.admin ? 'is-open' : ''}`} />
                  </button>
                )}
                <div className={`lnb-group-highlight ${isAdminCenterActive() ? 'active' : ''} ${isLnbCollapsed || lnbOpenGroups.admin ? 'is-open' : ''}`}>
                    <NavLink to="/" end className={({ isActive }) => `lnb-item ${isActive ? 'active' : ''}`} title="도메인 선택">
                      <ShieldCheck size={14} className="lnb-item-icon" />
                      {!isLnbCollapsed && <span>도메인 선택</span>}
                    </NavLink>
                    <NavLink to="/admin/domains" className={({ isActive }) => `lnb-item ${isActive ? 'active' : ''}`} title="도메인 관리">
                      <FolderKanban size={14} className="lnb-item-icon" />
                      {!isLnbCollapsed && <span>도메인 관리</span>}
                    </NavLink>
                    <NavLink to="/admin/workspaces" className={({ isActive }) => `lnb-item ${isActive ? 'active' : ''}`} title="워크스페이스 관리">
                      <Layers size={14} className="lnb-item-icon" />
                      {!isLnbCollapsed && <span>워크스페이스 관리</span>}
                    </NavLink>
                    <NavLink to="/admin/prompts" className={({ isActive }) => `lnb-item ${isActive ? 'active' : ''}`} title="프롬프트 관리">
                      <Sparkles size={14} className="lnb-item-icon" />
                      {!isLnbCollapsed && <span>프롬프트 관리</span>}
                    </NavLink>
                    <NavLink to="/admin/upgrades" className={({ isActive }) => `lnb-item ${isActive ? 'active' : ''}`} title="승인 관리">
                      <SlidersHorizontal size={14} className="lnb-item-icon" />
                      {!isLnbCollapsed && <span>승인 관리</span>}
                    </NavLink>
                    <NavLink to="/admin/users" className={({ isActive }) => `lnb-item ${isActive ? 'active' : ''}`} title="사용자 관리">
                      <Users size={14} className="lnb-item-icon" />
                      {!isLnbCollapsed && <span>사용자 관리</span>}
                    </NavLink>
                    <NavLink to="/admin/arango" className={({ isActive }) => `lnb-item ${isActive ? 'active' : ''}`} title="아랑고 관리">
                      <Database size={14} className="lnb-item-icon" />
                      {!isLnbCollapsed && <span>아랑고 관리</span>}
                    </NavLink>
                    <NavLink to="/admin/config" className={({ isActive }) => `lnb-item ${isActive ? 'active' : ''}`} title="시스템 설정">
                      <Wrench size={14} className="lnb-item-icon" />
                      {!isLnbCollapsed && <span>시스템 설정</span>}
                    </NavLink>
                    <NavLink to="/admin/semantic" className={({ isActive }) => `lnb-item ${isActive ? 'active' : ''}`} title="시멘틱">
                      <Workflow size={14} className="lnb-item-icon" />
                      {!isLnbCollapsed && <span>시멘틱</span>}
                    </NavLink>
                    <NavLink to="/admin/action" className={({ isActive }) => `lnb-item ${isActive ? 'active' : ''}`} title="Action">
                      <Bot size={14} className="lnb-item-icon" />
                      {!isLnbCollapsed && <span>Action</span>}
                    </NavLink>
                </div>
              </div>
            )}

            <div className="lnb-group">
              {!isLnbCollapsed && (
                <button type="button" className="lnb-group-toggle" onClick={() => toggleLnbGroup('support')}>
                  <span className="lnb-group-title">고객센터</span>
                  <ChevronDown size={14} className={`lnb-group-chevron ${lnbOpenGroups.support ? 'is-open' : ''}`} />
                </button>
              )}
              <div className={`lnb-group-highlight ${isCustomerCenterActive() ? 'active' : ''} ${isLnbCollapsed || lnbOpenGroups.support ? 'is-open' : ''}`}>
                  <NavLink to="/notices" className={({ isActive }) => `lnb-item ${isActive ? 'active' : ''}`} title="공지사항">
                    <Bell size={14} className="lnb-item-icon" />
                    {!isLnbCollapsed && <span>공지사항</span>}
                  </NavLink>
                  <NavLink to="/faq" className={({ isActive }) => `lnb-item ${isActive ? 'active' : ''}`} title="자주 묻는 질문">
                    <HelpCircle size={14} className="lnb-item-icon" />
                    {!isLnbCollapsed && <span>자주 묻는 질문</span>}
                  </NavLink>
                  <NavLink to="/qna" className={({ isActive }) => `lnb-item ${isActive ? 'active' : ''}`} title="1:1 문의">
                    <MessageSquareText size={14} className="lnb-item-icon" />
                    {!isLnbCollapsed && <span>1:1 문의</span>}
                  </NavLink>
              </div>
            </div>
          </nav>
          <button
            type="button"
            className={`lnb-collapse-toggle ${isLnbCollapsed ? 'is-collapsed' : ''}`}
            onClick={() => setIsLnbCollapsed((prev) => !prev)}
            title={isLnbCollapsed ? 'LNB 펼치기' : 'LNB 접기'}
            aria-label={isLnbCollapsed ? 'LNB 펼치기' : 'LNB 접기'}
          >
            <ChevronsLeft size={16} className="lnb-collapse-icon" />
          </button>
        </aside>

        <div className="content-panel">
          <main className="main-content">
            <Outlet context={mainOutletContext} />
          </main>
          <footer className="site-footer">
            <p>© 2025 KNOWLEARN MAP. All rights reserved.</p>
          </footer>
        </div>
      </div>

      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
      />

      <NoticePopupModal
        isOpen={noticePopupOpen}
        onClose={() => setNoticePopupOpen(false)}
      />
    </div>
  );
}

export default MainLayout;

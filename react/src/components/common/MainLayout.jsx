import { useState, useEffect, useMemo } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LogOut,
  Layers,
  LayoutGrid,
  HelpCircle,
  MessageSquareText,
  ChevronDown,
  ChevronsLeft,
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
  CircleUser,
} from 'lucide-react';
import UpgradeModal from '../UpgradeModal';
import NotificationBell from './NotificationBell';
import NoticePopupModal from '../NoticePopupModal';
import { noticeApi } from '../../services/api';
import KlTooltip from './KlTooltip';
import LnbBrandLogo from './LnbBrandLogo';
import './MainLayout.css';

/** LNB 접힘 시 아이콘만 보일 때 — 브라우저 title(~1s) 대신 즉시 표시 */
const LNB_TOOLTIP_ENTER_MS = 0;
const LNB_TOOLTIP_LEAVE_MS = 60;

function wrapLnbTooltip(collapsed, label, node) {
  if (!collapsed || !label) return node;
  return (
    <KlTooltip
      title={label}
      placement="right"
      enterDelay={LNB_TOOLTIP_ENTER_MS}
      leaveDelay={LNB_TOOLTIP_LEAVE_MS}
      triggerClassName="lnb-tooltip-trigger"
    >
      {node}
    </KlTooltip>
  );
}

function MainLayout() {
  const { user, isAdmin, isSysop, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [noticePopupOpen, setNoticePopupOpen] = useState(false);
  const [hasCheckedNotices, setHasCheckedNotices] = useState(false);
  const [isLnbCollapsed, setIsLnbCollapsed] = useState(false);
  const [lnbOpenGroups, setLnbOpenGroups] = useState({
    workspace: true,
    admin: true,
    sysop: true,
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
  const isSysopCenterActive = () => location.pathname.startsWith('/sysop');
  const isCustomerCenterActive = () => ['/notices', '/faq', '/qna'].includes(location.pathname);

  /** 노트북만 outlet 래퍼가 남은 세로 공간을 채움(:has 대신 경로로 지정해 어드민 등에서 flex:1 오적용 방지) */
  const isNotebookShellRoute = location.pathname.startsWith('/notebook/');
  /** 어드민·SYSOP 목록 — outlet이 남은 높이를 채워 표 shell 내부 스크롤 (assets/styles/kit/kl-basic-table.css) */
  const isAdminCenterOutletFill =
    location.pathname.startsWith('/admin') || location.pathname.startsWith('/sysop');

  const toggleLnbGroup = (groupKey) => {
    setLnbOpenGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const unbLoginLabel = user?.username || user?.email || 'User';

  const mainOutletContext = useMemo(
    () => ({ setLnbCollapsed: setIsLnbCollapsed }),
    [setIsLnbCollapsed],
  );

  return (
    <div className="main-layout">
      <aside className={`lnb-sidebar ${isLnbCollapsed ? 'collapsed' : ''}`}>
        {/* 로고 */}
        <div className="lnb-logo">
          <LnbBrandLogo collapsed={isLnbCollapsed} />
        </div>

        <nav className="lnb-nav" aria-label="주요 메뉴">
            <div className="lnb-group">
              {!isLnbCollapsed && (
                <button type="button" className="lnb-group-toggle" onClick={() => toggleLnbGroup('workspace')}>
                  <span className="lnb-group-title">워크스페이스</span>
                  <ChevronDown size={14} className={`lnb-group-chevron ${lnbOpenGroups.workspace ? 'is-open' : ''}`} />
                </button>
              )}
              <div className={`lnb-group-highlight ${isLnbCollapsed || lnbOpenGroups.workspace ? 'is-open' : ''}`}>
                  {wrapLnbTooltip(isLnbCollapsed, '전체', (
                    <NavLink
                      to="/workspaces?filter=ALL"
                      className={() => `lnb-item ${isAllWorkspace() ? 'active' : ''}`}
                      aria-label="전체"
                    >
                      <LayoutGrid size={14} className="lnb-item-icon" />
                      {!isLnbCollapsed && <span>전체</span>}
                    </NavLink>
                  ))}
                  {wrapLnbTooltip(isLnbCollapsed, '내 워크스페이스', (
                    <NavLink
                      to="/workspaces?filter=MY"
                      className={() => `lnb-item ${isMyWorkspace() ? 'active' : ''}`}
                      aria-label="내 워크스페이스"
                    >
                      <Layers size={14} className="lnb-item-icon" />
                      {!isLnbCollapsed && <span>내 워크스페이스</span>}
                    </NavLink>
                  ))}
              </div>
            </div>

            {isSysop && (
              <div className="lnb-group">
                {!isLnbCollapsed && (
                  <button type="button" className="lnb-group-toggle" onClick={() => toggleLnbGroup('sysop')}>
                    <span className="lnb-group-title">SYSOP센터</span>
                    <ChevronDown size={14} className={`lnb-group-chevron ${lnbOpenGroups.sysop ? 'is-open' : ''}`} />
                  </button>
                )}
                <div className={`lnb-group-highlight ${isSysopCenterActive() ? 'active' : ''} ${isLnbCollapsed || lnbOpenGroups.sysop ? 'is-open' : ''}`}>
                  {wrapLnbTooltip(isLnbCollapsed, '사용자 관리', (
                    <NavLink
                      to="/sysop/member"
                      className={({ isActive }) => `lnb-item ${isActive ? 'active' : ''}`}
                      aria-label="사용자 관리"
                    >
                      <Users size={14} className="lnb-item-icon" />
                      {!isLnbCollapsed && <span>사용자 관리</span>}
                    </NavLink>
                  ))}
                </div>
              </div>
            )}

            {isAdmin && (
              <div className="lnb-group">
                {!isLnbCollapsed && (
                  <button type="button" className="lnb-group-toggle" onClick={() => toggleLnbGroup('admin')}>
                    <span className="lnb-group-title">어드민센터</span>
                    <ChevronDown size={14} className={`lnb-group-chevron ${lnbOpenGroups.admin ? 'is-open' : ''}`} />
                  </button>
                )}
                <div className={`lnb-group-highlight ${isAdminCenterActive() ? 'active' : ''} ${isLnbCollapsed || lnbOpenGroups.admin ? 'is-open' : ''}`}>
                    {wrapLnbTooltip(isLnbCollapsed, '도메인 선택', (
                      <NavLink to="/" end className={({ isActive }) => `lnb-item ${isActive ? 'active' : ''}`} aria-label="도메인 선택">
                        <ShieldCheck size={14} className="lnb-item-icon" />
                        {!isLnbCollapsed && <span>도메인 선택</span>}
                      </NavLink>
                    ))}
                    {wrapLnbTooltip(isLnbCollapsed, '도메인 관리', (
                      <NavLink to="/admin/domains" className={({ isActive }) => `lnb-item ${isActive ? 'active' : ''}`} aria-label="도메인 관리">
                        <FolderKanban size={14} className="lnb-item-icon" />
                        {!isLnbCollapsed && <span>도메인 관리</span>}
                      </NavLink>
                    ))}
                    {wrapLnbTooltip(isLnbCollapsed, '워크스페이스 관리', (
                      <NavLink to="/admin/workspaces" className={({ isActive }) => `lnb-item ${isActive ? 'active' : ''}`} aria-label="워크스페이스 관리">
                        <Layers size={14} className="lnb-item-icon" />
                        {!isLnbCollapsed && <span>워크스페이스 관리</span>}
                      </NavLink>
                    ))}
                    {wrapLnbTooltip(isLnbCollapsed, '프롬프트 관리', (
                      <NavLink to="/admin/prompts" className={({ isActive }) => `lnb-item ${isActive ? 'active' : ''}`} aria-label="프롬프트 관리">
                        <Sparkles size={14} className="lnb-item-icon" />
                        {!isLnbCollapsed && <span>프롬프트 관리</span>}
                      </NavLink>
                    ))}
                    {wrapLnbTooltip(isLnbCollapsed, '승인 관리', (
                      <NavLink to="/admin/upgrades" className={({ isActive }) => `lnb-item ${isActive ? 'active' : ''}`} aria-label="승인 관리">
                        <SlidersHorizontal size={14} className="lnb-item-icon" />
                        {!isLnbCollapsed && <span>승인 관리</span>}
                      </NavLink>
                    ))}
                    {wrapLnbTooltip(isLnbCollapsed, '사용자 관리', (
                      <NavLink to="/admin/users" className={({ isActive }) => `lnb-item ${isActive ? 'active' : ''}`} aria-label="사용자 관리">
                        <Users size={14} className="lnb-item-icon" />
                        {!isLnbCollapsed && <span>사용자 관리</span>}
                      </NavLink>
                    ))}
                    {wrapLnbTooltip(isLnbCollapsed, '아랑고 관리', (
                      <NavLink to="/admin/arango" className={({ isActive }) => `lnb-item ${isActive ? 'active' : ''}`} aria-label="아랑고 관리">
                        <Database size={14} className="lnb-item-icon" />
                        {!isLnbCollapsed && <span>아랑고 관리</span>}
                      </NavLink>
                    ))}
                    {wrapLnbTooltip(isLnbCollapsed, '시스템 설정', (
                      <NavLink to="/admin/config" className={({ isActive }) => `lnb-item ${isActive ? 'active' : ''}`} aria-label="시스템 설정">
                        <Wrench size={14} className="lnb-item-icon" />
                        {!isLnbCollapsed && <span>시스템 설정</span>}
                      </NavLink>
                    ))}
                    {wrapLnbTooltip(isLnbCollapsed, '시멘틱', (
                      <NavLink to="/admin/semantic" className={({ isActive }) => `lnb-item ${isActive ? 'active' : ''}`} aria-label="시멘틱">
                        <Workflow size={14} className="lnb-item-icon" />
                        {!isLnbCollapsed && <span>시멘틱</span>}
                      </NavLink>
                    ))}
                    {wrapLnbTooltip(isLnbCollapsed, 'Action', (
                      <NavLink to="/admin/action" className={({ isActive }) => `lnb-item ${isActive ? 'active' : ''}`} aria-label="Action">
                        <Bot size={14} className="lnb-item-icon" /> 
                        {!isLnbCollapsed && <span>Action</span>}
                      </NavLink>
                    ))}
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
                  {wrapLnbTooltip(isLnbCollapsed, '공지사항', (
                    <NavLink to="/notices" className={({ isActive }) => `lnb-item ${isActive ? 'active' : ''}`} aria-label="공지사항">
                      <Bell size={14} className="lnb-item-icon" />
                      {!isLnbCollapsed && <span>공지사항</span>}
                    </NavLink>
                  ))}
                  {wrapLnbTooltip(isLnbCollapsed, '자주 묻는 질문', (
                    <NavLink to="/faq" className={({ isActive }) => `lnb-item ${isActive ? 'active' : ''}`} aria-label="자주 묻는 질문">
                      <HelpCircle size={14} className="lnb-item-icon" />
                      {!isLnbCollapsed && <span>자주 묻는 질문</span>}
                    </NavLink>
                  ))}
                  {wrapLnbTooltip(isLnbCollapsed, '1:1 문의', (
                    <NavLink to="/qna" className={({ isActive }) => `lnb-item ${isActive ? 'active' : ''}`} aria-label="1:1 문의">
                      <MessageSquareText size={14} className="lnb-item-icon" />
                      {!isLnbCollapsed && <span>1:1 문의</span>}
                    </NavLink>
                  ))}
              </div>
            </div>
          </nav>

        {/* LNB 하단 — 알림·서비스·사용자·로그아웃 (수직) */}
        <div className="lnb-footer">

          {/* 공지 알림 — showLabel=true 시 버튼이 전체 행 차지 */}
          <div className="lnb-footer-bell-row">
            <NotificationBell
              tooltipPlacement={isLnbCollapsed ? 'right' : 'bottom'}
              showLabel={!isLnbCollapsed}
            />
          </div>

          {/* 이용 서비스 — grade는 서비스 등급 (ADMIN/FREE/PRO), 계정명과 무관 */}
          {wrapLnbTooltip(isLnbCollapsed, `이용 서비스 · ${user?.grade || 'FREE'}`, (
            <button
              type="button"
              className="lnb-item lnb-footer-service"
              onClick={() => setUpgradeModalOpen(true)}
              aria-label={`서비스 정보 및 업그레이드 (${user?.grade || 'FREE'})`}
            >
              <Sparkles size={14} className="lnb-item-icon" />
              {!isLnbCollapsed && (
                <>
                  <span>이용 서비스</span>
                  <span className={`grade-tag lnb-grade-tag ${user?.grade?.toLowerCase() || 'free'}`}>
                    {user?.grade || 'FREE'}
                  </span>
                </>
              )}
            </button>
          ))}

          {/* 로그인 사용자 — 접속 계정명 표시 전용 */}
          {wrapLnbTooltip(isLnbCollapsed, unbLoginLabel, (
            <div
              className="lnb-item lnb-footer-user"
              aria-label={`로그인: ${unbLoginLabel}`}
            >
              <CircleUser size={14} className="lnb-item-icon" />
              {!isLnbCollapsed && (
                <span className="lnb-footer-username">{unbLoginLabel}</span>
              )}
            </div>
          ))}

          {/* 로그아웃 */}
          {wrapLnbTooltip(isLnbCollapsed, '로그아웃', (
            <button
              type="button"
              className="lnb-item lnb-footer-logout"
              onClick={handleLogout}
              aria-label="로그아웃"
            >
              <LogOut size={14} className="lnb-item-icon" />
              {!isLnbCollapsed && <span>로그아웃</span>}
            </button>
          ))}

        </div>

        <KlTooltip
          title={isLnbCollapsed ? '메뉴 펼치기' : '메뉴 접기'}
          placement="right"
          enterDelay={LNB_TOOLTIP_ENTER_MS}
          leaveDelay={LNB_TOOLTIP_LEAVE_MS}
          triggerClassName="lnb-tooltip-trigger lnb-tooltip-trigger--collapse"
        >
          <button
            type="button"
            className={`lnb-collapse-toggle ${isLnbCollapsed ? 'is-collapsed' : ''}`}
            onClick={() => setIsLnbCollapsed((prev) => !prev)}
            aria-label={isLnbCollapsed ? '메뉴 펼치기' : '메뉴 접기'}
          >
            <ChevronsLeft size={16} className="lnb-collapse-icon" />
          </button>
        </KlTooltip>
      </aside>

      <div className="content-panel">
        <main
          className={
            isNotebookShellRoute
              ? 'main-content main-content--notebook'
              : 'main-content'
          }
        >
          <div className="main-content-scroll-inner">
            <div
              className={[
                'main-content-outlet-wrap',
                isNotebookShellRoute && 'main-content-outlet-wrap--notebook',
                isAdminCenterOutletFill && 'main-content-outlet-wrap--admin-center',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <Outlet context={mainOutletContext} />
            </div>
            <footer className="site-footer">
              <p>© 2025 KNOWLEARN MAP. All rights reserved.</p>
            </footer>
          </div>
        </main>
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

import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home, Phone, Users, Settings, ChevronLeft, ChevronRight,
  Bell, HelpCircle, MessageSquare, Folder, Database, Cpu, Shield, FileText
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const { isAdmin, isSysop } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroup, setOpenGroup] = useState({ support: true, admin: true });

  const isNotebookDetail = location.pathname.startsWith('/notebook/');

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button
        className="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? '펼치기' : '접기'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <nav className="sidebar-nav">
        {/* NotebookDetail 일 때만 홈 버튼 노출 */}
        {isNotebookDetail && (
          <NavLink to="/workspaces?filter=MY" className="lnb-item">
            <Home size={18} />
            <span className="lnb-label">홈</span>
          </NavLink>
        )}

        {/* 고객센터 (그룹) */}
        <div className="lnb-group">
          <button
            className="lnb-group-header"
            onClick={() => setOpenGroup(p => ({ ...p, support: !p.support }))}
          >
            <Phone size={18} />
            <span className="lnb-label">고객센터</span>
          </button>
          {openGroup.support && !collapsed && (
            <div className="lnb-submenu">
              <NavLink to="/notices" className="lnb-subitem">
                <Bell size={14} /><span>공지사항</span>
              </NavLink>
              <NavLink to="/faq" className="lnb-subitem">
                <HelpCircle size={14} /><span>자주 묻는 질문</span>
              </NavLink>
              <NavLink to="/qna" className="lnb-subitem">
                <MessageSquare size={14} /><span>1:1 문의</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* 조직 멤버 (SYSOP 만) */}
        {isSysop && (
          <NavLink to="/org-members" className="lnb-item">
            <Users size={18} />
            <span className="lnb-label">조직 멤버</span>
          </NavLink>
        )}

        {/* 어드민 센터 (ADMIN 만) */}
        {isAdmin && (
          <div className="lnb-group">
            <button
              className="lnb-group-header"
              onClick={() => setOpenGroup(p => ({ ...p, admin: !p.admin }))}
            >
              <Settings size={18} />
              <span className="lnb-label">어드민 센터</span>
            </button>
            {openGroup.admin && !collapsed && (
              <div className="lnb-submenu">
                <NavLink to="/" end className="lnb-subitem">
                  <Folder size={14} /><span>도메인 선택</span>
                </NavLink>
                <NavLink to="/admin/domains" className="lnb-subitem">
                  <Folder size={14} /><span>도메인 관리</span>
                </NavLink>
                <NavLink to="/admin/workspaces" className="lnb-subitem">
                  <Folder size={14} /><span>워크스페이스 관리</span>
                </NavLink>
                <NavLink to="/admin/prompts" className="lnb-subitem">
                  <FileText size={14} /><span>프롬프트 관리</span>
                </NavLink>
                <NavLink to="/admin/upgrades" className="lnb-subitem">
                  <Shield size={14} /><span>승인 관리</span>
                </NavLink>
                <NavLink to="/admin/users" className="lnb-subitem">
                  <Users size={14} /><span>사용자 관리</span>
                </NavLink>
                <NavLink to="/admin/arango" className="lnb-subitem">
                  <Database size={14} /><span>아랑고 관리</span>
                </NavLink>
                <NavLink to="/admin/config" className="lnb-subitem">
                  <Cpu size={14} /><span>시스템 설정</span>
                </NavLink>
                <NavLink to="/admin/semantic" className="lnb-subitem">
                  <FileText size={14} /><span>시멘틱</span>
                </NavLink>
                <NavLink to="/admin/action" className="lnb-subitem">
                  <FileText size={14} /><span>Action</span>
                </NavLink>
              </div>
            )}
          </div>
        )}
      </nav>
    </aside>
  );
}

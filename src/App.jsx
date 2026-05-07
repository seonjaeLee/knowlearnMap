import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './components/common/MainLayout';
import { AlertProvider, useAlert } from './context/AlertContext';
import CustomAlert from './components/common/CustomAlert';
import { useAuth } from './context/AuthContext';

// 페이지 lazy loading — 초기 번들 크기 감소
const Home = lazy(() => import('./pages/Home'));
const NotebookDetail = lazy(() => import('./components/NotebookDetail'));
const Admin = lazy(() => import('./pages/Admin'));
const DomainSelection = lazy(() => import('./pages/DomainSelection'));
const PromptList = lazy(() => import('./prompt/components/prompts/PromptList'));
const PromptDetail = lazy(() => import('./prompt/components/prompts/PromptDetail'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const EmailVerification = lazy(() => import('./pages/EmailVerification'));
const SetPassword = lazy(() => import('./pages/SetPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Faq = lazy(() => import('./pages/Faq'));
const QnaBoard = lazy(() => import('./pages/QnaBoard'));
const NoticeList = lazy(() => import('./pages/NoticeList'));
const UserGuide = lazy(() => import('./pages/UserGuide'));

function PageFallback() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100%', color: '#94a3b8', fontSize: 13, gap: 8,
    }}>
      <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
      로딩 중...
    </div>
  );
}

function SessionExpiredHandler() {
  const { sessionExpired, clearSessionExpired } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionExpired) {
      showAlert('세션이 만료되어 로그아웃되었습니다.', {
        title: '세션 만료',
        onConfirm: () => {
          clearSessionExpired();
          navigate('/login', { replace: true });
        },
      });
    }
  }, [sessionExpired]);

  return null;
}

function App() {
  return (
    <AlertProvider>
      <div className="app">
        <SessionExpiredHandler />
        <CustomAlert />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/set-password" element={<SetPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route element={<PrivateRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<DomainSelection />} />
                <Route path="/workspaces" element={<Home />} />
                <Route path="/notebook/:id" element={<NotebookDetail />} />
                <Route path="/admin/*" element={<Admin />} />
                <Route path="/prompts" element={<PromptList />} />
                <Route path="/prompts/:code" element={<PromptDetail />} />
                <Route path="/notices" element={<NoticeList />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="/qna" element={<QnaBoard />} />
                <Route path="/user-guide" element={<UserGuide />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </div>
    </AlertProvider>
  );
}

export default App;

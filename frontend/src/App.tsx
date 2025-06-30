import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MyPage from './pages/MyPage';
import UpdateProfilePage from './pages/UpdateProfilePage';
import DeleteAccountPage from './pages/DeleteAccountPage';
import ChatPage from './pages/ChatPage';
import ChatLayoutPage from './pages/ChatLayoutPage';
// import AdminPage from './pages/AdminPage'; // TODO: 추후 관리자 페이지 생성 시 임포트

import authService from './services/authService';
import type { User } from './types';

interface PrivateRouteProps {
  children: React.ReactNode;
}

// 관리자 전용 라우트를 보호하는 컴포넌트
interface AdminRouteProps {
  children: React.ReactNode;
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());
  const navigate = useNavigate();

  const handleLogout = (): void => {
    authService.logout();
    setCurrentUser(null);
    navigate('/login');
  };

  const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const location = useLocation();
    return currentUser ? <>{children}</> : <Navigate to="/login" state={{ from: location }} replace />;
  };

  const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const isAdmin = currentUser && currentUser.role === 'ROLE_ADMIN';
    return isAdmin ? <>{children}</> : <Navigate to="/" />;
  };

  return (
    <>
      {/* 관리자 모드가 적용되었는지 테스트 코드 */}
      <nav
        style={{
          padding: '10px',
          backgroundColor: '#eee',
          marginBottom: '20px',
          display: 'flex',
          gap: '15px',
          alignItems: 'center',
        }}
      >
        <Link to="/">홈</Link>
        <Link to="/chat">채팅</Link>
        {currentUser ? (
          <>
            <Link to="/mypage">마이페이지</Link>
            {currentUser.role === 'ROLE_ADMIN' && <Link to="/admin">관리자</Link>}
            <a href="#logout" onClick={handleLogout} style={{ cursor: 'pointer' }}>
              로그아웃
            </a>
            <span style={{ marginLeft: 'auto' }}>
              환영합니다, {currentUser.nickname}님! ({currentUser.role})
            </span>
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginLeft: 'auto' }}>
              로그인
            </Link>
            <Link to="/signup">회원가입</Link>
          </>
        )}
      </nav>

      {/* 라우터 설정 */}
      <Routes>
        <Route path="/" element={<HomePage user={currentUser} onLogout={handleLogout} />} />

        <Route path="/login" element={<LoginPage setCurrentUser={setCurrentUser} />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* 보호된 라우트들 */}
        <Route
          path="/mypage"
          element={
            <PrivateRoute>
              <MyPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/update-profile"
          element={
            <PrivateRoute>
              <UpdateProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/delete-account"
          element={
            <PrivateRoute>
              <DeleteAccountPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <ChatLayoutPage />
            </PrivateRoute>
          }
        >
          <Route index element={<ChatPage />} />
          <Route path=":sessionId" element={<ChatPage />} />
        </Route>

        {/* --- [추가] 관리자 전용 라우트 --- */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <div>
                <h1>관리자 페이지</h1>
                <p>이 페이지는 관리자만 볼 수 있습니다.</p>
              </div>
            </AdminRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

export default App;

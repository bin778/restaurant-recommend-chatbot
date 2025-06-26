import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import HomePage from './pages/HomePage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import SignupPage from './pages/SignupPage.tsx';
import MyPage from './pages/MyPage.tsx';
import UpdateProfilePage from './pages/UpdateProfilePage.tsx';
import DeleteAccountPage from './pages/DeleteAccountPage.tsx';
import ChatPage from './pages/ChatPage.tsx';
import ChatLayoutPage from './pages/ChatLayoutPage';

import authService from './services/authService.ts';
import type { User } from './types'; // 공용 User 타입 임포트

// PrivateRoute 컴포넌트가 받을 props의 타입을 정의
interface PrivateRouteProps {
  children: React.ReactNode;
}

const App: React.FC = () => {
  // localStorage에서 사용자 정보를 가져와 초기 상태로 설정
  // currentUser 상태는 User 타입 또는 null일 수 있음을 명시
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());
  const navigate = useNavigate();

  // 로그아웃 처리 함수
  const handleLogout = (): void => {
    authService.logout();
    setCurrentUser(null);
    navigate('/login'); // 로그아웃 후 로그인 페이지로 강제 이동
  };

  // PrivateRoute: 로그인이 필요한 페이지를 보호하는 컴포넌트
  const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const location = useLocation();
    // currentUser가 없으면 로그인 페이지로 리다이렉트
    return currentUser ? <>{children}</> : <Navigate to="/login" state={{ from: location }} replace />;
  };

  return (
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

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;

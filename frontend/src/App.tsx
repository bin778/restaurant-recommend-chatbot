import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MyPage from './pages/MyPage';
import UpdateProfilePage from './pages/UpdateProfilePage';
import DeleteAccountPage from './pages/DeleteAccountPage';
import ChatPage from './pages/ChatPage';
import ChatLayoutPage from './pages/ChatLayoutPage';
import AdminIndexPage from './pages/admin/AdminIndexPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import KeywordManagementPage from './pages/admin/KeywordManagementPage';

import authService from './services/authService';
import type { User } from './types';

interface PrivateRouteProps {
  children: React.ReactNode;
}

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
    <Routes>
      <Route path="/" element={<HomePage user={currentUser} onLogout={handleLogout} />} />
      <Route path="/login" element={<LoginPage setCurrentUser={setCurrentUser} />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* 일반 회원 라우트 */}
      <Route
        path="/mypage"
        element={
          <PrivateRoute>
            <MyPage onLogout={handleLogout} />
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

      {/* 관리자 회원 라우트 */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminIndexPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <UserManagementPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/keywords"
        element={
          <AdminRoute>
            <KeywordManagementPage />
          </AdminRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;

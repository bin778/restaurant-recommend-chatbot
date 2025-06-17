import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import authService from './services/authService';
// TODO: ChatPage, MyPage 구현
// import ChatPage from './pages/ChatPage';
// import MyPage from './pages/MyPage';

// TODO: 로그인 안됨 수정해야 함: AxioxError 발생 -> POST 접근 차단 문제
function App() {
  // localStorage에서 사용자 정보를 가져와 초기 상태로 설정
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const navigate = useNavigate();

  // 로그아웃 처리 함수
  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    navigate('/login'); // 로그아웃 후 로그인 페이지로 강제 이동
  };

  // PrivateRoute: 로그인이 필요한 페이지를 보호하는 컴포넌트
  const PrivateRoute = ({ children }) => {
    const location = useLocation();
    // currentUser가 없으면 로그인 페이지로 리다이렉트
    return currentUser ? children : <Navigate to="/login" state={{ from: location }} replace />;
  };

  return (
    <Routes>
      {/* 각 페이지 컴포넌트에 필요한 상태와 함수를 props로 전달
              - HomePage: user, onLogout
              - LoginPage: setCurrentUser
            */}
      <Route path="/" element={<HomePage user={currentUser} onLogout={handleLogout} />} />
      <Route path="/login" element={<LoginPage setCurrentUser={setCurrentUser} />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* TODO: 챗봇, 마이페이지 라우트 추가 예정 */}
      {/* <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
            <Route path="/mypage" element={<PrivateRoute><MyPage /></PrivateRoute>} /> 
            */}

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;

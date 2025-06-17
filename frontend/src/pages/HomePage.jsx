import React from 'react';
import { Link } from 'react-router-dom';

// App.jsx로부터 user 정보와 onLogout 함수를 props로 전달받음
const HomePage = ({ user, onLogout }) => {
  return (
    <div className="card">
      <h1>맛집 추천 챗봇 🤖</h1>
      <p className="subtitle">대화형으로 원하는 맛집을 찾아보세요!</p>

      {user ? (
        // 로그인 상태일 때
        <div className="authenticated-view">
          <p className="welcome-msg">
            <b>{user.nickname}</b>님, 안녕하세요!
          </p>
          <div className="menu-links">
            <Link to="/chat" className="btn btn-primary">
              챗봇 시작하기
            </Link>
            <Link to="/mypage" className="btn btn-secondary">
              내 정보
            </Link>
            {/* 로그아웃 버튼 클릭 시 onLogout 함수 실행 */}
            <button onClick={onLogout} className="btn btn-logout">
              로그아웃
            </button>
          </div>
        </div>
      ) : (
        // 비로그인 상태일 때
        <div className="anonymous-view">
          <Link to="/login" className="btn btn-primary">
            로그인
          </Link>
          <Link to="/signup" className="btn btn-secondary">
            회원가입
          </Link>
        </div>
      )}
    </div>
  );
};

export default HomePage;

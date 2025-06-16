import React from 'react';

const HomePage = ({ user }) => {
  return (
    <div className="container">
      <div className="card">
        <h1>맛집 추천 챗봇 🤖</h1>
        <p className="subtitle">대화형으로 원하는 맛집을 찾아보세요!</p>

        {user ? (
          // 로그인 상태일 때 보일 UI
          <div className="authenticated-view">
            <p className="welcome-msg">
              <b>{user.nickname}</b>님, 안녕하세요!
            </p>
            <div className="menu-links">
              <a href="/chat" className="btn">
                챗봇 시작하기
              </a>
              <a href="/mypage" className="btn btn-secondary">
                내 정보
              </a>
              {/* 로그아웃은 form이 필요하지만 우선 버튼만 만듭니다 */}
              <button className="btn btn-logout">로그아웃</button>
            </div>
          </div>
        ) : (
          // 비로그인 상태일 때 보일 UI
          <div className="anonymous-view">
            <a href="/login" className="btn btn-primary">
              로그인
            </a>
            <a href="/signup" className="btn btn-primary">
              회원가입
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;

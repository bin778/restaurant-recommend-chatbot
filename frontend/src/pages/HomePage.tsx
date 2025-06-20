import React from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../types'; // 공용 User 타입 임포트

// HomePage 컴포넌트가 받을 props의 타입을 정의
interface HomePageProps {
  user: User | null; // user는 User 타입이거나 null일 수 있음
  onLogout: () => void; // onLogout은 파라미터와 반환값이 없는 함수
}

const HomePage: React.FC<HomePageProps> = ({ user, onLogout }) => {
  return (
    <div className="card">
      <h1>맛집 추천 챗봇 🤖</h1>
      <p className="subtitle">대화형으로 원하는 맛집을 찾아보세요!</p>

      {/* TODO: 내 정보(관리자) -> 회원 목록, 수정, 탈퇴(사용자까지), 금지어 등록 등 */}
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

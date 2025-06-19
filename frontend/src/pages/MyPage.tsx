import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import userService from '../services/userService';

// 사용자 정보 표시를 위한 타입 정의
interface UserInfo {
  email: string;
  nickname: string;
}

const MyPage: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    userService
      .getMyInfo()
      .then(response => {
        setUserInfo(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError('사용자 정보를 불러오는 데 실패했습니다.');
        setLoading(false);
        console.error(err);
      });
  }, []); // 컴포넌트가 처음 마운트될 때만 실행

  if (loading) {
    return (
      <div className="card">
        <h1>로딩 중...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h1>오류</h1>
        <p className="error-msg">{error}</p>
      </div>
    );
  }

  return (
    <div className="card mypage-card">
      <h1>내 정보</h1>
      {userInfo && (
        <div className="info-grid">
          <div className="info-row">
            <span className="info-label">이메일</span>
            <span className="info-value">{userInfo.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">닉네임</span>
            <span className="info-value">{userInfo.nickname}</span>
          </div>
        </div>
      )}
      <div className="button-group">
        <Link to="/" className="btn btn-secondary">
          홈으로
        </Link>
      </div>
    </div>
  );
};

export default MyPage;

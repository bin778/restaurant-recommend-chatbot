import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import userService from '../services/userService';
import type { UserInfo } from '../types';

const MyPage: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  }, []);

  if (loading)
    return (
      <div className="card">
        <h1>로딩 중...</h1>
      </div>
    );
  if (error)
    return (
      <div className="card">
        <h1>오류</h1>
        <p className="error-msg">{error}</p>
      </div>
    );

  return (
    <div className="card mypage-card">
      <h1>마이페이지</h1>
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
        {/* 각 기능 페이지로 이동하는 링크 버튼 */}
        <Link to="/update-profile" className="btn btn-primary">
          정보 수정
        </Link>
        <Link to="/delete-account" className="btn btn-danger">
          계정 탈퇴
        </Link>
        <Link to="/" className="btn btn-secondary">
          홈으로
        </Link>
      </div>
    </div>
  );
};

export default MyPage;
